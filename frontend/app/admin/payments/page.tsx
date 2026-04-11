"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

interface BookingPaymentRow {
  id: number;
  room_number: string;
  room_type?: string;
  room_name?: string;
  guest_name: string;
  username: string;
  check_in: string;
  check_out: string;
  total_amount: string;
  payment_status: string;
  payment_method: string;
  status: string;
}

const METHOD_LABELS: Record<string, string> = {
  prepay: "Pre-payment (bank transfer)",
  "pay-at-checkin": "Pay at check-in",
  "bank-card": "Card on arrival",
  khalti: "Online payment (Khalti)",
};

const METHOD_OPTIONS = Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label }));

const STAY_STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border border-amber-100",
  confirmed: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  cancelled: "bg-stone-100 text-stone-600 border border-stone-200",
  "checked-in": "bg-sky-50 text-sky-800 border border-sky-100",
  "checked-out": "bg-violet-50 text-violet-800 border border-violet-100",
};

const PAYMENT_STATUS_BADGE: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  unpaid: "bg-amber-50 text-amber-800 border border-amber-100",
};

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

function GuestTableCell({ b }: { b: BookingPaymentRow }) {
  const guest = (b.guest_name || "").trim();
  const account = b.username;
  if (!guest) {
    return <p className="font-medium text-stone-900">{account}</p>;
  }
  const sameAsAccount = guest.toLowerCase() === account.toLowerCase();
  return (
    <>
      <p className="font-medium text-stone-900">{guest}</p>
      {!sameAsAccount && <p className="text-xs text-stone-500">Account: {account}</p>}
    </>
  );
}

function formatAmountDisplay(raw: string): string {
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return raw || "—";
  return `Rs. ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function methodLabel(method: string): string {
  return METHOD_LABELS[method] || method || "—";
}

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<BookingPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [modal, setModal] = useState<BookingPaymentRow | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/bookings/")
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = rows;
    if (payFilter !== "all") list = list.filter((r) => r.payment_status === payFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          String(r.id).includes(q) ||
          r.room_number.toLowerCase().includes(q) ||
          (r.guest_name && r.guest_name.toLowerCase().includes(q)) ||
          r.username.toLowerCase().includes(q) ||
          (r.payment_status && r.payment_status.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.id - a.id);
  }, [rows, search, payFilter]);

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal) return;
    const fd = new FormData(e.currentTarget);
    const amountStr = String(fd.get("total_amount") ?? "").trim();
    const amountNum = parseFloat(amountStr);
    if (amountStr === "" || Number.isNaN(amountNum) || amountNum < 0) {
      alert("Enter a valid amount (0 or greater).");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch(`/bookings/${modal.id}/`, {
        total_amount: amountStr,
        payment_status: fd.get("payment_status"),
        payment_method: fd.get("payment_method"),
      });
      setRows((prev) => prev.map((r) => (r.id === modal.id ? { ...r, ...data } : r)));
      setModal(null);
    } catch (err) {
      alert(formatApiError(err, "Could not save. Check values and try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Permanently delete this booking? It will disappear from payments and bookings.")) return;
    try {
      await api.delete(`/bookings/${id}/`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setModal((m) => (m?.id === id ? null : m));
    } catch {
      alert("Could not delete booking.");
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Payment &amp; billing</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Track amounts and payment status (manual updates — use the row icons to edit or delete).
        </p>
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
            placeholder="Search by ID, guest, room, or payment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
        </div>
        <select
          value={payFilter}
          onChange={(e) => setPayFilter(e.target.value as "all" | "paid" | "unpaid")}
          className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 lg:w-52"
        >
          <option value="all">All payments</option>
          <option value="paid">Paid only</option>
          <option value="unpaid">Unpaid only</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700">All payments ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Guest</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Dates</th>
                  <th className="px-4 py-3 font-semibold">Stay</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th scope="col" className="px-4 py-3 w-[88px]">
                    <span className="sr-only">Edit or delete</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80 align-top">
                    <td className="px-4 py-3.5 font-mono text-stone-700">#{r.id}</td>
                    <td className="px-4 py-3.5">
                      <GuestTableCell b={r} />
                    </td>
                    <td className="px-4 py-3.5 text-stone-700">
                      <span className="font-medium">{r.room_number}</span>
                      {(r.room_type || r.room_name) && (
                        <span className="text-stone-500 text-xs block">
                          {r.room_type || r.room_name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-stone-700 tabular-nums whitespace-nowrap">
                      {r.check_in} → {r.check_out}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${
                          STAY_STATUS_BADGE[r.status] || "bg-stone-100 text-stone-600 border border-stone-200"
                        }`}
                      >
                        {(r.status || "—").replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-stone-900 font-semibold tabular-nums whitespace-nowrap text-sm">
                      {formatAmountDisplay(r.total_amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${
                          PAYMENT_STATUS_BADGE[r.payment_status || "unpaid"] ||
                          "bg-stone-100 text-stone-600 border border-stone-200"
                        }`}
                      >
                        {(r.payment_status || "unpaid").replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-stone-700 max-w-[200px]">
                      <span className="text-sm leading-snug">{methodLabel(r.payment_method)}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setModal(r)}
                          title="Edit payment"
                          aria-label="Edit payment"
                          className="shrink-0 p-1.5 rounded-md text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(r.id)}
                          title="Delete booking"
                          aria-label="Delete booking"
                          className="shrink-0 p-1.5 rounded-md text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
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
        {!loading && filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-stone-500 text-sm">No bookings match your filters.</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Edit payment · booking #{modal.id}</h3>
            <p className="text-sm text-stone-500 mb-4">
              Room {modal.room_number}
              {(modal.room_type || modal.room_name) ? ` · ${modal.room_type || modal.room_name}` : ""} ·{" "}
              {modal.check_in} → {modal.check_out}
            </p>
            <form key={modal.id} onSubmit={saveEdit} className="space-y-3">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">
                Amount (NPR)
              </label>
              <input
                type="number"
                name="total_amount"
                min={0}
                step="0.01"
                required
                defaultValue={modal.total_amount}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm tabular-nums"
              />

              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">
                Payment status
              </label>
              <select
                name="payment_status"
                defaultValue={modal.payment_status || "unpaid"}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>

              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">
                Payment method
              </label>
              <select
                name="payment_method"
                defaultValue={modal.payment_method}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              >
                {!METHOD_LABELS[modal.payment_method] ? (
                  <option value={modal.payment_method}>{modal.payment_method || "—"}</option>
                ) : null}
                {METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50"
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
