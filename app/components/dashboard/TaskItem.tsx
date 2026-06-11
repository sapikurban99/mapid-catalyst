"use client";

import { Clock, User } from "@phosphor-icons/react";
import type { Task } from "../../types/dashboard";
import { priorityStyles, statusStyles } from "../../lib/dashboardStyles";

interface Props {
  task: Task;
}

export function TaskItem({ task }: Props) {
  return (
    <div className="p-3 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition duration-200">
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
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
        <span
          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded tracking-wide ${statusStyles[task.status]}`}
        >
          {task.status}
        </span>
        <span className="text-[10px] font-bold font-mono text-zinc-400 bg-white border border-zinc-150 px-2 py-0.5 rounded-lg flex items-center gap-1">
          <Clock size={12} /> {task.deadline}
        </span>
      </div>
    </div>
  );
}
