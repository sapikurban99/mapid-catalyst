"use client";

import { useState, useEffect } from "react";
import { 
  Building, 
  MapPin, 
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

type EventItem = {
  id: string;
  item: string;
  category: "Venue Setup" | "Exhibition Booths" | "AV & Technical" | "Signage & Print" | "Hospitality & Crew";
  owner: string;
  status: "Completed" | "Pending Approval" | "In Progress" | "Delayed" | "Not Started";
  cost_estimate: string;
  notes: string;
};

const initialItems: EventItem[] = [
  { id: "ev-1", item: "Sewa Auditorium BINUS & Security", category: "Venue Setup", owner: "Rudi / Ops Team", status: "Completed", cost_estimate: "Sponsored / Free", notes: "Capacity 500 seats. Mic and projector check done." },
  { id: "ev-2", item: "Setup 15 Booths untuk Top 10 + Sponsor", category: "Exhibition Booths", owner: "Rudi / Ops Team", status: "In Progress", cost_estimate: "Rp 8,500,000", notes: "T-structure assembly locked by vendors." },
  { id: "ev-3", item: "Internet Bandwidth Dedicated 100Mbps", category: "AV & Technical", owner: "Tech Team / BINUS IT", status: "Pending Approval", cost_estimate: "Rp 2,000,000", notes: "Critical for participants live demo mapping." },
  { id: "ev-4", item: "Cetak Banner, Backdrop & Signage Arah", category: "Signage & Print", owner: "Rara / Marketing", status: "In Progress", cost_estimate: "Rp 3,500,000", notes: "Graphics currently in final production." },
  { id: "ev-5", item: "Konsumsi Panitia, Juri & Pembicara", category: "Hospitality & Crew", owner: "Sarah / PM", status: "Not Started", cost_estimate: "Rp 5,000,000", notes: "Final menu approval pending." }
];

export default function MainEventOpsTrackerPage() {
  const [localItems, setLocalItems] = useState<EventItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EventItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EventItem>>({});

  const categories = ["Venue Setup", "Exhibition Booths", "AV & Technical", "Signage & Print", "Hospitality & Crew"];
  const statuses = ["Completed", "Pending Approval", "In Progress", "Delayed", "Not Started"];

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase.from("catalyst_event_ops").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) setLocalItems(data as EventItem[]);
        else setLocalItems(initialItems);
      } catch { setLocalItems(initialItems); }
    }
    fetch();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed": return "bg-emerald-150 text-emerald-850 border-emerald-300 font-bold";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending Approval": return "bg-purple-100 text-purple-800 border-purple-200 ring-2 ring-purple-50";
      case "Delayed": return "bg-rose-100 text-rose-800 border-rose-250";
      default: return "bg-zinc-50 text-zinc-400 border-zinc-250";
    }
  };

  const handleEditClick = (item: EventItem) => { setEditForm(item); setIsEditing(true); };

  const handleSave = async () => {
    if (!editForm.item || !editForm.id) return;
    const updated = localItems.map(i => i.id === editForm.id ? (editForm as EventItem) : i);
    setLocalItems(updated);
    setSelectedItem(editForm as EventItem);
    setIsEditing(false);
    try { await supabase.from("catalyst_event_ops").upsert(editForm); } catch (e) { console.error(e); }
  };

  const handleCreateNew = () => {
    const n: EventItem = { id: crypto.randomUUID(), item: "New Ops Requirement", category: "Venue Setup", owner: "Ops Team", status: "Not Started", cost_estimate: "Rp 0", notes: "Catatan kebutuhan operasional baru." };
    setLocalItems([n, ...localItems]);
    setSelectedItem(n);
    handleEditClick(n);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Main Event Operations</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola persiapan logistik pameran, ketersediaan auditorium BINUS, sewa booth, kelayakan audio visual, serta kelancaran koneksi internet.</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
          <Plus weight="bold" /> Add Event Requirement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">🏢 Checklist Kesiapan Logistik</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Kebutuhan Logistik</th>
                    <th className="py-2.5">Kategori</th>
                    <th className="py-2.5">PIC Lapangan</th>
                    <th className="py-2.5 text-center">Estimasi Biaya</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                  {localItems.map((it) => (
                    <tr key={it.id} onClick={() => { setSelectedItem(it); setIsEditing(false); }} className={`hover:bg-zinc-50/70 transition cursor-pointer ${selectedItem?.id === it.id ? "bg-zinc-50 font-bold" : ""}`}>
                      <td className="py-4 text-zinc-900 font-bold pr-4 leading-tight">{it.item}</td>
                      <td className="py-4"><span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-lg whitespace-nowrap">{it.category}</span></td>
                      <td className="py-4 text-zinc-700 font-bold whitespace-nowrap">{it.owner}</td>
                      <td className="py-4 font-mono font-semibold text-zinc-500 text-center whitespace-nowrap">{it.cost_estimate}</td>
                      <td className="py-4 text-right"><span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 border rounded-lg tracking-wider whitespace-nowrap ${getStatusStyle(it.status)}`}>{it.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {selectedItem === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <Building size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih salah satu item logistik untuk mengedit detail dan memperbarui status kesiapan.</p>
              </div>
            ) : isEditing ? (
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5"><PencilSimple size={16} /> Edit Ops Item</h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Kebutuhan</label><Input value={editForm.item || ""} onChange={(e) => setEditForm({ ...editForm, item: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Kategori</label>
                    <select value={editForm.category || "Venue Setup"} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">PIC Lapangan</label><Input value={editForm.owner || ""} onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Estimasi Biaya</label><Input value={editForm.cost_estimate || ""} onChange={(e) => setEditForm({ ...editForm, cost_estimate: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Status</label>
                    <select value={editForm.status || "Not Started"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none">
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Teknis</label><textarea value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none" /></div>
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
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{selectedItem.category}</span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-tight">{selectedItem.item}</h3>
                  </div>
                  <button onClick={() => handleEditClick(selectedItem)} className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"><PencilSimple size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-100 pb-3">
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">PIC Lapangan</p><p className="text-zinc-800 font-bold mt-0.5">{selectedItem.owner}</p></div>
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Estimasi Biaya</p><p className="text-zinc-800 font-mono font-semibold mt-0.5">{selectedItem.cost_estimate}</p></div>
                </div>
                <div className="space-y-1 pb-3 border-b border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Status Kesiapan</p>
                  <span className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded-lg tracking-wider ${getStatusStyle(selectedItem.status)}`}>{selectedItem.status}</span>
                </div>
                <div className="text-xs space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Teknis</p><p className="text-zinc-600 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-150 leading-relaxed font-medium">📋 {selectedItem.notes || "Tidak ada catatan tambahan."}</p></div>
                <button onClick={() => handleEditClick(selectedItem)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition cursor-pointer">Update Logistic Info</button>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-indigo-500" /><span>Ops tim akan melakukan check-in H-3 acara.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
