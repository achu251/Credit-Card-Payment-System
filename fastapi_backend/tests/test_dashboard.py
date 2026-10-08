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


TEST_DATABASE_URL = "sqlite:///./test_dashboard.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class TestUser(Base):
    __tablename__ = "users_user"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    username = Column(String(150), nullable=False)


def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


client = TestClient(app)


@pytest.fixture(autouse=True)
def use_dashboard_test_database():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)


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
    return {
        "Authorization": f"Bearer {create_token(user_id)}",
    }


def setup_module(module):
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    try:
        db.query(Transaction).delete()
        db.query(Card).delete()
        db.query(TestUser).delete()

        db.add_all(
            [
                TestUser(id=1, username="dashboard-user"),
                TestUser(id=2, username="other-user"),
            ]
        )
        db.commit()

        card = Card(
            id=1,
            user_id=1,
            masked_card="************1111",
            last_four="1111",
            card_type="VISA",
            expiry_month=12,
            expiry_year=2030,
            created_at=datetime.utcnow(),
        )
        other_card = Card(
            id=2,
            user_id=2,
            masked_card="************2222",
            last_four="2222",
            card_type="VISA",
            expiry_month=12,
            expiry_year=2030,
            created_at=datetime.utcnow(),
        )

        db.add_all([card, other_card])
        db.commit()

        now = datetime.utcnow()

        transactions = [
            Transaction(
                user_id=1,
                card_id=1,
                amount=Decimal("100.00"),
                status="SUCCESS",
                reference="DASH-PAY-001",
                idempotency_key="DASH-IDEMP-001",
                created_at=now - timedelta(minutes=1),
                updated_at=now - timedelta(minutes=1),
            ),
            Transaction(
                user_id=1,
                card_id=1,
                amount=Decimal("200.00"),
                status="FAILED",
                reference="DASH-PAY-002",
                idempotency_key="DASH-IDEMP-002",
                created_at=now - timedelta(minutes=2),
                updated_at=now - timedelta(minutes=2),
            ),
            Transaction(
                user_id=1,
                card_id=1,
                amount=Decimal("300.00"),
                status="SUCCESS",
                reference="DASH-PAY-003",
                idempotency_key="DASH-IDEMP-003",
                created_at=now - timedelta(minutes=3),
                updated_at=now - timedelta(minutes=3),
            ),
            Transaction(
                user_id=1,
                card_id=1,
                amount=Decimal("400.00"),
                status="PENDING",
                reference="DASH-PAY-004",
                idempotency_key="DASH-IDEMP-004",
                created_at=now - timedelta(minutes=4),
                updated_at=now - timedelta(minutes=4),
            ),
            Transaction(
                user_id=1,
                card_id=1,
                amount=Decimal("500.00"),
                status="SUCCESS",
                reference="DASH-PAY-005",
                idempotency_key="DASH-IDEMP-005",
                created_at=now - timedelta(minutes=5),
                updated_at=now - timedelta(minutes=5),
            ),
            Transaction(
                user_id=1,
                card_id=1,
                amount=Decimal("600.00"),
                status="SUCCESS",
                reference="DASH-PAY-006",
                idempotency_key="DASH-IDEMP-006",
                created_at=now - timedelta(minutes=6),
                updated_at=now - timedelta(minutes=6),
            ),
            Transaction(
                user_id=2,
                card_id=2,
                amount=Decimal("999.00"),
                status="SUCCESS",
                reference="DASH-PAY-007",
                idempotency_key="DASH-IDEMP-007",
                created_at=now,
                updated_at=now,
            ),
        ]

        db.add_all(transactions)
        db.commit()

    finally:
        db.close()


def teardown_module(module):
    db = TestingSessionLocal()

    try:
        db.query(Transaction).delete()
        db.query(Card).delete()
        db.query(TestUser).delete()
        db.commit()
    finally:
        db.close()

    Base.metadata.drop_all(bind=engine)


def test_dashboard_requires_authentication():
    response = client.get("/dashboard/summary")

    assert response.status_code == 401


def test_dashboard_summary_returns_only_current_users_data():
    response = client.get(
        "/dashboard/summary",
        headers=auth_headers(1),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_transactions"] == 6
    assert Decimal(str(data["total_amount_spent"])) == Decimal("2100.00")
    assert Decimal(
        str(data["current_month_spending"])
    ) == Decimal("1500.00")
    assert Decimal(
        str(data["available_credit_limit"])
    ) == Decimal("98500.00")

    recent = data["last_5_transactions"]

    assert len(recent) == 5
    assert Decimal(str(recent[0]["amount"])) == Decimal("100.00")
    assert recent[0]["masked_card"] == "************1111"
    assert recent[0]["status"] == "SUCCESS"


def test_dashboard_returns_empty_summary_for_user_without_transactions():
    db = TestingSessionLocal()

    try:
        db.add(
            TestUser(
                id=3,
                username="empty-dashboard-user",
            )
        )
        db.commit()
    finally:
        db.close()

    response = client.get(
        "/dashboard/summary",
        headers=auth_headers(3),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_transactions"] == 0
    assert Decimal(
        str(data["total_amount_spent"])
    ) == Decimal("0.00")
    assert Decimal(
        str(data["current_month_spending"])
    ) == Decimal("0.00")
    assert Decimal(
        str(data["available_credit_limit"])
    ) == Decimal("100000.00")
    assert data["last_5_transactions"] == []
