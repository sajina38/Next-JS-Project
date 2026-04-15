"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function ApexChartClient(props: ComponentProps<typeof ReactApexChart>) {
  return <ReactApexChart {...props} />;
}
