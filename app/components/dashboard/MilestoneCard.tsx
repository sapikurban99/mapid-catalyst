"use client";

import { useState } from "react";
import { Flag, CalendarCheck, PencilSimple, X, FloppyDisk, UsersThree } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  registrationCount: number;
  mainEventDate: string;
  daysToMainEvent: number;
  onSave: (field: "mainEvent", value: string) => void;
}

export function MilestoneCards({
  registrationCount,
  mainEventDate,
  daysToMainEvent,
  onSave,
}: Props) {
  const [editingField, setEditingField] = useState<"mainEvent" | null>(null);
  const [editValue, setEditValue] = useState("");

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const toIso = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const startEdit = (currentDate: string) => {
    setEditingField("mainEvent");
    setEditValue(toIso(currentDate));
  };

  const handleSave = () => {
    if (editingField && editValue) {
      onSave(editingField, editValue);
    }
    setEditingField(null);
  };

  const targetTim = 100;
  const progress = Math.min((registrationCount / targetTim) * 100, 100);

  return (
    <>
      <Card className="p-5 shadow-sm rounded-2xl bg-white border border-zinc-200 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Target Pendaftar
          </span>
          <UsersThree className="text-indigo-600" size={22} weight="fill" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-zinc-950">{registrationCount}</span>
          <span className="text-xs font-bold text-zinc-400">/ {targetTim} tim</span>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] font-semibold text-zinc-400">
          {registrationCount >= targetTim ? (
            <span className="text-emerald-600 font-bold">Target tercapai!</span>
          ) : (
            <>Kurang <span className="text-indigo-600 font-bold">{targetTim - registrationCount}</span> tim lagi</>
          )}
        </p>
      </Card>

      <Card className="p-5 shadow-sm rounded-2xl bg-white border border-zinc-200 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Days to Main Event
          </span>
          <CalendarCheck className="text-rose-600" size={22} weight="fill" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-zinc-950">{daysToMainEvent}</span>
          <span className="text-xs font-bold text-zinc-400 uppercase font-mono">Hari</span>
        </div>
        {editingField === "mainEvent" ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 min-w-0 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={handleSave} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition cursor-pointer">
              <FloppyDisk size={14} />
            </button>
            <button onClick={() => setEditingField(null)} className="p-1.5 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-zinc-200 transition cursor-pointer">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500 font-semibold leading-snug">
              Main Event: {formatDate(mainEventDate)} @ BINUS
            </p>
            <button
              onClick={() => startEdit(mainEventDate)}
              className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
            >
              <PencilSimple size={14} />
            </button>
          </div>
        )}
      </Card>
    </>
  );
}
