from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator


class UserManager(BaseUserManager):
    """Custom user manager for User model"""

    def _create_user(self, email, password, **extra_fields):
        """Create and save a user with the given email and password."""
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        username = extra_fields.pop("username", None) or email
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        """Create a regular user"""
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create a superuser"""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model for cargo bidding system"""

    # Remove username uniqueness requirement; use email instead
    username = models.CharField(max_length=150, unique=False, blank=True, null=True)

    ROLE_CHOICES = [
        ("shipper", "Shipper"),
        ("carrier", "Carrier"),
        ("admin", "Admin"),
    ]

    # Basic user information
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r"^\+?1?\d{9,15}$",
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
            )
        ],
    )

    # Role and status
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="shipper")
    is_verified = models.BooleanField(default=False)
    is_payment_confirmed = models.BooleanField(default=False)

    # Address information
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    street = models.CharField(max_length=255, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)

    # Carrier specific fields
    company_name = models.CharField(max_length=255, blank=True)
    carrier_type = models.CharField(
        max_length=20,
        choices=[
            ("company", "Company"),
            ("plc", "PLC"),
            ("truck_owner", "Truck Owner"),
        ],
        blank=True,
    )
    number_of_trucks = models.PositiveIntegerField(default=0)
    truck_libreh_number = models.CharField(max_length=100, blank=True)
    truck_tin_number = models.CharField(max_length=100, blank=True)

    # Rating information
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_ratings = models.PositiveIntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as username field
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "phone"]

    objects = UserManager()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.role}"

    def update_rating(self):
        """Update average rating and total ratings count"""
        from apps.ratings.models import Rating

        # Get all ratings received by this user (as ratee)
        ratings_received = Rating.objects.filter(ratee=self)
        if ratings_received.exists():
            self.total_ratings = ratings_received.count()
            self.average_rating = (
                ratings_received.aggregate(models.Avg("score"))["score__avg"] or 0.00
            )
        else:
            self.total_ratings = 0
            self.average_rating = 0.00

        self.save(update_fields=["average_rating", "total_ratings"])

    @property
    def is_shipper(self):
        return self.role == "shipper"

    @property
    def is_carrier(self):
        return self.role == "carrier"

    @property
    def is_admin(self):
        return self.role == "admin"
