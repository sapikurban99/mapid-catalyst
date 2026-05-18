"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Users, 
  User, 
  MapPin, 
  Database, 
  Phone, 
  GraduationCap, 
  ClipboardText,
  Funnel,
  Sparkle,
  CheckCircle,
  WarningCircle,
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

type Team = {
  id: string;
  name: string;
  institution: string;
  leader: string;
  contact: string;
  members: number;
  proposal_status: "Submitted" | "Accepted" | "Rejected";
  curated_status: "Top 50" | "Not Selected";
  dataset_focus: "Menu Go" | "UMKM Go" | "Property Go" | "Multiple";
  survey_area: string;
  prd_status: "Submitted" | "Need Revision" | "Pending" | "Approved";
  webgis_status: "Not Started" | "In Progress" | "Submitted";
  finalist_status: "Top 10" | "Not Finalist" | "Pending";
  stage: "Registered" | "Proposal Submitted" | "Under Review" | "Top 50 Curated" | "Survey Phase" | "Development Phase" | "Final Submission" | "Top 10 Finalist" | "Winner";
  notes?: string;
};

const initialTeams: Team[] = [
  { id: "t-1", name: "Team Geoverse", institution: "ITB", leader: "Ahmad", contact: "0812-3456-7890", members: 3, proposal_status: "Accepted", curated_status: "Top 50", dataset_focus: "Menu Go", survey_area: "Bandung Wetan", prd_status: "Approved", webgis_status: "In Progress", finalist_status: "Pending", stage: "Development Phase", notes: "Focusing on local culinary spatial indexing using AI." },
  { id: "t-2", name: "SpatiaTech", institution: "UGM", leader: "Budi", contact: "0813-9876-5432", members: 3, proposal_status: "Accepted", curated_status: "Top 50", dataset_focus: "Property Go", survey_area: "Sleman, Yogyakarta", prd_status: "Need Revision", webgis_status: "In Progress", finalist_status: "Pending", stage: "Survey Phase", notes: "Validating property price attributes in Sleman suburbs." },
  { id: "t-3", name: "EcoMap", institution: "UI", leader: "Clara", contact: "0811-5555-4444", members: 3, proposal_status: "Accepted", curated_status: "Top 50", dataset_focus: "UMKM Go", survey_area: "Depok Margonda", prd_status: "Approved", webgis_status: "Submitted", finalist_status: "Pending", stage: "Final Submission", notes: "Mapped 45 small business entities using GEO MAPID." },
  { id: "t-4", name: "AI Mapper", institution: "BINUS University", leader: "Dedi", contact: "0812-2222-3333", members: 3, proposal_status: "Accepted", curated_status: "Top 50", dataset_focus: "Multiple", survey_area: "Jakarta Barat", prd_status: "Approved", webgis_status: "In Progress", finalist_status: "Pending", stage: "Development Phase", notes: "Combining property and menu datasets for commercial zoning analysis." },
  { id: "t-5", name: "UrbanPlanner", institution: "ITS", leader: "Elga", contact: "0819-8888-9999", members: 2, proposal_status: "Accepted", curated_status: "Top 50", dataset_focus: "Property Go", survey_area: "Surabaya Gubeng", prd_status: "Pending", webgis_status: "Not Started", finalist_status: "Pending", stage: "Top 50 Curated" }
];

export default function ParticipantsCRMPage() {
  const [localTeams, setLocalTeams] = useState<Team[]>([]);
  const [activeStage, setActiveStage] = useState<string>("All");
  const [activeDataset, setActiveDataset] = useState<string>("All");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Team>>({});

  const stages = ["All", "Registered", "Proposal Submitted", "Under Review", "Top 50 Curated", "Survey Phase", "Development Phase", "Final Submission", "Top 10 Finalist", "Winner"];
  const datasets = ["All", "Menu Go", "UMKM Go", "Property Go", "Multiple"];

  // Fetch teams from Supabase on mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data, error } = await supabase
          .from("catalyst_participants")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setLocalTeams(data as Team[]);
        } else {
          setLocalTeams(initialTeams);
        }
      } catch (e) {
        console.error("Supabase fetch failed, fallback to local:", e);
        setLocalTeams(initialTeams);
      }
    }
    fetchTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    return localTeams.filter(team => {
      const matchStage = activeStage === "All" || team.stage === activeStage;
      const matchData = activeDataset === "All" || team.dataset_focus === activeDataset;
      return matchStage && matchData;
    });
  }, [localTeams, activeStage, activeDataset]);

  const getStageStyle = (stage: Team["stage"]) => {
    switch (stage) {
      case "Winner": return "bg-amber-100 text-amber-800 border-amber-200 font-bold";
      case "Top 10 Finalist": return "bg-indigo-100 text-indigo-850 border-indigo-200 font-bold";
      case "Final Submission": return "bg-emerald-100 text-emerald-800 border-emerald-250";
      case "Development Phase": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Survey Phase": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const handleEditClick = (team: Team) => {
    setEditForm(team);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.id) return;

    // Update local state (optimistic)
    const updated = localTeams.map(t => t.id === editForm.id ? (editForm as Team) : t);
    setLocalTeams(updated);
    setSelectedTeam(editForm as Team);
    setIsEditing(false);

    // Save to Supabase in the background
    try {
      await supabase
        .from("catalyst_participants")
        .upsert(editForm);
    } catch (e) {
      console.error("Error writing team to Supabase:", e);
    }
  };

  const handleCreateNew = () => {
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: "New WebGIS Team",
      institution: "Binus University",
      leader: "Dian / Leader",
      contact: "0812-4444-5555",
      members: 3,
      proposal_status: "Submitted",
      curated_status: "Top 50",
      dataset_focus: "Menu Go",
      survey_area: "Jakarta Barat",
      prd_status: "Pending",
      webgis_status: "Not Started",
      finalist_status: "Pending",
      stage: activeStage === "All" ? "Registered" : activeStage as any,
      notes: "Tuliskan ide aplikasi WebGIS dan rincian project di sini."
    };

    setLocalTeams([newTeam, ...localTeams]);
    setSelectedTeam(newTeam);
    handleEditClick(newTeam);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Team & Participant CRM</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola pendaftaran tim, hasil seleksi proposal, area survei lapangan, dan status penyerahan PRD/WebGIS.</p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Plus weight="bold" /> Add Team
        </Button>
      </div>

      {/* Pipeline Stage Tabs */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Funnel /> Pipeline Stage
          </label>
          <div className="flex flex-wrap gap-1.5">
            {stages.map(st => (
              <button
                key={st}
                onClick={() => { setActiveStage(st); setSelectedTeam(null); setIsEditing(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                  activeStage === st
                    ? "bg-zinc-950 text-white border-zinc-950"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-3 flex items-center gap-3">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dataset Focus:</span>
          <div className="flex gap-1.5">
            {datasets.map(dt => (
              <button
                key={dt}
                onClick={() => { setActiveDataset(dt); setSelectedTeam(null); setIsEditing(false); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  activeDataset === dt
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {dt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main CRM Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: CRM Team List */}
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Nama Tim</th>
                  <th className="py-2.5">Kampus / Komunitas</th>
                  <th className="py-2.5">Dataset Focus</th>
                  <th className="py-2.5">Survey Area</th>
                  <th className="py-2.5 text-right">Pipeline Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400 font-medium">
                      <Users className="mx-auto text-zinc-350 mb-2" size={32} />
                      Tidak ada tim yang ditemukan untuk kriteria ini.
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => (
                    <tr 
                      key={team.id}
                      onClick={() => { setSelectedTeam(team); setIsEditing(false); }}
                      className={`hover:bg-zinc-50/70 transition cursor-pointer ${
                        selectedTeam?.id === team.id ? "bg-zinc-50 font-bold" : ""
                      }`}
                    >
                      <td className="py-3.5 pr-4 text-zinc-900 font-semibold">{team.name}</td>
                      <td className="py-3.5 text-zinc-650 font-bold">{team.institution}</td>
                      <td className="py-3.5">
                        <span className="text-[10px] font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-lg">
                          {team.dataset_focus}
                        </span>
                      </td>
                      <td className="py-3.5 text-zinc-500 font-mono font-medium">{team.survey_area}</td>
                      <td className="py-3.5 text-right">
                        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 border rounded-lg tracking-wider ${getStageStyle(team.stage)}`}>
                          {team.stage}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Team Detail Drawer Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {selectedTeam === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <Users size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih tim pada tabel di sebelah kiri untuk melihat detail proposal, PIC ketua, kontak, dan target WebGIS.</p>
              </div>
            ) : isEditing ? (
              /* Editable Team Form */
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                    <PencilSimple size={16} /> Edit Team Data
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Tim</label>
                    <Input 
                      type="text" 
                      value={editForm.name || ""} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Kampus / Instansi</label>
                      <Input 
                        type="text" 
                        value={editForm.institution || ""} 
                        onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Tahapan (Stage)</label>
                      <select 
                        value={editForm.stage || "Registered"}
                        onChange={(e) => setEditForm({ ...editForm, stage: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-800 focus:outline-none"
                      >
                        {stages.filter(s => s !== "All").map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Ketua</label>
                      <Input 
                        type="text" 
                        value={editForm.leader || ""} 
                        onChange={(e) => setEditForm({ ...editForm, leader: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Kontak</label>
                      <Input 
                        type="text" 
                        value={editForm.contact || ""} 
                        onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Dataset Fokus</label>
                      <select 
                        value={editForm.dataset_focus || "Menu Go"}
                        onChange={(e) => setEditForm({ ...editForm, dataset_focus: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-800 focus:outline-none"
                      >
                        {datasets.filter(d => d !== "All").map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Wilayah Survei</label>
                      <Input 
                        type="text" 
                        value={editForm.survey_area || ""} 
                        onChange={(e) => setEditForm({ ...editForm, survey_area: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Status PRD</label>
                      <select 
                        value={editForm.prd_status || "Pending"}
                        onChange={(e) => setEditForm({ ...editForm, prd_status: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-850 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Need Revision">Need Revision</option>
                        <option value="Approved">Approved</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Status WebGIS</label>
                      <select 
                        value={editForm.webgis_status || "Not Started"}
                        onChange={(e) => setEditForm({ ...editForm, webgis_status: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-855 focus:outline-none"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Submitted">Submitted</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Proposal & Ide</label>
                    <textarea 
                      value={editForm.notes || ""} 
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button 
                    onClick={handleSave}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FloppyDisk size={14} /> Save Team
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-semibold py-2 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* Detail panel view */
              <div className="space-y-4">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {selectedTeam.institution}
                    </span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-tight">{selectedTeam.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleEditClick(selectedTeam)}
                    className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                  >
                    <PencilSimple size={14} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-zinc-100">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Ketua Tim</p>
                      <p className="text-zinc-800 font-semibold flex items-center gap-1.5 mt-0.5">
                        <User size={13} className="text-zinc-400" /> {selectedTeam.leader} ({selectedTeam.members} Anggota)
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Kontak</p>
                      <p className="text-zinc-800 font-mono font-semibold flex items-center gap-1.5 mt-0.5">
                        <Phone size={13} className="text-zinc-400" /> {selectedTeam.contact}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-zinc-100">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Fokus Dataset</p>
                      <p className="text-zinc-850 font-bold flex items-center gap-1.5 mt-0.5">
                        <Database size={13} className="text-zinc-400" /> {selectedTeam.dataset_focus}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Wilayah Survei</p>
                      <p className="text-zinc-800 font-semibold flex items-center gap-1.5 mt-0.5">
                        <MapPin size={13} className="text-zinc-400" /> {selectedTeam.survey_area}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-zinc-100">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Status PRD</p>
                      <div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border inline-block mt-1 ${
                          selectedTeam.prd_status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          selectedTeam.prd_status === "Need Revision" ? "bg-rose-50 text-rose-700 border-rose-100" :
                          "bg-zinc-50 text-zinc-500 border-zinc-200"
                        }`}>
                          {selectedTeam.prd_status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Status WebGIS</p>
                      <div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border inline-block mt-1 ${
                          selectedTeam.webgis_status === "Submitted" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          selectedTeam.webgis_status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          "bg-zinc-50 text-zinc-500 border-zinc-200"
                        }`}>
                          {selectedTeam.webgis_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedTeam.notes && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Deskripsi Proposal Ide</p>
                      <p className="text-zinc-650 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-150 leading-relaxed font-semibold">
                        💡 {selectedTeam.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => handleEditClick(selectedTeam)}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition text-center cursor-pointer"
                  >
                    Edit Team Info
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Sparkle size={14} className="text-indigo-500 animate-pulse" />
              <span>Gunakan CRM ini untuk menyeleksi 50 tim terkurasi.</span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
