import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { KemaskiniHarian, Reban } from '../types';
import { hariIni } from '../lib/tarikh';
import { nombor } from '../lib/format';
import { CardHeader, Medan } from './ui';
import { ariaRalat } from '../lib/borang';

interface DailyEntryFormProps {
  rebanAktif: Reban[];
  rebanUtamaId: string | null;
  onHantar: (data: KemaskiniHarian) => void;
}

type Ralat = Partial<Record<'tarikh' | 'reban' | 'kematian' | 'dedak' | 'umum', string>>;

export default function DailyEntryForm({ rebanAktif, rebanUtamaId, onHantar }: DailyEntryFormProps) {
  const [tarikh, setTarikh] = useState(hariIni());
  const [rebanId, setRebanId] = useState(rebanUtamaId ?? rebanAktif[0]?.id ?? '');
  const [kematian, setKematian] = useState('');
  const [dedak, setDedak] = useState('');
  const [nota, setNota] = useState('');
  const [ralat, setRalat] = useState<Ralat>({});
  const borang = useRef<HTMLFormElement>(null);

  const reban = rebanAktif.find((r) => r.id === rebanId) ?? rebanAktif[0];

  function sahkan(): Ralat {
    const r: Ralat = {};
    const hari = hariIni();
    if (!tarikh) r.tarikh = 'Pilih tarikh rekod.';
    else if (tarikh > hari) r.tarikh = 'Tarikh tidak boleh selepas hari ini.';

    if (kematian.trim() !== '') {
      const n = Number(kematian);
      if (!Number.isInteger(n) || n < 0) r.kematian = 'Tulis bilangan ekor sebagai nombor bulat, 0 atau lebih.';
      else if (!reban) r.reban = 'Tiada reban aktif untuk direkodkan.';
      else if (n > reban.populasiSemasa) r.kematian = `${reban.nama} hanya ada ${nombor(reban.populasiSemasa)} ekor.`;
    }
    if (dedak.trim() !== '') {
      const n = Number(dedak);
      if (Number.isNaN(n) || n < 0) r.dedak = 'Tulis berat dedak dalam kg, 0 atau lebih.';
    }
    if (kematian.trim() === '' && dedak.trim() === '' && nota.trim() === '') {
      r.umum = 'Isi sekurang-kurangnya satu: kematian, dedak atau nota.';
    }
    return r;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const r = sahkan();
    setRalat(r);
    if (Object.keys(r).length > 0) {
      // Fokus medan pertama yang gagal.
      const pertama = (['tarikh', 'reban', 'kematian', 'dedak'] as const).find((k) => r[k]);
      if (pertama) borang.current?.querySelector<HTMLElement>(`#harian-${pertama}`)?.focus();
      return;
    }

    onHantar({
      tarikh,
      rebanId: reban?.id ?? null,
      kematian: kematian.trim() !== '' ? Number(kematian) : undefined,
      dedakKg: dedak.trim() !== '' ? Number(dedak) : undefined,
      nota: nota.trim() || undefined,
    });

    setKematian('');
    setDedak('');
    setNota('');
  }

  const tiadaReban = rebanAktif.length === 0;

  return (
    <section className="card">
      <CardHeader tajuk="Rekod hari ini" keterangan="Angka ditambah kepada jumlah tarikh yang dipilih." />
      <form ref={borang} onSubmit={handleSubmit} noValidate className="space-y-4 border-t border-line px-6 pb-6 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <Medan id="harian-tarikh" label="Tarikh" ralat={ralat.tarikh}>
            <input
              id="harian-tarikh"
              type="date"
              className="field tnum"
              value={tarikh}
              max={hariIni()}
              onChange={(e) => setTarikh(e.target.value)}
              {...ariaRalat('harian-tarikh', ralat.tarikh)}
            />
          </Medan>
          <Medan id="harian-reban" label="Reban" ralat={ralat.reban}>
            <select
              id="harian-reban"
              className="field"
              value={reban?.id ?? ''}
              onChange={(e) => setRebanId(e.target.value)}
              disabled={tiadaReban}
              {...ariaRalat('harian-reban', ralat.reban)}
            >
              {tiadaReban && <option value="">Tiada reban aktif</option>}
              {rebanAktif.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </Medan>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Medan id="harian-kematian" label="Kematian (ekor)" ralat={ralat.kematian}>
            <input
              id="harian-kematian"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              className="field tnum"
              placeholder="0"
              value={kematian}
              onChange={(e) => setKematian(e.target.value)}
              disabled={tiadaReban}
              {...ariaRalat('harian-kematian', ralat.kematian)}
            />
          </Medan>
          <Medan id="harian-dedak" label="Dedak (kg)" ralat={ralat.dedak}>
            <input
              id="harian-dedak"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              className="field tnum"
              placeholder="0"
              value={dedak}
              onChange={(e) => setDedak(e.target.value)}
              {...ariaRalat('harian-dedak', ralat.dedak)}
            />
          </Medan>
        </div>

        <Medan id="harian-nota" label="Nota">
          <textarea
            id="harian-nota"
            className="field"
            rows={3}
            placeholder="Cuaca, tingkah laku ayam, kerja penyelenggaraan"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
        </Medan>

        {ralat.umum && (
          <p className="field-error" role="alert">
            {ralat.umum}
          </p>
        )}

        <button type="submit" className="btn btn--primary w-full">
          Simpan rekod
        </button>
      </form>
    </section>
  );
}
