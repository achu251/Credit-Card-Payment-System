from django.conf import settings
from django.db import models


class Transaction(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    ]

    id = models.BigAutoField(primary_key=True)
    user_id = models.IntegerField()
    card_id = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    reference = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = "transactions"
        managed = False
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} - {self.status}"
# Create your models here.
