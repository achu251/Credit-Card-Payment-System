from django.db import models
from django.conf import settings
from django.db import models


class Card(models.Model):
    CARD_TYPES = [
        ('VISA', 'Visa'),
        ('MASTERCARD', 'Mastercard'),
        ('AMEX', 'American Express'),
        ('RUPAY', 'RuPay'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cards'
    )

    masked_card = models.CharField(max_length=19)
    last_four = models.CharField(max_length=4)

    card_type = models.CharField(
        max_length=20,
        choices=CARD_TYPES
    )

    expiry_month = models.PositiveSmallIntegerField()
    expiry_year = models.PositiveSmallIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    is_blocked = models.BooleanField(default=False)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=100000.00)

    def __str__(self):
        return f"{self.card_type} ****{self.last_four}"
# Create your models here.
