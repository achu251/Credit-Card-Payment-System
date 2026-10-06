from django.contrib import admin

from .models import Card


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "masked_card",
        "last_four",
        "card_type",
        "expiry_month",
        "expiry_year",
        "created_at",
    )

    list_filter = (
        "card_type",
        "created_at",
    )

    search_fields = (
        "masked_card",
        "last_four",
        "user__username",
        "user__email",
    )

    readonly_fields = (
        "id",
        "user",
        "masked_card",
        "last_four",
        "card_type",
        "expiry_month",
        "expiry_year",
        "created_at",
    )
