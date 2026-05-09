// src/lib/googleSheets.ts
console.log("Cek Sheet ID dari ENV:", process.env.GOOGLE_SHEET_ID);
// src/lib/googleSheets.ts — baris paling atas, update import
import {
  SignageData,
  Infografis,
  Pengumuman,
  RunningText,
  StatistikSiswa,
  StatistikPerKelas,
  JadwalHarian,
  Konfigurasi,
  CardListData,
  KalenderAkademik,   // ← tambah ini
} from "@/types";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const API_KEY  = process.env.GOOGLE_SHEETS_API_KEY!;

function sheetUrl(range: string) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
}

async function fetchRange(range: string): Promise<string[][]> {
  const res = await fetch(sheetUrl(range), { next: { revalidate: 30 } });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.values as string[][] | undefined) ?? [];
}

function normalizeImageUrl(url: string): string {
  if (!url) return "";
  console.log("RAW URL dari sheet:", url); // ← tambah ini
  
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    console.log("File ID ditemukan:", driveMatch[1]);
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
  }

  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    console.log("ID dari query ditemukan:", idMatch[1]);
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
  }

  console.log("Tidak cocok pattern apapun, URL dikembalikan apa adanya:", url);
  return url;
}

// Tambah parser baru
function parseKalenderAkademik(rows: string[][]): KalenderAkademik[] {
  return rows.slice(1)
    .filter(r => r[3]?.trim() === "Aktif" && r[0])
    .map((r, i) => ({
      id:          r[0] || String(i),
      nama_event:  r[1] || "",
      tanggal:     r[2] || "",
      status:      "Aktif",
    }));
}

function parseInfografis(rows: string[][]): Infografis[] {
  return rows.slice(1)
    .filter(r => r[5]?.trim() === "Aktif" && r[0])
    .map((r, i) => ({
      id:           r[0] || String(i),
      judul:        r[1] || "",
      url_gambar:   normalizeImageUrl(r[2] || ""), // ← pakai converter
      durasi_detik: parseInt(r[3]) || 10,
      status:       "Aktif",
    }));
}

function parsePengumuman(rows: string[][]): Pengumuman[] {
  return rows.slice(1)
    .filter(r => r[4]?.trim() === "Aktif" && r[0])
    .map((r, i) => ({
      id:             r[0] || String(i),
      tanggal:        r[1] || "",
      judul:          r[2] || "",
      isi_pengumuman: r[3] || "",
      status:         "Aktif",
      durasi_detik:   parseInt(r[5]) || 10,
    }));
}

function parseRunningText(rows: string[][]): RunningText[] {
  return rows.slice(1)
    .filter(r => r[2]?.trim() === "Aktif" && r[0])
    .map((r, i) => ({
      id:     r[0] || String(i),
      teks:   r[1] || "",
      status: "Aktif",
    }));
}

function parseStatistikSiswa(rows: string[][]): StatistikSiswa[] {
  return rows.slice(1)
    .filter(r => r[5]?.trim() === "Aktif" && r[0])
    .map((r, i) => ({
      id:     r[0] || String(i),
      label:  r[1] || "",
      nilai:  r[2] || "",
      ikon:   r[3] || "",
      warna:  r[4] || "blue",
      status: "Aktif",
    }));
}

function parseStatistikPerKelas(rows: string[][]): StatistikPerKelas[] {
  return rows.slice(1)
    .filter(r => r[3]?.trim() === "Aktif" && r[0])
    .map((r, i) => ({
      id:      r[0] || String(i),
      kelas:   r[1] || "",
      jumlah:  parseInt(r[2]) || 0,
      tingkat: r[4]?.trim() || "4",
      status:  "Aktif",
    }));
}

function parseJadwalHarian(rows: string[][]): JadwalHarian[] {
  return rows.slice(1)
    .filter(r => r[4]?.trim() === "Aktif" && r[0])
    .map((r, i) => ({
      id:             r[0] || String(i),
      label:          r[1] || "",
      jam_mulai:      r[2] || "00:00",
      jam_selesai:    r[3] || "00:00",
      mata_pelajaran: r[5] || undefined,
      status:         "Aktif",
    }));
}

// Update parseKonfigurasi — tambah latitude & kodeWilayah
function parseKonfigurasi(rows: string[][]): Konfigurasi {
  const map: Record<string, string> = {};
  rows.slice(1).forEach(r => {
    if (r[0]) map[r[0].trim()] = r[1]?.trim() ?? "";
  });
  return {
    longitude:          parseFloat(map["longitude"]       || "112.053"),
    latitude:           parseFloat(map["latitude"]        || "-7.092"),
    kodeWilayah:        map["kodeWilayah"]                || "1231",
    koreksiHijriyah:    parseInt(map["koreksiHijriyah"]   || "0"),
    namaMadrasah:       map["namaMadrasah"]                || "Madrasah Digital",
    tagline:            map["tagline"]                     || "Unggul & Berakhlak",
    intervalPengumuman: parseInt(map["intervalPengumuman"] || "10"),
    ihtiyatSubuh:    parseFloat(map["ihtiyatSubuh"]   || "3"),
    ihtiyatSyuruq:   parseFloat(map["ihtiyatSyuruq"]  || "-2"),
    ihtiyatAshar:    parseFloat(map["ihtiyatAshar"]   || "3"),
    ihtiyatMaghrib:  parseFloat(map["ihtiyatMaghrib"] || "3"),
    ihtiyatIsya:     parseFloat(map["ihtiyatIsya"]    || "3"),
    sudutSubuh:      parseFloat(map["sudutSubuh"]     || "19.8"),
    sudutIsya:       parseFloat(map["sudutIsya"]      || "17.8"),
  };
}

// ── BARU: Parser CardList ──
function parseCardList(rows: string[][]): CardListData {
  const map: Record<string, number> = {};
  rows.slice(1).forEach(r => {
    if (r[0] && r[3]?.trim() === "Aktif") {
      map[r[0].trim()] = parseInt(r[2]) || 0;
    }
  });
  return {
    totalSiswa:  map["totalSiswa"]  ?? 0,
    totalGuru:   map["totalGuru"]   ?? 0,
    totalStaf:   map["totalStaf"]   ?? 0,
    totalRombel: map["totalRombel"] ?? 0,
  };
}

// Update getSignageData — tambah fetch KalenderAkademik
export async function getSignageData(): Promise<SignageData> {
  const [
    infografisRows,
    pengumumanRows,
    runningTextRows,
    statistikSiswaRows,
    statistikPerKelasRows,
    jadwalHarianRows,
    konfigurasiRows,
    cardListRows,
    kalenderAkademikRows,  // ← baru
  ] = await Promise.all([
    fetchRange("Infografis!A:F"),
    fetchRange("Pengumuman!A:F"),
    fetchRange("RunningText!A:C"),
    fetchRange("StatistikSiswa!A:F"),
    fetchRange("StatistikPerKelas!A:E"),
    fetchRange("JadwalHarian!A:F"),
    fetchRange("Konfigurasi!A:B"),
    fetchRange("CardList!A:D"),
    fetchRange("KalenderAkademik!A:D"),  // ← baru
  ]);

  return {
    infografis:        parseInfografis(infografisRows),
    pengumuman:        parsePengumuman(pengumumanRows),
    runningText:       parseRunningText(runningTextRows),
    statistikSiswa:    parseStatistikSiswa(statistikSiswaRows),
    statistikPerKelas: parseStatistikPerKelas(statistikPerKelasRows),
    jadwalHarian:      parseJadwalHarian(jadwalHarianRows),
    konfigurasi:       parseKonfigurasi(konfigurasiRows),
    cardList:          parseCardList(cardListRows),
    kalenderAkademik:  parseKalenderAkademik(kalenderAkademikRows),  // ← baru
  };
}