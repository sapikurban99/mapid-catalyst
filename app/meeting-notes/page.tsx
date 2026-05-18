"use client";

import { useState, useEffect } from "react";
import { 
  ClipboardText, 
  User, 
  CalendarBlank, 
  CheckCircle, 
  WarningCircle, 
  Info,
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

type MeetingNote = {
  id: string;
  title: string;
  date: string;
  attendees: string;
  key_decision: string;
  action_item: string;
  owner: string;
  link_url?: string;
};

const initialNotes: MeetingNote[] = [
  { id: "m-1", title: "Weekly Sync 1: Kickoff Persiapan", date: "11 Mei 2026", attendees: "Hadi, Fariz, Rudi, Dwi, Aulia", key_decision: "Tanggal pendaftaran disepakati 8 – 26 Juni 2026. Skema timeline 17 tahap dilock.", action_item: "Draft guidance dokumen FAQ", owner: "Fariz / Academy", link_url: "https://docs.google.com/document/d/sync-1" },
  { id: "m-2", title: "Weekly Sync 2: Standardisasi Dataset", date: "18 Mei 2026", attendees: "Hadi, Fariz, Data Team, Tech Team", key_decision: "Dataset UMKM Go butuh survei dari 50 tim terkurasi. Budget survei dialokasikan per-area.", action_item: "Clean data Menu Go campaign 15 Mei", owner: "Data Team", link_url: "https://docs.google.com/document/d/sync-2" },
  { id: "m-3", title: "Partnership & Sponsor Alignment", date: "15 Mei 2026", attendees: "Aulia, Hadi, Directors", key_decision: "Mengunci lokasi di BINUS University dengan skema barter sponsorship sewa venue.", action_item: "Finalisasi proposal sponsor deck & tiering", owner: "Aulia / Partner", link_url: "https://docs.google.com/document/d/sync-3" }
];

export default function MeetingNotesPage() {
  const [localNotes, setLocalNotes] = useState<MeetingNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MeetingNote>>({});

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase.from("catalyst_meeting_notes").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) setLocalNotes(data as MeetingNote[]);
        else setLocalNotes(initialNotes);
      } catch { setLocalNotes(initialNotes); }
    }
    fetch();
  }, []);

  const handleEditClick = (n: MeetingNote) => { setEditForm(n); setIsEditing(true); };

  const handleSave = async () => {
    if (!editForm.title || !editForm.id) return;
    const updated = localNotes.map(n => n.id === editForm.id ? (editForm as MeetingNote) : n);
    setLocalNotes(updated);
    setSelectedNote(editForm as MeetingNote);
    setIsEditing(false);
    try { await supabase.from("catalyst_meeting_notes").upsert(editForm); } catch (e) { console.error(e); }
  };

  const handleCreateNew = () => {
    const n: MeetingNote = { id: crypto.randomUUID(), title: "New Meeting Sync", date: "Hari Ini", attendees: "Semua Tim", key_decision: "Tuliskan keputusan rapat.", action_item: "Tuliskan tugas yang harus dilakukan.", owner: "PIC Tugas" };
    setLocalNotes([n, ...localNotes]);
    setSelectedNote(n);
    handleEditClick(n);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Meeting Notes</h1>
          <p className="mt-1 text-zinc-500 text-sm">Akses catatan rapat mingguan (*weekly sync*), keputusan penting yang telah dikunci, serta daftar tindak lanjut (*action items*).</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
          <Plus weight="bold" /> Add Meeting Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 px-2">
            <ClipboardText size={20} /> Log Keputusan & Tindak Lanjut
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {localNotes.map((note) => (
              <Card 
                key={note.id} 
                onClick={() => { setSelectedNote(note); setIsEditing(false); }}
                className={`bg-white border rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 cursor-pointer transition ${selectedNote?.id === note.id ? "border-indigo-300 ring-2 ring-indigo-50" : "border-zinc-200 hover:border-zinc-300"}`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-zinc-950 text-[13px] leading-snug">{note.title}</h3>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold whitespace-nowrap bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-lg">{note.date}</span>
                  </div>
                  <p className="text-[10px] text-zinc-405 font-semibold">👥 {note.attendees}</p>
                </div>
                <div className="space-y-2 border-t border-zinc-100 pt-3 text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase">Tindak Lanjut (Action Item)</p>
                    <p className="text-zinc-700 font-semibold truncate">🏃‍♂️ {note.action_item} ({note.owner})</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between sticky top-8">
            {selectedNote === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <ClipboardText size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih salah satu notulensi rapat untuk melihat keputusan penting (Key Decision).</p>
              </div>
            ) : isEditing ? (
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5"><PencilSimple size={16} /> Edit Meeting Note</h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Judul Rapat</label><Input value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Tanggal</label><Input value={editForm.date || ""} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Attendees</label><Input value={editForm.attendees || ""} onChange={(e) => setEditForm({ ...editForm, attendees: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Key Decision</label><textarea value={editForm.key_decision || ""} onChange={(e) => setEditForm({ ...editForm, key_decision: e.target.value })} rows={3} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-indigo-500 uppercase">Action Item</label><textarea value={editForm.action_item || ""} onChange={(e) => setEditForm({ ...editForm, action_item: e.target.value })} rows={2} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">PIC Action Item</label><Input value={editForm.owner || ""} onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Link Notulensi Docs</label><Input value={editForm.link_url || ""} onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })} className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs" /></div>
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
                    <span className="text-[10px] font-mono text-zinc-400 font-bold bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-lg">{selectedNote.date}</span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-snug">{selectedNote.title}</h3>
                  </div>
                  <button onClick={() => handleEditClick(selectedNote)} className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"><PencilSimple size={14} /></button>
                </div>
                <div className="text-xs space-y-1 pb-3 border-b border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase">Attendees</p><p className="text-zinc-800 font-semibold mt-0.5 flex items-center gap-1"><User size={13} className="text-zinc-400" />{selectedNote.attendees}</p></div>
                <div className="text-xs space-y-1 pb-3 border-b border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase">Key Decision</p><p className="text-zinc-800 font-bold leading-relaxed bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-150">🎯 {selectedNote.key_decision}</p></div>
                <div className="text-xs space-y-1"><p className="text-[10px] font-bold text-indigo-500 uppercase">Action Item</p><p className="text-zinc-700 font-semibold leading-relaxed">🏃‍♂️ {selectedNote.action_item} (PIC: <span className="font-bold text-zinc-900">{selectedNote.owner}</span>)</p></div>
                <div className="pt-2 flex flex-col gap-2">
                  {selectedNote.link_url && (
                    <a href={selectedNote.link_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-bold py-2.5 px-3 rounded-xl border border-zinc-200 transition cursor-pointer"><LinkIcon size={14} /> Buka Source Docs</a>
                  )}
                  <button onClick={() => handleEditClick(selectedNote)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition cursor-pointer">Edit Notes</button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
