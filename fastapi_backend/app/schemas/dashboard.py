from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class DashboardTransaction(BaseModel):
    amount: Decimal
    masked_card: str
    date: datetime
    status: str


class DashboardSummaryResponse(BaseModel):
    total_transactions: int
    total_amount_spent: Decimal
    current_month_spending: Decimal
    available_credit_limit: Decimal
    last_5_transactions: list[DashboardTransaction]
