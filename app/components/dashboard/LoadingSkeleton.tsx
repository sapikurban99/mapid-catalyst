"use client";

export function LoadingSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9999] flex items-center justify-center animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white/90 border border-zinc-100/80 shadow-2xl rounded-3xl p-6 flex flex-col items-center gap-4 max-w-[200px] text-center">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-zinc-900 border-r-zinc-900 animate-spin" />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-800">Memuat Data...</p>
          <p className="text-[9px] text-zinc-400 font-medium mt-0.5">Membaca Supabase</p>
        </div>
      </div>
    </div>
  );
}
