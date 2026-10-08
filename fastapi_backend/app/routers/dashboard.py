from datetime import datetime
from decimal import Decimal
import io
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

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

    limit_query = text("SELECT COALESCE(SUM(credit_limit), 0) FROM cards_card WHERE user_id = :user_id")
    user_total_limit = Decimal(str(db.execute(limit_query, {"user_id": user_id}).scalar() or "0.00"))

    available_credit_limit = max(
        user_total_limit - successful_amount_spent,
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

@router.get("/statement")
def get_dashboard_statement(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    summary_query = text(
        """
        SELECT
            COUNT(*) AS total_transactions,
            COALESCE(SUM(amount), 0) AS total_amount_spent
        FROM transactions
        WHERE user_id = :user_id
        """
    )
    summary = db.execute(summary_query, {"user_id": user_id}).mappings().one()

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
        """
    )
    transactions = db.execute(recent_query, {"user_id": user_id}).mappings().all()

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, "Monthly Credit Card Statement")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 90, f"Total Transactions: {summary['total_transactions']}")
    c.drawString(50, height - 110, f"Total Amount Spent: INR {summary['total_amount_spent']}")

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 150, "Transaction History:")

    c.setFont("Helvetica", 10)
    y = height - 180
    for tx in transactions:
        if y < 50:
            c.showPage()
            c.setFont("Helvetica", 10)
            y = height - 50
        date_str = tx["date"].strftime("%Y-%m-%d %H:%M") if hasattr(tx["date"], "strftime") else str(tx["date"])
        line = f"{date_str}   |   {tx['masked_card']}   |   INR {tx['amount']}   |   {tx['status']}"
        c.drawString(50, y, line)
        y -= 20

    c.save()
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=statement.pdf"}
    )

