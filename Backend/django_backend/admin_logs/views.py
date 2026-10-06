from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AdminLog


class AdminLogsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        logs = AdminLog.objects.select_related(
            "admin"
        ).all()

        data = []

        for log in logs:
            data.append({
                "id": log.id,
                "admin_username": log.admin.username,
                "action": log.action,
                "description": log.description,
                "created_at": log.created_at,
            })

        return Response(data)