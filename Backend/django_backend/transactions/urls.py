from django.urls import path

from .views import (
    TransactionHistoryView,
    TransactionExportView,
    DailyPaymentSummaryView,
)

from .admin_api import AdminDashboardView
from .admin_transactions_api import AdminTransactionsView


urlpatterns = [
    path(
        "",
        TransactionHistoryView.as_view(),
        name="transaction-history",
    ),

    path(
        "export/",
        TransactionExportView.as_view(),
        name="transaction-export",
    ),

    path(
        "summary/",
        DailyPaymentSummaryView.as_view(),
        name="daily-payment-summary",
    ),

    path(
        "admin-dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),

    path(
        "admin/all/",
        AdminTransactionsView.as_view(),
        name="admin-transactions",
    ),
]