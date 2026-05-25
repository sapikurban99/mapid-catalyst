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
  Briefcase
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  name: string;
  workstream: string;
  pic: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "Not Started" | "In Progress" | "Waiting Review" | "Blocked" | "Done" | "Delayed";
  dependency?: string;
  blocker?: string;
  notes?: string;
};

const initialTasks: Task[] = [
  { id: "T001", name: "Finalize master timeline", workstream: "Program Management", pic: "Hadi / Lead", priority: "High", deadline: "20 Mei 2026", status: "In Progress", dependency: "Draft timeline", notes: "Output: Master timeline approved" },
  { id: "T002", name: "Set up weekly sync schedule", workstream: "Program Management", pic: "Hadi / Lead", priority: "Medium", deadline: "22 Mei 2026", status: "Done", dependency: "Internal calendar", notes: "Output: Weekly sync schedule" },
  { id: "T003", name: "Establish risk register", workstream: "Program Management", pic: "Hadi / Lead", priority: "High", deadline: "25 Mei 2026", status: "In Progress", dependency: "Project scope", notes: "Output: Risk register" },
  { id: "T004", name: "Finalize FAQ peserta", workstream: "Academic & Competition", pic: "Fariz / Academy", priority: "High", deadline: "25 Mei 2026", status: "In Progress", dependency: "Guidance draft", notes: "Output: FAQ final" },
  { id: "T005", name: "Complete PRD & Proposal template", workstream: "Academic & Competition", pic: "Fariz / Academy", priority: "High", deadline: "30 Mei 2026", status: "Not Started", dependency: "Existing template", notes: "Output: Final PRD & proposal template" },
  { id: "T006", name: "Finalize general guidance document", workstream: "Academic & Competition", pic: "Fariz / Academy", priority: "High", deadline: "28 Mei 2026", status: "Waiting Review", dependency: "Latest guidance draft", notes: "Output: Published guidance" },
  { id: "T007", name: "Prepare Property Go sample dataset", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "High", deadline: "25 Mei 2026", status: "In Progress", dependency: "Raw Property Go data", notes: "Output: Sample dataset" },
  { id: "T008", name: "Write Data Dictionary & API rules", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "Medium", deadline: "29 Mei 2026", status: "Not Started", dependency: "Dataset schema", notes: "Output: Data dictionary & API rules" },
  { id: "T009", name: "Setup GEO MAPID campaign template", workstream: "Data & Spatial Tech", pic: "Tech Team", priority: "High", deadline: "26 Mei 2026", status: "In Progress", dependency: "GEO MAPID setup", notes: "Output: GEO MAPID campaign template" },
  { id: "T010", name: "Write MAPID MAPS basemap guide", workstream: "Data & Spatial Tech", pic: "Tech Team", priority: "Medium", deadline: "4 Juni 2026", status: "Not Started", dependency: "MAPID MAPS access", notes: "Output: Basemap guide" },
  { id: "T011", name: "Prepare WA broadcast copy", workstream: "Marketing & Design", pic: "Dwi / Marketing", priority: "Low", deadline: "5 Juni 2026", status: "Not Started", dependency: "Final CTA & timeline", notes: "Output: WA broadcast copy" },
  { id: "T012", name: "Finalize Key Visual concept", workstream: "Marketing & Design", pic: "Ica / Designer Team", priority: "High", deadline: "28 Mei 2026", status: "In Progress", dependency: "Creative brief", notes: "Output: Key visual concept" },
  { id: "T013", name: "Create Launch Poster assets", workstream: "Marketing & Design", pic: "Ica / Designer Team", priority: "High", deadline: "2 Juni 2026", status: "Not Started", dependency: "Key visual concept", notes: "Output: Launch poster assets" },
  { id: "T014", name: "Finalize sponsor proposal & benefit package", workstream: "Sponsorship & Outreach", pic: "Aulia / Partnership", priority: "High", deadline: "24 Juli 2026", status: "Blocked", dependency: "Sponsor benefit revision", blocker: "Sponsor Proposal Belum Dikirim. Menghambat proses outreach sponsor dan partnership.", notes: "Output: Sponsor proposal final" },
  { id: "T015", name: "Compile initial outreach target list", workstream: "Sponsorship & Outreach", pic: "Aulia / Partnership", priority: "Medium", deadline: "26 Mei 2026", status: "Done", dependency: "Sponsor categories", notes: "Output: Outreach target list" },
  { id: "T016", name: "Finalize BINUS Auditorium requirements", workstream: "Main Event Operational", pic: "Aulia / Partnership", priority: "High", deadline: "24 Juni 2026", status: "In Progress", dependency: "BINUS coordination", notes: "Output: Venue requirement document" },
  { id: "T017", name: "Clean Menu Go 15 May campaign data", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "High", deadline: "24 Mei 2026", status: "Not Started", dependency: "Menu Go campaign data", notes: "Output: Clean dataset" },
  { id: "T018", name: "Draft landing page copy", workstream: "Marketing & Design", pic: "Dwi / Marketing", priority: "High", deadline: "25 Mei 2026", status: "Not Started", dependency: "One pager & guidance", notes: "Output: Landing page copy" },
  { id: "T019", name: "Prepare mentor outline & attendance tracker", workstream: "Academic & Competition", pic: "Fariz / Academy", priority: "Medium", deadline: "15 Juni 2026", status: "Not Started", dependency: "Mentoring agenda", notes: "Output: Mentor outline & tracker" },
  { id: "T020", name: "Draft Survey Guideline & Mission Template", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "High", deadline: "31 Mei 2026", status: "In Progress", dependency: "Survey concept", notes: "Output: Survey guideline & mission template" },
  { id: "T021", name: "Formulate survey budget allocation", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "High", deadline: "2 Juni 2026", status: "Not Started", dependency: "Budget assumption", notes: "Output: Survey budget guideline" }
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Connect date dynamic real time client side
    setCurrentDate(new Date());

    async function fetchTasks() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from("catalyst_tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setTasks(data as Task[]);
        } else {
          setTasks(initialTasks);
        }
      } catch (e) {
        console.error("Supabase fetch failed, fallback to local:", e);
        setTasks(initialTasks);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
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
    const totalTasks = tasks.length || 1;
    const doneTasksCount = tasks.filter(t => t.status === "Done").length;
    const completionPct = Math.round((doneTasksCount / totalTasks) * 100);

    return [
      { metric: "Sponsor Confirmed", target: "TBD", current: "0", status: "At Risk", color: "text-amber-600 bg-amber-50 border-amber-200", progress: 0 },
      { metric: "Dataset Ready", target: "4 Datasets", current: "1 Dataset", status: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200", progress: 25 },
      { metric: "Document Ready", target: "18 Docs", current: "5 Docs", status: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200", progress: 28 },
      { metric: "Registered Teams", target: "100+ Teams", current: "0 Teams", status: "Not Started", color: "text-zinc-500 bg-zinc-100 border-zinc-200", progress: 0 },
      { metric: "Curated Teams", target: "50 Teams", current: "0 Teams", status: "Not Started", color: "text-zinc-500 bg-zinc-100 border-zinc-200", progress: 0 },
      { metric: "Top Finalists", target: "10 Teams", current: "0 Teams", status: "Not Started", color: "text-zinc-500 bg-zinc-100 border-zinc-200", progress: 0 },
      { metric: "Key Visual Ready", target: "1 Master Visual", current: "0", status: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200", progress: 0 },
      { metric: "Venue Requirement Confirmed", target: "1 Venue Package", current: "0", status: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200", progress: 0 }
    ];
  }, [tasks]);

  const progressBarColor: Record<string, string> = {
    "At Risk": "bg-rose-500",
    "In Progress": "bg-blue-500",
    "Done": "bg-emerald-500",
    "Not Started": "bg-zinc-300",
  };

  const getPriorityStyle = (priority: Task["priority"]) => {
    switch (priority) {
      case "High": return "bg-rose-50 text-rose-700 border-rose-100 font-bold";
      case "Medium": return "bg-amber-50 text-amber-750 border-amber-100";
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
              <h3 className="font-extrabold text-sm text-zinc-900">Critical Blockers (2)</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 bg-white border border-rose-100 rounded-2xl shadow-xs">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
                  Sponsorship & Outreach
                </span>
                <p className="text-xs font-black text-zinc-900 mt-2">Sponsor Proposal Belum Dikirim</p>
                <p className="text-[10px] text-zinc-550 leading-relaxed mt-1 font-semibold">
                  Menghambat proses outreach sponsor dan partnership. Harus final sebelum <span className="text-rose-600 font-bold">24 Juli 2026</span>.
                </p>
              </div>
              <div className="p-3.5 bg-white border border-rose-100 rounded-2xl shadow-xs">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
                  Data & Spatial Tech
                </span>
                <p className="text-xs font-black text-zinc-900 mt-2">Standardisasi Dataset Menu Go</p>
                <p className="text-[10px] text-zinc-550 leading-relaxed mt-1 font-semibold">
                  Menghambat Data Dictionary, Sample Dataset, dan API/Data Access Guide.
                </p>
              </div>
            </div>
          </Card>

          {/* Dynamic Weekly Priorities */}
          <Card className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-150 pb-3 mb-3">
              <CheckCircle className="text-indigo-600 shrink-0" size={18} weight="fill" />
              <h3 className="font-extrabold text-sm text-zinc-900">This Week Priority</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { num: 1, text: "Finalisasi FAQ & Panduan Kompetisi", meta: "25 Mei · PIC: Fariz · T004, T006" },
                { num: 2, text: "Template Campaign GEO MAPID", meta: "26 Mei · PIC: Tech Team · T009" },
                { num: 3, text: "Desain Key Visual & Launch Poster", meta: "28 Mei · PIC: Ica · T012, T013" },
                { num: 4, text: "Sponsor Proposal & Benefit Package", meta: "24 Juli · PIC: Aulia · T014 · Blocked" },
                { num: 5, text: "Clean Menu Go 15 May Data", meta: "24 Mei · PIC: Data Team · T017 · Not Started" }
              ].map(item => (
                <div key={item.num} className="flex gap-2.5 p-2 hover:bg-zinc-50 rounded-xl transition duration-200">
                  <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold mt-0.5 border border-indigo-100">
                    {item.num}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-zinc-900 leading-snug">{item.text}</p>
                    <p className="text-[10px] text-zinc-450 mt-0.5 font-semibold leading-none">{item.meta}</p>
                  </div>
                </div>
              ))}
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
          {kpiData.map((kpi, idx) => (
            <div key={idx} className="p-4 border border-zinc-150 bg-zinc-50/50 rounded-2xl space-y-2.5 shadow-xs flex flex-col justify-between">
              <div className="space-y-1">
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
