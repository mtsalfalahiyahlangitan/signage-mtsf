// src/components/HeaderSignage.tsx
"use client";

import { useJamIstiwa } from "@/hooks/useJamIstiwa";
import { Konfigurasi } from "@/types";
import { Wifi } from "lucide-react";
import Image from "next/image";

interface HeaderSignageProps {
  konfigurasi: Konfigurasi;
  isOnline?: boolean;
  lastUpdate?: Date | null;
}

export default function HeaderSignage({
  konfigurasi,
  isOnline = true,
  lastUpdate,
}: HeaderSignageProps) {
  const { jamIstiwa, jamWib, tanggalMasehi, tanggalHijriyah } = useJamIstiwa({
    longitude: konfigurasi.longitude,
    koreksiHijriyah: konfigurasi.koreksiHijriyah,
  });

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-7"
      style={{
        height: "11vh",
        minHeight: "60px",
        background: "#003C1C",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* ── Kiri: Logo + Nama ── */}
      <div className="flex items-center gap-3">
        {/* Logo tanpa border, transparan penuh */}
        <div className="relative flex-shrink-0" style={{ width: 44, height: 44 }}>
          <Image
            src="/logo.png"
            alt="Logo Madrasah"
            fill
            className="object-contain"
          />
        </div>

        <div>
          <h1
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}
          >
            {konfigurasi.namaMadrasah}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.40)",
              fontSize: 10.5,
              marginTop: 2,
              letterSpacing: "0.01em",
            }}
          >
            {konfigurasi.tagline}
          </p>
        </div>
      </div>

      {/* ── Tengah: Tanggal ── */}
      <div className="text-center">
        <p style={{ color: "rgba(255,255,255,0.90)", fontSize: 13, fontWeight: 600 }}>
          {tanggalMasehi}
        </p>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, marginTop: 3 }}>
          {tanggalHijriyah}
        </p>
      </div>

      {/* ── Kanan: Jam ── */}
      <div className="flex items-center gap-6">

        {/* Dua jam berdampingan */}
        <div className="flex items-center gap-5">
          {/* WIS */}
          <div className="text-right">
            <div
              className="tabular-nums leading-none"
              style={{
                color: "#fff",
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                letterSpacing: "-1px",
              }}
            >
              {jamIstiwa}
            </div>
            <div
              style={{
                color: "#56C288",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 3,
                textAlign: "right",
              }}
            >
              WIS
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: 32,
              background: "rgba(255,255,255,0.12)",
            }}
          />

          {/* WIB */}
          <div className="text-left">
            <div
              className="tabular-nums leading-none"
              style={{
                color: "rgba(255,255,255,0.50)",
                fontSize: 32,
                fontWeight: 500,
                fontFamily: "var(--font-mono)",
                letterSpacing: "-1px",
              }}
            >
              {jamWib}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.30)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 3,
              }}
            >
              WIB
            </div>
          </div>
        </div>

        {/* ── Live Badge ── */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{
              background: isOnline
                ? "rgba(86,194,136,0.15)"
                : "rgba(255,68,68,0.15)",
              border: isOnline
                ? "1px solid rgba(86,194,136,0.32)"
                : "1px solid rgba(255,68,68,0.32)",
            }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? "animate-pulse" : ""}`}
              style={{ background: isOnline ? "#56C288" : "#FF4444" }}
            />
            <span
              style={{
                color: isOnline ? "#56C288" : "#FF4444",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {isOnline ? "LIVE" : "OFFLINE"}
            </span>
          </div>
          <span
            className="tabular-nums"
            style={{
              color: "rgba(255,255,255,0.30)",
              fontSize: 9,
              fontFamily: "var(--font-mono)",
            }}
          >
            {lastUpdate ? lastUpdate.toLocaleTimeString("id-ID") : "..."}
          </span>
        </div>
      </div>
    </header>
  );
}