// src/components/StatistikSiswa.tsx
"use client";

import { StatistikSiswa as StatistikSiswaType } from "@/types";

interface StatistikSiswaProps {
  items: StatistikSiswaType[];
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  blue:   { bg: "bg-blue-900/40",   border: "border-blue-500/40",   text: "text-blue-300",   glow: "shadow-blue-500/20" },
  green:  { bg: "bg-emerald-900/40", border: "border-emerald-500/40", text: "text-emerald-300", glow: "shadow-emerald-500/20" },
  yellow: { bg: "bg-amber-900/40",  border: "border-amber-500/40",  text: "text-amber-300",  glow: "shadow-amber-500/20" },
  purple: { bg: "bg-purple-900/40", border: "border-purple-500/40", text: "text-purple-300", glow: "shadow-purple-500/20" },
  red:    { bg: "bg-rose-900/40",   border: "border-rose-500/40",   text: "text-rose-300",   glow: "shadow-rose-500/20" },
  teal:   { bg: "bg-teal-900/40",   border: "border-teal-500/40",   text: "text-teal-300",   glow: "shadow-teal-500/20" },
};

export default function StatistikSiswa({ items }: StatistikSiswaProps) {
  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
        <p className="text-white/40 text-sm">Tambahkan data di tab StatistikSiswa</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-teal-700/60 px-4 py-2.5 flex items-center gap-2 border-b border-white/10">
        <span className="text-lg">📊</span>
        <span className="text-white font-bold text-sm tracking-wide uppercase">Data Siswa</span>
      </div>

      {/* Grid statistik */}
      <div className="flex-1 p-3 grid grid-cols-2 gap-2 overflow-hidden">
        {items.map((stat) => {
          const colors = COLOR_MAP[stat.warna] || COLOR_MAP["blue"];
          return (
            <div
              key={stat.id}
              className={`
                ${colors.bg} ${colors.border} ${colors.glow}
                border rounded-lg px-3 py-2.5 flex items-center gap-3
                shadow-lg transition-transform hover:scale-[1.02]
              `}
            >
              <span className="text-2xl flex-shrink-0">{stat.ikon}</span>
              <div className="min-w-0">
                <p className={`${colors.text} text-xl font-bold font-mono leading-tight`}>
                  {stat.nilai}
                </p>
                <p className="text-white/60 text-xs leading-tight truncate">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}