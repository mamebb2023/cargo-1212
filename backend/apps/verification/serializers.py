from rest_framework import serializers
from .models import VerificationDocument
from apps.users.serializers import UserSerializer


class VerificationDocumentSerializer(serializers.ModelSerializer):
    """Serializer for VerificationDocument model"""

    user = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = VerificationDocument
        fields = [
            'id', 'user', 'document_type', 'file', 'file_url', 'status',
            'rejection_reason', 'reviewed_by', 'reviewed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class VerificationDocumentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating verification documents"""

    class Meta:
        model = VerificationDocument
        fields = ['document_type', 'file']

    def validate_document_type(self, value):
        # Check if document type is valid for user's role
        user = self.context['request'].user
        valid_types = self._get_valid_document_types_for_user(user)

        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid document type '{value}' for {user.role}")

        return value

    def validate(self, data):
        user = self.context['request'].user
        document_type = data['document_type']

        # Check if document already exists and is approved
        existing_doc = VerificationDocument.objects.filter(
            user=user,
            document_type=document_type
        ).first()

        if existing_doc and existing_doc.status == 'approved':
            raise serializers.ValidationError(f"You already have an approved {document_type} document")

        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def _get_valid_document_types_for_user(self, user):
        """Get valid document types for user's role"""
        if user.role == 'shipper':
            return [
                'business_license',
                'tax_clearance',
                'company_registration',
                'identity_document'
            ]
        elif user.role == 'carrier':
            if user.carrier_type == 'company':
                return [
                    'company_business_registration',
                    'company_business_license',
                    'company_competency_certificate',
                    'company_tax_clearance',
                    'company_vat_certificate'
                ]
            elif user.carrier_type == 'plc':
                return [
                    'plc_registration',
                    'plc_business_license',
                    'plc_competency_certificate',
                    'plc_tax_clearance',
                    'plc_vat_certificate'
                ]
            elif user.carrier_type == 'truck_owner':
                return ['truck_business_licence']
        return []


class VerificationDocumentListSerializer(serializers.ModelSerializer):
    """Serializer for verification document list view"""

    class Meta:
        model = VerificationDocument
        fields = [
            'id', 'document_type', 'status', 'reviewed_at', 'created_at'
        ]


class VerificationDocumentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating verification document status (admin only)"""

    class Meta:
        model = VerificationDocument
        fields = ['status', 'rejection_reason']

    def validate_status(self, value):
        valid_statuses = ['pending', 'approved', 'rejected']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value

    def validate(self, data):
        if data.get('status') == 'rejected' and not data.get('rejection_reason'):
            raise serializers.ValidationError("Rejection reason is required when rejecting a document")
        return data
