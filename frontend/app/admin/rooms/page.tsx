"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";

interface AdminRoom {
  id: number;
  room_number: string;
  room_type: string;
  name: string;
  description: string;
  price: string;
  capacity: number;
  room_status: RoomStatus;
  image: string | null;
}

const STATUS_BADGE: Record<RoomStatus, string> = {
  available: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  occupied: "bg-rose-50 text-rose-700 border border-rose-100",
  cleaning: "bg-amber-50 text-amber-800 border border-amber-100",
  maintenance: "bg-slate-100 text-slate-700 border border-slate-200",
};

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    room_number: "",
    room_type: "",
    name: "",
    description: "",
    price: "",
    capacity: "2",
    room_status: "available" as RoomStatus,
  });
  const [saving, setSaving] = useState(false);
  const [patchingId, setPatchingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/rooms/")
      .then((res) => setRooms(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const types = useMemo(() => {
    const s = new Set(rooms.map((r) => r.room_type).filter(Boolean));
    return Array.from(s).sort();
  }, [rooms]);

  const filtered = useMemo(() => {
    let list = rooms;
    if (typeFilter !== "all") list = list.filter((r) => r.room_type === typeFilter);
    if (statusFilter !== "all") list = list.filter((r) => r.room_status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.room_number.toLowerCase().includes(q) ||
          r.room_type.toLowerCase().includes(q) ||
          (r.name && r.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [rooms, search, typeFilter, statusFilter]);

  async function setRoomStatus(id: number, room_status: RoomStatus) {
    setPatchingId(id);
    try {
      const { data } = await api.patch(`/admin/rooms/${id}/`, { room_status });
      setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    } catch {
      alert("Could not update room status.");
    } finally {
      setPatchingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this room? Linked bookings may be affected.")) return;
    try {
      await api.delete(`/admin/rooms/${id}/`);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Could not delete room.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        room_number: form.room_number.trim(),
        room_type: form.room_type.trim(),
        name: form.name.trim() || form.room_type.trim(),
        description: form.description.trim(),
        price: form.price,
        capacity: parseInt(form.capacity, 10) || 2,
        room_status: form.room_status,
      };
      const { data } = await api.post("/admin/rooms/", payload);
      setRooms((prev) => [...prev, data].sort((a, b) => a.room_number.localeCompare(b.room_number)));
      setModal(false);
      setForm({
        room_number: "",
        room_type: "",
        name: "",
        description: "",
        price: "",
        capacity: "2",
        room_status: "available",
      });
    } catch {
      alert("Could not create room. Check room number is unique and price is valid.");
    } finally {
      setSaving(false);
    }
  }

  function statusActions(r: AdminRoom) {
    const busy = patchingId === r.id;
    const btn =
      "px-2 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 border border-stone-200";
    const actions: { label: string; next: RoomStatus }[] = [];
    if (r.room_status !== "cleaning") actions.push({ label: "Mark cleaning", next: "cleaning" });
    if (r.room_status !== "available") actions.push({ label: "Mark available", next: "available" });
    if (r.room_status !== "occupied") actions.push({ label: "Mark occupied", next: "occupied" });
    if (r.room_status !== "maintenance") actions.push({ label: "Maintenance", next: "maintenance" });
    return (
      <div className="flex flex-wrap gap-1">
        {actions.map((a) => (
          <button
            key={a.next}
            type="button"
            disabled={busy}
            onClick={() => setRoomStatus(r.id, a.next)}
            className={`${btn} text-stone-700 hover:bg-stone-50`}
          >
            {busy ? "…" : a.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Rooms Management</h1>
          <p className="text-stone-500 mt-1 text-sm">Manage rooms and housekeeping status</p>
        </div>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Room
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="search"
            placeholder="Search by room number or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 lg:w-44"
        >
          <option value="all">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 lg:w-48"
        >
          <option value="all">All status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700">All Rooms ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Room</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Quick set</th>
                  <th className="px-5 py-3 font-semibold w-16">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80 align-top">
                    <td className="px-5 py-3.5 font-medium text-stone-900">
                      {r.room_number}
                      {r.name && r.name !== r.room_type ? (
                        <span className="block text-xs font-normal text-stone-500">{r.name}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">{r.room_type}</td>
                    <td className="px-5 py-3.5 text-stone-900 tabular-nums">NPR {r.price}/night</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${
                          STATUS_BADGE[r.room_status] || "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {r.room_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">{statusActions(r)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        aria-label="Delete room"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.651 51.651 0 0 0-7.9 0c-1.08.038-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200 my-8">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Add Room</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                placeholder="Room number (e.g. 105)"
                value={form.room_number}
                onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                required
                placeholder="Room type (e.g. Deluxe)"
                value={form.room_type}
                onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                placeholder="Display name (optional)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm resize-y"
              />
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="Price per night (NPR)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                type="number"
                min={1}
                placeholder="Capacity"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Initial status</label>
              <select
                value={form.room_status}
                onChange={(e) => setForm({ ...form, room_status: e.target.value as RoomStatus })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                <option value="available">Available</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="occupied">Occupied</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
