"use client";

import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import { ApexChartClient } from "./ApexChartClient";

const STONE = "#57534e";

function humanize(s: string) {
  return s
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type StatusRow = { status: string; count: number };
type RoomStatusRow = { room_status: string; count: number };
type RoleRow = { role: string; count: number };

export type DashboardChartsInput = {
  bookingsByStatus: StatusRow[];
  roomsByStatus: RoomStatusRow[];
  usersByRole?: RoleRow[];
};

function donutOptions(labels: string[], colors: string[], totalLabel: string): ApexOptions {
  return {
    chart: { type: "donut", toolbar: { show: false }, fontFamily: "inherit" },
    labels,
    colors,
    legend: { position: "bottom", fontSize: "11px", labels: { colors: STONE } },
    dataLabels: { enabled: true, style: { fontSize: "10px" } },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: { show: true, label: totalLabel, fontSize: "12px", color: STONE },
          },
        },
      },
    },
    tooltip: { theme: "light" },
  };
}

export function DashboardChartsSection({ bookingsByStatus, roomsByStatus, usersByRole }: DashboardChartsInput) {
  const bSeries = bookingsByStatus.map((r) => r.count);
  const bOpts = useMemo(
    () =>
      donutOptions(
        bookingsByStatus.map((r) => humanize(r.status)),
        ["#d97706", "#059669", "#64748b", "#7c3aed"],
        "Bookings",
      ),
    [bookingsByStatus],
  );

  const rSeries = roomsByStatus.map((r) => r.count);
  const rOpts = useMemo(
    () =>
      donutOptions(
        roomsByStatus.map((r) => humanize(r.room_status)),
        ["#059669", "#f43f5e", "#d97706", "#94a3b8"],
        "Rooms",
      ),
    [roomsByStatus],
  );

  const uSeries = usersByRole?.map((r) => r.count) ?? [];
  const uOpts = useMemo(
    () =>
      donutOptions(
        (usersByRole ?? []).map((r) => humanize(r.role)),
        ["#0d9488", "#7c3aed", "#ea580c"],
        "Users",
      ),
    [usersByRole],
  );

  const cols = usersByRole?.length ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 ${cols} gap-6 mb-10`}>
      <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 shadow-sm">
        <h2 className="font-semibold text-stone-900 text-sm md:text-base mb-1">Bookings by status</h2>
        <p className="text-xs text-stone-500 mb-2">All time</p>
        {bSeries.some((n) => n > 0) ? (
          <ApexChartClient
            options={bOpts}
            series={bSeries}
            type="donut"
            height={260}
            key={`b-${bookingsByStatus.map((r) => `${r.status}:${r.count}`).join("|")}`}
          />
        ) : (
          <p className="text-sm text-stone-400 py-10 text-center">No data</p>
        )}
      </div>
      <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 shadow-sm">
        <h2 className="font-semibold text-stone-900 text-sm md:text-base mb-1">Rooms by status</h2>
        <p className="text-xs text-stone-500 mb-2">Inventory snapshot</p>
        {rSeries.some((n) => n > 0) ? (
          <ApexChartClient
            options={rOpts}
            series={rSeries}
            type="donut"
            height={260}
            key={`r-${roomsByStatus.map((r) => `${r.room_status}:${r.count}`).join("|")}`}
          />
        ) : (
          <p className="text-sm text-stone-400 py-10 text-center">No rooms</p>
        )}
      </div>
      {usersByRole && usersByRole.length > 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 shadow-sm">
          <h2 className="font-semibold text-stone-900 text-sm md:text-base mb-1">Users by role</h2>
          <p className="text-xs text-stone-500 mb-2">Accounts</p>
          {uSeries.some((n) => n > 0) ? (
            <ApexChartClient
              options={uOpts}
              series={uSeries}
              type="donut"
              height={260}
              key={`u-${usersByRole?.map((r) => `${r.role}:${r.count}`).join("|") ?? ""}`}
            />
          ) : (
            <p className="text-sm text-stone-400 py-10 text-center">No users</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
