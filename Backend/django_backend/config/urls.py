from django.contrib import admin
from django.urls import include, path

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)


urlpatterns = [
    # Django Admin
    path(
        "admin/",
        admin.site.urls,
    ),

    # ---------------------------------------------------------------
    # API Documentation
    # ---------------------------------------------------------------

    # OpenAPI schema
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),

    # Swagger UI
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(
            url_name="schema"
        ),
        name="swagger-ui",
    ),

    # ---------------------------------------------------------------
    # Application APIs
    # ---------------------------------------------------------------

    # Authentication
    path(
        "api/auth/",
        include("users.urls"),
    ),

    # Card management
    path(
        "api/cards/",
        include("cards.urls"),
    ),

    # Transactions
    path(
        "api/transactions/",
        include("transactions.urls"),
    ),

    # Admin logs
    path(
        "api/admin-logs/",
        include("admin_logs.urls"),
    ),
]