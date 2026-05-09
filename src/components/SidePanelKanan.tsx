"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Moon } from "lucide-react";
import { JadwalHarian, Konfigurasi } from "@/types";
import { useJamIstiwa } from "@/hooks/useJamIstiwa";

interface SidePanelKananProps {
  jadwalHarian: JadwalHarian[];
  konfigurasi: Konfigurasi;
}

function toMinutes(hhmm: string): number {
  if (!hhmm) return 0;
  const parts = hhmm.replace(/\s/g, "").split(/[:.]/);
  return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
}

function menitKeJam(menit: number): string {
  const total = ((menit % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  return `${String(h).padStart(2, "0")}:${String(m === 60 ? 0 : m).padStart(2, "0")}`;
}

interface WaktuSholat {
  label: string;
  jam: string;
  menit: number;
}

const SHOLAT_KEYS = [
  { key: "subuh",   label: "Subuh"   },
  { key: "syuruq",  label: "Syuruq"  },
  { key: "dzuhur",  label: "Dzuhur"  },
  { key: "ashar",   label: "Ashar"   },
  { key: "maghrib", label: "Maghrib" },
  { key: "isya",    label: "Isya"    },
] as const;

export default function SidePanelKanan({ jadwalHarian, konfigurasi }: SidePanelKananProps) {
  const { jamIstiwa, jamWib } = useJamIstiwa({
    longitude: konfigurasi.longitude,
    koreksiHijriyah: konfigurasi.koreksiHijriyah,
  });

  const [waktuSholat, setWaktuSholat] = useState<WaktuSholat[]>([]);
  const [loadingSholat, setLoadingSholat] = useState(true);
  const [nowMin, setNowMin] = useState(0);

  // Selisih istiwa' - WIB dalam menit (bisa negatif atau positif)
  const selisihMenit = (() => {
    if (!jamIstiwa || !jamWib) return 0;
    return toMinutes(jamIstiwa) - toMinutes(jamWib);
  })();

  // Fetch dari API myquran
  useEffect(() => {
    async function fetchSholat() {
      if (!konfigurasi.kodeWilayah) return;
      try {
        const now = new Date();
        const tgl = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
        const res = await fetch(
          `https://api.myquran.com/v2/sholat/jadwal/${konfigurasi.kodeWilayah}/${tgl}`
        );
        const json = await res.json();
        const jadwal = json?.data?.jadwal;
        if (jadwal) {
          const hasil: WaktuSholat[] = SHOLAT_KEYS
            .filter(s => jadwal[s.key])
            .map(s => ({
              label: s.label,
              jam:   jadwal[s.key],       // WIB asli, disimpan tapi tidak ditampilkan
              menit: toMinutes(jadwal[s.key]),  // menit WIB, untuk logika highlight
            }));
          setWaktuSholat(hasil);
        }
      } catch (error) {
        console.error("Fetch sholat error:", error);
      } finally {
        setLoadingSholat(false);
      }
    }
    fetchSholat();
  }, [konfigurasi.kodeWilayah]);

  // Update nowMin (WIB) tiap menit — konsisten dengan menit WIB di waktuSholat
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setNowMin(now.getHours() * 60 + now.getMinutes());
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  // Aktif = waktu sholat terakhir yang sudah dilewati (WIB vs WIB)
  const activeIdx = (() => {
    let last = -1;
    for (let i = 0; i < waktuSholat.length; i++) {
      if (nowMin >= waktuSholat[i].menit) last = i;
      else break;
    }
    return last;
  })();

  // currentMin untuk jadwal harian — pakai jam istiwa' karena jadwal harian dalam istiwa'
  const currentMin = toMinutes(jamIstiwa ?? "");

  const jadwalAktif = jadwalHarian.filter(j => j.status === "Aktif");

  return (
    <div className="h-full py-4 pr-4 pl-0 flex-shrink-0">
      <aside
        className="h-full flex flex-col bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden"
        style={{ width: "280px" }}
      >

        {/* ── WAKTU SHALAT ── */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 24, height: 24, background: "#F0FAF4" }}
            >
              <Moon size={12} style={{ color: "#003C1C" }} />
            </div>
            <span
              className="font-semibold text-xs uppercase tracking-widest"
              style={{ color: "#003C1C" }}
            >
              Waktu Shalat
            </span>
          </div>

          <div className="flex flex-col gap-0.5 px-3 py-2">
            {loadingSholat ? (
              <p className="text-xs text-stone-400 text-center py-2">Memuat...</p>
            ) : waktuSholat.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-2">Gagal memuat</p>
            ) : (
              waktuSholat.map((w, idx) => {
                const isActive = idx === activeIdx;
                const isPast   = idx < activeIdx;
                // Tampilkan dalam jam istiwa' = menit WIB + selisih
                const jamIstiwaStr = menitKeJam(w.menit + selisihMenit);
                return (
                  <div
                    key={w.label}
                    className="flex items-center justify-between px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: isActive ? "#003C1C" : "transparent",
                      borderLeft: isActive ? "3px solid #56C288" : "3px solid transparent",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <div
                          className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                          style={{ background: "#56C288" }}
                        />
                      )}
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: isActive ? "#86efac" : isPast ? "#c4c0bb" : "#44403c",
                        }}
                      >
                        {w.label}
                      </span>
                    </div>
                    <span
                      className="tabular-nums font-bold text-xs"
                      style={{
                        color: isActive ? "#fff" : isPast ? "#c4c0bb" : "#003C1C",
                      }}
                    >
                      {jamIstiwaStr}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── JADWAL HARIAN ── */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-b border-stone-100 flex-shrink-0">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 24, height: 24, background: "#F0FAF4" }}
          >
            <CalendarDays size={12} style={{ color: "#003C1C" }} />
          </div>
          <span
            className="font-semibold text-xs uppercase tracking-widest"
            style={{ color: "#003C1C" }}
          >
            Jadwal Hari Ini
          </span>
        </div>

        <div className="flex-1 flex flex-col px-4 py-3 min-h-0 overflow-hidden">
          <div className="flex flex-col gap-1 overflow-y-auto">
            {jadwalAktif.length === 0 ? (
              <p className="text-stone-400 text-xs italic px-1 mt-2">Belum ada jadwal</p>
            ) : (
              jadwalAktif.map(item => {
                const mulai    = toMinutes(item.jam_mulai);
                const selesai  = toMinutes(item.jam_selesai);
                const isActive = currentMin >= mulai && currentMin < selesai;
                const isPast   = currentMin >= selesai;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-500"
                    style={{
                      background: isActive ? "#003C1C" : "transparent",
                      borderLeft: isActive ? "3px solid #56C288" : "3px solid transparent",
                    }}
                  >
                    <div className="flex flex-col items-end flex-shrink-0 w-[36px]">
                      <span
                        className="font-mono leading-none"
                        style={{
                          fontSize: 10,
                          fontWeight: isActive ? 700 : 400,
                          color: isActive ? "#56C288" : isPast ? "#c4c0bb" : "#78716c",
                        }}
                      >
                        {item.jam_mulai}
                      </span>
                      <div
                        className="w-px my-0.5"
                        style={{
                          height: 8,
                          background: isActive ? "rgba(86,194,136,0.4)" : isPast ? "#e7e5e4" : "#d6d3d1",
                        }}
                      />
                      <span
                        className="font-mono leading-none"
                        style={{
                          fontSize: 10,
                          color: isActive ? "rgba(86,194,136,0.65)" : isPast ? "#c4c0bb" : "#a8a29e",
                        }}
                      >
                        {item.jam_selesai}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold leading-tight truncate"
                        style={{
                          color: isActive ? "#fff" : isPast ? "#c4c0bb" : "#292524",
                        }}
                      >
                        {item.label}
                      </p>
                      {item.mata_pelajaran && (
                        <p
                          className="text-[10px] mt-0.5 truncate"
                          style={{
                            color: isActive ? "rgba(86,194,136,0.75)" : isPast ? "#d6d3d1" : "#a8a29e",
                          }}
                        >
                          {item.mata_pelajaran}
                        </p>
                      )}
                    </div>

                    {isActive && (
                      <div
                        className="flex-shrink-0 w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: "#56C288" }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </aside>
    </div>
  );
}