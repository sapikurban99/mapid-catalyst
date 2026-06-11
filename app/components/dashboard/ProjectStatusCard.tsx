"use client";

import { ShieldCheck } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import type { ProjectStatus } from "../../types/dashboard";

interface Props {
  status: ProjectStatus;
}

export function ProjectStatusCard({ status }: Props) {
  return (
    <Card
      className={`p-5 shadow-sm rounded-2xl bg-white border flex flex-col gap-3 transition duration-300 ${status.bg}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Project Status
        </span>
        <ShieldCheck className={status.color} size={22} weight="fill" />
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.bullet}`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${status.bullet}`}
          ></span>
        </span>
        <p className="text-2xl font-black text-zinc-900">{status.label}</p>
      </div>
      <p className="text-xs text-zinc-650 leading-snug font-semibold">
        {status.desc}
      </p>
    </Card>
  );
}
