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

const ROOM_NUMBER_PATTERN = /^\d{1,10}$/;

function TypeCell({ r }: { r: AdminRoom }) {
  const displayName = (r.name || "").trim();
  if (displayName) {
    return (
      <div>
        <p className="font-medium text-stone-900">{displayName}</p>
        <p className="text-xs text-stone-500 mt-0.5">{r.room_type}</p>
      </div>
    );
  }
  return <span className="text-stone-600">{r.room_type}</span>;
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
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
  const [formError, setFormError] = useState<string | null>(null);

  const [editRoom, setEditRoom] = useState<AdminRoom | null>(null);
  const [editForm, setEditForm] = useState({
    room_number: "",
    room_type: "",
    name: "",
    description: "",
    price: "",
    capacity: "2",
    room_status: "available" as RoomStatus,
  });
  const [editSaving, setEditSaving] = useState(false);

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

  function openEdit(r: AdminRoom) {
    setEditRoom(r);
    setEditForm({
      room_number: r.room_number,
      room_type: r.room_type,
      name: r.name || "",
      description: r.description || "",
      price: r.price,
      capacity: String(r.capacity),
      room_status: r.room_status,
    });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editRoom) return;
    const num = editForm.room_number.trim();
    if (!ROOM_NUMBER_PATTERN.test(num)) {
      alert("Room number must be digits only (e.g. 101), 1–10 characters.");
      return;
    }
    setEditSaving(true);
    try {
      const { data } = await api.patch(`/admin/rooms/${editRoom.id}/`, {
        room_number: num,
        room_type: editForm.room_type.trim(),
        name: editForm.name.trim() || editForm.room_type.trim(),
        description: editForm.description.trim(),
        price: editForm.price,
        capacity: parseInt(editForm.capacity, 10) || 2,
        room_status: editForm.room_status,
      });
      setRooms((prev) =>
        prev
          .map((r) => (r.id === editRoom.id ? { ...r, ...data } : r))
          .sort((a, b) => a.room_number.localeCompare(b.room_number))
      );
      setEditRoom(null);
    } catch {
      alert("Could not save room. Check values and room number uniqueness.");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this room? Linked bookings may be affected.")) return;
    try {
      await api.delete(`/admin/rooms/${id}/`);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      setEditRoom((er) => (er?.id === id ? null : er));
    } catch {
      alert("Could not delete room.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const num = form.room_number.trim();
    if (!ROOM_NUMBER_PATTERN.test(num)) {
      setFormError("Room number must be digits only (e.g. 101), 1–10 characters.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        room_number: num,
        room_type: form.room_type.trim(),
        name: form.name.trim() || form.room_type.trim(),
        description: form.description.trim(),
        price: form.price,
        capacity: parseInt(form.capacity, 10) || 2,
        room_status: form.room_status,
      };
      const { data } = await api.post("/admin/rooms/", payload);
      setRooms((prev) => [...prev, data].sort((a, b) => a.room_number.localeCompare(b.room_number)));
      setAddModalOpen(false);
      setForm({
        room_number: "",
        room_type: "",
        name: "",
        description: "",
        price: "",
        capacity: "2",
        room_status: "available",
      });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: Record<string, string | string[]> } };
      const d = ax.response?.data;
      const rn = d?.room_number;
      const msg = Array.isArray(rn) ? rn[0] : typeof rn === "string" ? rn : null;
      alert(
        msg ||
          "Could not create room. Check the room number is unique and the price is valid."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Rooms Management</h1>
          <p className="text-stone-500 mt-1 text-sm">Manage rooms and housekeeping status</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm shadow-emerald-700/20 shrink-0"
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
                  <th scope="col" className="px-5 py-3 w-[56px]">
                    <span className="sr-only">Edit</span>
                  </th>
                  <th scope="col" className="px-5 py-3 w-[56px]">
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80 align-top">
                    <td className="px-5 py-3.5 font-medium text-stone-900 tabular-nums">{r.room_number}</td>
                    <td className="px-5 py-3.5">
                      <TypeCell r={r} />
                    </td>
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
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        title="Edit room"
                        aria-label="Edit room"
                        className="p-1.5 rounded-md text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                        aria-label="Delete room"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
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

      {addModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200 my-8">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Add Room</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{1,10}"
                  title="Digits only, e.g. 101"
                  placeholder="Room number (e.g. 105)"
                  value={form.room_number}
                  onChange={(e) => {
                    setFormError(null);
                    setForm({ ...form, room_number: e.target.value });
                  }}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    formError ? "border-rose-400 focus:ring-rose-200" : "border-stone-200"
                  }`}
                />
                {formError && <p className="text-xs text-rose-600 mt-1">{formError}</p>}
                <p className="text-xs text-stone-500 mt-1">Use numbers only (no letters).</p>
              </div>
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
                  onClick={() => {
                    setFormError(null);
                    setAddModalOpen(false);
                  }}
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

      {editRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Edit room #{editRoom.room_number}</h3>
            <p className="text-sm text-stone-500 mb-4">Update details and housekeeping status.</p>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Room number</label>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{1,10}"
                title="Digits only"
                value={editForm.room_number}
                onChange={(e) => setEditForm((f) => ({ ...f, room_number: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Room type</label>
              <input
                required
                value={editForm.room_type}
                onChange={(e) => setEditForm((f) => ({ ...f, room_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Display name</label>
              <input
                placeholder="Shown in Type column (optional)"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm resize-y"
              />
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Price (NPR / night)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={editForm.price}
                onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Capacity</label>
              <input
                type="number"
                min={1}
                value={editForm.capacity}
                onChange={(e) => setEditForm((f) => ({ ...f, capacity: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">Room status</label>
              <select
                value={editForm.room_status}
                onChange={(e) => setEditForm((f) => ({ ...f, room_status: e.target.value as RoomStatus }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                <option value="available">Available</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="occupied">Occupied</option>
              </select>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditRoom(null)}
                  disabled={editSaving}
                  className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {editSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
