"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  SquaresFour, 
  CalendarBlank, 
  ListChecks, 
  TreeStructure,
  Files, 
  Users, 
  Database, 
  MapPin, 
  GraduationCap, 
  Trophy, 
  Handshake, 
  Image as ImageIcon, 
  Building, 
  WarningCircle, 
  FileText
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: SquaresFour },
    { name: "Timeline", href: "/timeline", icon: CalendarBlank },
    { name: "Tasks", href: "/tasks", icon: ListChecks },
    { name: "Org Structure", href: "/org-structure", icon: TreeStructure },
    { name: "Documents", href: "/documents", icon: Files },
    { name: "Participants / CRM", href: "/participants", icon: Users },
    { name: "Dataset Tracker", href: "/dataset", icon: Database },
    { name: "Survey Activities", href: "/survey", icon: MapPin },
    { name: "Mentoring Tracker", href: "/mentoring", icon: GraduationCap },
    { name: "Judging & Scoring", href: "/judging", icon: Trophy },
    { name: "Sponsors & Partners", href: "/sponsors", icon: Handshake },
    { name: "Visual Assets", href: "/assets-tracker", icon: ImageIcon },
    { name: "Main Event Ops", href: "/event-ops", icon: Building },
    { name: "Risk Register", href: "/risks", icon: WarningCircle },
    { name: "Meeting Notes", href: "/meeting-notes", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col h-full flex-shrink-0 z-10">
      {/* Header Logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="https://mapid.co.id/img/mapid_logo_black.png" 
            alt="MAPID Logo" 
            className="h-6 w-auto object-contain" 
          />
          <span className="text-[9px] font-semibold tracking-wider uppercase bg-zinc-950 text-white px-2 py-0.5 rounded-md">
            Catalyst
          </span>
        </Link>
      </div>

      {/* Navigation List (Scrollable) */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-zinc-200">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors text-left font-medium",
                isActive
                  ? "bg-zinc-100 text-zinc-950 font-bold"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <Icon className={cn("text-base", isActive ? "text-zinc-900" : "text-zinc-500")} weight={isActive ? "bold" : "regular"} /> 
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Version */}
      <div className="p-4 border-t border-zinc-200 flex-shrink-0 bg-zinc-50/50">
        <div className="flex items-center justify-between px-2 text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-medium tracking-wide">WEB VERSION</p>
          </div>
          <p className="text-[10px] font-mono bg-zinc-200/50 text-zinc-600 px-1.5 py-0.5 rounded">
            {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local-dev"}
          </p>
        </div>
      </div>
    </aside>
  );
}
