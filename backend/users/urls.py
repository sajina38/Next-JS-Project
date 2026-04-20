from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/password-reset/", views.PasswordResetRequestView.as_view(), name="password-reset"),
    path(
        "auth/password-reset/confirm/",
        views.PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path("auth/change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("auth/profile/", views.ProfileView.as_view(), name="profile"),
    path("manager/dashboard/", views.ManagerDashboardView.as_view(), name="manager-dashboard"),
    path("admin/dashboard/", views.AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/reports/", views.AdminReportsView.as_view(), name="admin-reports"),
    path("admin/users/", views.AdminUsersView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/", views.AdminUserDetailView.as_view(), name="admin-user-detail"),
]
