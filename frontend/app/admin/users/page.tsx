"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  first_name: string;
  last_name: string;
  loyalty_cards?: number;
}

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-rose-50 text-rose-800 border border-rose-100",
  manager: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  customer: "bg-stone-100 text-stone-700 border border-stone-200",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "customer",
  });
  const [saving, setSaving] = useState(false);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "customer",
  });
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/users/")
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, search, roleFilter]);

  async function handleDelete(id: number) {
    if (!confirm("Remove this user from the system?")) return;
    try {
      await api.delete(`/admin/users/${id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setViewUser((v) => (v?.id === id ? null : v));
      setEditUser((e) => (e?.id === id ? null : e));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(msg || "Could not delete user.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/admin/users/", form);
      setUsers((prev) => [...prev, data]);
      setModal(false);
      setForm({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "customer",
      });
    } catch {
      alert("Could not create user. Check fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(u: AdminUser) {
    setViewUser(null);
    setEditUser(u);
    setEditForm({
      username: u.username,
      email: u.email,
      password: "",
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      role: u.role,
    });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditSaving(true);
    try {
      const payload: Record<string, string | boolean> = {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        role: editForm.role,
        is_active: editUser.is_active,
      };
      const pwd = editForm.password.trim();
      if (pwd.length > 0) {
        payload.password = pwd;
      }
      const { data } = await api.patch(`/admin/users/${editUser.id}/`, payload);
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, ...data } : u)));
      setEditUser(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, unknown> | { detail?: string } } };
      const d = err.response?.data;
      const detail =
        d && typeof d === "object" && "detail" in d && typeof (d as { detail?: string }).detail === "string"
          ? (d as { detail: string }).detail
          : null;
      if (detail) {
        alert(detail);
      } else {
        alert("Could not update user. Check fields and try again.");
      }
    } finally {
      setEditSaving(false);
    }
  }

  function displayName(u: AdminUser) {
    const n = `${u.first_name || ""} ${u.last_name || ""}`.trim();
    return n || u.username;
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Users Management</h1>
          <p className="text-stone-500 mt-1 text-sm">Manage all users in the system</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setViewUser(null);
            setEditUser(null);
            setModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 sm:w-44"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700">All Users ({filtered.length})</h2>
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
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold tabular-nums">Breakfast cards</th>
                  <th className="px-5 py-3 font-semibold w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/80">
                    <td className="px-5 py-3.5 font-medium text-stone-900">{displayName(u)}</td>
                    <td className="px-5 py-3.5 text-stone-600">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${
                          ROLE_BADGE[u.role] || "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-700 tabular-nums">{u.loyalty_cards ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditUser(null);
                            setViewUser(u);
                          }}
                          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                          title="View user"
                          aria-label="View user details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Edit user"
                          aria-label="Edit user"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          aria-label="Delete user"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.651 51.651 0 0 0-7.9 0c-1.08.038-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200 my-8">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Edit user</h3>
            <p className="text-sm text-stone-500 mb-4">@{editUser.username}</p>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input
                required
                placeholder="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                type="password"
                placeholder="New password (leave blank to keep)"
                minLength={6}
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="First name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                />
                <input
                  placeholder="Last name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                />
              </div>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                <option value="customer">Customer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {editSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200 my-8">
            <h3 className="text-lg font-bold text-stone-900 mb-1">User details</h3>
            <p className="text-sm text-stone-500 mb-4">@{viewUser.username}</p>
            <dl className="space-y-3 text-sm border-t border-stone-100 pt-4">
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <dt className="text-stone-500 font-medium">Username</dt>
                <dd className="text-stone-900 break-all">{viewUser.username}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <dt className="text-stone-500 font-medium">Email</dt>
                <dd className="text-stone-900 break-all">{viewUser.email}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <dt className="text-stone-500 font-medium">Name</dt>
                <dd className="text-stone-900">{displayName(viewUser)}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <dt className="text-stone-500 font-medium">Role</dt>
                <dd className="text-stone-900 capitalize">{viewUser.role}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <dt className="text-stone-500 font-medium">Status</dt>
                <dd className="text-stone-900">{viewUser.is_active ? "Active" : "Inactive"}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <dt className="text-stone-500 font-medium">Breakfast cards</dt>
                <dd className="text-stone-900 tabular-nums">{viewUser.loyalty_cards ?? 0}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setViewUser(null)}
              className="mt-6 w-full py-2.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Add User</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <input
                required
                type="password"
                placeholder="Password (min 6)"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="First name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                />
                <input
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                />
              </div>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                <option value="customer">Customer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
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
