import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Search, Plus, Trash2, Check, RotateCcw, X } from 'lucide-react';
import Modal from '../components/Modal';
import { LencanaVaksin, Medan, PageHeader } from '../components/ui';
import { ariaRalat } from '../lib/borang';
import type { RekodVaksin, StatusVaksin } from '../types';
import { statusVaksin, susunVaksin } from '../lib/ladang';
import { formatTarikh, hariIni, relatif } from '../lib/tarikh';

interface RekodKesihatanProps {
  jadual: RekodVaksin[];
  onTogolSelesai: (id: string) => void;
  onSimpan: (rekod: RekodVaksin | Omit<RekodVaksin, 'id'>) => void;
  onPadam: (id: string) => void;
}

type Tapisan = 'semua' | StatusVaksin;

const tapisanList: Array<{ id: Tapisan; label: string }> = [
  { id: 'semua', label: 'Semua' },
  { id: 'tertunggak', label: 'Tertunggak' },
  { id: 'akanDatang', label: 'Akan datang' },
  { id: 'selesai', label: 'Selesai' },
];

interface Borang {
  id: string | null;
  nama: string;
  keterangan: string;
  tarikh: string;
  selesai: boolean;
}

export default function RekodKesihatan({ jadual, onTogolSelesai, onSimpan, onPadam }: RekodKesihatanProps) {
  const [carian, setCarian] = useState('');
  const [tapisan, setTapisan] = useState<Tapisan>('semua');
  const [borang, setBorang] = useState<Borang | null>(null);
  const [ralatNama, setRalatNama] = useState('');

  const kiraan = useMemo(() => {
    const k: Record<Tapisan, number> = { semua: jadual.length, tertunggak: 0, akanDatang: 0, selesai: 0 };
    jadual.forEach((v) => (k[statusVaksin(v)] += 1));
    return k;
  }, [jadual]);

  const tertapis = useMemo(() => {
    const q = carian.trim().toLowerCase();
    return susunVaksin(jadual).filter((v) => {
      const padanCarian = !q || v.nama.toLowerCase().includes(q) || v.keterangan.toLowerCase().includes(q);
      return padanCarian && (tapisan === 'semua' || statusVaksin(v) === tapisan);
    });
  }, [jadual, carian, tapisan]);

  function buka(v: RekodVaksin | null) {
    setRalatNama('');
    setBorang(
      v
        ? { id: v.id, nama: v.nama, keterangan: v.keterangan, tarikh: v.tarikh, selesai: v.selesai }
        : { id: null, nama: '', keterangan: '', tarikh: hariIni(), selesai: false },
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!borang) return;
    if (!borang.nama.trim()) {
      setRalatNama('Tulis nama vaksin atau ubat.');
      document.getElementById('vaksin-nama')?.focus();
      return;
    }
    const data = { nama: borang.nama.trim(), keterangan: borang.keterangan.trim(), tarikh: borang.tarikh || hariIni(), selesai: borang.selesai };
    onSimpan(borang.id ? { ...data, id: borang.id } : data);
    setBorang(null);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        kecil="Kesihatan"
        tajuk="Vaksin dan ubat"
        keterangan="Status dikira daripada tarikh: rawatan yang belum ditanda selesai selepas tarikhnya menjadi tertunggak."
        tindakan={
          <button type="button" onClick={() => buka(null)} className="btn btn--primary">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Tambah rawatan
          </button>
        }
      />

      <section className="card">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.5} />
            <label htmlFor="carian-vaksin" className="sr-only">
              Cari rawatan
            </label>
            <input
              id="carian-vaksin"
              type="search"
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              placeholder="Cari vaksin atau ubat"
              className="field pl-10 pr-10"
            />
            {carian && (
              <button
                type="button"
                onClick={() => setCarian('')}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-ink"
                aria-label="Kosongkan carian"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
          <div className="segmented max-w-full self-start overflow-x-auto sm:self-auto" role="group" aria-label="Tapis mengikut status">
            {tapisanList.map((t) => (
              <button key={t.id} type="button" aria-pressed={tapisan === t.id} onClick={() => setTapisan(t.id)} className="whitespace-nowrap">
                {t.label}
                <span className={`tnum ml-1.5 ${t.id === 'tertunggak' && kiraan.tertunggak > 0 ? 'text-danger' : 'opacity-60'}`}>
                  {kiraan[t.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {tertapis.length === 0 ? (
          <p className="px-6 py-14 text-center text-[14px] text-muted">
            {carian ? `Tiada rawatan sepadan dengan "${carian}".` : 'Tiada rawatan dalam kategori ini.'}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {tertapis.map((v) => {
              const status = statusVaksin(v);
              return (
                <li key={v.id} className="group flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => buka(v)}
                    className="min-w-0 flex-1 basis-64 rounded-md text-left"
                    aria-label={`Sunting ${v.nama}`}
                  >
                    <p className={`text-[15.5px] ${status === 'selesai' ? 'text-ink-2' : 'text-ink'} transition-colors group-hover:text-gold`}>
                      {v.nama}
                    </p>
                    {v.keterangan && <p className="mt-0.5 text-[13.5px] text-muted">{v.keterangan}</p>}
                  </button>

                  <div className="text-[13.5px] sm:w-36">
                    <p className="tnum text-ink-2">{formatTarikh(v.tarikh)}</p>
                    <p className={status === 'tertunggak' ? 'text-danger' : 'text-muted'}>{relatif(v.tarikh)}</p>
                  </div>

                  <div className="sm:w-28">
                    <LencanaVaksin status={status} />
                  </div>

                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onTogolSelesai(v.id)}
                      className={`btn btn--sm btn--secondary min-w-[148px] ${v.selesai ? 'text-muted' : ''}`}
                    >
                      {v.selesai ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Buka semula
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
                          Tanda selesai
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onPadam(v.id)}
                      aria-label={`Padam ${v.nama}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {borang && (
        <Modal
          tajuk={borang.id ? 'Sunting rawatan' : 'Rawatan baru'}
          keterangan="Rekod vaksin, vitamin atau ubat untuk kitaran semasa."
          onTutup={() => setBorang(null)}
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Medan id="vaksin-nama" label="Nama vaksin atau ubat" ralat={ralatNama}>
              <input
                id="vaksin-nama"
                className="field"
                placeholder="Contoh: Vaksin IBD"
                value={borang.nama}
                onChange={(e) => setBorang({ ...borang, nama: e.target.value })}
                {...ariaRalat('vaksin-nama', ralatNama)}
              />
            </Medan>
            <Medan id="vaksin-keterangan" label="Cara dan catatan">
              <textarea
                id="vaksin-keterangan"
                className="field"
                rows={2}
                placeholder="Contoh: Dalam air minuman, semua reban aktif"
                value={borang.keterangan}
                onChange={(e) => setBorang({ ...borang, keterangan: e.target.value })}
              />
            </Medan>
            <div className="grid grid-cols-2 gap-4">
              <Medan id="vaksin-tarikh" label="Tarikh">
                <input
                  id="vaksin-tarikh"
                  type="date"
                  className="field tnum"
                  value={borang.tarikh}
                  onChange={(e) => setBorang({ ...borang, tarikh: e.target.value })}
                />
              </Medan>
              <fieldset>
                <legend className="field-label">Status</legend>
                <div className="segmented h-[46px] w-full items-center" role="group">
                  <button type="button" className="flex-1" aria-pressed={!borang.selesai} onClick={() => setBorang({ ...borang, selesai: false })}>
                    Belum
                  </button>
                  <button type="button" className="flex-1" aria-pressed={borang.selesai} onClick={() => setBorang({ ...borang, selesai: true })}>
                    Selesai
                  </button>
                </div>
              </fieldset>
            </div>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn btn--secondary" onClick={() => setBorang(null)}>
                Batal
              </button>
              <button type="submit" className="btn btn--primary">
                {borang.id ? 'Simpan perubahan' : 'Tambah rawatan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
