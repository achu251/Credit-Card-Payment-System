from django.contrib import admin
from django.urls import path

from .models import Transaction
from .admin_views import daily_payment_summary


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user_id",
        "card_id",
        "amount",
        "status",
        "reference",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "reference",
        "user_id",
        "card_id",
    )

    readonly_fields = (
        "id",
        "user_id",
        "card_id",
        "amount",
        "status",
        "reference",
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)


original_get_urls = admin.site.get_urls


def custom_get_urls():
    custom_urls = [
        path(
            "daily-payment-summary/",
            admin.site.admin_view(daily_payment_summary),
            name="daily-payment-summary",
        ),
    ]

    return custom_urls + original_get_urls()


admin.site.get_urls = custom_get_urls