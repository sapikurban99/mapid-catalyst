"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Lock, Eye, EyeSlash } from "@phosphor-icons/react";

const CORRECT_PASSWORD = "CATALYST2026";
const STORAGE_KEY = "catalyst_auth_verified";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsAuthenticated(stored === "true");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  // Still loading from localStorage
  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-[9999]">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className={`relative bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-sm w-full mx-4 shadow-2xl ${shaking ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <ShieldCheck size={32} className="text-white/80" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">MAPID Catalyst 2026</h1>
          <p className="text-[11px] text-white/40 font-semibold mt-1.5">Operating System Dashboard</p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Access Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Enter general password..."
                autoFocus
                className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-12 text-sm text-white font-semibold placeholder:text-white/20 focus:outline-none focus:ring-2 transition-all ${
                  error 
                    ? "border-rose-500/60 focus:ring-rose-500/30" 
                    : "border-white/10 focus:ring-white/20 focus:border-white/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 font-semibold animate-[fadeIn_0.2s_ease-in-out]">
                ⚠️ Password salah. Silakan coba lagi.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-white text-zinc-950 py-3 rounded-xl text-xs font-bold hover:bg-white/90 transition-all active:scale-[0.98] cursor-pointer"
          >
            Masuk ke Dashboard
          </button>
        </form>

        <p className="text-center text-[10px] text-white/20 font-semibold mt-6">
          Hubungi Program Manager jika lupa password akses.
        </p>
      </div>

      {/* Shake animation keyframes */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
