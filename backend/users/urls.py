from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("auth/profile/", views.ProfileView.as_view(), name="profile"),
    path("manager/dashboard/", views.ManagerDashboardView.as_view(), name="manager-dashboard"),
    path("admin/users/", views.AdminUsersView.as_view(), name="admin-users"),
]
