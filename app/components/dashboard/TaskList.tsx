"use client";

import { useState, useMemo } from "react";
import { Briefcase, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Task } from "../../types/dashboard";
import { TaskItem } from "./TaskItem";

interface Props {
  tasks: Task[];
}

const PAGE_SIZE = 5;

export function TaskList({ tasks }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        search.trim() === "" ||
        task.name.toLowerCase().includes(search.toLowerCase()) ||
        task.workstream.toLowerCase().includes(search.toLowerCase()) ||
        task.pic.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !statusFilter || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedTasks = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTasks.slice(start, start + PAGE_SIZE);
  }, [filteredTasks, safePage]);

  const statusOptions = [
    "Done",
    "In Progress",
    "Blocked",
    "Waiting Review",
    "Not Started",
    "Delayed",
  ];

  return (
    <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex flex-col gap-4 border-b border-zinc-150 pb-4 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={20} />
              Outstanding Tasks ({tasks.length})
            </h2>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Daftar tugas yang belum diselesaikan divisi.
            </p>
          </div>
          <Link
            href="/tasks"
            className="text-xs font-bold text-indigo-600 hover:underline shrink-0"
          >
            Buka Task Board
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Cari tugas..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 text-xs rounded-xl border-zinc-200"
          />
          <div className="flex gap-1 flex-wrap">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter((prev) => (prev === status ? null : status));
                  setPage(1);
                }}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${statusFilter === status ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"}`}
              >
                {status}
              </button>
            ))}
            {statusFilter && (
              <button
                onClick={() => { setStatusFilter(null); setPage(1); }}
                className="text-[10px] font-bold px-2 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-auto">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 font-medium text-xs space-y-1">
            <CheckCircle size={32} className="mx-auto text-emerald-500 mb-1" />
            <p className="font-bold">Luar Biasa! Semua Tugas Selesai.</p>
            <p>Project Control Center dalam kondisi On Track sempurna.</p>
          </div>
        ) : (
          paginatedTasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            ← Prev
          </button>
          <span className="text-xs font-semibold text-zinc-400">
            Hal <span className="text-zinc-700 font-bold">{safePage}</span>/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}
    </Card>
  );
}
