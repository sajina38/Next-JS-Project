from rest_framework.permissions import BasePermission


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "manager"


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class IsAdminOrManager(BasePermission):
    """Same operational access as admin except user CRUD (handled by view)."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            "admin",
            "manager",
        )
