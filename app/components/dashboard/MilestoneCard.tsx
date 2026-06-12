"use client";

import { useState } from "react";
import { Flag, CalendarCheck, PencilSimple, X, FloppyDisk } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  registrationDate: string;
  mainEventDate: string;
  daysToMilestone: number;
  daysToMainEvent: number;
  onSave: (field: "registration" | "mainEvent", value: string) => void;
}

export function MilestoneCards({
  registrationDate,
  mainEventDate,
  daysToMilestone,
  daysToMainEvent,
  onSave,
}: Props) {
  const [editingField, setEditingField] = useState<"registration" | "mainEvent" | null>(null);
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

  const startEdit = (field: "registration" | "mainEvent", currentDate: string) => {
    setEditingField(field);
    setEditValue(toIso(currentDate));
  };

  const handleSave = () => {
    if (editingField && editValue) {
      onSave(editingField, editValue);
    }
    setEditingField(null);
  };

  return (
    <>
      <Card className="p-5 shadow-sm rounded-2xl bg-white border border-zinc-200 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Key Milestone
          </span>
          <Flag className="text-indigo-600" size={22} weight="fill" />
        </div>
        <p className="text-base font-extrabold text-zinc-900 leading-tight">
          Registration Open
        </p>
        {editingField === "registration" ? (
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
            <p className="text-xs text-zinc-500 font-semibold">
              📅 {formatDate(registrationDate)} · <span className="text-indigo-600 font-bold">{daysToMilestone} Hari</span> lagi
            </p>
            <button
              onClick={() => startEdit("registration", registrationDate)}
              className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
            >
              <PencilSimple size={14} />
            </button>
          </div>
        )}
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
              onClick={() => startEdit("mainEvent", mainEventDate)}
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
