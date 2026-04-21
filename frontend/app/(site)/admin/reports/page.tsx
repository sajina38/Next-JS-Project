"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ReportsChartsSection } from "@/component/charts/ReportsChartsSection";

interface MonthlyRow {
  key: string;
  label: string;
  count: number;
}

interface MonthlyRevenueRow {
  key: string;
  label: string;
  amount: number;
}

interface StatusCountRow {
  status: string;
  count: number;
}

interface PaymentCountRow {
  payment_status: string;
  count: number;
}

interface ReportsData {
  total_bookings: number;
  total_revenue: string;
  summary_month_label: string;
  monthly_bookings: MonthlyRow[];
  monthly_revenue: MonthlyRevenueRow[];
  bookings_by_status: StatusCountRow[];
  bookings_by_payment: PaymentCountRow[];
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get("/admin/reports/")
      .then((res) => setData(res.data))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
          Reports &amp; analytics
        </h1>
        <p className="text-stone-500 mt-1 text-sm md:text-base">
          Current-month KPIs and interactive charts for the last 12 months (ApexCharts).
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-6">Could not load reports.</p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-3xl">
            <StatCard
              label="Bookings this month"
              caption={data.summary_month_label}
              value={data.total_bookings}
              iconBg="bg-violet-100"
              icon={
                <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              }
            />
            <StatCard
              label="Paid revenue this month"
              caption={data.summary_month_label}
              value={`NPR ${data.total_revenue}`}
              numeric={false}
              iconBg="bg-emerald-100"
              icon={
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 11.768 12 11 12c-.728 0-1.432-.065-2.082-.197M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 4v.667A4.667 4.667 0 0 1 8.667 20H8m4-4h.667A4.667 4.667 0 0 0 16 13.333V13" />
                </svg>
              }
            />
          </div>

          <ReportsChartsSection
            categories={data.monthly_bookings.map((m) => m.label)}
            bookingCounts={data.monthly_bookings.map((m) => m.count)}
            revenueAmounts={data.monthly_bookings.map((m) => {
              const row = data.monthly_revenue?.find((r) => r.key === m.key);
              return row?.amount ?? 0;
            })}
            bookingsByStatus={data.bookings_by_status ?? []}
            bookingsByPayment={data.bookings_by_payment ?? []}
          />
        </>
      )}

      {!data && !error && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  caption,
  value,
  numeric = true,
  icon,
  iconBg,
}: {
  label: string;
  caption?: string;
  value: string | number;
  numeric?: boolean;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-stone-500 font-medium">{label}</p>
        {caption && (
          <p className="text-xs text-stone-400 mt-0.5">{caption}</p>
        )}
        <p
          className={`font-bold text-stone-900 mt-1 tabular-nums ${
            numeric ? "text-3xl" : "text-2xl sm:text-3xl break-words"
          }`}
        >
          {value}
        </p>
      </div>
      <div className={`p-2.5 rounded-lg shrink-0 ${iconBg}`}>{icon}</div>
    </div>
  );
}
