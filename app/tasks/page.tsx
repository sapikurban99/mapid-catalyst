"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ClipboardText, 
  User, 
  CalendarBlank, 
  Warning, 
  Link as LinkIcon, 
  Note, 
  Sparkle, 
  Info,
  CheckCircle,
  Clock,
  WarningCircle,
  Plus,
  PencilSimple,
  FloppyDisk,
  X
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  doc_link?: string;
  blocker?: string;
  notes?: string;
};

const initialTasks: Task[] = [
  { id: "T001", name: "Finalize master timeline", workstream: "Program Management", pic: "Hadi / Lead", priority: "High", start_date: "1 Mei 2026", deadline: "20 Mei 2026", status: "In Progress", dependency: "Draft timeline", notes: "Output: Master timeline approved" },
  { id: "T002", name: "Set up weekly sync schedule", workstream: "Program Management", pic: "Hadi / Lead", priority: "Medium", start_date: "18 Mei 2026", deadline: "22 Mei 2026", status: "Done", dependency: "Internal calendar", notes: "Output: Weekly sync schedule" },
  { id: "T003", name: "Establish risk register", workstream: "Program Management", pic: "Hadi / Lead", priority: "High", start_date: "15 Mei 2026", deadline: "25 Mei 2026", status: "In Progress", dependency: "Project scope", notes: "Output: Risk register" },
  { id: "T004", name: "Finalize FAQ peserta", workstream: "Academic & Competition", pic: "Fariz / Academy", priority: "High", start_date: "12 Mei 2026", deadline: "25 Mei 2026", status: "In Progress", dependency: "Guidance draft", notes: "Output: FAQ final" },
  { id: "T005", name: "Complete PRD & Proposal template", workstream: "Academic & Competition", pic: "Fariz / Academy", priority: "High", start_date: "19 Mei 2026", deadline: "30 Mei 2026", status: "Not Started", dependency: "Existing template", notes: "Output: Final PRD & proposal template" },
  { id: "T006", name: "Finalize general guidance document", workstream: "Academic & Competition", pic: "Fariz / Academy", priority: "High", start_date: "15 Mei 2026", deadline: "28 Mei 2026", status: "Waiting Review", dependency: "Latest guidance draft", notes: "Output: Published guidance" },
  { id: "T007", name: "Prepare Property Go sample dataset", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "High", start_date: "1 Juni 2026", deadline: "3 Juli 2026", status: "In Progress", dependency: "Raw Property Go data", notes: "Output: Sample dataset" },
  { id: "T008", name: "Write Data Dictionary & API rules", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "Medium", start_date: "8 Juni 2026", deadline: "3 Juli 2026", status: "Not Started", dependency: "Dataset schema", notes: "Output: Data dictionary & API rules" },
  { id: "T009", name: "Setup GEO MAPID campaign template", workstream: "Data & Spatial Tech", pic: "Tech Team", priority: "High", start_date: "1 Juni 2026", deadline: "3 Juli 2026", status: "In Progress", dependency: "GEO MAPID setup", notes: "Output: GEO MAPID campaign template" },
  { id: "T010", name: "Write MAPID MAPS basemap guide", workstream: "Data & Spatial Tech", pic: "Tech Team", priority: "Medium", start_date: "15 Juni 2026", deadline: "3 Juli 2026", status: "Not Started", dependency: "MAPID MAPS access", notes: "Output: Basemap guide" },
  { id: "T011", name: "Prepare WA broadcast copy", workstream: "Marketing & Design", pic: "Dwi / Marketing", priority: "Low", start_date: "26 Mei 2026", deadline: "5 Juni 2026", status: "Not Started", dependency: "Final CTA & timeline", notes: "Output: WA broadcast copy" },
  { id: "T012", name: "Finalize Key Visual concept", workstream: "Marketing & Design", pic: "Ica / Designer Team", priority: "High", start_date: "15 Mei 2026", deadline: "28 Mei 2026", status: "In Progress", dependency: "Creative brief", notes: "Output: Key visual concept" },
  { id: "T013", name: "Create Launch Poster assets", workstream: "Marketing & Design", pic: "Ica / Designer Team", priority: "High", start_date: "25 Mei 2026", deadline: "2 Juni 2026", status: "Not Started", dependency: "Key visual concept", notes: "Output: Launch poster assets" },
  { id: "T014", name: "Finalize sponsor proposal & benefit package", workstream: "Sponsorship & Outreach", pic: "Aulia / Partnership", priority: "High", start_date: "1 Juni 2026", deadline: "24 Juli 2026", status: "Blocked", dependency: "Sponsor benefit revision", blocker: "Sponsor Proposal Belum Dikirim. Menghambat proses outreach sponsor dan partnership.", notes: "Output: Sponsor proposal final" },
  { id: "T015", name: "Compile initial outreach target list", workstream: "Sponsorship & Outreach", pic: "Aulia / Partnership", priority: "Medium", start_date: "18 Mei 2026", deadline: "26 Mei 2026", status: "Done", dependency: "Sponsor categories", notes: "Output: Outreach target list" },
  { id: "T016", name: "Finalize BINUS Auditorium requirements", workstream: "Main Event Operational", pic: "Aulia / Partnership", priority: "High", start_date: "1 Juni 2026", deadline: "24 Juni 2026", status: "In Progress", dependency: "BINUS coordination", notes: "Output: Venue requirement document" },
  { id: "T017", name: "Clean Menu Go 15 May campaign data", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "High", start_date: "15 Mei 2026", deadline: "24 Mei 2026", status: "Not Started", dependency: "Menu Go campaign data", notes: "Output: Clean dataset" },
  { id: "T018", name: "Draft landing page copy", workstream: "Marketing & Design", pic: "Dwi / Marketing", priority: "High", start_date: "18 Mei 2026", deadline: "25 Mei 2026", status: "Not Started", dependency: "One pager & guidance", notes: "Output: Landing page copy" },
  { id: "T019", name: "Prepare mentor outline & attendance tracker", workstream: "Academic & Competition", pic: "Fariz / Academy", priority: "Medium", start_date: "20 Juni 2026", deadline: "5 Juli 2026", status: "Not Started", dependency: "Mentoring agenda", notes: "Output: Mentor outline & tracker" },
  { id: "T020", name: "Draft Survey Guideline & Mission Template", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "High", start_date: "25 Juni 2026", deadline: "8 Juli 2026", status: "In Progress", dependency: "Survey concept", notes: "Output: Survey guideline & mission template" },
  { id: "T021", name: "Formulate survey budget allocation", workstream: "Data & Spatial Tech", pic: "Data Team", priority: "High", start_date: "1 Juli 2026", deadline: "8 Juli 2026", status: "Not Started", dependency: "Budget assumption", notes: "Output: Survey budget guideline" }
];

export default function TasksPage() {
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeWorkstream, setActiveWorkstream] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const workstreams = [
    "All",
    "Program Management",
    "Academic & Competition",
    "Data & Spatial Tech",
    "Marketing & Design",
    "Sponsorship & Outreach",
    "Main Event Operational"
  ];
  const statuses = ["All", "Not Started", "In Progress", "Waiting Review", "Blocked", "Done", "Delayed"];

  // Fetch tasks from Supabase on mount
  useEffect(() => {
    async function fetchTasks() {
      try {
        const { data, error } = await supabase
          .from("catalyst_tasks")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (data && data.length > 0) {
          setLocalTasks(data as Task[]);
        } else {
          setLocalTasks(initialTasks);
        }
      } catch (e) {
        console.error("Supabase fetch failed, fallback to local:", e);
        setLocalTasks(initialTasks);
      }
    }
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return localTasks.filter(task => {
      const matchWs = activeWorkstream === "All" || task.workstream === activeWorkstream;
      const matchStatus = statusFilter === "All" || task.status === statusFilter;
      return matchWs && matchStatus;
    });
  }, [localTasks, activeWorkstream, statusFilter]);

  const getStatusStyle = (status: Task["status"]) => {
    switch (status) {
      case "Done": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Waiting Review": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Blocked": return "bg-rose-100 text-rose-800 border-rose-250 ring-2 ring-rose-50";
      case "Delayed": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const getPriorityStyle = (priority: Task["priority"]) => {
    switch (priority) {
      case "High": return "bg-rose-50 text-rose-700 border-rose-100 font-bold";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-zinc-50 text-zinc-500 border-zinc-100";
    }
  };

  const handleEditClick = (task: Task) => {
    setEditForm(task);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.id) return;

    // Update local state (optimistic)
    const updated = localTasks.map(t => t.id === editForm.id ? (editForm as Task) : t);
    setLocalTasks(updated);
    setSelectedTaskDetail(editForm as Task);
    setIsEditing(false);

    // Save to Supabase in the background
    try {
      await supabase
        .from("catalyst_tasks")
        .upsert(editForm);
    } catch (e) {
      console.error("Error writing task to Supabase:", e);
    }
  };

  const handleCreateNew = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: "Standardized Task Name",
      workstream: activeWorkstream === "All" ? "Program Management" : activeWorkstream,
      pic: "Hadi / Lead",
      priority: "Medium",
      deadline: "10 Juni 2026",
      status: "Not Started",
      notes: "Tulis detail tugas baru di sini."
    };

    setLocalTasks([newTask, ...localTasks]);
    setSelectedTaskDetail(newTask);
    handleEditClick(newTask);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Workstream Tasks</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola tugas operasional, PIC, tenggat waktu, dan blocker di setiap divisi.</p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer self-start"
        >
          <Plus weight="bold" /> Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Workstream - horizontal scroll */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Workstream</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {workstreams.map(ws => (
              <button
                key={ws}
                onClick={() => { setActiveWorkstream(ws); setSelectedTaskDetail(null); setIsEditing(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeWorkstream === ws
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {ws}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status filter - horizontal scroll */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">Status</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
              {statuses.map(st => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setSelectedTaskDetail(null); setIsEditing(false); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === st
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-semibold text-zinc-400 shrink-0">
            <span className="text-zinc-950 font-bold">{filteredTasks.length}</span> tugas ditemukan
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Tasks Table */}
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-2.5">Nama Task</th>
                  <th className="pb-2.5">PIC</th>
                  <th className="pb-2.5 text-center">Priority</th>
                  <th className="pb-2.5 text-center">Deadline</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400 font-medium text-sm">
                      <ClipboardText className="mx-auto text-zinc-300 mb-2" size={32} />
                      Tidak ada tugas yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => { setSelectedTaskDetail(task); setIsEditing(false); }}
                      className={`hover:bg-zinc-50 transition-colors cursor-pointer ${
                        selectedTaskDetail?.id === task.id ? "bg-zinc-50" : ""
                      }`}
                    >
                      <td className="py-3 pr-4 text-zinc-900 font-semibold max-w-[200px] truncate">{task.name}</td>
                      <td className="py-3 text-zinc-600 font-medium">{task.pic}</td>
                      <td className="py-3 text-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 text-center text-zinc-500 font-mono text-xs">{task.deadline}</td>
                      <td className="py-3 text-right">
                        <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border tracking-wide ${getStatusStyle(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Side: Detailed Task Drawer Card */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
            {selectedTaskDetail === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <ClipboardText size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih tugas pada tabel sebelah kiri untuk meninjau rincian project management.</p>
              </div>
            ) : isEditing ? (
              /* Editable Task Form */
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                    <PencilSimple size={16} /> Edit Task Data
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Tugas</label>
                    <Input 
                      type="text" 
                      value={editForm.name || ""} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Workstream</label>
                      <select 
                        value={editForm.workstream || "Program Management"}
                        onChange={(e) => setEditForm({ ...editForm, workstream: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-850 focus:outline-none"
                      >
                        {workstreams.filter(w => w !== "All").map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Status</label>
                      <select 
                        value={editForm.status || "Not Started"}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-850 focus:outline-none"
                      >
                        {statuses.filter(s => s !== "All").map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">PIC</label>
                      <Input 
                        type="text" 
                        value={editForm.pic || ""} 
                        onChange={(e) => setEditForm({ ...editForm, pic: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Deadline</label>
                      <Input 
                        type="text" 
                        value={editForm.deadline || ""} 
                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Priority</label>
                      <select 
                        value={editForm.priority || "Medium"}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-850 focus:outline-none"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Dependency</label>
                      <Input 
                        type="text" 
                        value={editForm.dependency || ""} 
                        onChange={(e) => setEditForm({ ...editForm, dependency: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Blocker (Masalah Utama)</label>
                    <Input 
                      type="text" 
                      value={editForm.blocker || ""} 
                      onChange={(e) => setEditForm({ ...editForm, blocker: e.target.value })}
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Ops</label>
                    <textarea 
                      value={editForm.notes || ""} 
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button 
                    onClick={handleSave}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FloppyDisk size={14} /> Save Task
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-semibold py-2 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* Detail Panel View */
              <div className="space-y-5">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {selectedTaskDetail.workstream}
                    </span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-tight">{selectedTaskDetail.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleEditClick(selectedTaskDetail)}
                    className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                  >
                    <PencilSimple size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium border-b border-zinc-150 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Penanggung Jawab (PIC)</p>
                    <p className="text-zinc-855 flex items-center gap-1.5 font-bold">
                      <User size={14} className="text-zinc-400" /> {selectedTaskDetail.pic}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Tenggat Waktu</p>
                    <p className="text-zinc-800 flex items-center gap-1.5 font-mono">
                      <CalendarBlank size={14} className="text-zinc-400" /> {selectedTaskDetail.deadline}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium border-b border-zinc-150 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Prioritas</p>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(selectedTaskDetail.priority)}`}>
                        {selectedTaskDetail.priority}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Status Tugas</p>
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider ${getStatusStyle(selectedTaskDetail.status)}`}>
                        {selectedTaskDetail.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dependency details */}
                {selectedTaskDetail.dependency && (
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Ketergantungan (Dependency)</p>
                    <p className="text-zinc-700 bg-zinc-50 border border-zinc-150 rounded-xl p-2 font-medium">
                      🔗 {selectedTaskDetail.dependency}
                    </p>
                  </div>
                )}

                {/* Blocker Alert */}
                {selectedTaskDetail.blocker && (
                  <div className="p-3.5 bg-rose-50 border border-rose-150 rounded-2xl space-y-1 text-xs">
                    <p className="font-bold text-rose-800 flex items-center gap-1.5">
                      <WarningCircle size={16} weight="fill" /> Masalah Utama (Blocker)
                    </p>
                    <p className="text-rose-700/90 font-medium leading-tight mt-1">{selectedTaskDetail.blocker}</p>
                  </div>
                )}

                {/* Notes details */}
                {selectedTaskDetail.notes && (
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Ops</p>
                    <p className="text-zinc-650 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-150 leading-relaxed font-semibold">
                      📝 {selectedTaskDetail.notes}
                    </p>
                  </div>
                )}

                {/* Document link link */}
                <div className="pt-2 flex gap-2">
                  {selectedTaskDetail.doc_link && (
                    <a 
                      href={selectedTaskDetail.doc_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 text-xs font-bold py-2.5 px-4 rounded-xl border border-zinc-200 transition cursor-pointer"
                    >
                      <LinkIcon size={14} /> Buka Tautan Kerja
                    </a>
                  )}
                  <button 
                    onClick={() => handleEditClick(selectedTaskDetail)}
                    className="px-3.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-750 hover:text-zinc-950 border border-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <PencilSimple size={14} /> Edit
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-indigo-500" />
              <span>Gunakan detail panel untuk melacak dependensi & blocker.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
