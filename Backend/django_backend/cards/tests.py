from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Card


User = get_user_model()


class CardTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="carduser",
            email="carduser@example.com",
            password="TestPassword123",
        )

        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="TestPassword123",
        )

        self.cards_url = "/api/cards/"

        self.card_data = {
            "card_number": "4111111111111111",
            "cvv": "123",
            "card_type": "VISA",
            "expiry_month": 12,
            "expiry_year": 2030,
        }

        self.client.force_authenticate(user=self.user)

    def test_add_card_successfully(self):
        response = self.client.post(
            self.cards_url,
            self.card_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["last_four"],
            "1111",
        )

        self.assertEqual(
            response.data["masked_card"],
            "************1111",
        )

        self.assertEqual(
            Card.objects.filter(user=self.user).count(),
            1,
        )

    def test_full_card_number_is_not_stored(self):
        self.client.post(
            self.cards_url,
            self.card_data,
            format="json",
        )

        card = Card.objects.get(user=self.user)

        self.assertNotEqual(
            card.masked_card,
            self.card_data["card_number"],
        )

        self.assertNotIn(
            self.card_data["card_number"],
            card.masked_card,
        )

        self.assertEqual(
            card.last_four,
            "1111",
        )

    def test_cvv_is_not_stored(self):
        response = self.client.post(
            self.cards_url,
            self.card_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        card = Card.objects.get(user=self.user)

        self.assertFalse(
            hasattr(card, "cvv")
        )

        self.assertNotIn(
            "cvv",
            response.data,
        )

    def test_invalid_card_number_is_rejected(self):
        invalid_data = self.card_data.copy()

        invalid_data["card_number"] = "1234"

        response = self.client.post(
            self.cards_url,
            invalid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_cvv_is_rejected(self):
        invalid_data = self.card_data.copy()

        invalid_data["cvv"] = "12"

        response = self.client.post(
            self.cards_url,
            invalid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_expired_card_is_rejected(self):
        invalid_data = self.card_data.copy()

        invalid_data["expiry_month"] = 1
        invalid_data["expiry_year"] = 2020

        response = self.client.post(
            self.cards_url,
            invalid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_user_can_view_only_own_cards(self):
        own_card = Card.objects.create(
            user=self.user,
            masked_card="************1111",
            last_four="1111",
            card_type="VISA",
            expiry_month=12,
            expiry_year=2030,
        )

        Card.objects.create(
            user=self.other_user,
            masked_card="************2222",
            last_four="2222",
            card_type="MASTERCARD",
            expiry_month=12,
            expiry_year=2030,
        )

        response = self.client.get(self.cards_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            own_card.id,
        )

    def test_user_can_delete_own_card(self):
        card = Card.objects.create(
            user=self.user,
            masked_card="************1111",
            last_four="1111",
            card_type="VISA",
            expiry_month=12,
            expiry_year=2030,
        )

        response = self.client.delete(
            f"{self.cards_url}{card.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            Card.objects.filter(id=card.id).exists()
        )

    def test_user_cannot_delete_another_users_card(self):
        card = Card.objects.create(
            user=self.other_user,
            masked_card="************2222",
            last_four="2222",
            card_type="MASTERCARD",
            expiry_month=12,
            expiry_year=2030,
        )

        response = self.client.delete(
            f"{self.cards_url}{card.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Card.objects.filter(id=card.id).exists()
        )