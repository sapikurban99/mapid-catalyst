import type { Task } from "../types/dashboard";

export const priorityStyles: Record<Task["priority"], string> = {
  High: "bg-rose-50 text-rose-700 border-rose-100 font-bold",
  Medium: "bg-amber-50 text-amber-755 border-amber-100",
  Low: "bg-zinc-50 text-zinc-500 border-zinc-150",
};

export const statusStyles: Record<Task["status"], string> = {
  Done: "bg-emerald-50 text-emerald-700 border-emerald-150",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-150",
  Blocked:
    "bg-rose-50 text-rose-700 border-rose-150 ring-2 ring-rose-50 animate-pulse",
  "Waiting Review": "bg-purple-50 text-purple-700 border-purple-150",
  "Not Started": "bg-zinc-100 text-zinc-650 border-zinc-200",
  Delayed: "bg-orange-50 text-orange-700 border-orange-150",
};

export const progressBarColor: Record<string, string> = {
  "At Risk": "bg-rose-500",
  "In Progress": "bg-blue-500",
  Done: "bg-emerald-500",
  "Not Started": "bg-zinc-300",
};
