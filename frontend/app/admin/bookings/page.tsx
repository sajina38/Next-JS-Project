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

interface CustomerOption {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

const PAYMENT_METHOD_OPTIONS = [
  { value: "pay-at-checkin", label: "Pay at check-in" },
  { value: "prepay", label: "Pre-payment (bank transfer)" },
  { value: "bank-card", label: "Bank card on arrival" },
  { value: "khalti", label: "Online payment (Khalti)" },
] as const;

const emptyAddForm = {
  user: "",
  room: "",
  check_in: "",
  check_out: "",
  guests: "1",
  adults: "1",
  children: "0",
  guest_name: "",
  guest_email: "",
  guest_phone: "",
  guest_country: "Nepal",
  payment_method: "pay-at-checkin",
  special_requests: "",
};

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
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modal, setModal] = useState<BookingRow | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...emptyAddForm });
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [addCustomerForm, setAddCustomerForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
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

  const loadCustomersForAdd = useCallback(async () => {
    try {
      const { data } = await api.get<CustomerOption[]>("/admin/booking-customers/");
      setCustomers(data);
    } catch {
      setCustomers([]);
    }
  }, []);

  const openAddBooking = useCallback(() => {
    setAddForm({ ...emptyAddForm });
    setAddingCustomer(false);
    setAddCustomerForm({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
    });
    setAddModalOpen(true);
    void loadCustomersForAdd();
  }, [loadCustomersForAdd]);

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    const userId = parseInt(addForm.user, 10);
    const roomId = parseInt(addForm.room, 10);
    if (!userId || !roomId || !addForm.check_in || !addForm.check_out) {
      alert("Select a customer, room, and dates.");
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post<BookingRow>("/admin/bookings/create/", {
        user: userId,
        room: roomId,
        check_in: addForm.check_in,
        check_out: addForm.check_out,
        guests: parseInt(addForm.guests, 10) || 1,
        adults: parseInt(addForm.adults, 10) || 1,
        children: parseInt(addForm.children, 10) || 0,
        guest_name: addForm.guest_name.trim(),
        guest_email: addForm.guest_email.trim(),
        guest_phone: addForm.guest_phone.trim(),
        guest_country: addForm.guest_country.trim() || "Nepal",
        payment_method: addForm.payment_method,
        special_requests: addForm.special_requests.trim(),
      });
      setBookings((prev) => [data, ...prev]);
      setAddModalOpen(false);
      setAddForm({ ...emptyAddForm });
      setAddingCustomer(false);
      setAddCustomerForm({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
      });
      void refreshRooms();
    } catch (err) {
      alert(formatApiError(err, "Could not create booking."));
    } finally {
      setCreating(false);
    }
  }

  async function handleCreateCustomer() {
    const username = addCustomerForm.username.trim();
    const email = addCustomerForm.email.trim();
    const password = addCustomerForm.password;
    if (!username || !email || !password) {
      alert("Enter username, email, and password for the customer.");
      return;
    }

    setCreatingCustomer(true);
    try {
      const { data } = await api.post("/admin/booking-customers/create/", {
        username,
        email,
        password,
        first_name: addCustomerForm.first_name.trim(),
        last_name: addCustomerForm.last_name.trim(),
      });

      // Add the newly created customer to the dropdown and auto-select it.
      setCustomers((prev) => {
        const exists = prev.some((c) => c.id === data.id);
        return exists ? prev : [...prev, data as CustomerOption].sort((a, b) => a.username.localeCompare(b.username));
      });
      setAddForm((f) => ({ ...f, user: String(data.id) }));
      setAddingCustomer(false);
      setAddCustomerForm({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
      });
    } catch (err) {
      alert(formatApiError(err, "Could not create customer account."));
    } finally {
      setCreatingCustomer(false);
    }
  }

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

  const availableRoomsForAdd = useMemo(
    () => rooms.filter((r) => r.room_status === "available"),
    [rooms]
  );

  function customerLabel(c: CustomerOption) {
    const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
    return name ? `${c.username} (${name})` : c.username;
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Bookings</h1>
          <p className="text-stone-500 mt-1 text-sm">Manage reservations, check-in/out, and room assignment</p>
        </div>
        <button
          type="button"
          onClick={openAddBooking}
          className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add booking
        </button>
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

      {addModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Add booking</h3>
            <p className="text-sm text-stone-500 mb-4">
              Create a reservation for a registered customer. Room must be available.
            </p>
            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">
                  Customer account
                </label>
                {!addingCustomer ? (
                  <button
                    type="button"
                    onClick={() => setAddingCustomer(true)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 whitespace-nowrap"
                  >
                    + Add customer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingCustomer(false)}
                    className="text-xs font-semibold text-stone-600 hover:text-stone-900 whitespace-nowrap"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!addingCustomer ? (
                <>
                  <select
                    required
                    value={addForm.user}
                    onChange={(e) => setAddForm((f) => ({ ...f, user: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  >
                    <option value="">Select customer…</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {customerLabel(c)} — {c.email || "no email"}
                      </option>
                    ))}
                  </select>
                  {customers.length === 0 && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      No customer accounts found. Add a new customer to continue.
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <input
                    required
                    placeholder="Username"
                    value={addCustomerForm.username}
                    onChange={(e) =>
                      setAddCustomerForm((f) => ({ ...f, username: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={addCustomerForm.email}
                    onChange={(e) =>
                      setAddCustomerForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                  <input
                    required
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={addCustomerForm.password}
                    onChange={(e) =>
                      setAddCustomerForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="First name (optional)"
                      value={addCustomerForm.first_name}
                      onChange={(e) =>
                        setAddCustomerForm((f) => ({
                          ...f,
                          first_name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    />
                    <input
                      placeholder="Last name (optional)"
                      value={addCustomerForm.last_name}
                      onChange={(e) =>
                        setAddCustomerForm((f) => ({
                          ...f,
                          last_name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddingCustomer(false)}
                      className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-medium"
                      disabled={creatingCustomer}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCreateCustomer()}
                      disabled={
                        creatingCustomer ||
                        !addCustomerForm.username.trim() ||
                        !addCustomerForm.email.trim() ||
                        !addCustomerForm.password
                      }
                      className="flex-1 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {creatingCustomer ? "Creating…" : "Create customer"}
                    </button>
                  </div>
                </div>
              )}

              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Room</label>
              <select
                required
                value={addForm.room}
                onChange={(e) => setAddForm((f) => ({ ...f, room: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                <option value="">Select available room…</option>
                {availableRoomsForAdd.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_number} — {r.room_type}
                  </option>
                ))}
              </select>
              {availableRoomsForAdd.length === 0 && (
                <p className="text-xs text-amber-700">No rooms are currently marked available.</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    required
                    value={addForm.check_in}
                    onChange={(e) => setAddForm((f) => ({ ...f, check_in: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    required
                    value={addForm.check_out}
                    onChange={(e) => setAddForm((f) => ({ ...f, check_out: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Guests</label>
                  <input
                    type="number"
                    min={1}
                    value={addForm.guests}
                    onChange={(e) => setAddForm((f) => ({ ...f, guests: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Adults</label>
                  <input
                    type="number"
                    min={1}
                    value={addForm.adults}
                    onChange={(e) => setAddForm((f) => ({ ...f, adults: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Children</label>
                  <input
                    type="number"
                    min={0}
                    value={addForm.children}
                    onChange={(e) => setAddForm((f) => ({ ...f, children: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <input
                placeholder="Guest name (on reservation)"
                value={addForm.guest_name}
                onChange={(e) => setAddForm((f) => ({ ...f, guest_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                type="email"
                placeholder="Guest email"
                value={addForm.guest_email}
                onChange={(e) => setAddForm((f) => ({ ...f, guest_email: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                placeholder="Guest phone"
                value={addForm.guest_phone}
                onChange={(e) => setAddForm((f) => ({ ...f, guest_phone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                placeholder="Country"
                value={addForm.guest_country}
                onChange={(e) => setAddForm((f) => ({ ...f, guest_country: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />

              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Payment method</label>
              <select
                value={addForm.payment_method}
                onChange={(e) => setAddForm((f) => ({ ...f, payment_method: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                {PAYMENT_METHOD_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Special requests (optional)"
                rows={2}
                value={addForm.special_requests}
                onChange={(e) => setAddForm((f) => ({ ...f, special_requests: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm resize-y"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    creating ||
                    !addForm.user ||
                    availableRoomsForAdd.length === 0 ||
                    !addForm.check_in ||
                    !addForm.check_out
                  }
                  className="flex-1 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
