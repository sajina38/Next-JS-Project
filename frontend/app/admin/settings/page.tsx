"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";

interface HotelSettings {
  id: number;
  hotel_name: string;
  contact_info: string;
  email: string;
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

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [form, setForm] = useState<HotelSettings>({
    id: 1,
    hotel_name: "",
    contact_info: "",
    email: "",
  });

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/hotel-settings/")
      .then((res) => setForm(res.data))
      .catch(() => {
        /* shell redirects if unauthorized */
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedFlash(false);
    try {
      const { data } = await api.patch("/admin/hotel-settings/", {
        hotel_name: form.hotel_name.trim(),
        contact_info: form.contact_info.trim(),
        email: form.email.trim(),
      });
      setForm(data);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      alert(formatApiError(err, "Could not save settings."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Settings</h1>
        <p className="text-stone-500 mt-1 text-sm">Hotel name and contact information (used across the admin panel and can be wired to the public site later).</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-5"
        >
          {savedFlash && (
            <p className="text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Settings saved.
            </p>
          )}

          <div>
            <label htmlFor="hotel_name" className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
              Hotel name
            </label>
            <input
              id="hotel_name"
              type="text"
              required
              value={form.hotel_name}
              onChange={(e) => setForm((f) => ({ ...f, hotel_name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600"
              placeholder="Urban Boutique Hotel"
            />
          </div>

          <div>
            <label htmlFor="contact_info" className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
              Contact info
            </label>
            <textarea
              id="contact_info"
              rows={4}
              value={form.contact_info}
              onChange={(e) => setForm((f) => ({ ...f, contact_info: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600"
              placeholder="Address, phone number, front desk hours…"
            />
            <p className="text-xs text-stone-400 mt-1">Free text: guests and staff can see this wherever you display it.</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600"
              placeholder="info@yourhotel.com"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
