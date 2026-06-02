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
  TrashSimple,
  Info,
  CheckCircle,
  Clock,
  WarningCircle,
  Plus,
  PencilSimple,
  FloppyDisk,
  X,
  SpinnerGap
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
  start_date: string;
  deadline: string;
  status: "Not Started" | "In Progress" | "Waiting Review" | "Blocked" | "Done" | "Delayed";
  dependency?: string;
  doc_link?: string;
  blocker?: string;
  notes?: string;
};

export default function TasksPage() {
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeWorkstream, setActiveWorkstream] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
        
        if (data) {
          setLocalTasks(data as Task[]);
        } else {
          setLocalTasks([]);
        }
      } catch (e) {
        console.error("Supabase fetch failed:", e);
        setLocalTasks([]);
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
      case "Blocked": return "bg-rose-100 text-rose-800 border-rose-200 ring-2 ring-rose-50";
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
    setSaveFeedback(null);

    const updatedTask = {
      ...editForm,
      start_date: editForm.start_date || editForm.deadline || "",
    } as Task;

    const updated = localTasks.map(t => t.id === editForm.id ? updatedTask : t);
    setLocalTasks(updated);
    setSelectedTaskDetail(updatedTask);

    setSaving(true);
    try {
      const { error } = await supabase
        .from("catalyst_tasks")
        .upsert(updatedTask);
      if (error) {
        console.error("Error writing task to Supabase:", error);
        setSaveFeedback({ type: "error", message: "Gagal menyimpan: " + error.message });
      } else {
        setIsEditing(false);
        setSaveFeedback({ type: "success", message: "Task berhasil disimpan" });
      }
    } catch (e: any) {
      console.error("Error writing task to Supabase:", e);
      setSaveFeedback({ type: "error", message: "Gagal menyimpan ke database" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setLocalTasks(localTasks.filter(t => t.id !== id));
    setSelectedTaskDetail(null);
    setIsEditing(false);
    setSaveFeedback(null);
    try {
      const { error } = await supabase.from("catalyst_tasks").delete().eq("id", id);
      if (error) {
        console.error("Error deleting task:", error);
        setSaveFeedback({ type: "error", message: "Gagal menghapus task" });
      }
    } catch (e) {
      console.error("Error deleting task:", e);
      setSaveFeedback({ type: "error", message: "Gagal menghapus task" });
    }
  };

  const handleCreateNew = async () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: "Standardized Task Name",
      workstream: activeWorkstream === "All" ? "Program Management" : activeWorkstream,
      pic: "Hadi / Lead",
      priority: "Medium",
      start_date: "1 Juni 2026",
      deadline: "10 Juni 2026",
      status: "Not Started",
      notes: "Tulis detail tugas baru di sini."
    };

    setLocalTasks([newTask, ...localTasks]);
    setSelectedTaskDetail(newTask);
    setIsEditing(true);
    setEditForm(newTask);
    setSaveFeedback(null);

    setSaving(true);
    try {
      const { error } = await supabase.from("catalyst_tasks").insert(newTask);
      if (error) {
        console.error("Error creating task:", error);
        setSaveFeedback({ type: "error", message: "Gagal menyimpan ke database: " + error.message });
      } else {
        setSaveFeedback({ type: "success", message: "Task berhasil dibuat" });
      }
    } catch (e: any) {
      console.error("Error writing task to Supabase:", e);
      setSaveFeedback({ type: "error", message: "Gagal menyimpan ke database" });
    } finally {
      setSaving(false);
    }
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
          disabled={saving}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60 self-start"
        >
          {saving ? <SpinnerGap size={16} weight="bold" className="animate-spin" /> : <Plus weight="bold" />}
          {saving ? "Creating..." : "Add Task"}
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
                  <button onClick={() => { setIsEditing(false); setSaveFeedback(null); }} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                {saveFeedback && (
                  <div className={`text-xs font-semibold rounded-xl p-2.5 flex items-center gap-2 ${
                    saveFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                      : "bg-rose-50 text-rose-700 border border-rose-150"
                  }`}>
                    {saveFeedback.type === "success"
                      ? <CheckCircle size={16} weight="fill" />
                      : <WarningCircle size={16} weight="fill" />
                    }
                    {saveFeedback.message}
                  </div>
                )}

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
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Start Date</label>
                      <Input 
                        type="text" 
                        value={editForm.start_date || ""} 
                        onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
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
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Doc Link</label>
                      <Input 
                        type="text" 
                        value={editForm.doc_link || ""} 
                        onChange={(e) => setEditForm({ ...editForm, doc_link: e.target.value })}
                        placeholder="https://..."
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

                <div className="flex justify-between items-center pt-3">
                  <Button
                    type="button"
                    onClick={() => handleDeleteTask(editForm.id as string)}
                    variant="ghost"
                    disabled={saving}
                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-40"
                  >
                    <TrashSimple size={14} className="mr-1" /> Hapus
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                    >
                      {saving ? <SpinnerGap size={14} className="animate-spin" /> : <FloppyDisk size={14} />}
                      {saving ? "Saving..." : "Save Task"}
                    </Button>
                    <Button 
                      onClick={() => { setIsEditing(false); setSaveFeedback(null); }}
                      variant="outline"
                      disabled={saving}
                      className="bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
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

                <div className="grid grid-cols-3 gap-4 text-xs font-medium border-b border-zinc-150 pb-4">
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
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Tanggal Mulai</p>
                    <p className="text-zinc-800 flex items-center gap-1.5 font-mono text-xs">
                      <CalendarBlank size={14} className="text-zinc-400" /> {selectedTaskDetail.start_date}
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
