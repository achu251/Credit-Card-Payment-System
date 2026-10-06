from rest_framework import serializers
from .models import Card


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            'id',
            'masked_card',
            'last_four',
            'card_type',
            'expiry_month',
            'expiry_year',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'masked_card',
            'last_four',
            'created_at',
        ]

    def validate_expiry_month(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError(
                'Expiry month must be between 1 and 12.'
            )
        return value