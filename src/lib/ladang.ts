import type { Reban, RekodHarian, RekodVaksin, StatusVaksin, TarikhISO } from '../types';
import { bezaHari, hariIni, tambahHari } from './tarikh';

export function statusVaksin(v: RekodVaksin, rujukan: TarikhISO = hariIni()): StatusVaksin {
  if (v.selesai) return 'selesai';
  return v.tarikh < rujukan ? 'tertunggak' : 'akanDatang';
}

export function susunVaksin(senarai: RekodVaksin[]): RekodVaksin[] {
  const keutamaan: Record<StatusVaksin, number> = { tertunggak: 0, akanDatang: 1, selesai: 2 };
  return [...senarai].sort((a, b) => {
    const p = keutamaan[statusVaksin(a)] - keutamaan[statusVaksin(b)];
    if (p !== 0) return p;
    // Selesai: terbaru dahulu. Lain-lain: paling awal dahulu.
    return statusVaksin(a) === 'selesai' ? b.tarikh.localeCompare(a.tarikh) : a.tarikh.localeCompare(b.tarikh);
  });
}

export function umurReban(reban: Reban | undefined, rujukan: TarikhISO = hariIni()): number | null {
  if (!reban || reban.status !== 'aktif' || !reban.tarikhMasuk) return null;
  return Math.max(bezaHari(reban.tarikhMasuk, rujukan), 0);
}

/** Reban aktif pilihan pengguna, atau reban aktif pertama jika pilihan tidak sah. */
export function rebanUtama(senarai: Reban[], idPilihan: string | null): Reban | undefined {
  const aktif = senarai.filter((r) => r.status === 'aktif');
  return aktif.find((r) => r.id === idPilihan) ?? aktif[0];
}

export function rekodPada(log: RekodHarian[], tarikh: TarikhISO): RekodHarian | undefined {
  return log.find((l) => l.tarikh === tarikh);
}

export interface TitikSiri {
  tarikh: TarikhISO;
  kematian: number | null;
  dedakKg: number | null;
}

/** `n` hari kalendar yang berakhir hari ini; hari tanpa rekod bernilai null. */
export function siriHarian(log: RekodHarian[], n: number, akhir: TarikhISO = hariIni()): TitikSiri[] {
  const peta = new Map(log.map((l) => [l.tarikh, l]));
  return Array.from({ length: n }, (_, i) => {
    const t = tambahHari(akhir, i - n + 1);
    const r = peta.get(t);
    return { tarikh: t, kematian: r ? r.kematian : null, dedakKg: r ? r.dedakKg : null };
  });
}

export function ringkasanLadang(reban: Reban[], log: RekodHarian[]) {
  const aktif = reban.filter((r) => r.status === 'aktif');
  const populasiSemasa = aktif.reduce((j, r) => j + r.populasiSemasa, 0);
  const populasiAwal = aktif.reduce((j, r) => j + r.populasiAwal, 0);
  const kematianKumulatif = Math.max(populasiAwal - populasiSemasa, 0);
  const kadarKematian = populasiAwal > 0 ? (kematianKumulatif / populasiAwal) * 100 : 0;

  const hari = hariIni();
  const kini = rekodPada(log, hari);
  const semalam = rekodPada(log, tambahHari(hari, -1));

  return {
    bilAktif: aktif.length,
    populasiSemasa,
    populasiAwal,
    kematianKumulatif,
    kadarKematian,
    kematianHariIni: kini?.kematian ?? 0,
    kematianSemalam: semalam?.kematian ?? null,
    dedakHariIni: kini?.dedakKg ?? 0,
    dedakSemalam: semalam?.dedakKg ?? null,
    adaRekodHariIni: Boolean(kini),
  };
}
