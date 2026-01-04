from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Case, When, Value, IntegerField, F, ExpressionWrapper
from django.db.models.functions import Cast, Coalesce
import re
from .models import Offer
from .serializers import (
    OfferSerializer,
    OfferCreateSerializer,
    OfferListSerializer,
    OfferDetailSerializer,
)
from apps.notifications.models import Notification
from utils.response import api_response


def extract_delivery_time_days(delivery_time_str):
    """
    Extract numerical value from delivery time string for sorting.
    Examples: "3 days" -> 3, "48 hours" -> 2, "1 week" -> 7
    """
    if not delivery_time_str:
        return 999

    text = delivery_time_str.lower().strip()

    match = re.search(r"(\d+)", text)
    if not match:
        return 999

    number = int(match.group(1))

    if "week" in text or "weeks" in text:
        return number * 7
    elif "hour" in text or "hours" in text:
        return max(1, number // 24)
    elif "day" in text or "days" in text:
        return number
    else:
        return number


class OfferListCreateView(generics.ListCreateAPIView):
    """List and create offers"""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return OfferCreateSerializer
        return OfferListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == "carrier":
            return Offer.objects.filter(user=user).order_by("-created_at")
        elif user.role == "admin":
            return Offer.objects.all().order_by("-created_at")
        elif user.role == "shipper":
            # Shippers see all offers on their active/awarded bids
            # Note: We'll do custom sorting in the list method for proper multi-criteria sorting
            queryset = Offer.objects.filter(bid__user=user, bid__status__in=["active", "awarded"])
            return queryset

        return Offer.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.role not in ["carrier", "admin"]:
            return Response(
                api_response(
                    success=False, message="Only carriers and admins can submit offers"
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = serializer.save()

        # Offer is created with status="pending" by default
        # Create notification for admin (if there's an admin notification system)
        # Note: The offer will be visible to admins in the review page

        # Create notification for the carrier
        Notification.create_notification(
            user=offer.user,
            title="Offer Submitted",
            message=f"Your offer of {offer.price} ETB for '{offer.bid.title}' has been submitted and is pending admin approval.",
            notification_type="offer_submitted",
            related_bid=offer.bid,
            related_offer=offer,
        )

        offer_data = OfferSerializer(offer).data
        return Response(
            api_response(
                success=True,
                message="Offer submitted successfully and is pending admin approval",
                data=offer_data,
            ),
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # For shippers, apply multi-criteria sorting: price, rating, delivery time
        if request.user.role == "shipper":
            offers_list = list(queryset)
            # Sort by price (lowest first), then rating (highest first), then delivery time (nearest first)
            offers_list.sort(
                key=lambda offer: (
                    offer.price,  # Lowest price first
                    -offer.user.average_rating,  # Highest rating first (negative for descending)
                    extract_delivery_time_days(offer.delivery_time),  # Nearest delivery first
                )
            )
            serializer = self.get_serializer(offers_list, many=True)
        else:
            # For carriers and admins, use the queryset directly
            serializer = self.get_serializer(queryset, many=True)

        return Response(
            api_response(
                success=True,
                message="Offers retrieved successfully",
                data=serializer.data,
            )
        )


class OfferDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update offer"""

    permission_classes = [IsAuthenticated]
    serializer_class = OfferDetailSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == "carrier":
            # Carriers can only see their own offers
            return Offer.objects.filter(user=user)
        elif user.role == "admin":
            # Admins can see all offers
            return Offer.objects.all()
        elif user.role == "shipper":
            # Shippers can see offers on their bids
            return Offer.objects.filter(bid__user=user)

        return Offer.objects.none()

    def retrieve(self, request, *args, **kwargs):
        offer = self.get_object()
        serializer = self.get_serializer(offer)
        return Response(
            api_response(
                success=True,
                message="Offer details retrieved successfully",
                data=serializer.data,
            )
        )

    def update(self, request, *args, **kwargs):
        offer = self.get_object()

        # Cannot update accepted offers
        if offer.status == "accepted":
            return Response(
                api_response(success=False, message="Cannot update accepted offers"),
                status=status.HTTP_403_FORBIDDEN,
            )

        # Allow admins to update offer status (approve/reject)
        if request.user.role == "admin":
            serializer = self.get_serializer(offer, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            old_status = offer.status
            offer = serializer.save()

            # Handle status changes by admins
            if old_status != offer.status:
                if offer.status == "active":
                    offer.approve_offer(request.user)
                elif offer.status == "rejected":
                    offer.reject_offer(
                        request.user, request.data.get("rejection_reason", "")
                    )

            return Response(
                api_response(
                    success=True,
                    message="Offer updated successfully",
                    data=serializer.data,
                )
            )

        # Only carriers can update their own pending offers
        if request.user.role != "carrier" or request.user != offer.user:
            return Response(
                api_response(
                    success=False, message="You can only update your own pending offers"
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        # Carriers can only update pending offers
        if offer.status != "pending":
            return Response(
                api_response(
                    success=False, message="You can only update pending offers"
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(offer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            api_response(
                success=True, message="Offer updated successfully", data=serializer.data
            )
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_offer_view(request, offer_id):
    """Accept an offer (shipper only)"""

    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return Response(
            api_response(success=False, message="Offer not found"),
            status=status.HTTP_404_NOT_FOUND,
        )

    # Check permissions
    if request.user != offer.bid.user:
        return Response(
            api_response(
                success=False, message="You can only accept offers on your own bids"
            ),
            status=status.HTTP_403_FORBIDDEN,
        )

    if offer.status != "active":
        return Response(
            api_response(
                success=False, message="Only active (approved) offers can be accepted"
            ),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Accept the offer
    offer.accept_offer()

    # Create notifications
    Notification.create_notification(
        user=offer.user,
        title="Offer Accepted!",
        message=f"Your offer of {offer.price} ETB for '{offer.bid.title}' has been accepted!",
        notification_type="offer_accepted",
        related_bid=offer.bid,
        related_offer=offer,
    )

    Notification.create_notification(
        user=offer.bid.user,
        title="Bid Awarded",
        message=f"Your bid '{offer.bid.title}' has been awarded to {offer.user.company_name or offer.user.full_name}.",
        notification_type="bid_awarded",
        related_bid=offer.bid,
    )

    return Response(
        api_response(
            success=True, message="Offer accepted successfully. Bid has been closed."
        )
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_delivery_view(request, offer_id):
    """Mark delivery as completed (shipper only)"""

    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return Response(
            api_response(success=False, message="Offer not found"),
            status=status.HTTP_404_NOT_FOUND,
        )

    # Check permissions - only shipper who owns the bid can mark delivery as completed
    if request.user != offer.bid.user:
        return Response(
            api_response(
                success=False,
                message="You can only mark delivery as completed for your own bids",
            ),
            status=status.HTTP_403_FORBIDDEN,
        )

    if offer.status != "accepted":
        return Response(
            api_response(
                success=False,
                message="Can only mark delivery as completed for accepted offers",
            ),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if offer.delivery_completed:
        return Response(
            api_response(
                success=False, message="Delivery is already marked as completed"
            ),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Mark delivery as completed
    offer.mark_delivery_completed()

    return Response(
        api_response(success=True, message="Delivery marked as completed successfully")
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_offer_view(request, offer_id):
    """Reject an offer (shipper only)"""

    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return Response(
            api_response(success=False, message="Offer not found"),
            status=status.HTTP_404_NOT_FOUND,
        )

    # Check permissions
    if request.user != offer.bid.user:
        return Response(
            api_response(
                success=False, message="You can only reject offers on your own bids"
            ),
            status=status.HTTP_403_FORBIDDEN,
        )

    if offer.status != "active":
        return Response(
            api_response(
                success=False,
                message="Only active (approved) offers can be rejected by shipper",
            ),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Reject the offer
    offer.reject_offer()

    # Create notification
    Notification.create_notification(
        user=offer.user,
        title="Offer Rejected",
        message=f"Your offer for '{offer.bid.title}' has been rejected.",
        notification_type="offer_rejected",
        related_bid=offer.bid,
        related_offer=offer,
    )

    return Response(api_response(success=True, message="Offer rejected successfully"))
