// src/app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import HeaderSignage from "@/components/HeaderSignage";
import MainContent from "@/components/MainContent";
import BottomTicker from "@/components/BottomTicker";
import SidePanelKanan from "@/components/SidePanelKanan";
import { SignageData } from "@/types";

const POLLING_INTERVAL = 30 * 1000;

const DEFAULT_DATA: SignageData = {
  infografis: [],
  pengumuman: [],
  runningText: [{ id: "0", teks: "Memuat data...", status: "Aktif" }],
  statistikSiswa: [],
  statistikPerKelas: [],
  jadwalHarian: [],
  konfigurasi: {
    longitude:          112.174,
    latitude:           -7.098,
    kodeWilayah:        "1628",
    koreksiHijriyah:    0,
    namaMadrasah:       "Madrasah Tsanawiyah Al Falahiyah",
    tagline:            "Al Muhafadlotu Ala Qodiimis Sholih, wal Akhdzu bil Jadidil Ashlah",
    intervalPengumuman: 10,
    ihtiyatSubuh:   3,
    ihtiyatSyuruq:  -2,
    ihtiyatAshar:   3,
    ihtiyatMaghrib: 3,
    ihtiyatIsya:    3,
    sudutSubuh:     19.8,
    sudutIsya:      17.8,
  },
  cardList: {
    totalSiswa:  0,
    totalGuru:   0,
    totalStaf:   0,
    totalRombel: 0,
  },
  kalenderAkademik: [],
};

export default function SignagePage() {
  const [data, setData] = useState<SignageData>(DEFAULT_DATA);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/sheets", { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch error");
      const json: SignageData = await res.json();
      if (!json.cardList) throw new Error("Data tidak lengkap");
      setData(json);
      setLastUpdate(new Date());
      setIsOnline(true);
      try {
        localStorage.setItem("signage_cache", JSON.stringify(json));
      } catch {}
    } catch {
      setIsOnline(false);
      try {
        const cached = localStorage.getItem("signage_cache");
        if (cached) setData(JSON.parse(cached));
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Reload otomatis setiap 5 menit
  useEffect(() => {
    const id = setInterval(() => window.location.reload(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-dismiss overlay setelah 8 detik jika tidak ada interaksi
  useEffect(() => {
    if (!showOverlay) return;
    const id = setTimeout(() => setShowOverlay(false), 8000);
    return () => clearTimeout(id);
  }, [showOverlay]);

  const handleLaunch = useCallback(() => {
    // Coba fullscreen, tapi tidak masalah jika gagal (webOS)
    try {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
      };
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    } catch {}
    setShowOverlay(false);
  }, []);

  return (
    <div className="w-screen h-screen bg-stone-50 flex flex-col overflow-hidden">
      <HeaderSignage
        konfigurasi={data.konfigurasi}
        isOnline={isOnline}
        lastUpdate={lastUpdate}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <MainContent
            infografis={data.infografis}
            pengumuman={data.pengumuman}
            statistikPerKelas={data.statistikPerKelas}
            cardList={data.cardList}
            kalenderAkademik={data.kalenderAkademik}
            kodeWilayah={data.konfigurasi.kodeWilayah}
            intervalPengumuman={data.konfigurasi.intervalPengumuman}
          />
        </div>

        <SidePanelKanan
          jadwalHarian={data.jadwalHarian}
          konfigurasi={data.konfigurasi}
        />
      </div>

      <BottomTicker items={data.runningText} />

      {/* Overlay — hilang setelah tap atau 8 detik */}
      {showOverlay && (
        <div
          onClick={handleLaunch}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 60, 28, 0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            cursor: "pointer",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" style={{ width: 80, opacity: 0.95 }} />
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 }}>
            Madrasah Digital Signage
          </h1>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 13, margin: 0 }}>
            Tap di mana saja untuk memulai
          </p>

          <div
            style={{
              marginTop: 8,
              padding: "12px 36px",
              background: "#56C288",
              color: "#003C1C",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 10,
            }}
          >
            Mulai Tampilan
          </div>

          {/* Progress bar auto-dismiss */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 3,
              background: "#56C288",
              animation: "shrink 8s linear forwards",
              width: "100%",
            }}
          />
          <style>{`
            @keyframes shrink {
              from { width: 100%; }
              to   { width: 0%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}