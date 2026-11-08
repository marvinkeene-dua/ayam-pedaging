import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { LencanaReban, Medan, PageHeader } from '../components/ui';
import { ariaRalat, labelStatusReban } from '../lib/borang';
import type { Reban, StatusReban } from '../types';
import { umurReban } from '../lib/ladang';
import { formatTarikhPendek, hariIni } from '../lib/tarikh';
import { idBaru, nombor } from '../lib/format';

interface LadangSayaProps {
  rebanList: Reban[];
  rebanUtamaId: string | null;
  onSimpanReban: (reban: Reban) => void;
  onPadamReban: (id: string) => void;
}

const opsyenStatus: StatusReban[] = ['aktif', 'pembersihan', 'kosong'];

interface Borang {
  id: string | null;
  nama: string;
  kapasiti: string;
  populasiAwal: string;
  populasiSemasa: string;
  tarikhMasuk: string;
  status: StatusReban;
}

type Ralat = Partial<Record<'nama' | 'kapasiti' | 'populasiAwal' | 'populasiSemasa' | 'tarikhMasuk', string>>;

function keBorang(r: Reban | null, bilReban: number): Borang {
  if (!r) {
    return { id: null, nama: `Reban ${bilReban + 1}`, kapasiti: '3000', populasiAwal: '', populasiSemasa: '', tarikhMasuk: hariIni(), status: 'kosong' };
  }
  return {
    id: r.id,
    nama: r.nama,
    kapasiti: String(r.kapasiti),
    populasiAwal: String(r.populasiAwal || ''),
    populasiSemasa: String(r.populasiSemasa || ''),
    tarikhMasuk: r.tarikhMasuk ?? hariIni(),
    status: r.status,
  };
}

export default function LadangSaya({ rebanList, rebanUtamaId, onSimpanReban, onPadamReban }: LadangSayaProps) {
  const [borang, setBorang] = useState<Borang | null>(null);
  const [ralat, setRalat] = useState<Ralat>({});

  const aktif = rebanList.filter((r) => r.status === 'aktif');
  const jumlahPopulasi = aktif.reduce((j, r) => j + r.populasiSemasa, 0);
  const jumlahKapasiti = rebanList.reduce((j, r) => j + r.kapasiti, 0);

  function buka(r: Reban | null) {
    setBorang(keBorang(r, rebanList.length));
    setRalat({});
  }

  function ubah<K extends keyof Borang>(k: K, v: Borang[K]) {
    setBorang((b) => {
      if (!b) return b;
      const baru = { ...b, [k]: v };
      // Menukar reban kosong kepada aktif: cadangkan populasi penuh.
      if (k === 'status' && v === 'aktif' && !b.populasiAwal) {
        baru.populasiAwal = b.kapasiti;
        baru.populasiSemasa = b.kapasiti;
      }
      // Populasi semasa mengikut populasi awal sehingga diubah sendiri.
      if (k === 'populasiAwal' && (b.populasiSemasa === '' || b.populasiSemasa === b.populasiAwal)) {
        baru.populasiSemasa = v as string;
      }
      return baru;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!borang) return;
    const r: Ralat = {};
    const nama = borang.nama.trim();
    const kapasiti = Number(borang.kapasiti);
    const awal = Number(borang.populasiAwal || 0);
    const semasa = Number(borang.populasiSemasa || 0);

    if (!nama) r.nama = 'Beri reban ini nama.';
    else if (rebanList.some((x) => x.id !== borang.id && x.nama.trim().toLowerCase() === nama.toLowerCase()))
      r.nama = 'Nama ini sudah digunakan oleh reban lain.';
    if (!Number.isInteger(kapasiti) || kapasiti <= 0) r.kapasiti = 'Tulis kapasiti sebagai nombor bulat lebih daripada 0.';

    if (borang.status === 'aktif') {
      if (!Number.isInteger(awal) || awal <= 0) r.populasiAwal = 'Tulis bilangan anak ayam yang dimasukkan.';
      else if (!r.kapasiti && awal > kapasiti) r.populasiAwal = `Melebihi kapasiti ${nombor(kapasiti)} ekor.`;
      if (!Number.isInteger(semasa) || semasa < 0) r.populasiSemasa = 'Tulis bilangan ekor sebagai nombor bulat.';
      else if (!r.populasiAwal && semasa > awal) r.populasiSemasa = 'Tidak boleh melebihi populasi awal.';
      if (!borang.tarikhMasuk) r.tarikhMasuk = 'Pilih tarikh anak ayam dimasukkan.';
      else if (borang.tarikhMasuk > hariIni()) r.tarikhMasuk = 'Tarikh tidak boleh selepas hari ini.';
    }

    setRalat(r);
    const pertama = Object.keys(r)[0];
    if (pertama) {
      document.getElementById(`reban-${pertama}`)?.focus();
      return;
    }

    const aktifkan = borang.status === 'aktif';
    onSimpanReban({
      id: borang.id ?? idBaru('r'),
      nama,
      kapasiti,
      populasiAwal: aktifkan ? awal : 0,
      populasiSemasa: aktifkan ? semasa : 0,
      tarikhMasuk: aktifkan ? borang.tarikhMasuk : null,
      status: borang.status,
    });
    setBorang(null);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        kecil="Reban"
        tajuk="Senarai reban"
        keterangan={`${aktif.length} daripada ${rebanList.length} reban aktif, ${nombor(jumlahPopulasi)} ekor dalam kapasiti ${nombor(jumlahKapasiti)}.`}
        tindakan={
          <button type="button" className="btn btn--primary" onClick={() => buka(null)}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Tambah reban
          </button>
        }
      />

      {rebanList.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="font-display text-[24px]">Belum ada reban</p>
          <p className="mt-2 text-[14px] text-muted">Tambah reban pertama untuk mula merekod populasi dan kematian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {rebanList.map((r) => {
            const isi = r.kapasiti > 0 ? Math.min((r.populasiSemasa / r.kapasiti) * 100, 100) : 0;
            const umur = umurReban(r);
            const mati = Math.max(r.populasiAwal - r.populasiSemasa, 0);
            const isAktif = r.status === 'aktif';
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => buka(r)}
                className="card group flex flex-col p-6 text-left transition-[transform,border-color] duration-150 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-0.5 hover:border-line-strong"
                aria-label={`Buka butiran ${r.nama}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[26px] leading-tight text-ink">{r.nama}</p>
                    {r.id === rebanUtamaId && isAktif && <p className="mt-0.5 text-[12.5px] text-gold">Reban utama</p>}
                  </div>
                  <LencanaReban status={r.status} />
                </div>

                <dl className="mt-6 grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-[12.5px] text-muted">Populasi</dt>
                    <dd className="figure mt-1.5 text-[24px] text-ink">{isAktif ? nombor(r.populasiSemasa) : '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[12.5px] text-muted">Umur</dt>
                    <dd className="figure mt-1.5 text-[24px] text-ink">
                      {umur !== null ? (
                        <>
                          {umur}
                          <span className="ml-1 font-sans text-[12.5px] tracking-normal text-muted">hari</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[12.5px] text-muted">Kematian</dt>
                    <dd className="figure mt-1.5 text-[24px] text-ink">{isAktif ? nombor(mati) : '—'}</dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-[12.5px] text-muted">
                    <span>Kadar isi</span>
                    <span className="tnum">
                      {nombor(r.populasiSemasa)} / {nombor(r.kapasiti)} · {Math.round(isi)}%
                    </span>
                  </div>
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-raised">
                    <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${isi}%` }} />
                  </div>
                </div>

                <p className="mt-5 border-t border-line pt-4 text-[13px] text-muted">
                  {isAktif && r.tarikhMasuk
                    ? `Masuk ${formatTarikhPendek(r.tarikhMasuk)}, ${nombor(r.populasiAwal)} ekor`
                    : r.status === 'pembersihan'
                      ? 'Sedang dibersihkan untuk kitaran baru'
                      : 'Sedia untuk kemasukan anak ayam'}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {borang && (
        <Modal
          tajuk={borang.id ? borang.nama || 'Butiran reban' : 'Reban baru'}
          keterangan={borang.id ? 'Kemas kini kapasiti, populasi dan status.' : 'Tambah reban dan isi butiran kitaran jika sudah ada ayam.'}
          onTutup={() => setBorang(null)}
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Medan id="reban-nama" label="Nama reban" ralat={ralat.nama}>
                <input
                  id="reban-nama"
                  className="field"
                  value={borang.nama}
                  onChange={(e) => ubah('nama', e.target.value)}
                  {...ariaRalat('reban-nama', ralat.nama)}
                />
              </Medan>
              <Medan id="reban-kapasiti" label="Kapasiti (ekor)" ralat={ralat.kapasiti}>
                <input
                  id="reban-kapasiti"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="field tnum"
                  value={borang.kapasiti}
                  onChange={(e) => ubah('kapasiti', e.target.value)}
                  {...ariaRalat('reban-kapasiti', ralat.kapasiti)}
                />
              </Medan>
            </div>

            <fieldset>
              <legend className="field-label">Status</legend>
              <div className="segmented w-full" role="group">
                {opsyenStatus.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="flex-1"
                    aria-pressed={borang.status === s}
                    onClick={() => ubah('status', s)}
                  >
                    {labelStatusReban[s]}
                  </button>
                ))}
              </div>
            </fieldset>

            {borang.status === 'aktif' ? (
              <div className="grid grid-cols-2 gap-4">
                <Medan id="reban-populasiAwal" label="Anak ayam dimasukkan" ralat={ralat.populasiAwal}>
                  <input
                    id="reban-populasiAwal"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="field tnum"
                    value={borang.populasiAwal}
                    onChange={(e) => ubah('populasiAwal', e.target.value)}
                    {...ariaRalat('reban-populasiAwal', ralat.populasiAwal)}
                  />
                </Medan>
                <Medan id="reban-populasiSemasa" label="Populasi semasa" ralat={ralat.populasiSemasa}>
                  <input
                    id="reban-populasiSemasa"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="field tnum"
                    value={borang.populasiSemasa}
                    onChange={(e) => ubah('populasiSemasa', e.target.value)}
                    {...ariaRalat('reban-populasiSemasa', ralat.populasiSemasa)}
                  />
                </Medan>
                <div className="col-span-2">
                  <Medan id="reban-tarikhMasuk" label="Tarikh masuk" ralat={ralat.tarikhMasuk} petunjuk="Umur ternakan dikira dari tarikh ini.">
                    <input
                      id="reban-tarikhMasuk"
                      type="date"
                      className="field tnum"
                      max={hariIni()}
                      value={borang.tarikhMasuk}
                      onChange={(e) => ubah('tarikhMasuk', e.target.value)}
                      {...ariaRalat('reban-tarikhMasuk', ralat.tarikhMasuk)}
                    />
                  </Medan>
                </div>
              </div>
            ) : (
              <p className="rounded-[var(--radius-ctl)] bg-raised px-4 py-3 text-[13.5px] text-muted">
                Reban yang tidak aktif disimpan tanpa populasi. Pilih Aktif apabila anak ayam dimasukkan.
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center">
              {borang.id && (
                <button
                  type="button"
                  className="btn btn--danger sm:mr-auto"
                  onClick={() => {
                    onPadamReban(borang.id as string);
                    setBorang(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  Padam reban
                </button>
              )}
              <button type="button" className={`btn btn--secondary ${borang.id ? '' : 'sm:ml-auto'}`} onClick={() => setBorang(null)}>
                Batal
              </button>
              <button type="submit" className="btn btn--primary">
                {borang.id ? 'Simpan perubahan' : 'Tambah reban'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
