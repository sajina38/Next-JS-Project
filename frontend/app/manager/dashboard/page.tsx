"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Metrics {
  total_customers: number;
  total_bookings: number;
  total_rooms: number;
}

interface RecentBooking {
  id: number;
  guest_display: string;
  room_number: string;
  check_in: string;
  status: string;
  created_at: string;
}

interface RoomRow {
  id: number;
  room_number: string;
  room_type: string;
  name: string;
  price: string;
  status: string;
}

const BOOKING_STATUS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-stone-100 text-stone-600",
  "checked-in": "bg-sky-50 text-sky-800",
  "checked-out": "bg-violet-50 text-violet-800",
};

const ROOM_STATUS_BADGE: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-800",
  occupied: "bg-rose-50 text-rose-700",
  cleaning: "bg-amber-50 text-amber-800",
  maintenance: "bg-slate-100 text-slate-700",
};

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || "Manager";

  const [data, setData] = useState<{
    metrics: Metrics;
    recent_bookings: RecentBooking[];
    rooms_status: RoomRow[];
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get("/manager/dashboard/")
      .then((res) => setData(res.data))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-stone-500 mt-1 text-sm md:text-base">
          Welcome, {displayName}!
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-6">Could not load dashboard data.</p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <MetricCard
              label="Total Customers"
              value={data.metrics.total_customers}
              iconBg="bg-emerald-100"
              icon={
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
                </svg>
              }
            />
            <MetricCard
              label="Total Bookings"
              value={data.metrics.total_bookings}
              iconBg="bg-violet-100"
              icon={
                <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              }
            />
            <MetricCard
              label="Total Rooms"
              value={data.metrics.total_rooms}
              iconBg="bg-orange-100"
              icon={
                <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-900">Recent Bookings</h2>
              </div>
              <ul className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto">
                {data.recent_bookings.length === 0 ? (
                  <li className="px-5 py-8 text-center text-stone-400 text-sm">No bookings yet</li>
                ) : (
                  data.recent_bookings.map((b) => (
                    <li key={b.id} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900 truncate">{b.guest_display}</p>
                        <p className="text-sm text-stone-500">
                          Room {b.room_number} · {b.check_in}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${
                          BOOKING_STATUS[b.status] || "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {b.status.replace(/-/g, " ")}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-900">Room status</h2>
              </div>
              <ul className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto">
                {data.rooms_status.length === 0 ? (
                  <li className="px-5 py-8 text-center text-stone-400 text-sm">No rooms</li>
                ) : (
                  data.rooms_status.map((r) => (
                    <li key={r.id} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900">Room {r.room_number}</p>
                        <p className="text-sm text-stone-500">
                          {r.room_type}
                          {r.name ? ` · ${r.name}` : ""} · NPR {r.price}/night
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${
                          ROOM_STATUS_BADGE[r.status] || "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {r.status.replace(/-/g, " ")}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </>
      )}

      {!data && !error && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-stone-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-stone-900 mt-1 tabular-nums">{value}</p>
      </div>
      <div className={`p-2.5 rounded-lg ${iconBg}`}>{icon}</div>
    </div>
  );
}
