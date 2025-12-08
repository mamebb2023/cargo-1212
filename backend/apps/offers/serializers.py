from rest_framework import serializers
from .models import Offer
from apps.users.serializers import UserSerializer
from apps.bids.serializers import BidListSerializer


class OfferSerializer(serializers.ModelSerializer):
    """Serializer for Offer model"""

    user = UserSerializer(read_only=True)
    bid = BidListSerializer(read_only=True)

    class Meta:
        model = Offer
        fields = [
            "id",
            "bid",
            "user",
            "price",
            "delivery_time",
            "vehicle_type",
            "cpo_service_number",
            "notes",
            "status",
            "is_selected",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class OfferCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating offers"""

    class Meta:
        model = Offer
        fields = [
            "bid",
            "price",
            "delivery_time",
            "vehicle_type",
            "cpo_service_number",
            "notes",
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate_bid(self, value):
        # Check if bid is active
        if value.status != "active":
            raise serializers.ValidationError("Cannot submit offer for inactive bid")

        # Check if user already submitted offer for this bid
        request = self.context.get("request")
        if request and Offer.objects.filter(bid=value, user=request.user).exists():
            raise serializers.ValidationError(
                "You have already submitted an offer for this bid"
            )

        return value

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class OfferListSerializer(serializers.ModelSerializer):
    """Serializer for offer list view"""

    user = UserSerializer(read_only=True)
    bid_title = serializers.CharField(source="bid.title", read_only=True)

    class Meta:
        model = Offer
        fields = [
            "id",
            "bid",
            "bid_title",
            "user",
            "price",
            "delivery_time",
            "vehicle_type",
            "status",
            "is_selected",
            "created_at",
        ]


class OfferDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for offer"""

    user = UserSerializer(read_only=True)
    bid = BidListSerializer(read_only=True)

    class Meta:
        model = Offer
        fields = [
            "id",
            "bid",
            "user",
            "price",
            "delivery_time",
            "vehicle_type",
            "cpo_service_number",
            "notes",
            "status",
            "is_selected",
            "created_at",
            "updated_at",
        ]
