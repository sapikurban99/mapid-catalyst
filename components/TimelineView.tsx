"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CalendarBlank, 
  List, 
  ChartBar,
  CaretLeft, 
  CaretRight, 
  Plus, 
  CheckCircle, 
  CircleNotch, 
  Clock, 
  Info,
  MapPin,
  Sparkle,
  ClipboardText
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type TimelineEvent = {
  id: string;
  phase: string;
  date_range: string;
  type: string;
  description: string;
  order_index: number;
};

type Task = {
  id: string;
  name: string;
  workstream: string;
  pic: string;
  priority: "High" | "Medium" | "Low";
  start_date?: string;
  deadline: string;
  status: "Not Started" | "In Progress" | "Waiting Review" | "Blocked" | "Done" | "Delayed";
  dependency?: string;
  doc_link?: string;
  blocker?: string;
  notes?: string;
  phase_id?: string | null;
};

// High-fidelity fallback events containing the exact 17 timeline phases
const defaultEvents: TimelineEvent[] = [
  {
    id: "P001",
    phase: "Planning & Persiapan Kompetisi",
    date_range: "1 – 31 Mei 2026",
    type: "Phase Ingestion",
    description: "Perumusan konsep, timeline, dataset, guideline, sponsor proposal, visual assets, dan setup awal webapp.",
    order_index: 0
  },
  {
    id: "P002",
    phase: "Pembukaan Pendaftaran WebGIS Competition",
    date_range: "8 – 26 Juni 2026",
    type: "Registration",
    description: "Pembukaan pendaftaran untuk peserta WebGIS Competition 2026. Peserta mendaftar dan mengirimkan proposal ide berbasis tema dari sponsor.",
    order_index: 1
  },
  {
    id: "P003",
    phase: "Seleksi Proposal & Kurasi Tim",
    date_range: "27 Juni – 3 Juli 2026",
    type: "Phase Ingestion",
    description: "Proses seleksi proposal dan kurasi peserta, penentuan 50 tim terdaftar yang akan melanjutkan ke tahap pengembangan WebGIS.",
    order_index: 2
  },
  {
    id: "P004",
    phase: "Pengumuman 50 Tim Terkurasi",
    date_range: "4 Juli 2026",
    type: "Announcement",
    description: "Tim terpilih diumumkan melalui kanal resmi MAPID.",
    order_index: 3
  },
  {
    id: "P005",
    phase: "Technical Meeting & Delegasi Fasilitas",
    date_range: "6 Juli 2026",
    type: "Technical Meeting",
    description: "Penjelasan teknis kompetisi, data, survey activities, fasilitas, timeline, GEO MAPID, MAPID MAPS, dan ketentuan WebGIS.",
    order_index: 4
  },
  {
    id: "P006",
    phase: "Mentoring 1 — Industry Demand & Creating Product bervalue sesuai market",
    date_range: "8 Juli 2026",
    type: "Field Mentoring",
    description: "Sesi mentoring awal mengenai analisis permintaan industri, segmentasi market spasial, dan perumusan value proposition produk WebGIS.",
    order_index: 5
  },
  {
    id: "P007",
    phase: "Mentoring 2 — Data Vis",
    date_range: "15 Juli 2026",
    type: "Field Mentoring",
    description: "Sesi mentoring interaktif tentang teknik visualisasi data geospasial, kartografi modern, dan desain UI/UX peta yang intuitif.",
    order_index: 6
  },
  {
    id: "P008",
    phase: "Mentoring 3 — PRD & Product Planning",
    date_range: "22 Juli 2026",
    type: "Field Mentoring",
    description: "Arahan mengenai PRD, struktur dokumen, user needs, fitur produk, user flow, kebutuhan data, dan rencana pengembangan WebGIS.",
    order_index: 7
  },
  {
    id: "P009",
    phase: "Survey Activities & Data Enrichment",
    date_range: "9 – 27 Juli 2026",
    type: "Phase Ingestion",
    description: "Tim melakukan pengayaan, validasi, atau pelengkapan data lapangan dengan survey activity budget.",
    order_index: 8
  },
  {
    id: "P010",
    phase: "Mentoring 4 — GEO MAPID, Database & MAPID MAPS",
    date_range: "29 Juli 2026",
    type: "Field Mentoring",
    description: "Arahan penggunaan GEO MAPID sebagai database dan MAPID MAPS sebagai basemap utama WebGIS.",
    order_index: 9
  },
  {
    id: "P011",
    phase: "Development WebGIS",
    date_range: "4 Juli – 11 September 2026",
    type: "AI Implementation",
    description: "Tim yang terkurasi mulai mengembangkan solusi WebGIS berbasis proposal yang telah disetujui, dengan mentoring teknis terbatas.",
    order_index: 10
  },
  {
    id: "P012",
    phase: "Privat 1on1 Sessions dengan Masing-Masing Tim (Rutin 2 Mingguan)",
    date_range: "4 Juli – 11 September 2026",
    type: "Field Mentoring",
    description: "Sesi asistensi privat dwi-mingguan untuk memantau arsitektur WebGIS, integrasi database, dan penyusunan dokumen PRD masing-masing tim.",
    order_index: 11
  },
  {
    id: "P013",
    phase: "Mentoring 5 — Product Review WebGIS",
    date_range: "19 Agustus 2026",
    type: "Field Mentoring",
    description: "Review progres WebGIS, struktur produk, kualitas visualisasi, interaksi peta, insight, dan kesesuaian kaidah MAPID.",
    order_index: 12
  },
  {
    id: "P014",
    phase: "Pengumpulan Final WebGIS & PRD",
    date_range: "11 September 2026",
    type: "Submission",
    description: "Peserta mengumpulkan link WebGIS, PRD, metadata, dokumentasi survey, dan metode pengolahan data.",
    order_index: 13
  },
  {
    id: "P015",
    phase: "Seleksi Grand Final",
    date_range: "14 – 18 September 2026",
    type: "Phase Ingestion",
    description: "Penilaian akhir oleh juri terhadap prototype WebGIS dan PRD yang diajukan oleh peserta, penentuan finalis yang akan tampil di acara utama.",
    order_index: 14
  },
  {
    id: "P016",
    phase: "Pengumuman Top 10 Finalis",
    date_range: "19 September 2026",
    type: "Announcement",
    description: "Top 10 finalis diumumkan untuk tampil di MAPID Catalyst 2026.",
    order_index: 15
  },
  {
    id: "P017",
    phase: "Mentoring 6 — Public Speaking & Final Presentation",
    date_range: "21 – 22 September 2026",
    type: "Field Mentoring",
    description: "Top 10 finalis mendapatkan mentoring public speaking, storytelling produk, demo WebGIS, dan simulasi presentasi final.",
    order_index: 16
  },
  {
    id: "P018",
    phase: "Final Preparation & Rehearsal",
    date_range: "21 – 23 September 2026",
    type: "Phase Ingestion",
    description: "Finalisasi venue dan layout, koordinasi teknis untuk final presentation dan showcase solusi WebGIS. Gladi bersih dan briefing final volunteer, serta sponsor.",
    order_index: 17
  },
  {
    id: "P019",
    phase: "MAPID Catalyst Day 1",
    date_range: "24 September 2026 (TBD)",
    type: "Announcement",
    description: "Penilaian teknis dan substansi solusi WebGIS Competition 2026 oleh dewan juri, sekaligus sesi WebGIS showcase terkurasi di mana finalis mempresentasikan prototype dan demo solusi mereka di hadapan audiens kampus dan komunitas geospasial muda.",
    order_index: 18
  },
  {
    id: "P020",
    phase: "MAPID Catalyst Day 2",
    date_range: "25 September 2026 (TBD)",
    type: "Announcement",
    description: "WebGIS showcase skala penuh yang menampilkan solusi para pemenang dan finalis kepada komunitas geospasial yang lebih luas, diikuti diskusi panel tentang transformasi lahan berkelanjutan, inovasi spasial, dan peran teknologi geospasial dalam pembangunan.",
    order_index: 19
  },
  {
    id: "P021",
    phase: "Post-Event Publication",
    date_range: "28 September – 5 Oktober 2026",
    type: "Announcement",
    description: "Publikasi karya, dokumentasi, recap kompetisi, sponsor report, dan post-event report.",
    order_index: 20
  }
];

const parseDateRangeStr = (rangeStr: string): { start: Date; end: Date } | null => {
  const str = rangeStr.toLowerCase().replace(/\s+/g, ' ');
  const months = [
    "januari", "februari", "maret", "april", "mei", "juni",
    "juli", "agustus", "september", "oktober", "november", "desember"
  ];
  
  const numbers = str.match(/\d+/g);
  if (!numbers) return null;
  
  const monthsFound: { index: number; name: string; pos: number }[] = [];
  months.forEach((m, idx) => {
    let pos = str.indexOf(m);
    while (pos !== -1) {
      monthsFound.push({ index: idx, name: m, pos });
      pos = str.indexOf(m, pos + 1);
    }
  });
  monthsFound.sort((a, b) => a.pos - b.pos);
  
  if (monthsFound.length === 0) return null;
  
  const yearMatch = str.match(/\b(202\d)\b/);
  const matchedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
  
  const isRange = str.includes("–") || str.includes("-") || str.includes("sampai") || str.includes("s.d") || str.includes("s/d");
  
  if (!isRange && monthsFound.length === 1 && numbers.length >= 1) {
    const day = parseInt(numbers[0], 10);
    const month = monthsFound[0].index;
    return {
      start: new Date(matchedYear, month, day),
      end: new Date(matchedYear, month, day, 23, 59, 59)
    };
  }
  
  if (monthsFound.length >= 2 && numbers.length >= 2) {
    const startDay = parseInt(numbers[0], 10);
    const startMonth = monthsFound[0].index;
    const endDay = parseInt(numbers[1], 10);
    const endMonth = monthsFound[1].index;
    return {
      start: new Date(matchedYear, startMonth, startDay),
      end: new Date(matchedYear, endMonth, endDay, 23, 59, 59)
    };
  }
  
  if (monthsFound.length === 1 && numbers.length >= 2) {
    const startDay = parseInt(numbers[0], 10);
    const endDay = parseInt(numbers[1], 10);
    const month = monthsFound[0].index;
    return {
      start: new Date(matchedYear, month, startDay),
      end: new Date(matchedYear, month, endDay, 23, 59, 59)
    };
  }
  
  if (monthsFound.length === 1 && numbers.length >= 1) {
    const day = parseInt(numbers[0], 10);
    const month = monthsFound[0].index;
    return {
      start: new Date(matchedYear, month, day),
      end: new Date(matchedYear, month, day, 23, 59, 59)
    };
  }
  
  return null;
};

const ID_MONTHS_FULL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function buildDateRange(startIso: string, endIso: string): string {
  if (!startIso) return "";
  const [sy, sm, sd] = startIso.split("-").map(Number);
  const effectiveEnd = endIso && endIso !== startIso ? endIso : null;
  if (!effectiveEnd) return `${sd} ${ID_MONTHS_FULL[sm - 1]} ${sy}`;
  const [ey, em, ed] = effectiveEnd.split("-").map(Number);
  if (sm === em && sy === ey) return `${sd} – ${ed} ${ID_MONTHS_FULL[em - 1]} ${sy}`;
  return `${sd} ${ID_MONTHS_FULL[sm - 1]} – ${ed} ${ID_MONTHS_FULL[em - 1]} ${ey}`;
}

function dateRangeToIso(dateRange: string): { start: string; end: string } {
  const parsed = parseDateRangeStr(dateRange);
  if (!parsed) return { start: "", end: "" };
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: fmt(parsed.start), end: fmt(parsed.end) };
}

const parseTaskDeadlineStr = (dateStr: string): Date | null => {
  const str = dateStr.toLowerCase().trim();
  const months = [
    "januari", "februari", "maret", "april", "mei", "juni",
    "juli", "agustus", "september", "oktober", "november", "desember"
  ];
  const indonesianShortMonths = [
    "jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des"
  ];
  
  const parts = str.split(/\s+/);
  if (parts.length < 3) return null;
  
  const day = parseInt(parts[0], 10);
  let month = -1;
  const monthName = parts[1];
  
  months.forEach((m, idx) => {
    if (monthName.includes(m)) month = idx;
  });
  if (month === -1) {
    indonesianShortMonths.forEach((m, idx) => {
      if (monthName.includes(m)) month = idx;
    });
  }
  
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || month === -1 || isNaN(year)) return null;
  
  return new Date(year, month, day);
};

const getPhaseRelatedTasks = (phaseId: string, allTasks: Task[]): Task[] => {
  const mapping: Record<string, string[]> = {
    "P001": ["T001", "T002", "T003", "T004", "T005", "T006", "T007", "T008", "T009", "T010", "T024", "T025", "T026", "T027", "T049", "T050", "T054", "T062", "T064"],
    "P002": ["T006", "T007", "T008", "T010", "T011", "T062", "T063", "T064", "T065", "T066", "T067"],
    "P003": ["T010", "T011"],
    "P004": ["T012", "T066"],
    "P005": ["T013", "T014", "T028", "T029", "T030", "T031", "T032", "T033", "T038"],
    "P006": ["T015", "T068"],
    "P007": ["T016", "T068"],
    "P008": ["T017", "T009", "T068"],
    "P009": ["T033", "T034", "T035", "T036", "T037"],
    "P010": ["T018", "T030", "T031", "T032", "T068"],
    "P011": ["T023", "T024", "T025", "T026", "T027", "T028", "T029", "T030", "T031", "T032", "T038"],
    "P012": ["T021", "T022", "T023"],
    "P013": ["T019"],
    "P014": ["T039", "T040"],
    "P015": ["T041", "T042", "T043"],
    "P016": ["T044", "T045", "T066", "T069"],
    "P017": ["T020", "T046", "T047", "T048"],
    "P018": ["T053", "T055", "T056", "T057", "T058", "T059"],
    "P019": ["T053", "T055", "T056", "T057", "T058", "T060", "T069"],
    "P020": ["T053", "T055", "T056", "T057", "T058", "T061", "T069"],
    "P021": ["T066", "T070", "T071", "T072", "T073", "T074"]
  };

  const seedIds = new Set(mapping[phaseId] || []);
  // Hardcoded seed mapping OR explicit phase_id from DB — task baru pakai phase_id
  return allTasks.filter(t => seedIds.has(t.id) || t.phase_id === phaseId);
};

const getAssociatedWorkstreams = (type: string, name: string): string[] => {
  return [];
};

// ─── Gantt Chart Component ───────────────────────────────────────────────
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function getEventStyle(event: TimelineEvent) {
  const t = event.type.toLowerCase();
  if (t.includes("announcement") || t.includes("submission"))
    return { bar: "bg-amber-500", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", light: "bg-amber-400/20" };
  if (t.includes("mentoring") || t.includes("technical"))
    return { bar: "bg-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", light: "bg-indigo-400/20" };
  if (t.includes("ai") || t.includes("phase") || t.includes("registration"))
    return { bar: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", light: "bg-emerald-400/20" };
  return { bar: "bg-zinc-500", bg: "bg-zinc-50", border: "border-zinc-200", text: "text-zinc-700", light: "bg-zinc-400/20" };
}

function GanttChart({
  events,
  tasks,
  activeEventId,
  handleTaskStatusChange
}: {
  events: TimelineEvent[];
  tasks: Task[];
  activeEventId: string | null;
  handleTaskStatusChange: (taskId: string, newStatus: Task["status"]) => void;
}) {
  // Parse all events into date ranges
  const ranges = useMemo(() => {
    return events
      .map(e => ({ event: e, range: parseDateRangeStr(e.date_range) }))
      .filter((r): r is { event: TimelineEvent; range: { start: Date; end: Date } } => r.range !== null)
      .sort((a, b) => a.range.start.getTime() - b.range.start.getTime());
  }, [events]);

  // Global timeline boundaries
  const timeline = useMemo(() => {
    if (ranges.length === 0) return null;
    let min = ranges[0].range.start;
    let max = ranges[0].range.end;
    for (const r of ranges) {
      if (r.range.start < min) min = r.range.start;
      if (r.range.end > max) max = r.range.end;
    }
    // Pad 3 days before & after for breathing room
    min = new Date(min.getFullYear(), min.getMonth(), min.getDate() - 3);
    max = new Date(max.getFullYear(), max.getMonth(), max.getDate() + 3);
    return { start: min, end: max, totalDays: daysBetween(min, max) };
  }, [ranges]);

  // Generate month columns for the header
  const monthColumns = useMemo(() => {
    if (!timeline) return [];
    const cols: { label: string; month: number; year: number; left: number; width: number }[] = [];
    let cursor = new Date(timeline.start.getFullYear(), timeline.start.getMonth(), 1);
    const end = timeline.end;
    while (cursor <= end) {
      const monthStart = new Date(cursor);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      const clampStart = cursor < timeline.start ? timeline.start : cursor;
      const clampEnd = monthEnd > end ? end : monthEnd;
      const left = daysBetween(timeline.start, clampStart) / timeline.totalDays * 100;
      const width = daysBetween(clampStart, clampEnd) / timeline.totalDays * 100;
      if (width > 0) {
        cols.push({
          label: MONTHS_SHORT[cursor.getMonth()],
          month: cursor.getMonth(),
          year: cursor.getFullYear(),
          left,
          width
        });
      }
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return cols;
  }, [timeline]);

  // Today indicator position
  const todayPos = useMemo(() => {
    if (!timeline) return null;
    const now = new Date();
    if (now < timeline.start || now > timeline.end) return null;
    return daysBetween(timeline.start, now) / timeline.totalDays * 100;
  }, [timeline]);

  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  if (!timeline || ranges.length === 0) {
    return (
      <Card className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm text-center text-zinc-400">
        <ChartBar size={40} className="mx-auto text-zinc-200 mb-2" />
        <p className="text-sm font-semibold">Tidak ada data untuk ditampilkan di Gantt chart.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-[700px]">
          {/* Month Headers */}
          <div className="relative h-10 mb-1">
            {monthColumns.map((col, i) => (
              <div
                key={i}
                className="absolute top-0 h-full flex items-end pb-1.5 border-l border-zinc-100 first:border-l-0"
                style={{ left: `${col.left}%`, width: `${col.width}%` }}
              >
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">
                  {col.label} {col.year}
                </span>
              </div>
            ))}
            {/* Today line */}
            {todayPos !== null && (
              <div className="absolute top-0 bottom-0 w-[2px] bg-rose-400 z-10" style={{ left: `${todayPos}%` }}>
                <div className="w-2 h-2 rounded-full bg-rose-400 -ml-[3px]"></div>
              </div>
            )}
          </div>

          {/* Grid lines (week markers) */}
          <div className="relative h-0 mb-0">
            {monthColumns.map((col, i) => (
              <div
                key={`grid-${i}`}
                className="absolute top-0 w-px h-full bg-zinc-100/50"
                style={{ left: `${col.left}%` }}
              />
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {ranges.map(({ event, range }) => {
              const isActive = event.id === activeEventId;
              const style = getEventStyle(event);
              const leftPct = daysBetween(timeline.start, range.start) / timeline.totalDays * 100;
              const widthPct = daysBetween(range.start, range.end) / timeline.totalDays * 100;
              const isExpanded = expandedEvent === event.id;

              const assocTasks = getPhaseRelatedTasks(event.id, tasks);
              const doneCount = assocTasks.filter(t => t.status === "Done").length;
              const progress = assocTasks.length > 0 ? Math.round(doneCount / assocTasks.length * 100) : 0;

              return (
                <div key={event.id} className="group">
                  {/* Row */}
                  <div
                    className={`relative flex items-center rounded-xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-indigo-200 bg-indigo-50/30 shadow-sm"
                        : "border-zinc-100 hover:border-zinc-200 bg-white hover:bg-zinc-50/50"
                    } ${isExpanded ? "shadow-sm" : ""}`}
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  >
                    {/* Phase name (fixed left) */}
                    <div className="flex items-center gap-2 w-[200px] shrink-0 px-3 py-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${style.bar}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? "text-zinc-950" : "text-zinc-700"}`}>
                          {event.phase}
                        </p>
                        <p className="text-[9px] text-zinc-400 font-medium">{event.date_range}</p>
                      </div>
                    </div>

                    {/* Bar area */}
                    <div className="flex-1 relative h-[36px] mr-3">
                      {/* Background grid */}
                      {monthColumns.map((col, i) => (
                        <div
                          key={i}
                          className="absolute inset-y-0 border-l border-zinc-100/40"
                          style={{ left: `${col.left}%`, width: `${col.width}%` }}
                        />
                      ))}

                      {/* Today indicator vertical line */}
                      {todayPos !== null && (
                        <div className="absolute top-0 bottom-0 w-[2px] bg-rose-400/60 z-10" style={{ left: `${todayPos}%` }} />
                      )}

                      {/* Event bar */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-md ${style.bar} transition-all duration-300 hover:h-7 hover:shadow-md flex items-center px-2 min-w-[8px] ${
                          isActive ? "ring-2 ring-indigo-400/40" : ""
                        }`}
                        style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1.5)}%` }}
                      >
                        {widthPct > 8 && (
                          <span className={`text-[9px] font-bold text-white truncate w-full ${widthPct < 15 ? "opacity-0 group-hover:opacity-100" : ""}`}>
                            {event.type}
                          </span>
                        )}
                      </div>

                      {/* Active badge */}
                      {isActive && (
                        <div className="absolute -top-2 right-1 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          Aktif
                        </div>
                      )}
                    </div>

                    {/* Chevron/expand */}
                    <div className="pr-3 text-zinc-300 group-hover:text-zinc-500 transition-colors">
                      <svg className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 12">
                        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M3 4.5L6 7.5L9 4.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="ml-[208px] mt-1 mb-2 p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2 animate-[fadeIn_0.2s_ease-in-out]">
                      <p className="text-xs text-zinc-600 leading-relaxed">{event.description}</p>

                      {/* Tasks progress */}
                      {assocTasks.length > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500 shrink-0">
                            {doneCount}/{assocTasks.length} tasks
                          </span>
                        </div>
                      )}

                      {/* Associated tasks mini-list */}
                      {assocTasks.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Workstream Tasks</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {assocTasks.map(task => (
                              <div key={task.id} className="flex items-center justify-between gap-2 p-1.5 bg-white border border-zinc-100 rounded-lg text-[10px]">
                                <span className="font-semibold text-zinc-700 truncate">{task.name}</span>
                                <select
                                  value={task.status}
                                  onChange={(e) => handleTaskStatusChange(task.id, e.target.value as Task["status"])}
                                  className={`px-1 py-0.5 rounded font-extrabold uppercase text-[8px] tracking-wider shrink-0 border cursor-pointer appearance-none outline-none ${
                                    task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    task.status === 'Blocked' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                    task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    'bg-zinc-100 text-zinc-600 border-zinc-200'
                                  }`}
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Waiting Review">Waiting Review</option>
                                  <option value="Blocked">Blocked</option>
                                  <option value="Done">Done</option>
                                  <option value="Delayed">Delayed</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Task-Level Gantt Chart — shows date range bars per task */}
                      {assocTasks.length > 0 && range && (() => {
                        // Build a timeline scope for this phase
                        const phaseStart = range.start;
                        const phaseEnd = range.end;
                        const phaseDays = Math.max(daysBetween(phaseStart, phaseEnd), 1);

                        // Generate week columns for the mini Gantt header
                        const miniMonthCols: { label: string; left: number; width: number }[] = [];
                        {
                          let cursor = new Date(phaseStart.getFullYear(), phaseStart.getMonth(), 1);
                          while (cursor <= phaseEnd) {
                            const mStart = new Date(cursor);
                            const mEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
                            const clampS = mStart < phaseStart ? phaseStart : mStart;
                            const clampE = mEnd > phaseEnd ? phaseEnd : mEnd;
                            const left = daysBetween(phaseStart, clampS) / phaseDays * 100;
                            const width = daysBetween(clampS, clampE) / phaseDays * 100;
                            if (width > 0) {
                              miniMonthCols.push({
                                label: MONTHS_SHORT[cursor.getMonth()],
                                left,
                                width
                              });
                            }
                            cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
                          }
                        }

                        // Today position within phase
                        const now = new Date();
                        let miniTodayPos: number | null = null;
                        if (now >= phaseStart && now <= phaseEnd) {
                          miniTodayPos = daysBetween(phaseStart, now) / phaseDays * 100;
                        }

                        return (
                          <div className="mt-3 p-3 bg-white border border-zinc-100 rounded-xl space-y-0 overflow-hidden">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2">📊 Task Timeline — Dari Kapan Sampai Kapan</p>
                            <div className="overflow-x-auto">
                              <div className="min-w-[400px]">
                                {/* Mini month header */}
                                <div className="relative h-6 mb-1 ml-[140px]">
                                  {miniMonthCols.map((col, i) => (
                                    <div
                                      key={i}
                                      className="absolute top-0 h-full flex items-end pb-0.5 border-l border-zinc-100"
                                      style={{ left: `${col.left}%`, width: `${col.width}%` }}
                                    >
                                      <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider pl-0.5">
                                        {col.label}
                                      </span>
                                    </div>
                                  ))}
                                  {miniTodayPos !== null && (
                                    <div className="absolute top-0 bottom-0 w-[2px] bg-rose-400 z-10" style={{ left: `${miniTodayPos}%` }}>
                                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 -ml-[2px]" />
                                    </div>
                                  )}
                                </div>

                                {/* Task rows */}
                                <div className="space-y-1">
                                  {assocTasks.map(task => {
                                    const taskDeadline = parseTaskDeadlineStr(task.deadline);

                                    // Use real start_date if available, otherwise estimate
                                    const parsedStartDate = task.start_date ? parseTaskDeadlineStr(task.start_date) : null;
                                    let taskStart = parsedStartDate || new Date(phaseStart);
                                    let taskEnd = taskDeadline || new Date(phaseEnd);

                                    // Clamp to phase boundaries for display
                                    if (taskStart < phaseStart) taskStart = new Date(phaseStart);
                                    if (taskEnd > phaseEnd) taskEnd = new Date(phaseEnd);
                                    if (taskStart > phaseEnd) taskStart = new Date(phaseEnd.getTime() - 86400000);
                                    if (taskEnd < phaseStart) taskEnd = new Date(phaseStart.getTime() + 86400000);

                                    const barLeft = Math.max(daysBetween(phaseStart, taskStart) / phaseDays * 100, 0);
                                    const barWidth = Math.max(daysBetween(taskStart, taskEnd) / phaseDays * 100, 3);

                                    // Color by status
                                    const tc =
                                      task.status === "Done" ? "bg-emerald-500" :
                                      task.status === "In Progress" ? "bg-blue-500" :
                                      task.status === "Blocked" ? "bg-rose-500" :
                                      task.status === "Waiting Review" ? "bg-amber-500" :
                                      task.status === "Delayed" ? "bg-red-400" :
                                      "bg-zinc-400";

                                    const tcLight =
                                      task.status === "Done" ? "bg-emerald-500/10" :
                                      task.status === "In Progress" ? "bg-blue-500/10" :
                                      task.status === "Blocked" ? "bg-rose-500/10" :
                                      task.status === "Waiting Review" ? "bg-amber-500/10" :
                                      task.status === "Delayed" ? "bg-red-400/10" :
                                      "bg-zinc-400/10";

                                    // Format dates
                                    const fmtStart = taskStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                    const fmtEnd = taskEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                                    return (
                                      <div key={task.id} className="flex items-center gap-0">
                                        {/* Task label */}
                                        <div className="w-[140px] shrink-0 pr-2 py-1">
                                          <p className="text-[9px] font-bold text-zinc-700 truncate" title={task.name}>
                                            <span className="text-zinc-400 mr-1">{task.id}</span>
                                            {task.name}
                                          </p>
                                          <p className="text-[7px] text-zinc-400 font-medium">{task.pic}</p>
                                        </div>

                                        {/* Bar area */}
                                        <div className="flex-1 relative h-7">
                                          {/* Month grid lines */}
                                          {miniMonthCols.map((col, i) => (
                                            <div
                                              key={i}
                                              className="absolute inset-y-0 border-l border-zinc-100/40"
                                              style={{ left: `${col.left}%` }}
                                            />
                                          ))}

                                          {/* Today line */}
                                          {miniTodayPos !== null && (
                                            <div className="absolute top-0 bottom-0 w-[1.5px] bg-rose-400/50 z-10" style={{ left: `${miniTodayPos}%` }} />
                                          )}

                                          {/* Task bar - solid rounded bar like the main Gantt */}
                                          <div
                                            className={`absolute top-1/2 -translate-y-1/2 h-4 rounded-md ${tc} shadow-sm transition-all duration-300 hover:h-5 hover:shadow-md cursor-default flex items-center justify-center group/bar`}
                                            style={{ left: `${barLeft}%`, width: `${Math.min(barWidth, 100 - barLeft)}%`, minWidth: '20px' }}
                                            title={`${task.name}\n${fmtStart} → ${fmtEnd}\nStatus: ${task.status}`}
                                          >
                                            {/* Label inside bar (only when wide enough) */}
                                            {barWidth > 15 && (
                                              <span className="text-[7px] font-bold text-white truncate px-1.5 opacity-90 group-hover/bar:opacity-100">
                                                {fmtStart} → {fmtEnd}
                                              </span>
                                            )}
                                          </div>

                                          {/* Deadline marker diamond */}
                                          {taskDeadline && (() => {
                                            const dlPos = daysBetween(phaseStart, taskDeadline) / phaseDays * 100;
                                            if (dlPos >= 0 && dlPos <= 100) {
                                              return (
                                                <div
                                                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-zinc-800 z-10 border border-white"
                                                  style={{ left: `${Math.min(dlPos, 99)}%` }}
                                                  title={`Deadline: ${task.deadline}`}
                                                />
                                              );
                                            }
                                            return null;
                                          })()}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Mini legend */}
                                <div className="mt-2 pt-2 border-t border-zinc-100 flex flex-wrap gap-3 text-[8px] font-semibold text-zinc-400">
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Done</span>
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> In Progress</span>
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" /> Waiting Review</span>
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500" /> Blocked</span>
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-zinc-400" /> Not Started</span>
                                  <span className="flex items-center gap-1 ml-auto"><span className="w-1.5 h-1.5 rotate-45 bg-zinc-800" /> Deadline</span>
                                  <span className="flex items-center gap-1"><span className="w-0.5 h-3 bg-rose-400" /> Today</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-wrap gap-4 text-[10px] font-semibold text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Phase & Registration
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Mentoring & Technical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Announcement & Submit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-zinc-500" /> General
            </span>
            <span className="flex items-center gap-1.5 ml-auto">
              <div className="w-0.5 h-4 bg-rose-400" /> Today
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function TimelineView({ initialEvents, initialTasks = [] }: { initialEvents: TimelineEvent[]; initialTasks?: Task[] }) {
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  // Use DB events, fallback to default high-fidelity events if DB is empty
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    return initialEvents.length > 0 ? initialEvents : defaultEvents;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TimelineEvent>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  
  // Track which phases have their task list collapsed/hidden
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  // Per-phase task list pagination
  const [phaseTaskPages, setPhaseTaskPages] = useState<Record<string, number>>({});
  const PHASE_TASK_PAGE_SIZE = 10;

  // Pagination for list view
  const [listPage, setListPage] = useState(1);
  const LIST_PAGE_SIZE = 8;

  // Calendar sub-mode: "calendar" or "gantt"
  const [calendarMode, setCalendarMode] = useState<"calendar" | "gantt">("calendar");

  // Toggle show/hide for a specific phase
  const togglePhaseTasks = (phaseId: string) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const handleEditClick = (event: TimelineEvent) => {
    setEditForm(event);
    const { start, end } = dateRangeToIso(event.date_range);
    setFormStartDate(start);
    setFormEndDate(start === end ? "" : end);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleAddNewClick = () => {
    setEditForm({
      id: crypto.randomUUID(),
      phase: "",
      date_range: "",
      type: "Registration",
      description: "",
      order_index: events.length + 1
    });
    setFormStartDate("");
    setFormEndDate("");
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id || !editForm.phase || !formStartDate) return;

    const dateRange = buildDateRange(formStartDate, formEndDate);
    const eventToSave = { ...editForm, date_range: dateRange } as TimelineEvent;

    setIsLoading(true);
    
    if (isEditing) {
      setEvents(events.map(ev => ev.id === eventToSave.id ? eventToSave : ev));
    } else {
      setEvents([...events, eventToSave]);
    }
    
    setShowAddModal(false);

    try {
      await supabase.from("catalyst_timeline").upsert({
        id: eventToSave.id,
        phase: eventToSave.phase,
        date_range: eventToSave.date_range,
        type: eventToSave.type,
        description: eventToSave.description,
        order_index: eventToSave.order_index
      });
    } catch (err) {
      console.error("Error saving timeline event:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setEvents(events.filter(ev => ev.id !== id));
    setShowAddModal(false);
    
    try {
      await supabase.from("catalyst_timeline").delete().eq("id", id);
    } catch (err) {
      console.error("Error deleting timeline event:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    setIsLoading(true);
    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      await supabase.from("catalyst_tasks").update({ status: newStatus }).eq("id", taskId);
    } catch (err) {
      console.error("Error updating task status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute currently active or next upcoming phase dynamically based on today's actual date
  const activeEventId = useMemo(() => {
    const today = new Date();
    let foundId: string | null = null;
    let nextUpcoming: TimelineEvent | null = null;
    
    for (const event of events) {
      const range = parseDateRangeStr(event.date_range);
      if (range) {
        if (today >= range.start && today <= range.end) {
          foundId = event.id;
          break;
        }
        if (today < range.start) {
          if (!nextUpcoming) {
            nextUpcoming = event;
          } else {
            const nextRange = parseDateRangeStr(nextUpcoming.date_range);
            if (nextRange && range.start < nextRange.start) {
              nextUpcoming = event;
            }
          }
        }
      }
    }
    return foundId || (nextUpcoming ? nextUpcoming.id : null);
  }, [events]);

  // Calendar State
  // Default to today's actual month and year
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());

  const months = [
    { name: "Januari", eng: "january", short: "jan" },
    { name: "Februari", eng: "february", short: "feb" },
    { name: "Maret", eng: "march", short: "mar" },
    { name: "April", eng: "april", short: "apr" },
    { name: "Mei", eng: "may", short: "mei" },
    { name: "Juni", eng: "june", short: "jun" },
    { name: "Juli", eng: "july", short: "jul" },
    { name: "Agustus", eng: "august", short: "aug" },
    { name: "September", eng: "september", short: "sep" },
    { name: "Oktober", eng: "october", short: "oct" },
    { name: "November", eng: "november", short: "nov" },
    { name: "Desember", eng: "december", short: "dec" }
  ];

  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const currentMonthName = months[currentMonthIndex].name;

  // Calendar Days Calculation
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  const startOffset = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonthIndex, 1).getDay();
    // Adjust so week starts on Monday (Senin)
    return firstDay === 0 ? 6 : firstDay - 1;
  }, [currentYear, currentMonthIndex]);

  // Function to change months
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
    setSelectedDay(null);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
    setSelectedDay(null);
  };

  const setToday = () => {
    setCurrentDate(new Date()); // Actual today's date
    setSelectedDay(new Date().getDate());
  };

  // Highly robust helper to check if an event falls on a specific calendar day (handles single, range, and multi-month dates)
  const isEventOnDay = (event: TimelineEvent, day: number, monthIdx: number, year: number) => {
    const dr = event.date_range.toLowerCase();
    
    // Find all numbers in the date range string (ignoring any custom dash characters)
    const matchNumbers = dr.match(/\d+/g);
    if (!matchNumbers) return false;
    
    // Find all months mentioned in the string, maintaining appearance order
    const monthsFound: { index: number; name: string }[] = [];
    const indonesianMonths = [
      "januari", "februari", "maret", "april", "mei", "juni", 
      "juli", "agustus", "september", "oktober", "november", "desember"
    ];
    const englishMonths = [
      "january", "february", "march", "april", "may", "june", 
      "july", "august", "september", "october", "november", "december"
    ];
    
    indonesianMonths.forEach((m, idx) => {
      if (dr.includes(m)) monthsFound.push({ index: idx, name: m });
    });
    
    if (monthsFound.length === 0) {
      englishMonths.forEach((m, idx) => {
        if (dr.includes(m)) monthsFound.push({ index: idx, name: m });
      });
    }
    
    // Sort by order of appearance in the string
    monthsFound.sort((a, b) => dr.indexOf(a.name) - dr.indexOf(b.name));
    
    if (monthsFound.length === 0) return false;
    
    const currentCellDate = new Date(year, monthIdx, day);
    
    // Case 1: Multi-month range e.g. "29 Juni – 3 Juli 2026"
    if (monthsFound.length >= 2 && matchNumbers.length >= 2) {
      const startDay = parseInt(matchNumbers[0], 10);
      const startMonth = monthsFound[0].index;
      const endDay = parseInt(matchNumbers[1], 10);
      const endMonth = monthsFound[1].index;
      const eventYear = parseInt(matchNumbers[matchNumbers.length - 1], 10) || year;
      
      const startDate = new Date(eventYear, startMonth, startDay);
      const endDate = new Date(eventYear, endMonth, endDay);
      
      return currentCellDate >= startDate && currentCellDate <= endDate;
    }
    
    // Case 2: Single-month range e.g. "8 – 26 Juni 2026"
    if (monthsFound.length === 1 && matchNumbers.length >= 2) {
      const startDay = parseInt(matchNumbers[0], 10);
      const endDay = parseInt(matchNumbers[1], 10);
      const eventMonth = monthsFound[0].index;
      const eventYear = parseInt(matchNumbers[matchNumbers.length - 1], 10) || year;
      
      const startDate = new Date(eventYear, eventMonth, startDay);
      const endDate = new Date(eventYear, eventMonth, endDay);
      
      return currentCellDate >= startDate && currentCellDate <= endDate;
    }
    
    // Case 3: Single day e.g. "4 Juli 2026"
    if (monthsFound.length === 1 && matchNumbers.length === 2 && parseInt(matchNumbers[1], 10) >= 2000) {
      const eventDay = parseInt(matchNumbers[0], 10);
      const eventMonth = monthsFound[0].index;
      const eventYear = parseInt(matchNumbers[1], 10);
      
      const targetDate = new Date(eventYear, eventMonth, eventDay);
      return currentCellDate.getTime() === targetDate.getTime();
    }
    
    // Case 4: Spans entire month e.g. "Sep 2026"
    if (monthsFound.length === 1 && matchNumbers.length === 1 && parseInt(matchNumbers[0], 10) >= 2000) {
      const eventMonth = monthsFound[0].index;
      return monthIdx === eventMonth && year === parseInt(matchNumbers[0], 10);
    }
    
    // Fallback default simple match
    return monthIdx === monthsFound[0].index;
  };

  // Get events for the currently selected day
  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return events.filter(event => isEventOnDay(event, selectedDay, currentMonthIndex, currentYear));
  }, [selectedDay, currentMonthIndex, currentYear, events]);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Timeline</h1>
          <p className="mt-1 text-zinc-500 text-sm">Kelola fase kompetisi, jadwal pengerjaan WebGIS, dan acara mentoring.</p>
        </div>
        <div className="flex gap-2">
          {/* Tabs Toggles */}
          <div className="bg-zinc-100 p-1 rounded-xl flex gap-1 border border-zinc-200">
            <button 
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "list" 
                  ? "bg-white text-zinc-950 shadow-sm" 
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <List weight="bold" /> List View
            </button>
            <button 
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "calendar" 
                  ? "bg-white text-zinc-950 shadow-sm" 
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <CalendarBlank weight="bold" /> Calendar
            </button>
          </div>
          
          <Button 
            onClick={handleAddNewClick}
            className="bg-zinc-950 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-800 transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus weight="bold" /> Add Event
          </Button>
        </div>
      </div>

      {/* LIST VIEW TAB */}
      {activeTab === "list" && (() => {
        const listTotalPages = Math.max(1, Math.ceil(events.length / LIST_PAGE_SIZE));
        const listSafePage = Math.min(listPage, listTotalPages);
        const paginatedEvents = events.slice((listSafePage - 1) * LIST_PAGE_SIZE, listSafePage * LIST_PAGE_SIZE);

        return (
        <Card className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-400 font-semibold">
              Menampilkan <span className="text-zinc-900 font-bold">{(listSafePage - 1) * LIST_PAGE_SIZE + 1}–{Math.min(listSafePage * LIST_PAGE_SIZE, events.length)}</span> dari <span className="text-zinc-900 font-bold">{events.length}</span> fase
            </p>
            {listTotalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setListPage(p => Math.max(1, p - 1))} disabled={listSafePage <= 1}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">← Prev</button>
                {Array.from({ length: listTotalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setListPage(p)}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition cursor-pointer ${p === listSafePage ? "bg-zinc-950 text-white" : "bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50"}`}>{p}</button>
                ))}
                <button onClick={() => setListPage(p => Math.min(listTotalPages, p + 1))} disabled={listSafePage >= listTotalPages}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">Next →</button>
              </div>
            )}
          </div>
          <div className="space-y-0 relative before:absolute before:inset-y-2 before:left-[147px] before:w-[2px] before:bg-zinc-100">
            {paginatedEvents.map((event, index) => {
              let dotColor = "bg-zinc-300 ring-zinc-100";
              let cardBg = "bg-zinc-50 hover:bg-zinc-100/70";
              let cardBorder = "border-zinc-200";
              let badgeBg = "bg-zinc-100";
              let badgeText = "text-zinc-800";
              let badgeBorder = "border-zinc-200";

              if (event.type.toLowerCase().includes("announcement")) {
                dotColor = "bg-amber-500 ring-amber-100";
                cardBg = "bg-amber-50/40 hover:bg-amber-50/70";
                cardBorder = "border-amber-100";
                badgeBg = "bg-amber-100";
                badgeText = "text-amber-800";
                badgeBorder = "border-amber-200";
              } else if (event.type.toLowerCase().includes("mentoring") || event.type.toLowerCase().includes("technical")) {
                dotColor = "bg-indigo-500 ring-indigo-100";
                cardBg = "bg-indigo-50/40 hover:bg-indigo-50/70";
                cardBorder = "border-indigo-100";
                badgeBg = "bg-indigo-100";
                badgeText = "text-indigo-800";
                badgeBorder = "border-indigo-200";
              } else if (event.type.toLowerCase().includes("ai") || event.type.toLowerCase().includes("phase") || event.type.toLowerCase().includes("registration")) {
                dotColor = "bg-emerald-500 ring-emerald-100";
                cardBg = "bg-emerald-50/40 hover:bg-emerald-50/70";
                cardBorder = "border-emerald-100";
                badgeBg = "bg-emerald-100";
                badgeText = "text-emerald-800";
                badgeBorder = "border-emerald-200";
              }

              const isActivePhase = event.id === activeEventId;

              // Calculate associated tasks dynamically
              const assocTasks = getPhaseRelatedTasks(event.id, tasks);
              
              // Progress calculation
              const totalTasks = assocTasks.length;
              const completedTasks = assocTasks.filter(t => t.status === 'Done').length;
              const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div key={event.id} className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start pb-8 relative group">
                  {/* Date column */}
                  <div className="w-full sm:w-32 flex-shrink-0 text-sm font-semibold text-zinc-500 pt-1.5 flex sm:justify-end items-center sm:text-right gap-2 sm:gap-0">
                    <CalendarBlank className="sm:hidden text-zinc-400" />
                    {event.date_range}
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-[142px] top-2.5 hidden sm:flex items-center justify-center z-10">
                    <div className={`w-3.5 h-3.5 ${dotColor} rounded-full ring-4 transition-all duration-300 group-hover:scale-125 ${
                      isActivePhase ? "animate-pulse ring-indigo-200 bg-indigo-600" : ""
                    }`}></div>
                  </div>

                  {/* Event content card */}
                  <div className={`flex-1 border ${cardBorder} ${cardBg} rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md cursor-default relative overflow-hidden ${
                    isActivePhase ? "ring-2 ring-indigo-500/30 border-indigo-200" : ""
                  }`}>
                    {isActivePhase && (
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1.5 shadow-sm">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        Aktif
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-2 pr-12 sm:pr-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-zinc-900 text-base group-hover:text-zinc-950 transition-colors flex items-center gap-2">
                          {event.phase}
                          {isActivePhase && <Sparkle weight="fill" className="text-indigo-600 text-sm animate-pulse" />}
                        </h3>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditClick(event); }}
                          className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200 transition cursor-pointer font-bold"
                        >
                          Edit
                        </button>
                      </div>
                      <span className={`${badgeBg} ${badgeText} text-[10px] px-2.5 py-1 rounded-lg font-semibold border ${badgeBorder}`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed">{event.description}</p>
                    
                    {/* Progress details if it's the active phase */}
                    {isActivePhase && (
                      <div className="mt-4 pt-4 border-t border-indigo-100/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                            <span>Progress Pengerjaan Tahap Ini</span>
                            <span className="text-indigo-600">{progressPercentage}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200/70 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 mt-1 sm:mt-0 font-medium">
                          <Info size={16} className="flex-shrink-0" />
                          <span>
                            {totalTasks > 0 
                              ? `${completedTasks} dari ${totalTasks} task telah diselesaikan pada fase ini.` 
                              : "Belum ada task yang tersedia."}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Associated Tasks (Visual Task Gantt Chart) with show/hide toggle */}
                    {assocTasks.length > 0 && (() => {
                      // By default, non-active phases are collapsed unless explicitly toggled in collapsedPhases state
                      const isCollapsed = collapsedPhases[event.id] !== undefined
                        ? collapsedPhases[event.id]
                        : !isActivePhase;

                      const taskPage = phaseTaskPages[event.id] || 1;
                      const taskTotalPages = Math.ceil(assocTasks.length / PHASE_TASK_PAGE_SIZE);
                      const paginatedTasks = assocTasks.slice((taskPage - 1) * PHASE_TASK_PAGE_SIZE, taskPage * PHASE_TASK_PAGE_SIZE);

                      return (
                        <div className="mt-5 pt-4 border-t border-zinc-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-zinc-950 flex items-center gap-1.5">
                              <ClipboardText size={16} className="text-indigo-600 shrink-0" />
                              Daftar Tugas Fase
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-400 font-extrabold bg-zinc-150/40 border border-zinc-200 px-2 py-0.5 rounded-lg">
                                {completedTasks}/{totalTasks} Selesai
                              </span>
                              <Button
                                onClick={(e) => { e.stopPropagation(); togglePhaseTasks(event.id); }}
                                variant="outline"
                                className="h-6 px-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {isCollapsed ? "Tampilkan Tugas" : "Sembunyikan Tugas"}
                              </Button>
                            </div>
                          </div>

                          {!isCollapsed && (
                            <div className="space-y-3.5 bg-zinc-50/50 p-4 border border-zinc-200 rounded-2xl animate-[fadeIn_0.2s_ease-out]">
                              {paginatedTasks.map(task => {
                                const phaseRange = parseDateRangeStr(event.date_range);
                                const taskDate = parseTaskDeadlineStr(task.deadline);

                                let pct = 50;
                                if (phaseRange && taskDate) {
                                  const totalRange = phaseRange.end.getTime() - phaseRange.start.getTime();
                                  const relativeTime = taskDate.getTime() - phaseRange.start.getTime();
                                  if (totalRange > 0) {
                                    pct = Math.min(100, Math.max(5, (relativeTime / totalRange) * 100));
                                  }
                                }

                                let barColor = "bg-blue-500";
                                if (task.status === "Done") barColor = "bg-emerald-500";
                                else if (task.status === "Blocked") barColor = "bg-rose-500 animate-pulse";
                                else if (task.status === "Delayed") barColor = "bg-amber-500 animate-pulse";
                                else if (task.status === "Waiting Review") barColor = "bg-purple-500";

                                return (
                                  <div key={task.id} className="space-y-2">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between text-xs gap-2">
                                      <div className="min-w-0 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-450" />
                                        <span className="font-bold text-zinc-900 truncate" title={task.name}>{task.name}</span>
                                        <span className="text-[9px] font-extrabold text-zinc-400 uppercase font-mono">[{task.pic}]</span>
                                      </div>
                                      <div className="flex items-center gap-2 font-semibold self-start md:self-center shrink-0">
                                        <span className="text-[10px] text-zinc-400 bg-white border border-zinc-150 px-2 py-0.5 rounded-lg font-mono">
                                          📅 Deadline: {task.deadline}
                                        </span>
                                        <select
                                          value={task.status}
                                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value as Task["status"])}
                                          className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] tracking-wider shrink-0 border cursor-pointer appearance-none outline-none text-center ${
                                            task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            task.status === 'Blocked' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                            task.status === 'In Progress' ? 'bg-blue-50 text-blue-750 border-blue-100' :
                                            'bg-zinc-100 text-zinc-650 border-zinc-200'
                                          }`}
                                          style={{ textAlignLast: "center" }}
                                        >
                                          <option value="Not Started">Not Started</option>
                                          <option value="In Progress">In Progress</option>
                                          <option value="Waiting Review">Waiting Review</option>
                                          <option value="Blocked">Blocked</option>
                                          <option value="Done">Done</option>
                                          <option value="Delayed">Delayed</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* Progress percentage */}
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                                      <span className={`px-1.5 py-0.5 rounded ${
                                        task.status === 'Done' ? 'bg-emerald-50 text-emerald-700' :
                                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                                        task.status === 'Blocked' ? 'bg-rose-50 text-rose-700' :
                                        'bg-zinc-100 text-zinc-600'
                                      }`}>
                                        {task.status === 'Done' ? '100%' : task.status === 'In Progress' ? '50%' : task.status === 'Blocked' ? '0%' : '0%'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}

                              {taskTotalPages > 1 && (
                                <div className="flex items-center justify-between pt-3 border-t border-zinc-200 mt-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setPhaseTaskPages(prev => ({ ...prev, [event.id]: Math.max(1, taskPage - 1) })); }}
                                    disabled={taskPage <= 1}
                                    className="px-3 py-1 text-[10px] font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                  >
                                    ← Prev
                                  </button>
                                  <span className="text-[10px] font-semibold text-zinc-400">
                                    Hal <span className="text-zinc-700 font-bold">{taskPage}</span>/{taskTotalPages} · {assocTasks.length} tugas
                                  </span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setPhaseTaskPages(prev => ({ ...prev, [event.id]: Math.min(taskTotalPages, taskPage + 1) })); }}
                                    disabled={taskPage >= taskTotalPages}
                                    className="px-3 py-1 text-[10px] font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                  >
                                    Next →
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        );
      })()}

      {/* CALENDAR VIEW TAB */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          {/* Calendar/Gantt sub-tabs */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-1.5 shadow-sm flex gap-1 self-start">
            <button
              onClick={() => setCalendarMode("calendar")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                calendarMode === "calendar"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <CalendarBlank weight="bold" size={15} /> Calendar
            </button>
            <button
              onClick={() => setCalendarMode("gantt")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                calendarMode === "gantt"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <ChartBar weight="bold" size={15} /> Gantt Chart
            </button>
          </div>

          {calendarMode === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: The Main Calendar Grid */}
          <Card className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              {/* Calendar Month Header Selector */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-900">{currentMonthName} {currentYear}</h2>
                  <span className="text-xs bg-zinc-100 text-zinc-500 font-semibold px-2 py-0.5 rounded-full">
                    {events.length} Agenda
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    onClick={prevMonth}
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-zinc-600 border-zinc-200 hover:bg-zinc-50 cursor-pointer"
                  >
                    <CaretLeft size={16} />
                  </Button>
                  <Button 
                    onClick={setToday}
                    variant="outline"
                    className="h-8 text-xs font-semibold px-3 border-zinc-200 hover:bg-zinc-50 rounded-lg cursor-pointer"
                  >
                    Hari Ini
                  </Button>
                  <Button 
                    onClick={nextMonth}
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-zinc-600 border-zinc-200 hover:bg-zinc-50 cursor-pointer"
                  >
                    <CaretRight size={16} />
                  </Button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((dayName, idx) => (
                  <div key={idx} className="text-xs font-bold text-zinc-400 py-1.5 uppercase tracking-wider">
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 min-h-[300px]">
                {/* Empty Offset Cells */}
                {Array.from({ length: startOffset }).map((_, idx) => (
                  <div key={`offset-${idx}`} className="bg-zinc-50/50 rounded-xl border border-zinc-100/30 opacity-40 min-h-[70px]"></div>
                ))}

                {/* Days of Month Cells */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const isSelected = selectedDay === day;
                  
                  const todayDate = new Date();
                  const isToday = currentYear === todayDate.getFullYear() && currentMonthIndex === todayDate.getMonth() && day === todayDate.getDate();

                  // Find events occurring on this specific day
                  const dayEvents = events.filter(event => isEventOnDay(event, day, currentMonthIndex, currentYear));

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[70px] p-1.5 rounded-xl border flex flex-col justify-between items-stretch text-left transition-all duration-200 group relative cursor-pointer ${
                        isSelected 
                          ? "bg-zinc-950 border-zinc-950 text-white shadow-md shadow-zinc-300 scale-[1.02] z-10" 
                          : isToday 
                          ? "bg-indigo-50/40 border-indigo-300 text-zinc-900 shadow-sm"
                          : "bg-white border-zinc-150 text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300"
                      }`}
                    >
                      {/* Day Number */}
                      <div className="flex justify-between items-center w-full">
                        <span className={`text-xs font-bold ${
                          isSelected 
                            ? "text-white" 
                            : isToday 
                            ? "text-indigo-600 bg-indigo-100 w-5 h-5 flex items-center justify-center rounded-full text-[10px]" 
                            : "text-zinc-500 group-hover:text-zinc-800"
                        }`}>
                          {day}
                        </span>
                        {isToday && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        )}
                      </div>

                      {/* Event Indicators Stack */}
                      <div className="space-y-0.5 mt-1.5">
                        {dayEvents.map((event) => {
                          let badgeStyle = "bg-zinc-100 text-zinc-800 border-zinc-200";
                          if (event.type.toLowerCase().includes("announcement") || event.type.toLowerCase().includes("submission")) {
                            badgeStyle = isSelected ? "bg-amber-500/20 text-amber-200 border-amber-500/30" : "bg-amber-100 text-amber-800 border-amber-200";
                          } else if (event.type.toLowerCase().includes("mentoring") || event.type.toLowerCase().includes("technical")) {
                            badgeStyle = isSelected ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/30" : "bg-indigo-100 text-indigo-800 border-indigo-250";
                          } else if (event.type.toLowerCase().includes("ai") || event.type.toLowerCase().includes("phase") || event.type.toLowerCase().includes("registration")) {
                            badgeStyle = isSelected ? "bg-emerald-500/20 text-emerald-250 border-emerald-500/30" : "bg-emerald-100 text-emerald-800 border-emerald-200";
                          }
                          
                          // Short phase title to fit in calendar cell
                          const shortPhase = event.phase.split("—")[0].replace("Pembukaan ", "").replace("Technical ", "").replace("Pengumuman ", "").replace("Pengumpulan ", "");
                          
                          return (
                            <div 
                              key={event.id} 
                              className={`text-[9px] font-bold px-1 py-0.5 rounded border truncate transition-all duration-200 ${badgeStyle}`}
                              title={event.phase}
                            >
                              {shortPhase}
                            </div>
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Legend Indicators */}
            <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-wrap gap-4 text-xs font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Ingest, Reg & Phase
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Mentoring & Technical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Announcement & Submit
              </span>
            </div>
          </Card>

          {/* Right: Selected Day Event Detail Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="border-b border-zinc-100 pb-4 mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-950 text-base">Detail Agenda</h3>
                  {selectedDay !== null && (
                    <span className="text-xs bg-zinc-100 border border-zinc-200 font-bold px-3 py-1 rounded-xl text-zinc-950 shadow-sm">
                      {selectedDay} {currentMonthName} 2026
                    </span>
                  )}
                </div>

                {selectedDay === null ? (
                  <div className="py-12 text-center text-zinc-400 space-y-2">
                    <CalendarBlank size={32} className="mx-auto text-zinc-300" />
                    <p className="text-xs font-medium">Pilih tanggal pada kalender untuk melihat detail agenda.</p>
                  </div>
                ) : selectedDayEvents.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 space-y-2">
                    <Info size={32} className="mx-auto text-zinc-300" />
                    <p className="text-xs font-medium">Tidak ada agenda pengerjaan di tanggal ini.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {selectedDayEvents.map((event) => {
                      let badgeBg = "bg-zinc-100 text-zinc-800 border-zinc-200";
                      if (event.type.toLowerCase().includes("announcement") || event.type.toLowerCase().includes("submission")) {
                        badgeBg = "bg-amber-100 text-amber-800 border-amber-250";
                      } else if (event.type.toLowerCase().includes("mentoring") || event.type.toLowerCase().includes("technical")) {
                        badgeBg = "bg-indigo-100 text-indigo-800 border-indigo-250";
                      } else if (event.type.toLowerCase().includes("ai") || event.type.toLowerCase().includes("phase") || event.type.toLowerCase().includes("registration")) {
                        badgeBg = "bg-emerald-100 text-emerald-800 border-emerald-250";
                      }

                      const isCurrentPhase = event.id === activeEventId;

                      return (
                        <div 
                          key={event.id} 
                          className={`p-4 rounded-2xl border transition-all duration-300 ${
                            isCurrentPhase 
                              ? "bg-indigo-50/40 border-indigo-150 ring-2 ring-indigo-50/50" 
                              : "bg-zinc-50 border-zinc-150"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider ${badgeBg}`}>
                              {event.type}
                            </span>
                            {isCurrentPhase && (
                              <span className="text-[9px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                ● Aktif
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-zinc-900 text-sm">{event.phase}</h4>
                          <p className="text-[11px] font-semibold text-zinc-400 mt-1 flex items-center gap-1">
                            <CalendarBlank size={12} /> {event.date_range}
                          </p>
                          <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                            {event.description}
                          </p>

                          {/* Associated Tasks */}
                          {(() => {
                            const assocTasks = getPhaseRelatedTasks(event.id, tasks);
                            if (assocTasks.length === 0) return null;
                            
                            return (
                              <div className="mt-3 pt-3 border-t border-zinc-200/80 space-y-1.5">
                                <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                  <ClipboardText size={12} className="text-indigo-600" /> Workstream Tasks ({assocTasks.length})
                                </p>
                                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-0.5">
                                  {assocTasks.map(task => (
                                    <div key={task.id} className="p-2 bg-white border border-zinc-200 rounded-xl flex items-center justify-between text-[10px] hover:shadow-xs transition duration-200">
                                      <div className="truncate pr-1.5">
                                        <p className="font-bold text-zinc-900 truncate" title={task.name}>{task.name}</p>
                                        <p className="text-[9px] text-zinc-400 font-semibold">{task.pic} • {task.deadline}</p>
                                      </div>
                                      <select 
                                        value={task.status}
                                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value as Task["status"])}
                                        className={`px-1 py-1 rounded font-extrabold uppercase text-[8px] tracking-wider shrink-0 border cursor-pointer appearance-none outline-none text-center ${
                                          task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                          task.status === 'Blocked' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                          task.status === 'In Progress' ? 'bg-blue-50 text-blue-750 border-blue-100' :
                                          'bg-zinc-100 text-zinc-600 border-zinc-200'
                                        }`}
                                        style={{ textAlignLast: "center" }}
                                      >
                                        <option value="Not Started" className="bg-white text-zinc-800">Not Started</option>
                                        <option value="In Progress" className="bg-white text-blue-700">In Progress</option>
                                        <option value="Waiting Review" className="bg-white text-amber-600">Waiting Review</option>
                                        <option value="Blocked" className="bg-white text-rose-700">Blocked</option>
                                        <option value="Done" className="bg-white text-emerald-700">Done</option>
                                        <option value="Delayed" className="bg-white text-zinc-600">Delayed</option>
                                      </select>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-zinc-100 text-[11px] text-zinc-400 font-semibold flex items-center gap-2">
                <Info size={14} className="text-indigo-500" />
                <span>Simulasi timeline MAPID Catalyst kompetisi 2026.</span>
              </div>
            </Card>
          </div>
        </div>
          ) : (
            <GanttChart
              events={events}
              tasks={tasks}
              activeEventId={activeEventId}
              handleTaskStatusChange={handleTaskStatusChange}
            />
          )}
        </div>
      )}

      {/* Mock Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h3 className="font-bold text-lg text-zinc-900">{isEditing ? "Edit Agenda" : "Tambah Agenda Baru"}</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Nama Fase / Judul Agenda</label>
                <input 
                  type="text" 
                  value={editForm.phase || ""}
                  onChange={(e) => setEditForm({...editForm, phase: e.target.value})}
                  placeholder="Contoh: Fase 3: Integrasi Data WebGIS" 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tanggal Mulai <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formEndDate}
                    min={formStartDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Kosongkan jika satu hari</p>
                </div>
              </div>

              {formStartDate && (
                <p className="text-[11px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-1.5">
                  → {buildDateRange(formStartDate, formEndDate)}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tipe Agenda</label>
                <select
                  value={editForm.type || "Registration"}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white"
                >
                  <option value="Registration">Registration</option>
                  <option value="Phase Ingestion">Phase Ingestion</option>
                  <option value="Technical Meeting">Technical Meeting</option>
                  <option value="Field Mentoring">Field Mentoring</option>
                  <option value="AI Implementation">AI Implementation</option>
                  <option value="Submission">Submission</option>
                  <option value="Announcement">Announcement</option>
                  <option value="General Milestone">General Milestone</option>
                  <option value="Survey Phase">Survey Phase</option>
                  <option value="Development Phase">Development Phase</option>
                  <option value="Judging Phase">Judging Phase</option>
                  <option value="Main Event Ops">Main Event Ops</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Deskripsi Agenda</label>
                <textarea 
                  rows={3}
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Tuliskan detail pekerjaan atau agenda di sini..." 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white" 
                  required
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-3">
                {isEditing ? (
                  <Button 
                    type="button"
                    onClick={() => handleDelete(editForm.id as string)}
                    variant="ghost"
                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Hapus
                  </Button>
                ) : (
                  <div></div>
                )}
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    variant="outline"
                    className="px-4 py-2 border-zinc-200 rounded-xl text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Simpan Agenda
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Premium Loading Spinner Modal Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9999] flex items-center justify-center animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white/90 border border-zinc-100/80 shadow-2xl rounded-3xl p-6 flex flex-col items-center gap-4 max-w-[200px] text-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-zinc-900 border-r-zinc-900 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800">Menyimpan Data...</p>
              <p className="text-[9px] text-zinc-400 font-medium mt-0.5">Sinkronisasi Supabase</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
