// src/hooks/useJamIstiwa.ts
"use client";

import { useState, useEffect } from "react";
import { getWaktuIstiwa, formatJam, formatTanggalMasehi } from "@/utils/waktuIstiwa";
import { getTanggalHijriyah } from "@/utils/hijriah";

interface UseJamIstiwaProps {
  longitude: number;
  koreksiHijriyah?: number;
}

interface JamState {
  jamIstiwa: string;
  jamWib: string;
  tanggalMasehi: string;
  tanggalHijriyah: string;
}

export function useJamIstiwa({ longitude, koreksiHijriyah = 0 }: UseJamIstiwaProps): JamState {
  const [state, setState] = useState<JamState>({
    jamIstiwa: "--:--:--",
    jamWib: "--:--:--",
    tanggalMasehi: "",
    tanggalHijriyah: "",
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const istiwa = getWaktuIstiwa(now, longitude);

      setState({
        jamIstiwa: formatJam(istiwa),
        jamWib: formatJam(now),
        tanggalMasehi: formatTanggalMasehi(now),
        tanggalHijriyah: getTanggalHijriyah(now, koreksiHijriyah),
      });
    };

    tick(); // jalankan sekali langsung
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [longitude, koreksiHijriyah]);

  return state;
}