from rest_framework import serializers
from .models import Rating
from apps.users.serializers import UserSerializer
from apps.bids.serializers import BidListSerializer


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for Rating model"""

    user = UserSerializer(read_only=True)
    carrier = UserSerializer(read_only=True)
    bid = BidListSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id', 'user', 'carrier', 'bid', 'score', 'comment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class RatingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ratings"""

    class Meta:
        model = Rating
        fields = ['bid', 'carrier', 'score', 'comment']

    def validate_score(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Score must be between 1 and 5")
        return value

    def validate(self, data):
        user = self.context['request'].user
        bid = data['bid']
        carrier = data['carrier']

        # Check if user is the shipper of the bid
        if bid.user != user:
            raise serializers.ValidationError("You can only rate carriers for your own completed bids")

        # Check if bid is completed
        if bid.status != 'completed':
            raise serializers.ValidationError("You can only rate after the bid is completed")

        # Check if carrier submitted an offer for this bid that was selected
        if not bid.selected_offer or bid.selected_offer.user != carrier:
            raise serializers.ValidationError("You can only rate the carrier who was selected for this bid")

        # Check if rating already exists
        if Rating.objects.filter(user=user, carrier=carrier, bid=bid).exists():
            raise serializers.ValidationError("You have already rated this carrier for this bid")

        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class RatingListSerializer(serializers.ModelSerializer):
    """Serializer for rating list view"""

    user = UserSerializer(read_only=True)
    carrier = UserSerializer(read_only=True)
    bid_title = serializers.CharField(source='bid.title', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id', 'user', 'carrier', 'bid_title', 'score', 'comment', 'created_at'
        ]
