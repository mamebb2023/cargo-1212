from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
import re
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Base user serializer"""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "role",
            "is_verified",
            "is_payment_confirmed",
            "country",
            "city",
            "street",
            "zip_code",
            "company_name",
            "carrier_type",
            "number_of_trucks",
            "truck_libreh_number",
            "truck_tin_number",
            "average_rating",
            "total_ratings",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "average_rating",
            "total_ratings",
            "created_at",
            "updated_at",
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    # Role and carrier fields (optional, can be set later)
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES, default="shipper", required=False
    )
    company_name = serializers.CharField(
        max_length=255, required=False, allow_blank=True
    )
    carrier_type = serializers.ChoiceField(
        choices=[
            ("company", "Company"),
            ("plc", "PLC"),
            ("truck_owner", "Truck Owner"),
        ],
        required=False,
        allow_blank=True,
    )
    number_of_trucks = serializers.IntegerField(required=False, min_value=0, default=0)
    truck_libreh_number = serializers.CharField(
        max_length=100, required=False, allow_blank=True
    )
    truck_tin_number = serializers.CharField(
        max_length=100, required=False, allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "confirm_password",
            "full_name",
            "phone",
            "country",
            "city",
            "street",
            "zip_code",
            "role",
            "company_name",
            "carrier_type",
            "number_of_trucks",
            "truck_libreh_number",
            "truck_tin_number",
        ]

    def validate(self, data):
        # Normalize phone to match backend regex (strip spaces/dashes, keep leading + if present)
        phone = data.get("phone", "")
        has_plus = phone.strip().startswith("+")
        normalized_phone = re.sub(r"\D", "", phone)
        if has_plus:
            normalized_phone = f"+{normalized_phone}"
        data["phone"] = normalized_phone

        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        # Check if user with this email already exists
        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError(
                {"email": "User with this email already exists."}
            )

        # Validate carrier-specific fields if role is carrier
        role = data.get("role", "shipper")
        carrier_type = data.get("carrier_type")

        if role == "carrier" and carrier_type:
            if carrier_type == "company":
                if not data.get("company_name"):
                    raise serializers.ValidationError(
                        {
                            "company_name": "Company name is required for company carriers."
                        }
                    )
                if not data.get("number_of_trucks"):
                    raise serializers.ValidationError(
                        {
                            "number_of_trucks": "Number of trucks is required for company carriers."
                        }
                    )
            elif carrier_type == "plc":
                if not data.get("number_of_trucks"):
                    raise serializers.ValidationError(
                        {
                            "number_of_trucks": "Number of trucks is required for PLC carriers."
                        }
                    )
            elif carrier_type == "truck_owner":
                if not data.get("truck_libreh_number"):
                    raise serializers.ValidationError(
                        {
                            "truck_libreh_number": "Truck libreh number is required for truck owners."
                        }
                    )
                if not data.get("truck_tin_number"):
                    raise serializers.ValidationError(
                        {
                            "truck_tin_number": "Truck TIN number is required for truck owners."
                        }
                    )

        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        # Set default role if not provided
        if "role" not in validated_data:
            validated_data["role"] = "shipper"

        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""

    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            raise serializers.ValidationError(
                {"message": "Must include email and password."}
            )

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError({"message": "Invalid email or password."})

        if not user.is_active:
            raise serializers.ValidationError({"message": "User account is disabled."})

        data["user"] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates"""

    class Meta:
        model = User
        fields = [
            "full_name",
            "phone",
            "country",
            "city",
            "street",
            "zip_code",
            "company_name",
            "carrier_type",
            "number_of_trucks",
            "truck_libreh_number",
            "truck_tin_number",
        ]

    def update(self, instance, validated_data):
        # Prevent role changes through profile update
        validated_data.pop("role", None)
        return super().update(instance, validated_data)


class CarrierRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for carrier-specific registration fields"""

    class Meta:
        model = User
        fields = [
            "company_name",
            "carrier_type",
            "number_of_trucks",
            "truck_libreh_number",
            "truck_tin_number",
        ]

    def validate(self, data):
        carrier_type = data.get("carrier_type")

        if carrier_type == "company":
            if not data.get("company_name"):
                raise serializers.ValidationError(
                    {"company_name": "Company name is required for company carriers."}
                )
            if not data.get("number_of_trucks"):
                raise serializers.ValidationError(
                    {
                        "number_of_trucks": "Number of trucks is required for company carriers."
                    }
                )

        elif carrier_type == "plc":
            if not data.get("number_of_trucks"):
                raise serializers.ValidationError(
                    {
                        "number_of_trucks": "Number of trucks is required for PLC carriers."
                    }
                )

        elif carrier_type == "truck_owner":
            if not data.get("truck_libreh_number"):
                raise serializers.ValidationError(
                    {
                        "truck_libreh_number": "Truck libreh number is required for truck owners."
                    }
                )
            if not data.get("truck_tin_number"):
                raise serializers.ValidationError(
                    {
                        "truck_tin_number": "Truck TIN number is required for truck owners."
                    }
                )

        return data


class TopRatedCarrierSerializer(serializers.ModelSerializer):
    """Serializer for top-rated carriers"""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "company_name",
            "role",
            "carrier_type",
            "average_rating",
            "total_ratings",
        ]

    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    def get_first_name(self, obj):
        return obj.full_name.split(" ")[0] if obj.full_name else ""

    def get_last_name(self, obj):
        name_parts = obj.full_name.split(" ")
        return " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
