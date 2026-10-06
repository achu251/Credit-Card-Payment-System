from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .admin_api import AdminUsersView

from .views import RegisterView, MeView, LogoutView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'), 
]
