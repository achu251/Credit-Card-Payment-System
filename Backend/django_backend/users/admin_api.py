from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_logs.service import create_admin_log


class AdminUsersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        User = get_user_model()

        users = User.objects.all().order_by("-date_joined")

        data = []

        for user in users:
            data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "is_active": user.is_active,
                "created_at": user.date_joined,
            })

        create_admin_log(
            request.user,
            "VIEW_USERS",
            "Admin viewed all users.",
        )

        return Response(data)