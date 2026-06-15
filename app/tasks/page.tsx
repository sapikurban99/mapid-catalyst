"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ClipboardText,
  User,
  CalendarBlank,
  Link as LinkIcon,
  TrashSimple,
  Info,
  Plus,
  PencilSimple,
  FloppyDisk,
  X,
  WarningCircle,
  CheckCircle,
  MagnifyingGlass
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

type TaskStatus = "Not Started" | "In Progress" | "Waiting Review" | "Blocked" | "Done" | "Delayed";
type TaskPriority = "High" | "Medium" | "Low";

type Task = {
  id: string;
  name: string;
  workstream: string;
  pic: string;
  priority: TaskPriority;
  start_date?: string | null;
  deadline: string;
  status: TaskStatus;
  dependency?: string | null;
  doc_link?: string | null;
  blocker?: string | null;
  notes?: string | null;
  phase_id?: string | null;
};

type Toast = { id: number; kind: "success" | "error"; text: string };

const WORKSTREAMS = [
  "Program Management",
  "Academic & Competition",
  "Data & Spatial Tech",
  "Marketing & Design",
  "Sponsorship & Outreach",
  "Main Event Operational"
];

const STATUSES: TaskStatus[] = ["Not Started", "In Progress", "Waiting Review", "Blocked", "Done", "Delayed"];
const PRIORITIES: TaskPriority[] = ["High", "Medium", "Low"];

const ID_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function isoToIndoDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${d} ${ID_MONTHS[m - 1]} ${y}`;
}

function indoDateToIso(indo: string | null | undefined): string {
  if (!indo) return "";
  const parts = indo.trim().split(/\s+/);
  if (parts.length < 3) return "";
  const day = parseInt(parts[0], 10);
  const monthIdx = ID_MONTHS.findIndex(m => m.toLowerCase().startsWith(parts[1].toLowerCase().slice(0, 3)));
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || monthIdx < 0 || isNaN(year)) return "";
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function nextTaskId(existing: Task[]): string {
  const nums = existing
    .map(t => /^T(\d+)$/.exec(t.id))
    .filter((m): m is RegExpExecArray => !!m)
    .map(m => parseInt(m[1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `T${String(next).padStart(3, "0")}`;
}

type PhaseOption = { id: string; label: string };

const emptyForm = (existing: Task[], defaultWs: string): Task => ({
  id: nextTaskId(existing),
  name: "",
  workstream: defaultWs,
  pic: "",
  priority: "Medium",
  start_date: "",
  deadline: "",
  status: "Not Started",
  dependency: "",
  doc_link: "",
  blocker: "",
  notes: "",
  phase_id: ""
});

function parseDateRangeStart(rangeStr: string): number | null {
  const str = rangeStr.toLowerCase().replace(/\s+/g, ' ');
  const months = ["januari","februari","maret","april","mei","juni","juli","agustus","september","oktober","november","desember"];
  const numbers = str.match(/\d+/g);
  const monthsFound = months
    .map((m, idx) => ({ index: idx, pos: str.indexOf(m) }))
    .filter(m => m.pos !== -1)
    .sort((a, b) => a.pos - b.pos);
  if (!numbers || monthsFound.length === 0) return null;
  const year = parseInt(str.match(/\b(202\d)\b/)?.[1] || "2026", 10);
  // Single date: "7 Agustus 2026"
  if (monthsFound.length === 1 && numbers.length >= 1) {
    return new Date(year, monthsFound[0].index, parseInt(numbers[0], 10)).getTime();
  }
  // Range with two months: "28 Juli – 4 Agustus 2026"
  if (monthsFound.length >= 2 && numbers.length >= 2) {
    return new Date(year, monthsFound[0].index, parseInt(numbers[0], 10)).getTime();
  }
  return null;
}

function sanitize(t: Task): Task {
  return {
    ...t,
    start_date: t.start_date || null,
    dependency: t.dependency || null,
    doc_link: t.doc_link || null,
    blocker: t.blocker || null,
    notes: t.notes || null,
    phase_id: t.phase_id || null
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeWorkstream, setActiveWorkstream] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [selected, setSelected] = useState<Task | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [phaseOptions, setPhaseOptions] = useState<PhaseOption[]>([]);

  const pushToast = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, kind, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("catalyst_tasks")
        .select("*")
        .order("id", { ascending: true });
      if (cancelled) return;
      if (error) {
        setFetchError(error.message);
        setTasks([]);
      } else {
        setTasks((data || []) as Task[]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("catalyst_timeline")
        .select("id, phase, date_range");
      if (cancelled) return;
      if (!error && data) {
        const raw = data as { id: string; phase: string; date_range: string }[];
        const withSort = raw
          .map(e => ({ ...e, sortKey: parseDateRangeStart(e.date_range) }))
          .filter(e => e.sortKey !== null)
          .sort((a, b) => a.sortKey! - b.sortKey!)
          .map(e => ({ id: e.id, label: `${e.id} — ${e.phase} (${e.date_range})` }));
        setPhaseOptions(withSort);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter(t => {
      if (activeWorkstream !== "All" && t.workstream !== activeWorkstream) return false;
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      if (q && !(t.name.toLowerCase().includes(q) || t.pic.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [tasks, activeWorkstream, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "Done").length;
    const blocked = tasks.filter(t => t.status === "Blocked").length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    return { total, done, blocked, inProgress };
  }, [tasks]);

  const openCreateModal = () => {
    setForm(emptyForm(tasks, activeWorkstream === "All" ? "Program Management" : activeWorkstream));
    setModalMode("create");
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (t: Task) => {
    setForm({ ...t });
    setModalMode("edit");
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setForm(null);
    setFormError(null);
  };

  const validate = (t: Task): string | null => {
    if (!t.id.trim()) return "Task ID wajib diisi.";
    if (!t.name.trim()) return "Nama tugas wajib diisi.";
    if (!t.workstream) return "Workstream wajib dipilih.";
    if (!t.pic.trim()) return "PIC wajib diisi.";
    if (!t.deadline.trim()) return "Deadline wajib diisi.";
    if (modalMode === "create" && tasks.some(x => x.id === t.id)) return `ID '${t.id}' sudah dipakai. Coba ID lain.`;
    return null;
  };

  const handleSave = async () => {
    if (!form) return;
    const err = validate(form);
    if (err) { setFormError(err); return; }

    setSaving(true);
    setFormError(null);
    const payload = sanitize(form);

    const { error } = await supabase
      .from("catalyst_tasks")
      .upsert(payload, { onConflict: "id" });

    setSaving(false);

    if (error) {
      setFormError(`Gagal menyimpan: ${error.message}`);
      pushToast("error", `Gagal menyimpan task: ${error.message}`);
      return;
    }

    setTasks(prev => {
      const exists = prev.some(t => t.id === payload.id);
      return exists
        ? prev.map(t => t.id === payload.id ? payload : t)
        : [...prev, payload].sort((a, b) => a.id.localeCompare(b.id));
    });
    setSelected(payload);
    setModalOpen(false);
    setForm(null);
    pushToast("success", modalMode === "create" ? `Task ${payload.id} berhasil dibuat.` : `Task ${payload.id} diperbarui.`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus task ${id}? Aksi ini tidak bisa di-undo.`)) return;

    const prev = tasks;
    setTasks(prev.filter(t => t.id !== id));
    if (selected?.id === id) setSelected(null);
    if (form?.id === id) { setModalOpen(false); setForm(null); }

    const { error } = await supabase.from("catalyst_tasks").delete().eq("id", id);
    if (error) {
      setTasks(prev);
      pushToast("error", `Gagal menghapus: ${error.message}`);
    } else {
      pushToast("success", `Task ${id} dihapus.`);
    }
  };

  const handleQuickStatus = async (id: string, status: TaskStatus) => {
    const prev = tasks;
    setTasks(prev.map(t => t.id === id ? { ...t, status } : t));
    if (selected?.id === id) setSelected({ ...selected, status });

    const { error } = await supabase.from("catalyst_tasks").update({ status }).eq("id", id);
    if (error) {
      setTasks(prev);
      pushToast("error", `Gagal update status: ${error.message}`);
    }
  };

  const statusStyle = (s: TaskStatus) => {
    switch (s) {
      case "Done": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "In Progress": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Waiting Review": return "bg-purple-50 text-purple-700 border-purple-100";
      case "Blocked": return "bg-rose-50 text-rose-700 border-rose-100 ring-2 ring-rose-50";
      case "Delayed": return "bg-orange-50 text-orange-700 border-orange-100";
      default: return "bg-zinc-100 text-zinc-650 border-zinc-200";
    }
  };

  const priorityStyle = (p: TaskPriority) => {
    switch (p) {
      case "High": return "bg-rose-50 text-rose-700 border-rose-100 font-extrabold";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-100 font-bold";
      default: return "bg-zinc-50 text-zinc-500 border-zinc-100 font-bold";
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Workstream Tasks</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola tugas operasional, PIC, tenggat waktu, dan blocker di setiap divisi.</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer self-start"
        >
          <Plus weight="bold" /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, tone: "bg-zinc-50 text-zinc-900 border-zinc-200" },
          { label: "In Progress", value: stats.inProgress, tone: "bg-blue-50 text-blue-900 border-blue-100" },
          { label: "Done", value: stats.done, tone: "bg-emerald-50 text-emerald-900 border-emerald-100" },
          { label: "Blocked", value: stats.blocked, tone: "bg-rose-50 text-rose-900 border-rose-100" }
        ].map(s => (
          <Card key={s.label} className={`border ${s.tone} rounded-2xl p-3 shadow-sm`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{s.label}</p>
            <p className="text-2xl font-bold mt-0.5">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <MagnifyingGlass size={14} className="text-zinc-400 shrink-0" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama, PIC, atau task ID…"
            className="flex-1 bg-zinc-50 border-zinc-200 rounded-lg text-xs h-8"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Workstream</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["All", ...WORKSTREAMS].map(ws => (
              <button
                key={ws}
                onClick={() => { setActiveWorkstream(ws); setSelected(null); setPage(1); }}
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
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">Status</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
              {["All", ...STATUSES].map(st => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setSelected(null); setPage(1); }}
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
            <span className="text-zinc-950 font-bold">{filtered.length}</span> dari {tasks.length} tugas
            {totalPages > 1 && <span className="ml-2">· Hal {safePage}/{totalPages}</span>}
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3.5 flex items-start gap-2 text-xs">
          <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Gagal memuat task dari Supabase.</p>
            <p className="text-rose-700/80 mt-0.5">{fetchError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card className="bg-white border border-zinc-200 rounded-2xl p-3 sm:p-5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-2.5">Nama Task</th>
                  <th className="pb-2.5 hidden md:table-cell">PIC</th>
                  <th className="pb-2.5 text-center hidden sm:table-cell">Priority</th>
                  <th className="pb-2.5 text-center hidden lg:table-cell">Deadline</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 pr-4"><div className="h-3 w-40 bg-zinc-100 rounded" /></td>
                      <td className="py-3 hidden md:table-cell"><div className="h-3 w-24 bg-zinc-100 rounded" /></td>
                      <td className="py-3 text-center hidden sm:table-cell"><div className="h-3 w-12 mx-auto bg-zinc-100 rounded" /></td>
                      <td className="py-3 text-center hidden lg:table-cell"><div className="h-3 w-20 mx-auto bg-zinc-100 rounded" /></td>
                      <td className="py-3 text-right"><div className="h-3 w-16 ml-auto bg-zinc-100 rounded" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <ClipboardText className="mx-auto text-zinc-300 mb-2" size={32} />
                      <p className="text-sm font-semibold text-zinc-500">Tidak ada tugas ditemukan.</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {[
                          search && `Pencarian "${search}"`,
                          activeWorkstream !== "All" && `Workstream "${activeWorkstream}"`,
                          statusFilter !== "All" && `Status "${statusFilter}"`
                        ].filter(Boolean).join(" · ")}
                      </p>
                      <button
                        onClick={() => { setSearch(""); setActiveWorkstream("All"); setStatusFilter("All"); setPage(1); }}
                        className="mt-3 text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
                      >
                        Reset semua filter
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginated.map(task => (
                    <tr
                      key={task.id}
                      onClick={() => setSelected(task)}
                      className={`hover:bg-zinc-50 transition-colors cursor-pointer ${selected?.id === task.id ? "bg-zinc-50" : ""}`}
                    >
                      <td className="py-3 pr-4 max-w-[180px] sm:max-w-[260px]">
                        <p className="text-zinc-900 font-semibold truncate">{task.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 md:hidden">
                          <span className="text-[10px] text-zinc-500 font-medium truncate">{task.pic}</span>
                          <span className="text-[10px] text-zinc-300">•</span>
                          <span className="text-[10px] text-zinc-400 font-mono truncate">{task.deadline}</span>
                        </div>
                      </td>
                      <td className="py-3 text-zinc-600 font-medium hidden md:table-cell">{task.pic}</td>
                      <td className="py-3 text-center hidden sm:table-cell">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${priorityStyle(task.priority)}`}>{task.priority}</span>
                      </td>
                      <td className="py-3 text-center text-zinc-500 font-mono text-xs hidden lg:table-cell">{task.deadline}</td>
                      <td className="py-3 text-right">
                        <span className={`text-[10px] sm:text-[11px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded border tracking-wide whitespace-nowrap ${statusStyle(task.status)}`}>{task.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition cursor-pointer ${
                      p === safePage
                        ? "bg-zinc-950 text-white"
                        : "bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}
        </Card>
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300"
          onClick={() => setSelected(null)}
        >
          <div
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white border-l border-zinc-200 shadow-2xl animate-[slideInRight_0.25s_ease-out] overflow-y-auto flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Section */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[9px] font-bold uppercase tracking-wider px-2 rounded-lg">
                    {selected.workstream}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-tighter">{selected.id}</span>
                </div>
                <h3 className="font-bold text-zinc-950 text-lg leading-tight mt-1">{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition cursor-pointer self-start mt-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6 flex-1">
              {/* Primary Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-3.5 space-y-1.5 transition-all hover:border-zinc-200">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User size={12} weight="bold" /> PIC
                  </p>
                  <p className="text-zinc-900 font-bold text-sm">
                    {selected.pic}
                  </p>
                </div>
                <div className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-3.5 space-y-1.5 transition-all hover:border-zinc-200">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CalendarBlank size={12} weight="bold" /> Deadline
                  </p>
                  <p className="text-zinc-900 font-bold text-sm font-mono">
                    {selected.deadline}
                  </p>
                </div>
              </div>

              {/* Status & Priority Selection */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Update Status</label>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => handleQuickStatus(selected.id, s)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                          selected.status === s
                            ? statusStyle(s)
                            : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200 hover:text-zinc-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Prioritas</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <Badge
                        key={p}
                        variant="outline"
                        className={`${selected.priority === p ? priorityStyle(p) : "bg-white text-zinc-400 border-zinc-100"} px-3 py-1 rounded-lg text-[10px] font-bold uppercase border-2`}
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Context Sections */}
              <div className="space-y-5 pt-2">
                {selected.phase_id && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phase Terhubung</label>
                    <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-3.5 flex items-start gap-3">
                      <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600 shrink-0">
                        <Info size={16} weight="fill" />
                      </div>
                      <div>
                        <p className="text-zinc-900 font-bold text-xs">
                          {phaseOptions.find(p => p.id === selected.phase_id)?.label || selected.phase_id}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Task ini tersinkronisasi dengan timeline project.</p>
                      </div>
                    </div>
                  </div>
                )}

                {selected.blocker && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Blocker Details</label>
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 animate-pulse">
                      <div className="bg-rose-100 p-2 rounded-xl text-rose-600 shrink-0">
                        <WarningCircle size={18} weight="fill" />
                      </div>
                      <p className="text-rose-800 font-bold text-xs leading-relaxed italic">
                        "{selected.blocker}"
                      </p>
                    </div>
                  </div>
                )}

                {(selected.notes || selected.dependency || selected.start_date) && (
                  <div className="space-y-4 pt-2 border-t border-zinc-100">
                    {selected.start_date && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-bold uppercase text-[9px] tracking-widest">Tanggal Mulai</span>
                        <span className="text-zinc-700 font-mono font-bold">{selected.start_date}</span>
                      </div>
                    )}
                    {selected.dependency && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dependency</label>
                        <div className="text-zinc-700 bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
                           <LinkIcon size={14} className="text-zinc-400" /> {selected.dependency}
                        </div>
                      </div>
                    )}
                    {selected.notes && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Catatan Tambahan</label>
                        <div className="text-zinc-700 bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-xs font-medium leading-relaxed italic">
                           {selected.notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-zinc-50 p-5 sm:p-6 border-t border-zinc-200 flex flex-col sm:flex-row gap-3">
              {selected.doc_link && (
                <a
                  href={selected.doc_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-[2] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
                >
                  <LinkIcon size={16} weight="bold" /> Buka Dokumen Utama
                </a>
              )}
              <button
                onClick={() => openEditModal(selected)}
                className="flex-1 bg-white hover:bg-zinc-100 text-zinc-950 border border-zinc-200 rounded-2xl text-xs font-extrabold transition-all py-3 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
              >
                <PencilSimple size={16} weight="bold" /> Edit Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && form && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={closeModal}
        >
          <Card
            className="w-full max-w-3xl bg-white border border-zinc-200 rounded-3xl shadow-2xl animate-[fadeIn_0.2s_ease-out] max-h-[92vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${modalMode === "create" ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-600"}`}>
                  {modalMode === "create" ? <Plus size={20} weight="bold" /> : <PencilSimple size={20} weight="bold" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 leading-none">
                    {modalMode === "create" ? "Tambah Task Baru" : "Update Detail Task"}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                    {modalMode === "create" ? "Silahkan lengkapi data task di bawah" : `Task ID: ${form.id}`}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition cursor-pointer" disabled={saving}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">
              {formError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex items-start gap-3 animate-shake">
                  <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Periksa Kembali Input Anda</p>
                    <p className="opacity-80 mt-0.5">{formError}</p>
                  </div>
                </div>
              )}

              <fieldset disabled={saving} className="space-y-8">
                {/* Section 1: Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1 w-8 bg-indigo-500 rounded-full" />
                    <h4 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.2em]">Informasi Dasar</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Task ID</label>
                      <Input
                        value={form.id}
                        onChange={e => setForm({ ...form, id: e.target.value.toUpperCase() })}
                        disabled={modalMode === "edit"}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2.5 px-3 text-xs font-mono font-bold focus:ring-zinc-950"
                      />
                    </div>
                    <div className="sm:col-span-9 space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Nama Tugas <span className="text-rose-500">*</span></label>
                      <Input
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Misal: Finalisasi proposal sponsorship"
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:ring-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Workstream <span className="text-rose-500">*</span></label>
                      <select
                        value={form.workstream}
                        onChange={e => setForm({ ...form, workstream: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all cursor-pointer"
                      >
                        {WORKSTREAMS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Penanggung Jawab (PIC) <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <Input
                          value={form.pic}
                          onChange={e => setForm({ ...form, pic: e.target.value })}
                          placeholder="Nama PIC atau Jabatan"
                          className="bg-zinc-50 border-zinc-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:ring-zinc-950"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Planning & Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                    <h4 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.2em]">Perencanaan & Waktu</h4>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Hubungkan ke Phase</label>
                    <select
                      value={form.phase_id || ""}
                      onChange={e => setForm({ ...form, phase_id: e.target.value })}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="">— Tidak dihubungkan ke phase manapun —</option>
                      {phaseOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Start Date</label>
                      <input
                        type="date"
                        value={indoDateToIso(form.start_date)}
                        onChange={e => setForm({ ...form, start_date: e.target.value ? isoToIndoDate(e.target.value) : "" })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-zinc-950 cursor-pointer transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Deadline <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        value={indoDateToIso(form.deadline)}
                        onChange={e => setForm({ ...form, deadline: e.target.value ? isoToIndoDate(e.target.value) : "" })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-zinc-950 cursor-pointer transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Tingkat Prioritas</label>
                      <select
                        value={form.priority}
                        onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all cursor-pointer"
                      >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Context & Links */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1 w-8 bg-amber-500 rounded-full" />
                    <h4 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.2em]">Konteks & Tautan</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Status Progres</label>
                      <select
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })}
                        className={`w-full border rounded-xl p-2.5 text-xs font-extrabold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all cursor-pointer ${statusStyle(form.status)}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Dependency (Tugas Prasyarat)</label>
                      <div className="relative">
                        <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <Input
                          value={form.dependency || ""}
                          onChange={e => setForm({ ...form, dependency: e.target.value })}
                          placeholder="ID atau Nama Task lain"
                          className="bg-zinc-50 border-zinc-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:ring-zinc-950"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Tautan Dokumen Pendukung</label>
                      <Input
                        type="url"
                        value={form.doc_link || ""}
                        onChange={e => setForm({ ...form, doc_link: e.target.value })}
                        placeholder="https://docs.google.com/..."
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:ring-zinc-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 text-rose-500">Blocker / Kendala</label>
                      <Input
                        value={form.blocker || ""}
                        onChange={e => setForm({ ...form, blocker: e.target.value })}
                        placeholder="Tuliskan kendala jika ada"
                        className="bg-rose-50/50 border-rose-100 rounded-xl py-2.5 px-4 text-xs font-medium focus:ring-rose-500 placeholder:text-rose-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Catatan Tambahan</label>
                    <textarea
                      value={form.notes || ""}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                      placeholder="Detail output, instruksi tambahan, atau memo..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all disabled:opacity-60 placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 sm:p-6 border-t border-zinc-100 bg-zinc-50/50 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
              <div className="flex gap-2">
                {modalMode === "edit" && (
                  <Button
                    type="button"
                    onClick={() => handleDelete(form.id)}
                    variant="ghost"
                    disabled={saving}
                    className="flex-1 sm:flex-none text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-5 rounded-2xl text-xs font-extrabold cursor-pointer h-11 transition-all"
                  >
                    <TrashSimple size={16} className="mr-2" /> Hapus Task
                  </Button>
                )}
                <Button
                  onClick={closeModal}
                  variant="outline"
                  disabled={saving}
                  className="flex-1 sm:flex-none bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-650 text-xs font-bold px-6 rounded-2xl cursor-pointer h-11"
                >
                  Batal
                </Button>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-extrabold px-8 rounded-2xl flex items-center justify-center gap-2 cursor-pointer h-11 shadow-lg shadow-zinc-200 min-w-[140px] transition-all active:scale-95"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  <><FloppyDisk size={16} weight="bold" /> Simpan Perubahan</>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[60] flex flex-col gap-2 pointer-events-none sm:max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-[fadeIn_0.2s_ease-out] ${
              t.kind === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-rose-50 text-rose-900 border-rose-200"
            }`}
          >
            {t.kind === "success" ? <CheckCircle size={16} weight="fill" className="shrink-0" /> : <WarningCircle size={16} weight="fill" className="shrink-0" />}
            <span className="break-words">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
