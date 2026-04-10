"""
Khalti ePayment (KPG-2) — sandbox test flow only.

Docs: https://docs.khalti.com/khalti-epayment/
"""

import requests
from django.conf import settings
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from bookings.serializers import BookingSerializer

# Khalti minimum amount is 1000 paisa (Rs. 10)
KHALTI_MIN_PAISA = 1000


def _khalti_auth_header():
    # Docs show both "Key" and "key"; Khalti accepts the secret with this prefix.
    return f"Key {settings.KHALTI_SECRET_KEY}"


def _post_khalti(path_suffix: str, payload: dict):
    url = f"{settings.KHALTI_API_URL}{path_suffix}"
    headers = {
        "Authorization": _khalti_auth_header(),
        "Content-Type": "application/json",
    }
    return requests.post(url, json=payload, headers=headers, timeout=30)


def _booking_amount_paisa(booking: Booking) -> int:
    return int(round(float(booking.total_amount) * 100))


class KhaltiConfigView(APIView):
    """Public key for frontend (optional; redirect checkout does not require it on the client)."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"public_key": settings.KHALTI_PUBLIC_KEY or None})


class KhaltiInitiateView(APIView):
    """Start a Khalti payment: returns payment_url to redirect the browser."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not settings.KHALTI_SECRET_KEY:
            return Response(
                {"error": "Khalti is not configured (set KHALTI_SECRET_KEY on the server)."},
                status=503,
            )

        booking_id = request.data.get("booking_id")
        if not booking_id:
            return Response({"error": "booking_id is required."}, status=400)

        try:
            booking = Booking.objects.select_related("room", "user").get(
                pk=int(booking_id), user=request.user
            )
        except (Booking.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Booking not found."}, status=404)

        if booking.payment_method != Booking.PaymentMethod.KHALTI:
            return Response(
                {"error": "This booking does not use Khalti payment."},
                status=400,
            )
        if booking.payment_status == Booking.PaymentStatus.PAID:
            return Response({"error": "This booking is already marked as paid."}, status=400)

        amount_paisa = _booking_amount_paisa(booking)
        if amount_paisa < KHALTI_MIN_PAISA:
            return Response(
                {
                    "error": "Khalti requires at least Rs. 10 (1000 paisa). "
                    "Pick more nights or a higher-priced room for a test payment."
                },
                status=400,
            )

        purchase_order_id = f"booking-{booking.id}"
        return_url = (
            f"{settings.FRONTEND_URL}/booking/khalti/return"
            f"?booking_id={booking.id}"
        )

        payload = {
            "return_url": return_url,
            "website_url": settings.FRONTEND_URL,
            "amount": amount_paisa,
            "purchase_order_id": purchase_order_id,
            "purchase_order_name": f"Hotel booking #{booking.id}",
            "customer_info": {
                "name": (booking.guest_name or request.user.username)[:120],
                "email": (booking.guest_email or request.user.email or "")[:120],
                "phone": (booking.guest_phone or "9800000000").replace(" ", "")[:20],
            },
        }

        try:
            khalti_res = _post_khalti("/epayment/initiate/", payload)
        except requests.RequestException:
            return Response(
                {"error": "Could not reach Khalti. Check your network and try again."},
                status=502,
            )

        body = khalti_res.json() if khalti_res.content else {}
        payment_url = body.get("payment_url")
        if not payment_url and isinstance(body.get("data"), dict):
            payment_url = body["data"].get("payment_url")

        if khalti_res.status_code >= 400 or not payment_url:
            err = body.get("detail") or body.get("error_key") or "Khalti rejected the request."
            return Response({"error": str(err), "khalti": body}, status=400)

        return Response(
            {
                "payment_url": payment_url,
                "pidx": body.get("pidx") or (body.get("data") or {}).get("pidx"),
            }
        )


class KhaltiVerifyView(APIView):
    """After Khalti redirects back, confirm payment with Khalti lookup and mark booking paid."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not settings.KHALTI_SECRET_KEY:
            return Response(
                {"error": "Khalti is not configured (set KHALTI_SECRET_KEY on the server)."},
                status=503,
            )

        pidx = request.data.get("pidx")
        booking_id = request.data.get("booking_id")
        if not pidx or not booking_id:
            return Response({"error": "pidx and booking_id are required."}, status=400)

        try:
            booking = Booking.objects.select_related("room", "user").get(
                pk=int(booking_id), user=request.user
            )
        except (Booking.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Booking not found."}, status=404)

        if booking.payment_status == Booking.PaymentStatus.PAID:
            return Response(
                {
                    "ok": True,
                    "already_paid": True,
                    "booking": BookingSerializer(booking).data,
                }
            )

        try:
            khalti_res = _post_khalti("/epayment/lookup/", {"pidx": pidx})
        except requests.RequestException:
            return Response(
                {"error": "Could not reach Khalti. Try again in a moment."},
                status=502,
            )

        body = khalti_res.json() if khalti_res.content else {}
        if khalti_res.status_code >= 400:
            err = body.get("detail") or body.get("error_key") or "Lookup failed."
            return Response({"error": str(err), "khalti": body}, status=400)

        status_val = body.get("status")
        total_raw = body.get("total_amount")
        if total_raw is None and isinstance(body.get("data"), dict):
            inner = body["data"]
            status_val = status_val or inner.get("status")
            total_raw = inner.get("total_amount")

        expected = _booking_amount_paisa(booking)
        try:
            paid_paisa = int(float(str(total_raw)))
        except (TypeError, ValueError):
            paid_paisa = 0

        if status_val != "Completed":
            return Response(
                {
                    "ok": False,
                    "status": status_val,
                    "message": "Payment was not completed.",
                },
                status=200,
            )

        if paid_paisa != expected:
            return Response(
                {"error": "Paid amount does not match this booking. Do not confirm; contact support."},
                status=400,
            )

        po = body.get("purchase_order_id")
        if po is None and isinstance(body.get("data"), dict):
            po = body["data"].get("purchase_order_id")
        if po and str(po) != f"booking-{booking.id}":
            return Response({"error": "Order id mismatch."}, status=400)

        booking.payment_status = Booking.PaymentStatus.PAID
        booking.save(update_fields=["payment_status"])

        return Response({"ok": True, "booking": BookingSerializer(booking).data})
