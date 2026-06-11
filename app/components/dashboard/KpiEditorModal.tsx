"use client";

import { X, PencilSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KPI } from "../../types/dashboard";

interface Props {
  isOpen: boolean;
  form: Partial<KPI>;
  onClose: () => void;
  onChange: (form: Partial<KPI>) => void;
  onSave: () => void;
}

export function KpiEditorModal({ isOpen, form, onClose, onChange, onSave }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white border border-zinc-200 shadow-2xl rounded-3xl p-6 w-full max-w-md mx-4 animate-[scaleIn_0.2s_ease-out] space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="font-extrabold text-base text-zinc-950 flex items-center gap-2">
            <PencilSimple size={18} className="text-indigo-650" /> Edit KPI Metrics
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs font-semibold text-zinc-750">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">KPI Metric Name</label>
            <Input
              type="text"
              value={form.metric || ""}
              disabled
              className="bg-zinc-100 border-zinc-200 text-zinc-500 rounded-xl py-2 px-3 text-xs cursor-not-allowed font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Target</label>
              <Input
                type="text"
                value={form.target || ""}
                onChange={(e) => onChange({ ...form, target: e.target.value })}
                className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Value</label>
              <Input
                type="text"
                value={form.current || ""}
                onChange={(e) => onChange({ ...form, current: e.target.value })}
                className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</label>
              <select
                value={form.status || "Not Started"}
                onChange={(e) => onChange({ ...form, status: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-semibold text-zinc-800 focus:outline-none"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Progress ({form.progress || 0}%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.progress !== undefined ? form.progress : 0}
                onChange={(e) =>
                  onChange({
                    ...form,
                    progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                  })
                }
                className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-3 border-t border-zinc-100">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
          >
            Save KPI
          </Button>
        </div>
      </div>
    </div>
  );
}
