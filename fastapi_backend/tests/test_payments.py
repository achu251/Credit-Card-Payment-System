from datetime import datetime, timedelta

import pytest
from decimal import Decimal

import jwt
from fastapi.testclient import TestClient
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import sessionmaker

from app.auth import JWT_ALGORITHM, JWT_SECRET_KEY
from app.database import Base, get_db
from app.main import app
from app.models import Transaction
from app.card_model import Card


# ---------------------------------------------------------
# Test database
# ---------------------------------------------------------

TEST_DATABASE_URL = "sqlite:///./test_payments.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ---------------------------------------------------------
# Django users table inside the same SQLAlchemy metadata
# ---------------------------------------------------------

class TestUser(Base):
    __tablename__ = "users_user"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    username = Column(String(150), nullable=False)


# ---------------------------------------------------------
# FastAPI database override
# ---------------------------------------------------------

def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def create_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=1),
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def auth_headers(user_id):
    token = create_token(user_id)

    return {
        "Authorization": f"Bearer {token}",
    }


def create_card(
    db,
    user_id,
    card_id,
    expiry_month=12,
    expiry_year=2030,
):
    card = Card(
        id=card_id,
        user_id=user_id,
        masked_card="************1111",
        last_four="1111",
        card_type="VISA",
        expiry_month=expiry_month,
        expiry_year=expiry_year,
        created_at=datetime.utcnow(),
    )

    db.add(card)
    db.commit()

    return card


# ---------------------------------------------------------
# Database setup
# ---------------------------------------------------------

def setup_database():
    Base.metadata.create_all(bind=engine)


def clear_database():
    db = TestingSessionLocal()

    try:
        db.query(Transaction).delete()
        db.query(Card).delete()
        db.query(TestUser).delete()

        db.commit()
    finally:
        db.close()


def setup_test_data():
    db = TestingSessionLocal()

    try:
        db.add_all(
            [
                TestUser(
                    id=1,
                    username="testuser1",
                ),
                TestUser(
                    id=2,
                    username="testuser2",
                ),
            ]
        )

        db.commit()

        create_card(
            db,
            user_id=1,
            card_id=1,
            expiry_month=12,
            expiry_year=2030,
        )

        create_card(
            db,
            user_id=2,
            card_id=2,
            expiry_month=12,
            expiry_year=2030,
        )

        create_card(
            db,
            user_id=1,
            card_id=3,
            expiry_month=1,
            expiry_year=2020,
        )

    finally:
        db.close()


# ---------------------------------------------------------
# Pytest setup / cleanup
# ---------------------------------------------------------

def setup_module(module):
    setup_database()
    clear_database()
    setup_test_data()


def teardown_module(module):
    clear_database()

    Base.metadata.drop_all(bind=engine)


# ---------------------------------------------------------
# Authentication
# ---------------------------------------------------------

def test_payment_requires_authentication():
    response = client.post(
        "/api/payments/",
        json={
            "card_id": 1,
            "amount": "100.00",
            "idempotency_key": "AUTH-TEST-001",
        },
    )

    assert response.status_code == 401


# ---------------------------------------------------------
# Payment tests
# ---------------------------------------------------------

def test_successful_payment():
    response = client.post(
        "/api/payments/",
        headers=auth_headers(1),
        json={
            "card_id": 1,
            "amount": "500.00",
            "idempotency_key": "PAYMENT-TEST-001",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["card_id"] == 1
    assert Decimal(str(data["amount"])) == Decimal("500.00")
    assert data["status"] in ["SUCCESS", "FAILED"]
    assert data["reference"].startswith("PAY-")


def test_payment_amount_must_be_greater_than_zero():
    response = client.post(
        "/api/payments/",
        headers=auth_headers(1),
        json={
            "card_id": 1,
            "amount": "0.00",
            "idempotency_key": "PAYMENT-TEST-002",
        },
    )

    assert response.status_code == 422


def test_payment_amount_cannot_exceed_limit():
    response = client.post(
        "/api/payments/",
        headers=auth_headers(1),
        json={
            "card_id": 1,
            "amount": "100000.01",
            "idempotency_key": "PAYMENT-TEST-003",
        },
    )

    assert response.status_code == 422


def test_user_cannot_use_another_users_card():
    response = client.post(
        "/api/payments/",
        headers=auth_headers(1),
        json={
            "card_id": 2,
            "amount": "100.00",
            "idempotency_key": "PAYMENT-TEST-004",
        },
    )

    assert response.status_code == 404


def test_expired_card_is_rejected():
    response = client.post(
        "/api/payments/",
        headers=auth_headers(1),
        json={
            "card_id": 3,
            "amount": "100.00",
            "idempotency_key": "PAYMENT-TEST-005",
        },
    )

    assert response.status_code == 400


# ---------------------------------------------------------
# Idempotency
# ---------------------------------------------------------

def test_duplicate_idempotency_key_does_not_create_second_payment():
    idempotency_key = "PAYMENT-IDEMPOTENCY-001"

    first_response = client.post(
        "/api/payments/",
        headers=auth_headers(1),
        json={
            "card_id": 1,
            "amount": "750.00",
            "idempotency_key": idempotency_key,
        },
    )

    second_response = client.post(
        "/api/payments/",
        headers=auth_headers(1),
        json={
            "card_id": 1,
            "amount": "750.00",
            "idempotency_key": idempotency_key,
        },
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    first_data = first_response.json()
    second_data = second_response.json()

    assert first_data["id"] == second_data["id"]
    assert first_data["reference"] == second_data["reference"]

    db = TestingSessionLocal()

    try:
        count = db.query(Transaction).filter(
            Transaction.idempotency_key == idempotency_key
        ).count()

        assert count == 1

    finally:
        db.close()


# ---------------------------------------------------------
# Transaction retrieval
# ---------------------------------------------------------

def test_user_can_get_own_transaction():
    create_response = client.post(
        "/api/payments/",
        headers=auth_headers(1),
        json={
            "card_id": 1,
            "amount": "250.00",
            "idempotency_key": "PAYMENT-GET-001",
        },
    )

    assert create_response.status_code == 201

    transaction_id = create_response.json()["id"]

    response = client.get(
        f"/api/payments/{transaction_id}",
        headers=auth_headers(1),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == transaction_id
    assert data["card_id"] == 1


def test_user_cannot_get_another_users_transaction():
    create_response = client.post(
        "/api/payments/",
        headers=auth_headers(1),
        json={
            "card_id": 1,
            "amount": "300.00",
            "idempotency_key": "PAYMENT-GET-002",
        },
    )

    assert create_response.status_code == 201

    transaction_id = create_response.json()["id"]

    response = client.get(
        f"/api/payments/{transaction_id}",
        headers=auth_headers(2),
    )

    assert response.status_code == 404