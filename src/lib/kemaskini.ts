import type { KemaskiniHarian, NotaHarian, Reban, RekodHarian } from '../types';

export interface KeadaanLadang {
  reban: Reban[];
  log: RekodHarian[];
  nota: NotaHarian[];
}

/**
 * Gunakan satu kemas kini harian pada keadaan ladang, tanpa kesan sampingan.
 *
 * - Kematian ditolak daripada populasi reban yang dipilih (tidak boleh jatuh bawah 0).
 * - Kematian dan dedak DITAMBAH kepada rekod sedia ada bagi tarikh itu, kerana pekerja
 *   biasanya melapor beberapa kali sehari. Log kekal tersusun mengikut tarikh.
 * - Nota bagi tarikh lepas dicap pada tarikh itu dengan masa sekarang.
 */
export function gunaKemaskini(k: KeadaanLadang, data: KemaskiniHarian, kini: Date, idNota: string): KeadaanLadang {
  const { tarikh, rebanId, kematian, dedakKg, nota: teks } = data;

  const reban =
    kematian && kematian > 0 && rebanId
      ? k.reban.map((r) => (r.id === rebanId ? { ...r, populasiSemasa: Math.max(r.populasiSemasa - kematian, 0) } : r))
      : k.reban;

  let log = k.log;
  if (kematian !== undefined || dedakKg !== undefined) {
    const ada = k.log.find((l) => l.tarikh === tarikh);
    const baru: RekodHarian = {
      tarikh,
      kematian: (ada?.kematian ?? 0) + (kematian ?? 0),
      // Bundarkan kepada 0.1 kg supaya penambahan berulang tidak mengumpul ralat titik terapung.
      dedakKg: Math.round(((ada?.dedakKg ?? 0) + (dedakKg ?? 0)) * 10) / 10,
    };
    log = [...k.log.filter((l) => l.tarikh !== tarikh), baru].sort((a, b) => a.tarikh.localeCompare(b.tarikh));
  }

  let nota = k.nota;
  const mesej = teks?.trim();
  if (mesej) {
    const jam = kini.toTimeString().slice(0, 8);
    nota = [{ id: idNota, tarikh: `${tarikh}T${jam}`, mesej, rebanId }, ...k.nota];
  }

  return { reban, log, nota };
}
