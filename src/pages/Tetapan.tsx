import { useState } from 'react';
import type { FormEvent } from 'react';
import Modal from '../components/Modal';
import { Medan, PageHeader } from '../components/ui';
import { ariaRalat } from '../lib/borang';
import type { ProfilPengguna, Reban, Tema } from '../types';

interface TetapanProps {
  profil: ProfilPengguna;
  reban: Reban[];
  tema: Tema;
  onSimpan: (profil: ProfilPengguna) => void;
  onTema: (tema: Tema) => void;
  onSetSemula: () => void;
}

type Ralat = Partial<Record<'namaPengurus' | 'namaLadang', string>>;

export default function Tetapan({ profil, reban, tema, onSimpan, onTema, onSetSemula }: TetapanProps) {
  const [borang, setBorang] = useState<ProfilPengguna>(profil);
  const [ralat, setRalat] = useState<Ralat>({});
  const [sahkanSetSemula, setSahkanSetSemula] = useState(false);

  const aktif = reban.filter((r) => r.status === 'aktif');
  const berubah = (Object.keys(borang) as Array<keyof ProfilPengguna>).some((k) => borang[k] !== profil[k]);

  function ubah<K extends keyof ProfilPengguna>(k: K, v: ProfilPengguna[K]) {
    setBorang((b) => ({ ...b, [k]: v }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const r: Ralat = {};
    if (!borang.namaPengurus.trim()) r.namaPengurus = 'Tulis nama pengurus.';
    if (!borang.namaLadang.trim()) r.namaLadang = 'Tulis nama ladang.';
    setRalat(r);
    const pertama = Object.keys(r)[0];
    if (pertama) {
      document.getElementById(`tetapan-${pertama}`)?.focus();
      return;
    }
    onSimpan({
      ...borang,
      namaPengurus: borang.namaPengurus.trim(),
      namaLadang: borang.namaLadang.trim(),
      telefon: borang.telefon.trim(),
      lokasi: borang.lokasi.trim(),
    });
  }

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader kecil="Tetapan" tajuk="Ladang dan akaun" />

      <section className="card">
        <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr] md:gap-10 md:p-8">
          <div>
            <h2 className="text-[22px]">Profil ladang</h2>
            <p className="mt-1.5 text-[13.5px] text-muted">Nama ini muncul pada papan pemuka dan laporan.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Medan id="tetapan-namaPengurus" label="Nama pengurus" ralat={ralat.namaPengurus}>
                <input
                  id="tetapan-namaPengurus"
                  className="field"
                  autoComplete="name"
                  value={borang.namaPengurus}
                  onChange={(e) => ubah('namaPengurus', e.target.value)}
                  {...ariaRalat('tetapan-namaPengurus', ralat.namaPengurus)}
                />
              </Medan>
              <Medan id="tetapan-namaLadang" label="Nama ladang" ralat={ralat.namaLadang}>
                <input
                  id="tetapan-namaLadang"
                  className="field"
                  autoComplete="organization"
                  value={borang.namaLadang}
                  onChange={(e) => ubah('namaLadang', e.target.value)}
                  {...ariaRalat('tetapan-namaLadang', ralat.namaLadang)}
                />
              </Medan>
              <Medan id="tetapan-telefon" label="Nombor telefon">
                <input
                  id="tetapan-telefon"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="field tnum"
                  value={borang.telefon}
                  onChange={(e) => ubah('telefon', e.target.value)}
                />
              </Medan>
              <Medan id="tetapan-lokasi" label="Lokasi">
                <input
                  id="tetapan-lokasi"
                  className="field"
                  placeholder="Daerah, negeri"
                  value={borang.lokasi}
                  onChange={(e) => ubah('lokasi', e.target.value)}
                />
              </Medan>
            </div>
            <Medan id="tetapan-reban" label="Reban utama" petunjuk="Umur ternakan di papan pemuka diambil daripada reban ini.">
              <select
                id="tetapan-reban"
                className="field"
                value={borang.rebanAktifId ?? ''}
                onChange={(e) => ubah('rebanAktifId', e.target.value || null)}
                disabled={aktif.length === 0}
              >
                {aktif.length === 0 && <option value="">Tiada reban aktif</option>}
                {aktif.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </select>
            </Medan>
            <div className="flex items-center justify-end gap-4 pt-1">
              {berubah && <p className="text-[13px] text-muted">Ada perubahan belum disimpan</p>}
              <button type="submit" className="btn btn--primary" disabled={!berubah}>
                Simpan profil
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="card">
        <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr] md:gap-10 md:p-8">
          <div>
            <h2 className="text-[22px]">Paparan</h2>
            <p className="mt-1.5 text-[13.5px] text-muted">Disimpan pada peranti ini.</p>
          </div>
          <fieldset>
            <legend className="field-label">Tema</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['gelap', 'cerah'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTema(t)}
                  aria-pressed={tema === t}
                  className={`group rounded-[var(--radius-card)] border p-3 text-left transition-[border-color,transform] duration-150 hover:-translate-y-0.5 ${
                    tema === t ? 'border-gold' : 'border-line hover:border-line-strong'
                  }`}
                >
                  <span
                    className="mb-3 flex h-16 items-end gap-1.5 rounded-md p-2.5"
                    style={{ background: t === 'gelap' ? '#0c0b0a' : '#faf9f6', boxShadow: 'inset 0 0 0 1px rgb(128 128 128 / .2)' }}
                    aria-hidden="true"
                  >
                    <span className="h-full w-6 rounded-sm" style={{ background: t === 'gelap' ? '#1b1a18' : '#f3f1ec' }} />
                    <span className="h-5 flex-1 rounded-sm" style={{ background: t === 'gelap' ? '#131211' : '#ffffff', boxShadow: 'inset 0 0 0 1px rgb(128 128 128 / .15)' }} />
                    <span className="h-5 w-8 rounded-sm" style={{ background: t === 'gelap' ? '#d6bf8f' : '#14120e' }} />
                  </span>
                  <span className="block text-[14px] font-medium text-ink">{t === 'gelap' ? 'Hitam' : 'Putih'}</span>
                  <span className="block text-[12.5px] text-muted">{t === 'gelap' ? 'Hitam dengan emas champagne' : 'Putih dengan dakwat hitam'}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="card">
        <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr] md:gap-10 md:p-8">
          <div>
            <h2 className="text-[22px]">Data</h2>
            <p className="mt-1.5 text-[13.5px] text-muted">Semua rekod disimpan dalam pelayar ini sahaja.</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-[46ch] text-[14px] text-ink-2">
              Set semula memadam semua reban, rekod harian, rawatan dan catatan, kemudian memuat semula data contoh.
            </p>
            <button type="button" className="btn btn--danger" onClick={() => setSahkanSetSemula(true)}>
              Set semula data
            </button>
          </div>
        </div>
      </section>

      {sahkanSetSemula && (
        <Modal
          lebar="sm"
          tajuk="Set semula semua data?"
          keterangan="Rekod yang anda masukkan akan dipadam dan tidak boleh dikembalikan."
          onTutup={() => setSahkanSetSemula(false)}
        >
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn--secondary" onClick={() => setSahkanSetSemula(false)}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn--primary"
              style={{ background: 'var(--c-danger)', color: '#fff' }}
              onClick={() => {
                setSahkanSetSemula(false);
                onSetSemula();
              }}
            >
              Padam dan set semula
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
