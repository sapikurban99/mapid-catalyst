"use client";

import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import Sidebar from "@/components/Sidebar";
import { List } from "@phosphor-icons/react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGate>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto h-full relative">
        {/* Mobile header bar */}
        <div className="md:hidden sticky top-0 z-20 bg-bgbase border-b border-zinc-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-200/50 text-zinc-600 cursor-pointer"
          >
            <List size={22} weight="bold" />
          </button>
          <div className="flex items-center gap-2">
            <img 
              src="https://mapid.co.id/img/mapid_logo_black.png" 
              alt="MAPID" 
              className="h-5 w-auto object-contain" 
            />
            <span className="text-[8px] font-semibold tracking-wider uppercase bg-zinc-950 text-white px-2 py-0.5 rounded-md">
              Catalyst
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 relative min-h-[calc(100vh-4rem)] md:min-h-screen">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #111 1px, transparent 0)", backgroundSize: "26px 26px" }}></div>
          <div className="max-w-5xl mx-auto relative z-0">
            {children}
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
