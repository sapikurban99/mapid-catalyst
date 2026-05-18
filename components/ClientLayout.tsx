"use client";

import AuthGate from "@/components/AuthGate";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-full p-8 relative">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #111 1px, transparent 0)", backgroundSize: "26px 26px" }}></div>
        <div className="max-w-5xl mx-auto relative z-0">
          {children}
        </div>
      </main>
    </AuthGate>
  );
}
