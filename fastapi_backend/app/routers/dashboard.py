from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.auth import get_current_user_id
from app.database import get_db
from app.schemas.dashboard import DashboardSummaryResponse


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

CREDIT_LIMIT = Decimal("100000.00")


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def get_dashboard_summary(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    month_start = now.replace(
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    if month_start.month == 12:
        next_month = month_start.replace(
            year=month_start.year + 1,
            month=1,
        )
    else:
        next_month = month_start.replace(
            month=month_start.month + 1,
        )

    summary_query = text(
        """
        SELECT
            COUNT(*) AS total_transactions,
            COALESCE(SUM(amount), 0) AS total_amount_spent,
            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        AND created_at >= :month_start
                        AND created_at < :next_month
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS current_month_spending,
            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS successful_amount_spent
        FROM transactions
        WHERE user_id = :user_id
        """
    )

    summary = db.execute(
        summary_query,
        {
            "user_id": user_id,
            "month_start": month_start,
            "next_month": next_month,
        },
    ).mappings().one()

    successful_amount_spent = Decimal(
        str(summary["successful_amount_spent"])
    )

    available_credit_limit = max(
        CREDIT_LIMIT - successful_amount_spent,
        Decimal("0.00"),
    )

    recent_query = text(
        """
        SELECT
            t.amount,
            c.masked_card,
            t.created_at AS date,
            t.status
        FROM transactions AS t
        INNER JOIN cards_card AS c
            ON c.id = t.card_id
            AND c.user_id = t.user_id
        WHERE t.user_id = :user_id
        ORDER BY t.created_at DESC
        LIMIT 5
        """
    )

    recent_transactions = db.execute(
        recent_query,
        {"user_id": user_id},
    ).mappings().all()

    return {
        "total_transactions": int(
            summary["total_transactions"] or 0
        ),
        "total_amount_spent": Decimal(
            str(summary["total_amount_spent"] or 0)
        ),
        "current_month_spending": Decimal(
            str(summary["current_month_spending"] or 0)
        ),
        "available_credit_limit": available_credit_limit,
        "last_5_transactions": [
            {
                "amount": Decimal(str(row["amount"])),
                "masked_card": row["masked_card"],
                "date": row["date"],
                "status": row["status"],
            }
            for row in recent_transactions
        ],
    }
