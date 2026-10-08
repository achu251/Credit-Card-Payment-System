from django.urls import path

from .views import CardListCreateView, CardDeleteView
from .admin_api import AdminCardsView, AdminCardUpdateView


urlpatterns = [
    path("", CardListCreateView.as_view(), name="card-list-create"),
    path("<int:card_id>/", CardDeleteView.as_view(), name="card-delete"),

    path(
        "admin/all/",
        AdminCardsView.as_view(),
        name="admin-cards",
    ),
    path(
        "admin/<int:card_id>/update/",
        AdminCardUpdateView.as_view(),
        name="admin-card-update",
    ),
]