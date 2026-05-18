"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  User, 
  CheckCircle, 
  WarningCircle, 
  Info,
  Clock,
  Plus,
  PencilSimple,
  FloppyDisk,
  X
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type MentoringSession = {
  id: string;
  session: string;
  date: string;
  audience: string;
  mentor: string;
  topic: string;
  attendance: string;
  output: string;
};

const initialSessions: MentoringSession[] = [
  { id: "m-1", session: "Mentoring 1", date: "8 Juli 2026", audience: "Top 50 Tim", mentor: "Ashraf (MAPID PM)", topic: "PRD & Product Planning", attendance: "48 / 50 Tim", output: "Draft dokumen PRD tim" },
  { id: "m-2", session: "Mentoring 2", date: "29 Juli 2026", audience: "Top 50 Tim", mentor: "Hassan (MAPID Tech)", topic: "GEO MAPID & MAPID MAPS Basemap Setup", attendance: "TBD", output: "Database & WebGIS setup" },
  { id: "m-3", session: "Mentoring 3", date: "19 Agustus 2026", audience: "Top 50 Tim", mentor: "Hassan / Ashraf", topic: "Product Review WebGIS (Visual, Spatial, AI)", attendance: "TBD", output: "Revisi produk WebGIS" },
  { id: "m-4", session: "Mentoring 4", date: "14 – 15 September 2026", audience: "Top 10 Finalis", mentor: "Hadi (Project Lead)", topic: "Public Speaking & storytelling demo WebGIS", attendance: "- (TBD)", output: "Final pitch deck & live demo" }
];

export default function MentoringTrackerPage() {
  const [activeTab, setActiveTab] = useState<"sessions" | "teams">("sessions");
  const [localSessions, setLocalSessions] = useState<MentoringSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<MentoringSession | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MentoringSession>>({});

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase.from("catalyst_mentoring_sessions").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) setLocalSessions(data as MentoringSession[]);
        else setLocalSessions(initialSessions);
      } catch { setLocalSessions(initialSessions); }
    }
    fetch();
  }, []);

  const handleEditClick = (s: MentoringSession) => { setEditForm(s); setIsEditing(true); };

  const handleSave = async () => {
    if (!editForm.session || !editForm.id) return;
    const updated = localSessions.map(s => s.id === editForm.id ? (editForm as MentoringSession) : s);
    setLocalSessions(updated);
    setSelectedSession(editForm as MentoringSession);
    setIsEditing(false);
    try { await supabase.from("catalyst_mentoring_sessions").upsert(editForm); } catch (e) { console.error(e); }
  };

  const handleCreateNew = () => {
    const n: MentoringSession = { id: crypto.randomUUID(), session: "New Session", date: "TBD", audience: "Top 50 Tim", mentor: "MAPID Mentor", topic: "Syllabus Topic", attendance: "0 / 50 Tim", output: "Target Output" };
    setLocalSessions([n, ...localSessions]);
    setSelectedSession(n);
    handleEditClick(n);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Mentoring Tracker</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola jadwal kelas mentoring, ketersediaan mentor MAPID, serta riwayat kehadiran tim peserta.</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
          <Plus weight="bold" /> Add Mentoring
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-zinc-100 p-1 rounded-xl flex gap-1 border border-zinc-200 self-start">
          <button onClick={() => setActiveTab("sessions")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === "sessions" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}>
            <GraduationCap weight="bold" /> Sessions Schedule
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-not-allowed opacity-50">
            <User weight="bold" /> Team Attendance (Locked)
          </button>
        </div>
        <div className="text-xs text-zinc-450 font-semibold flex items-center gap-2">
          <Info className="text-indigo-500" /><span>Output mentoring sangat penting untuk kelayakan final pengerjaan WebGIS.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">📝 Jadwal & Topik Kelas Mentoring Kompetisi</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Sesi</th>
                    <th className="py-2.5 text-center">Tanggal</th>
                    <th className="py-2.5">Topic & Bahasan</th>
                    <th className="py-2.5">Audience</th>
                    <th className="py-2.5">Mentor</th>
                    <th className="py-2.5 text-center">Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                  {localSessions.map((s) => (
                    <tr key={s.id} onClick={() => { setSelectedSession(s); setIsEditing(false); }} className={`hover:bg-zinc-50/70 transition cursor-pointer ${selectedSession?.id === s.id ? "bg-zinc-50 font-bold" : ""}`}>
                      <td className="py-4 text-zinc-900 font-bold whitespace-nowrap">{s.session}</td>
                      <td className="py-4 text-center font-mono font-semibold text-zinc-500 whitespace-nowrap">{s.date}</td>
                      <td className="py-4 max-w-[180px] font-semibold text-zinc-900 leading-snug">{s.topic}</td>
                      <td className="py-4 text-zinc-600">{s.audience}</td>
                      <td className="py-4 text-zinc-650 font-bold whitespace-nowrap">{s.mentor}</td>
                      <td className="py-4 text-center font-semibold text-indigo-600 whitespace-nowrap">{s.attendance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {selectedSession === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <GraduationCap size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih jadwal mentoring untuk memperbarui informasi silabus dan kehadiran.</p>
              </div>
            ) : isEditing ? (
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5"><PencilSimple size={16} /> Edit Mentoring</h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Sesi</label><Input value={editForm.session || ""} onChange={(e) => setEditForm({ ...editForm, session: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Tanggal</label><Input value={editForm.date || ""} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Audience (Target)</label><Input value={editForm.audience || ""} onChange={(e) => setEditForm({ ...editForm, audience: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Mentor Utama</label><Input value={editForm.mentor || ""} onChange={(e) => setEditForm({ ...editForm, mentor: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Topik & Bahasan</label><textarea value={editForm.topic || ""} onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })} rows={2} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Target Output Sesi</label><Input value={editForm.output || ""} onChange={(e) => setEditForm({ ...editForm, output: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs font-semibold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-indigo-500 uppercase">Status Kehadiran Tim</label><Input value={editForm.attendance || ""} onChange={(e) => setEditForm({ ...editForm, attendance: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs font-bold text-indigo-600" /></div>
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
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-lg">{selectedSession.date}</span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-tight">{selectedSession.session}</h3>
                  </div>
                  <button onClick={() => handleEditClick(selectedSession)} className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"><PencilSimple size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-100 pb-3">
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Mentor</p><p className="text-zinc-800 font-bold mt-0.5 flex items-center gap-1"><User size={13} className="text-zinc-400" />{selectedSession.mentor}</p></div>
                  <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Audience</p><p className="text-zinc-800 font-semibold mt-0.5">{selectedSession.audience}</p></div>
                </div>
                <div className="text-xs space-y-1 pb-3 border-b border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase">Silabus (Topic)</p><p className="text-zinc-800 font-bold leading-relaxed">{selectedSession.topic}</p></div>
                <div className="text-xs space-y-1 pb-3 border-b border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase">Target Output Sesi</p><p className="text-zinc-600 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-150 font-medium">🎯 {selectedSession.output}</p></div>
                <div className="text-xs space-y-1"><p className="text-[10px] font-bold text-indigo-500 uppercase">Total Kehadiran Tim</p><p className="text-indigo-700 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 font-bold text-center text-sm">{selectedSession.attendance}</p></div>
                <button onClick={() => handleEditClick(selectedSession)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition cursor-pointer">Update Mentoring Data</button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
