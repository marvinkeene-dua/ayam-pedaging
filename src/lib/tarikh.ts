import type { TarikhISO } from '../types';

export const namaHari = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
export const namaHariPendek = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
export const namaBulan = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
];
export const namaBulanPendek = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Tarikh tempatan (bukan UTC) sebagai YYYY-MM-DD. */
export function keISO(d: Date): TarikhISO {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function hariIni(): TarikhISO {
  return keISO(new Date());
}

/** Tukar YYYY-MM-DD kepada Date pada tengah hari tempatan, elak anjakan zon waktu. */
export function dariISO(iso: TarikhISO): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function tambahHari(iso: TarikhISO, n: number): TarikhISO {
  const d = dariISO(iso);
  d.setDate(d.getDate() + n);
  return keISO(d);
}

/** Bilangan hari dari `a` ke `b` (b − a). */
export function bezaHari(a: TarikhISO, b: TarikhISO): number {
  return Math.round((dariISO(b).getTime() - dariISO(a).getTime()) / 86_400_000);
}

export function formatTarikh(iso: TarikhISO): string {
  const d = dariISO(iso);
  return `${d.getDate()} ${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTarikhPendek(iso: TarikhISO): string {
  const d = dariISO(iso);
  return `${d.getDate()} ${namaBulanPendek[d.getMonth()]}`;
}

export function formatTarikhPanjang(d: Date): string {
  return `${namaHari[d.getDay()]}, ${d.getDate()} ${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Hari ini", "Semalam", "Esok", "dalam 3 hari", "4 hari lalu". */
export function relatif(iso: TarikhISO, rujukan: TarikhISO = hariIni()): string {
  const n = bezaHari(rujukan, iso);
  if (n === 0) return 'Hari ini';
  if (n === -1) return 'Semalam';
  if (n === 1) return 'Esok';
  return n > 0 ? `Dalam ${n} hari` : `${-n} hari lalu`;
}

export function formatMasa(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
