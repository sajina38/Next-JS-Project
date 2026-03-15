from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import UserRegisterSerializer, UserResponseSerializer
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
                        "email": user.email,
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


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.all().values("id", "username", "email", "role", "is_active")
        return Response(list(users))
