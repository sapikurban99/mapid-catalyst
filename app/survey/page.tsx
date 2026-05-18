"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Coins, 
  UploadSimple, 
  CheckCircle, 
  WarningCircle, 
  Info,
  Clock,
  Sparkle,
  Plus,
  PencilSimple,
  FloppyDisk,
  X
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type SurveyPlan = {
  id: string;
  team: string;
  area: string;
  dataset: string;
  target: string;
  budget: string;
  status: "Planned" | "In Progress" | "Completed" | "Delayed";
  output: string;
};

const initialPlans: SurveyPlan[] = [
  { id: "pl-1", team: "Team Geoverse", area: "Bandung Wetan", dataset: "Menu Go", target: "50 Restoran", budget: "Rp 1,500,000", status: "In Progress", output: "25/50 Restoran Terdata" },
  { id: "pl-2", team: "SpatiaTech", area: "Sleman, Yogyakarta", dataset: "Property Go", target: "80 Kaveling", budget: "Rp 1,500,000", status: "In Progress", output: "40/80 Kaveling Terdata" },
  { id: "pl-3", team: "EcoMap", area: "Depok Margonda", dataset: "UMKM Go", target: "60 Warung", budget: "Rp 1,500,000", status: "Completed", output: "60/60 Warung Selesai" },
  { id: "pl-4", team: "AI Mapper", area: "Jakarta Barat", dataset: "Menu Go & Property", target: "100 Titik", budget: "Rp 2,000,000", status: "Planned", output: "Belum Dimulai" }
];

export default function SurveyActivitiesPage() {
  const [activeSubTab, setActiveSubTab] = useState<"plan" | "budget" | "output">("plan");
  
  // States for Plan
  const [localPlans, setLocalPlans] = useState<SurveyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SurveyPlan | null>(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editFormPlan, setEditFormPlan] = useState<Partial<SurveyPlan>>({});

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase.from("catalyst_survey_plans").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) setLocalPlans(data as SurveyPlan[]);
        else setLocalPlans(initialPlans);
      } catch { setLocalPlans(initialPlans); }
    }
    fetch();
  }, []);

  const handleEditPlanClick = (p: SurveyPlan) => { setEditFormPlan(p); setIsEditingPlan(true); };
  
  const handleSavePlan = async () => {
    if (!editFormPlan.team || !editFormPlan.id) return;
    const updated = localPlans.map(p => p.id === editFormPlan.id ? (editFormPlan as SurveyPlan) : p);
    setLocalPlans(updated);
    setSelectedPlan(editFormPlan as SurveyPlan);
    setIsEditingPlan(false);
    try { await supabase.from("catalyst_survey_plans").upsert(editFormPlan); } catch (e) { console.error(e); }
  };

  const handleCreatePlan = () => {
    const n: SurveyPlan = { id: crypto.randomUUID(), team: "New Team", area: "Lokasi Survey", dataset: "Dataset Target", target: "0 Data", budget: "Rp 0", status: "Planned", output: "Belum Dimulai" };
    setLocalPlans([n, ...localPlans]);
    setSelectedPlan(n);
    handleEditPlanClick(n);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Survey Activities</h1>
          <p className="mt-1 text-zinc-500 text-sm">Pantau rencana survei lapangan tim terkurasi, alokasi pengeluaran budget, serta keabsahan data hasil survei.</p>
        </div>
        <Button onClick={handleCreatePlan} className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
          <Plus weight="bold" /> Add Survey Plan
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-zinc-100 p-1 rounded-xl flex gap-1 border border-zinc-200 self-start">
          <button onClick={() => setActiveSubTab("plan")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeSubTab === "plan" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}>
            <MapPin weight="bold" /> Survey Plans
          </button>
          <button className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-not-allowed opacity-50`}>
            <Coins weight="bold" /> Budget (Locked)
          </button>
          <button className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-not-allowed opacity-50`}>
            <UploadSimple weight="bold" /> Output Validation (Locked)
          </button>
        </div>
        <div className="text-xs text-zinc-450 font-semibold flex items-center gap-2">
          <Info className="text-indigo-500" /><span>Menu Budget & Output dikunci oleh Data Team.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">📌 Rencana Cakupan & Target Lapangan Tim</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Nama Tim</th>
                    <th className="py-2.5">Area Survey</th>
                    <th className="py-2.5">Dataset</th>
                    <th className="py-2.5 text-center">Target</th>
                    <th className="py-2.5 text-center">Budget Plan</th>
                    <th className="py-2.5 text-center">Output</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-medium">
                  {localPlans.map((pl) => (
                    <tr key={pl.id} onClick={() => { setSelectedPlan(pl); setIsEditingPlan(false); }} className={`hover:bg-zinc-50/70 transition cursor-pointer ${selectedPlan?.id === pl.id ? "bg-zinc-50 font-bold" : ""}`}>
                      <td className="py-3.5 text-zinc-900 font-bold pr-2">{pl.team}</td>
                      <td className="py-3.5 text-zinc-600 font-semibold max-w-[150px] truncate">{pl.area}</td>
                      <td className="py-3.5"><span className="text-[9px] font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-lg whitespace-nowrap">{pl.dataset}</span></td>
                      <td className="py-3.5 text-center text-zinc-800 whitespace-nowrap">{pl.target}</td>
                      <td className="py-3.5 text-center font-mono whitespace-nowrap">{pl.budget}</td>
                      <td className="py-3.5 text-center font-semibold text-indigo-600 whitespace-nowrap">{pl.output}</td>
                      <td className="py-3.5 text-right"><span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded tracking-wider whitespace-nowrap ${pl.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : pl.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-zinc-50 text-zinc-500 border-zinc-200"}`}>{pl.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {selectedPlan === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <MapPin size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih tim untuk melihat detail lokasi survei dan mengedit status kegiatan lapangan.</p>
              </div>
            ) : isEditingPlan ? (
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5"><PencilSimple size={16} /> Edit Survey Plan</h3>
                  <button onClick={() => setIsEditingPlan(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Tim</label><Input value={editFormPlan.team || ""} onChange={(e) => setEditFormPlan({ ...editFormPlan, team: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Area Lokasi Survei</label><Input value={editFormPlan.area || ""} onChange={(e) => setEditFormPlan({ ...editFormPlan, area: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Dataset Focus</label><Input value={editFormPlan.dataset || ""} onChange={(e) => setEditFormPlan({ ...editFormPlan, dataset: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Target Rekaman</label><Input value={editFormPlan.target || ""} onChange={(e) => setEditFormPlan({ ...editFormPlan, target: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Budget Diajukan</label><Input value={editFormPlan.budget || ""} onChange={(e) => setEditFormPlan({ ...editFormPlan, budget: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Status Survei</label>
                      <select value={editFormPlan.status || "Planned"} onChange={(e) => setEditFormPlan({ ...editFormPlan, status: e.target.value as any })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none">
                        <option value="Planned">Planned</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="Delayed">Delayed</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Progres Output Terkumpul</label><Input value={editFormPlan.output || ""} onChange={(e) => setEditFormPlan({ ...editFormPlan, output: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs font-bold text-indigo-600" /></div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button onClick={handleSavePlan} className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"><FloppyDisk size={14} /> Save</Button>
                  <Button onClick={() => setIsEditingPlan(false)} variant="outline" className="bg-white border-zinc-200 hover:bg-zinc-50 text-xs font-semibold py-2 rounded-xl">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{selectedPlan.dataset}</span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-tight">{selectedPlan.team}</h3>
                  </div>
                  <button onClick={() => handleEditPlanClick(selectedPlan)} className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"><PencilSimple size={14} /></button>
                </div>
                <div className="space-y-1 pb-3 border-b border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Lokasi Area Survei</p>
                  <p className="text-zinc-800 font-bold mt-0.5 flex items-center gap-1"><MapPin size={13} className="text-zinc-400" />{selectedPlan.area}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-100 pb-3">
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Target & Budget</p><p className="text-zinc-800 font-bold mt-0.5">{selectedPlan.target} / {selectedPlan.budget}</p></div>
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Status</p><span className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded tracking-wider ${selectedPlan.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : selectedPlan.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-zinc-50 text-zinc-500 border-zinc-200"}`}>{selectedPlan.status}</span></div>
                </div>
                <div className="text-xs space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase">Progres Terkumpul (Output)</p><p className="text-indigo-700 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 leading-relaxed font-bold">✅ {selectedPlan.output}</p></div>
                <button onClick={() => handleEditPlanClick(selectedPlan)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition cursor-pointer">Update Survey Status</button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
