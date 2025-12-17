from rest_framework import serializers
from .models import Rating
from apps.users.serializers import UserSerializer
from apps.bids.serializers import BidListSerializer


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for Rating model"""

    rater = UserSerializer(read_only=True)
    ratee = UserSerializer(read_only=True)
    bid = BidListSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id', 'rater', 'ratee', 'bid', 'score', 'comment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rater', 'created_at', 'updated_at']


class RatingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ratings"""

    class Meta:
        model = Rating
        fields = ['bid', 'ratee', 'score', 'comment']

    def validate_score(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Score must be between 1 and 5")
        return value

    def validate(self, data):
        rater = self.context['request'].user
        bid = data['bid']
        ratee = data['ratee']

        # Check if bid is completed
        if bid.status != 'completed':
            raise serializers.ValidationError("You can only rate after the bid is completed")

        # Check if both users were involved in this bid
        involved_users = [bid.user]
        if bid.selected_offer:
            involved_users.append(bid.selected_offer.user)

        if rater not in involved_users:
            raise serializers.ValidationError("You are not authorized to rate this bid")

        if ratee not in involved_users:
            raise serializers.ValidationError("The user you are trying to rate was not involved in this bid")

        if rater == ratee:
            raise serializers.ValidationError("You cannot rate yourself")

        # Check if rating already exists
        if Rating.objects.filter(rater=rater, ratee=ratee, bid=bid).exists():
            raise serializers.ValidationError("You have already rated this user for this bid")

        return data

    def create(self, validated_data):
        validated_data['rater'] = self.context['request'].user
        return super().create(validated_data)


class RatingListSerializer(serializers.ModelSerializer):
    """Serializer for rating list view"""

    rater = UserSerializer(read_only=True)
    ratee = UserSerializer(read_only=True)
    bid_title = serializers.CharField(source='bid.title', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id', 'rater', 'ratee', 'bid_title', 'score', 'comment', 'created_at'
        ]
