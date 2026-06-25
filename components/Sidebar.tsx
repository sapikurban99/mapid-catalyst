"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  CalendarBlank,
  ListChecks,
  TreeStructure,
  Files,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const groups = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", href: "/", icon: SquaresFour },
        { name: "Timeline", href: "/timeline", icon: CalendarBlank },
      ],
    },
    {
      label: "Project",
      items: [
        { name: "Tasks", href: "/tasks", icon: ListChecks },
        { name: "Organization", href: "/org-structure", icon: TreeStructure },
        { name: "Documents", href: "/documents", icon: Files },
        { name: "Registrations", href: "/registrations", icon: UsersThree },
      ],
    },
  ];

  const handleNav = () => {
    if (window.innerWidth < 768) onClose();
  };

  const NavItem = ({
    href,
    icon: Icon,
    name,
  }: {
    href: string;
    icon: React.ElementType;
    name: string;
  }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={handleNav}
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors text-left font-medium",
          isActive
            ? "bg-zinc-100 text-zinc-950 font-bold"
            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
        )}
      >
        <Icon
          size={15}
          className={cn(isActive ? "text-zinc-900" : "text-zinc-400")}
          weight={isActive ? "bold" : "regular"}
        />
        {name}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "w-56 bg-white border-r border-zinc-200 flex flex-col h-full flex-shrink-0 z-40",
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:transition-transform max-md:duration-300 max-md:ease-in-out",
          "md:static md:translate-x-0",
          isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-12 flex items-center px-4 border-b border-zinc-200 flex-shrink-0 justify-between">
          <Link href="/" onClick={handleNav} className="flex items-center gap-2">
            <img
              src="https://mapid.co.id/img/mapid_logo_black.png"
              alt="MAPID Logo"
              className="h-4 w-auto object-contain"
            />
            <span className="text-[8px] font-bold tracking-wider uppercase bg-zinc-950 text-white px-1.5 py-0.5 rounded">
              Catalyst
            </span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 cursor-pointer"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 scrollbar-none">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2.5 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.name} {...item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-2.5 border-t border-zinc-100 flex-shrink-0">
          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-semibold tracking-wide">Live</p>
            </div>
            <p className="text-[9px] font-mono bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">
              {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
                "local"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
