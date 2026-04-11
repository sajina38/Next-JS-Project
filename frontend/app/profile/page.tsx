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
  "checked-in": "bg-sky-50 text-sky-800 border border-sky-100",
  "checked-out": "bg-violet-50 text-violet-800 border border-violet-100",
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

type Tab = "personal" | "security" | "bookings";

function ProfileBookingsTab({
  bookings,
  loadingBookings,
  onCancelBooking,
}: {
  bookings: Booking[];
  loadingBookings: boolean;
  onCancelBooking: (id: number) => void;
}) {
  const [openId, setOpenId] = useState<number | null>(null);

  const active = bookings.filter(
    (b) =>
      b.status === "pending" ||
      b.status === "confirmed" ||
      b.status === "checked-in"
  );
  const history = bookings.filter((b) => b.status === "checked-out");
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
                className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  STATUS_STYLES[b.status] || "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {b.status.replace(/-/g, " ")}
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
                    onClick={() => onCancelBooking(b.id)}
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
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Booking</h4>
                <div className="grid gap-8 sm:grid-cols-2">
                  <DetailField
                    label="Reservation status"
                    value={<span className="capitalize">{b.status.replace(/-/g, " ")}</span>}
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

  return (
    <div className="w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My bookings</h1>
          
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
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 px-8 text-center">
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
            title="Booking History"
            description="Stays after check-out day are marked completed automatically."
            list={history}
          />
          <BookingSection title="Cancelled" description="Reservations you cancelled." list={cancelled} />
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
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${id}/`, { status: "cancelled" });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch {
      alert("Failed to cancel booking.");
    }
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar with hotel info */}
      <div className="w-full bg-white border-b border-gray-100 px-6 py-2 flex items-center justify-between shrink-0">
        <Link href="/">
          <Image src="/logo.png" alt="Urban Boutique Hotel" width={48} height={48} className="object-contain" />
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 text-emerald-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.274 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
          </svg>
          Baidam Road Lakeside, Khahare, Hallanchowk, 33700 Pokhara, Nepal
        </div>
      </div>

      <div className="flex flex-1">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-[260px] shrink-0 sticky top-[52px] h-[calc(100vh-52px)] border-r border-gray-100 bg-white">
        <div className="flex flex-col items-center pt-10 pb-8 px-6">
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

      {/* ── Mobile Nav ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
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
              className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-colors border ${
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

      {/* ── Main Content ── */}
      <main className="flex-1 min-h-screen pt-28 md:pt-0 bg-white">
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
                    <section className="rounded-2xl border border-gray-100 bg-gray-50/50 px-5 sm:px-8 py-6 sm:py-8">
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

                    <section className="rounded-2xl border border-gray-100 bg-gray-50/50 px-5 sm:px-8 py-6 sm:py-8">
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

                    <section className="rounded-2xl border border-gray-100 bg-gray-50/50 px-5 sm:px-8 py-6 sm:py-8">
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

                    <section className="rounded-2xl border border-gray-100 bg-gray-50/50 px-5 sm:px-8 py-6 sm:py-8">
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
                    <section className="rounded-2xl border border-gray-100 bg-gray-50/50 px-5 sm:px-8 py-6 sm:py-8">
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

                    <section className="rounded-2xl border border-gray-100 bg-gray-50/50 px-5 sm:px-8 py-6 sm:py-8">
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

                    <section className="rounded-2xl border border-gray-100 bg-gray-50/50 px-5 sm:px-8 py-6 sm:py-8">
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
                <div className="rounded-2xl bg-gray-50 p-6 sm:p-7 flex flex-col">
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

                <div className="rounded-2xl bg-gray-50 p-6 sm:p-7 flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-700 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Password</h2>
                  <p className="text-lg font-medium tracking-[0.25em] text-gray-800 mb-5">••••••••</p>
                  <button
                    type="button"
                    className="mt-auto inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-emerald-800 bg-emerald-100/80 hover:bg-emerald-100 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    Reset password
                  </button>
                </div>

                <div className="rounded-2xl bg-gray-50 p-6 sm:p-7 flex flex-col lg:col-span-1">
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
            />
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
