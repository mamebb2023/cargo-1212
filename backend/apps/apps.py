from django.apps import AppConfig


class AdminPanelConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.admin_panel"


class BidsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.bids"


class NotificationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.notifications"


class OffersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.offers"


class PaymentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.payments"


class RatingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.ratings"


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.users"


class VerificationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.verification"
