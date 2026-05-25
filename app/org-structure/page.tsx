"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  TreeStructure, 
  Users, 
  EnvelopeSimple, 
  Phone, 
  Plus, 
  Trash, 
  PencilSimple, 
  FloppyDisk, 
  X, 
  Database, 
  ClipboardText, 
  WarningCircle, 
  Sparkle, 
  Info,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  User
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type OrgMember = {
  id: string;
  name: string;
  role: string;
  division: string;
  avatar_color: string;
  email?: string;
  phone?: string;
};

type Task = {
  id: string;
  name: string;
  pic: string;
  status: string;
  deadline: string;
  priority: string;
  workstream: string;
};

const initialMembers: OrgMember[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Muftia", role: "Advisor", division: "Advisor", avatar_color: "bg-zinc-800", email: "email@mapid.co.id", phone: "0811-0000-0000" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Bagus", role: "Event Director", division: "Event Director", avatar_color: "bg-zinc-900", email: "email@mapid.co.id", phone: "0811-1111-1111" },
  { id: "33333333-3333-3333-3333-333333333333", name: "Hadi", role: "Project Lead", division: "Steering Committee", avatar_color: "bg-rose-500", email: "sarah.lead@mapid.co.id", phone: "0811-2222-2222" },
  { id: "44444444-4444-4444-4444-444444444444", name: "Lagi Hiring", role: "Program Manager", division: "Program Manager", avatar_color: "bg-teal-600", email: "dina.pm@mapid.co.id", phone: "0812-3333-3333" },
  { id: "55555555-5555-5555-5555-555555555555", name: "Fariz", role: "Academic & Competition", division: "Academic & Competition", avatar_color: "bg-indigo-600", email: "ali.academy@mapid.co.id", phone: "0812-4444-4444" },
  { id: "66666666-6666-6666-6666-666666666666", name: "Data Team", role: "Data Team", division: "Data & Spatial Tech", avatar_color: "bg-blue-600", email: "data.engineer@mapid.co.id", phone: "0816-5555-5555" },
  { id: "77777777-7777-7777-7777-777777777777", name: "Tech Team", role: "Tech Team", division: "Data & Spatial Tech", avatar_color: "bg-blue-500", email: "tech.platform@mapid.co.id", phone: "0816-6666-6666" },
  { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", name: "Freelance MAPID Community", role: "Main Event Operational", division: "Main Event Operational", avatar_color: "bg-orange-600", email: "heri.ops@mapid.co.id", phone: "0819-9999-9999" },
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", name: "Aulia Freelance Community", role: "Sponsorship & Outreach", division: "Sponsorship & Outreach", avatar_color: "bg-purple-600", email: "indra.partner@mapid.co.id", phone: "0815-1010-1010" },
  { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", name: "Dwi", role: "Marketing & Design", division: "Marketing & Design", avatar_color: "bg-amber-500", email: "rian.design@mapid.co.id", phone: "0813-1212-1212" },
  { id: "dddddddd-dddd-dddd-dddd-dddddddddddd", name: "Wina", role: "Marketing & Design", division: "Marketing & Design", avatar_color: "bg-amber-400", email: "lia.designer@mapid.co.id", phone: "0813-1313-1313" },
  { id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", name: "Ica", role: "Marketing & Design", division: "Marketing & Design", avatar_color: "bg-amber-600", email: "email@mapid.co.id", phone: "0813-1414-1414" }
];

const divisions = [
  "All",
  "Event Director",
  "Advisor",
  "Steering Committee",
  "Program Manager",
  "Academic & Competition",
  "Data & Spatial Tech",
  "Main Event Operational",
  "Sponsorship & Outreach",
  "Marketing & Design"
];

const colors = [
  "bg-rose-500",
  "bg-indigo-600",
  "bg-amber-500",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-blue-600",
  "bg-zinc-800",
  "bg-orange-600",
  "bg-teal-600"
];

export default function OrgStructurePage() {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeDivision, setActiveDivision] = useState<string>("All");
  const [dbStatus, setDbStatus] = useState<"connected" | "fallback">("fallback");
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<OrgMember>>({});
  const [showCopied, setShowCopied] = useState(false);

  // DDL String for quick copy feature
  const sqlSnippet = `-- Jalankan SQL ini di Editor Supabase Anda:
CREATE TABLE catalyst_org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    division VARCHAR(100) NOT NULL,
    avatar_color VARCHAR(50) DEFAULT 'bg-indigo-600',
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_org_members" ON catalyst_org_members FOR ALL USING (true) WITH CHECK (true);

INSERT INTO catalyst_org_members (name, role, division, avatar_color, email, phone) VALUES
('Muftia', 'Advisor', 'Advisor', 'bg-zinc-800', 'email@mapid.co.id', '0811-0000-0000'),
('Bagus', 'Event Director', 'Event Director', 'bg-zinc-900', 'email@mapid.co.id', '0811-1111-1111'),
('Hadi', 'Project Lead', 'Steering Committee', 'bg-rose-500', 'sarah.lead@mapid.co.id', '0811-2222-2222'),
('Lagi Hiring', 'Program Manager', 'Program Manager', 'bg-teal-600', 'dina.pm@mapid.co.id', '0812-3333-3333'),
('Fariz', 'Academic & Competition', 'Academic & Competition', 'bg-indigo-600', 'ali.academy@mapid.co.id', '0812-4444-4444'),
('Data Team', 'Data Team', 'Data & Spatial Tech', 'bg-blue-600', 'data.engineer@mapid.co.id', '0816-5555-5555'),
('Tech Team', 'Tech Team', 'Data & Spatial Tech', 'bg-blue-500', 'tech.platform@mapid.co.id', '0816-6666-6666'),
('Freelance MAPID Community', 'Main Event Operational', 'Main Event Operational', 'bg-orange-600', 'heri.ops@mapid.co.id', '0819-9999-9999'),
('Aulia Freelance Community', 'Sponsorship & Outreach', 'Sponsorship & Outreach', 'bg-purple-600', 'indra.partner@mapid.co.id', '0815-1010-1010'),
('Dwi', 'Marketing & Design', 'Marketing & Design', 'bg-amber-500', 'rian.design@mapid.co.id', '0813-1212-1212'),
('Wina', 'Marketing & Design', 'Marketing & Design', 'bg-amber-400', 'lia.designer@mapid.co.id', '0813-1313-1313'),
('Ica', 'Marketing & Design', 'Marketing & Design', 'bg-amber-600', 'email@mapid.co.id', '0813-1414-1414');`;

  useEffect(() => {
    // 1. Fetch live tasks for mapping task count dynamically
    async function loadTasks() {
      try {
        const { data } = await supabase
          .from("catalyst_tasks")
          .select("*");
        if (data) setTasks(data as Task[]);
      } catch (e) {
        console.error("Failed loading tasks for mapping:", e);
      }
    }

    // 2. Fetch live org members from Supabase, fallback to initialMembers on error
    async function loadMembers() {
      try {
        const { data, error } = await supabase
          .from("catalyst_org_members")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          setMembers(initialMembers);
          setDbStatus("fallback");
        } else if (!data || data.length === 0) {
          setMembers(initialMembers);
          setDbStatus("connected");
        } else {
          setMembers(data as OrgMember[]);
          setDbStatus("connected");
        }
      } catch (e) {
        setMembers(initialMembers);
        setDbStatus("fallback");
      }
    }

    loadTasks();
    loadMembers();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Filter members based on active division tab
  const filteredMembers = useMemo(() => {
    if (activeDivision === "All") return members;
    return members.filter(m => m.division === activeDivision);
  }, [members, activeDivision]);

  // Compute live task counts for each member (matching PIC name with task PIC column)
  const getMemberTasks = (memberName: string) => {
    return tasks.filter(task => {
      const picLower = (task.pic || "").toLowerCase();
      const nameLower = memberName.toLowerCase();
      return picLower.includes(nameLower) || nameLower.includes(picLower);
    });
  };

  const handleEditClick = (m: OrgMember) => {
    setEditForm(m);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.id) return;

    // Optimistic Update
    const updated = members.map(m => m.id === editForm.id ? (editForm as OrgMember) : m);
    setMembers(updated);
    setSelectedMember(editForm as OrgMember);
    setIsEditing(false);

    // Save to Supabase (only if connected, otherwise keep in sandbox)
    if (dbStatus === "connected") {
      try {
        await supabase.from("catalyst_org_members").upsert(editForm);
      } catch (e) {
        console.error("Error writing org member to Supabase:", e);
      }
    }
  };

  const handleCreateNew = () => {
    const newMember: OrgMember = {
      id: crypto.randomUUID(),
      name: "Nama Lengkap",
      role: "Peran / Job Title",
      division: activeDivision === "All" ? "Marketing & Design" : activeDivision,
      avatar_color: colors[Math.floor(Math.random() * colors.length)],
      email: "email@mapid.co.id",
      phone: "0812-xxxx-xxxx"
    };

    setMembers([...members, newMember]);
    setSelectedMember(newMember);
    handleEditClick(newMember);
  };

  const handleDelete = async (id: string) => {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    setSelectedMember(null);
    setIsEditing(false);

    if (dbStatus === "connected") {
      try {
        await supabase.from("catalyst_org_members").delete().eq("id", id);
      } catch (e) {
        console.error("Error deleting from Supabase:", e);
      }
    }
  };

  // Helper to dynamically get names of members belonging to a division
  const getDivisionMembersText = (divName: string, fallback: string) => {
    const matched = members.filter(m => m.division === divName);
    if (matched.length === 0) return fallback;
    return matched.map(m => m.name).join(" & ");
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[10px] font-bold text-zinc-500 shadow-sm uppercase tracking-wider">
            <TreeStructure className="text-zinc-800" /> Organizational Chart
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Struktur Organisasi</h1>
          <p className="mt-1 text-zinc-500 text-sm">Tinjau susunan tim MAPID Catalyst, penanggung jawab divisi, dan distribusi beban tugas harian.</p>
        </div>

        <div className="flex items-center gap-2">
          {dbStatus === "connected" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-250 text-emerald-800">
              <ShieldCheck size={14} weight="fill" className="text-emerald-600 animate-pulse" /> Supabase Terhubung
            </span>
          ) : (
            <button 
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-50 border border-amber-250 text-amber-800 hover:bg-amber-100 transition cursor-pointer"
              title="Klik untuk menyalin script SQL DDL Supabase"
            >
              <Database size={14} className="text-amber-600 animate-pulse" /> Sandbox Fallback • {showCopied ? "SQL Copied!" : "Salin SQL"}
            </button>
          )}

          <Button 
            onClick={handleCreateNew}
            className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus weight="bold" /> Add Member
          </Button>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE STRUCTURAL ORGANIGRAM MAP */}
      <Card className="bg-zinc-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-zinc-800 rounded-full blur-[120px] pointer-events-none opacity-40"></div>
        <div className="absolute -left-24 -top-24 w-80 h-80 bg-zinc-700/20 rounded-full blur-[120px] pointer-events-none opacity-20"></div>

        <div className="relative z-10 text-center space-y-8">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase">MAPID Catalyst 2026 Structure</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Navigasi diagram pohon. Klik divisi untuk langsung memfilter anggota di bawah.</p>
          </div>          {/* Org Tree Flow diagram */}
          <div className="flex flex-col items-center gap-4 w-full max-w-6xl mx-auto">
            {/* Level 1: Event Director */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => setActiveDivision("Event Director")}
                className={`px-10 py-4 min-w-[240px] rounded-2xl border transition-all duration-300 shadow-lg text-center cursor-pointer ${
                  activeDivision === "Event Director" 
                    ? "bg-zinc-100 border-zinc-350 text-zinc-950 scale-105 ring-4 ring-zinc-550/20" 
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200"
                }`}
              >
                <p className="text-xs uppercase tracking-wider font-bold text-zinc-400">Event Director</p>
                <p className="text-base font-extrabold mt-1">{getDivisionMembersText("Event Director", "Muftia")}</p>
              </button>
              <div className="h-8 w-[2px] bg-zinc-800 mt-1"></div>
            </div>

            {/* Level 2: Project Lead & Advisor */}
            <div className="flex flex-col items-center relative w-full">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
                
                {/* Advisor (Bagus) */}
                <div className="flex flex-col md:flex-row items-center md:absolute md:right-[50%] md:mr-[150px]">
                  <button 
                    onClick={() => setActiveDivision("Advisor")}
                    className={`px-6 py-3 min-w-[180px] rounded-xl border-2 border-dashed transition-all duration-300 shadow-lg text-center cursor-pointer ${
                      activeDivision === "Advisor" 
                        ? "bg-zinc-800 border-zinc-400 text-white scale-105 ring-4 ring-zinc-500/20" 
                        : "bg-zinc-950 border-zinc-700 hover:border-zinc-500 text-zinc-300"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Advisor</p>
                    <p className="text-sm font-extrabold mt-1">{getDivisionMembersText("Advisor", "Bagus")}</p>
                  </button>
                  {/* Dashed line connecting Advisor to Project Lead (Hidden on mobile) */}
                  <div className="hidden md:block w-8 lg:w-16 h-[2px] border-t-2 border-dashed border-zinc-700"></div>
                </div>

                {/* Project Lead */}
                <button 
                  onClick={() => setActiveDivision("Steering Committee")}
                  className={`px-10 py-4 min-w-[280px] rounded-2xl border transition-all duration-300 shadow-lg text-center cursor-pointer z-10 ${
                    activeDivision === "Steering Committee" 
                      ? "bg-rose-500 border-rose-400 scale-105 ring-4 ring-rose-500/20 text-white font-bold" 
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wider font-bold text-rose-300">Project Lead (Steering Committee)</p>
                  <p className="text-base font-extrabold mt-1">{getDivisionMembersText("Steering Committee", "Hadi")}</p>
                </button>
                
              </div>
              <div className="h-8 w-[2px] bg-zinc-800 mt-1"></div>
            </div>

            {/* Level 3: Program Manager */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => setActiveDivision("Program Manager")}
                className={`px-10 py-4 min-w-[240px] rounded-2xl border transition-all duration-300 shadow-lg text-center cursor-pointer ${
                  activeDivision === "Program Manager" 
                    ? "bg-teal-600 border-teal-500 scale-105 ring-4 ring-teal-650/20 text-white font-bold" 
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200"
                }`}
              >
                <p className="text-xs uppercase tracking-wider font-bold text-teal-300">Program Manager</p>
                <p className="text-base font-extrabold mt-1">{getDivisionMembersText("Program Manager", "Dina")}</p>
              </button>
              <div className="h-8 w-[2px] bg-zinc-800 mt-1"></div>
            </div>

            {/* Bridge horizontal connector */}
            <div className="w-full hidden md:flex justify-between items-center px-[10%] h-[2px] bg-zinc-800 mb-4 mt-2">
              <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
            </div>

            {/* Level 4: Core Divisions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
              {[
                { name: "Academic & Competition", lead: "Fariz", style: "indigo", bg: "bg-indigo-600", border: "border-indigo-800" },
                { name: "Data & Spatial Tech", lead: "Gita & Rudi", style: "blue", bg: "bg-blue-600", border: "border-blue-800" },
                { name: "Main Event Operational", lead: "Freelance", style: "orange", bg: "bg-orange-600", border: "border-orange-850" },
                { name: "Sponsorship & Outreach", lead: "Aulia", style: "purple", bg: "bg-purple-650", border: "border-purple-800" },
                { name: "Marketing & Design", lead: "Dwi & Wina", style: "amber", bg: "bg-amber-600", border: "border-amber-800" }
              ].map(div => {
                const isSelected = activeDivision === div.name;
                const dynamicLead = getDivisionMembersText(div.name, div.lead);
                return (
                  <button 
                    key={div.name}
                    onClick={() => setActiveDivision(div.name)}
                    className={`px-4 py-5 rounded-xl border text-center transition-all duration-300 cursor-pointer flex flex-col justify-center items-center gap-3 ${
                      isSelected
                        ? `${div.bg} ${div.border} scale-105 ring-4 ring-zinc-100/10 text-white font-bold`
                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 leading-snug">{div.name}</p>
                    <p className="text-sm font-bold text-zinc-100">{dynamicLead}</p>
                  </button>
                );
              })}
            </div>
            
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveDivision("All")}
                className="h-7 text-[10px] font-bold border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg px-3 cursor-pointer"
              >
                Reset Filter Divisi
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 2: DIVISIONS TAB SELECTOR */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Filter Berdasarkan Divisi</label>
          <div className="flex flex-wrap gap-1.5">
            {divisions.map(div => (
              <button
                key={div}
                onClick={() => { setActiveDivision(div); setSelectedMember(null); setIsEditing(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                  activeDivision === div
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                    : "bg-zinc-50 text-zinc-650 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {div}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: CORE GRID & DETAILED DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Area: Grid of Member Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.length === 0 ? (
              <Card className="col-span-2 p-12 text-center text-zinc-400 font-medium bg-white border-zinc-200 rounded-3xl">
                <Users className="mx-auto text-zinc-200 mb-2" size={32} />
                Tidak ada anggota divisi yang terdaftar.
              </Card>
            ) : (
              filteredMembers.map((member) => {
                const memberTasks = getMemberTasks(member.name);
                const doneTasks = memberTasks.filter(t => t.status === "Done");
                const progressPercentage = memberTasks.length > 0 
                  ? Math.round((doneTasks.length / memberTasks.length) * 100) 
                  : 0;

                return (
                  <Card 
                    key={member.id}
                    onClick={() => { setSelectedMember(member); setIsEditing(false); }}
                    className={`p-5 shadow-sm rounded-2xl bg-white border cursor-pointer transition-all duration-300 hover:shadow-md hover:border-zinc-300 flex flex-col justify-between ${
                      selectedMember?.id === member.id ? "ring-2 ring-indigo-500/30 border-indigo-250 bg-zinc-50/20" : "border-zinc-200"
                    }`}
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full ${member.avatar_color} text-white flex items-center justify-center font-extrabold text-sm shadow-inner`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-950 text-sm leading-tight">{member.name}</h3>
                          <p className="text-[11px] text-zinc-500 font-semibold leading-none mt-0.5">{member.role}</p>
                        </div>
                      </div>

                      {/* Info & Division Badges */}
                      <div className="space-y-2 mb-4 text-xs font-semibold text-zinc-600">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-400 uppercase">Divisi</span>
                          <span className="px-2 py-0.5 rounded-lg border bg-zinc-50 border-zinc-200 text-zinc-700 text-[10px]">
                            {member.division}
                          </span>
                        </div>
                        {member.email && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-400 uppercase">Email</span>
                            <span className="text-zinc-750 truncate max-w-[150px] font-mono text-[10px]">{member.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Workstream Task Sync details */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-zinc-500 flex items-center gap-1">
                        <ClipboardText size={14} className="text-indigo-500" /> Active Tasks
                      </span>
                      {memberTasks.length > 0 ? (
                        <span className="font-bold text-zinc-800">
                          {doneTasks.length}/{memberTasks.length} ({progressPercentage}%)
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-medium">0 Tasks</span>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Member Action Drawer & Task Linking */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[450px] flex flex-col justify-between">
            {selectedMember === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <Users size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih anggota divisi pada sebelah kiri untuk melihat rincian kontak dan peta tugas aktifnya.</p>
              </div>
            ) : isEditing ? (
              /* Editable Profile details */
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                    <PencilSimple size={16} /> Edit Member Profile
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Lengkap</label>
                    <Input 
                      type="text" 
                      value={editForm.name || ""} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Jabatan / Role</label>
                    <Input 
                      type="text" 
                      value={editForm.role || ""} 
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Pilih Divisi</label>
                    <select 
                      value={editForm.division || "Marketing & Design"}
                      onChange={(e) => setEditForm({ ...editForm, division: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-850 focus:outline-none"
                    >
                      {divisions.filter(d => d !== "All").map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Email</label>
                      <Input 
                        type="email" 
                        value={editForm.email || ""} 
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">WhatsApp / No. HP</label>
                      <Input 
                        type="text" 
                        value={editForm.phone || ""} 
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Warna Profil Avatar</label>
                    <div className="flex gap-2.5 pt-1">
                      {colors.map(col => (
                        <button
                          key={col}
                          onClick={() => setEditForm({ ...editForm, avatar_color: col })}
                          className={`w-6 h-6 rounded-full border transition-all ${col} ${
                            editForm.avatar_color === col 
                              ? "ring-2 ring-zinc-950 scale-110" 
                              : "border-transparent opacity-80"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button 
                    onClick={handleSave}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FloppyDisk size={14} /> Save Profile
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
              /* Detail Profile Panel */
              <div className="space-y-5">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${selectedMember.avatar_color} text-white flex items-center justify-center font-extrabold text-base shadow-inner`}>
                      {selectedMember.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {selectedMember.division}
                      </span>
                      <h3 className="font-bold text-zinc-950 text-base mt-1.5 leading-tight">{selectedMember.name}</h3>
                      <p className="text-[10px] text-zinc-400 font-bold leading-none mt-0.5">{selectedMember.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleEditClick(selectedMember)}
                      className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                      title="Edit profil anggota"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedMember.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-600 hover:text-rose-800 transition cursor-pointer"
                      title="Hapus anggota"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>

                {/* Contact Card details */}
                <div className="space-y-2.5 text-xs font-semibold text-zinc-700 bg-zinc-50/50 p-4 border border-zinc-250 rounded-2xl">
                  {selectedMember.email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeSimple size={14} className="text-zinc-400" />
                      <span className="text-zinc-500 font-normal">Email:</span>
                      <a href={`mailto:${selectedMember.email}`} className="text-zinc-900 font-mono hover:underline">{selectedMember.email}</a>
                    </div>
                  )}
                  {selectedMember.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-zinc-400" />
                      <span className="text-zinc-500 font-normal">WhatsApp:</span>
                      <a href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, "")}`} target="_blank" className="text-zinc-900 font-mono hover:underline">{selectedMember.phone}</a>
                    </div>
                  )}
                </div>

                {/* dynamic mapping of live tasks assigned to PIC */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Peta Tugas Divisi PIC ({getMemberTasks(selectedMember.name).length})</p>
                    <span className="text-[10px] text-zinc-400 font-bold">Live Sync</span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {getMemberTasks(selectedMember.name).length === 0 ? (
                      <div className="p-4 bg-zinc-50/50 border border-zinc-150 rounded-2xl text-center text-[10px] text-zinc-400 font-semibold flex items-center justify-center gap-1.5">
                        <Info size={14} />
                        PIC ini tidak memiliki tugas aktif saat ini.
                      </div>
                    ) : (
                      getMemberTasks(selectedMember.name).map(task => (
                        <div 
                          key={task.id} 
                          className="p-2.5 bg-zinc-50/50 border border-zinc-150 rounded-xl flex items-center justify-between text-[10px] shadow-sm hover:shadow-xs transition duration-200"
                        >
                          <div className="truncate pr-2">
                            <p className="font-bold text-zinc-900 truncate" title={task.name}>{task.name}</p>
                            <p className="text-[9px] text-zinc-400 font-semibold">{task.workstream} • {task.deadline}</p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded font-extrabold uppercase text-[8px] tracking-wider shrink-0 border ${
                            task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            task.status === 'Blocked' ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' :
                            task.status === 'In Progress' ? 'bg-blue-50 text-blue-750 border-blue-100' :
                            'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-indigo-500" />
              <span>Gunakan detail panel untuk mengedit profil & melihat live sync tugas.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
