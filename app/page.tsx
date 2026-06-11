"use client";

import { useState, useMemo } from "react";
import { Sparkle, MapTrifold, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import { useDashboardData } from "./hooks/useDashboardData";
import {
  getIncompleteTasks,
  getBlockedTasks,
  getWeeklyPriorities,
  getProjectStatus,
  calculateKPIData,
  getKpiStatusStyle,
} from "./lib/dashboardCalculations";

import { ProjectStatusCard } from "./components/dashboard/ProjectStatusCard";
import { MilestoneCards } from "./components/dashboard/MilestoneCard";
import { TaskList } from "./components/dashboard/TaskList";
import { BlockerList } from "./components/dashboard/BlockerList";
import { WeeklyPriorityList } from "./components/dashboard/WeeklyPriorityList";
import { KPIPanel } from "./components/dashboard/KPIPanel";
import { KpiEditorModal } from "./components/dashboard/KpiEditorModal";
import { LoadingSkeleton } from "./components/dashboard/LoadingSkeleton";
import type { KPI } from "./types/dashboard";

export default function DashboardPage() {
  const {
    tasks,
    kpis,
    isLoading,
    formattedToday,
    daysToMilestone,
    daysToMainEvent,
    registrationDate,
    mainEventDate,
    updateMilestone,
    setKpis,
  } = useDashboardData();

  const [editKpiForm, setEditKpiForm] = useState<Partial<KPI>>({});
  const [isEditingKpi, setIsEditingKpi] = useState(false);

  const incompleteTasks = useMemo(() => getIncompleteTasks(tasks), [tasks]);
  const blockedTasks = useMemo(() => getBlockedTasks(tasks), [tasks]);
  const weeklyPriorities = useMemo(
    () => getWeeklyPriorities(incompleteTasks),
    [incompleteTasks]
  );
  const projectStatus = useMemo(
    () => getProjectStatus(tasks, incompleteTasks),
    [tasks, incompleteTasks]
  );
  const calculatedKpis = useMemo(() => calculateKPIData(tasks), [tasks]);

  const displayKpis = useMemo(() => {
    if (kpis && kpis.length > 0) {
      return kpis.map((k) => ({
        ...k,
        color: getKpiStatusStyle(k.status),
      }));
    }
    return calculatedKpis;
  }, [kpis, calculatedKpis]);

  const handleEditKpiClick = (kpi: KPI) => {
    setEditKpiForm(kpi);
    setIsEditingKpi(true);
  };

  const handleSaveKpi = async () => {
    if (!editKpiForm.metric) return;

    const updated = kpis.map((k) =>
      k.metric === editKpiForm.metric ? (editKpiForm as KPI) : k
    );
    setKpis(updated.length > 0 ? updated : [editKpiForm as KPI]);
    setIsEditingKpi(false);

    try {
      if (editKpiForm.id) {
        await supabase
          .from("catalyst_kpis")
          .update({
            target: editKpiForm.target,
            current: editKpiForm.current,
            status: editKpiForm.status,
            progress: editKpiForm.progress,
          })
          .eq("id", editKpiForm.id);
      } else {
        await supabase.from("catalyst_kpis").upsert(
          {
            metric: editKpiForm.metric,
            target: editKpiForm.target,
            current: editKpiForm.current,
            status: editKpiForm.status,
            progress: editKpiForm.progress,
          },
          { onConflict: "metric" }
        );

        const { data } = await supabase
          .from("catalyst_kpis")
          .select("*")
          .order("id", { ascending: true });
        if (data) setKpis(data as KPI[]);
      }
    } catch (e) {
      console.error("Error saving KPI to Supabase:", e);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-extrabold text-zinc-500 shadow-sm uppercase tracking-wider">
            <Sparkle
              weight="fill"
              className="text-zinc-800 shrink-0 animate-spin"
            />{" "}
            MAPID Catalyst 2026
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
            Project Control Center
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5 font-medium">
            Pantau status, deadline, KPI, dan blocker utama kompetisi Maps That
            Think!
          </p>
        </div>
        <div className="text-xs text-zinc-500 font-semibold bg-white border border-zinc-200 px-4 py-2.5 rounded-2xl shadow-sm self-start shrink-0">
          Hari Ini:{" "}
          <span className="text-indigo-600 font-bold">{formattedToday}</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ProjectStatusCard status={projectStatus} />
        <MilestoneCards
          registrationDate={registrationDate}
          mainEventDate={mainEventDate}
          daysToMilestone={daysToMilestone}
          daysToMainEvent={daysToMainEvent}
          onSave={updateMilestone}
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskList tasks={incompleteTasks} />
        </div>

        <div className="lg:col-span-1 space-y-4">
          <BlockerList tasks={blockedTasks} />
          <WeeklyPriorityList items={weeklyPriorities} />
        </div>
      </div>

      {/* KPI Panel */}
      <KPIPanel kpis={displayKpis} onEditKpi={handleEditKpiClick} />

      {/* Bottom Banner Roadmap */}
      <div className="bg-zinc-950 text-white border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-zinc-800 rounded-full blur-[100px] pointer-events-none opacity-40" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MapTrifold size={18} /> Peta Jalan WebGIS Catalyst 2026
            </h3>
            <p className="text-xs text-zinc-450 font-semibold">
              Hubungkan data lapangan, database geospasial, dan hasil kurasi
              secara visual.
            </p>
          </div>
          <Link href="/timeline">
            <Button className="bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center shadow-sm">
              Buka Timeline <ArrowRight size={14} weight="bold" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Editor Modal */}
      <KpiEditorModal
        isOpen={isEditingKpi}
        form={editKpiForm}
        onClose={() => setIsEditingKpi(false)}
        onChange={setEditKpiForm}
        onSave={handleSaveKpi}
      />

      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton />}
    </div>
  );
}
