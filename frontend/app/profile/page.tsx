"use client";

import { useState, useEffect } from "react";
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
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_LABELS: Record<string, string> = {
  prepay: "Pre-payment (Bank Transfer)",
  "pay-at-checkin": "Pay at Check-in",
  "bank-card": "Bank Card on Arrival",
};

type Tab = "personal" | "security" | "bookings";

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
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile/", form);
      setProfile(data);
      setEditing(false);
    } catch {
      /* keep form open */
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar with hotel info */}
      <div className="w-full bg-stone-100 border-b border-stone-200 px-6 py-2 flex items-center justify-between shrink-0">
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
      <aside className="hidden md:flex flex-col w-[260px] bg-emerald-950 shrink-0 sticky top-[52px] h-[calc(100vh-52px)]">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center pt-10 pb-8 px-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-white/15 text-white flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
              </svg>
            </div>
          </div>
          <p className="font-bold text-white text-base">{displayName}</p>
          <p className="text-emerald-300/60 text-xs mt-0.5 capitalize">{p?.role || user.role}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white border-l-[3px] border-emerald-400"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5 border-l-[3px] border-transparent"
                }`}
              >
                <span className={active ? "text-emerald-400" : "text-white/30"}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-8">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Nav ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-emerald-950 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm font-bold text-white">{displayName}</span>
          </div>
          <button
            onClick={logout}
            className="text-xs font-semibold text-red-400 hover:text-red-300"
          >
            Log Out
          </button>
        </div>
        <div className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                activeTab === item.key
                  ? "bg-white/15 text-white"
                  : "text-white/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 min-h-screen pt-28 md:pt-0">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 md:py-14">

          {/* ═══ PERSONAL INFORMATION TAB ═══ */}
          {activeTab === "personal" && (
            <>
              {loadingProfile ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
                </div>
              ) : !editing ? (
                <>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                      Personal Information
                    </h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-700 text-white text-sm font-medium rounded-full hover:bg-emerald-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                      </svg>
                      Edit Profile
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-full px-5 py-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">First Name</p>
                        <p className="text-sm font-medium text-gray-900">{p?.first_name || "—"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-full px-5 py-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Last Name</p>
                        <p className="text-sm font-medium text-gray-900">{p?.last_name || "—"}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-full px-5 py-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-gray-900">{p?.email || "—"}</p>
                    </div>

                    <div className="bg-gray-50 rounded-full px-5 py-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {p?.phone_number || <span className="text-gray-300 italic">Not set</span>}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-full px-5 py-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-900">
                          {p?.date_of_birth
                            ? new Date(p.date_of_birth + "T00:00:00").toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : <span className="text-gray-300 italic">Not set</span>}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-full px-5 py-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Gender</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {p?.gender || <span className="text-gray-300 italic">Not set</span>}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-full px-5 py-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Country</p>
                      <p className="text-sm font-medium text-gray-900">
                        {p?.country || <span className="text-gray-300 italic">Not set</span>}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-full px-5 py-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Member Since</p>
                      <p className="text-sm font-medium text-gray-900">
                        {p?.date_joined
                          ? new Date(p.date_joined).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* ── Editing Form ── */
                <>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
                    Personal Information
                  </h1>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1 pl-4">First Name</label>
                        <input
                          value={form.first_name}
                          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                          className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1 pl-4">Last Name</label>
                        <input
                          value={form.last_name}
                          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                          className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-500 mb-1 pl-4">Email</label>
                      <input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1 pl-4">Phone Number</label>
                        <input
                          value={form.phone_number}
                          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                          placeholder="+977 980-0000000"
                          className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1 pl-4">Date of Birth</label>
                        <input
                          type="date"
                          value={form.date_of_birth}
                          onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                          className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1 pl-4">Gender</label>
                        <select
                          value={form.gender}
                          onChange={(e) => setForm({ ...form, gender: e.target.value })}
                          className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1 pl-4">Country</label>
                        <select
                          value={form.country}
                          onChange={(e) => setForm({ ...form, country: e.target.value })}
                          className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={resetForm}
                        className="px-6 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 rounded-full text-sm font-medium bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Changes"}
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
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-8 pb-4 border-b border-gray-100">
                Login &amp; Password
              </h1>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="bg-gray-50 rounded-full px-5 py-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Username</p>
                  <p className="text-sm font-medium text-gray-900">{p?.username || "—"}</p>
                </div>

                <div className="bg-gray-50 rounded-full px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Current Password</p>
                    <p className="text-base tracking-[0.3em] text-gray-900">••••••••</p>
                  </div>
                  <button className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-white hover:border-gray-300 transition-colors">
                    Reset Password
                  </button>
                </div>

                <div className="bg-gray-50 rounded-full px-5 py-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{p?.email || "—"}</p>
                    {p?.email && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ BOOKINGS TAB ═══ */}
          {activeTab === "bookings" && (() => {
            const active = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
            const history = bookings.filter((b) => b.status !== "pending" && b.status !== "confirmed" && b.status !== "cancelled");
            const cancelled = bookings.filter((b) => b.status === "cancelled");

            function BookingCard({ b, showCancel }: { b: Booking; showCancel?: boolean }) {
              return (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{b.room_name}</h3>
                      <p className="text-sm text-gray-500">
                        {b.room_type} &middot; Room {b.room_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          STATUS_STYLES[b.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {b.status}
                      </span>
                      {showCancel && (
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Check-in</p>
                      <p className="font-medium text-gray-900">{b.check_in}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Check-out</p>
                      <p className="font-medium text-gray-900">{b.check_out}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Guests</p>
                      <p className="font-medium text-gray-900">
                        {b.adults} {b.adults === 1 ? "Adult" : "Adults"}
                        {b.children > 0 && `, ${b.children} ${b.children === 1 ? "Child" : "Children"}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Payment</p>
                      <p className="font-medium text-gray-900">
                        {PAYMENT_LABELS[b.payment_method] || b.payment_method}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
                  <Link
                    href="/rooms"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-700 text-white text-sm font-medium rounded-full hover:bg-emerald-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Book a Room
                  </Link>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  {loadingBookings ? (
                    <div className="flex justify-center py-16">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-400 mb-5 text-sm">
                        You haven&apos;t made any bookings yet.
                      </p>
                      <Link
                        href="/rooms"
                        className="inline-block px-6 py-2.5 bg-emerald-700 text-white rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors"
                      >
                        Browse Rooms
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Active Bookings */}
                      <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                          Active Bookings
                        </h2>
                        {active.length === 0 ? (
                          <p className="text-sm text-gray-400 italic py-3">None</p>
                        ) : (
                          <div className="space-y-3">
                            {active.map((b) => (
                              <BookingCard key={b.id} b={b} showCancel />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Booking History */}
                      <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                          Booking History
                        </h2>
                        {history.length === 0 ? (
                          <p className="text-sm text-gray-400 italic py-3">None</p>
                        ) : (
                          <div className="space-y-3">
                            {history.map((b) => (
                              <BookingCard key={b.id} b={b} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Cancelled Bookings */}
                      <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                          Cancelled Bookings
                        </h2>
                        {cancelled.length === 0 ? (
                          <p className="text-sm text-gray-400 italic py-3">None</p>
                        ) : (
                          <div className="space-y-3">
                            {cancelled.map((b) => (
                              <BookingCard key={b.id} b={b} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </main>
      </div>
    </div>
  );
}
