"use client";

import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import { ApexChartClient } from "./ApexChartClient";

const STONE = "#57534e";
const GRID = "#e7e5e4";

function humanize(s: string) {
  return s
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type StatusRow = { status: string; count: number };
type PaymentRow = { payment_status: string; count: number };

export type ReportsChartsInput = {
  categories: string[];
  bookingCounts: number[];
  revenueAmounts: number[];
  bookingsByStatus: StatusRow[];
  bookingsByPayment: PaymentRow[];
};

export function ReportsChartsSection({
  categories,
  bookingCounts,
  revenueAmounts,
  bookingsByStatus,
  bookingsByPayment,
}: ReportsChartsInput) {
  const statusLabels = bookingsByStatus.map((r) => humanize(r.status));
  const statusSeries = bookingsByStatus.map((r) => r.count);
  const donutStatusOptions = useMemo<ApexOptions>(
    () => ({
      chart: { type: "donut", toolbar: { show: false }, fontFamily: "inherit" },
      labels: bookingsByStatus.map((r) => humanize(r.status)),
      colors: ["#d97706", "#059669", "#64748b", "#7c3aed"],
      legend: { position: "bottom", fontSize: "12px", labels: { colors: STONE } },
      dataLabels: { enabled: true, style: { fontSize: "11px" } },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Bookings",
                fontSize: "13px",
                color: STONE,
              },
            },
          },
        },
      },
      tooltip: { theme: "light" },
    }),
    [bookingsByStatus],
  );

  const paySeries = bookingsByPayment.map((r) => r.count);
  const donutPayOptions = useMemo<ApexOptions>(
    () => ({
      chart: { type: "donut", toolbar: { show: false }, fontFamily: "inherit" },
      labels: bookingsByPayment.map((r) => humanize(r.payment_status)),
      colors: ["#059669", "#94a3b8"],
      legend: { position: "bottom", fontSize: "12px", labels: { colors: STONE } },
      dataLabels: { enabled: true, style: { fontSize: "11px" } },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "All",
                fontSize: "13px",
                color: STONE,
              },
            },
          },
        },
      },
      tooltip: { theme: "light" },
    }),
    [bookingsByPayment],
  );

  const comboOptions = useMemo<ApexOptions>(
    () => ({
      chart: { type: "line", toolbar: { show: false }, fontFamily: "inherit" },
      stroke: { width: [0, 3], curve: "smooth" },
      plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
      dataLabels: { enabled: false },
      colors: ["#7c3aed", "#059669"],
      xaxis: {
        categories,
        labels: { style: { colors: STONE, fontSize: "11px" }, rotate: -45 },
      },
      yaxis: [
        {
          title: { text: "Bookings", style: { color: STONE, fontSize: "12px" } },
          labels: { style: { colors: STONE } },
        },
        {
          opposite: true,
          title: { text: "Paid revenue (NPR)", style: { color: STONE, fontSize: "12px" } },
          labels: {
            style: { colors: STONE },
            formatter: (val: number) =>
              val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(Math.round(val)),
          },
        },
      ],
      grid: { borderColor: GRID, strokeDashArray: 4 },
      tooltip: {
        theme: "light",
        shared: true,
        intersect: false,
        y: [
          { formatter: (val: number) => `${val} bookings` },
          { formatter: (val: number) => `NPR ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
        ],
      },
      legend: { position: "top", horizontalAlign: "right", fontSize: "12px", labels: { colors: STONE } },
    }),
    [categories],
  );

  const comboSeries = useMemo(
    () => [
      { name: "Bookings", type: "column" as const, data: bookingCounts },
      { name: "Paid revenue (NPR)", type: "line" as const, data: revenueAmounts },
    ],
    [bookingCounts, revenueAmounts],
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 p-5 md:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Bookings &amp; paid revenue by month</h2>
        <p className="text-sm text-stone-500 mt-0.5 mb-2">
          Last 12 months — columns are new bookings; line is paid booking totals (NPR).
        </p>
        <ApexChartClient
          options={comboOptions}
          series={comboSeries}
          type="line"
          height={320}
          key={`combo-${categories.join("|")}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 p-5 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Bookings by status</h2>
          <p className="text-sm text-stone-500 mb-2">All time</p>
          {statusSeries.some((n) => n > 0) ? (
            <ApexChartClient
              options={donutStatusOptions}
              series={statusSeries}
              type="donut"
              height={300}
              key={statusLabels.join(",")}
            />
          ) : (
            <p className="text-sm text-stone-400 py-12 text-center">No booking data yet</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Payment status</h2>
          <p className="text-sm text-stone-500 mb-2">All bookings</p>
          {paySeries.some((n) => n > 0) ? (
            <ApexChartClient
              options={donutPayOptions}
              series={paySeries}
              type="donut"
              height={300}
              key={bookingsByPayment.map((r) => `${r.payment_status}:${r.count}`).join(",")}
            />
          ) : (
            <p className="text-sm text-stone-400 py-12 text-center">No booking data yet</p>
          )}
        </div>
      </div>

    </div>
  );
}
