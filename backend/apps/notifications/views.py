from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer, NotificationListSerializer, NotificationUpdateSerializer
from utils.response import api_response


class NotificationListView(generics.ListAPIView):
    """List notifications for current user"""

    permission_classes = [IsAuthenticated]
    serializer_class = NotificationListSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        # Get unread count
        unread_count = queryset.filter(is_read=False).count()

        return Response(api_response(
            success=True,
            message="Notifications retrieved successfully",
            data={
                'notifications': serializer.data,
                'unread_count': unread_count
            }
        ))


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update notification"""

    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        notification = self.get_object()

        # Mark as read if not already read
        if not notification.is_read:
            notification.mark_as_read()

        serializer = self.get_serializer(notification)
        return Response(api_response(
            success=True,
            message="Notification details retrieved successfully",
            data=serializer.data
        ))

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        serializer = NotificationUpdateSerializer(notification, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(api_response(
            success=True,
            message="Notification updated successfully",
            data=NotificationSerializer(notification).data
        ))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_as_read_view(request):
    """Mark all notifications as read for current user"""

    notifications = Notification.objects.filter(user=request.user, is_read=False)
    updated_count = notifications.update(is_read=True)

    return Response(api_response(
        success=True,
        message=f"{updated_count} notifications marked as read"
    ))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count_view(request):
    """Get unread notification count for current user"""

    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()

    return Response(api_response(
        success=True,
        message="Unread count retrieved successfully",
        data={'unread_count': unread_count}
    ))
