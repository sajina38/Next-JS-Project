"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

interface BookingPaymentRow {
  id: number;
  room_number: string;
  guest_name: string;
  username: string;
  check_in: string;
  check_out: string;
  total_amount: string;
  payment_status: "paid" | "unpaid";
  payment_method: string;
  status: string;
}

const METHOD_LABELS: Record<string, string> = {
  prepay: "Pre-payment (bank transfer)",
  "pay-at-checkin": "Pay at check-in",
  "bank-card": "Card on arrival",
};

const METHOD_OPTIONS = Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label }));

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

function guestLine(b: BookingPaymentRow) {
  const g = (b.guest_name || "").trim();
  return g || b.username;
}

function PaymentRow({ row, onSaved }: { row: BookingPaymentRow; onSaved: () => void }) {
  const [amount, setAmount] = useState(String(row.total_amount));
  const [payStatus, setPayStatus] = useState(row.payment_status);
  const [method, setMethod] = useState(row.payment_method);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAmount(String(row.total_amount));
    setPayStatus(row.payment_status);
    setMethod(row.payment_method);
  }, [row.id, row.total_amount, row.payment_status, row.payment_method]);

  async function save() {
    setSaving(true);
    try {
      await api.patch(`/bookings/${row.id}/`, {
        total_amount: amount,
        payment_status: payStatus,
        payment_method: method,
      });
      onSaved();
    } catch (e) {
      alert(formatApiError(e, "Could not save payment."));
    } finally {
      setSaving(false);
    }
  }

  const bookingSummary = (
    <div className="min-w-0">
      <p className="font-medium text-stone-900">
        #{row.id} · Room {row.room_number}
      </p>
      <p className="text-xs text-stone-600 truncate">{guestLine(row)}</p>
      <p className="text-xs text-stone-500 tabular-nums">
        {row.check_in} → {row.check_out}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-stone-400 mt-0.5">Stay: {row.status}</p>
    </div>
  );

  return (
    <tr className="border-b border-stone-100 hover:bg-stone-50/80 align-top">
      <td className="px-4 py-3 max-w-[200px]">{bookingSummary}</td>
      <td className="px-4 py-3">
        <label className="sr-only">Amount (NPR)</label>
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-500">NPR</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 px-2 py-1.5 rounded-md border border-stone-200 text-sm tabular-nums"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <label className="sr-only">Payment status</label>
        <select
          value={payStatus}
          onChange={(e) => setPayStatus(e.target.value as "paid" | "unpaid")}
          className="w-full min-w-[6.5rem] px-2 py-1.5 rounded-md border border-stone-200 text-sm capitalize"
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <label className="sr-only">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full min-w-[10rem] max-w-[14rem] px-2 py-1.5 rounded-md border border-stone-200 text-sm"
        >
          {!METHOD_LABELS[method] ? (
            <option value={method}>
              {method || "—"}
            </option>
          ) : null}
          {METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </td>
    </tr>
  );
}

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<BookingPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState<"all" | "paid" | "unpaid">("all");

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
          guestLine(r).toLowerCase().includes(q) ||
          r.username.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.id - a.id);
  }, [rows, search, payFilter]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Payment &amp; billing</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Track amounts and payment status (no live gateway — manual updates only).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search booking, guest, room…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
        />
        <select
          value={payFilter}
          onChange={(e) => setPayFilter(e.target.value as "all" | "paid" | "unpaid")}
          className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm sm:w-44"
        >
          <option value="all">All payments</option>
          <option value="paid">Paid only</option>
          <option value="unpaid">Unpaid only</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700">Bookings ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Booking</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment status</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold w-24"> </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <PaymentRow key={r.id} row={r} onSaved={load} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-stone-500 text-sm">No bookings match your filters.</p>
        )}
      </div>
    </div>
  );
}
