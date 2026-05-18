"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  User, 
  CheckCircle, 
  WarningCircle, 
  Info,
  Clock,
  Sparkle,
  Gear,
  Plus
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AccessRole = {
  role: string;
  scope: string;
  members: string;
  write_access: boolean;
  notes: string;
};

const initialRoles: AccessRole[] = [
  { role: "Super Admin", scope: "Semua Fitur + Hapus Data", members: "Sarah (PM)", write_access: true, notes: "Full administrative access." },
  { role: "Program Manager", scope: "Semua Fitur (Kecuali Hapus)", members: "Sarah", write_access: true, notes: "Daily operation manager scope." },
  { role: "Data Team", scope: "Dataset Tracker + Survey Module", members: "Hassan, Ali, Gita", write_access: true, notes: "Focused on spatial databases and field surveys." },
  { role: "Design Team", scope: "Visual Asset Tracker Only", members: "Rian, Lia", write_access: true, notes: "Creative brief and Figma updates only." },
  { role: "Partnership Team", scope: "Sponsors & Partners Tracker Only", members: "Indra", write_access: true, notes: "Sponsorship and barter coordination scope." },
  { role: "Judge", scope: "Judging & Scoring Module Only", members: "External Academic Judges", write_access: true, notes: "Strict read-write access to proposal and WebGIS matrix." },
  { role: "Viewer", scope: "Read-only (Semua Fitur)", members: "Management / Directors", write_access: false, notes: "Executive overview scope." }
];

export default function SettingsAccessPage() {
  const [roles, setRoles] = useState<AccessRole[]>(initialRoles);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Settings & Access</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola matriks otorisasi peran (*roles*), hak akses divisi kerja internal, serta pengaturan umum Catalyst Operating System.</p>
        </div>
        <Button className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
          <Plus weight="bold" /> Add Staff Member
        </Button>
      </div>

      {/* Main Settings Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Role Access Table */}
        <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
            🛡️ Matriks Peran & Hak Akses Staf
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Peran (Access Role)</th>
                  <th className="py-2.5">Ruang Lingkup Fitur (Scope)</th>
                  <th className="py-2.5">Anggota Terdaftar (Members)</th>
                  <th className="py-2.5 text-center">Hak Tulis (Write)</th>
                  <th className="py-2.5 text-right">Catatan Penggunaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                {roles.map((r, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition">
                    <td className="py-4 text-zinc-900 font-bold">{r.role}</td>
                    <td className="py-4 text-zinc-650 font-semibold">{r.scope}</td>
                    <td className="py-4 text-zinc-700 font-bold">{r.members}</td>
                    <td className="py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        r.write_access ? "bg-emerald-50 text-emerald-700 border-emerald-150" : "bg-zinc-100 text-zinc-400 border-zinc-200"
                      }`}>
                        {r.write_access ? "Write Access" : "Read-only"}
                      </span>
                    </td>
                    <td className="py-4 text-right text-zinc-500 font-semibold italic">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: General Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Gear /> Pengaturan Umum Kompetisi
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nama Kompetisi</label>
                <input 
                  type="text" 
                  value="MAPID Catalyst 2026 & WebGIS Competition #2" 
                  readOnly 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 font-semibold text-zinc-800 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Lokasi Main Event Showcase</label>
                <input 
                  type="text" 
                  value="Auditorium BINUS University Kampus Anggrek, Jakarta" 
                  readOnly 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 font-semibold text-zinc-800 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Simulasi Tanggal Operasional</label>
                <input 
                  type="text" 
                  value="18 Mei 2026 (Preparatory Phase)" 
                  readOnly 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 font-semibold text-zinc-850 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer">
                Save Configurations
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
