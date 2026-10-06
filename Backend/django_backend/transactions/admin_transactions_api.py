from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_logs.service import create_admin_log

from .models import Transaction


class AdminTransactionsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        transactions = Transaction.objects.all().order_by("-created_at")

        data = []

        for transaction in transactions:
            data.append({
                "id": transaction.id,
                "user_id": transaction.user_id,
                "card_id": transaction.card_id,
                "amount": str(transaction.amount),
                "status": transaction.status,
                "reference": transaction.reference,
                "created_at": transaction.created_at,
                "updated_at": transaction.updated_at,
            })

        create_admin_log(
            request.user,
            "VIEW_TRANSACTIONS",
            "Admin viewed all transactions.",
        )

        return Response(data)