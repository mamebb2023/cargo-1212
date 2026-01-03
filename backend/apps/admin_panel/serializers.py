from rest_framework import serializers
from apps.users.models import User
from apps.verification.models import VerificationDocument
from apps.payments.models import Payment
from apps.bids.models import Bid, BidDeletionRequest
from apps.offers.models import Offer
from apps.ratings.models import Rating


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management"""

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
            "company_name",
            "carrier_type",
            "average_rating",
            "total_ratings",
            "created_at",
        ]


class AdminStatsSerializer(serializers.Serializer):
    """Serializer for admin dashboard statistics"""

    total_users = serializers.IntegerField()
    total_shippers = serializers.IntegerField()
    total_carriers = serializers.IntegerField()
    total_bids = serializers.IntegerField()
    active_bids = serializers.IntegerField()
    completed_bids = serializers.IntegerField()
    total_offers = serializers.IntegerField()
    pending_offers = serializers.IntegerField()
    pending_payments = serializers.IntegerField()
    pending_documents = serializers.IntegerField()
    total_ratings = serializers.IntegerField()


class AdminBidSerializer(serializers.ModelSerializer):
    """Serializer for admin bid management - includes all fields for review"""

    user = serializers.SerializerMethodField()
    offers_count = serializers.SerializerMethodField()
    lowest_offer = serializers.SerializerMethodField()
    bid_files_url = serializers.SerializerMethodField()

    class Meta:
        model = Bid
        fields = [
            "id",
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
            "user",
            "offers_count",
            "lowest_offer",
            "bid_files_url",
            "created_at",
            "updated_at",
        ]

    def get_user(self, obj):
        """Return full user information"""
        user = obj.user
        return {
            "id": user.id,
            "full_name": user.full_name,
            "company_name": user.company_name,
            "email": user.email,
            "phone": user.phone,
        }

    def get_offers_count(self, obj):
        return obj.offers.count()

    def get_lowest_offer(self, obj):
        lowest = obj.lowest_offer
        return str(lowest) if lowest else None

    def get_bid_files_url(self, obj):
        """Return the URL to the bid files if available"""
        if obj.bid_files:
            return obj.bid_files.url
        return None


class AdminOfferSerializer(serializers.ModelSerializer):
    """Serializer for admin offer management"""

    bid_title = serializers.CharField(source="bid.title", read_only=True)
    carrier_name = serializers.CharField(source="user.full_name", read_only=True)
    shipper_name = serializers.CharField(source="bid.user.full_name", read_only=True)

    class Meta:
        model = Offer
        fields = [
            "id",
            "bid",
            "bid_title",
            "user",
            "carrier_name",
            "shipper_name",
            "price",
            "delivery_time",
            "vehicle_type",
            "cpo_service_number",
            "notes",
            "status",
            "is_selected",
            "created_at",
        ]


class AdminRatingSerializer(serializers.ModelSerializer):
    """Serializer for admin rating management"""

    shipper_name = serializers.CharField(source="user.full_name", read_only=True)
    carrier_name = serializers.CharField(source="carrier.full_name", read_only=True)
    bid_title = serializers.CharField(source="bid.title", read_only=True)

    class Meta:
        model = Rating
        fields = [
            "id",
            "user",
            "shipper_name",
            "carrier",
            "carrier_name",
            "bid",
            "bid_title",
            "score",
            "comment",
            "created_at",
        ]


class AdminPaymentSerializer(serializers.ModelSerializer):
    """Serializer for admin payment management"""

    user_name = serializers.CharField(source="user.full_name", read_only=True)
    payment_proof_url = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "user_name",
            "amount",
            "payment_method",
            "reference_number",
            "status",
            "payment_proof_url",
            "created_at",
            "updated_at",
            "bid",
        ]

    def get_payment_proof_url(self, obj):
        if obj.payment_proof:
            request = self.context.get("request")
            url = obj.payment_proof.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class AdminBidDeletionRequestSerializer(serializers.ModelSerializer):
    """Serializer for admin bid deletion request management"""

    bid_title = serializers.CharField(source="bid.title", read_only=True)
    shipper_name = serializers.CharField(source="requested_by.full_name", read_only=True)
    shipper_email = serializers.CharField(source="requested_by.email", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.full_name", read_only=True)

    class Meta:
        model = BidDeletionRequest
        fields = [
            "id",
            "bid",
            "bid_title",
            "requested_by",
            "shipper_name",
            "shipper_email",
            "reason",
            "status",
            "reviewed_by",
            "reviewed_by_name",
            "admin_notes",
            "created_at",
            "reviewed_at",
        ]
