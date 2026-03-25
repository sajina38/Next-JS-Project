from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegisterSerializer,
    UserResponseSerializer,
    UserProfileSerializer,
    AdminCreateUserSerializer,
)
from .permissions import IsManager, IsAdmin

User = get_user_model()


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
                    },
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


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

        bookings = Booking.objects.select_related("room").all().order_by("-created_at")
        data = [
            {
                "id": b.id,
                "room": b.room.room_number,
                "room_type": b.room.room_type,
                "guest_name": b.guest_name,
                "check_in": str(b.check_in),
                "check_out": str(b.check_out),
                "created_at": b.created_at.isoformat(),
            }
            for b in bookings
        ]
        return Response(data)


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
                "status": "available" if r.is_available else "occupied",
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
            },
            status=status.HTTP_201_CREATED,
        )


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

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
