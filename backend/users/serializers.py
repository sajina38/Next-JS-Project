from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "username", "password", "first_name", "last_name")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "role")


class AdminCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name", "role")

    def create(self, validated_data):
        role = validated_data.pop("role", User.Role.CUSTOMER)
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        user.role = role
        user.save(update_fields=["role"])
        return user


class AdminUpdateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        min_length=6,
    )

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "role", "is_active", "password")

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserProfileSerializer(serializers.ModelSerializer):
    loyalty_stays_count = serializers.SerializerMethodField()
    loyalty_stays_until_next_card = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "date_of_birth",
            "country",
            "gender",
            "role",
            "loyalty_cards",
            "loyalty_stays_count",
            "loyalty_stays_until_next_card",
            "date_joined",
        )
        read_only_fields = (
            "id",
            "username",
            "role",
            "loyalty_cards",
            "loyalty_stays_count",
            "loyalty_stays_until_next_card",
            "date_joined",
        )

    def get_loyalty_stays_count(self, obj):
        from bookings.models import Booking

        if getattr(obj, "role", None) != User.Role.CUSTOMER:
            return 0
        return Booking.objects.filter(
            user=obj,
            status__in=[Booking.Status.CONFIRMED, Booking.Status.CHECKOUT],
        ).count()

    def get_loyalty_stays_until_next_card(self, obj):
        if getattr(obj, "role", None) != User.Role.CUSTOMER:
            return None
        n = self.get_loyalty_stays_count(obj)
        rem = n % 5
        return 5 - rem if rem else 5

    def to_internal_value(self, data):
        # JSON/form clients often send "" for empty date; DRF DateField rejects that string.
        if hasattr(data, "copy"):
            data = data.copy()
        if hasattr(data, "get") and data.get("date_of_birth") == "":
            data["date_of_birth"] = None
        return super().to_internal_value(data)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        return attrs
