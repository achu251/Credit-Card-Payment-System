from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status


User = get_user_model()


class AuthenticationTests(APITestCase):

    def setUp(self):
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.me_url = "/api/auth/me/"
        self.logout_url = "/api/auth/logout/"

        self.username = "testuser"
        self.email = "testuser@example.com"
        self.password = "TestPassword123"

    def test_user_registration(self):
        response = self.client.post(
            self.register_url,
            {
                "username": self.username,
                "email": self.email,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            User.objects.filter(
                username=self.username
            ).exists()
        )

    def test_user_login_returns_jwt_tokens(self):
        User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password,
        )

        response = self.client.post(
            self.login_url,
            {
                "username": self.username,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_login_is_rejected(self):
        User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password,
        )

        response = self.client.post(
            self.login_url,
            {
                "username": self.username,
                "password": "WrongPassword123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_me_requires_authentication(self):
        response = self.client.get(self.me_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_me_returns_current_user(self):
        user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password,
        )

        self.client.force_authenticate(user=user)

        response = self.client.get(self.me_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["username"],
            self.username,
        )

        self.assertEqual(
            response.data["email"],
            self.email,
        )

    def test_logout_requires_refresh_token(self):
        user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password,
        )

        self.client.force_authenticate(user=user)

        response = self.client.post(
            self.logout_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )