// src/components/WargaMadrasah.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users, GraduationCap, BookOpen } from "lucide-react";

interface WargaMadrasahProps {
  totalSiswa: number;
  totalGuru: number;
}

const PIE_COLORS = ["#003C1C", "#56C288"];

export default function WargaMadrasah({ totalSiswa, totalGuru }: WargaMadrasahProps) {
  const total = totalSiswa + totalGuru;

  const pieData = [
    { name: "Siswa", value: totalSiswa },
    { name: "Guru & Staf", value: totalGuru },
  ];

  return (
    <div
      className="h-full flex flex-col rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #f0faf4 0%, #dcfce7 100%)",
        border: "1.5px solid #bbf7d0",
        boxShadow: "0 2px 8px 0 #bbf7d088",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid #bbf7d0" }}
      >
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 22, height: 22, background: "#003C1C" }}
        >
          <Users size={11} color="#fff" />
        </div>
        <span
          className="font-semibold text-[10px] uppercase tracking-widest"
          style={{ color: "#003C1C" }}
        >
          Warga Madrasah
        </span>
      </div>

      {/* Body: chart kiri, legend kanan */}
      <div className="flex-1 flex flex-row items-center gap-2 px-3 py-2 min-h-0 overflow-hidden">

        {/* Pie chart dengan posisi relative untuk label tengah */}
        <div className="relative flex-shrink-0" style={{ width: "55%", aspectRatio: "1/1", maxHeight: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius="42%"
                outerRadius="58%"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={2}
                stroke="#f0faf4"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Angka total di tengah donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="tabular-nums font-black leading-none"
              style={{ fontSize: 18, color: "#003C1C" }}
            >
              {total.toLocaleString("id-ID")}
            </span>
            <span
              className="font-medium leading-none mt-0.5"
              style={{ fontSize: 8, color: "#003C1C99" }}
            >
              total
            </span>
          </div>
        </div>

        {/* Legend kanan */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Siswa */}
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            style={{ background: "#003C1C14" }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-md"
              style={{ width: 24, height: 24, background: "#003C1C" }}
            >
              <GraduationCap size={12} color="#fff" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] leading-none" style={{ color: "#003C1C88" }}>
                Siswa
              </p>
              <p
                className="tabular-nums font-bold leading-none mt-0.5 truncate"
                style={{ fontSize: 16, color: "#003C1C" }}
              >
                {totalSiswa.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Guru & Staf */}
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            style={{ background: "#56C28814" }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-md"
              style={{ width: 24, height: 24, background: "#56C288" }}
            >
              <BookOpen size={12} color="#fff" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] leading-none" style={{ color: "#065f4688" }}>
                Guru & Staf
              </p>
              <p
                className="tabular-nums font-bold leading-none mt-0.5 truncate"
                style={{ fontSize: 16, color: "#065f46" }}
              >
                {totalGuru.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}