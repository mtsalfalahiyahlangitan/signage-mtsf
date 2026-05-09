// src/components/BottomTicker.tsx
"use client";

import { useMemo } from "react";
import { Megaphone } from "lucide-react";
import { RunningText } from "@/types";

interface BottomTickerProps {
  items: RunningText[];
}

export default function BottomTicker({ items }: BottomTickerProps) {
  const tickerText = useMemo(() => {
    if (items.length === 0) return "Selamat datang di Madrasah Digital Signage";
    return items.map((i) => i.teks).join("     •     ");
  }, [items]);

  return (
    <div
      className="relative flex-shrink-0 flex items-center overflow-hidden"
      style={{
        height: "40px",                // ← fixed height, proporsional dengan teks
        background: "#003C1C",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* ── Label ── */}
      <div
        className="flex-shrink-0 h-full flex items-center gap-2 px-4 z-20"
        style={{
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <Megaphone size={11} style={{ color: "#56C288" }} />
        <span
          className="font-bold uppercase whitespace-nowrap"
          style={{ color: "#56C288", fontSize: 10, letterSpacing: "0.14em" }}
        >
          Info
        </span>
      </div>

      {/* ── Ticker ── */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <style>{`
          @keyframes ticker-scroll {
            0%   { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
          .animate-ticker-tv {
            animation: ticker-scroll 18s linear infinite;
          }
        `}</style>

        <div
          className="animate-ticker-tv whitespace-nowrap absolute flex items-center"
          style={{ width: "max-content" }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {tickerText}
          </span>
        </div>
      </div>

      {/* ── Fade kanan ── */}
      <div
        className="absolute right-0 top-0 h-full pointer-events-none z-10"
        style={{
          width: 60,
          background: "linear-gradient(to left, #003C1C, transparent)",
        }}
      />
    </div>
  );
}