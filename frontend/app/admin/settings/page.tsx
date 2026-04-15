"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";

interface HotelSettings {
  id: number;
  hotel_name: string;
  tagline: string;
  contact_info: string;
  phone: string;
  email: string;
  website_url: string;
  check_in_policy: string;
  check_out_policy: string;
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

function normalizeFromApi(d: Partial<HotelSettings>): HotelSettings {
  return {
    id: d.id ?? 1,
    hotel_name: d.hotel_name ?? "",
    tagline: d.tagline ?? "",
    contact_info: d.contact_info ?? "",
    phone: d.phone ?? "",
    email: d.email ?? "",
    website_url: d.website_url ?? "",
    check_in_policy: d.check_in_policy ?? "",
    check_out_policy: d.check_out_policy ?? "",
  };
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 md:p-6 space-y-4">
      <div className="border-b border-stone-100 pb-3">
        <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wide">{title}</h2>
        {description ? <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600";
const labelClass = "block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5";

function ViewValue({ value, multiline }: { value: string; multiline?: boolean }) {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return <span className="text-sm text-stone-400 italic">Not set</span>;
  }
  if (multiline) {
    return (
      <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
        {trimmed}
      </p>
    );
  }
  return <p className="text-sm text-stone-800">{trimmed}</p>;
}

function ViewUrl({ value }: { value: string }) {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return <span className="text-sm text-stone-400 italic">Not set</span>;
  }
  const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline break-all"
    >
      {trimmed}
    </a>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<HotelSettings | null>(null);
  const [draft, setDraft] = useState<HotelSettings | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/hotel-settings/")
      .then((res) => {
        const next = normalizeFromApi(res.data as Partial<HotelSettings>);
        setSaved(next);
        setDraft(next);
      })
      .catch(() => {
        /* shell redirects if unauthorized */
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit() {
    if (!saved) return;
    setDraft({ ...saved });
    setEditing(true);
    setSavedFlash(false);
  }

  function cancelEdit() {
    setEditing(false);
    if (saved) setDraft({ ...saved });
  }

  async function saveChanges(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const name = draft.hotel_name.trim();
    if (!name) {
      alert("Hotel name is required.");
      return;
    }
    setSaving(true);
    setSavedFlash(false);
    try {
      const { data } = await api.patch("/admin/hotel-settings/", {
        hotel_name: name,
        tagline: draft.tagline.trim(),
        contact_info: draft.contact_info.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim(),
        website_url: draft.website_url.trim(),
        check_in_policy: draft.check_in_policy.trim(),
        check_out_policy: draft.check_out_policy.trim(),
      });
      const next = normalizeFromApi(data as Partial<HotelSettings>);
      setSaved(next);
      setDraft(next);
      setEditing(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      alert(formatApiError(err, "Could not save settings."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Settings</h1>
          <p className="text-stone-500 mt-1 text-sm md:text-base max-w-xl leading-relaxed">
            Update your hotel name, contact details, website, and check-in information. Choose Edit to make changes, then Save when you are finished.
          </p>
        </div>
        {!loading && saved && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-sm font-semibold text-stone-700 bg-white hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="hotel-settings-form"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 shadow-sm"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                className="px-4 py-2 rounded-lg border border-stone-300 text-sm font-semibold text-stone-800 bg-white hover:bg-stone-50 shadow-sm"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {loading || !saved ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
        </div>
      ) : editing && draft ? (
        <form id="hotel-settings-form" onSubmit={saveChanges} className="space-y-6">
          {savedFlash && (
            <p className="text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Settings saved.
            </p>
          )}

          <Section
            title="Brand & identity"
            description="Shown as the hotel title in emails, confirmations, and future public pages."
          >
            <div>
              <label htmlFor="hotel_name" className={labelClass}>
                Hotel name
              </label>
              <input
                id="hotel_name"
                type="text"
                required
                value={draft.hotel_name}
                onChange={(e) => setDraft((f) => (f ? { ...f, hotel_name: e.target.value } : f))}
                className={inputClass}
                placeholder="Urban Boutique Hotel"
              />
            </div>
            <div>
              <label htmlFor="tagline" className={labelClass}>
                Tagline
              </label>
              <input
                id="tagline"
                type="text"
                value={draft.tagline}
                onChange={(e) => setDraft((f) => (f ? { ...f, tagline: e.target.value } : f))}
                className={inputClass}
                placeholder="A quiet stay in the heart of the city"
              />
              <p className="text-xs text-stone-400 mt-1">Optional one-liner under the hotel name.</p>
            </div>
          </Section>

          <Section
            title="Contact & location"
            description="Structured fields for phone and email; use the box below for full address and hours."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={draft.phone}
                  onChange={(e) => setDraft((f) => (f ? { ...f, phone: e.target.value } : f))}
                  className={inputClass}
                  placeholder="+977 1-XXXXXXX"
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft((f) => (f ? { ...f, email: e.target.value } : f))}
                  className={inputClass}
                  placeholder="info@yourhotel.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact_info" className={labelClass}>
                Address &amp; contact block
              </label>
              <textarea
                id="contact_info"
                rows={5}
                value={draft.contact_info}
                onChange={(e) => setDraft((f) => (f ? { ...f, contact_info: e.target.value } : f))}
                className={`${inputClass} resize-y min-h-[120px]`}
                placeholder={"Street, city, country\nFront desk hours\nAlternate numbers"}
              />
              <p className="text-xs text-stone-400 mt-1">Free-form text for anything guests or staff should see together.</p>
            </div>
          </Section>

          <Section title="Web presence" description="Link to your public marketing site or booking landing page.">
            <div>
              <label htmlFor="website_url" className={labelClass}>
                Website URL
              </label>
              <input
                id="website_url"
                type="url"
                value={draft.website_url}
                onChange={(e) => setDraft((f) => (f ? { ...f, website_url: e.target.value } : f))}
                className={inputClass}
                placeholder="https://www.yourhotel.com"
              />
              <p className="text-xs text-stone-400 mt-1">Include https:// for best compatibility with browsers and apps.</p>
            </div>
          </Section>

          <Section
            title="Stay policies (display)"
            description="Short strings you can reuse on the site, in-app copy, or printed materials. They do not change engine booking rules yet."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="check_in_policy" className={labelClass}>
                  Check-in
                </label>
                <input
                  id="check_in_policy"
                  type="text"
                  value={draft.check_in_policy}
                  onChange={(e) => setDraft((f) => (f ? { ...f, check_in_policy: e.target.value } : f))}
                  className={inputClass}
                  placeholder="From 2:00 PM"
                />
              </div>
              <div>
                <label htmlFor="check_out_policy" className={labelClass}>
                  Check-out
                </label>
                <input
                  id="check_out_policy"
                  type="text"
                  value={draft.check_out_policy}
                  onChange={(e) => setDraft((f) => (f ? { ...f, check_out_policy: e.target.value } : f))}
                  className={inputClass}
                  placeholder="By 11:00 AM"
                />
              </div>
            </div>
          </Section>

          <p className="text-xs text-stone-500">Use Save changes above, or submit from the last field with Enter where supported.</p>
        </form>
      ) : (
        <div className="space-y-6">
          {savedFlash && (
            <p className="text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Settings saved.
            </p>
          )}

          <Section
            title="Brand & identity"
            description="Shown as the hotel title in emails, confirmations, and future public pages."
          >
            <div>
              <p className={labelClass}>Hotel name</p>
              <ViewValue value={saved.hotel_name} />
            </div>
            <div>
              <p className={labelClass}>Tagline</p>
              <ViewValue value={saved.tagline} />
            </div>
          </Section>

          <Section
            title="Contact & location"
            description="Structured fields for phone and email; use the box below for full address and hours."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={labelClass}>Phone</p>
                <ViewValue value={saved.phone} />
              </div>
              <div>
                <p className={labelClass}>Email</p>
                <ViewValue value={saved.email} />
              </div>
            </div>
            <div>
              <p className={labelClass}>Address &amp; contact block</p>
              <ViewValue value={saved.contact_info} multiline />
            </div>
          </Section>

          <Section title="Web presence" description="Link to your public marketing site or booking landing page.">
            <div>
              <p className={labelClass}>Website URL</p>
              <ViewUrl value={saved.website_url} />
            </div>
          </Section>

          <Section
            title="Stay policies (display)"
            description="Short strings you can reuse on the site, in-app copy, or printed materials."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={labelClass}>Check-in</p>
                <ViewValue value={saved.check_in_policy} />
              </div>
              <div>
                <p className={labelClass}>Check-out</p>
                <ViewValue value={saved.check_out_policy} />
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
