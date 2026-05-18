"use client";

import { useState, useEffect } from "react";
import { 
  Database, 
  User, 
  MapPin, 
  DownloadSimple, 
  FileText, 
  WarningCircle, 
  CheckCircle, 
  CircleNotch,
  ArrowRight,
  Info,
  ShieldCheck,
  Plus,
  PencilSimple,
  FloppyDisk,
  X
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Dataset = {
  id: string;
  name: string;
  owner: string;
  status: "Not Ready" | "Need Cleaning" | "Need Survey" | "Sample Ready" | "Ready for Participant" | "API Ready";
  coverage: string;
  sample_status: "Ready" | "Not Ready" | "TBD";
  dictionary_status: "Ready" | "Draft" | "Not Ready" | "TBD";
  api_status: "Ready" | "TBD" | "Not Ready";
  records_count: string;
  format: string;
  required_fields: string[];
  sensitivity: "Public" | "Confidential" | "Internal Only";
  sample_url?: string;
  dictionary_url?: string;
  notes: string;
};

const initialDatasets: Dataset[] = [
  { 
    id: "ds-1", 
    name: "Property Go", 
    owner: "Data Team", 
    status: "Sample Ready", 
    coverage: "Pulau Jawa", 
    sample_status: "Ready", 
    dictionary_status: "Draft", 
    api_status: "TBD", 
    records_count: "15,430 Records", 
    format: "GeoJSON / CSV", 
    required_fields: ["price_idr", "building_area_sqm", "land_area_sqm", "latitude", "longitude", "property_type", "province"], 
    sensitivity: "Public", 
    sample_url: "https://mapid.co.id/datasets/samples/property_go.geojson", 
    dictionary_url: "https://mapid.co.id/datasets/dictionary/property_go.pdf", 
    notes: "Memerlukan standardisasi kolom penulisan alamat dan tipe properti sebelum dipublish penuh." 
  },
  { 
    id: "ds-2", 
    name: "Menu Go", 
    owner: "Data Team", 
    status: "Need Cleaning", 
    coverage: "Kota Bandung & Surabaya", 
    sample_status: "TBD", 
    dictionary_status: "TBD", 
    api_status: "TBD", 
    records_count: "8,920 Records", 
    format: "JSON / API", 
    required_fields: ["menu_name", "price_idr", "restaurant_name", "cuisine_type", "latitude", "longitude", "rating"], 
    sensitivity: "Internal Only", 
    notes: "Diambil dari campaign 15 Mei. Terdapat ketidakcocokan tipe koordinat spasial di wilayah Surabaya." 
  },
  { 
    id: "ds-3", 
    name: "UMKM Go", 
    owner: "Community / Data", 
    status: "Need Survey", 
    coverage: "Nasional (Terkonsentrasi di Kota Besar)", 
    sample_status: "Not Ready", 
    dictionary_status: "Not Ready", 
    api_status: "TBD", 
    records_count: "Belum Diketahui", 
    format: "GeoJSON", 
    required_fields: ["umkm_name", "category", "employee_count", "monthly_revenue_range", "latitude", "longitude"], 
    sensitivity: "Public", 
    notes: "Membutuhkan dukungan kegiatan survei lapangan dari 50 tim terkurasi untuk memperkaya data atribut." 
  },
  { 
    id: "ds-4", 
    name: "Activity Data", 
    owner: "Data Team", 
    status: "Sample Ready", 
    coverage: "Jabodetabek", 
    sample_status: "Ready", 
    dictionary_status: "Draft", 
    api_status: "TBD", 
    records_count: "24,500 Records", 
    format: "CSV", 
    required_fields: ["activity_type", "timestamp", "duration_minutes", "commuter_flow", "latitude", "longitude"], 
    sensitivity: "Confidential", 
    sample_url: "https://mapid.co.id/datasets/samples/activity_data.csv", 
    dictionary_url: "https://mapid.co.id/datasets/dictionary/activity_data.pdf", 
    notes: "Perlu pembersihan struktur agar format kolom spasial seragam." 
  }
];

export default function DatasetTrackerPage() {
  const [localDatasets, setLocalDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Dataset>>({});

  const datasetStatuses = ["Not Ready", "Need Cleaning", "Need Survey", "Sample Ready", "Ready for Participant", "API Ready"];
  const sensitivities = ["Public", "Confidential", "Internal Only"];

  // Fetch from Supabase on mount
  useEffect(() => {
    async function fetchDatasets() {
      try {
        const { data, error } = await supabase
          .from("catalyst_datasets")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setLocalDatasets(data as Dataset[]);
        } else {
          setLocalDatasets(initialDatasets);
        }
      } catch (e) {
        console.error("Supabase fetch failed, fallback to local:", e);
        setLocalDatasets(initialDatasets);
      }
    }
    fetchDatasets();
  }, []);

  const getStatusStyle = (status: Dataset["status"]) => {
    switch (status) {
      case "API Ready": return "bg-emerald-150 text-emerald-850 border-emerald-300 font-bold";
      case "Ready for Participant": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Sample Ready": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Need Cleaning": return "bg-amber-100 text-amber-800 border-amber-250 ring-2 ring-amber-50";
      case "Need Survey": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  const handleEditClick = (ds: Dataset) => {
    setEditForm({
      ...ds,
      required_fields: ds.required_fields || []
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.id) return;

    // Update local state (optimistic)
    const updated = localDatasets.map(d => d.id === editForm.id ? (editForm as Dataset) : d);
    setLocalDatasets(updated);
    setSelectedDataset(editForm as Dataset);
    setIsEditing(false);

    // Save to Supabase in the background
    try {
      await supabase
        .from("catalyst_datasets")
        .upsert(editForm);
    } catch (e) {
      console.error("Error writing dataset to Supabase:", e);
    }
  };

  const handleCreateNew = () => {
    const newDs: Dataset = {
      id: crypto.randomUUID(),
      name: "New Spatial Dataset",
      owner: "Data Team",
      status: "Not Ready",
      coverage: "Kota Bandung",
      sample_status: "TBD",
      dictionary_status: "TBD",
      api_status: "TBD",
      records_count: "0 Records",
      format: "GeoJSON",
      required_fields: ["latitude", "longitude"],
      sensitivity: "Public",
      notes: "Tuliskan deskripsi data baru dan instruksi integrasi spasial di sini."
    };

    setLocalDatasets([newDs, ...localDatasets]);
    setSelectedDataset(newDs);
    handleEditClick(newDs);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Dataset Readiness</h1>
          <p className="mt-1 text-zinc-500 text-sm">Monitor status standardisasi database, data dictionary, integrasi API, serta bottleneck data geospasial.</p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Plus weight="bold" /> Add Dataset
        </Button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Dataset Table Matrix */}
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Nama Dataset</th>
                  <th className="py-2.5">PIC</th>
                  <th className="py-2.5">Coverage</th>
                  <th className="py-2.5 text-center">Sample</th>
                  <th className="py-2.5 text-center">Dictionary</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {localDatasets.map((ds) => (
                  <tr 
                    key={ds.id}
                    onClick={() => { setSelectedDataset(ds); setIsEditing(false); }}
                    className={`hover:bg-zinc-50/70 transition cursor-pointer ${
                      selectedDataset?.id === ds.id ? "bg-zinc-50 font-bold" : ""
                    }`}
                  >
                    <td className="py-4 pr-4 text-zinc-900 font-semibold">{ds.name}</td>
                    <td className="py-4 text-zinc-650 font-medium">{ds.owner}</td>
                    <td className="py-4 text-zinc-500 font-medium">{ds.coverage}</td>
                    <td className="py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        ds.sample_status === "Ready" ? "bg-emerald-50 text-emerald-705 border-emerald-150" : "bg-zinc-100 text-zinc-550 border-zinc-200"
                      }`}>
                        {ds.sample_status}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        ds.dictionary_status === "Ready" ? "bg-emerald-50 text-emerald-705 border-emerald-150" : 
                        ds.dictionary_status === "Draft" ? "bg-amber-50 text-amber-705 border-amber-150" :
                        "bg-zinc-100 text-zinc-550 border-zinc-200"
                      }`}>
                        {ds.dictionary_status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 border rounded-lg tracking-wider ${getStatusStyle(ds.status)}`}>
                        {ds.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Detailed Dataset Drawer Card */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {selectedDataset === null ? (
              <div className="my-auto text-center text-zinc-400 space-y-2 py-12">
                <Database size={48} className="mx-auto text-zinc-200" />
                <p className="text-xs font-semibold">Pilih salah satu dataset di sebelah kiri untuk melihat rincian jumlah record, format spasial, kolom wajib, dan link unduhan.</p>
              </div>
            ) : isEditing ? (
              /* Editable Dataset Form */
              <div className="space-y-4 text-xs font-medium text-zinc-800">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                    <PencilSimple size={16} /> Edit Dataset Data
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Dataset</label>
                    <Input 
                      type="text" 
                      value={editForm.name || ""} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-955" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">PIC (Owner)</label>
                      <Input 
                        type="text" 
                        value={editForm.owner || ""} 
                        onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-955" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Status</label>
                      <select 
                        value={editForm.status || "Not Ready"}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-800 focus:outline-none"
                      >
                        {datasetStatuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Cakupan (Coverage)</label>
                      <Input 
                        type="text" 
                        value={editForm.coverage || ""} 
                        onChange={(e) => setEditForm({ ...editForm, coverage: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-955" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Jumlah Record</label>
                      <Input 
                        type="text" 
                        value={editForm.records_count || ""} 
                        onChange={(e) => setEditForm({ ...editForm, records_count: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-955" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Format Spasial</label>
                      <Input 
                        type="text" 
                        value={editForm.format || ""} 
                        onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-955" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Sensitivitas</label>
                      <select 
                        value={editForm.sensitivity || "Public"}
                        onChange={(e) => setEditForm({ ...editForm, sensitivity: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-800 focus:outline-none"
                      >
                        {sensitivities.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Sample Status</label>
                      <select 
                        value={editForm.sample_status || "TBD"}
                        onChange={(e) => setEditForm({ ...editForm, sample_status: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-800 focus:outline-none"
                      >
                        <option value="Ready">Ready</option>
                        <option value="Not Ready">Not Ready</option>
                        <option value="TBD">TBD</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Dictionary Status</label>
                      <select 
                        value={editForm.dictionary_status || "TBD"}
                        onChange={(e) => setEditForm({ ...editForm, dictionary_status: e.target.value as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-xs font-semibold text-zinc-800 focus:outline-none"
                      >
                        <option value="Ready">Ready</option>
                        <option value="Draft">Draft</option>
                        <option value="Not Ready">Not Ready</option>
                        <option value="TBD">TBD</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Atribut Spasial Wajib (Koma Separator)</label>
                    <Input 
                      type="text" 
                      value={(editForm.required_fields || []).join(", ")} 
                      onChange={(e) => setEditForm({ ...editForm, required_fields: e.target.value.split(",").map(f => f.trim()).filter(Boolean) })}
                      className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-955" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Link Sample URL</label>
                      <Input 
                        type="text" 
                        value={editForm.sample_url || ""} 
                        onChange={(e) => setEditForm({ ...editForm, sample_url: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-955" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Link Dictionary URL</label>
                      <Input 
                        type="text" 
                        value={editForm.dictionary_url || ""} 
                        onChange={(e) => setEditForm({ ...editForm, dictionary_url: e.target.value })}
                        className="bg-zinc-50 border-zinc-200 rounded-xl py-2 px-3 text-xs focus:ring-zinc-955" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Kesiapan</label>
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
                    <FloppyDisk size={14} /> Save Dataset
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
                      {selectedDataset.owner}
                    </span>
                    <h3 className="font-bold text-zinc-955 text-base mt-2 leading-tight">{selectedDataset.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleEditClick(selectedDataset)}
                    className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                  >
                    <PencilSimple size={14} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-zinc-100">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Jumlah Record</p>
                      <p className="text-zinc-800 font-semibold font-mono mt-0.5">
                        {selectedDataset.records_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Format Spasial</p>
                      <p className="text-zinc-800 font-mono font-semibold mt-0.5">
                        {selectedDataset.format}
                      </p>
                    </div>
                  </div>

                  <div className="pb-2 border-b border-zinc-100 space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Wilayah Cakupan (Coverage)</p>
                    <p className="text-zinc-700 font-medium flex items-center gap-1">
                      <MapPin size={13} className="text-zinc-400" /> {selectedDataset.coverage}
                    </p>
                  </div>

                  {/* Required fields */}
                  <div className="pb-2 border-b border-zinc-100 space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Atribut Spasial Wajib</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(selectedDataset.required_fields || []).map((f, i) => (
                        <span key={i} className="text-[9px] font-mono font-bold bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded border border-zinc-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes & Sensitivity */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Catatan Kesiapan</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        selectedDataset.sensitivity === "Public" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        selectedDataset.sensitivity === "Confidential" ? "bg-rose-50 text-rose-700 border-rose-100" :
                        "bg-zinc-100 text-zinc-500 border-zinc-200"
                      }`}>
                        {selectedDataset.sensitivity}
                      </span>
                    </div>
                    <p className="text-zinc-650 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-150 leading-relaxed font-semibold">
                      💡 {selectedDataset.notes}
                    </p>
                  </div>

                  {/* Download Sample & Dictionary Button */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {selectedDataset.sample_url ? (
                      <a 
                        href={selectedDataset.sample_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 text-[10px] font-bold py-2 px-2.5 rounded-xl border border-zinc-200 transition cursor-pointer"
                      >
                        <DownloadSimple size={12} /> Unduh Sampel
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 bg-zinc-50 text-zinc-405 text-[10px] font-bold py-2 px-2.5 rounded-xl border border-zinc-100 cursor-not-allowed">
                        Sampel Belum Ada
                      </span>
                    )}

                    {selectedDataset.dictionary_url ? (
                      <a 
                        href={selectedDataset.dictionary_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold py-2 px-2.5 rounded-xl shadow transition cursor-pointer"
                      >
                        <FileText size={12} /> Kamus Data
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 bg-zinc-50 text-zinc-405 text-[10px] font-bold py-2 px-2.5 rounded-xl border border-zinc-100 cursor-not-allowed">
                        Kamus Data Belum Ada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-500" />
              <span>Gunakan tracker ini untuk memantau kemajuan data tim.</span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
