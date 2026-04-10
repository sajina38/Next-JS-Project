"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";

interface RoomData {
  id: number;
  room_number: string;
  room_type: string;
  name: string;
  price: string;
  image: string | null;
}

const COUNTRIES = [
  "Nepal", "India", "China", "United States", "United Kingdom", "Australia",
  "Canada", "Germany", "France", "Japan", "South Korea", "Thailand",
  "Sri Lanka", "Bangladesh", "Pakistan", "Malaysia", "Singapore",
  "Indonesia", "Philippines", "Vietnam", "Other",
];

type PaymentOption = "pay-at-checkin" | "khalti";

/** Same markup as <Suspense> fallback — avoids Next.js hydration mismatch (searchParams + auth). */
function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
    </div>
  );
}

function formatBookingError(err: unknown): string {
  const ax = err as { response?: { data?: unknown }; message?: string };
  const data = ax.response?.data;
  if (data === undefined || data === null) {
    return ax.message || "Booking failed. Please try again.";
  }
  if (typeof data === "string") return data;
  if (typeof data !== "object") return "Booking failed. Please try again.";

  const o = data as Record<string, unknown>;
  if (typeof o.error === "string") return o.error;

  const detail = o.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((item) =>
      typeof item === "string" ? item : JSON.stringify(item),
    );
    const joined = parts.join(" ").trim();
    if (joined) return joined;
  }

  const fieldMsgs: string[] = [];
  for (const [key, val] of Object.entries(o)) {
    if (key === "error" || key === "detail") continue;
    if (typeof val === "string") fieldMsgs.push(`${key}: ${val}`);
    else if (Array.isArray(val) && val.length) fieldMsgs.push(`${key}: ${val.map(String).join(", ")}`);
  }
  if (fieldMsgs.length) return fieldMsgs.join(" ");

  return "Booking failed. Please try again.";
}

function ConfirmBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  const roomId = searchParams.get("room");
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const guestsParam = searchParams.get("guests") || "1";

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);

  // Guest Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Nepal");
  const [adults, setAdults] = useState(Number(guestsParam));
  const [children, setChildren] = useState(0);

  // Arrival Info
  const [arrivalHour, setArrivalHour] = useState("02");
  const [arrivalMinute, setArrivalMinute] = useState("00");
  const [arrivalPeriod, setArrivalPeriod] = useState<"PM" | "AM">("PM");
  const [specialRequests, setSpecialRequests] = useState("");

  // ID Upload
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);

  // Payment
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("pay-at-checkin");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setFullName(user.username || "");
      setEmail(user.email || "");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!roomId) return;
    api
      .get(`/rooms/${roomId}/`)
      .then((res) => {
        setRoom(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [roomId]);

  const handleIdPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdPhoto(file);
      setIdPreview(URL.createObjectURL(file));
    }
  };

  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const pricePerNight = room ? parseFloat(room.price) : 0;
  const totalPrice = nights * pricePerNight;

  const get24HourTime = () => {
    let h = parseInt(arrivalHour);
    if (arrivalPeriod === "PM" && h !== 12) h += 12;
    if (arrivalPeriod === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${arrivalMinute}`;
  };

  const handleSubmit = async () => {
    setError("");
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!adults) {
      setError("Please enter the number of adults.");
      return;
    }
    if (!arrivalHour || !arrivalMinute) {
      setError("Please select your estimated arrival time.");
      return;
    }
    if (!idPhoto) {
      setError("Please upload a valid ID (citizenship, passport, or government-issued ID).");
      return;
    }
    if (!paymentOption) {
      setError("Please select a payment option.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("room", roomId!);
      formData.append("check_in", checkIn);
      formData.append("check_out", checkOut);
      formData.append("guests", String(adults + children));
      formData.append("adults", String(adults));
      formData.append("children", String(children));
      formData.append("guest_name", fullName);
      formData.append("guest_email", email);
      formData.append("guest_phone", phone);
      formData.append("guest_country", country);
      formData.append("arrival_time", get24HourTime());
      formData.append("special_requests", specialRequests);
      formData.append("payment_method", paymentOption);
      if (idPhoto) {
        formData.append("id_photo", idPhoto);
      }

      const { data: booking } = await api.post("/bookings/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (paymentOption === "khalti") {
        const { data: khalti } = await api.post("/payments/khalti/initiate/", {
          booking_id: booking.id,
        });
        window.location.href = khalti.payment_url;
        return;
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(formatBookingError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent";
  const labelClass =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  if (!clientReady || authLoading || !user) {
    return <FullPageSpinner />;
  }

  if (!roomId || (!loading && !room)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid Booking</h2>
          <p className="text-gray-500 mb-6">Missing room information.</p>
          <Link href="/rooms" className="text-emerald-700 font-medium hover:underline">
            Browse Rooms
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h2>
          <p className="text-gray-500 mb-8">
            Your reservation is pending confirmation. We&apos;ll get back to you shortly.
          </p>
          <Link
            href="/rooms"
            className="px-6 py-3 bg-emerald-700 text-white rounded-full font-medium hover:bg-emerald-800 transition-colors"
          >
            Browse More Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h1>
        <p className="text-gray-500 mb-10">Please fill in the details below to complete your reservation.</p>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. Guest Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Guest Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+977 9800000000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClass}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Number of Adults <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className={inputClass}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Adult" : "Adults"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Number of Children</label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className={inputClass}
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Child" : "Children"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Arrival Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Arrival Information</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    Estimated Arrival Time <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={arrivalHour}
                      onChange={(e) => setArrivalHour(e.target.value)}
                      className="p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent w-20"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-gray-400 font-bold text-lg">:</span>
                    <select
                      value={arrivalMinute}
                      onChange={(e) => setArrivalMinute(e.target.value)}
                      className="p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent w-20"
                    >
                      {["00", "15", "30", "45"].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={arrivalPeriod}
                      onChange={(e) => setArrivalPeriod(e.target.value as "AM" | "PM")}
                      className="p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent w-20"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or preferences..."
                    rows={3}
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>
            </div>

            {/* 3. Identity Verification */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Identity Verification <span className="text-red-400">*</span>
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Upload a photo of your citizenship card, passport, or any valid government-issued ID.
              </p>
              <label className="block cursor-pointer">
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    idPreview
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
                  }`}
                >
                  {idPreview ? (
                    <div className="space-y-3">
                      <img
                        src={idPreview}
                        alt="ID Preview"
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                      <p className="text-sm text-emerald-700 font-medium">{idPhoto?.name}</p>
                      <p className="text-xs text-gray-400">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg
                        className="w-10 h-10 text-gray-400 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">Click to upload your ID</p>
                      <p className="text-xs text-gray-400">JPG, PNG or PDF up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleIdPhoto}
                  className="hidden"
                />
              </label>
            </div>

            {/* 4. Payment Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Payment Options <span className="text-red-400">*</span>
              </h2>
              <p className="text-gray-500 text-sm mb-5">Choose how you&apos;d like to pay for your stay.</p>

              <div className="space-y-3">
                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentOption === "pay-at-checkin"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentOption === "pay-at-checkin"}
                    onChange={() => setPaymentOption("pay-at-checkin")}
                    className="mt-0.5 accent-emerald-700"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Pay at check-in</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Settle the full balance at the front desk when you arrive. No advance payment is required.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentOption === "khalti"
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentOption === "khalti"}
                    onChange={() => setPaymentOption("khalti")}
                    className="mt-0.5 accent-emerald-700"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Pay online with Khalti</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Complete your payment securely through Khalti before arrival. You will be redirected to their
                      checkout to confirm the transaction, then returned to our site.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-emerald-700 text-white py-4 rounded-full font-semibold text-base hover:bg-emerald-800 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Confirm Booking"}
            </button>
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {room?.image && (
                <img
                  src={room.image}
                  alt={room?.name}
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{room?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {room?.room_type} &middot; Room {room?.room_number}
                  </p>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-medium text-gray-900">{checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-medium text-gray-900">{checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nights</span>
                    <span className="font-medium text-gray-900">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guests</span>
                    <span className="font-medium text-gray-900">
                      {adults} {adults === 1 ? "Adult" : "Adults"}
                      {children > 0 && `, ${children} ${children === 1 ? "Child" : "Children"}`}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Rs. {pricePerNight.toLocaleString()} x {nights} night{nights !== 1 ? "s" : ""}
                    </span>
                    <span className="font-medium text-gray-900">
                      Rs. {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-emerald-700">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {paymentOption === "pay-at-checkin"
                      ? "Payment at check-in"
                      : "Online payment via Khalti"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmBookingPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <ConfirmBookingContent />
    </Suspense>
  );
}
