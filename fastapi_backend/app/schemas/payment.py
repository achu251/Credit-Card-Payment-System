from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


class PaymentRequest(BaseModel):
    card_id: int = Field(
        gt=0,
        description="ID of the saved card."
    )

    amount: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2,
        description="Payment amount.",
    )

    idempotency_key: str = Field(
        min_length=10,
        max_length=100,
        description="Unique key for this payment attempt.",
    )

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, value):
        maximum_amount = Decimal("100000.00")

        if value > maximum_amount:
            raise ValueError(
                "Payment amount cannot exceed ₹100000."
            )

        return value


class PaymentResponse(BaseModel):
    id: int
    card_id: int
    amount: Decimal
    status: str
    reference: str