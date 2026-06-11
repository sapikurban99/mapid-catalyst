"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import type { WeeklyPriority } from "../../types/dashboard";

interface Props {
  items: WeeklyPriority[];
}

export function WeeklyPriorityList({ items }: Props) {
  return (
    <Card className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-150 pb-3 mb-3">
        <CheckCircle
          className="text-indigo-600 shrink-0"
          size={18}
          weight="fill"
        />
        <h3 className="font-extrabold text-sm text-zinc-900">
          This Week Priority
        </h3>
      </div>
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <p className="text-xs text-zinc-400 font-medium py-4 text-center">
            Tidak ada tugas prioritas minggu ini.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.num}
              className="flex gap-2.5 p-2 hover:bg-zinc-50 rounded-xl transition duration-200"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold mt-0.5 border border-indigo-100">
                {item.num}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-zinc-900 leading-snug">
                  {item.text}
                </p>
                <p className="text-[10px] text-zinc-450 mt-0.5 font-semibold leading-none">
                  {item.meta}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
