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
      case "Done": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Waiting Review": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Blocked": return "bg-rose-100 text-rose-800 border-rose-200 ring-2 ring-rose-50";
      case "Delayed": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const priorityStyle = (p: TaskPriority) => {
    switch (p) {
      case "High": return "bg-rose-50 text-rose-700 border-rose-100 font-bold";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-zinc-50 text-zinc-500 border-zinc-100";
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-3 sm:p-5 shadow-sm overflow-hidden">
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

        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
            {selected === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <ClipboardText size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih tugas pada tabel sebelah kiri untuk meninjau rincian project management.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {selected.workstream}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-zinc-400">{selected.id}</span>
                    </div>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-tight">{selected.name}</h3>
                  </div>
                  <button
                    onClick={() => openEditModal(selected)}
                    className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                  >
                    <PencilSimple size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium border-b border-zinc-100 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">PIC</p>
                    <p className="text-zinc-800 flex items-center gap-1.5 font-bold">
                      <User size={14} className="text-zinc-400" /> {selected.pic}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Deadline</p>
                    <p className="text-zinc-800 flex items-center gap-1.5 font-mono">
                      <CalendarBlank size={14} className="text-zinc-400" /> {selected.deadline}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium border-b border-zinc-100 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Prioritas</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${priorityStyle(selected.priority)}`}>
                      {selected.priority}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Status</p>
                    <select
                      value={selected.status}
                      onChange={e => handleQuickStatus(selected.id, e.target.value as TaskStatus)}
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider cursor-pointer outline-none ${statusStyle(selected.status)}`}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {selected.phase_id && (
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Phase Terhubung</p>
                    <p className="text-zinc-700 bg-indigo-50/60 border border-indigo-100 rounded-xl p-2 font-medium">
                      🎯 {phaseOptions.find(p => p.id === selected.phase_id)?.label || selected.phase_id}
                    </p>
                  </div>
                )}

                {selected.start_date && (
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Mulai</p>
                    <p className="text-zinc-700 font-mono">{selected.start_date}</p>
                  </div>
                )}

                {selected.dependency && (
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Dependency</p>
                    <p className="text-zinc-700 bg-zinc-50 border border-zinc-100 rounded-xl p-2 font-medium">🔗 {selected.dependency}</p>
                  </div>
                )}

                {selected.blocker && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl space-y-1 text-xs">
                    <p className="font-bold text-rose-800 flex items-center gap-1.5">
                      <WarningCircle size={16} weight="fill" /> Blocker
                    </p>
                    <p className="text-rose-700/90 font-medium leading-tight mt-1">{selected.blocker}</p>
                  </div>
                )}

                {selected.notes && (
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Catatan</p>
                    <p className="text-zinc-700 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-100 leading-relaxed font-medium">
                      📝 {selected.notes}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  {selected.doc_link && (
                    <a
                      href={selected.doc_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 text-xs font-bold py-2.5 px-4 rounded-xl border border-zinc-200 transition cursor-pointer"
                    >
                      <LinkIcon size={14} /> Buka Tautan
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(selected)}
                    className="px-3.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 hover:text-zinc-950 border border-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <PencilSimple size={14} /> Edit
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-indigo-500" />
              <span>Status bisa diubah langsung dari dropdown di panel ini.</span>
            </div>
          </Card>
        </div>
      </div>

      {modalOpen && form && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <Card
            className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                {modalMode === "create" ? <Plus size={18} /> : <PencilSimple size={18} />}
                {modalMode === "create" ? "Tambah Task Baru" : `Edit ${form.id}`}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 cursor-pointer" disabled={saving}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <WarningCircle size={16} weight="fill" className="shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            <fieldset disabled={saving} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Task ID</label>
                  <Input
                    value={form.id}
                    onChange={e => setForm({ ...form, id: e.target.value.toUpperCase() })}
                    disabled={modalMode === "edit"}
                    className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Tugas <span className="text-rose-500">*</span></label>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Finalize sponsor proposal"
                    className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Workstream <span className="text-rose-500">*</span></label>
                  <select
                    value={form.workstream}
                    onChange={e => setForm({ ...form, workstream: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {WORKSTREAMS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">PIC <span className="text-rose-500">*</span></label>
                  <Input
                    value={form.pic}
                    onChange={e => setForm({ ...form, pic: e.target.value })}
                    placeholder="Hadi / Lead"
                    className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Phase Terhubung (opsional)</label>
                <select
                  value={form.phase_id || ""}
                  onChange={e => setForm({ ...form, phase_id: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">— Tidak dihubungkan ke phase manapun —</option>
                  {phaseOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <p className="text-[10px] text-zinc-400 font-medium">Pilih phase agar task tampil di Timeline, Calendar, dan Gantt view.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Start Date</label>
                  <input
                    type="date"
                    value={indoDateToIso(form.start_date)}
                    onChange={e => setForm({ ...form, start_date: e.target.value ? isoToIndoDate(e.target.value) : "" })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-mono focus:outline-none cursor-pointer"
                  />
                  {form.start_date && <p className="text-[10px] text-zinc-400 font-mono">→ {form.start_date}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Deadline <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={indoDateToIso(form.deadline)}
                    onChange={e => setForm({ ...form, deadline: e.target.value ? isoToIndoDate(e.target.value) : "" })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-mono focus:outline-none cursor-pointer"
                  />
                  {form.deadline && <p className="text-[10px] text-zinc-400 font-mono">→ {form.deadline}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Dependency</label>
                  <Input
                    value={form.dependency || ""}
                    onChange={e => setForm({ ...form, dependency: e.target.value })}
                    placeholder="Misal: Draft timeline"
                    className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Tautan Dokumen</label>
                <Input
                  type="url"
                  value={form.doc_link || ""}
                  onChange={e => setForm({ ...form, doc_link: e.target.value })}
                  placeholder="https://docs.google.com/…"
                  className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Blocker</label>
                <Input
                  value={form.blocker || ""}
                  onChange={e => setForm({ ...form, blocker: e.target.value })}
                  placeholder="Masalah yang menghambat task ini…"
                  className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Catatan</label>
                <textarea
                  value={form.notes || ""}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Output / detail tambahan…"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none disabled:opacity-60"
                />
              </div>
            </fieldset>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-5 mt-4 border-t border-zinc-100">
              {modalMode === "edit" ? (
                <Button
                  type="button"
                  onClick={() => handleDelete(form.id)}
                  variant="ghost"
                  disabled={saving}
                  className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer self-start sm:self-auto"
                >
                  <TrashSimple size={14} className="mr-1" /> Hapus
                </Button>
              ) : <div className="hidden sm:block" />}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  disabled={saving}
                  className="flex-1 sm:flex-none bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 sm:flex-none bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer min-w-[110px]"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan…
                    </>
                  ) : (
                    <><FloppyDisk size={14} /> Save Task</>
                  )}
                </Button>
              </div>
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
