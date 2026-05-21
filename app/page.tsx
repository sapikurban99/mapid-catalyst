import { 
  MapTrifold, 
  Sparkle, 
  Database, 
  ClipboardText, 
  WarningCircle,
  Flag,
  CalendarCheck,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  TrendUp
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  const kpis = [
    { metric: "Sponsor Confirmed", target: "TBD", current: "0", status: "At Risk", color: "text-amber-600 bg-amber-50 border-amber-200" },
    { metric: "Dataset Ready", target: "4 Datasets", current: "1 Dataset", status: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { metric: "Document Ready", target: "18 Docs", current: "5 Docs", status: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { metric: "Registered Teams", target: "100+ Teams", current: "0 Teams", status: "Not Started", color: "text-zinc-500 bg-zinc-100 border-zinc-200" },
    { metric: "Curated Teams", target: "50 Teams", current: "0 Teams", status: "Not Started", color: "text-zinc-500 bg-zinc-100 border-zinc-200" },
    { metric: "Top Finalists", target: "10 Teams", current: "0 Teams", status: "Not Started", color: "text-zinc-500 bg-zinc-100 border-zinc-200" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Top Banner Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-zinc-500 shadow-sm uppercase tracking-wider">
            <Sparkle weight="fill" className="text-zinc-800 animate-pulse shrink-0" /> MAPID Catalyst 2026
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">Project Control Center</h1>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">Pantau status, deadline, KPI, dan blocker utama kompetisi.</p>
        </div>
        <div className="text-[9px] sm:text-[10px] text-zinc-500 font-bold bg-white border border-zinc-200 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm self-start shrink-0">
          Simulasi: <span className="text-indigo-600">18 Mei 2026</span>
        </div>
      </div>

      {/* Top Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Project Status */}
        <Card className="p-4 sm:p-5 shadow-sm rounded-2xl bg-white border border-zinc-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Project Status</span>
            <ShieldCheck className="text-lg sm:text-xl text-emerald-600" weight="fill" />
          </div>
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
              </span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900">On Track</p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 leading-tight">Persiapan berjalan sesuai jadwal.</p>
          </div>
        </Card>

        {/* Card 2: Next Milestone */}
        <Card className="p-4 sm:p-5 shadow-sm rounded-2xl bg-white border border-zinc-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Key Milestone</span>
            <Flag className="text-lg sm:text-xl text-indigo-600" weight="fill" />
          </div>
          <div className="space-y-1 mt-2">
            <p className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">Registration Open</p>
            <p className="text-[11px] sm:text-xs text-zinc-500 mt-1">📅 8 Juni 2026 (21 Hari)</p>
          </div>
        </Card>

        {/* Card 3: Countdown */}
        <Card className="p-4 sm:p-5 shadow-sm rounded-2xl bg-white border border-zinc-200 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Days to Main Event</span>
            <CalendarCheck className="text-lg sm:text-xl text-rose-600" weight="fill" />
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-950">124</span>
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase">Hari</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-zinc-500 leading-tight">Showcase & Awarding: 19-20 September 2026.</p>
          </div>
        </Card>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left Area (KPIs Panel) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 sm:pb-4 mb-3 sm:mb-4 gap-3">
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
                  <TrendUp className="text-indigo-600 shrink-0" />
                  Key Performance Indicators
                </h2>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Tracking pencapaian target operasional.</p>
              </div>
              <Link href="/settings" className="text-[10px] sm:text-[11px] font-bold text-indigo-600 hover:underline shrink-0">
                Manage Target
              </Link>
            </div>

            <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="w-full text-left text-[10px] sm:text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
                    <th className="py-2 pr-2">Metric</th>
                    <th className="py-2 px-2 text-center">Target</th>
                    <th className="py-2 px-2 text-center">Actual</th>
                    <th className="py-2 pl-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-medium">
                  {kpis.map((kpi, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-2.5 sm:py-3 pr-2 text-zinc-900 font-semibold whitespace-nowrap">{kpi.metric}</td>
                      <td className="py-2.5 sm:py-3 px-2 text-center text-zinc-500 font-mono">{kpi.target}</td>
                      <td className="py-2.5 sm:py-3 px-2 text-center text-zinc-800 font-mono">{kpi.current}</td>
                      <td className="py-2.5 sm:py-3 pl-2 text-right">
                        <span className={`text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded border tracking-wider whitespace-nowrap ${kpi.color}`}>
                          {kpi.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Area (Blockers & Priority) */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Critical Blockers */}
          <Card className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border-rose-100 bg-rose-50/10">
            <div className="flex items-center gap-2 border-b border-rose-100 pb-3 mb-3">
              <WarningCircle className="text-base sm:text-lg text-rose-600" weight="fill" />
              <h3 className="font-bold text-sm text-zinc-900">Critical Blockers (2)</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-white border border-rose-100 rounded-xl space-y-1 shadow-sm">
                <span className="text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded">
                  Sponsor Team
                </span>
                <p className="text-[11px] sm:text-xs font-bold text-zinc-900 mt-1">Sponsor Proposal Belum Dikirim</p>
                <p className="text-[10px] text-zinc-500 leading-tight">Tiering & proposal masih ditinjau.</p>
              </div>

              <div className="p-3 bg-white border border-rose-100 rounded-xl space-y-1 shadow-sm">
                <span className="text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded">
                  Data Team
                </span>
                <p className="text-[11px] sm:text-xs font-bold text-zinc-900 mt-1">Standardisasi Dataset Menu Go</p>
                <p className="text-[10px] text-zinc-500 leading-tight">Data format belum rapi. Menghambat Data Dictionary.</p>
              </div>
            </div>
          </Card>

          {/* This Week Priorities */}
          <Card className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 mb-3">
              <CheckCircle className="text-base sm:text-lg text-indigo-600" weight="fill" />
              <h3 className="font-bold text-sm text-zinc-900">This Week Priority</h3>
            </div>
            
            <div className="space-y-2">
              {[
                { num: 1, text: "Finalisasi FAQ & Panduan Kompetisi", meta: "Target: 25 Mei | PIC: Fariz" },
                { num: 2, text: "Template Campaign GEO MAPID", meta: "Target: 26 Mei | PIC: Data Team" },
                { num: 3, text: "Desain Key Visual & Launch Poster", meta: "Target: 28 Mei | PIC: Designer" },
              ].map(item => (
                <div key={item.num} className="flex gap-2.5 text-[11px] sm:text-xs p-2 hover:bg-zinc-50 rounded-xl transition">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
                    {item.num}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-950">{item.text}</p>
                    <p className="text-[10px] text-zinc-400">{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Core Concept Ingest Section */}
      <div className="bg-zinc-950 text-white border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-zinc-800 rounded-full blur-[100px] pointer-events-none opacity-40"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <MapTrifold /> Peta Jalan WebGIS Catalyst 2026
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400">Menghubungkan data komunitas dan survei menjadi peta interaktif.</p>
          </div>
          <Link href="/timeline">
            <Button className="bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center">
              Buka Timeline <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
