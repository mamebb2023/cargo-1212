from rest_framework import serializers
from .models import Bid
from apps.users.serializers import UserSerializer


class BidSerializer(serializers.ModelSerializer):
    """Serializer for Bid model"""

    user = UserSerializer(read_only=True)
    offers_count = serializers.SerializerMethodField()
    lowest_offer = serializers.SerializerMethodField()
    bid_files_url = serializers.SerializerMethodField()

    class Meta:
        model = Bid
        fields = [
            "id",
            "user",
            "title",
            "description",
            "budget",
            "origin",
            "origin_address",
            "destination",
            "destination_address",
            "weight",
            "cargo_type",
            "special_requirements",
            "status",
            "deadline",
            "offers_deadline",
            "bid_files",
            "bid_files_url",
            "offers_count",
            "lowest_offer",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_offers_count(self, obj):
        return obj.offers.count()

    def get_lowest_offer(self, obj):
        lowest = obj.lowest_offer
        return str(lowest) if lowest else None

    def get_bid_files_url(self, obj):
        if obj.bid_files:
            return obj.bid_files.url
        return None


class BidCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bids"""

    class Meta:
        model = Bid
        fields = [
            "title",
            "description",
            "budget",
            "origin",
            "origin_address",
            "destination",
            "destination_address",
            "weight",
            "cargo_type",
            "special_requirements",
            "deadline",
            "offers_deadline",
            "bid_files",
        ]

    def validate_budget(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Budget must be greater than 0")
        return value

    def validate_deadline(self, value):
        from django.utils import timezone

        if value <= timezone.now().date():
            raise serializers.ValidationError("Deadline must be in the future")
        return value

    def validate_offers_deadline(self, value):
        from django.utils import timezone

        if value <= timezone.now().date():
            raise serializers.ValidationError("Offers deadline must be in the future")
        return value

    def validate(self, data):
        """Validate that offers_deadline is before deadline"""
        if data.get('offers_deadline') and data.get('deadline'):
            if data['offers_deadline'] >= data['deadline']:
                raise serializers.ValidationError(
                    "Offers deadline must be before the cargo delivery deadline"
                )
        return data

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class BidListSerializer(serializers.ModelSerializer):
    """Serializer for bid list view"""

    offers_count = serializers.SerializerMethodField()
    lowest_offer = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()

    class Meta:
        model = Bid
        fields = [
            "id",
            "title",
            "description",
            "budget",
            "origin",
            "destination",
            "weight",
            "cargo_type",
            "status",
            "deadline",
            "offers_deadline",
            "offers_count",
            "lowest_offer",
            "user",
            "created_at",
        ]

    def get_offers_count(self, obj):
        return obj.offers.count()

    def get_lowest_offer(self, obj):
        lowest = obj.lowest_offer
        return str(lowest) if lowest else None

    def get_user(self, obj):
        """Return shipper (user) information with ratings"""
        user = obj.user
        return {
            'id': user.id,
            'full_name': user.full_name,
            'company_name': user.company_name,
            'email': user.email,
            'average_rating': float(user.average_rating),
            'total_ratings': user.total_ratings,
        }


class BidDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for bid details page"""

    user = UserSerializer(read_only=True)
    offers_count = serializers.SerializerMethodField()
    lowest_offer = serializers.SerializerMethodField()
    bid_files_url = serializers.SerializerMethodField()

    # Selected offer details
    selected_offer = serializers.SerializerMethodField()

    class Meta:
        model = Bid
        fields = [
            "id",
            "user",
            "title",
            "description",
            "budget",
            "origin",
            "origin_address",
            "destination",
            "destination_address",
            "weight",
            "cargo_type",
            "special_requirements",
            "status",
            "deadline",
            "offers_deadline",
            "bid_files",
            "bid_files_url",
            "offers_count",
            "lowest_offer",
            "selected_offer",
            "created_at",
            "updated_at",
        ]

    def get_offers_count(self, obj):
        return obj.offers.count()

    def get_lowest_offer(self, obj):
        lowest = obj.lowest_offer
        return str(lowest) if lowest else None

    def get_bid_files_url(self, obj):
        if obj.bid_files:
            return obj.bid_files.url
        return None

    def get_selected_offer(self, obj):
        if obj.selected_offer_id:
            try:
                from apps.offers.models import Offer

                selected_offer = Offer.objects.get(id=obj.selected_offer_id)
                return {
                    "id": selected_offer.id,
                    "price": str(selected_offer.price),
                    "delivery_completed": selected_offer.delivery_completed,
                    "carrier": {
                        "id": selected_offer.user.id,
                        "full_name": selected_offer.user.full_name,
                        "company_name": selected_offer.user.company_name,
                    },
                }
            except Offer.DoesNotExist:
                return None
        return None
