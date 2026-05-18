"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  User, 
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

type Risk = {
  id: string;
  hazard: string;
  impact: number;
  probability: number;
  score: number;
  owner: string;
  mitigation: string;
  status: "Mitigated" | "Active" | "Acceptable";
};

const initialRisks: Risk[] = [
  { id: "r-1", hazard: "Kebocoran data rahasia UMKM Go / Property Go", impact: 5, probability: 2, score: 10, owner: "Tech Team / Data Team", mitigation: "Enkripsi key API & verifikasi identitas 50 tim terkurasi sebelum penyerahan credential.", status: "Active" },
  { id: "r-2", hazard: "Kehadiran peserta di BINUS minim karena jadwal bentrok kuliah", impact: 4, probability: 3, score: 12, owner: "Sarah / PM", mitigation: "Surat undangan dispensasi resmi dari MAPID & BINUS dikirim ke masing-masing kaprodi.", status: "Mitigated" },
  { id: "r-3", hazard: "Server GEO MAPID overload saat Demo Day live", impact: 5, probability: 2, score: 10, owner: "Tech Team", mitigation: "Mempersiapkan server mirror & load balancer tambahan H-3 acara.", status: "Active" },
  { id: "r-4", hazard: "Sponsor tier utama mundur karena birokrasi internal", impact: 4, probability: 2, score: 8, owner: "Indra / Partner", mitigation: "Mempercepat pengiriman proposal sponsor ke prospek alternatif AWS/GoTo.", status: "Active" }
];

export default function RiskRegisterPage() {
  const [localRisks, setLocalRisks] = useState<Risk[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Risk>>({});

  const statuses = ["Mitigated", "Active", "Acceptable"];

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase.from("catalyst_risks").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) setLocalRisks(data as Risk[]);
        else setLocalRisks(initialRisks);
      } catch { setLocalRisks(initialRisks); }
    }
    fetch();
  }, []);

  const getScoreStyle = (score: number) => {
    if (score >= 12) return "bg-rose-100 text-rose-800 border-rose-250 font-bold";
    if (score >= 8) return "bg-amber-100 text-amber-800 border-amber-200 font-semibold";
    return "bg-emerald-100 text-emerald-800 border-emerald-150";
  };

  const handleEditClick = (r: Risk) => { setEditForm(r); setIsEditing(true); };

  const handleSave = async () => {
    if (!editForm.hazard || !editForm.id) return;
    const computedScore = (editForm.impact || 1) * (editForm.probability || 1);
    const finalForm = { ...editForm, score: computedScore } as Risk;
    
    const updated = localRisks.map(r => r.id === finalForm.id ? finalForm : r);
    setLocalRisks(updated);
    setSelectedRisk(finalForm);
    setIsEditing(false);
    try { await supabase.from("catalyst_risks").upsert(finalForm); } catch (e) { console.error(e); }
  };

  const handleCreateNew = () => {
    const n: Risk = { id: crypto.randomUUID(), hazard: "New Risk Identification", impact: 3, probability: 3, score: 9, owner: "Ops Team", mitigation: "Tuliskan langkah preventif di sini.", status: "Active" };
    setLocalRisks([n, ...localRisks]);
    setSelectedRisk(n);
    handleEditClick(n);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Risk Register</h1>
          <p className="mt-1 text-zinc-500 text-sm">Identifikasi risiko kritis, penilaian probabilitas & dampak spasial, serta penyusunan langkah-langkah mitigasi penanggulangan.</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
          <Plus weight="bold" /> Add Risk
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">🛡️ Penanggulangan Bahaya Operasional & Reputasi</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Risiko / Bahaya</th>
                    <th className="py-2.5 text-center">Score</th>
                    <th className="py-2.5">Risk Owner</th>
                    <th className="py-2.5 text-right">Status Mitigasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                  {localRisks.map((r) => (
                    <tr key={r.id} onClick={() => { setSelectedRisk(r); setIsEditing(false); }} className={`hover:bg-zinc-50/70 transition cursor-pointer ${selectedRisk?.id === r.id ? "bg-zinc-50 font-bold" : ""}`}>
                      <td className="py-4 text-zinc-900 font-bold pr-4 leading-snug max-w-[250px]">{r.hazard}</td>
                      <td className="py-4 text-center"><span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-lg ${getScoreStyle(r.score)}`}>{r.score}</span></td>
                      <td className="py-4 text-zinc-700 font-bold">{r.owner}</td>
                      <td className="py-4 text-right"><span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 border rounded-lg tracking-wider ${r.status === "Mitigated" ? "bg-emerald-50 text-emerald-700 border-emerald-150 font-bold" : "bg-rose-50 text-rose-700 border-rose-150 font-bold"}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {selectedRisk === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <ShieldCheck size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih risiko di tabel untuk melihat matriks dampak dan merencanakan mitigasi.</p>
              </div>
            ) : isEditing ? (
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5"><PencilSimple size={16} /> Edit Risk Assessment</h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Risiko / Bahaya</label><Input value={editForm.hazard || ""} onChange={(e) => setEditForm({ ...editForm, hazard: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Impact (1-5)</label><Input type="number" min="1" max="5" value={editForm.impact || 1} onChange={(e) => setEditForm({ ...editForm, impact: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Probability (1-5)</label><Input type="number" min="1" max="5" value={editForm.probability || 1} onChange={(e) => setEditForm({ ...editForm, probability: parseInt(e.target.value) })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Risk Owner</label><Input value={editForm.owner || ""} onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Status</label>
                    <select value={editForm.status || "Active"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none">
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Mitigation Plan</label><textarea value={editForm.mitigation || ""} onChange={(e) => setEditForm({ ...editForm, mitigation: e.target.value })} rows={4} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none" /></div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button onClick={handleSave} className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"><FloppyDisk size={14} /> Save</Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="bg-white border-zinc-200 hover:bg-zinc-50 text-xs font-semibold py-2 rounded-xl">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-start gap-4">
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 border rounded-lg ${getScoreStyle(selectedRisk.score)}`}>Score: {selectedRisk.score}</span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-snug">{selectedRisk.hazard}</h3>
                  </div>
                  <button onClick={() => handleEditClick(selectedRisk)} className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"><PencilSimple size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-100 pb-3">
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Impact Level</p><p className="text-zinc-800 font-mono font-bold mt-0.5">{selectedRisk.impact} / 5</p></div>
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Probability</p><p className="text-zinc-800 font-mono font-bold mt-0.5">{selectedRisk.probability} / 5</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-100 pb-3">
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Risk Owner</p><p className="text-zinc-800 font-bold mt-0.5 flex items-center gap-1"><User size={13} className="text-zinc-400" />{selectedRisk.owner}</p></div>
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Status</p><span className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded-lg tracking-wider ${selectedRisk.status === "Mitigated" ? "bg-emerald-50 text-emerald-700 border-emerald-150" : "bg-rose-50 text-rose-700 border-rose-150"}`}>{selectedRisk.status}</span></div>
                </div>
                <div className="text-xs space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase">Mitigation Plan</p><p className="text-zinc-600 bg-zinc-50/50 p-3 rounded-xl border border-zinc-150 leading-relaxed font-medium">🛡️ {selectedRisk.mitigation || "Belum ada rencana mitigasi."}</p></div>
                <button onClick={() => handleEditClick(selectedRisk)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition cursor-pointer">Update Risk Info</button>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-indigo-500" /><span>Score dihitung otomatis dari (Impact x Probability).</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
