/** Tarikh kalendar tempatan dalam bentuk YYYY-MM-DD. */
export type TarikhISO = string;

export type Halaman = 'papanPemuka' | 'ladangSaya' | 'rekodKesihatan' | 'laporan' | 'tetapan';

export type Tema = 'gelap' | 'cerah';

export type StatusReban = 'aktif' | 'pembersihan' | 'kosong';

export interface Reban {
  id: string;
  nama: string;
  kapasiti: number;
  /** Bilangan anak ayam yang dimasukkan pada awal kitaran. */
  populasiAwal: number;
  populasiSemasa: number;
  /** Tarikh anak ayam dimasukkan; null jika reban tiada ternakan. */
  tarikhMasuk: TarikhISO | null;
  status: StatusReban;
}

/** Satu baris log harian untuk seluruh ladang. */
export interface RekodHarian {
  tarikh: TarikhISO;
  kematian: number;
  dedakKg: number;
}

export interface NotaHarian {
  id: string;
  /** Cap masa ISO penuh. */
  tarikh: string;
  mesej: string;
  rebanId?: string | null;
}

export interface RekodVaksin {
  id: string;
  nama: string;
  keterangan: string;
  tarikh: TarikhISO;
  selesai: boolean;
}

/** Status diterbitkan daripada tarikh dan `selesai`, bukan disimpan. */
export type StatusVaksin = 'selesai' | 'akanDatang' | 'tertunggak';

export interface ProfilPengguna {
  namaPengurus: string;
  namaLadang: string;
  telefon: string;
  lokasi: string;
  rebanAktifId: string | null;
}

export interface KemaskiniHarian {
  tarikh: TarikhISO;
  rebanId: string | null;
  kematian?: number;
  dedakKg?: number;
  nota?: string;
}
