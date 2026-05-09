// src/components/GrafikSiswaPerKelas.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { StatistikPerKelas } from "@/types";

interface GrafikSiswaPerKelasProps {
  items: StatistikPerKelas[];
}

// Green_900, Gold_500, Green_500 — dari palet
const TINGKAT_COLOR: Record<string, string> = {
  "4":   "#003C1C",
  "5":   "#FFC555",
  "6":   "#56C288",
  VII:   "#003C1C",
  VIII:  "#FFC555",
  IX:    "#56C288",
};

// Label nama tingkat untuk legenda
const TINGKAT_LABEL: Record<string, string> = {
  "4": "Kelas 4", "5": "Kelas 5", "6": "Kelas 6",
  VII: "Kelas VII", VIII: "Kelas VIII", IX: "Kelas IX",
};

export default function GrafikSiswaPerKelas({ items }: GrafikSiswaPerKelasProps) {
  const data = [...items].sort((a, b) => {
    const order: Record<string, number> = {
      "4": 0, "5": 1, "6": 2,
      VII: 0, VIII: 1, IX: 2,
    };
    const valA = order[a.tingkat] ?? parseInt(a.tingkat) ?? 99;
    const valB = order[b.tingkat] ?? parseInt(b.tingkat) ?? 99;
    if (valA !== valB) return valA - valB;
    return a.kelas.localeCompare(b.kelas);
  });

  const tingkatList = Array.from(new Set(data.map((d) => d.tingkat)));

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <PanelHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-400 text-sm">Belum ada data kelas</p>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.jumlah), 0);
  const yMax   = Math.ceil(maxVal / 5) * 5 + 5;

  return (
    <div className="h-full flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      <PanelHeader />

      {/* ── Legenda Tingkat ── */}
      <div className="flex items-center gap-4 px-5 pt-3 pb-1 flex-shrink-0">
        {tingkatList.map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: 8,
                height: 8,
                background: TINGKAT_COLOR[t] ?? "#56C288",
              }}
            />
            <span
              className="text-[11px] font-medium"
              style={{ color: TINGKAT_COLOR[t] ?? "#56C288" }}
            >
              {TINGKAT_LABEL[t] ?? `Kelas ${t}`}
            </span>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      <div className="flex-1 px-3 pb-4 pt-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 24, right: 10, left: -8, bottom: 4 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0efee"
            />
            <XAxis
              dataKey="kelas"
              tick={{ fontSize: 10, fill: "#a8a29e", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, yMax]}
              tick={{ fontSize: 10, fill: "#a8a29e", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "#f7f6f5" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as StatistikPerKelas;
                const color = TINGKAT_COLOR[d.tingkat] ?? "#56C288";
                return (
                  <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                      <p className="text-xs font-semibold" style={{ color }}>
                        {d.kelas}
                      </p>
                    </div>
                    <p className="text-stone-500 text-xs">
                      {d.jumlah} siswa
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="jumlah" radius={[4, 4, 0, 0]} maxBarSize={26}>
              <LabelList
                dataKey="jumlah"
                position="top"
                offset={6}
                style={{
                  fontSize: 10,
                  fill: "#57534e",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                }}
              />
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={TINGKAT_COLOR[entry.tingkat] ?? "#56C288"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PanelHeader() {
  return (
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-stone-100 flex-shrink-0">
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ width: 26, height: 26, background: "#F0FAF4" }}
      >
        <BarChart2 size={13} style={{ color: "#003C1C" }} />
      </div>
      <span
        className="font-semibold text-xs uppercase tracking-widest"
        style={{ color: "#003C1C" }}
      >
        Siswa per Kelas
      </span>
    </div>
  );
}