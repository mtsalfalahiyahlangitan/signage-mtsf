import InfografisSlider from "./InfografisSlider";
import PengumumanPanel from "./PengumumanPanel";
import GrafikSiswaPerKelas from "./GrafikSiswaPerKelas";
import CardListStats from "./CardListStats";
import KalenderAkademik from "./KalenderAkademik";
import {
  CardListData,
  Infografis,
  KalenderAkademik as KalenderAkademikType,
  Pengumuman,
  StatistikPerKelas,
} from "@/types";

interface MainContentProps {
  infografis:        Infografis[];
  pengumuman:        Pengumuman[];
  statistikPerKelas: StatistikPerKelas[];
  cardList:          CardListData;
  kalenderAkademik:  KalenderAkademikType[];
  kodeWilayah:       string; // tidak lagi dipakai, tapi biarkan agar page.tsx tidak perlu diubah
  intervalPengumuman?: number;
}

export default function MainContent({
  infografis,
  pengumuman,
  statistikPerKelas,
  cardList,
  kalenderAkademik,
  intervalPengumuman = 10,
}: MainContentProps) {
  return (
    <main className="flex-1 flex gap-3 p-4 min-h-0 overflow-hidden">

      {/* ── KOLOM KIRI ── */}
      <div className="flex-[2.2] flex flex-col gap-3 min-h-0 overflow-hidden">
        <div className="flex-shrink-0" style={{ height: "20%" }}>
          <CardListStats data={cardList} />
        </div>
        <div className="flex-shrink-0" style={{ height: "22%" }}>
          <PengumumanPanel items={pengumuman} intervalDetik={intervalPengumuman} />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <GrafikSiswaPerKelas items={statistikPerKelas} />
        </div>
      </div>

      {/* ── KOLOM TENGAH ── */}
      <div className="flex-[1] flex flex-col gap-3 min-h-0 overflow-hidden">

        {/* Kalender Akademik — tinggi fixed kecil */}
        <div className="flex-shrink-0" style={{ height: "43.5%" }}>
          <KalenderAkademik items={kalenderAkademik} />
        </div>

        {/* Infografis — ambil sisa ruang */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <InfografisSlider items={infografis} />
        </div>

      </div>

    </main>
  );
}