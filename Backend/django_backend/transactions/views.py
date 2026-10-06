from django.db import models
from datetime import datetime, time

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
import csv

from .models import Transaction
from .serializers import TransactionSerializer
from decimal import Decimal
from django.db.models import Count, Sum
from django.http import JsonResponse

class DailyPaymentSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        selected_date = request.query_params.get("date")

        if not selected_date:
            return JsonResponse(
                {"detail": "date is required. Use YYYY-MM-DD."},
                status=400
            )

        try:
            from datetime import datetime
            selected_date = datetime.strptime(
                selected_date, "%Y-%m-%d"
            ).date()
        except ValueError:
            return JsonResponse(
                {"detail": "Invalid date. Use YYYY-MM-DD."},
                status=400
            )

        transactions = Transaction.objects.filter(
            created_at__date=selected_date
        )

        summary = transactions.aggregate(
            total_payments=Count("id"),
            successful_payments=Count(
                "id",
                filter=models.Q(status="SUCCESS")
            ),
            failed_payments=Count(
                "id",
                filter=models.Q(status="FAILED")
            ),
            pending_payments=Count(
                "id",
                filter=models.Q(status="PENDING")
            ),
            total_successful_amount=Sum(
                "amount",
                filter=models.Q(status="SUCCESS")
            ),
        )

        return JsonResponse({
            "date": selected_date,
            "total_payments": summary["total_payments"] or 0,
            "successful_payments": summary["successful_payments"] or 0,
            "failed_payments": summary["failed_payments"] or 0,
            "pending_payments": summary["pending_payments"] or 0,
            "total_successful_amount": str(
                summary["total_successful_amount"]
                or Decimal("0.00")
            ),
        })


class TransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(
            user_id=request.user.id
        )

        status_filter = request.query_params.get("status")
        min_amount = request.query_params.get("min_amount")
        max_amount = request.query_params.get("max_amount")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if status_filter:
            status_filter = status_filter.upper()

            if status_filter not in ["PENDING", "SUCCESS", "FAILED"]:
                return Response(
                    {"detail": "Invalid status. Use PENDING, SUCCESS, or FAILED."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            transactions = transactions.filter(status=status_filter)

        if min_amount:
            try:
                transactions = transactions.filter(amount__gte=min_amount)
            except (TypeError, ValueError):
                return Response(
                    {"detail": "Invalid minimum amount."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if max_amount:
            try:
                transactions = transactions.filter(amount__lte=max_amount)
            except (TypeError, ValueError):
                return Response(
                    {"detail": "Invalid maximum amount."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if start_date:
            try:
                parsed_start = datetime.strptime(start_date, "%Y-%m-%d").date()
                transactions = transactions.filter(
                    created_at__gte=datetime.combine(parsed_start, time.min)
                )
            except ValueError:
                return Response(
                    {"detail": "Invalid start_date. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if end_date:
            try:
                parsed_end = datetime.strptime(end_date, "%Y-%m-%d").date()
                transactions = transactions.filter(
                    created_at__lte=datetime.combine(parsed_end, time.max)
                )
            except ValueError:
                return Response(
                    {"detail": "Invalid end_date. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        transactions = transactions.order_by("-created_at")

        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class TransactionExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(
            user_id=request.user.id
        ).order_by("-created_at")

        response = HttpResponse(
            content_type="text/csv"
        )
        response["Content-Disposition"] = (
            'attachment; filename="transactions.csv"'
        )

        writer = csv.writer(response)
        writer.writerow([
            "ID",
            "Card ID",
            "Amount",
            "Status",
            "Reference",
            "Created At",
            "Updated At",
        ])

        for transaction in transactions:
            writer.writerow([
                transaction.id,
                transaction.card_id,
                transaction.amount,
                transaction.status,
                transaction.reference,
                transaction.created_at,
                transaction.updated_at,
            ])

        return response
