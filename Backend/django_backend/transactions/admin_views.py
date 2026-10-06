from datetime import date
from decimal import Decimal

from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Sum, Q
from django.shortcuts import render

from .models import Transaction


@staff_member_required
def daily_payment_summary(request):
    selected_date = request.GET.get("date")

    if selected_date:
        try:
            selected_date = date.fromisoformat(selected_date)
        except ValueError:
            selected_date = date.today()
    else:
        selected_date = date.today()

    transactions = Transaction.objects.filter(
        created_at__date=selected_date
    )

    summary = transactions.aggregate(
        total_payments=Count("id"),
        successful_payments=Count(
            "id", filter=Q(status="SUCCESS")
        ),
        failed_payments=Count(
            "id", filter=Q(status="FAILED")
        ),
        pending_payments=Count(
            "id", filter=Q(status="PENDING")
        ),
        total_successful_amount=Sum(
            "amount", filter=Q(status="SUCCESS")
        ),
    )

    context = {
        "title": "Daily Payment Summary",
        "selected_date": selected_date,
        "total_payments": summary["total_payments"] or 0,
        "successful_payments": summary["successful_payments"] or 0,
        "failed_payments": summary["failed_payments"] or 0,
        "pending_payments": summary["pending_payments"] or 0,
        "total_successful_amount": (
            summary["total_successful_amount"]
            or Decimal("0.00")
        ),
    }

    return render(
        request,
        "admin/daily_payment_summary.html",
        context,
    )
