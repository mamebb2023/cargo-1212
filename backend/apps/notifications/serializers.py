from rest_framework import serializers
from .models import Notification
from apps.users.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'is_read',
            'related_bid', 'related_offer', 'related_payment', 'related_document',
            'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


class NotificationListSerializer(serializers.ModelSerializer):
    """Serializer for notification list view"""

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'is_read', 'created_at'
        ]


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for marking notifications as read"""

    class Meta:
        model = Notification
        fields = ['is_read']
        read_only_fields = ['id']

    def update(self, instance, validated_data):
        if validated_data.get('is_read', False) and not instance.is_read:
            instance.mark_as_read()
        return instance
