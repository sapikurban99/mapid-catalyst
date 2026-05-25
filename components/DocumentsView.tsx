"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Files, 
  Link as LinkIcon, 
  Info,
  MagnifyingGlass,
  ArrowSquareOut,
  Plus,
  PencilSimple,
  FloppyDisk,
  X,
  Trash
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Document = {
  id: string;
  name: string;
  link_url: string;
  notes?: string;
  owner?: string;
  due_date?: string;
  status?: string;
  last_updated?: string;
};

export default function DocumentsView({ initialDocuments }: { initialDocuments: any[] }) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [localDocs, setLocalDocs] = useState<Document[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Document>>({});

  // Parse items from Supabase, default to empty array as requested
  const mappedDocs = useMemo(() => {
    if (initialDocuments && initialDocuments.length > 0) {
      return initialDocuments.map((item: any) => ({
        id: item.id,
        name: item.name || "",
        link_url: item.link_url || "",
        notes: item.notes || item.description || "",
        owner: item.owner || "User",
        due_date: item.due_date || "",
        status: item.status || "Published",
        last_updated: item.last_updated || ""
      }));
    }
    return [];
  }, [initialDocuments]);

  useEffect(() => {
    setLocalDocs(mappedDocs);
  }, [mappedDocs]);

  const filteredDocs = useMemo(() => {
    return localDocs.filter(doc => {
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [localDocs, searchQuery]);

  const handleEditClick = (doc: Document) => {
    setEditForm(doc);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.id) return;
    
    const docToSave = {
      ...editForm,
      link_url: editForm.link_url || "",
      notes: editForm.notes || "",
      owner: editForm.owner || "User",
      status: editForm.status || "Published",
      due_date: editForm.due_date || "",
      last_updated: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    } as Document;

    // Update local state
    const updated = localDocs.some(d => d.id === docToSave.id)
      ? localDocs.map(d => d.id === docToSave.id ? docToSave : d)
      : [docToSave, ...localDocs];

    setLocalDocs(updated);
    setSelectedDoc(docToSave);
    setIsEditing(false);

    // Save to Supabase
    try {
      await supabase
        .from("catalyst_documents")
        .upsert({
          id: docToSave.id,
          name: docToSave.name,
          link_url: docToSave.link_url,
          notes: docToSave.notes,
          owner: docToSave.owner,
          status: docToSave.status,
          due_date: docToSave.due_date,
          last_updated: docToSave.last_updated
        });
    } catch (e) {
      console.error("Error saving document to Supabase:", e);
    }
  };

  const handleCreateNew = () => {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      name: "Dokumen Baru",
      link_url: "https://",
      notes: "Keterangan atau tautan dokumen kerja...",
      owner: "User",
      status: "Published",
      due_date: "",
      last_updated: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    };
    
    setEditForm(newDoc);
    setIsEditing(true);
    setSelectedDoc(newDoc);
  };

  const handleDelete = async (id: string) => {
    const updated = localDocs.filter(d => d.id !== id);
    setLocalDocs(updated);
    setSelectedDoc(null);
    setIsEditing(false);

    try {
      await supabase
        .from("catalyst_documents")
        .delete()
        .eq("id", id);
    } catch (e) {
      console.error("Error deleting document from Supabase:", e);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Document Hub</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola naskah, panduan, tautan proposal, dan berkas kompetisi secara manual.</p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus weight="bold" /> Add Document
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input 
            type="text" 
            placeholder="Cari dokumen hub..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedDoc(null); }}
            className="w-full bg-zinc-50 border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-zinc-950 focus:bg-white" 
          />
        </div>
        <div className="text-xs font-semibold text-zinc-400 shrink-0">
          Total: <span className="text-zinc-950 font-bold">{filteredDocs.length}</span> dokumen
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Document List Grid */}
        <div className="lg:col-span-2 space-y-3">
          {filteredDocs.length === 0 ? (
            <Card className="bg-white border border-zinc-200 rounded-3xl p-16 text-center text-zinc-400 font-medium shadow-sm">
              <Files className="mx-auto text-zinc-200 mb-3" size={48} />
              <p className="text-sm font-semibold">Belum ada dokumen terdaftar.</p>
              <p className="text-xs text-zinc-400 mt-1">Klik "Add Document" di kanan atas untuk membuat entri naskah manual pertama Anda.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => { setSelectedDoc(doc); setIsEditing(false); }}
                  className={`bg-white border rounded-2xl p-5 transition-all duration-200 shadow-sm cursor-pointer hover:shadow-md hover:border-zinc-300 relative overflow-hidden flex flex-col justify-between h-40 ${
                    selectedDoc?.id === doc.id ? "border-zinc-950 ring-2 ring-zinc-950/5" : "border-zinc-200"
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 shrink-0">
                        <Files size={16} />
                      </div>
                      <h3 className="font-bold text-zinc-900 text-sm leading-snug truncate w-full">
                        {doc.name}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {doc.notes || "Tidak ada keterangan."}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">
                      {doc.last_updated ? `Update: ${doc.last_updated}` : "Manual Entry"}
                    </span>
                    {doc.link_url && doc.link_url !== "https://" && (
                      <span className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1">
                        Open Link <ArrowSquareOut size={10} />
                      </span>
                    )}
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
                <p className="text-xs font-semibold">Pilih salah satu dokumen di sebelah kiri untuk melihat rincian naskah dan link URL kerja.</p>
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
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Judul / Nama Dokumen</label>
                    <Input 
                      type="text" 
                      value={editForm.name || ""} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Tautan Dokumen / Link URL</label>
                    <Input 
                      type="text" 
                      value={editForm.link_url || ""} 
                      onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })}
                      placeholder="https://docs.google.com/..."
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-950" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Keterangan / Catatan Ringkas</label>
                    <textarea 
                      value={editForm.notes || ""} 
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={5}
                      placeholder="Masukkan detail, tautan kerja, atau instruksi manual di sini..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button 
                    onClick={handleSave}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FloppyDisk size={14} /> Save Document
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
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                      <Files size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-950 text-base leading-tight">{selectedDoc.name}</h3>
                      <p className="text-[9px] text-zinc-400 font-bold leading-none mt-1">Update: {selectedDoc.last_updated || "Manual"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditClick(selectedDoc)}
                      className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                      title="Edit naskah"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedDoc.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-600 hover:text-rose-800 transition cursor-pointer"
                      title="Hapus naskah"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Keterangan / Catatan Naskah</p>
                  <p className="text-zinc-650 bg-zinc-50/50 p-3.5 rounded-2xl border border-zinc-150 leading-relaxed font-semibold">
                    📝 {selectedDoc.notes || "Tidak ada rincian catatan."}
                  </p>
                </div>

                {/* Document Link */}
                {selectedDoc.link_url && selectedDoc.link_url !== "https://" && (
                  <div className="pt-2">
                    <a 
                      href={selectedDoc.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition"
                    >
                      Buka Dokumen / Link Kerja <ArrowSquareOut size={14} />
                    </a>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-indigo-500" />
              <span>Gunakan Document Hub untuk mengelola tautan & catatan internal.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
