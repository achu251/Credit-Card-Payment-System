import random
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user_id
from app.card_model import Card
from app.database import get_db
from app.models import Transaction
from app.schemas.payment import PaymentRequest, PaymentResponse


router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


@router.post(
    "/",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED
)
def make_payment(
    payment: PaymentRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # Check whether this payment request was already processed.
    existing_transaction = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.idempotency_key == payment.idempotency_key,
    ).first()

    if existing_transaction:
        return existing_transaction

    # Verify that the card belongs to the logged-in user.
    card = db.query(Card).filter(
        Card.id == payment.card_id,
        Card.user_id == user_id,
    ).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found or does not belong to the current user.",
        )

    if card.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Card is blocked.",
        )

    # Check card expiry before processing payment.
    today = date.today()

    if (
        card.expiry_year < today.year
        or (
            card.expiry_year == today.year
            and card.expiry_month < today.month
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Card has expired.",
        )

    # Enforce Credit Limit
    from sqlalchemy import text
    from decimal import Decimal
    spent_query = text("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE card_id = :card_id AND status = 'SUCCESS'")
    spent_amount = Decimal(str(db.execute(spent_query, {"card_id": card.id}).scalar() or 0))

    if spent_amount + payment.amount > card.credit_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credit limit exceeded.",
        )

    # Email Triggers
    if payment.amount > Decimal("5000"):
        print(f"MOCK EMAIL: Alert! A transaction of INR {payment.amount} was initiated on card ****{card.last_four}.")

    remaining_limit = card.credit_limit - (spent_amount + payment.amount)
    if remaining_limit < (Decimal("0.10") * card.credit_limit):
        print(f"MOCK EMAIL: Alert! Your available credit limit for card ****{card.last_four} has fallen below 10%.")


    # Generate a unique payment reference.
    reference = f"PAY-{uuid.uuid4().hex[:12].upper()}"

    # Create the transaction in PENDING state.
    transaction = Transaction(
        user_id=user_id,
        card_id=payment.card_id,
        amount=payment.amount,
        status="PENDING",
        reference=reference,
        idempotency_key=payment.idempotency_key,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Simulate payment processing.
    transaction.status = random.choice(
        ["SUCCESS", "FAILED"]
    )

    db.commit()
    db.refresh(transaction)

    return transaction


@router.get(
    "/{transaction_id}",
    response_model=PaymentResponse
)
def get_payment(
    transaction_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id,
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    return transaction