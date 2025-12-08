from django.db import models
from django.conf import settings


class VerificationDocument(models.Model):
    """Verification document model for user verification"""

    DOCUMENT_TYPE_CHOICES = [
        # Shipper documents
        ('business_license', 'Business License'),
        ('tax_clearance', 'Tax Clearance Certificate'),
        ('company_registration', 'Company Registration Document'),
        ('identity_document', 'Identity Document'),

        # Carrier company documents
        ('company_business_registration', 'Company Business Registration Doc'),
        ('company_business_license', 'Company Business License Doc'),
        ('company_competency_certificate', 'Company Competency Certificate Doc'),
        ('company_tax_clearance', 'Company Tax Clearance Doc'),
        ('company_vat_certificate', 'Company VAT Certificate Doc'),

        # Carrier PLC documents
        ('plc_registration', 'PLC Registration Doc'),
        ('plc_business_license', 'PLC Business License Doc'),
        ('plc_competency_certificate', 'PLC Competency Certificate Doc'),
        ('plc_tax_clearance', 'PLC Tax Clearance Doc'),
        ('plc_vat_certificate', 'PLC VAT Certificate Doc'),

        # Carrier truck owner documents
        ('truck_business_licence', 'Truck Business Licence'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='verification_documents'
    )

    # Document details
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(
        upload_to='user_documents/',
        help_text="Verification document file"
    )

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    # Reviewer (admin who reviewed)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_documents',
        limit_choices_to={'role': 'admin'}
    )

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'document_type']  # One document type per user

    def __str__(self):
        return f"{self.document_type} for {self.user.full_name}"

    def approve_document(self, admin_user):
        """Approve the document"""
        self.status = 'approved'
        self.reviewed_by = admin_user
        self.reviewed_at = models.functions.Now()
        self.save()

        # Check if all required documents are approved
        self._check_user_verification_status()

    def reject_document(self, admin_user, reason=""):
        """Reject the document"""
        self.status = 'rejected'
        self.rejection_reason = reason
        self.reviewed_by = admin_user
        self.reviewed_at = models.functions.Now()
        self.save()

    def _check_user_verification_status(self):
        """Check if user has all required documents approved"""
        required_docs = self._get_required_documents_for_user()

        # Get all user's documents
        user_docs = VerificationDocument.objects.filter(user=self.user)

        # Check if all required documents are approved
        approved_docs = set(user_docs.filter(status='approved').values_list('document_type', flat=True))

        if set(required_docs).issubset(approved_docs):
            self.user.is_verified = True
            self.user.save()

    def _get_required_documents_for_user(self):
        """Get list of required documents based on user role and type"""
        user = self.user

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
