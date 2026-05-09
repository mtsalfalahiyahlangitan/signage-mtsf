// src/components/KalenderAkademik.tsx
"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { KalenderAkademik as KalenderAkademikType } from "@/types";

interface KalenderAkademikProps {
  items: KalenderAkademikType[];
}

function getDaysLeft(tanggal: string): number {
  const target = new Date(tanggal);
  const now    = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getColorByDays(days: number) {
  if (days <= 3)  return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", badge: "#ef4444" };
  if (days <= 7)  return { bg: "#fffbeb", border: "#fde68a", text: "#92400e", badge: "#f59e0b" };
  if (days <= 14) return { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a", badge: "#3b82f6" };
  return           { bg: "#f0faf4",  border: "#bbf7d0", text: "#003C1C",  badge: "#10b981" };
}

export default function KalenderAkademik({ items }: KalenderAkademikProps) {
  const [tick, setTick] = useState(0);

  // Refresh tiap menit agar countdown akurat
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Hanya tampilkan event yang belum lewat, urutkan terdekat dulu
  const upcoming = items
    .map(item => ({ ...item, daysLeft: getDaysLeft(item.tanggal) }))
    .filter(item => item.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5); // Menampilkan jumlah event nya

  return (
    <div
      className="h-full flex flex-col bg-white rounded-xl overflow-hidden"
      style={{ border: "1px solid #e7e5e4", boxShadow: "0 1px 4px 0 #0000000a" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid #f5f5f4" }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 22, height: 22, background: "#F0FAF4" }}
        >
          <CalendarDays size={11} style={{ color: "#003C1C" }} />
        </div>
        <span
          className="font-semibold text-[10px] uppercase tracking-widest"
          style={{ color: "#003C1C" }}
        >
          Kalender Akademik
        </span>
      </div>

      {/* Event list */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 px-3 py-1.5 min-h-0">
        {upcoming.length === 0 ? (
          <p className="text-xs text-stone-400 text-center">Tidak ada event mendatang</p>
        ) : (
          upcoming.map(item => {
            const colors = getColorByDays(item.daysLeft);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {/* Countdown badge */}
                <div
                  className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg"
                  style={{
                    width: 34,
                    height: 34,
                    background: colors.badge,
                  }}
                >
                  <span
                    className="tabular-nums font-black leading-none"
                    style={{ fontSize: 13, color: "#fff" }}
                  >
                    {item.daysLeft}
                  </span>
                  <span
                    className="leading-none font-medium"
                    style={{ fontSize: 7, color: "#ffffffcc" }}
                  >
                    hari
                  </span>
                </div>

                {/* Info event */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold leading-tight truncate"
                    style={{ fontSize: 11, color: colors.text }}
                  >
                    {item.nama_event}
                  </p>
                  <p
                    className="leading-none mt-0.5"
                    style={{ fontSize: 9, color: `${colors.text}88` }}
                  >
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}