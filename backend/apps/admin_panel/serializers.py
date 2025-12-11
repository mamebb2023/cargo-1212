from rest_framework import serializers
from apps.users.models import User
from apps.verification.models import VerificationDocument
from apps.payments.models import Payment
from apps.bids.models import Bid
from apps.offers.models import Offer
from apps.ratings.models import Rating


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management"""

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone', 'role', 'is_verified',
            'is_payment_confirmed', 'company_name', 'carrier_type',
            'average_rating', 'total_ratings', 'created_at'
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
    pending_payments = serializers.IntegerField()
    pending_documents = serializers.IntegerField()
    total_ratings = serializers.IntegerField()


class AdminBidSerializer(serializers.ModelSerializer):
    """Serializer for admin bid management"""

    user = serializers.StringRelatedField()
    offers_count = serializers.SerializerMethodField()
    lowest_offer = serializers.SerializerMethodField()

    class Meta:
        model = Bid
        fields = [
            'id', 'title', 'budget', 'status', 'deadline', 'user',
            'offers_count', 'lowest_offer', 'created_at'
        ]

    def get_offers_count(self, obj):
        return obj.offers.count()

    def get_lowest_offer(self, obj):
        lowest = obj.lowest_offer
        return str(lowest) if lowest else None


class AdminOfferSerializer(serializers.ModelSerializer):
    """Serializer for admin offer management"""

    bid_title = serializers.CharField(source='bid.title', read_only=True)
    carrier_name = serializers.CharField(source='user.full_name', read_only=True)
    shipper_name = serializers.CharField(source='bid.user.full_name', read_only=True)

    class Meta:
        model = Offer
        fields = [
            'id', 'bid', 'bid_title', 'user', 'carrier_name', 'shipper_name',
            'price', 'status', 'is_selected', 'created_at'
        ]


class AdminRatingSerializer(serializers.ModelSerializer):
    """Serializer for admin rating management"""

    shipper_name = serializers.CharField(source='user.full_name', read_only=True)
    carrier_name = serializers.CharField(source='carrier.full_name', read_only=True)
    bid_title = serializers.CharField(source='bid.title', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id', 'user', 'shipper_name', 'carrier', 'carrier_name',
            'bid', 'bid_title', 'score', 'comment', 'created_at'
        ]


class AdminPaymentSerializer(serializers.ModelSerializer):
    """Serializer for admin payment management"""

    user_name = serializers.CharField(source='user.full_name', read_only=True)
    payment_proof_url = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_name', 'amount', 'payment_method',
            'reference_number', 'status', 'payment_proof_url',
            'created_at', 'updated_at', 'bid',
        ]

    def get_payment_proof_url(self, obj):
        if obj.payment_proof:
            request = self.context.get('request')
            url = obj.payment_proof.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None