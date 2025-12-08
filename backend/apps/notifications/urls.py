from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('mark-all-read/', views.mark_all_as_read_view, name='mark-all-read'),
    path('unread-count/', views.unread_count_view, name='unread-count'),
]
