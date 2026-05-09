// src/utils/waktuIstiwa.ts

/**
 * Mengonversi waktu WIB ke Waktu Istiwa' (Local Mean Time)
 * Rumus: Selisih Waktu = (Bujur Lokasi - 105°) × 4 Menit
 */
export function getWaktuIstiwa(wibDate: Date, longitude: number): Date {
  const BUJUR_ACUAN_WIB = 105;
  const selisihBujur = longitude - BUJUR_ACUAN_WIB;
  const selisihMenit = selisihBujur * 4;
  const selisihMilidetik = selisihMenit * 60 * 1000;
  return new Date(wibDate.getTime() + selisihMilidetik);
}

/**
 * Format Date ke string HH:MM:SS
 */
export function formatJam(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

/**
 * Format tanggal Masehi panjang
 */
export function formatTanggalMasehi(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}