from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification
from apps.verification.models import VerificationDocument
from apps.payments.models import Payment


User = get_user_model()


def notify_admins(title: str, message: str, notification_type: str, **kwargs):
    admins = User.objects.filter(role="admin")
    for admin in admins:
        Notification.create_notification(
          user=admin,
          title=title,
          message=message,
          notification_type=notification_type,
          **kwargs,
        )


@receiver(post_save, sender=User)
def notify_admin_on_signup(sender, instance, created, **kwargs):
    if not created:
        return
    title = "New User Registered"
    message = f"{instance.full_name} signed up as {instance.role}."
    notify_admins(title, message, "system")


@receiver(post_save, sender=VerificationDocument)
def notify_admin_on_document_upload(sender, instance, created, **kwargs):
    if created:
        title = "New Document Submitted"
        message = f"{instance.user.full_name} submitted {instance.document_type}."
        notify_admins(
          title,
          message,
          "system",
          related_document=instance,
        )


@receiver(post_save, sender=Payment)
def notify_admin_on_payment(sender, instance, created, **kwargs):
    if not created:
        return
    title = "New Payment Submitted"
    amount_display = f"{instance.amount}".rstrip("0").rstrip(".") if instance.amount else ""
    message = (
      f"{instance.user.full_name} submitted a payment"
      f"{f' of {amount_display}' if amount_display else ''}."
    )
    notify_admins(
      title,
      message,
      "system",
      related_payment=instance,
    )

