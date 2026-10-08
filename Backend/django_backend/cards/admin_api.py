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
                "is_blocked": card.is_blocked,
                "credit_limit": str(card.credit_limit),
            })

        create_admin_log(
            request.user,
            "VIEW_CARDS",
            "Admin viewed all cards.",
        )

        return Response(data)

class AdminCardUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, card_id):
        try:
            card = Card.objects.get(id=card_id)
        except Card.DoesNotExist:
            return Response({"detail": "Card not found."}, status=404)

        is_blocked = request.data.get("is_blocked")
        credit_limit = request.data.get("credit_limit")
        
        updated = False

        if is_blocked is not None and is_blocked != card.is_blocked:
            card.is_blocked = is_blocked
            updated = True
            
            # Send Mock Email Notification
            if is_blocked:
                print(f"MOCK EMAIL: Alert! Card ****{card.last_four} for {card.user.email} has been BLOCKED.")
                create_admin_log(request.user, "BLOCK_CARD", f"Blocked card {card.id}")
            else:
                create_admin_log(request.user, "UNBLOCK_CARD", f"Unblocked card {card.id}")
                
        if credit_limit is not None:
            try:
                from decimal import Decimal
                card.credit_limit = Decimal(str(credit_limit))
                updated = True
                create_admin_log(request.user, "UPDATE_LIMIT", f"Updated limit for card {card.id} to {card.credit_limit}")
            except Exception:
                return Response({"detail": "Invalid credit limit."}, status=400)

        if updated:
            card.save()

        return Response({"detail": "Card updated successfully."})