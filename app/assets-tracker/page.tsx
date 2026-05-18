"use client";

import { useState, useEffect } from "react";
import { 
  Palette, 
  User, 
  CheckCircle, 
  WarningCircle, 
  Info,
  Sparkle,
  Link as LinkIcon,
  Plus,
  PencilSimple,
  FloppyDisk,
  X
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Asset = {
  id: string;
  name: string;
  priority: "P0" | "P1" | "P2";
  format: string;
  owner: string;
  status: "Not Started" | "Draft 1" | "In Review" | "Revision" | "Approved" | "Published";
  deadline: string;
  link_url?: string;
  notes?: string;
};

const initialAssets: Asset[] = [
  { id: "a-1", name: "Main Key Visual Catalyst 2026", priority: "P0", format: "16:9, 4:5, 9:16", owner: "Rian / Design Team", status: "In Review", deadline: "28 Mei 2026", notes: "Subtle AI styling with maps." },
  { id: "a-2", name: "Launching Poster & Feed Banner", priority: "P0", format: "Feed (4:5), Story (9:16)", owner: "Rian / Design Team", status: "Draft 1", deadline: "2 Juni 2026", notes: "Depends on locked Main Key Visual." },
  { id: "a-3", name: "Timeline Stepper Infographic", priority: "P0", format: "4:5, 16:9", owner: "Rian / Design Team", status: "Not Started", deadline: "4 Juni 2026" },
  { id: "a-4", name: "Carousel Explainer: Maps That Think", priority: "P1", format: "Feed (4:5)", owner: "Lia / Design Team", status: "Revision", deadline: "5 Juni 2026", notes: "Feedback: typography too small in page 4." },
  { id: "a-5", name: "Sponsor Deck Visual Template", priority: "P2", format: "16:9 PDF", owner: "Lia / Design Team", status: "Approved", deadline: "22 Mei 2026", link_url: "https://mapid.co.id/assets/design/sponsor-deck-template.fig" }
];

export default function VisualAssetTrackerPage() {
  const [localAssets, setLocalAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Asset>>({});

  const priorities = ["P0", "P1", "P2"];
  const statuses = ["Not Started", "Draft 1", "In Review", "Revision", "Approved", "Published"];

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase.from("catalyst_assets").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) setLocalAssets(data as Asset[]);
        else setLocalAssets(initialAssets);
      } catch { setLocalAssets(initialAssets); }
    }
    fetch();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Published": return "bg-emerald-150 text-emerald-850 border-emerald-300 font-bold";
      case "Approved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Review": return "bg-purple-100 text-purple-800 border-purple-200 ring-2 ring-purple-50";
      case "Draft 1": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Revision": return "bg-rose-50 text-rose-700 border-rose-150";
      default: return "bg-zinc-50 text-zinc-400 border-zinc-250";
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "P0": return "bg-rose-50 text-rose-750 border-rose-100 font-extrabold";
      case "P1": return "bg-amber-50 text-amber-750 border-amber-100 font-bold";
      default: return "bg-zinc-50 text-zinc-500 border-zinc-200";
    }
  };

  const handleEditClick = (as: Asset) => { setEditForm(as); setIsEditing(true); };

  const handleSave = async () => {
    if (!editForm.name || !editForm.id) return;
    const updated = localAssets.map(a => a.id === editForm.id ? (editForm as Asset) : a);
    setLocalAssets(updated);
    setSelectedAsset(editForm as Asset);
    setIsEditing(false);
    try { await supabase.from("catalyst_assets").upsert(editForm); } catch (e) { console.error(e); }
  };

  const handleCreateNew = () => {
    const n: Asset = { id: crypto.randomUUID(), name: "New Graphic Asset", priority: "P1", format: "16:9", owner: "Design Team", status: "Not Started", deadline: "15 Juni 2026", notes: "Provide details on asset requirements." };
    setLocalAssets([n, ...localAssets]);
    setSelectedAsset(n);
    handleEditClick(n);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Visual Assets</h1>
          <p className="mt-1 text-zinc-500 text-sm">Monitor pembuatan materi grafis publikasi, poster pendaftaran, infografis timeline, dan slide deck sponsor.</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
          <Plus weight="bold" /> Add Graphic Brief
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <Palette className="text-xl text-zinc-700 mb-3 block" />
          <h3 className="font-bold text-sm mb-1">Arah Visual Utama</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Minimalis, bernuansa spasial/kartografi, berorientasi data geospasial, cerdas, dan profesional.</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <Sparkle className="text-xl text-zinc-700 mb-3 block" />
          <h3 className="font-bold text-sm mb-1">Pesan Kunci Utama</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Pemanfaatan model spasial berbasis AI untuk mentransformasi survei lapangan menjadi WebGIS yang solutif.</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm border-rose-100 bg-rose-50/10">
          <WarningCircle className="text-xl text-rose-600 mb-3 block" />
          <h3 className="font-bold text-sm mb-1 text-rose-900">Hindari (Do Not Use)</h3>
          <p className="text-xs text-rose-700/80 leading-relaxed">Aset grafis robot, otak bercahaya neon berlebihan, fiksi ilmiah cyberpunk, dan peta yang terlalu padat.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">🖼️ Timeline Pembuatan Aset Visual Kreatif</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Nama Aset</th>
                    <th className="py-2.5 text-center">Urgency</th>
                    <th className="py-2.5">Format</th>
                    <th className="py-2.5">Designer</th>
                    <th className="py-2.5 text-center">Deadline</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                  {localAssets.map((as) => (
                    <tr key={as.id} onClick={() => { setSelectedAsset(as); setIsEditing(false); }} className={`hover:bg-zinc-50/70 transition cursor-pointer ${selectedAsset?.id === as.id ? "bg-zinc-50 font-bold" : ""}`}>
                      <td className="py-4 text-zinc-900 font-bold pr-2">{as.name}</td>
                      <td className="py-4 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${getPriorityStyle(as.priority)}`}>{as.priority}</span></td>
                      <td className="py-4 text-zinc-600 font-semibold">{as.format}</td>
                      <td className="py-4 text-zinc-700 font-bold flex items-center gap-1.5"><User size={13} className="text-zinc-400" /> {as.owner}</td>
                      <td className="py-4 text-center font-mono font-semibold text-zinc-500">{as.deadline}</td>
                      <td className="py-4 text-right"><span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 border rounded-lg tracking-wider ${getStatusStyle(as.status)}`}>{as.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {selectedAsset === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <Palette size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih salah satu aset untuk melihat brief dan mengatur status pengerjaan.</p>
              </div>
            ) : isEditing ? (
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5"><PencilSimple size={16} /> Edit Brief Asset</h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Aset</label><Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Priority</label>
                      <select value={editForm.priority || "P1"} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none">
                        {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Status</label>
                      <select value={editForm.status || "Not Started"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none">
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Format</label><Input value={editForm.format || ""} onChange={(e) => setEditForm({ ...editForm, format: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Designer / PIC</label><Input value={editForm.owner || ""} onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Deadline</label><Input value={editForm.deadline || ""} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Link Figma / Drive</label><Input value={editForm.link_url || ""} onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Brief</label><textarea value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none" /></div>
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
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded ${getPriorityStyle(selectedAsset.priority)}`}>{selectedAsset.priority} Priority</span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-tight">{selectedAsset.name}</h3>
                  </div>
                  <button onClick={() => handleEditClick(selectedAsset)} className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"><PencilSimple size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-100 pb-3">
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Format</p><p className="text-zinc-800 font-semibold mt-0.5">{selectedAsset.format}</p></div>
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Designer</p><p className="text-zinc-800 font-bold mt-0.5 flex items-center gap-1"><User size={13} className="text-zinc-400" />{selectedAsset.owner}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-100 pb-3">
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Status</p><span className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded-lg tracking-wider ${getStatusStyle(selectedAsset.status)}`}>{selectedAsset.status}</span></div>
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Deadline</p><p className="text-zinc-800 font-mono font-semibold mt-0.5">{selectedAsset.deadline}</p></div>
                </div>
                <div className="text-xs space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase">Brief & Notes</p><p className="text-zinc-600 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-150 leading-relaxed font-medium">💡 {selectedAsset.notes || "Belum ada catatan detail."}</p></div>
                {selectedAsset.link_url && (
                  <a href={selectedAsset.link_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-bold py-2.5 px-3 rounded-xl border border-zinc-200 transition cursor-pointer">
                    <LinkIcon size={14} /> Buka Source File
                  </a>
                )}
                <button onClick={() => handleEditClick(selectedAsset)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition cursor-pointer">Update Asset Details</button>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-indigo-500" /><span>Designer akan memperbarui status secara rutin.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
