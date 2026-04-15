from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from .serializers import (
    AdminCreateUserSerializer,
    AdminUpdateUserSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserProfileSerializer,
    UserRegisterSerializer,
    UserResponseSerializer,
)
from .permissions import IsAdmin, IsAdminOrManager, IsManager

User = get_user_model()
logger = logging.getLogger(__name__)
password_reset_token_generator = PasswordResetTokenGenerator()


def _password_reset_from_email() -> str:
    host = (getattr(settings, "EMAIL_HOST_USER", None) or "").strip()
    if host:
        return f"Urban Boutique Hotel <{host}>"
    return (getattr(settings, "DEFAULT_FROM_EMAIL", None) or "").strip() or "noreply@localhost"


def _send_password_reset_email(user, reset_url: str) -> bool:
    """Send reset email. Returns False if skipped or delivery failed (caller may warn in DEBUG)."""
    to = (user.email or "").strip()
    if not to:
        return False
    subject = "Reset your Urban Boutique Hotel password"
    body = (
        f"Hi {user.get_username()},\n\n"
        f"Use the link below to choose a new password. This link will stop working after your password is changed.\n\n"
        f"{reset_url}\n\n"
        "If you did not request a password reset, you can ignore this email.\n"
    )
    from_email = _password_reset_from_email()
    try:
        send_mail(
            subject,
            body,
            from_email,
            [to],
            fail_silently=False,
        )
        logger.info("Password reset email sent to %s for user id=%s", to, user.pk)
        return True
    except Exception:
        logger.exception("Failed to send password reset email to %s (user id=%s)", to, user.pk)
        return False


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserResponseSerializer(user).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

        serializer = TokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.user
            tokens = serializer.validated_data
            return Response(
                {
                    "access": str(tokens["access"]),
                    "refresh": str(tokens["refresh"]),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "phone_number": user.phone_number,
                        "role": user.role,
                        "loyalty_points": user.loyalty_points,
                    },
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class PasswordResetRequestView(APIView):
    """Request a password-reset link by email (does not reveal whether the email exists)."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip()
        user = User.objects.filter(email__iexact=email).first()

        ok_message = {
            "detail": "If an account exists with that email, you will receive password reset instructions shortly.",
        }

        if not user or not user.is_active or not user.has_usable_password():
            return Response(ok_message, status=status.HTTP_200_OK)

        to = (user.email or "").strip()
        if not to:
            return Response(ok_message, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = password_reset_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        sent = _send_password_reset_email(user, reset_url)
        if not sent and settings.DEBUG:
            return Response(
                {
                    **ok_message,
                    "warning": (
                        "The reset email could not be sent (check the Django server terminal for errors). "
                        "If EMAIL_HOST_USER is not set, messages are printed to the console — copy the reset link from there. "
                        "For real delivery, set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in backend/.env. "
                        "Use the exact email stored on your account (test addresses like @test.com cannot receive mail)."
                    ),
                },
                status=status.HTTP_200_OK,
            )
        return Response(ok_message, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Set a new password using the uid + token from the reset email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid_b64 = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            uid = force_str(urlsafe_base64_decode(uid_b64))
            pk = int(uid)
        except (TypeError, ValueError, OverflowError):
            return Response(
                {"detail": "Invalid or expired reset link. Please request a new password reset."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid or expired reset link. Please request a new password reset."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password_reset_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired reset link. Please request a new password reset."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as e:
            return Response({"new_password": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response(
            {"detail": "Your password has been updated. You can sign in now."},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ManagerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        from bookings.models import Booking
        from rooms.models import Room

        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_bookings = Booking.objects.count()
        total_rooms = Room.objects.count()

        recent_qs = (
            Booking.objects.select_related("room", "user")
            .order_by("-created_at")[:8]
        )
        recent_bookings = [
            {
                "id": b.id,
                "guest_display": (b.guest_name or b.user.get_full_name() or b.user.username).strip()
                or b.user.username,
                "room_number": b.room.room_number,
                "check_in": str(b.check_in),
                "status": b.status,
                "created_at": b.created_at.isoformat(),
            }
            for b in recent_qs
        ]

        rooms_qs = Room.objects.all().order_by("room_number")[:12]
        rooms_status = [
            {
                "id": r.id,
                "room_number": r.room_number,
                "room_type": r.room_type,
                "name": r.name,
                "price": str(r.price),
                "status": r.room_status,
            }
            for r in rooms_qs
        ]

        return Response(
            {
                "metrics": {
                    "total_customers": total_customers,
                    "total_bookings": total_bookings,
                    "total_rooms": total_rooms,
                },
                "recent_bookings": recent_bookings,
                "rooms_status": rooms_status,
            }
        )


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from bookings.models import Booking
        from rooms.models import Room

        total_users = User.objects.count()
        total_managers = User.objects.filter(role=User.Role.MANAGER).count()
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_bookings = Booking.objects.count()
        total_rooms = Room.objects.count()

        recent_qs = (
            Booking.objects.select_related("room", "user")
            .order_by("-created_at")[:8]
        )
        recent_bookings = [
            {
                "id": b.id,
                "guest_display": (b.guest_name or b.user.get_full_name() or b.user.username).strip()
                or b.user.username,
                "room_number": b.room.room_number,
                "check_in": str(b.check_in),
                "status": b.status,
                "created_at": b.created_at.isoformat(),
            }
            for b in recent_qs
        ]

        rooms_qs = Room.objects.all().order_by("room_number")[:12]
        rooms_status = [
            {
                "id": r.id,
                "room_number": r.room_number,
                "room_type": r.room_type,
                "name": r.name,
                "price": str(r.price),
                "status": r.room_status,
            }
            for r in rooms_qs
        ]

        return Response(
            {
                "metrics": {
                    "total_users": total_users,
                    "total_managers": total_managers,
                    "total_customers": total_customers,
                    "total_bookings": total_bookings,
                    "total_rooms": total_rooms,
                },
                "recent_bookings": recent_bookings,
                "rooms_status": rooms_status,
            }
        )


class AdminReportsView(APIView):
    """Simple analytics: current-month bookings/revenue, last-12-months chart."""

    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def get(self, request):
        import calendar
        from datetime import datetime

        from django.db.models import Count, Sum
        from django.db.models.functions import TruncMonth
        from django.utils import timezone

        from bookings.models import Booking

        now = timezone.localtime()
        tz = timezone.get_current_timezone()
        month_start = timezone.make_aware(
            datetime(now.year, now.month, 1, 0, 0, 0),
            tz,
        )
        if now.month == 12:
            next_month_start_naive = datetime(now.year + 1, 1, 1, 0, 0, 0)
        else:
            next_month_start_naive = datetime(now.year, now.month + 1, 1, 0, 0, 0)
        month_end_exclusive = timezone.make_aware(next_month_start_naive, tz)

        month_qs = Booking.objects.filter(
            created_at__gte=month_start,
            created_at__lt=month_end_exclusive,
        )
        total_bookings = month_qs.count()
        rev = month_qs.filter(
            payment_status=Booking.PaymentStatus.PAID,
        ).aggregate(s=Sum("total_amount"))["s"]
        total_revenue = str(rev) if rev is not None else "0.00"
        summary_month_label = f"{calendar.month_abbr[now.month]} {now.year}"
        y, m = now.year, now.month
        m -= 11
        while m < 1:
            m += 12
            y -= 1

        start_naive = datetime(y, m, 1, 0, 0, 0)
        if timezone.is_naive(start_naive):
            start_dt = timezone.make_aware(start_naive, timezone.get_current_timezone())
        else:
            start_dt = start_naive

        rows = (
            Booking.objects.filter(created_at__gte=start_dt)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        row_map = {}
        for r in rows:
            mo = r["month"]
            if mo is not None:
                row_map[f"{mo.year}-{mo.month:02d}"] = r["count"]

        monthly_bookings = []
        cy, cm = y, m
        for _ in range(12):
            key = f"{cy}-{cm:02d}"
            monthly_bookings.append(
                {
                    "key": key,
                    "label": f"{calendar.month_abbr[cm]} {cy}",
                    "count": row_map.get(key, 0),
                }
            )
            cm += 1
            if cm > 12:
                cm = 1
                cy += 1

        return Response(
            {
                "total_bookings": total_bookings,
                "total_revenue": total_revenue,
                "summary_month_label": summary_month_label,
                "monthly_bookings": monthly_bookings,
            }
        )


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.all().values(
            "id",
            "username",
            "email",
            "role",
            "is_active",
            "first_name",
            "last_name",
            "loyalty_points",
        )
        return Response(list(users))

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "loyalty_points": user.loyalty_points,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            target = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUpdateUserSerializer(target, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data.get("role", target.role)
        new_active = serializer.validated_data.get("is_active", target.is_active)

        if pk == request.user.id and new_active is False:
            return Response(
                {"detail": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if target.role == User.Role.ADMIN and target.is_active:
            losing_admin = new_role != User.Role.ADMIN or new_active is False
            if losing_admin:
                other_admins = (
                    User.objects.filter(role=User.Role.ADMIN, is_active=True)
                    .exclude(pk=target.pk)
                    .count()
                )
                if other_admins == 0:
                    return Response(
                        {"detail": "Cannot change role or deactivate the last admin account."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "loyalty_points": user.loyalty_points,
            },
        )

    def delete(self, request, pk):
        if request.user.id == pk:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if target.role == User.Role.ADMIN and User.objects.filter(role=User.Role.ADMIN).count() <= 1:
            return Response(
                {"detail": "Cannot delete the last admin account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        target.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
