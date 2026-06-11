"use client";

import { TrendUp, PencilSimple } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import type { KPI } from "../../types/dashboard";
import { KpiCard } from "./KpiCard";

interface Props {
  kpis: KPI[];
  onEditKpi: (kpi: KPI) => void;
}

export function KPIPanel({ kpis, onEditKpi }: Props) {
  return (
    <Card className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-150 pb-3 mb-4 gap-3">
        <div>
          <h2 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
            <TrendUp className="text-indigo-600 shrink-0" size={18} />
            Key Performance Indicators
          </h2>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            Pencapaian target operasional MAPID Catalyst 2026.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="relative group"
          >
            <button
              onClick={() => onEditKpi(kpi)}
              className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition opacity-0 group-hover:opacity-100 shadow-xs cursor-pointer z-10"
              title={`Edit ${kpi.metric}`}
            >
              <PencilSimple size={12} />
            </button>
            <KpiCard kpi={kpi} />
          </div>
        ))}
      </div>
    </Card>
  );
}
