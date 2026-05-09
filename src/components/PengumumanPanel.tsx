// src/components/PengumumanPanel.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Megaphone, CalendarDays, ChevronRight } from "lucide-react";
import { Pengumuman } from "@/types";

interface PengumumanPanelProps {
  items: Pengumuman[];
  intervalDetik?: number;
}

export default function PengumumanPanel({
  items,
  intervalDetik = 10,
}: PengumumanPanelProps) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % items.length);
      setFade(true);
    }, 300);
  }, [items.length]);

  // Jalankan timer selalu, termasuk 1 item (loop ke diri sendiri)
  useEffect(() => {
    if (items.length === 0) return;

    const durasi = (items[index]?.durasi_detik || intervalDetik) * 1000;

    timerRef.current = setTimeout(goNext, durasi);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, items, intervalDetik, goNext]);

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <PanelHeader count={0} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-400 text-sm">Tidak ada pengumuman aktif</p>
        </div>
      </div>
    );
  }

  const item = items[index];
  const durasi = item.durasi_detik || intervalDetik;

  return (
    <div className="h-full flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      <PanelHeader count={items.length} />

      {/* Konten */}
      <div
        className="flex-1 flex flex-col px-4 py-3 min-h-0"
        style={{
          opacity: fade ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
          <CalendarDays size={11} className="text-stone-400 flex-shrink-0" />
          <span className="text-stone-400 text-[11px] font-mono">{item.tanggal}</span>
        </div>

        <div className="flex items-start gap-2">
          <ChevronRight size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#003C1C" }} />
          <div className="min-w-0">
            <h3
              className="font-semibold text-sm leading-snug line-clamp-2 mb-1.5"
              style={{ color: "#003C1C" }}
            >
              {item.judul}
            </h3>
            <p className="text-stone-500 text-xs leading-relaxed line-clamp-4">
              {item.isi_pengumuman}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: dots + progress bar */}
      <div className="flex-shrink-0 px-4 pb-3">
        {/* Dots — hanya tampil jika lebih dari 1 */}
        {items.length > 1 && (
          <div className="flex items-center gap-1.5 mb-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (timerRef.current) clearTimeout(timerRef.current);
                  setFade(false);
                  setTimeout(() => {
                    setIndex(i);
                    setFade(true);
                  }, 300);
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === index ? 16 : 6,
                  height:     6,
                  background: i === index ? "#003C1C" : "#e7e5e4",
                }}
              />
            ))}
          </div>
        )}

        {/* Progress bar — selalu tampil, reset tiap ganti item */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 2, background: "#f0efee" }}
        >
          <div
            key={`${index}-${durasi}`}
            className="h-full rounded-full"
            style={{
              background: "#56C288",
              animation: `progress-fill ${durasi}s linear forwards`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function PanelHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 26, height: 26, background: "#F0FAF4" }}
        >
          <Megaphone size={13} style={{ color: "#003C1C" }} />
        </div>
        <span className="font-semibold text-xs uppercase tracking-widest" style={{ color: "#003C1C" }}>
          Pengumuman
        </span>
      </div>
      {count > 0 && (
        <span className="text-stone-400 text-xs font-mono">{count} item</span>
      )}
    </div>
  );
}