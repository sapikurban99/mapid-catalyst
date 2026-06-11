"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import type { BlockedTask } from "../../types/dashboard";

interface Props {
  tasks: BlockedTask[];
}

export function BlockerList({ tasks }: Props) {
  return (
    <Card className="bg-rose-50/20 border border-rose-100 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-rose-100 pb-3 mb-3">
        <WarningCircle
          className="text-rose-600 shrink-0"
          size={18}
          weight="fill"
        />
        <h3 className="font-extrabold text-sm text-zinc-900">
          Critical Blockers ({tasks.length})
        </h3>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-xs text-zinc-400 font-medium py-4 text-center">
            Tidak ada blocker kritis saat ini.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 bg-white border border-rose-100 rounded-2xl shadow-xs"
            >
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
                {task.workstream}
              </span>
              <p className="text-xs font-black text-zinc-900 mt-2">
                {task.name}
              </p>
              <p className="text-[10px] text-zinc-550 leading-relaxed mt-1 font-semibold">
                {task.blocker}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
