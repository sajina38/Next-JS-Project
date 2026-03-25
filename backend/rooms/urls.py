from django.urls import path

from . import views

urlpatterns = [
    path('rooms/', views.room_list, name='room-list'),
    path('rooms/<int:pk>/', views.room_detail, name='room-detail'),
    path('admin/rooms/', views.AdminRoomListCreateView.as_view(), name='admin-room-list-create'),
    path('admin/rooms/<int:pk>/', views.AdminRoomDetailView.as_view(), name='admin-room-detail'),
]
