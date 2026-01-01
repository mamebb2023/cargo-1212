from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Offer
from .serializers import OfferSerializer, OfferCreateSerializer, OfferListSerializer, OfferDetailSerializer
from apps.notifications.models import Notification
from utils.response import api_response


class OfferListCreateView(generics.ListCreateAPIView):
    """List and create offers"""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OfferCreateSerializer
        return OfferListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == 'carrier':
            # Carriers see their own offers
            return Offer.objects.filter(user=user).order_by('-created_at')
        elif user.role == 'admin':
            # Admins see all offers
            return Offer.objects.all().order_by('-created_at')
        elif user.role == 'shipper':
            # Shippers see offers on their bids
            return Offer.objects.filter(bid__user=user).order_by('-created_at')

        return Offer.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['carrier', 'admin']:
            return Response(api_response(
                success=False,
                message="Only carriers and admins can submit offers"
            ), status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = serializer.save()

        # Create notification for the shipper
        Notification.create_notification(
            user=offer.bid.user,
            title="New Offer Received",
            message=f"You received a new offer of {offer.price} ETB for '{offer.bid.title}' from {offer.user.full_name}",
            notification_type="offer_received",
            related_bid=offer.bid,
            related_offer=offer
        )

        offer_data = OfferSerializer(offer).data
        return Response(api_response(
            success=True,
            message="Offer submitted successfully",
            data=offer_data
        ), status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(api_response(
            success=True,
            message="Offers retrieved successfully",
            data=serializer.data
        ))


class OfferDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update offer"""

    permission_classes = [IsAuthenticated]
    serializer_class = OfferDetailSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == 'carrier':
            # Carriers can only see their own offers
            return Offer.objects.filter(user=user)
        elif user.role == 'admin':
            # Admins can see all offers
            return Offer.objects.all()
        elif user.role == 'shipper':
            # Shippers can see offers on their bids
            return Offer.objects.filter(bid__user=user)

        return Offer.objects.none()

    def retrieve(self, request, *args, **kwargs):
        offer = self.get_object()
        serializer = self.get_serializer(offer)
        return Response(api_response(
            success=True,
            message="Offer details retrieved successfully",
            data=serializer.data
        ))

    def update(self, request, *args, **kwargs):
        offer = self.get_object()

        # Cannot update accepted offers
        if offer.status == 'accepted':
            return Response(api_response(
                success=False,
                message="Cannot update accepted offers"
            ), status=status.HTTP_403_FORBIDDEN)

        # Only carriers and admins can update their own offers
        if request.user.role not in ['carrier', 'admin'] or request.user != offer.user:
            return Response(api_response(
                success=False,
                message="You can only update your own pending offers"
            ), status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(offer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(api_response(
            success=True,
            message="Offer updated successfully",
            data=serializer.data
        ))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_offer_view(request, offer_id):
    """Accept an offer (shipper only)"""

    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return Response(api_response(
            success=False,
            message="Offer not found"
        ), status=status.HTTP_404_NOT_FOUND)

    # Check permissions
    if request.user != offer.bid.user:
        return Response(api_response(
            success=False,
            message="You can only accept offers on your own bids"
        ), status=status.HTTP_403_FORBIDDEN)

    if offer.status != 'active':
        return Response(api_response(
            success=False,
            message="Offer is not active"
        ), status=status.HTTP_400_BAD_REQUEST)

    # Accept the offer
    offer.accept_offer()

    # Create notifications
    Notification.create_notification(
        user=offer.user,
        title="Offer Accepted!",
        message=f"Your offer of {offer.price} ETB for '{offer.bid.title}' has been accepted!",
        notification_type="offer_accepted",
        related_bid=offer.bid,
        related_offer=offer
    )

    Notification.create_notification(
        user=offer.bid.user,
        title="Bid Closed",
        message=f"Your bid '{offer.bid.title}' has been closed with the selected offer.",
        notification_type="bid_closed",
        related_bid=offer.bid
    )

    return Response(api_response(
        success=True,
        message="Offer accepted successfully. Bid has been closed."
    ))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_delivery_view(request, offer_id):
    """Mark delivery as completed (shipper only)"""

    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return Response(api_response(
            success=False,
            message="Offer not found"
        ), status=status.HTTP_404_NOT_FOUND)

    # Check permissions - only shipper who owns the bid can mark delivery as completed
    if request.user != offer.bid.user:
        return Response(api_response(
            success=False,
            message="You can only mark delivery as completed for your own bids"
        ), status=status.HTTP_403_FORBIDDEN)

    if offer.status != 'accepted':
        return Response(api_response(
            success=False,
            message="Can only mark delivery as completed for accepted offers"
        ), status=status.HTTP_400_BAD_REQUEST)

    if offer.delivery_completed:
        return Response(api_response(
            success=False,
            message="Delivery is already marked as completed"
        ), status=status.HTTP_400_BAD_REQUEST)

    # Mark delivery as completed
    offer.mark_delivery_completed()

    return Response(api_response(
        success=True,
        message="Delivery marked as completed successfully"
    ))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_offer_view(request, offer_id):
    """Reject an offer (shipper only)"""

    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return Response(api_response(
            success=False,
            message="Offer not found"
        ), status=status.HTTP_404_NOT_FOUND)

    # Check permissions
    if request.user != offer.bid.user:
        return Response(api_response(
            success=False,
            message="You can only reject offers on your own bids"
        ), status=status.HTTP_403_FORBIDDEN)

    if offer.status != 'active':
        return Response(api_response(
            success=False,
            message="Offer is not active"
        ), status=status.HTTP_400_BAD_REQUEST)

    # Reject the offer
    offer.reject_offer()

    # Create notification
    Notification.create_notification(
        user=offer.user,
        title="Offer Rejected",
        message=f"Your offer for '{offer.bid.title}' has been rejected.",
        notification_type="offer_rejected",
        related_bid=offer.bid,
        related_offer=offer
    )

    return Response(api_response(
        success=True,
        message="Offer rejected successfully"
    ))
