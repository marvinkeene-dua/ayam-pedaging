import { Trash2 } from 'lucide-react';
import type { NotaHarian, Reban } from '../types';
import { formatMasa, formatTarikh, keISO, relatif } from '../lib/tarikh';
import { CardHeader, Kosong } from './ui';

interface DailyNotesFeedProps {
  notaList: NotaHarian[];
  reban: Reban[];
  onPadam: (id: string) => void;
}

export default function DailyNotesFeed({ notaList, reban, onPadam }: DailyNotesFeedProps) {
  const namaReban = new Map(reban.map((r) => [r.id, r.nama]));
  const tersusun = [...notaList].sort((a, b) => b.tarikh.localeCompare(a.tarikh));

  return (
    <section className="card flex h-full flex-col">
      <CardHeader tajuk="Catatan ladang" keterangan={`${notaList.length} catatan`} />

      {tersusun.length === 0 ? (
        <Kosong>Belum ada catatan. Tulis nota dalam borang rekod hari ini.</Kosong>
      ) : (
        <ol className="max-h-[440px] flex-1 divide-y divide-line overflow-y-auto border-t border-line">
          {tersusun.map((nota) => {
            const d = new Date(nota.tarikh);
            const tarikh = keISO(d);
            const label = relatif(tarikh);
            return (
              <li key={nota.id} className="group grid grid-cols-[1fr_auto] gap-x-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="mb-1 flex flex-wrap items-center gap-x-2 text-[12.5px] text-muted">
                    <span className="text-ink-2">{label === 'Hari ini' || label === 'Semalam' ? label : formatTarikh(tarikh)}</span>
                    <span className="tnum">{formatMasa(d)}</span>
                    {nota.rebanId && namaReban.get(nota.rebanId) && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-gold">{namaReban.get(nota.rebanId)}</span>
                      </>
                    )}
                  </p>
                  <p className="max-w-[68ch] text-[15px] leading-relaxed text-ink">{nota.mesej}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onPadam(nota.id)}
                  className="flex h-9 w-9 items-center justify-center self-start rounded-lg text-muted opacity-100 transition-[opacity,color,background-color] duration-150 hover:bg-danger-soft hover:text-danger focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Padam catatan"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
