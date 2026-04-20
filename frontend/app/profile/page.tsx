"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";

interface Booking {
  id: number;
  room_name: string;
  room_number: string;
  room_type: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  guests: number;
  payment_method: string;
  payment_status?: string;
  total_amount?: string;
  loyalty_points_redeemed?: number;
  loyalty_breakfast_card?: boolean;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_country?: string;
  arrival_time?: string | null;
  special_requests?: string;
  status: string;
  created_at: string;
}

interface ProfileData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string | null;
  country: string;
  gender: string;
  role: string;
  loyalty_cards: number;
  loyalty_stays_count?: number;
  loyalty_stays_until_next_card?: number | null;
  date_joined: string;
}

const COUNTRIES = [
  "Nepal", "India", "China", "United States", "United Kingdom", "Australia",
  "Canada", "Germany", "France", "Japan", "South Korea", "Thailand",
  "Malaysia", "Singapore", "Bangladesh", "Sri Lanka", "Pakistan",
  "Brazil", "Italy", "Spain", "Netherlands", "Switzerland", "Sweden",
  "Norway", "Denmark", "New Zealand", "South Africa", "UAE", "Other",
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border border-amber-100",
  confirmed: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  cancelled: "bg-red-50 text-red-700 border border-red-100",
  checkout: "bg-violet-50 text-violet-800 border border-violet-100",
};

const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pending payment / confirmation",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  checkout: "Stay completed",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
};

const PAYMENT_LABELS: Record<string, string> = {
  prepay: "Pre-payment (Bank Transfer)",
  "pay-at-checkin": "Pay at Check-in",
  "bank-card": "Bank Card on Arrival",
  khalti: "Online payment (Khalti)",
};

type Tab = "personal" | "loyalty" | "security" | "bookings";

function ProfileBookingsTab({
  bookings,
  loadingBookings,
  onCancelBooking,
  loyaltyCards,
}: {
  bookings: Booking[];
  loadingBookings: boolean;
  onCancelBooking: (id: number) => Promise<void>;
  loyaltyCards?: number;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [cancelDialogId, setCancelDialogId] = useState<number | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelDialogError, setCancelDialogError] = useState("");

  const active = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const history = bookings.filter((b) => b.status === "checkout");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  function formatMoney(amount: string | undefined) {
    if (amount == null || amount === "") return "—";
    const n = parseFloat(amount);
    if (Number.isNaN(n)) return amount;
    return `Rs. ${n.toLocaleString()}`;
  }

  function formatDateTime(iso: string) {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  }

  function DetailField({ label, value }: { label: string; value: ReactNode }) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <div className="text-sm text-gray-900 leading-snug">{value}</div>
      </div>
    );
  }

  function BookingRow({ b, showCancel }: { b: Booking; showCancel?: boolean }) {
    const open = openId === b.id;
    const canCancel =
      showCancel &&
      (b.status === "pending" || b.status === "confirmed");

    return (
      <article className="rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight leading-snug">
                {b.room_name}
              </h3>
              <p className="text-sm text-gray-500">
                {b.room_type} · Room {b.room_number}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end lg:flex-col lg:items-end lg:shrink-0">
              <span
                className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                  STATUS_STYLES[b.status] || "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {BOOKING_STATUS_LABELS[b.status] || b.status.replace(/-/g, " ")}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : b.id)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  {open ? "Hide details" : "View details"}
                </button>
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelDialogError("");
                      setCancelDialogId(b.id);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Cancel booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {open && (
          <div className="border-t border-gray-100 bg-gray-50/60 px-6 sm:px-8 py-8">
            <div className="space-y-8 max-w-4xl">
              <section>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Your stay</h4>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailField label="Check-in" value={b.check_in} />
                  <DetailField label="Check-out" value={b.check_out} />
                  <DetailField
                    label="Guests"
                    value={
                      <>
                        {b.adults} {b.adults === 1 ? "adult" : "adults"}
                        {b.children > 0
                          ? `, ${b.children} ${b.children === 1 ? "child" : "children"}`
                          : ""}
                        <span className="text-gray-500"> ({b.guests} total)</span>
                      </>
                    }
                  />
                  <DetailField
                    label="Arrival time"
                    value={b.arrival_time || "—"}
                  />
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Payment</h4>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Method"
                    value={PAYMENT_LABELS[b.payment_method] || b.payment_method}
                  />
                  <DetailField
                    label="Payment status"
                    value={
                      b.payment_status
                        ? PAYMENT_STATUS_LABELS[b.payment_status] || b.payment_status
                        : "—"
                    }
                  />
                  <DetailField label="Total" value={formatMoney(b.total_amount)} />
                  {b.loyalty_breakfast_card ? (
                    <DetailField
                      label="Breakfast loyalty"
                      value="Complimentary breakfast card applied for this stay"
                    />
                  ) : null}
                  {(b.loyalty_points_redeemed ?? 0) > 0 && !b.loyalty_breakfast_card ? (
                    <DetailField
                      label="Legacy loyalty"
                      value={`${b.loyalty_points_redeemed} (historical booking credit)`}
                    />
                  ) : null}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Booking</h4>
                <div className="grid gap-8 sm:grid-cols-2">
                  <DetailField
                    label="Reservation status"
                    value={
                      <span>{BOOKING_STATUS_LABELS[b.status] || b.status.replace(/-/g, " ")}</span>
                    }
                  />
                  <DetailField label="Booked on" value={formatDateTime(b.created_at)} />
                </div>
              </section>

              {(b.guest_name || b.guest_email || b.guest_phone || b.guest_country) && (
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Guest on reservation
                  </h4>
                  <div className="grid gap-8 sm:grid-cols-2">
                    {b.guest_name && <DetailField label="Name" value={b.guest_name} />}
                    {b.guest_email && <DetailField label="Email" value={b.guest_email} />}
                    {b.guest_phone && <DetailField label="Phone" value={b.guest_phone} />}
                    {b.guest_country && <DetailField label="Country" value={b.guest_country} />}
                  </div>
                </section>
              )}

              {b.special_requests?.trim() && (
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Special requests
                  </h4>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-w-2xl">
                    {b.special_requests}
                  </p>
                </section>
              )}
            </div>
          </div>
        )}
      </article>
    );
  }

  function BookingSection({
    title,
    description,
    list,
    showCancel,
  }: {
    title: string;
    description?: string;
    list: Booking[];
    showCancel?: boolean;
  }) {
    return (
      <section className="mb-14 last:mb-0">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {list.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 px-1">No bookings in this list.</p>
        ) : (
          <ul className="space-y-5 list-none p-0 m-0">
            {list.map((b) => (
              <li key={b.id}>
                <BookingRow b={b} showCancel={showCancel} />
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  const cancelTarget = cancelDialogId != null ? bookings.find((x) => x.id === cancelDialogId) : null;

  async function confirmCancelBooking() {
    if (cancelDialogId == null) return;
    setCancelDialogError("");
    setCancelBusy(true);
    try {
      await onCancelBooking(cancelDialogId);
      setCancelDialogId(null);
    } catch {
      setCancelDialogError("Could not cancel. Please try again.");
    } finally {
      setCancelBusy(false);
    }
  }

  return (
    <div className="w-full relative">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My bookings</h1>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold text-emerald-800 tabular-nums">{loyaltyCards ?? 0}</span> breakfast{" "}
            {(loyaltyCards ?? 0) === 1 ? "card" : "cards"}
            <span className="text-gray-400"> · </span>
            Open <span className="font-medium text-gray-800">Loyalty</span> in the sidebar for rules and progress.
          </p>
        </div>
        <Link
          href="/rooms"
          className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Book a room
        </Link>
      </header>

      {loadingBookings ? (
        <div className="flex justify-center py-24">
          <div className="w-9 h-9 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/80 py-16 px-8 text-center shadow-sm">
          <p className="text-gray-600 mb-6">You have not made any bookings yet.</p>
          <Link
            href="/rooms"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
          >
            Browse rooms
          </Link>
        </div>
      ) : (
        <div>
          <BookingSection
            title="Active"
            description="Upcoming and in-house stays. Cancel online only while status is pending or confirmed."
            list={active}
            showCancel
          />
          <BookingSection
            title="Booking history"
            description="Completed stays (checkout recorded by the hotel after your visit)."
            list={history}
          />
          <BookingSection title="Cancelled" description="Reservations you cancelled." list={cancelled} />
        </div>
      )}

      {cancelDialogId != null && cancelTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
          onClick={() => {
            if (!cancelBusy) {
              setCancelDialogId(null);
              setCancelDialogError("");
            }
          }}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cancel-booking-title" className="text-lg font-semibold text-gray-900">
              Cancel this booking?
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {cancelTarget.room_name} · {cancelTarget.check_in} → {cancelTarget.check_out}
            </p>
            {cancelDialogError && (
              <p className="text-sm text-red-600 mt-3 bg-red-50 rounded-lg px-3 py-2">{cancelDialogError}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                disabled={cancelBusy}
                onClick={() => {
                  setCancelDialogId(null);
                  setCancelDialogError("");
                }}
                className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm font-medium text-gray-700 hover:bg-stone-50 disabled:opacity-50"
              >
                Keep booking
              </button>
              <button
                type="button"
                disabled={cancelBusy}
                onClick={() => void confirmCancelBooking()}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {cancelBusy ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    country: "",
    gender: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState<"change" | "email">("change");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetWarning, setResetWarning] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [showPwdOld, setShowPwdOld] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdNew2, setShowPwdNew2] = useState(false);

  function openPasswordModal() {
    setPasswordModalOpen(true);
    setPasswordModalMode("change");
    setResetEmail(profile?.email?.trim() || "");
    setResetSent(false);
    setResetError("");
    setResetWarning("");
    setOldPassword("");
    setNewPassword("");
    setNewPassword2("");
    setChangeError("");
    setShowPwdOld(false);
    setShowPwdNew(false);
    setShowPwdNew2(false);
  }

  function closePasswordModal() {
    setPasswordModalOpen(false);
    setResetSent(false);
    setResetError("");
    setResetWarning("");
    setChangeError("");
    setShowPwdOld(false);
    setShowPwdNew(false);
    setShowPwdNew2(false);
  }

  async function submitPasswordResetEmail(e: React.FormEvent) {
    e.preventDefault();
    setResetError("");
    setResetWarning("");
    setResetLoading(true);
    try {
      const { data } = await api.post<{ detail?: string; warning?: string }>("/auth/password-reset/", {
        email: resetEmail.trim(),
      });
      setResetSent(true);
      if (data?.warning) setResetWarning(data.warning);
    } catch {
      setResetError("Something went wrong. Please try again in a moment.");
    } finally {
      setResetLoading(false);
    }
  }

  async function submitChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangeError("");
    if (newPassword !== newPassword2) {
      setChangeError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setChangeError("New password must be at least 6 characters.");
      return;
    }
    setChangeLoading(true);
    try {
      await api.post("/auth/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPassword2,
      });
      closePasswordModal();
      await logout();
      router.push("/login");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: Record<string, string[] | string> } };
      const d = ax.response?.data;
      if (d && typeof d === "object") {
        if (typeof d.detail === "string") {
          setChangeError(d.detail);
          return;
        }
        if (Array.isArray(d.new_password)) {
          setChangeError(d.new_password.join(" "));
          return;
        }
      }
      setChangeError("Could not update password. Check your current password and try again.");
    } finally {
      setChangeLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/auth/profile/")
      .then((res) => {
        setProfile(res.data);
        setForm({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || "",
          phone_number: res.data.phone_number || "",
          date_of_birth: res.data.date_of_birth || "",
          country: res.data.country || "",
          gender: res.data.gender || "",
        });
      })
      .finally(() => setLoadingProfile(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/bookings/my-bookings/")
      .then((res) => setBookings(res.data))
      .finally(() => setLoadingBookings(false));
  }, [user]);

  async function cancelBooking(id: number) {
    await api.patch(`/bookings/${id}/`, { status: "cancelled" });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
  }

  function resetForm() {
    if (profile) {
      setForm({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone_number: profile.phone_number,
        date_of_birth: profile.date_of_birth || "",
        country: profile.country || "",
        gender: profile.gender || "",
      });
    }
    setEditing(false);
  }

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      // Empty date must be null — API rejects "" ("Date has wrong format")
      const payload = {
        ...form,
        date_of_birth: form.date_of_birth?.trim() ? form.date_of_birth : null,
      };
      const { data } = await api.put("/auth/profile/", payload);
      setProfile(data);
      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        date_of_birth: data.date_of_birth || "",
        country: data.country || "",
        gender: data.gender || "",
      });
      setEditing(false);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: Record<string, unknown> } };
      const d = ax.response?.data;
      let msg = "Could not save. Please check your details and try again.";
      if (d && typeof d === "object") {
        if (typeof d.detail === "string") msg = d.detail;
        else {
          const parts: string[] = [];
          for (const [k, v] of Object.entries(d)) {
            if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
            else if (typeof v === "string") parts.push(`${k}: ${v}`);
          }
          if (parts.length) msg = parts.join(" ");
        }
      }
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
      </div>
    );
  }

  const p = profile;
  const displayName =
    p?.first_name && p?.last_name
      ? `${p.first_name} ${p.last_name}`
      : p?.username || user.username || "Guest";
  const initials =
    p?.first_name && p?.last_name
      ? `${p.first_name[0]}${p.last_name[0]}`
      : (displayName || "U").slice(0, 2).toUpperCase();

  const NAV_ITEMS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "personal",
      label: "Personal Information",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
    {
      key: "loyalty",
      label: "Loyalty",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      ),
    },
    {
      key: "security",
      label: "Login & Password",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
    },
    {
      key: "bookings",
      label: "Bookings",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex font-[var(--font-inter)]">
      <div className="flex flex-1 min-h-0 w-full min-w-0">
      {/* ── Desktop Sidebar (admin-style: branding in sidebar, full height) ── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-stone-200 bg-white">
        <div className="p-5 border-b border-stone-100">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Urban Boutique Hotel" width={44} height={44} className="object-contain" />
            <div>
              <p className="text-sm font-bold text-stone-900 leading-tight">Urban Boutique Hotel</p>
            </div>
          </Link>
        </div>
        <div className="flex flex-col items-center pt-8 pb-6 px-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-200 text-gray-800 flex items-center justify-center text-xl font-bold">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-md border-2 border-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
              </svg>
            </div>
          </div>
          <p className="font-bold text-gray-900 text-base text-center">{displayName}</p>
          <p className="text-gray-500 text-xs mt-0.5 capitalize">{p?.role || user.role}</p>
        </div>

        <nav className="flex-1 px-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 border ${
                  active
                    ? "bg-gray-50 text-gray-900 border-gray-200"
                    : "text-gray-600 border-transparent hover:bg-gray-50/80 hover:border-gray-100"
                }`}
              >
                <span className={active ? "text-emerald-700" : "text-gray-400"}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-8">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Nav (branding strip like admin shell, no separate top bar) ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-stone-200 shadow-sm">
        <div className="px-4 py-2.5 border-b border-stone-100">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <Image src="/logo.png" alt="Urban Boutique Hotel" width={36} height={36} className="object-contain shrink-0" />
            <p className="text-xs font-bold text-stone-900 leading-tight truncate">Urban Boutique Hotel</p>
          </Link>
        </div>
        <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 text-gray-800 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm font-bold text-gray-900 truncate max-w-[55vw]">{displayName}</span>
          </div>
          <button
            onClick={logout}
            className="text-xs font-semibold text-red-600 hover:text-red-700 shrink-0"
          >
            Log Out
          </button>
        </div>
        <div className="flex gap-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex-1 py-2 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-colors border leading-tight ${
                activeTab === item.key
                  ? "bg-gray-50 text-gray-900 border-gray-200"
                  : "text-gray-500 border-transparent hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* ── Main Content (same light gray as admin dashboard; nav bars stay white) ── */}
      <main className="flex-1 min-h-screen pt-[9.5rem] md:pt-0 bg-stone-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 md:py-14">

          {/* ═══ PERSONAL INFORMATION TAB ═══ */}
          {activeTab === "personal" && (
            <>
              {loadingProfile ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
                </div>
              ) : !editing ? (
                <>
                  <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-serif">
                        Personal information
                      </h1>
                      <p className="text-sm text-gray-500 mt-2 max-w-xl">
                        How your name and contact details appear on bookings and hotel communications.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSaveError("");
                        setEditing(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                      </svg>
                      Edit profile
                    </button>
                  </header>

                  <div className="space-y-6">
                    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Name</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <p className="block text-sm font-medium text-gray-500 mb-2">First name</p>
                          <div className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm min-h-[46px] flex items-center">
                            {p?.first_name || <span className="text-gray-400 normal-case">Not set</span>}
                          
                          </div>
                        </div>
                        <div>
                          <p className="block text-sm font-medium text-gray-500 mb-2">Last name</p>
                          <div className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm min-h-[46px] flex items-center">
                            {p?.last_name || <span className="text-gray-400 normal-case">Not set</span>}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Contact</h2>
                      <div className="grid grid-cols-1 gap-5 max-w-2xl">
                        <div>
                          <p className="block text-sm font-medium text-gray-500 mb-2">Email</p>
                          <div className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm min-h-[46px] flex items-center break-all">
                            {p?.email || "—"}
                          </div>
                        </div>
                        <div className="sm:max-w-md">
                          <p className="block text-sm font-medium text-gray-500 mb-2">Phone number</p>
                          <div className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm min-h-[46px] flex items-center">
                            {p?.phone_number || <span className="text-gray-400">Not set</span>}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Profile</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <p className="block text-sm font-medium text-gray-500 mb-2">Date of birth</p>
                          <div className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm min-h-[46px] flex items-center">
                            {p?.date_of_birth
                              ? new Date(p.date_of_birth + "T00:00:00").toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : <span className="text-gray-400">Not set</span>}
                          </div>
                        </div>
                        <div>
                          <p className="block text-sm font-medium text-gray-500 mb-2">Gender</p>
                          <div className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm min-h-[46px] flex items-center capitalize">
                            {p?.gender || <span className="text-gray-400 normal-case">Not set</span>}
                          </div>
                        </div>
                        <div className="sm:col-span-2 max-w-xl">
                          <p className="block text-sm font-medium text-gray-500 mb-2">Country</p>
                          <div className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm min-h-[46px] flex items-center">
                            {p?.country || <span className="text-gray-400">Not set</span>}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Account</h2>
                      <div className="max-w-xl">
                        <p className="block text-sm font-medium text-gray-500 mb-2">Member since</p>
                        <div className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm min-h-[46px] flex items-center">
                          {p?.date_joined
                            ? new Date(p.date_joined).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
                        </div>
                      </div>
                    </section>
                  </div>
                </>
              ) : (
                <>
                  <header className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-serif">
                      Edit personal information
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">Changes apply to your account immediately after you save.</p>
                  </header>

                  <div className="space-y-6">
                    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Name</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">First name</label>
                          <input
                            value={form.first_name}
                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/35 transition-shadow"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Last name</label>
                          <input
                            value={form.last_name}
                            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/35 transition-shadow"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Contact</h2>
                      <div className="grid grid-cols-1 gap-5 max-w-2xl">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
                          <input
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/35 transition-shadow"
                          />
                        </div>
                        <div className="sm:max-w-md">
                          <label className="block text-sm font-medium text-gray-500 mb-2">Phone number</label>
                          <input
                            value={form.phone_number}
                            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                            placeholder="+977 980-0000000"
                            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/35 transition-shadow"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Profile</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Date of birth</label>
                          <input
                            type="date"
                            value={form.date_of_birth}
                            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/35 transition-shadow"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Gender</label>
                          <select
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/35 transition-shadow"
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 max-w-xl">
                          <label className="block text-sm font-medium text-gray-500 mb-2">Country</label>
                          <select
                            value={form.country}
                            onChange={(e) => setForm({ ...form, country: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-white ring-1 ring-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/35 transition-shadow"
                          >
                            <option value="">Select country</option>
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </section>

                    {saveError && (
                      <div
                        className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-100"
                        role="alert"
                      >
                        {saveError}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSaveError("");
                          resetForm();
                        }}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 shadow-sm transition-colors"
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ═══ LOYALTY TAB ═══ */}
          {activeTab === "loyalty" && (
            <>
              {loadingProfile ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <header className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-serif">
                      Loyalty rewards
                    </h1>
                    <p className="text-sm text-gray-500 mt-2 max-w-xl">
                      Breakfast cards from completed stays—earn one card per five qualifying stays, use one when you
                      book for complimentary breakfast at the hotel.
                    </p>
                  </header>

                  <div className="space-y-6">
                    <section className="rounded-2xl border border-emerald-200/80 bg-white shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                        Your breakfast cards
                      </h2>
                      <p className="text-3xl font-bold text-emerald-800 tabular-nums">
                        {p?.loyalty_cards ?? 0}{" "}
                        <span className="text-lg font-semibold text-gray-600">
                          {(p?.loyalty_cards ?? 0) === 1 ? "card" : "cards"}
                        </span>
                      </p>
                      {p?.loyalty_stays_count != null && p?.loyalty_stays_until_next_card != null ? (
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                          <span className="font-semibold text-gray-800 tabular-nums">{p.loyalty_stays_count}</span>{" "}
                          qualifying stay{p.loyalty_stays_count === 1 ? "" : "s"} recorded · next card after{" "}
                          <span className="font-semibold tabular-nums">{p.loyalty_stays_until_next_card}</span> more.
                        </p>
                      ) : null}
                    </section>

                    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Rules</h2>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                        Every five stays that reach confirmed or checkout earn one card. Tick “use breakfast card” on
                        the booking form to redeem; your room price stays the same—breakfast is honored at the hotel.
                      </p>
                    </section>

                    <Link
                      href="/loyalty"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                    >
                      Read the full loyalty program
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}

          {/* ═══ LOGIN & PASSWORD TAB ═══ */}
          {activeTab === "security" && (
            <>
              <header className="mb-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Login &amp; security
                </h1>
                <p className="text-sm text-gray-500 mt-2 max-w-xl">
                  Sign-in identity and the email we use for booking confirmations. Password resets are handled securely
                  by the hotel system.
                </p>
              </header>

              <div className="flex flex-col gap-5 max-w-2xl">
                <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6 sm:p-7 flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-700 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Username</h2>
                  <p className="text-lg font-semibold text-gray-900 break-all">{p?.username || "—"}</p>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    Used when you sign in to the website.
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6 sm:p-7 flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-700 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Password</h2>
                  <p className="text-lg font-medium tracking-[0.25em] text-gray-800 mb-5">••••••••</p>
                  <button
                    type="button"
                    onClick={openPasswordModal}
                    className="mt-auto inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-emerald-800 bg-emerald-100/80 hover:bg-emerald-100 rounded-lg transition-colors w-full sm:w-fit"
                  >
                    Reset password
                  </button>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6 sm:p-7 flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-700 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Email</h2>
                  <p className="text-base font-semibold text-gray-900 break-all">{p?.email || "—"}</p>
                  {p?.email && (
                    <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                    Booking confirmations and receipts are sent here.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ═══ BOOKINGS TAB ═══ */}
          {activeTab === "bookings" && (
            <ProfileBookingsTab
              bookings={bookings}
              loadingBookings={loadingBookings}
              onCancelBooking={cancelBooking}
              loyaltyCards={profile?.loyalty_cards}
            />
          )}
        </div>
      </main>
      </div>

      {passwordModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !changeLoading && !resetLoading) closePasswordModal();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 border border-stone-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePasswordModal}
              className="absolute top-4 right-4 p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 id="password-modal-title" className="text-xl font-bold text-gray-900 pr-10 mb-1">
              Reset password
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Update your password here, or get a reset link by email if you forgot it.
            </p>

            <div className="flex rounded-lg border border-stone-200 p-0.5 mb-5 bg-stone-50">
              <button
                type="button"
                onClick={() => {
                  setPasswordModalMode("change");
                  setChangeError("");
                  setResetError("");
                  setShowPwdOld(false);
                  setShowPwdNew(false);
                  setShowPwdNew2(false);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                  passwordModalMode === "change"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                New password
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordModalMode("email");
                  setChangeError("");
                  setResetError("");
                  setResetSent(false);
                  setResetWarning("");
                  setShowPwdOld(false);
                  setShowPwdNew(false);
                  setShowPwdNew2(false);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                  passwordModalMode === "email"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Email link
              </button>
            </div>

            {passwordModalMode === "change" ? (
              <form onSubmit={submitChangePassword} className="space-y-4">
                {changeError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {changeError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      type={showPwdOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-3 pr-11 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdOld((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      aria-label={showPwdOld ? "Hide current password" : "Show current password"}
                    >
                      {showPwdOld ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m13.772 13.772 3 3M9.88 9.88l-3-3m7.532 7.532 3 3M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPwdNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full pl-3 pr-11 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdNew((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      aria-label={showPwdNew ? "Hide new password" : "Show new password"}
                    >
                      {showPwdNew ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m13.772 13.772 3 3M9.88 9.88l-3-3m7.532 7.532 3 3M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={showPwdNew2 ? "text" : "password"}
                      value={newPassword2}
                      onChange={(e) => setNewPassword2(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full pl-3 pr-11 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdNew2((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      aria-label={showPwdNew2 ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showPwdNew2 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m13.772 13.772 3 3M9.88 9.88l-3-3m7.532 7.532 3 3M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={changeLoading}
                  className="w-full py-3 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {changeLoading ? "Updating…" : "Update password"}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  After a successful change you will be signed out and can log in with your new password.
                </p>
              </form>
            ) : resetSent ? (
              <div className="space-y-4">
                <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-3">
                  If an account exists for that address, reset instructions were sent. Use the link in the email to
                  choose a new password, then sign in again.
                </div>
                {resetWarning ? (
                  <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
                    {resetWarning}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="w-full py-3 rounded-lg border border-stone-200 text-sm font-semibold text-stone-800 hover:bg-stone-50"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submitPasswordResetEmail} className="space-y-4">
                {resetError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {resetError}
                  </div>
                )}
                <p className="text-xs text-gray-500 -mt-1">
                  Use the same email as on your account. We will send a secure link to set a new password.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {resetLoading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
