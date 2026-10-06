from datetime import date

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Card
from .serializers import CardSerializer


class CardListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cards = Card.objects.filter(user=request.user)

        serializer = CardSerializer(
            cards,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        card_number = request.data.get("card_number")
        cvv = request.data.get("cvv")
        card_type = request.data.get("card_type")
        expiry_month = request.data.get("expiry_month")
        expiry_year = request.data.get("expiry_year")

        if not card_number:
            return Response(
                {"detail": "Card number is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not card_number.isdigit() or len(card_number) != 16:
            return Response(
                {
                    "detail": (
                        "Card number must contain exactly 16 digits."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not cvv or not cvv.isdigit() or len(cvv) not in [3, 4]:
            return Response(
                {"detail": "CVV must contain 3 or 4 digits."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not card_type:
            return Response(
                {"detail": "Card type is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            expiry_month = int(expiry_month)
            expiry_year = int(expiry_year)
        except (TypeError, ValueError):
            return Response(
                {
                    "detail": (
                        "Valid expiry month and year are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if expiry_month < 1 or expiry_month > 12:
            return Response(
                {
                    "detail": (
                        "Expiry month must be between 1 and 12."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Support both 2-digit and 4-digit years.
        if expiry_year < 100:
            expiry_year += 2000

        today = date.today()

        if (
            expiry_year < today.year
            or (
                expiry_year == today.year
                and expiry_month < today.month
            )
        ):
            return Response(
                {"detail": "Card has expired."},
                status=status.HTTP_400_BAD_REQUEST
            )

        last_four = card_number[-4:]

        masked_card = "*" * 12 + last_four

        card = Card.objects.create(
            user=request.user,
            masked_card=masked_card,
            last_four=last_four,
            card_type=card_type,
            expiry_month=expiry_month,
            expiry_year=expiry_year,
        )

        serializer = CardSerializer(card)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class CardDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, card_id):
        try:
            card = Card.objects.get(
                id=card_id,
                user=request.user
            )
        except Card.DoesNotExist:
            return Response(
                {"detail": "Card not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        card.delete()

        return Response(
            {"detail": "Card deleted successfully."},
            status=status.HTTP_200_OK
        )