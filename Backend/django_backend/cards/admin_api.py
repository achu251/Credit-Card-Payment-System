from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_logs.service import create_admin_log

from .models import Card


class AdminCardsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        cards = Card.objects.select_related(
            "user"
        ).all().order_by("-created_at")

        data = []

        for card in cards:
            data.append({
                "id": card.id,
                "username": card.user.username,
                "email": card.user.email,
                "masked_card": card.masked_card,
                "last_four": card.last_four,
                "card_type": card.card_type,
                "expiry_month": card.expiry_month,
                "expiry_year": card.expiry_year,
                "created_at": card.created_at,
            })

        create_admin_log(
            request.user,
            "VIEW_CARDS",
            "Admin viewed all cards.",
        )

        return Response(data)