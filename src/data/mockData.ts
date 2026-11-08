import type { NotaHarian, ProfilPengguna, Reban, RekodHarian, RekodVaksin } from '../types';
import { hariIni, tambahHari } from '../lib/tarikh';

/**
 * Data contoh dijana relatif kepada hari ini supaya papan pemuka sentiasa
 * menunjukkan kitaran yang sedang berjalan (hari ke-24), bukan tarikh lapuk.
 */

const UMUR_KITARAN = 24;

// Penjana nombor rawak berbiji supaya data contoh sama setiap kali.
function rawak(biji: number) {
  let s = biji;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function janaDataContoh() {
  const hari = hariIni();
  const tarikhMasuk = tambahHari(hari, -UMUR_KITARAN);
  const r = rawak(42);

  const populasiAwal = [3000, 3000, 4000];
  const jumlahAwal = populasiAwal.reduce((a, b) => a + b, 0);

  const log: RekodHarian[] = [];
  let hidup = jumlahAwal;
  for (let umur = 1; umur <= UMUR_KITARAN; umur++) {
    // Kematian lebih tinggi minggu pertama, kemudian stabil.
    const asas = umur <= 5 ? 16 : umur <= 10 ? 9 : 6;
    const kematian = Math.round(asas + r() * 7);
    hidup -= kematian;
    // Ayam pedaging makan lebih kurang 5 g seekor sehari bagi setiap hari umur.
    const gramSeekor = 12 + umur * 4.6 + (r() - 0.5) * 4;
    log.push({
      tarikh: tambahHari(tarikhMasuk, umur),
      kematian,
      dedakKg: Math.round((hidup * gramSeekor) / 1000),
    });
  }

  const jumlahKematian = jumlahAwal - hidup;
  // Agih kematian ikut nisbah populasi; reban terakhir ambil bakinya.
  let baki = jumlahKematian;
  const semasa = populasiAwal.map((awal, i) => {
    const bahagian = i === populasiAwal.length - 1 ? baki : Math.round((jumlahKematian * awal) / jumlahAwal);
    baki -= bahagian;
    return awal - bahagian;
  });

  const reban: Reban[] = [
    { id: 'r1', nama: 'Reban 1', kapasiti: 3200, populasiAwal: populasiAwal[0], populasiSemasa: semasa[0], tarikhMasuk, status: 'aktif' },
    { id: 'r2', nama: 'Reban 2', kapasiti: 3200, populasiAwal: populasiAwal[1], populasiSemasa: semasa[1], tarikhMasuk, status: 'aktif' },
    { id: 'r3', nama: 'Reban 3', kapasiti: 4200, populasiAwal: populasiAwal[2], populasiSemasa: semasa[2], tarikhMasuk, status: 'aktif' },
    { id: 'r4', nama: 'Reban 4', kapasiti: 3500, populasiAwal: 0, populasiSemasa: 0, tarikhMasuk: null, status: 'pembersihan' },
    { id: 'r5', nama: 'Reban 5', kapasiti: 3500, populasiAwal: 0, populasiSemasa: 0, tarikhMasuk: null, status: 'kosong' },
  ];

  const vaksin: RekodVaksin[] = [
    { id: 'v1', nama: 'Vaksin ND/IB', keterangan: 'Titisan mata untuk Newcastle dan bronkitis berjangkit', tarikh: tambahHari(tarikhMasuk, 7), selesai: true },
    { id: 'v2', nama: 'Vitamin anti-stres', keterangan: 'Dalam air minuman selama 3 hari selepas vaksinasi', tarikh: tambahHari(tarikhMasuk, 8), selesai: true },
    { id: 'v3', nama: 'Vaksin Gumboro, dos pertama', keterangan: 'Melalui air minuman, semua reban aktif', tarikh: tambahHari(tarikhMasuk, 14), selesai: true },
    { id: 'v4', nama: 'Vaksin Gumboro, dos kedua', keterangan: 'Melalui air minuman, semua reban aktif', tarikh: tambahHari(tarikhMasuk, 21), selesai: false },
    { id: 'v5', nama: 'Ubat cacing', keterangan: 'Rawatan parasit dalaman', tarikh: tambahHari(tarikhMasuk, 26), selesai: false },
    { id: 'v6', nama: 'Vitamin anti-stres', keterangan: 'Sebelum ayam ditangkap untuk jualan', tarikh: tambahHari(tarikhMasuk, 33), selesai: false },
  ];

  const nota: NotaHarian[] = [
    { id: 'n1', tarikh: `${tambahHari(hari, -1)}T17:40:00`, mesej: 'Cuaca panas pada sebelah petang. Kipas ekzos Reban 3 dihidupkan sepenuhnya.', rebanId: 'r3' },
    { id: 'n2', tarikh: `${tambahHari(hari, -3)}T08:15:00`, mesej: 'Dedak naik sedikit, selari dengan pertumbuhan minggu ketiga.', rebanId: null },
    { id: 'n3', tarikh: `${tambahHari(hari, -10)}T09:05:00`, mesej: 'Gumboro dos pertama selesai. Semua ayam aktif dan makan seperti biasa.', rebanId: null },
  ];

  const profil: ProfilPengguna = {
    namaPengurus: 'Razif Hashim',
    namaLadang: 'Ladang Sri Makmur',
    telefon: '',
    lokasi: 'Bagan Datuk, Perak',
    rebanAktifId: 'r3',
  };

  return { reban, log, vaksin, nota, profil };
}
