// src/types/index.ts

export interface Infografis {
  id: string;
  judul: string;
  url_gambar: string;
  durasi_detik: number;
  status: "Aktif" | "Nonaktif";
}

export interface Pengumuman {
  id: string;
  tanggal: string;
  judul: string;
  isi_pengumuman: string;
  status: "Aktif" | "Nonaktif";
  durasi_detik?: number;
}

export interface RunningText {
  id: string;
  teks: string;
  status: "Aktif" | "Nonaktif";
}

export interface StatistikSiswa {
  id: string;
  label: string;
  nilai: string;
  ikon: string;
  warna: string;
  status: "Aktif" | "Nonaktif";
}

export interface StatistikPerKelas {
  id: string;
  kelas: string;
  jumlah: number;
  tingkat: string;
  status: "Aktif" | "Nonaktif";
}

export interface JadwalHarian {
  id: string;
  label: string;
  jam_mulai: string;
  jam_selesai: string;
  mata_pelajaran?: string;
  status: "Aktif" | "Nonaktif";
}

export interface Konfigurasi {
  longitude:          number;
  latitude:           number;
  kodeWilayah:        string;
  koreksiHijriyah:    number;
  namaMadrasah:       string;
  tagline:            string;
  intervalPengumuman: number;
  ihtiyatSubuh: number;
  ihtiyatSyuruq: number;
  ihtiyatAshar: number;
  ihtiyatMaghrib: number;
  ihtiyatIsya: number;
  sudutSubuh: number;
  sudutIsya: number;
}

export interface CardListData {
  totalSiswa:  number;
  totalGuru:   number;
  totalStaf:   number;
  totalRombel: number;
}

export interface KalenderAkademik {
  id:         string;
  nama_event: string;
  tanggal:    string;
  status:     "Aktif";
}

export interface JadwalSholatHarian {
  subuh:   string;
  dzuhur:  string;
  ashar:   string;
  maghrib: string;
  isya:    string;
}

export interface SignageData {
  infografis:        Infografis[];
  pengumuman:        Pengumuman[];
  runningText:       RunningText[];
  statistikSiswa:    StatistikSiswa[];
  statistikPerKelas: StatistikPerKelas[];
  jadwalHarian:      JadwalHarian[];
  konfigurasi:       Konfigurasi;
  cardList:          CardListData;
  kalenderAkademik:  KalenderAkademik[];
}