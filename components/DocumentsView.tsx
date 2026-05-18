"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Files, 
  User, 
  CalendarBlank, 
  Link as LinkIcon, 
  Note, 
  Info,
  CheckCircle,
  Clock,
  WarningCircle,
  MagnifyingGlass,
  ArrowSquareOut,
  Plus,
  PencilSimple,
  FloppyDisk,
  X
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Document = {
  id: string;
  name: string;
  category: "Participant Docs" | "Technical Docs" | "Survey Docs" | "Sponsor Docs" | "Event Docs" | "Internal Docs";
  owner: string;
  status: "Not Started" | "Drafting" | "Need Review" | "Approved" | "Published" | "Needs Update";
  due_date: string;
  link_url: string;
  last_updated: string;
  reviewer?: string;
  notes?: string;
};

const defaultDocs: Document[] = [
  // Participant Docs
  { id: "doc-1", name: "Competition Guidance & Rules", category: "Participant Docs", owner: "Ali / Academy", status: "Published", due_date: "20 Mei 2026", link_url: "https://mapid.co.id/docs/guidelines-2026.pdf", last_updated: "18 Mei 2026", reviewer: "Sarah / PM", notes: "Final version approved by directors." },
  { id: "doc-2", name: "MAPID Catalyst FAQ", category: "Participant Docs", owner: "Ali / Academy", status: "Drafting", due_date: "25 Mei 2026", link_url: "https://docs.google.com/document/d/faq", last_updated: "17 Mei 2026", reviewer: "Sarah / PM", notes: "Drafting AI and survey budget sections." },
  { id: "doc-3", name: "PRD & Product Template Document", category: "Participant Docs", owner: "Ali / Academy", status: "Not Started", due_date: "30 Mei 2026", link_url: "https://docs.google.com/document/d/prd-template", last_updated: "-", reviewer: "Rian / Academy" },
  
  // Technical Docs
  { id: "doc-4", name: "Data Dictionary (UMKM Go & Property Go)", category: "Technical Docs", owner: "Data Team", status: "Need Review", due_date: "29 Mei 2026", link_url: "https://mapid.co.id/docs/data-dictionary.pdf", last_updated: "15 Mei 2026", reviewer: "Ali / Academy", notes: "Reviewing spatial attribute descriptions." },
  { id: "doc-5", name: "GEO MAPID Setup & API Guide", category: "Technical Docs", owner: "Tech Team", status: "Drafting", due_date: "4 Juni 2026", link_url: "https://mapid.co.id/docs/geo-api-guide.pdf", last_updated: "10 Mei 2026", reviewer: "Sarah / PM" },
  
  // Survey Docs
  { id: "doc-6", name: "Survey Activity Guideline", category: "Survey Docs", owner: "Gita / Operations", status: "Drafting", due_date: "31 Mei 2026", link_url: "https://docs.google.com/document/d/survey-guideline", last_updated: "16 Mei 2026", reviewer: "Rian / Academy", notes: "Drafting photo taking requirements." },
  
  // Sponsor Docs
  { id: "doc-7", name: "MAPID Catalyst 2026 Sponsor Proposal", category: "Sponsor Docs", owner: "Indra / Partnership", status: "Need Review", due_date: "25 Mei 2026", link_url: "https://mapid.co.id/docs/sponsor-proposal.pdf", last_updated: "18 Mei 2026", reviewer: "Sarah / PM", notes: "Needs validation on Silver Tier booths." },
  
  // Event Docs
  { id: "doc-8", name: "Main Event TOR & Rundown (BINUS)", category: "Event Docs", owner: "Rudi / Ops", status: "Drafting", due_date: "10 Juni 2026", link_url: "https://docs.google.com/document/d/rundown", last_updated: "12 Mei 2026", reviewer: "Sarah / PM" },
  
  // Internal Docs
  { id: "doc-9", name: "RACI & Workstream Matrix", category: "Internal Docs", owner: "Sarah / PM", status: "Published", due_date: "15 Mei 2026", link_url: "https://docs.google.com/spreadsheets/d/raci", last_updated: "14 Mei 2026", reviewer: "Directors", notes: "Owner assignments locked." }
];

export default function DocumentsView({ initialDocuments }: { initialDocuments: any[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  
  const [localDocs, setLocalDocs] = useState<Document[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Document>>({});

  const categories = ["All", "Participant Docs", "Technical Docs", "Survey Docs", "Sponsor Docs", "Event Docs", "Internal Docs"];
  const statuses = ["All", "Not Started", "Drafting", "Need Review", "Approved", "Published", "Needs Update"];

  // Ingest Supabase initial rows or fallback
  const mappedDocs = useMemo(() => {
    if (initialDocuments && initialDocuments.length > 0) {
      return initialDocuments.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: (item.category || "Participant Docs") as any,
        owner: item.owner || "Data Team",
        status: (item.status || "Published") as any,
        due_date: item.due_date || "TBD",
        link_url: item.link_url || "#",
        last_updated: item.last_updated || "18 Mei 2026",
        reviewer: item.reviewer || "Sarah / PM",
        notes: item.notes || item.description
      }));
    }
    return defaultDocs;
  }, [initialDocuments]);

  useEffect(() => {
    setLocalDocs(mappedDocs);
  }, [mappedDocs]);

  const filteredDocs = useMemo(() => {
    return localDocs.filter(doc => {
      const matchCat = activeCategory === "All" || doc.category === activeCategory;
      const matchStatus = statusFilter === "All" || doc.status === statusFilter;
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.owner.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [localDocs, activeCategory, statusFilter, searchQuery]);

  const getStatusStyle = (status: Document["status"]) => {
    switch (status) {
      case "Published": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Approved": return "bg-emerald-50 text-emerald-700 border-emerald-150";
      case "Need Review": return "bg-purple-100 text-purple-800 border-purple-200 ring-2 ring-purple-50";
      case "Drafting": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Needs Update": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const handleEditClick = (doc: Document) => {
    setEditForm(doc);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.id) return;
    
    // Update local state (optimistic)
    const updated = localDocs.map(d => d.id === editForm.id ? (editForm as Document) : d);
    setLocalDocs(updated);
    setSelectedDoc(editForm as Document);
    setIsEditing(false);

    // Save to Supabase in the background
    try {
      const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      const payload = {
        id: editForm.id,
        name: editForm.name,
        category: editForm.category,
        owner: editForm.owner,
        status: editForm.status,
        due_date: editForm.due_date,
        link_url: editForm.link_url,
        last_updated: dateStr,
        reviewer: editForm.reviewer,
        notes: editForm.notes
      };

      await supabase
        .from("catalyst_documents")
        .upsert(payload);
    } catch (e) {
      console.error("Error saving document:", e);
    }
  };

  const handleCreateNew = () => {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      name: "New Document Guideline",
      category: "Participant Docs",
      owner: "Sarah / PM",
      status: "Drafting",
      due_date: "10 Juni 2026",
      link_url: "https://docs.google.com/document/d/new",
      last_updated: "18 Mei 2026",
      reviewer: "Sarah / PM",
      notes: "Tuliskan rincian koreksi atau deskripsi dokumen baru di sini."
    };
    
    setLocalDocs([newDoc, ...localDocs]);
    setSelectedDoc(newDoc);
    handleEditClick(newDoc);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Document Hub</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola panduan, FAQ, *one pager*, spesifikasi teknis, proposal sponsor, dan *meeting notes*.</p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Plus weight="bold" /> Add Document
        </Button>
      </div>

      {/* Filterable Tab Area */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input 
              type="text" 
              placeholder="Cari dokumen berdasarkan nama atau PIC..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSelectedDoc(null); }}
              className="w-full bg-zinc-50 border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-zinc-950 focus:bg-white" 
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
            <div className="flex gap-1">
              {statuses.map(st => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setSelectedDoc(null); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    statusFilter === st
                      ? "bg-zinc-950 text-white border-zinc-950"
                      : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-150 pt-3">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Kategori Dokumen</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSelectedDoc(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-zinc-950 text-white border-zinc-950"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Layout of Document list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Document List Grid */}
        <div className="lg:col-span-2 space-y-3">
          {filteredDocs.length === 0 ? (
            <Card className="bg-white border border-zinc-200 rounded-3xl p-12 text-center text-zinc-400 font-medium">
              <Files className="mx-auto text-zinc-300 mb-2" size={40} />
              Tidak ada dokumen yang ditemukan.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => { setSelectedDoc(doc); setIsEditing(false); }}
                  className={`bg-white border rounded-2xl p-4 transition-all duration-200 shadow-sm cursor-pointer hover:shadow-md hover:border-zinc-300 relative overflow-hidden flex flex-col justify-between ${
                    selectedDoc?.id === doc.id ? "border-zinc-950 ring-2 ring-zinc-950/5" : "border-zinc-200"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-zinc-50 border border-zinc-150 text-zinc-500 rounded-md">
                      {doc.category.replace(" Docs", "")}
                    </span>
                    <h3 className="font-bold text-zinc-900 text-sm leading-snug pt-1 group-hover:text-indigo-600 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-[10px] text-zinc-405 font-semibold flex items-center gap-1.5 pt-1">
                      <User size={12} /> PIC: {doc.owner}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">Due: {doc.due_date}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded tracking-wider ${getStatusStyle(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Selected Document Detail Drawer Card */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {selectedDoc === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <Files size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih salah satu dokumen di sebelah kiri untuk melihat detail status & catatan review.</p>
              </div>
            ) : isEditing ? (
              /* Editable form */
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                    <PencilSimple size={16} /> Edit Document Data
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Dokumen</label>
                    <Input 
                      type="text" 
                      value={editForm.name || ""} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Kategori</label>
                      <select 
                        value={editForm.category || "Participant Docs"}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-800 focus:outline-none"
                      >
                        {categories.filter(c => c !== "All").map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Status</label>
                      <select 
                        value={editForm.status || "Drafting"}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-800 focus:outline-none"
                      >
                        {statuses.filter(s => s !== "All").map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Pembuat (Owner)</label>
                      <Input 
                        type="text" 
                        value={editForm.owner || ""} 
                        onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Due Date</label>
                      <Input 
                        type="text" 
                        value={editForm.due_date || ""} 
                        onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Reviewer</label>
                      <Input 
                        type="text" 
                        value={editForm.reviewer || ""} 
                        onChange={(e) => setEditForm({ ...editForm, reviewer: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Link URL</label>
                      <Input 
                        type="text" 
                        value={editForm.link_url || ""} 
                        onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Review & Koreksi</label>
                    <textarea 
                      value={editForm.notes || ""} 
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button 
                    onClick={handleSave}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FloppyDisk size={14} /> Save Changes
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
              <div className="space-y-5">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {selectedDoc.category}
                    </span>
                    <h3 className="font-bold text-zinc-950 text-base mt-2 leading-tight">{selectedDoc.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleEditClick(selectedDoc)}
                    className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                  >
                    <PencilSimple size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium border-b border-zinc-150 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Pembuat (Owner)</p>
                    <p className="text-zinc-800 flex items-center gap-1.5">
                      <User size={14} className="text-zinc-400" /> {selectedDoc.owner}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Batas Waktu (Due Date)</p>
                    <p className="text-zinc-800 flex items-center gap-1.5 font-mono">
                      <CalendarBlank size={14} className="text-zinc-400" /> {selectedDoc.due_date}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium border-b border-zinc-150 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Reviewer</p>
                    <p className="text-zinc-800 flex items-center gap-1.5 font-semibold">
                      👤 {selectedDoc.reviewer || "Not Assigned"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Update Terakhir</p>
                    <p className="text-zinc-800 flex items-center gap-1.5 font-mono">
                      {selectedDoc.last_updated}
                    </p>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Status Kelayakan</p>
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider ${getStatusStyle(selectedDoc.status)}`}>
                      {selectedDoc.status}
                    </span>
                  </div>
                </div>

                {/* Notes details */}
                {selectedDoc.notes && (
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Review & Koreksi</p>
                    <p className="text-zinc-600 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-150 leading-relaxed font-medium">
                      📝 {selectedDoc.notes}
                    </p>
                  </div>
                )}

                {/* Document Link */}
                <div className="pt-2 flex gap-2">
                  <a 
                    href={selectedDoc.link_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition"
                  >
                    Buka File / Dokumen Kerja <ArrowSquareOut size={14} />
                  </a>
                  <button 
                    onClick={() => handleEditClick(selectedDoc)}
                    className="px-3.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 hover:text-zinc-950 border border-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <PencilSimple size={14} /> Edit
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-indigo-500" />
              <span>Gunakan Document Hub untuk melacak persetujuan naskah.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
