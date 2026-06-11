"use client";

import { PencilSimple } from "@phosphor-icons/react";
import type { KPI } from "../../types/dashboard";
import { progressBarColor } from "../../lib/dashboardStyles";

interface Props {
  kpi: KPI;
}

export function KpiCard({ kpi }: Props) {
  return (
    <div className="relative group p-4 border border-zinc-150 bg-zinc-50/50 rounded-2xl space-y-2.5 shadow-xs flex flex-col justify-between">
      <div className="space-y-1 pr-6">
        <span
          className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wide whitespace-nowrap ${kpi.color}`}
        >
          {kpi.status}
        </span>
        <p className="text-xs font-black text-zinc-900 leading-tight pt-1">
          {kpi.metric}
        </p>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-baseline text-[10px] text-zinc-450 font-bold font-mono">
          <span>Target: {kpi.target}</span>
          <span className="text-zinc-900">{kpi.current}</span>
        </div>
        <div className="h-1.5 bg-zinc-150 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressBarColor[kpi.status] || "bg-zinc-350"}`}
            style={{ width: `${kpi.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
