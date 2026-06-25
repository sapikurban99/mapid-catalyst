"use client";

import { useState, useMemo, useEffect } from "react";
import { Sparkle, MapTrifold, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


import { useDashboardData } from "./hooks/useDashboardData";
import {
  getIncompleteTasks,
  getBlockedTasks,
  getWeeklyPriorities,
  getProjectStatus,
} from "./lib/dashboardCalculations";

import { ProjectStatusCard } from "./components/dashboard/ProjectStatusCard";
import { MilestoneCards } from "./components/dashboard/MilestoneCard";
import { TaskList } from "./components/dashboard/TaskList";
import { BlockerList } from "./components/dashboard/BlockerList";
import { WeeklyPriorityList } from "./components/dashboard/WeeklyPriorityList";

import { LoadingSkeleton } from "./components/dashboard/LoadingSkeleton";

export default function DashboardPage() {
  const {
    tasks,
    isLoading,
    formattedToday,
    daysToMainEvent,
    registrationDate,
    mainEventDate,
    updateMilestone,
  } = useDashboardData();

  const [registrationCount, setRegistrationCount] = useState(0);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(true);

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
  useEffect(() => {
    const fetchRegistrationCount = async () => {
      try {
        const res = await fetch(
          "https://geoserver.mapid.io/layers_new/get_layer?api_key=6015daaa36324bb885749c34fe56fe13&layer_id=6a2a1811bc475d2ec56a9b2b&project_id=6a2a178d7463a498641f2d33"
        );
        const data = await res.json();
        let totalTim = 0;
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item && Array.isArray(item.features)) {
              totalTim += item.features.length;
            }
          }
        } else if (data && Array.isArray(data.features)) {
          totalTim = data.features.length;
        }
        setRegistrationCount(totalTim);
      } catch (e) {
        console.error("Error fetching registration count:", e);
      } finally {
        setIsLoadingRegistration(false);
      }
    };
    fetchRegistrationCount();
  }, []);



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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ProjectStatusCard status={projectStatus} />
        <MilestoneCards
          registrationCount={registrationCount}
          registrationCloseDate={registrationDate}
          mainEventDate={mainEventDate}
          daysToMainEvent={daysToMainEvent}
          onSave={updateMilestone}
        />
        {/* Registration Count Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Total Pendaftar
          </p>
          <div className="text-3xl font-extrabold text-indigo-600">
            {isLoadingRegistration ? (
              <span className="inline-block w-16 h-9 bg-zinc-100 rounded-lg animate-pulse" />
            ) : (
              registrationCount
            )}
          </div>
          <p className="text-[11px] font-semibold text-zinc-400 mt-1">
            tim terdaftar
          </p>
        </div>
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

      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton />}
    </div>
  );
}
