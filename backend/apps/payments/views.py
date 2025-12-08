from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    PaymentListSerializer,
    PaymentUpdateSerializer,
)
from apps.notifications.models import Notification
from utils.response import api_response


class PaymentListCreateView(generics.ListCreateAPIView):
    """List and create payments"""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PaymentCreateSerializer
        return PaymentListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            # Admins see all payments
            return Payment.objects.all().order_by("-created_at")
        else:
            # Users see their own payments
            return Payment.objects.filter(user=user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()

        # Create notification for the user
        Notification.create_notification(
            user=payment.user,
            title="Payment Submitted",
            message=f"Your payment of {payment.amount} ETB has been submitted and is under review.",
            notification_type="system",
            related_payment=payment,
        )

        payment_data = PaymentSerializer(payment).data
        return Response(
            api_response(
                success=True,
                message="Payment submitted successfully and is under review",
                data=payment_data,
            ),
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Payments retrieved successfully",
                data=serializer.data,
            )
        )


class PaymentDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update payment"""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return PaymentUpdateSerializer
        return PaymentSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            # Admins can see all payments
            return Payment.objects.all()
        else:
            # Users can only see their own payments
            return Payment.objects.filter(user=user)

    def retrieve(self, request, *args, **kwargs):
        payment = self.get_object()
        serializer = PaymentSerializer(payment)
        return Response(
            api_response(
                success=True,
                message="Payment details retrieved successfully",
                data=serializer.data,
            )
        )

    def update(self, request, *args, **kwargs):
        payment = self.get_object()

        # Only admins can update payment status
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Only admins can update payment status"
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(payment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        old_status = payment.status
        payment = serializer.save()

        # Handle status changes
        if old_status != payment.status:
            if payment.status == "approved":
                payment.approve_payment()

                # Create notification
                Notification.create_notification(
                    user=payment.user,
                    title="Payment Approved",
                    message=f"Your payment of {payment.amount} ETB has been approved.",
                    notification_type="payment_approved",
                    related_payment=payment,
                )

            elif payment.status == "rejected":
                # Create notification
                Notification.create_notification(
                    user=payment.user,
                    title="Payment Rejected",
                    message=f"Your payment of {payment.amount} ETB has been rejected.",
                    notification_type="payment_rejected",
                    related_payment=payment,
                )

        return Response(
            api_response(
                success=True,
                message=f"Payment status updated to {payment.status}",
                data=PaymentSerializer(payment).data,
            )
        )
