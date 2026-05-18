import { Palette, Sparkle, WarningCircle, Megaphone, Stack, PresentationChart, CheckCircle, Circle } from "@phosphor-icons/react/dist/ssr";

export default function AssetsPage() {
  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Visual Assets & Brief</h1>
          <p className="mt-1 text-zinc-500 text-sm">Design direction and required assets tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5">
          <Palette className="text-xl text-zinc-700 mb-3 block" />
          <h3 className="font-semibold text-sm mb-2">Main Visual Direction</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Minimal, spatial, community-driven, data-oriented, youthful, credible. AI should feel subtle.</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-5">
          <Sparkle className="text-xl text-zinc-700 mb-3 block" />
          <h3 className="font-semibold text-sm mb-2">Main Message</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">From community data and survey activities into AI-powered WebGIS that presents meaningful spatial insight.</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 border-red-100 bg-red-50/30">
          <WarningCircle className="text-xl text-red-600 mb-3 block" />
          <h3 className="font-semibold text-sm mb-2 text-red-900">Avoid</h3>
          <p className="text-xs text-red-700/80 leading-relaxed">Robots, glowing brains, cyberpunk neon, over-futuristic AI visuals, and overly crowded map designs.</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Asset Requirements List</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-zinc-100 pb-2">
              <Megaphone className="text-zinc-500" />
              <h3 className="font-medium text-sm">P0 — Launch Assets</h3>
            </div>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2"><CheckCircle weight="fill" className="text-emerald-500" /> Main Key Visual</li>
              <li className="flex items-center gap-2"><Circle className="text-zinc-300" /> Launching Poster</li>
              <li className="flex items-center gap-2"><Circle className="text-zinc-300" /> Landing Page Hero</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-zinc-100 pb-2">
              <Stack className="text-zinc-500" />
              <h3 className="font-medium text-sm">P1 — Education</h3>
            </div>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2"><Circle className="text-zinc-300" /> Carousel Explainer</li>
              <li className="flex items-center gap-2"><Circle className="text-zinc-300" /> Benefit Poster</li>
              <li className="flex items-center gap-2"><Circle className="text-zinc-300" /> Pillar Theme Visual</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-zinc-100 pb-2">
              <PresentationChart className="text-zinc-500" />
              <h3 className="font-medium text-sm">P2 — Event & Sponsor</h3>
            </div>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2"><Circle className="text-zinc-300" /> Sponsor Deck Visual</li>
              <li className="flex items-center gap-2"><Circle className="text-zinc-300" /> Certificate Templates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
