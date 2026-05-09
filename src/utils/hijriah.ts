// src/utils/hijriah.ts

const BULAN_HIJRIYAH = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
];

export function getTanggalHijriyah(date: Date, koreksiHari: number = 0): string {
  const tanggalKoreksi = new Date(date);
  tanggalKoreksi.setDate(tanggalKoreksi.getDate() + koreksiHari);

  try {
    // Ambil angka saja dari Intl, lalu ganti nama bulannya manual
    const parts = new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
      day: "numeric",
      month: "numeric", // ← angka, bukan nama
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).formatToParts(tanggalKoreksi);

    const hari  = parts.find(p => p.type === "day")?.value;
    const bulan = parts.find(p => p.type === "month")?.value;
    const tahun = parts.find(p => p.type === "year")?.value;

    const namaBulan = BULAN_HIJRIYAH[Number(bulan) - 1] ?? "?";
    return `${hari} ${namaBulan} ${tahun} H`;

  } catch {
    return getTanggalHijriyahManual(tanggalKoreksi);
  }
}
/**
 * Fallback manual konversi Hijriyah (algoritma sederhana)
 */
function getTanggalHijriyahManual(date: Date): string {
  const BULAN_HIJRIYAH = [
    "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
    "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
    "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
  ];

  // Konversi Julian Day Number
  const Y = date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();

  const JD =
    Math.floor((1461 * (Y + 4800 + Math.floor((M - 14) / 12))) / 4) +
    Math.floor((367 * (M - 2 - 12 * Math.floor((M - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((Y + 4900 + Math.floor((M - 14) / 12)) / 100)) / 4) +
    D - 32075;

  const L = JD - 1948440 + 10632;
  const N = Math.floor((L - 1) / 10631);
  const L2 = L - 10631 * N + 354;
  const J =
    Math.floor((10985 - L2) / 5316) * Math.floor((50 * L2) / 17719) +
    Math.floor(L2 / 5670) * Math.floor((43 * L2) / 15238);
  const L3 =
    L2 -
    Math.floor((30 - J) / 15) * Math.floor((17719 * J) / 50) -
    Math.floor(J / 16) * Math.floor((15238 * J) / 43) + 29;
  const bulan = Math.floor((24 * L3) / 709);
  const hari = L3 - Math.floor((709 * bulan) / 24);
  const tahun = 30 * N + J - 30;

  return `${hari} ${BULAN_HIJRIYAH[bulan - 1]} ${tahun} H`;
}