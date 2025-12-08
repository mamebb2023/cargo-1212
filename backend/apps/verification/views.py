from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import VerificationDocument
from .serializers import (
    VerificationDocumentSerializer,
    VerificationDocumentCreateSerializer,
    VerificationDocumentListSerializer,
    VerificationDocumentUpdateSerializer,
)
from apps.notifications.models import Notification
from utils.response import api_response


class VerificationDocumentListCreateView(generics.ListCreateAPIView):
    """List and create verification documents"""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return VerificationDocumentCreateSerializer
        return VerificationDocumentListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            # Admins see all documents
            return VerificationDocument.objects.all().order_by("-created_at")
        else:
            # Users see their own documents
            return VerificationDocument.objects.filter(user=user).order_by(
                "-created_at"
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = serializer.save()

        # Create notification for the user
        Notification.create_notification(
            user=document.user,
            title="Document Submitted",
            message=f"Your {document.document_type} document has been submitted and is under review.",
            notification_type="system",
            related_document=document,
        )

        document_data = VerificationDocumentSerializer(document).data
        return Response(
            api_response(
                success=True,
                message="Document submitted successfully and is under review",
                data=document_data,
            ),
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Verification documents retrieved successfully",
                data=serializer.data,
            )
        )


class VerificationDocumentDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update verification document"""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return VerificationDocumentUpdateSerializer
        return VerificationDocumentSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            # Admins can see all documents
            return VerificationDocument.objects.all()
        else:
            # Users can only see their own documents
            return VerificationDocument.objects.filter(user=user)

    def retrieve(self, request, *args, **kwargs):
        document = self.get_object()
        serializer = VerificationDocumentSerializer(document)
        return Response(
            api_response(
                success=True,
                message="Document details retrieved successfully",
                data=serializer.data,
            )
        )

    def update(self, request, *args, **kwargs):
        document = self.get_object()

        # Only admins can update document status
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Only admins can update document status"
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(document, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        old_status = document.status
        document = serializer.save()

        # Handle status changes
        if old_status != document.status:
            if document.status == "approved":
                document.approve_document(request.user)

                # Create notification
                Notification.create_notification(
                    user=document.user,
                    title="Document Approved",
                    message=f"Your {document.document_type} document has been approved.",
                    notification_type="document_approved",
                    related_document=document,
                )

            elif document.status == "rejected":
                # Create notification
                Notification.create_notification(
                    user=document.user,
                    title="Document Rejected",
                    message=f"Your {document.document_type} document has been rejected. Reason: {document.rejection_reason}",
                    notification_type="document_rejected",
                    related_document=document,
                )

        return Response(
            api_response(
                success=True,
                message=f"Document status updated to {document.status}",
                data=VerificationDocumentSerializer(document).data,
            )
        )
