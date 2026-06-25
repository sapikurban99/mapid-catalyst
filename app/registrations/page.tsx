"use client";

import { useState, useEffect } from "react";
import { UsersThree, MagnifyingGlass, ArrowSquareOut } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RegistrationFeature {
  id: string;
  properties: Record<string, string>;
}

const TABS = [
  { key: "administrasi", label: "Administrasi" },
  { key: "proposal", label: "Proposal Bisnis" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const API_URLS: Record<TabKey, string> = {
  administrasi:
    "https://geoserver.mapid.io/layers_new/get_layer?api_key=6015daaa36324bb885749c34fe56fe13&layer_id=6a2a1811bc475d2ec56a9b2b&project_id=6a2a178d7463a498641f2d33",
  proposal:
    "https://geoserver.mapid.io/layers_new/get_layer?api_key=6015daaa36324bb885749c34fe56fe13&layer_id=6a38dccbd56af8dd1ec26322&project_id=6a2a178d7463a498641f2d33",
};

export default function RegistrationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("administrasi");
  const [data, setData] = useState<Record<TabKey, RegistrationFeature[]>>({
    administrasi: [],
    proposal: [],
  });
  const [loading, setLoading] = useState<Record<TabKey, boolean>>({
    administrasi: true,
    proposal: true,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTab = async (tab: TabKey) => {
      try {
        const res = await fetch(API_URLS[tab]);
        const result = await res.json();
        if (result && Array.isArray(result.features)) {
          setData((prev) => ({ ...prev, [tab]: result.features }));
        }
      } catch (e) {
        console.error(`Error fetching ${tab}:`, e);
      } finally {
        setLoading((prev) => ({ ...prev, [tab]: false }));
      }
    };
    fetchTab("administrasi");
    fetchTab("proposal");
  }, []);

  const features = data[activeTab];
  const isLoading = loading[activeTab];

  const filtered = features.filter((f) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return Object.values(f.properties).some((v) =>
      v?.toString().toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-extrabold text-zinc-500 shadow-sm uppercase tracking-wider">
            <UsersThree weight="fill" className="text-zinc-800 shrink-0" />{" "}
            Registrations
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
            Detail Pendaftar
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5 font-medium">
            Daftar tim yang sudah terdaftar di MAPID WebGIS Competition 2026.
          </p>
        </div>
        <div className="text-xs text-zinc-500 font-semibold bg-white border border-zinc-200 px-4 py-2.5 rounded-2xl shadow-sm self-start shrink-0">
          Total:{" "}
          <span className="text-indigo-600 font-bold">{features.length}</span>{" "}
          tim
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSearch("");
            }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeTab === tab.key
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 text-[10px] font-bold",
                activeTab === tab.key ? "text-indigo-600" : "text-zinc-400"
              )}
            >
              {data[tab.key].length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlass
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <Input
          placeholder="Cari nama tim..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-sm h-9 rounded-xl border-zinc-200"
        />
      </div>

      {/* Table */}
      <Card className="bg-white border border-zinc-200 rounded-2xl p-3 sm:p-5 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 text-sm font-medium">
            {search
              ? "Tidak ada tim yang cocok dengan pencarian."
              : "Belum ada pendaftar."}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                  {activeTab === "administrasi" ? (
                    <>
                      <th className="pb-2.5 w-10">No</th>
                      <th className="pb-2.5">Nama Tim</th>
                      <th className="pb-2.5 hidden md:table-cell">Jenjang Pendidikan</th>
                      <th className="pb-2.5 hidden lg:table-cell">Dosen Pembimbing</th>
                    </>
                  ) : (
                    <>
                      <th className="pb-2.5 w-10">No</th>
                      <th className="pb-2.5">Nama Tim</th>
                      <th className="pb-2.5 hidden md:table-cell">Project Leader</th>
                      <th className="pb-2.5 hidden lg:table-cell">Proposal</th>
                      <th className="pb-2.5 hidden lg:table-cell">Persetujuan</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map((feature, idx) => {
                  const p = feature.properties;

                  if (activeTab === "administrasi") {
                    const namaTim = p["Nama Tim"] || "-";
                    const jenjang = p["Jenjang Pendidikan Seluruh Anggota Tim"] || "-";
                    const hasDosen = p["Apakah Tim kamu memiliki dosen pembimbing dalam kompetisi ini?"] || "-";
                    const namaDosen = p["Jika dalam mengikuti kompetisi ini kamu dibawah arahan/bimbingan dosen, silahkan sebutkan dosen pembimbingmu"];

                    return (
                      <tr key={feature.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3 text-zinc-400 font-semibold text-xs">{idx + 1}</td>
                        <td className="py-3"><span className="font-bold text-zinc-900">{namaTim}</span></td>
                        <td className="py-3 hidden md:table-cell">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-[11px] font-bold">
                            {jenjang}
                          </span>
                        </td>
                        <td className="py-3 hidden lg:table-cell text-zinc-500 font-medium text-xs">
                          {hasDosen === "Ya" && namaDosen ? namaDosen : hasDosen === "Tidak" ? "-" : hasDosen}
                        </td>
                      </tr>
                    );
                  }

                  const namaTim = p["Nama Tim"] || "-";
                  const leader = p["Nama Project Leader"] || "-";
                  const proposalUrl = p["Submit Proposal WebGIS"];
                  const persetujuanUrl = p["Submit Persetujuan Ketentuan Kompetisi"];

                  return (
                    <tr key={feature.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3 text-zinc-400 font-semibold text-xs">{idx + 1}</td>
                      <td className="py-3"><span className="font-bold text-zinc-900">{namaTim}</span></td>
                      <td className="py-3 hidden md:table-cell text-zinc-600 font-medium text-xs">{leader}</td>
                      <td className="py-3 hidden lg:table-cell">
                        {proposalUrl ? (
                          <a href={proposalUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold">
                            Lihat <ArrowSquareOut size={12} weight="bold" />
                          </a>
                        ) : (
                          <span className="text-zinc-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        {persetujuanUrl ? (
                          <a href={persetujuanUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold">
                            Lihat <ArrowSquareOut size={12} weight="bold" />
                          </a>
                        ) : (
                          <span className="text-zinc-300 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
