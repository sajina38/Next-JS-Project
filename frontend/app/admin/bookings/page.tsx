"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "checked-in"
  | "checked-out";

interface BookingRow {
  id: number;
  user: number;
  username: string;
  room: number;
  room_number: string;
  room_name: string;
  room_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  adults: number;
  children: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  status: BookingStatus;
  created_at: string;
}

interface AdminRoomOption {
  id: number;
  room_number: string;
  room_type: string;
  name: string;
  room_status: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border border-amber-100",
  confirmed: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  cancelled: "bg-stone-100 text-stone-600 border border-stone-200",
  "checked-in": "bg-sky-50 text-sky-800 border border-sky-100",
  "checked-out": "bg-violet-50 text-violet-800 border border-violet-100",
};

const STATUS_OPTIONS: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "checked-in",
  "checked-out",
];

function statusLabel(s: BookingStatus): string {
  return s.replace(/-/g, " ");
}

/** Suggested next steps; for terminal states, list all other statuses for corrections. */
function actionsForBooking(b: BookingRow): { status: BookingStatus; label: string }[] {
  const s = b.status;
  if (s === "pending") {
    return [
      { status: "confirmed", label: "Confirm" },
      { status: "checked-in", label: "Check-in" },
      { status: "cancelled", label: "Cancel" },
    ];
  }
  if (s === "confirmed") {
    return [
      { status: "checked-in", label: "Check-in" },
      { status: "cancelled", label: "Cancel" },
    ];
  }
  if (s === "checked-in") {
    return [{ status: "checked-out", label: "Check-out" }];
  }
  return STATUS_OPTIONS.filter((st) => st !== s).map((st) => ({
    status: st,
    label: `→ ${statusLabel(st)}`,
  }));
}

function BookingRowActions({
  booking,
  onApplyStatus,
  onEdit,
  onDelete,
  busy,
}: {
  booking: BookingRow;
  onApplyStatus: (id: number, status: BookingStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [choice, setChoice] = useState("");
  const actions = useMemo(() => actionsForBooking(booking), [booking]);

  useEffect(() => {
    setChoice("");
  }, [booking.id, booking.status]);

  return (
    <div className="flex flex-nowrap items-center gap-1.5 min-w-0">
      <select
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
        disabled={busy}
        title="Booking action"
        className="w-24 shrink-0 px-1 py-1 rounded-md border border-stone-200 text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600"
      >
        <option value="">Action…</option>
        {actions.map((a) => (
          <option key={a.label} value={a.status}>
            {a.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!choice || busy}
        onClick={() => {
          if (!choice) return;
          onApplyStatus(booking.id, choice as BookingStatus);
          setChoice("");
        }}
        className="shrink-0 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none"
      >
        {busy ? "…" : "Apply"}
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 px-2 py-1 rounded-md text-xs font-medium border border-stone-200 text-stone-700 hover:bg-stone-50 whitespace-nowrap"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 px-2 py-1 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 whitespace-nowrap"
      >
        Delete
      </button>
    </div>
  );
}

function formatApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null && "detail" in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === "string") return d;
  }
  const parts: string[] = [];
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (Array.isArray(v)) parts.push(`${k}: ${v.join(" ")}`);
    else if (typeof v === "string") parts.push(`${k}: ${v}`);
    else if (v && typeof v === "object") parts.push(`${k}: ${JSON.stringify(v)}`);
  }
  return parts.length ? parts.join("\n") : fallback;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [rooms, setRooms] = useState<AdminRoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modal, setModal] = useState<BookingRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/bookings/"), api.get("/admin/rooms/")])
      .then(([bRes, rRes]) => {
        setBookings(bRes.data);
        setRooms(rRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshRooms = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/rooms/");
      setRooms(data);
    } catch {
      /* ignore */
    }
  }, []);

  const filtered = useMemo(() => {
    let list = bookings;
    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          String(b.id).includes(q) ||
          (b.guest_name && b.guest_name.toLowerCase().includes(q)) ||
          b.username.toLowerCase().includes(q) ||
          b.room_number.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [bookings, search, statusFilter]);

  async function patchBooking(id: number, payload: Record<string, unknown>) {
    setApplyingId(id);
    try {
      const { data } = await api.patch(`/bookings/${id}/`, payload);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
      setModal((m) => (m && m.id === id ? { ...m, ...data } : m));
      void refreshRooms();
    } catch (e) {
      alert(formatApiError(e, "Could not update booking."));
    } finally {
      setApplyingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Permanently delete this booking?")) return;
    try {
      await api.delete(`/bookings/${id}/`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setModal((m) => (m?.id === id ? null : m));
    } catch {
      alert("Could not delete booking.");
    }
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal) return;
    const fd = new FormData(e.currentTarget);
    const roomId = parseInt(String(fd.get("room")), 10);
    setSaving(true);
    try {
      const { data } = await api.patch(`/bookings/${modal.id}/`, {
        status: fd.get("status"),
        room: roomId,
        check_in: fd.get("check_in"),
        check_out: fd.get("check_out"),
        guests: parseInt(String(fd.get("guests")), 10) || 1,
        adults: parseInt(String(fd.get("adults")), 10) || 1,
        children: parseInt(String(fd.get("children")), 10) || 0,
        guest_name: String(fd.get("guest_name") || ""),
        guest_email: String(fd.get("guest_email") || ""),
        guest_phone: String(fd.get("guest_phone") || ""),
      });
      setBookings((prev) => prev.map((b) => (b.id === modal.id ? { ...b, ...data } : b)));
      setModal(null);
      void refreshRooms();
    } catch (e) {
      alert(formatApiError(e, "Could not save. Check room is available and dates are valid."));
    } finally {
      setSaving(false);
    }
  }

  function guestLabel(b: BookingRow) {
    const g = (b.guest_name || "").trim();
    if (g) return g;
    return b.username;
  }

  const roomChoicesForEdit = (b: BookingRow) =>
    rooms.filter((r) => r.room_status === "available" || r.id === b.room);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Bookings</h1>
          <p className="text-stone-500 mt-1 text-sm">Manage reservations, check-in/out, and room assignment</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search by ID, guest, user, or room…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 lg:w-52"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/-/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700">All bookings ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Guest</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Dates</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/80 align-top">
                    <td className="px-4 py-3.5 font-mono text-stone-700">#{b.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-stone-900">{guestLabel(b)}</p>
                      <p className="text-xs text-stone-500">{b.username}</p>
                    </td>
                    <td className="px-4 py-3.5 text-stone-700">
                      <span className="font-medium">{b.room_number}</span>
                      <span className="text-stone-500 text-xs block">{b.room_type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-stone-700 tabular-nums whitespace-nowrap">
                      {b.check_in} → {b.check_out}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${
                          STATUS_BADGE[b.status] || "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {b.status.replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <BookingRowActions
                        booking={b}
                        busy={applyingId === b.id}
                        onApplyStatus={(id, status) => void patchBooking(id, { status })}
                        onEdit={() => setModal(b)}
                        onDelete={() => handleDelete(b.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Edit booking #{modal.id}</h3>
            <p className="text-sm text-stone-500 mb-4">Assign room (must be available), dates, and status.</p>
            <form onSubmit={saveEdit} className="space-y-3">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Status</label>
              <select
                name="status"
                defaultValue={modal.status}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/-/g, " ")}
                  </option>
                ))}
              </select>

              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Room</label>
              <select
                name="room"
                defaultValue={modal.room}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                {roomChoicesForEdit(modal).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_number} — {r.room_type}
                    {r.id === modal.room ? " (current)" : ""}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    name="check_in"
                    defaultValue={modal.check_in}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    name="check_out"
                    defaultValue={modal.check_out}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Guests</label>
                  <input
                    type="number"
                    name="guests"
                    min={1}
                    defaultValue={modal.guests}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Adults</label>
                  <input
                    type="number"
                    name="adults"
                    min={1}
                    defaultValue={modal.adults}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Children</label>
                  <input
                    type="number"
                    name="children"
                    min={0}
                    defaultValue={modal.children}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <input
                name="guest_name"
                placeholder="Guest name"
                defaultValue={modal.guest_name}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                name="guest_email"
                type="email"
                placeholder="Guest email"
                defaultValue={modal.guest_email}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                name="guest_phone"
                placeholder="Guest phone"
                defaultValue={modal.guest_phone}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
