// src/components/CardListStats.tsx
"use client";

import { GraduationCap, BookOpen, Briefcase, LayoutGrid } from "lucide-react";
import { CardListData } from "@/types";

interface CardListStatsProps {
  data: CardListData;
}

const CARDS = [
  {
    key: "totalSiswa" as const,
    label: "Total Siswa",
    sublabel: "Aktif terdaftar",
    icon: GraduationCap,
    accent: "#003C1C",
    bar: "#003C1C",
    bg: "linear-gradient(135deg, #f0faf4 0%, #dcfce7 100%)",
    border: "#bbf7d0",
    iconBg: "#003C1C",
  },
  {
    key: "totalGuru" as const,
    label: "Guru",
    sublabel: "Tenaga pendidik",
    icon: BookOpen,
    accent: "#065f46",
    bar: "#10b981",
    bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    border: "#a7f3d0",
    iconBg: "#10b981",
  },
  {
    key: "totalStaf" as const,
    label: "Staf & Karyawan",
    sublabel: "Tenaga kependidikan",
    icon: Briefcase,
    accent: "#92400e",
    bar: "#f59e0b",
    bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    border: "#fde68a",
    iconBg: "#f59e0b",
  },
  {
    key: "totalRombel" as const,
    label: "Rombel Aktif",
    sublabel: "Kelas berjalan",
    icon: LayoutGrid,
    accent: "#1e3a8a",
    bar: "#3b82f6",
    bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    border: "#bfdbfe",
    iconBg: "#3b82f6",
  },
];

export default function CardListStats({ data }: CardListStatsProps) {
    if (!data) return null;
  return (
    <div className="w-full h-full grid grid-cols-4 gap-3">
      {CARDS.map(({ key, label, sublabel, icon: Icon, accent, bar, bg, border, iconBg }) => {
        const value = data[key];
        return (
          <div
            key={key}
            className="relative flex flex-col justify-between rounded-xl px-4 py-3 overflow-hidden"
            style={{
              background: bg,
              border: `1.5px solid ${border}`,
              boxShadow: `0 2px 8px 0 ${border}88`,
            }}
          >
            {/* Baris atas: Icon + Label */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  background: iconBg,
                  boxShadow: `0 2px 6px ${iconBg}55`,
                }}
              >
                <Icon size={13} color="#fff" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-semibold" style={{ color: accent }}>
                  {label}
                </span>
                <span className="text-[9px]" style={{ color: `${accent}88` }}>
                  {sublabel}
                </span>
              </div>
            </div>

            {/* Angka utama */}
            <p
              className="tabular-nums font-black leading-none tracking-tight mt-2"
              style={{ fontSize: 32, color: accent }}
            >
              {value.toLocaleString("id-ID")}
            </p>

            {/* Garis aksen bawah */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-b-xl"
              style={{ height: 3, background: `linear-gradient(90deg, ${bar}, transparent)` }}
            />
          </div>
        );
      })}
    </div>
  );
}