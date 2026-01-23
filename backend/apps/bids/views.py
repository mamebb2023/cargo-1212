from django.db import models
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Bid, BidDeletionRequest, BidDeletionRequest
from .serializers import (
    BidSerializer,
    BidCreateSerializer,
    BidListSerializer,
    BidDetailSerializer,
)
from apps.notifications.models import Notification
from utils.response import api_response


class BidListCreateView(generics.ListCreateAPIView):
    """List and create bids"""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return BidCreateSerializer
        return BidListSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Bid.objects.all()

        # Filter based on user role
        if user.role == "shipper":
            # Shippers see their own bids
            queryset = queryset.filter(user=user)
        elif user.role == "carrier":
            # Carriers see active bids (but need approved payment for full details)
            queryset = queryset.filter(status="active")
        elif user.role == "admin":
            # Admins see all bids
            pass

        # Apply filters
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        origin = self.request.query_params.get("origin")
        if origin:
            queryset = queryset.filter(origin__icontains=origin)

        destination = self.request.query_params.get("destination")
        if destination:
            queryset = queryset.filter(destination__icontains=destination)

        cargo_type = self.request.query_params.get("cargo_type")
        if cargo_type:
            queryset = queryset.filter(cargo_type__icontains=cargo_type)

        return queryset.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bid = serializer.save()

        # Create notification for the shipper
        Notification.create_notification(
            user=bid.user,
            title="Bid Created Successfully",
            message=f"Your bid '{bid.title}' has been created and is now active.",
            notification_type="bid_created",
            related_bid=bid,
        )

        bid_data = BidSerializer(bid).data
        return Response(
            api_response(
                success=True, message="Bid created successfully", data=bid_data
            ),
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Bids retrieved successfully",
                data=serializer.data,
            )
        )


class BidDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete bid"""

    permission_classes = [IsAuthenticated]
    serializer_class = BidDetailSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Bid.objects.all()

        # Filter based on user role
        if user.role == "shipper":
            # Shippers can only see their own bids
            queryset = queryset.filter(user=user)
        elif user.role == "carrier":
            # Carriers can see active bids (but need approved payment for full details)
            queryset = queryset.filter(status="active")
        elif user.role == "admin":
            # Admins can see all bids
            pass

        return queryset

    def retrieve(self, request, *args, **kwargs):
        bid = self.get_object()

        # Check if user can see full bid details
        # Allow if: user owns the bid OR user has approved payments for this specific bid OR user is admin
        user_has_paid_for_this_bid = (
            hasattr(request.user, "payments")
            and request.user.payments.filter(bid=bid, status="approved").exists()
        )
        user_owns_bid = request.user.id == bid.user.id
        user_is_admin = request.user.role == "admin"

        if not (user_owns_bid or user_has_paid_for_this_bid or user_is_admin):
            # Return limited information for users who haven't paid and don't own the bid
            limited_data = {
                "id": bid.id,
                "title": bid.title,
                "description": (
                    bid.description[:200] + "..."
                    if len(bid.description) > 200
                    else bid.description
                ),
                "budget": str(bid.budget),
                "origin": bid.origin,
                "destination": bid.destination,
                "weight": bid.weight,
                "cargo_type": bid.cargo_type,
                "deadline": bid.deadline,
                "offers_count": bid.offers_count,
                "lowest_offer": str(bid.lowest_offer) if bid.lowest_offer else None,
                "requires_payment": True,
                "payment_amount": "200.00",  # ETB 200
            }
            return Response(
                api_response(
                    success=True,
                    message="Bid details (limited - payment required for full access)",
                    data=limited_data,
                )
            )

        serializer = self.get_serializer(bid)
        return Response(
            api_response(
                success=True,
                message="Bid details retrieved successfully",
                data=serializer.data,
            )
        )

    def update(self, request, *args, **kwargs):
        bid = self.get_object()

        # Allow shippers to update their own bids, and admins to update any bid status
        if request.user.role == "admin":
            # Admins can update any bid
            pass
        elif request.user == bid.user and bid.status == "active":
            # Shippers can only update their own active bids (for editing details)
            pass
        else:
            return Response(
                api_response(
                    success=False,
                    message="You can only update your own active bids or admins can update any bid",
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(bid, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        old_status = bid.status
        bid = serializer.save()

        # Handle status changes by admins
        if request.user.role == "admin" and old_status != bid.status:
            if bid.status == "active":
                bid.approve_bid(request.user)
            elif bid.status == "rejected":
                bid.reject_bid(request.user, request.data.get("rejection_reason", ""))

        return Response(
            api_response(
                success=True, message="Bid updated successfully", data=serializer.data
            )
        )

    def destroy(self, request, *args, **kwargs):
        bid = self.get_object()

        # Only allow shippers to delete their own bids, and only if not closed
        if request.user != bid.user or bid.status not in ["active", "cancelled"]:
            return Response(
                api_response(
                    success=False,
                    message="You can only delete your own active or cancelled bids",
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        bid.delete()

        return Response(api_response(success=True, message="Bid deleted successfully"))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_bids_view(request):
    """Get current user's bids (for shippers and admins)"""

    if request.user.role == "shipper":
        # Shippers see only their own bids
        bids = Bid.objects.filter(user=request.user).order_by("-created_at")
    elif request.user.role == "admin":
        # Admins see only their own bids on "My Bids" page (not all bids)
        bids = Bid.objects.filter(user=request.user).order_by("-created_at")
    else:
        return Response(
            api_response(
                success=False, message="Only shippers and admins can view bids"
            ),
            status=status.HTTP_403_FORBIDDEN,
        )
    serializer = BidListSerializer(bids, many=True)

    return Response(
        api_response(
            success=True,
            message="Your bids retrieved successfully",
            data=serializer.data,
        )
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_bid_deletion_view(request, bid_id):
    """Request deletion of a bid (shipper only)"""

    try:
        bid = Bid.objects.get(id=bid_id)
    except Bid.DoesNotExist:
        return Response(
            api_response(success=False, message="Bid not found"),
            status=status.HTTP_404_NOT_FOUND,
        )

    # Check permissions - only the bid owner can request deletion
    if request.user != bid.user:
        return Response(
            api_response(
                success=False, message="You can only request deletion of your own bids"
            ),
            status=status.HTTP_403_FORBIDDEN,
        )

    # Debug logging
    print(f"DEBUG: Bid {bid_id} status: {bid.status}")
    print(f"DEBUG: Request data: {request.data}")

    # Check if bid can be deleted
    if bid.status not in ["active", "pending"]:
        print(f"DEBUG: Bid status {bid.status} not allowed for deletion")
        return Response(
            api_response(
                success=False,
                message=f"Only active or pending bids can be requested for deletion. Current status: {bid.status}",
            ),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if deletion request already exists
    existing_request = BidDeletionRequest.objects.filter(bid=bid).first()
    if existing_request:
        print(
            f"DEBUG: Deletion request already exists for bid {bid_id}, status: {existing_request.status}"
        )
        if existing_request.status == "pending":
            return Response(
                api_response(
                    success=False,
                    message="A deletion request for this bid is already pending admin review",
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )
        elif existing_request.status == "approved":
            return Response(
                api_response(
                    success=False,
                    message="This bid has already been approved for deletion",
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )
        else:  # rejected
            # Delete the rejected request and allow creating a new one
            existing_request.delete()
            print(
                f"DEBUG: Deleted rejected deletion request for bid {bid_id}, allowing new request"
            )

    reason = request.data.get("reason", "").strip()
    print(f"DEBUG: Reason received: '{reason}'")
    if not reason:
        return Response(
            api_response(success=False, message="Deletion reason is required"),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create deletion request
    deletion_request = BidDeletionRequest.objects.create(
        bid=bid,
        requested_by=request.user,
        reason=reason,
    )

    # Create notification for the shipper
    Notification.create_notification(
        user=request.user,
        title="Bid Deletion Request Submitted",
        message=f"Your deletion request for bid '{bid.title}' has been submitted and is pending admin review.",
        notification_type="bid_deletion_requested",
        related_bid=bid,
    )

    return Response(
        api_response(
            success=True,
            message="Bid deletion request submitted successfully and is pending admin review",
            data={
                "id": deletion_request.id,
                "status": deletion_request.status,
                "created_at": deletion_request.created_at,
            },
        )
    )
