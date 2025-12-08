from rest_framework import serializers
from .models import Payment
from apps.users.serializers import UserSerializer
from apps.bids.serializers import BidListSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""

    user = UserSerializer(read_only=True)
    bid = BidListSerializer(read_only=True)
    payment_proof_url = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'amount', 'payment_method', 'reference_number',
            'payment_proof', 'payment_proof_url', 'status', 'bid',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_payment_proof_url(self, obj):
        if obj.payment_proof:
            return obj.payment_proof.url
        return None


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments"""

    class Meta:
        model = Payment
        fields = [
            'amount', 'payment_method', 'reference_number', 'payment_proof', 'bid'
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate_payment_method(self, value):
        valid_methods = ['cbe', 'telebirr', 'other']
        if value not in valid_methods:
            raise serializers.ValidationError(f"Payment method must be one of: {', '.join(valid_methods)}")
        return value

    def validate(self, data):
        # If bid is provided, check if it's for bid access payment
        if data.get('bid'):
            bid = data['bid']
            if bid.status != 'active':
                raise serializers.ValidationError("Cannot make payment for inactive bid")

            # Check if user already has access to this bid
            if bid.is_paid:
                raise serializers.ValidationError("User already has access to this bid")

        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PaymentListSerializer(serializers.ModelSerializer):
    """Serializer for payment list view"""

    bid_title = serializers.CharField(source='bid.title', read_only=True) if 'bid' in locals() else serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'payment_method', 'reference_number',
            'status', 'bid', 'bid_title', 'created_at'
        ]

    def get_bid_title(self, obj):
        return obj.bid.title if obj.bid else None


class PaymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating payment status (admin only)"""

    class Meta:
        model = Payment
        fields = ['status']

    def validate_status(self, value):
        valid_statuses = ['pending', 'approved', 'rejected']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value
