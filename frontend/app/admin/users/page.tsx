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
          onClick={() => setModal(true)}
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
                  <th className="px-5 py-3 font-semibold w-24">Actions</th>
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
                    <td className="px-5 py-3.5">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
