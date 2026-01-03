from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from apps.users.models import User
from apps.bids.models import Bid, BidDeletionRequest
from apps.offers.models import Offer
from apps.payments.models import Payment
from apps.verification.models import VerificationDocument
from apps.ratings.models import Rating
from .serializers import (
    AdminUserSerializer,
    AdminStatsSerializer,
    AdminBidSerializer,
    AdminOfferSerializer,
    AdminRatingSerializer,
    AdminPaymentSerializer,
    AdminBidDeletionRequestSerializer,
)
from utils.response import api_response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard_view(request):
    """Admin dashboard with statistics"""

    if request.user.role != "admin":
        return Response(
            api_response(success=False, message="Access denied. Admin role required."),
            status=status.HTTP_403_FORBIDDEN,
        )

    # Calculate statistics
    stats = {
        "total_users": User.objects.count(),
        "total_shippers": User.objects.filter(role="shipper").count(),
        "total_carriers": User.objects.filter(role="carrier").count(),
        "total_bids": Bid.objects.count(),
        "active_bids": Bid.objects.filter(status="active").count(),
        "completed_bids": Bid.objects.filter(status="completed").count(),
        "total_offers": Offer.objects.count(),
        "pending_offers": Offer.objects.filter(status="pending").count(),
        "pending_payments": Payment.objects.filter(status="pending").count(),
        "pending_documents": VerificationDocument.objects.filter(
            status="pending"
        ).count(),
        "total_ratings": Rating.objects.count(),
    }

    serializer = AdminStatsSerializer(stats)
    return Response(
        api_response(
            success=True,
            message="Admin dashboard statistics retrieved successfully",
            data=serializer.data,
        )
    )


class AdminUserListView(generics.ListAPIView):
    """Admin view for managing users"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return User.objects.none()

        queryset = User.objects.all().order_by("-created_at")

        # Apply filters
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)

        verified = self.request.query_params.get("verified")
        if verified == "true":
            queryset = queryset.filter(is_verified=True)
        elif verified == "false":
            queryset = queryset.filter(is_verified=False)

        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Users retrieved successfully",
                data=serializer.data,
            )
        )


class AdminBidListView(generics.ListAPIView):
    """Admin view for managing bids"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminBidSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return Bid.objects.none()

        queryset = Bid.objects.all().order_by("-created_at")

        # Apply filters
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Bids retrieved successfully",
                data=serializer.data,
            )
        )


class AdminOfferListView(generics.ListAPIView):
    """Admin view for managing offers"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminOfferSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return Offer.objects.none()

        queryset = Offer.objects.all().order_by("-created_at")

        # Apply filters
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Offers retrieved successfully",
                data=serializer.data,
            )
        )


class AdminRatingListView(generics.ListAPIView):
    """Admin view for managing ratings"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminRatingSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return Rating.objects.none()

        return Rating.objects.all().order_by("-created_at")

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Ratings retrieved successfully",
                data=serializer.data,
            )
        )


class AdminPaymentListView(generics.ListAPIView):
    """Admin view for managing payments"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminPaymentSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return Payment.objects.none()

        queryset = Payment.objects.select_related('user').all().order_by("-created_at")

        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Payments retrieved successfully",
                data=serializer.data,
            )
        )


class AdminBidDeletionRequestListView(generics.ListAPIView):
    """Admin view for managing bid deletion requests"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminBidDeletionRequestSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return BidDeletionRequest.objects.none()

        queryset = BidDeletionRequest.objects.select_related(
            'bid', 'requested_by', 'reviewed_by'
        ).order_by("-created_at")

        # Apply filters
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Bid deletion requests retrieved successfully",
                data=serializer.data,
            )
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_reviews_view(request):
    """Get all pending items that need admin review"""

    if request.user.role != "admin":
        return Response(
            api_response(success=False, message="Access denied. Admin role required."),
            status=status.HTTP_403_FORBIDDEN,
        )

    pending_payments = Payment.objects.filter(status="pending").count()
    pending_documents = VerificationDocument.objects.filter(status="pending").count()
    pending_bids = Bid.objects.filter(status="pending").count()
    pending_offers = Offer.objects.filter(status="pending").count()
    pending_bid_deletions = BidDeletionRequest.objects.filter(status="pending").count()

    pending_items = {
        "pending_payments": pending_payments,
        "pending_documents": pending_documents,
        "pending_bids": pending_bids,
        "pending_offers": pending_offers,
        "pending_bid_deletions": pending_bid_deletions,
        "total_pending": pending_payments + pending_documents + pending_bids + pending_offers + pending_bid_deletions,
    }

    return Response(
        api_response(
            success=True,
            message="Pending reviews count retrieved successfully",
            data=pending_items,
        )
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def handle_bid_deletion_request_view(request, request_id):
    """Approve or reject a bid deletion request (admin only)"""

    if request.user.role != "admin":
        return Response(
            api_response(success=False, message="Access denied. Admin role required."),
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        deletion_request = BidDeletionRequest.objects.get(id=request_id)
    except BidDeletionRequest.DoesNotExist:
        return Response(
            api_response(success=False, message="Bid deletion request not found"),
            status=status.HTTP_404_NOT_FOUND,
        )

    action = request.data.get("action")
    admin_notes = request.data.get("admin_notes", "").strip()

    if action not in ["approve", "reject"]:
        return Response(
            api_response(success=False, message="Invalid action. Must be 'approve' or 'reject'"),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if action == "approve":
        deletion_request.approve_request(request.user, admin_notes)
        message = "Bid deletion request approved successfully"
    else:  # reject
        if not admin_notes:
            return Response(
                api_response(success=False, message="Admin notes are required when rejecting"),
                status=status.HTTP_400_BAD_REQUEST,
            )
        deletion_request.reject_request(request.user, admin_notes)
        message = "Bid deletion request rejected successfully"

    return Response(
        api_response(
            success=True,
            message=message,
            data={
                "id": deletion_request.id,
                "status": deletion_request.status,
                "reviewed_at": deletion_request.reviewed_at,
            }
        )
    )
