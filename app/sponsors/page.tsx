"use client";

import { useState, useEffect } from "react";
import { 
  Handshake, 
  User, 
  CalendarBlank, 
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

type Sponsor = {
  id: string;
  partner: string;
  type: string;
  tier: string;
  pic: string;
  status: string;
  next_action: string;
  deadline: string;
  logo?: string;
  booth?: string;
  speaker?: string;
  judge?: string;
  media_mention?: string;
  report?: string;
  notes?: string;
};

const initialSponsors: Sponsor[] = [
  { id: "sp-1", partner: "BINUS University", type: "Venue Partner", tier: "Innovation Partner", pic: "Sarah / PM", status: "In Discussion", next_action: "Follow up auditorium availability", deadline: "30 Mei 2026", logo: "Received", booth: "Yes", speaker: "Yes", judge: "No", media_mention: "Done" },
  { id: "sp-2", partner: "GoTo Financial", type: "Sponsor", tier: "Strategic Partner", pic: "Indra / Partner", status: "In Negotiation", next_action: "Send customized Silver tier pricing proposal", deadline: "25 Mei 2026", logo: "Pending", booth: "Yes", speaker: "Yes", judge: "Yes", media_mention: "Pending" },
  { id: "sp-3", partner: "Himpunan Mahasiswa Geografi UGM", type: "Collaborator", tier: "Community Partner", pic: "Ali / Academy", status: "Confirmed", next_action: "Send booth assembly guidelines", deadline: "5 Juni 2026", logo: "Received", booth: "No", speaker: "No", judge: "No", media_mention: "Done" },
  { id: "sp-4", partner: "AWS Indonesia", type: "Sponsor", tier: "Tech Cloud Partner", pic: "Sarah / PM", status: "Prospect", next_action: "Cold email AWS tech outreach representative", deadline: "27 Mei 2026" }
];

export default function SponsorsPage() {
  const [localSponsors, setLocalSponsors] = useState<Sponsor[]>([]);
  const [activeTab, setActiveTab] = useState<"tracker" | "benefits">("tracker");
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Sponsor>>({});

  const sponsorStatuses = ["Prospect", "Contacted", "Meeting Scheduled", "In Discussion", "In Negotiation", "Waiting Admin", "Confirmed", "Rejected", "Completed"];

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase.from("catalyst_sponsors").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) setLocalSponsors(data as Sponsor[]);
        else setLocalSponsors(initialSponsors);
      } catch { setLocalSponsors(initialSponsors); }
    }
    fetch();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed": case "Completed": return "bg-emerald-50 text-emerald-700 border-emerald-150 font-bold";
      case "In Negotiation": case "In Discussion": return "bg-blue-50 text-blue-700 border-blue-150";
      case "Waiting Admin": return "bg-purple-50 text-purple-750 border-purple-150";
      case "Rejected": return "bg-rose-50 text-rose-700 border-rose-150";
      case "Prospect": return "bg-zinc-50 text-zinc-400 border-zinc-200";
      default: return "bg-amber-50 text-amber-700 border-amber-150";
    }
  };

  const handleEditClick = (sp: Sponsor) => { setEditForm(sp); setIsEditing(true); };

  const handleSave = async () => {
    if (!editForm.partner || !editForm.id) return;
    const updated = localSponsors.map(s => s.id === editForm.id ? (editForm as Sponsor) : s);
    setLocalSponsors(updated);
    setSelectedSponsor(editForm as Sponsor);
    setIsEditing(false);
    try { await supabase.from("catalyst_sponsors").upsert(editForm); } catch (e) { console.error(e); }
  };

  const handleCreateNew = () => {
    const n: Sponsor = { id: crypto.randomUUID(), partner: "New Partner", type: "Sponsor", tier: "Silver Partner", pic: "Indra / Partner", status: "Prospect", next_action: "Initial outreach", deadline: "10 Juni 2026", notes: "Tambahkan informasi partner baru." };
    setLocalSponsors([n, ...localSponsors]);
    setSelectedSponsor(n);
    handleEditClick(n);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Sponsors & Partners</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola negosiasi dengan partner sponsor, pihak universitas, serta penyerahan hak benefit sponsor.</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
          <Plus weight="bold" /> Add Partner
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-zinc-100 p-1 rounded-xl flex gap-1 border border-zinc-200 self-start">
          <button onClick={() => setActiveTab("tracker")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === "tracker" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}>
            <Handshake weight="bold" /> Partners Outreach
          </button>
          <button onClick={() => setActiveTab("benefits")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === "benefits" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}>
            <Sparkle weight="bold" /> Benefit Deliveries
          </button>
        </div>
        <div className="text-xs text-zinc-450 font-semibold flex items-center gap-2">
          <Info className="text-indigo-500" />
          <span>Sponsor funding TBD masih dalam tahap penawaran.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden">
          {activeTab === "tracker" && (
            <div>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">🤝 Status Negosiasi & Tindak Lanjut Partner</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Nama Partner</th>
                      <th className="py-2.5">Tipe</th>
                      <th className="py-2.5">Tier</th>
                      <th className="py-2.5">PIC</th>
                      <th className="py-2.5">Tenggat</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                    {localSponsors.map((sp) => (
                      <tr key={sp.id} onClick={() => { setSelectedSponsor(sp); setIsEditing(false); }} className={`hover:bg-zinc-50/50 transition cursor-pointer ${selectedSponsor?.id === sp.id ? "bg-zinc-50 font-bold" : ""}`}>
                        <td className="py-3.5 text-zinc-900 font-bold">{sp.partner}</td>
                        <td className="py-3.5 text-zinc-600">{sp.type}</td>
                        <td className="py-3.5 text-indigo-750 font-semibold">{sp.tier}</td>
                        <td className="py-3.5 text-zinc-650 font-bold">{sp.pic}</td>
                        <td className="py-3.5 font-mono font-semibold text-zinc-500">{sp.deadline}</td>
                        <td className="py-3.5 text-right">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded-lg tracking-wider ${getStatusStyle(sp.status)}`}>{sp.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "benefits" && (
            <div>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">🛡️ Ketersediaan Hak Benefit & Logo Sponsor</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Nama Partner</th>
                      <th className="py-2.5 text-center">Logo</th>
                      <th className="py-2.5 text-center">Booth</th>
                      <th className="py-2.5 text-center">Speaker</th>
                      <th className="py-2.5 text-center">Judge</th>
                      <th className="py-2.5 text-center">Media</th>
                      <th className="py-2.5 text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                    {localSponsors.filter(s => s.logo).map((sp) => (
                      <tr key={sp.id} onClick={() => { setSelectedSponsor(sp); setIsEditing(false); }} className={`hover:bg-zinc-50/50 transition cursor-pointer ${selectedSponsor?.id === sp.id ? "bg-zinc-50" : ""}`}>
                        <td className="py-4 text-zinc-900 font-bold">{sp.partner}</td>
                        <td className="py-4 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sp.logo === "Received" ? "bg-emerald-50 text-emerald-700 border-emerald-150" : "bg-amber-50 text-amber-700 border-amber-150"}`}>{sp.logo}</span></td>
                        <td className="py-4 text-center font-semibold">{sp.booth || "-"}</td>
                        <td className="py-4 text-center font-semibold">{sp.speaker || "-"}</td>
                        <td className="py-4 text-center font-semibold">{sp.judge || "-"}</td>
                        <td className="py-4 text-center font-semibold">{sp.media_mention || "-"}</td>
                        <td className="py-4 text-right font-semibold">{sp.report || "-"}</td>
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
            {selectedSponsor === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <Handshake size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih partner pada tabel untuk melihat dan mengedit detail negosiasi.</p>
              </div>
            ) : isEditing ? (
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5"><PencilSimple size={16} /> Edit Partner</h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Partner</label><Input value={editForm.partner || ""} onChange={(e) => setEditForm({ ...editForm, partner: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Tipe</label><Input value={editForm.type || ""} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Tier</label><Input value={editForm.tier || ""} onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">PIC</label><Input value={editForm.pic || ""} onChange={(e) => setEditForm({ ...editForm, pic: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Deadline</label><Input value={editForm.deadline || ""} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Status</label>
                    <select value={editForm.status || "Prospect"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-800 focus:outline-none">
                      {sponsorStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Next Action</label><textarea value={editForm.next_action || ""} onChange={(e) => setEditForm({ ...editForm, next_action: e.target.value })} rows={2} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none" /></div>
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
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{selectedSponsor.tier}</span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-tight">{selectedSponsor.partner}</h3>
                  </div>
                  <button onClick={() => handleEditClick(selectedSponsor)} className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"><PencilSimple size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-100 pb-3">
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Tipe Kolaborasi</p><p className="text-zinc-800 font-semibold mt-0.5">{selectedSponsor.type}</p></div>
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">PIC Internal</p><p className="text-zinc-800 font-bold mt-0.5 flex items-center gap-1"><User size={13} className="text-zinc-400" />{selectedSponsor.pic}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-100 pb-3">
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Status</p><span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded tracking-wider ${getStatusStyle(selectedSponsor.status)}`}>{selectedSponsor.status}</span></div>
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Deadline</p><p className="text-zinc-800 font-mono font-semibold mt-0.5">{selectedSponsor.deadline}</p></div>
                </div>
                <div className="text-xs space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase">Next Action</p><p className="text-zinc-600 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-150 leading-relaxed font-medium">🎯 {selectedSponsor.next_action}</p></div>
                <button onClick={() => handleEditClick(selectedSponsor)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition cursor-pointer">Edit Partner Info</button>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-indigo-500" /><span>Gunakan panel ini untuk melacak negosiasi partner.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
