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
  FileText,
  CaretDown,
  CaretRight,
  X
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [docHubOpen, setDocHubOpen] = useState(false);

  const mainNavItems = [
    { name: "Dashboard", href: "/", icon: SquaresFour },
    { name: "Timeline", href: "/timeline", icon: CalendarBlank },
    { name: "Tasks", href: "/tasks", icon: ListChecks },
    { name: "Organization", href: "/org-structure", icon: TreeStructure },
  ];

  const docHubItems = [
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

  const isDocHubActive = docHubItems.some(item => pathname === item.href);

  const handleNav = () => {
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 bg-white border-r border-zinc-200 flex flex-col h-full flex-shrink-0 z-40",
        // Mobile: fixed overlay with slide animation
        "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:transition-transform max-md:duration-300 max-md:ease-in-out",
        // Desktop: static in flow
        "md:static md:translate-x-0",
        // Slide state on mobile
        isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
      )}>
        {/* Header Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 flex-shrink-0 justify-between">
          <Link href="/" onClick={handleNav} className="flex items-center gap-2">
            <img 
              src="https://mapid.co.id/img/mapid_logo_black.png" 
              alt="MAPID Logo" 
              className="h-6 w-auto object-contain" 
            />
            <span className="text-[9px] font-semibold tracking-wider uppercase bg-zinc-950 text-white px-2 py-0.5 rounded-md">
              Catalyst
            </span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Navigation List (Scrollable) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-zinc-200">
          {/* Main Navigation */}
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNav}
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

          {/* Document Hub Section */}
          <div className="pt-2">
            <button
              onClick={() => setDocHubOpen(!docHubOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors text-left font-medium",
                isDocHubActive
                  ? "bg-zinc-100 text-zinc-950 font-bold"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <Files className={cn("text-base", isDocHubActive ? "text-zinc-900" : "text-zinc-500")} weight={isDocHubActive ? "bold" : "regular"} />
              <span className="flex-1">Document Hub</span>
              {docHubOpen ? (
                <CaretDown className="text-zinc-400" weight="bold" />
              ) : (
                <CaretRight className="text-zinc-400" weight="bold" />
              )}
            </button>

            {docHubOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-zinc-100 pl-3">
                {docHubItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleNav}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors text-left font-medium",
                        isActive
                          ? "bg-zinc-100 text-zinc-950 font-bold"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      )}
                    >
                      <Icon className={cn("text-sm", isActive ? "text-zinc-900" : "text-zinc-400")} weight={isActive ? "bold" : "regular"} /> 
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
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
    </>
  );
}
