from django.urls import path

from . import views

urlpatterns = [
    path('rooms/', views.room_list, name='room-list'),
    path('rooms/<int:pk>/', views.room_detail, name='room-detail'),
    path('admin/hotel-settings/', views.AdminHotelSettingsView.as_view(), name='admin-hotel-settings'),
    path('admin/rooms/', views.AdminRoomListCreateView.as_view(), name='admin-room-list-create'),
    path('admin/rooms/<int:pk>/', views.AdminRoomDetailView.as_view(), name='admin-room-detail'),
]
