from datetime import date

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Transaction
from cards.models import Card


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = date.today()

        transactions = Transaction.objects.filter(
            created_at__date=today
        )

        total_payments = transactions.count()

        successful_payments = transactions.filter(
            status="SUCCESS"
        ).count()

        failed_payments = transactions.filter(
            status="FAILED"
        ).count()

        pending_payments = transactions.filter(
            status="PENDING"
        ).count()

        successful_amount = transactions.filter(
            status="SUCCESS"
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        User = get_user_model()

        total_users = User.objects.count()
        total_cards = Card.objects.count()
        total_transactions = Transaction.objects.count()

        return Response({
            "date": str(today),
            "total_users": total_users,
            "total_cards": total_cards,
            "total_transactions": total_transactions,
            "today": {
                "total_payments": total_payments,
                "successful_payments": successful_payments,
                "failed_payments": failed_payments,
                "pending_payments": pending_payments,
                "total_successful_amount": str(successful_amount),
            },
        })