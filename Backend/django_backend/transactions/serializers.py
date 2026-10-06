from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "card_id",
            "amount",
            "status",
            "reference",
            "created_at",
            "updated_at",
        ]
