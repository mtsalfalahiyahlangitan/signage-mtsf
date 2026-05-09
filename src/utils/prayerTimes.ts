// src/utils/prayerTimes.ts
export interface WaktuShalat {
  nama: string;
  jam: string;
  menit: number;
}

export interface IhtiyatConfig {
  subuh:   number;
  syuruq:  number;
  ashar:   number;
  maghrib: number;
  isya:    number;
}

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function toDeg(rad: number) { return (rad * 180) / Math.PI; }
function fixAngle(a: number) { return a - 360 * Math.floor(a / 360); }
function fixHour(a: number)  { return a - 24  * Math.floor(a / 24); }
function pad2(n: number) { return String(Math.floor(n)).padStart(2, "0"); }

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  return `${pad2(h)}:${pad2(m === 60 ? 0 : m)}`;
}

function julianDate(date: Date): number {
  const y = date.getFullYear();
  const mo = date.getMonth() + 1;
  const d = date.getDate();
  if (mo <= 2) { return julianDate(new Date(y - 1, mo + 10, d)); }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5;
}

function sunPosition(jd: number) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.9915 * Math.sin(toRad(g)) + 0.02 * Math.sin(toRad(2 * g)));
  const e = 23.439 - 0.00000036 * D;
  const RA = toDeg(Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(L)), Math.cos(toRad(L)))) / 15;
  const eqt = q / 15 - fixHour(RA);
  const dec = toDeg(Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(L))));
  return { dec, eqt };
}

function computeTime(angle: number, dec: number, lat: number, direction: 1 | -1): number {
  const cosVal =
    (-Math.sin(toRad(angle)) - Math.sin(toRad(dec)) * Math.sin(toRad(lat))) /
    (Math.cos(toRad(dec)) * Math.cos(toRad(lat)));
  if (cosVal >= 1) return NaN;
  if (cosVal <= -1) return NaN;
  return (1 / 15) * direction * toDeg(Math.acos(cosVal));
}

function asrTime(factor: number, dec: number, lat: number): number {
  const angle = -toDeg(Math.atan(1 / (factor + Math.tan(toRad(Math.abs(lat - dec))))));
  return computeTime(angle, dec, lat, 1);
}

export function hitungWaktuShalat(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number = 7,
  sudutSubuh: number = 19.8,
  sudutIsya:  number = 17.8,
  ihtiyat: IhtiyatConfig = {
    subuh: 3, syuruq: -2, ashar: 3, maghrib: 3, isya: 3,
  },
): WaktuShalat[] {
  const jd = julianDate(date);
  const { dec, eqt } = sunPosition(jd);

  const transit = 12 - eqt - longitude / 15 + timezone;

  const fajrOffset    = computeTime(-sudutSubuh, dec, latitude, -1);
  const sunriseOffset = computeTime(-0.833,      dec, latitude, -1);
  const asrOffset     = asrTime(1,               dec, latitude);
  const sunsetOffset  = computeTime(-0.833,      dec, latitude,  1);
  const ishaOffset    = computeTime(-sudutIsya,  dec, latitude,  1);

  const fajr    = (transit + fajrOffset)    * 60 + ihtiyat.subuh;
  const syuruq  = (transit + sunriseOffset) * 60 + ihtiyat.syuruq;
  const dhuhr   = transit * 60 + 1;
  const asr     = (transit + asrOffset)     * 60 + ihtiyat.ashar;
  const maghrib = (transit + sunsetOffset)  * 60 + ihtiyat.maghrib;
  const isha    = (transit + ishaOffset)    * 60 + ihtiyat.isya;

  const waktu: { nama: string; menit: number }[] = [
    { nama: "Subuh",   menit: fajr },
    { nama: "Syuruq",  menit: syuruq },
    { nama: "Dzuhur",  menit: dhuhr },
    { nama: "Ashar",   menit: asr },
    { nama: "Maghrib", menit: maghrib },
    { nama: "Isya",    menit: isha },
  ];

  return waktu.map(w => ({
    nama:  w.nama,
    jam:   minutesToTime(w.menit),
    menit: Math.round(w.menit),
  }));
}