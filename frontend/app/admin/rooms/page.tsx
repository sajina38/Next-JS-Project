"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

interface AdminRoom {
  id: number;
  room_number: string;
  room_type: string;
  name: string;
  description: string;
  price: string;
  capacity: number;
  is_available: boolean;
  image: string | null;
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    room_number: "",
    room_type: "",
    name: "",
    description: "",
    price: "",
    capacity: "2",
    is_available: true,
  });
  const [saving, setSaving] = useState(false);

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
    if (statusFilter === "available") list = list.filter((r) => r.is_available);
    if (statusFilter === "occupied") list = list.filter((r) => !r.is_available);
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
        is_available: form.is_available,
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
        is_available: true,
      });
    } catch {
      alert("Could not create room. Check room number is unique and price is valid.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Rooms Management</h1>
          <p className="text-stone-500 mt-1 text-sm">Manage all rooms in the system</p>
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
          className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 lg:w-44"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Room</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80">
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
                          r.is_available
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {r.is_available ? "available" : "occupied"}
                      </span>
                    </td>
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
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                  className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                />
                Available for booking
              </label>
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
