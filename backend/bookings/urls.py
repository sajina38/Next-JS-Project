from django.urls import path

from . import views

urlpatterns = [
    path("bookings/", views.BookingListCreateView.as_view(), name="booking-list-create"),
    path("bookings/my-bookings/", views.MyBookingsView.as_view(), name="my-bookings"),
    path("admin/booking-customers/", views.StaffCustomerListView.as_view(), name="staff-booking-customers"),
    path(
        "admin/booking-customers/create/",
        views.StaffCustomerCreateView.as_view(),
        name="staff-booking-customer-create",
    ),
    path("admin/bookings/create/", views.StaffBookingCreateView.as_view(), name="staff-booking-create"),
    path("bookings/<int:pk>/", views.BookingDetailView.as_view(), name="booking-detail"),
]
