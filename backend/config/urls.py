"""
URL configuration for cargo bidding system project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/verification/', include('apps.verification.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/bids/', include('apps.bids.urls')),
    path('api/offers/', include('apps.offers.urls')),
    path('api/ratings/', include('apps.ratings.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/admin/', include('apps.admin_panel.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
