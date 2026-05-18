"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, 
  MapTrifold, 
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

type ProposalScore = {
  id: string;
  team: string;
  relevansi: number;
  community_data: number;
  survey_plan: number;
  ai_processing: number;
  inovasi: number;
  feasibility: number;
  total: number;
  rank: number;
};

type WebGISScore = {
  id: string;
  team: string;
  data_survey: number;
  ai_processing: number;
  spatial_insight: number;
  survey_quality: number;
  webgis_feature: number;
  ux_storytelling: number;
  performance: number;
  total: number;
  rank: number;
  finalist_status: string;
};

const initialProp: ProposalScore[] = [
  { id: "p-1", team: "Team Geoverse", relevansi: 90, community_data: 88, survey_plan: 92, ai_processing: 85, inovasi: 90, feasibility: 88, total: 533, rank: 1 },
  { id: "p-2", team: "EcoMap", relevansi: 88, community_data: 90, survey_plan: 85, ai_processing: 88, inovasi: 87, feasibility: 90, total: 528, rank: 2 },
  { id: "p-3", team: "AI Mapper", relevansi: 85, community_data: 85, survey_plan: 90, ai_processing: 92, inovasi: 92, feasibility: 82, total: 526, rank: 3 }
];

const initialWebGIS: WebGISScore[] = [
  { id: "w-1", team: "EcoMap", data_survey: 92, ai_processing: 90, spatial_insight: 95, survey_quality: 90, webgis_feature: 92, ux_storytelling: 94, performance: 88, total: 641, rank: 1, finalist_status: "Winner" },
  { id: "w-2", team: "Team Geoverse", data_survey: 90, ai_processing: 88, spatial_insight: 90, survey_quality: 92, webgis_feature: 90, ux_storytelling: 92, performance: 90, total: 632, rank: 2, finalist_status: "Runner Up" }
];

export default function JudgingScoringPage() {
  const [activeTab, setActiveTab] = useState<"proposal" | "webgis">("proposal");
  
  const [localProp, setLocalProp] = useState<ProposalScore[]>([]);
  const [selectedProp, setSelectedProp] = useState<ProposalScore | null>(null);
  const [isEditingProp, setIsEditingProp] = useState(false);
  const [editFormProp, setEditFormProp] = useState<Partial<ProposalScore>>({});

  const [localWebGIS, setLocalWebGIS] = useState<WebGISScore[]>([]);
  const [selectedWebGIS, setSelectedWebGIS] = useState<WebGISScore | null>(null);
  const [isEditingWebGIS, setIsEditingWebGIS] = useState(false);
  const [editFormWebGIS, setEditFormWebGIS] = useState<Partial<WebGISScore>>({});

  useEffect(() => {
    async function fetchProp() {
      try {
        const { data } = await supabase.from("catalyst_proposal_scores").select("*").order("total", { ascending: false });
        if (data && data.length > 0) setLocalProp(data as ProposalScore[]);
        else setLocalProp(initialProp);
      } catch { setLocalProp(initialProp); }
    }
    async function fetchWebGIS() {
      try {
        const { data } = await supabase.from("catalyst_webgis_scores").select("*").order("total", { ascending: false });
        if (data && data.length > 0) setLocalWebGIS(data as WebGISScore[]);
        else setLocalWebGIS(initialWebGIS);
      } catch { setLocalWebGIS(initialWebGIS); }
    }
    fetchProp();
    fetchWebGIS();
  }, []);

  const handleEditPropClick = (p: ProposalScore) => { setEditFormProp(p); setIsEditingProp(true); };
  const handleEditWebGISClick = (w: WebGISScore) => { setEditFormWebGIS(w); setIsEditingWebGIS(true); };

  const handleSaveProp = async () => {
    if (!editFormProp.team || !editFormProp.id) return;
    const computedTotal = (editFormProp.relevansi || 0) + (editFormProp.community_data || 0) + (editFormProp.survey_plan || 0) + (editFormProp.ai_processing || 0) + (editFormProp.inovasi || 0) + (editFormProp.feasibility || 0);
    const finalForm = { ...editFormProp, total: computedTotal } as ProposalScore;
    
    let updated = localProp.map(p => p.id === finalForm.id ? finalForm : p);
    updated.sort((a, b) => b.total - a.total);
    updated = updated.map((p, idx) => ({ ...p, rank: idx + 1 }));

    setLocalProp(updated);
    setSelectedProp(updated.find(p => p.id === finalForm.id) || finalForm);
    setIsEditingProp(false);
    try { await supabase.from("catalyst_proposal_scores").upsert(finalForm); } catch (e) { console.error(e); }
  };

  const handleSaveWebGIS = async () => {
    if (!editFormWebGIS.team || !editFormWebGIS.id) return;
    const computedTotal = (editFormWebGIS.data_survey || 0) + (editFormWebGIS.ai_processing || 0) + (editFormWebGIS.spatial_insight || 0) + (editFormWebGIS.survey_quality || 0) + (editFormWebGIS.webgis_feature || 0) + (editFormWebGIS.ux_storytelling || 0) + (editFormWebGIS.performance || 0);
    const finalForm = { ...editFormWebGIS, total: computedTotal } as WebGISScore;

    let updated = localWebGIS.map(w => w.id === finalForm.id ? finalForm : w);
    updated.sort((a, b) => b.total - a.total);
    updated = updated.map((w, idx) => ({ ...w, rank: idx + 1 }));

    setLocalWebGIS(updated);
    setSelectedWebGIS(updated.find(w => w.id === finalForm.id) || finalForm);
    setIsEditingWebGIS(false);
    try { await supabase.from("catalyst_webgis_scores").upsert(finalForm); } catch (e) { console.error(e); }
  };

  const handleCreateProp = () => {
    const n: ProposalScore = { id: crypto.randomUUID(), team: "New Team", relevansi: 0, community_data: 0, survey_plan: 0, ai_processing: 0, inovasi: 0, feasibility: 0, total: 0, rank: localProp.length + 1 };
    setLocalProp([...localProp, n]);
    setSelectedProp(n);
    handleEditPropClick(n);
  };

  const handleCreateWebGIS = () => {
    const n: WebGISScore = { id: crypto.randomUUID(), team: "New Finalist", data_survey: 0, ai_processing: 0, spatial_insight: 0, survey_quality: 0, webgis_feature: 0, ux_storytelling: 0, performance: 0, total: 0, rank: localWebGIS.length + 1, finalist_status: "Participant" };
    setLocalWebGIS([...localWebGIS, n]);
    setSelectedWebGIS(n);
    handleEditWebGISClick(n);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Judging & Scoring</h1>
          <p className="mt-1 text-zinc-500 text-sm">Rekapitulasi penilaian dewan juri pada tahap seleksi proposal dan penjurian akhir presentasi WebGIS.</p>
        </div>
        <Button onClick={activeTab === "proposal" ? handleCreateProp : handleCreateWebGIS} className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
          <Plus weight="bold" /> Add {activeTab === "proposal" ? "Proposal" : "WebGIS"} Score
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-zinc-100 p-1 rounded-xl flex gap-1 border border-zinc-200 self-start">
          <button onClick={() => setActiveTab("proposal")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === "proposal" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}>
            <MapTrifold weight="bold" /> Proposal Selection
          </button>
          <button onClick={() => setActiveTab("webgis")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === "webgis" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}>
            <Trophy weight="bold" /> Final WebGIS Demo
          </button>
        </div>
        <div className="text-xs text-zinc-450 font-semibold flex items-center gap-2">
          <Info className="text-indigo-500" /><span>Penilaian akan diperbarui secara real-time saat juri menyimpan data.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          {activeTab === "proposal" ? (
            <div>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">📋 Skor Kurasi 50 Tim Teratas</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 w-10 text-center">Rank</th>
                      <th className="py-2.5">Nama Tim</th>
                      <th className="py-2.5 text-center" title="Relevansi dengan Tema">Relevansi</th>
                      <th className="py-2.5 text-center" title="Penggunaan Data Komunitas">Comm Data</th>
                      <th className="py-2.5 text-center" title="Potensi AI Spatial">AI Model</th>
                      <th className="py-2.5 text-center" title="Total Skor Maks 600">Total (600)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                    {localProp.map((p) => (
                      <tr key={p.id} onClick={() => { setSelectedProp(p); setIsEditingProp(false); }} className={`hover:bg-zinc-50/70 transition cursor-pointer ${selectedProp?.id === p.id ? "bg-zinc-50 font-bold" : ""}`}>
                        <td className="py-3.5 text-center"><span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${p.rank === 1 ? 'bg-amber-100 text-amber-700' : p.rank === 2 ? 'bg-zinc-200 text-zinc-700' : p.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-zinc-100 text-zinc-500'}`}>{p.rank}</span></td>
                        <td className="py-3.5 text-zinc-900 font-bold">{p.team}</td>
                        <td className="py-3.5 text-center font-mono">{p.relevansi}</td>
                        <td className="py-3.5 text-center font-mono">{p.community_data}</td>
                        <td className="py-3.5 text-center font-mono">{p.ai_processing}</td>
                        <td className="py-3.5 text-center font-mono font-extrabold text-indigo-700">{p.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">🏆 Papan Peringkat Top 10 Grand Final</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 w-10 text-center">Rank</th>
                      <th className="py-2.5">Nama Tim Finalis</th>
                      <th className="py-2.5 text-center">Survey Val</th>
                      <th className="py-2.5 text-center">UX & Story</th>
                      <th className="py-2.5 text-center">AI Spatial</th>
                      <th className="py-2.5 text-center">Total (700)</th>
                      <th className="py-2.5 text-right">Penetapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                    {localWebGIS.map((w) => (
                      <tr key={w.id} onClick={() => { setSelectedWebGIS(w); setIsEditingWebGIS(false); }} className={`hover:bg-zinc-50/70 transition cursor-pointer ${selectedWebGIS?.id === w.id ? "bg-zinc-50 font-bold" : ""}`}>
                        <td className="py-4 text-center"><span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shadow-sm ${w.rank === 1 ? 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900' : w.rank === 2 ? 'bg-gradient-to-br from-zinc-200 to-zinc-400 text-zinc-800' : w.rank === 3 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-950' : 'bg-zinc-100 text-zinc-500'}`}>{w.rank}</span></td>
                        <td className="py-4 text-zinc-900 font-bold">{w.team}</td>
                        <td className="py-4 text-center font-mono">{w.data_survey}</td>
                        <td className="py-4 text-center font-mono">{w.ux_storytelling}</td>
                        <td className="py-4 text-center font-mono">{w.spatial_insight}</td>
                        <td className="py-4 text-center font-mono font-extrabold text-indigo-700">{w.total}</td>
                        <td className="py-4 text-right"><span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded-lg tracking-wider ${w.finalist_status === 'Winner' ? 'bg-amber-100 text-amber-800 border-amber-200' : w.finalist_status === 'Runner Up' ? 'bg-zinc-200 text-zinc-800 border-zinc-300' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>{w.finalist_status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {activeTab === "proposal" ? (
              selectedProp === null ? (
                <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                  <MapTrifold size={48} className="mx-auto text-zinc-200" />
                  <p className="text-xs font-semibold">Pilih tim untuk memberi penilaian proposal.</p>
                </div>
              ) : isEditingProp ? (
                <div className="space-y-4 text-xs font-medium text-zinc-800">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5"><PencilSimple size={16} /> Edit Score</h3>
                    <button onClick={() => setIsEditingProp(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Tim</label><Input value={editFormProp.team || ""} onChange={(e) => setEditFormProp({ ...editFormProp, team: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs font-bold" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Relevansi</label><Input type="number" value={editFormProp.relevansi || 0} onChange={(e) => setEditFormProp({ ...editFormProp, relevansi: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Comm Data</label><Input type="number" value={editFormProp.community_data || 0} onChange={(e) => setEditFormProp({ ...editFormProp, community_data: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Survey Plan</label><Input type="number" value={editFormProp.survey_plan || 0} onChange={(e) => setEditFormProp({ ...editFormProp, survey_plan: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">AI Processing</label><Input type="number" value={editFormProp.ai_processing || 0} onChange={(e) => setEditFormProp({ ...editFormProp, ai_processing: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Inovasi</label><Input type="number" value={editFormProp.inovasi || 0} onChange={(e) => setEditFormProp({ ...editFormProp, inovasi: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Feasibility</label><Input type="number" value={editFormProp.feasibility || 0} onChange={(e) => setEditFormProp({ ...editFormProp, feasibility: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button onClick={handleSaveProp} className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"><FloppyDisk size={14} /> Calculate & Save</Button>
                    <Button onClick={() => setIsEditingProp(false)} variant="outline" className="bg-white border-zinc-200 hover:bg-zinc-50 text-xs font-semibold py-2 rounded-xl">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b border-zinc-100 pb-3 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Rank #{selectedProp.rank}</span>
                      <h3 className="font-bold text-zinc-950 text-base leading-tight">{selectedProp.team}</h3>
                    </div>
                    <button onClick={() => handleEditPropClick(selectedProp)} className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"><PencilSimple size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-b border-zinc-100 pb-3">
                    <div className="flex justify-between items-center"><span className="text-zinc-500">Relevansi</span><span className="font-mono font-bold">{selectedProp.relevansi}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">Comm Data</span><span className="font-mono font-bold">{selectedProp.community_data}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">Survey Plan</span><span className="font-mono font-bold">{selectedProp.survey_plan}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">AI Model</span><span className="font-mono font-bold">{selectedProp.ai_processing}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">Inovasi</span><span className="font-mono font-bold">{selectedProp.inovasi}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">Feasibility</span><span className="font-mono font-bold">{selectedProp.feasibility}</span></div>
                  </div>
                  <div className="text-center p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Score Computed</p>
                    <p className="text-3xl font-extrabold text-indigo-600 font-mono mt-1">{selectedProp.total}</p>
                  </div>
                  <button onClick={() => handleEditPropClick(selectedProp)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition cursor-pointer">Update Score</button>
                </div>
              )
            ) : (
              selectedWebGIS === null ? (
                <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                  <Trophy size={48} className="mx-auto text-zinc-200" />
                  <p className="text-xs font-semibold">Pilih finalis untuk memberi skor presentasi WebGIS.</p>
                </div>
              ) : isEditingWebGIS ? (
                <div className="space-y-4 text-xs font-medium text-zinc-800">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5"><PencilSimple size={16} /> Edit Demo Score</h3>
                    <button onClick={() => setIsEditingWebGIS(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Finalis</label><Input value={editFormWebGIS.team || ""} onChange={(e) => setEditFormWebGIS({ ...editFormWebGIS, team: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs font-bold" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Data Survey</label><Input type="number" value={editFormWebGIS.data_survey || 0} onChange={(e) => setEditFormWebGIS({ ...editFormWebGIS, data_survey: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">AI Processing</label><Input type="number" value={editFormWebGIS.ai_processing || 0} onChange={(e) => setEditFormWebGIS({ ...editFormWebGIS, ai_processing: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Spatial Insight</label><Input type="number" value={editFormWebGIS.spatial_insight || 0} onChange={(e) => setEditFormWebGIS({ ...editFormWebGIS, spatial_insight: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Survey Quality</label><Input type="number" value={editFormWebGIS.survey_quality || 0} onChange={(e) => setEditFormWebGIS({ ...editFormWebGIS, survey_quality: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">WebGIS Feature</label><Input type="number" value={editFormWebGIS.webgis_feature || 0} onChange={(e) => setEditFormWebGIS({ ...editFormWebGIS, webgis_feature: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">UX Storytelling</label><Input type="number" value={editFormWebGIS.ux_storytelling || 0} onChange={(e) => setEditFormWebGIS({ ...editFormWebGIS, ux_storytelling: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Performance</label><Input type="number" value={editFormWebGIS.performance || 0} onChange={(e) => setEditFormWebGIS({ ...editFormWebGIS, performance: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Final Status Penetapan</label>
                      <select value={editFormWebGIS.finalist_status || "Participant"} onChange={(e) => setEditFormWebGIS({ ...editFormWebGIS, finalist_status: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none">
                        <option value="Winner">Winner</option><option value="Runner Up">Runner Up</option><option value="Top 10">Top 10</option><option value="Participant">Participant</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button onClick={handleSaveWebGIS} className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"><FloppyDisk size={14} /> Calculate & Save</Button>
                    <Button onClick={() => setIsEditingWebGIS(false)} variant="outline" className="bg-white border-zinc-200 hover:bg-zinc-50 text-xs font-semibold py-2 rounded-xl">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b border-zinc-100 pb-3 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase">Final Rank #{selectedWebGIS.rank}</span>
                      <h3 className="font-bold text-zinc-950 text-base leading-tight">{selectedWebGIS.team}</h3>
                    </div>
                    <button onClick={() => handleEditWebGISClick(selectedWebGIS)} className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"><PencilSimple size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-b border-zinc-100 pb-3">
                    <div className="flex justify-between items-center"><span className="text-zinc-500">Data Survey</span><span className="font-mono font-bold">{selectedWebGIS.data_survey}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">AI Logic</span><span className="font-mono font-bold">{selectedWebGIS.ai_processing}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">Insight</span><span className="font-mono font-bold">{selectedWebGIS.spatial_insight}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">Features</span><span className="font-mono font-bold">{selectedWebGIS.webgis_feature}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">UX Story</span><span className="font-mono font-bold">{selectedWebGIS.ux_storytelling}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-500">Perf</span><span className="font-mono font-bold">{selectedWebGIS.performance}</span></div>
                  </div>
                  <div className="text-center p-3 bg-zinc-50 border border-zinc-200 rounded-xl relative overflow-hidden">
                    {selectedWebGIS.rank === 1 && <div className="absolute top-0 right-0 p-2 text-amber-500 opacity-20"><Trophy size={48} /></div>}
                    <p className="text-[10px] font-bold text-zinc-400 uppercase relative z-10">Total Final Score</p>
                    <p className="text-3xl font-extrabold text-amber-600 font-mono mt-1 relative z-10">{selectedWebGIS.total}</p>
                    <span className="inline-block mt-2 text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded-lg tracking-wider bg-amber-100 text-amber-800 border-amber-200 relative z-10">{selectedWebGIS.finalist_status}</span>
                  </div>
                  <button onClick={() => handleEditWebGISClick(selectedWebGIS)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition cursor-pointer">Update Final Score</button>
                </div>
              )
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
