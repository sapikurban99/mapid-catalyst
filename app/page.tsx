"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapTrifold,
  Sparkle,
  WarningCircle,
  Flag,
  CalendarCheck,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  TrendUp,
  User,
  Clock,
  Briefcase,
  PencilSimple,
  X
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  name: string;
  workstream: string;
  pic: string;
  priority: "High" | "Medium" | "Low";
  start_date?: string;
  deadline: string;
  status: "Not Started" | "In Progress" | "Waiting Review" | "Blocked" | "Done" | "Delayed";
  dependency?: string;
  blocker?: string;
  notes?: string;
};

type KPI = {
  id?: number;
  metric: string;
  target: string;
  current: string;
  status: string;
  progress: number;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [editKpiForm, setEditKpiForm] = useState<Partial<KPI>>({});
  const [isEditingKpi, setIsEditingKpi] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Connect date dynamic real time client side
    setCurrentDate(new Date());

    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // Fetch Tasks
        const { data: tasksData } = await supabase
          .from("catalyst_tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (tasksData) {
          setTasks(tasksData as Task[]);
        } else {
          setTasks([]);
        }

        // Fetch KPIs
        const { data: kpisData } = await supabase
          .from("catalyst_kpis")
          .select("*")
          .order("id", { ascending: true });

        if (kpisData && kpisData.length > 0) {
          setKpis(kpisData as KPI[]);
        } else {
          setKpis([]);
        }
      } catch (e) {
        console.error("Supabase fetch failed:", e);
        setTasks([]);
        setKpis([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Format real-time clock dates
  const formattedToday = useMemo(() => {
    if (!currentDate) return "Loading Date...";
    return currentDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, [currentDate]);

  // Days to Registration Open (8 June 2026)
  const daysToMilestone = useMemo(() => {
    if (!currentDate) return 0;
    const target = new Date("2026-06-08T00:00:00");
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [currentDate]);

  // Days to Main Event (24 September 2026)
  const daysToMainEvent = useMemo(() => {
    if (!currentDate) return 0;
    const target = new Date("2026-09-24T00:00:00");
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [currentDate]);

  // Dynamic calculations based on tasks states
  const incompleteTasks = useMemo(() => {
    return tasks.filter(t => t.status !== "Done");
  }, [tasks]);

  const blockedTasks = useMemo(() => {
    return tasks.filter(t => t.blocker && t.blocker.trim() !== "");
  }, [tasks]);

  const weeklyPriorities = useMemo(() => {
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    const sorted = [...incompleteTasks].sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightB !== weightA) return weightB - weightA;
      return a.id.localeCompare(b.id);
    });
    return sorted.slice(0, 5).map((task, idx) => {
      let statusSuffix = "";
      if (task.status === "Blocked") statusSuffix = " · Blocked";
      else if (task.status === "Delayed") statusSuffix = " · Delayed";
      
      return {
        num: idx + 1,
        text: task.name,
        meta: `${task.deadline} · PIC: ${task.pic} · ${task.id}${statusSuffix}`
      };
    });
  }, [incompleteTasks]);

  const projectStatus = useMemo(() => {
    const isAtRisk = tasks.some(t => t.status === "Blocked" || t.status === "Delayed");
    const isNeedsAttention = incompleteTasks.length > 0;

    if (isAtRisk) {
      return {
        label: "At Risk",
        desc: "Proposal sponsor & standardisasi dataset terhambat.",
        color: "text-rose-600",
        bg: "bg-rose-50 border-rose-200",
        bullet: "bg-rose-500",
        badge: "text-rose-700 bg-rose-50 border-rose-100"
      };
    } else if (isNeedsAttention) {
      return {
        label: "Needs Attention",
        desc: `${incompleteTasks.length} tugas masih berjalan atau belum dimulai.`,
        color: "text-indigo-600",
        bg: "bg-indigo-50 border-indigo-200",
        bullet: "bg-indigo-500",
        badge: "text-indigo-700 bg-indigo-50 border-indigo-100"
      };
    } else {
      return {
        label: "On Track",
        desc: "Seluruh persiapan berjalan sempurna sesuai jadwal.",
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200",
        bullet: "bg-emerald-500",
        badge: "text-emerald-700 bg-emerald-50 border-emerald-100"
      };
    }
  }, [tasks, incompleteTasks]);

  // Dynamic KPI Completion percentages
  const kpiData = useMemo(() => {
    // Sponsor Confirmed: T049, T051, T052, T053
    const sponsorTasks = tasks.filter(t => ["T049", "T051", "T052", "T053"].includes(t.id));
    const sponsorDone = sponsorTasks.filter(t => t.status === "Done").length;
    const sponsorProgress = sponsorTasks.length > 0 ? Math.round((sponsorDone / sponsorTasks.length) * 100) : 0;
    const sponsorStatus = sponsorTasks.some(t => t.status === "Blocked") ? "At Risk" : sponsorProgress === 100 ? "Done" : sponsorProgress > 0 ? "In Progress" : "Not Started";

    // Dataset Ready: T024, T025, T026, T027, T028
    const datasetTasks = tasks.filter(t => ["T024", "T025", "T026", "T027", "T028"].includes(t.id));
    const datasetDone = datasetTasks.filter(t => t.status === "Done").length;
    const datasetProgress = datasetTasks.length > 0 ? Math.round((datasetDone / datasetTasks.length) * 100) : 0;
    const datasetStatus = datasetProgress === 100 ? "Done" : datasetProgress > 0 ? "In Progress" : "Not Started";

    // Document Ready: T006, T007, T008, T009, T028, T029, T031, T032, T033, T038, T039, T041
    const docTasks = tasks.filter(t => ["T006", "T007", "T008", "T009", "T028", "T029", "T031", "T032", "T033", "T038", "T039", "T041"].includes(t.id));
    const docDone = docTasks.filter(t => t.status === "Done").length;
    const docProgress = docTasks.length > 0 ? Math.round((docDone / docTasks.length) * 100) : 0;
    const docStatus = docProgress === 100 ? "Done" : docProgress > 0 ? "In Progress" : "Not Started";

    // Curated Teams: T011
    const curateTask = tasks.find(t => t.id === "T011");
    const curateProgress = curateTask?.status === "Done" ? 100 : 0;
    const curateStatus = curateTask?.status || "Not Started";

    // Top Finalists: T043
    const finalistTask = tasks.find(t => t.id === "T043");
    const finalistProgress = finalistTask?.status === "Done" ? 100 : 0;
    const finalistStatus = finalistTask?.status || "Not Started";

    // Key Visual Ready: T062
    const kvTask = tasks.find(t => t.id === "T062");
    const kvProgress = kvTask?.status === "Done" ? 100 : kvTask?.status === "In Progress" ? 50 : 0;
    const kvStatus = kvTask?.status || "Not Started";

    // Landing Page Live: T065
    const lpTask = tasks.find(t => t.id === "T065");
    const lpProgress = lpTask?.status === "Done" ? 100 : 0;
    const lpStatus = lpTask?.status || "Not Started";

    // Venue Requirement Confirmed: T054, T055
    const venueTasks = tasks.filter(t => ["T054", "T055"].includes(t.id));
    const venueDone = venueTasks.filter(t => t.status === "Done").length;
    const venueProgress = venueTasks.length > 0 ? Math.round((venueDone / venueTasks.length) * 100) : 0;
    const venueStatus = venueProgress === 100 ? "Done" : venueProgress > 0 ? "In Progress" : "Not Started";

    return [
      { metric: "Sponsor Confirmed", target: "4 Partners", current: `${sponsorDone} Confirmed`, status: sponsorStatus, color: sponsorStatus === "At Risk" ? "text-rose-600 bg-rose-50 border-rose-200" : sponsorStatus === "Done" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-blue-600 bg-blue-50 border-blue-200", progress: sponsorProgress },
      { metric: "Dataset Ready", target: "5 Datasets", current: `${datasetDone}/5 Ready`, status: datasetStatus, color: datasetStatus === "Done" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-blue-600 bg-blue-50 border-blue-200", progress: datasetProgress },
      { metric: "Document Ready", target: "12 Docs", current: `${docDone}/12 Ready`, status: docStatus, color: docStatus === "Done" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-blue-600 bg-blue-50 border-blue-200", progress: docProgress },
      { metric: "Curated Teams", target: "50 Teams", current: curateStatus === "Done" ? "50 Teams" : "0 Teams", status: curateStatus, color: curateStatus === "Done" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-zinc-550 bg-zinc-100 border-zinc-200", progress: curateProgress },
      { metric: "Top Finalists", target: "10 Teams", current: finalistStatus === "Done" ? "10 Teams" : "0 Teams", status: finalistStatus, color: finalistStatus === "Done" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-zinc-550 bg-zinc-100 border-zinc-200", progress: finalistProgress },
      { metric: "Key Visual Ready", target: "1 Master Visual", current: kvStatus === "Done" ? "1 Master" : kvStatus === "In Progress" ? "In Progress" : "0", status: kvStatus, color: kvStatus === "Done" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-blue-600 bg-blue-50 border-blue-200", progress: kvProgress },
      { metric: "Landing Page Live", target: "Live Site", current: lpStatus === "Done" ? "Live" : "Offline", status: lpStatus, color: lpStatus === "Done" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-zinc-550 bg-zinc-100 border-zinc-200", progress: lpProgress },
      { metric: "Venue Confirmed", target: "BINUS Auditorium", current: venueStatus === "Done" ? "Confirmed" : "In Negotiation", status: venueStatus, color: venueStatus === "Done" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-blue-600 bg-blue-50 border-blue-200", progress: venueProgress }
    ];
  }, [tasks]);

  const getKpiStatusStyle = (status: string) => {
    switch (status) {
      case "Done":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "At Risk":
        return "text-rose-600 bg-rose-50 border-rose-200";
      case "In Progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-zinc-550 bg-zinc-100 border-zinc-200";
    }
  };

  const displayKpis = useMemo(() => {
    if (kpis && kpis.length > 0) {
      return kpis.map(k => ({
        ...k,
        color: getKpiStatusStyle(k.status)
      }));
    }
    return kpiData;
  }, [kpis, kpiData]);

  const handleEditKpiClick = (kpi: KPI) => {
    setEditKpiForm(kpi);
    setIsEditingKpi(true);
  };

  const handleSaveKpi = async () => {
    if (!editKpiForm.metric) return;

    // Optimistically update local state
    const updated = kpis.map(k => k.metric === editKpiForm.metric ? (editKpiForm as KPI) : k);
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
            progress: editKpiForm.progress
          })
          .eq("id", editKpiForm.id);
      } else {
        await supabase
          .from("catalyst_kpis")
          .upsert({
            metric: editKpiForm.metric,
            target: editKpiForm.target,
            current: editKpiForm.current,
            status: editKpiForm.status,
            progress: editKpiForm.progress
          }, { onConflict: "metric" });
        
        // Re-fetch to synchronize DB IDs
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

  const progressBarColor: Record<string, string> = {
    "At Risk": "bg-rose-500",
    "In Progress": "bg-blue-500",
    "Done": "bg-emerald-500",
    "Not Started": "bg-zinc-300",
  };

  const getPriorityStyle = (priority: Task["priority"]) => {
    switch (priority) {
      case "High": return "bg-rose-50 text-rose-700 border-rose-100 font-bold";
      case "Medium": return "bg-amber-50 text-amber-755 border-amber-100";
      default: return "bg-zinc-50 text-zinc-500 border-zinc-150";
    }
  };

  const getStatusStyle = (status: Task["status"]) => {
    switch (status) {
      case "Done": return "bg-emerald-50 text-emerald-700 border-emerald-150";
      case "In Progress": return "bg-blue-50 text-blue-700 border-blue-150";
      case "Blocked": return "bg-rose-50 text-rose-700 border-rose-150 ring-2 ring-rose-50 animate-pulse";
      case "Waiting Review": return "bg-purple-50 text-purple-700 border-purple-150";
      default: return "bg-zinc-100 text-zinc-650 border-zinc-200";
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-extrabold text-zinc-500 shadow-sm uppercase tracking-wider">
            <Sparkle weight="fill" className="text-zinc-800 shrink-0 animate-spin" /> MAPID Catalyst 2026
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">Project Control Center</h1>
          <p className="text-sm text-zinc-500 mt-0.5 font-medium">Pantau status, deadline, KPI, dan blocker utama kompetisi Maps That Think!</p>
        </div>
        <div className="text-xs text-zinc-500 font-semibold bg-white border border-zinc-200 px-4 py-2.5 rounded-2xl shadow-sm self-start shrink-0">
          Hari Ini: <span className="text-indigo-600 font-bold">{formattedToday}</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Dynamic Project Status Card */}
        <Card className={`p-5 shadow-sm rounded-2xl bg-white border flex flex-col gap-3 transition duration-300 ${projectStatus.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Project Status</span>
            <ShieldCheck className={projectStatus.color} size={22} weight="fill" />
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${projectStatus.bullet}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${projectStatus.bullet}`}></span>
            </span>
            <p className="text-2xl font-black text-zinc-900">{projectStatus.label}</p>
          </div>
          <p className="text-xs text-zinc-650 leading-snug font-semibold">{projectStatus.desc}</p>
        </Card>

        {/* Dynamic Milestone Card */}
        <Card className="p-5 shadow-sm rounded-2xl bg-white border border-zinc-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Key Milestone</span>
            <Flag className="text-indigo-600" size={22} weight="fill" />
          </div>
          <p className="text-base font-extrabold text-zinc-900 leading-tight">Registration Open</p>
          <p className="text-xs text-zinc-500 font-semibold">
            📅 8 Juni 2026 · <span className="text-indigo-600 font-bold">{daysToMilestone} Hari</span> lagi
          </p>
        </Card>

        {/* Dynamic Main Event Card */}
        <Card className="p-5 shadow-sm rounded-2xl bg-white border border-zinc-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Days to Main Event</span>
            <CalendarCheck className="text-rose-600" size={22} weight="fill" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-zinc-950">{daysToMainEvent}</span>
            <span className="text-xs font-bold text-zinc-400 uppercase font-mono">Hari</span>
          </div>
          <p className="text-xs text-zinc-500 font-semibold leading-snug">Main Event: 24–25 Sep 2026 @ BINUS</p>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Incomplete Tasks Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4 mb-4 gap-3">
              <div>
                <h2 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
                  <Briefcase className="text-indigo-600" size={20} />
                  Outstanding Tasks ({incompleteTasks.length})
                </h2>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Daftar tugas yang belum diselesaikan divisi.</p>
              </div>
              <Link href="/tasks" className="text-xs font-bold text-indigo-600 hover:underline shrink-0">
                Buka Task Board
              </Link>
            </div>

            <div className="flex-1 space-y-2.5">
              {incompleteTasks.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 font-medium text-xs space-y-1">
                  <CheckCircle size={32} className="mx-auto text-emerald-500 mb-1" />
                  <p className="font-bold">Luar Biasa! Semua Tugas Selesai.</p>
                  <p>Project Control Center dalam kondisi On Track sempurna.</p>
                </div>
              ) : (
                incompleteTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition duration-200">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-bold text-zinc-950 leading-snug">{task.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-zinc-450">
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-750 px-2 py-0.5 rounded-lg flex items-center gap-1 font-extrabold">
                          {task.workstream}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} /> PIC: {task.pic}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded tracking-wide ${getStatusStyle(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="text-[10px] font-bold font-mono text-zinc-400 bg-white border border-zinc-150 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Clock size={12} /> {task.deadline}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Columns */}
        <div className="lg:col-span-1 space-y-4">
            {/* Dynamic Critical Blockers */}
          <Card className="bg-rose-50/20 border border-rose-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-rose-100 pb-3 mb-3">
              <WarningCircle className="text-rose-600 shrink-0" size={18} weight="fill" />
              <h3 className="font-extrabold text-sm text-zinc-900">Critical Blockers ({blockedTasks.length})</h3>
            </div>
            <div className="space-y-3">
              {blockedTasks.length === 0 ? (
                <p className="text-xs text-zinc-400 font-medium py-4 text-center">Tidak ada blocker kritis saat ini.</p>
              ) : (
                blockedTasks.map(task => (
                  <div key={task.id} className="p-3.5 bg-white border border-rose-100 rounded-2xl shadow-xs">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
                      {task.workstream}
                    </span>
                    <p className="text-xs font-black text-zinc-900 mt-2">{task.name}</p>
                    <p className="text-[10px] text-zinc-550 leading-relaxed mt-1 font-semibold">
                      {task.blocker}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Dynamic Weekly Priorities */}
          <Card className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-150 pb-3 mb-3">
              <CheckCircle className="text-indigo-600 shrink-0" size={18} weight="fill" />
              <h3 className="font-extrabold text-sm text-zinc-900">This Week Priority</h3>
            </div>
            <div className="space-y-2.5">
              {weeklyPriorities.length === 0 ? (
                <p className="text-xs text-zinc-400 font-medium py-4 text-center">Tidak ada tugas prioritas minggu ini.</p>
              ) : (
                weeklyPriorities.map(item => (
                  <div key={item.num} className="flex gap-2.5 p-2 hover:bg-zinc-50 rounded-xl transition duration-200">
                    <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold mt-0.5 border border-indigo-100">
                      {item.num}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-zinc-900 leading-snug">{item.text}</p>
                      <p className="text-[10px] text-zinc-450 mt-0.5 font-semibold leading-none">{item.meta}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* KPI Panel */}
      <Card className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-150 pb-3 mb-4 gap-3">
          <div>
            <h2 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
              <TrendUp className="text-indigo-600 shrink-0" size={18} />
              Key Performance Indicators
            </h2>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">Pencapaian target operasional MAPID Catalyst 2026.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayKpis.map((kpi, idx) => (
            <div key={idx} className="relative group p-4 border border-zinc-150 bg-zinc-50/50 rounded-2xl space-y-2.5 shadow-xs flex flex-col justify-between">
              <button 
                onClick={() => handleEditKpiClick(kpi)}
                className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition opacity-0 group-hover:opacity-100 shadow-xs cursor-pointer z-10"
                title={`Edit ${kpi.metric}`}
              >
                <PencilSimple size={12} />
              </button>
              <div className="space-y-1 pr-6">
                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wide whitespace-nowrap ${kpi.color}`}>
                  {kpi.status}
                </span>
                <p className="text-xs font-black text-zinc-900 leading-tight pt-1">{kpi.metric}</p>
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
          ))}
        </div>
      </Card>

      {/* Bottom Banner Roadmap */}
      <div className="bg-zinc-950 text-white border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-zinc-800 rounded-full blur-[100px] pointer-events-none opacity-40" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MapTrifold size={18} /> Peta Jalan WebGIS Catalyst 2026
            </h3>
            <p className="text-xs text-zinc-450 font-semibold">Hubungkan data lapangan, database geospasial, dan hasil kurasi secara visual.</p>
          </div>
          <Link href="/timeline">
            <Button className="bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center shadow-sm">
              Buka Timeline <ArrowRight size={14} weight="bold" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Editor Modal Overlay */}
      {isEditingKpi && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white border border-zinc-200 shadow-2xl rounded-3xl p-6 w-full max-w-md mx-4 animate-[scaleIn_0.2s_ease-out] space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-extrabold text-base text-zinc-950 flex items-center gap-2">
                <PencilSimple size={18} className="text-indigo-650" /> Edit KPI Metrics
              </h3>
              <button 
                onClick={() => setIsEditingKpi(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-zinc-750">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">KPI Metric Name</label>
                <Input 
                  type="text" 
                  value={editKpiForm.metric || ""} 
                  disabled
                  className="bg-zinc-100 border-zinc-200 text-zinc-500 rounded-xl py-2 px-3 text-xs cursor-not-allowed font-bold" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Target</label>
                  <Input 
                    type="text" 
                    value={editKpiForm.target || ""} 
                    onChange={(e) => setEditKpiForm({ ...editKpiForm, target: e.target.value })}
                    className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950 font-medium" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Value</label>
                  <Input 
                    type="text" 
                    value={editKpiForm.current || ""} 
                    onChange={(e) => setEditKpiForm({ ...editKpiForm, current: e.target.value })}
                    className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950 font-medium" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</label>
                  <select 
                    value={editKpiForm.status || "Not Started"}
                    onChange={(e) => setEditKpiForm({ ...editKpiForm, status: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-semibold text-zinc-800 focus:outline-none"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="At Risk">At Risk</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Progress ({editKpiForm.progress || 0}%)</label>
                  <Input 
                    type="number" 
                    min={0}
                    max={100}
                    value={editKpiForm.progress !== undefined ? editKpiForm.progress : 0} 
                    onChange={(e) => setEditKpiForm({ ...editKpiForm, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950 font-mono font-bold" 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-zinc-100">
              <Button 
                onClick={() => setIsEditingKpi(false)}
                variant="outline"
                className="bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveKpi}
                className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                Save KPI
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Loading Spinner Modal Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9999] flex items-center justify-center animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white/90 border border-zinc-100/80 shadow-2xl rounded-3xl p-6 flex flex-col items-center gap-4 max-w-[200px] text-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-zinc-900 border-r-zinc-900 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800">Memuat Data...</p>
              <p className="text-[9px] text-zinc-400 font-medium mt-0.5">Membaca Supabase</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
