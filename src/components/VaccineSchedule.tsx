import { Check } from 'lucide-react';
import type { RekodVaksin } from '../types';
import { statusVaksin, susunVaksin } from '../lib/ladang';
import { formatTarikhPendek, relatif } from '../lib/tarikh';
import { CardHeader, Kosong } from './ui';

interface VaccineScheduleProps {
  jadual: RekodVaksin[];
  onTandaSelesai: (id: string) => void;
  onLihatSemua: () => void;
}

/** Rawatan yang belum selesai, tertunggak dahulu. */
export default function VaccineSchedule({ jadual, onTandaSelesai, onLihatSemua }: VaccineScheduleProps) {
  const belum = susunVaksin(jadual).filter((v) => !v.selesai);
  const dipapar = belum.slice(0, 4);

  return (
    <section className="card flex h-full flex-col">
      <CardHeader
        tajuk="Rawatan seterusnya"
        keterangan={belum.length ? `${belum.length} belum selesai` : 'Semua rawatan selesai'}
        tindakan={
          <button type="button" onClick={onLihatSemua} className="link mt-1 text-[13px]">
            Lihat semua
          </button>
        }
      />

      {dipapar.length === 0 ? (
        <Kosong>Tiada rawatan menunggu. Tambah rekod baru di halaman Kesihatan.</Kosong>
      ) : (
        <ul className="flex-1 divide-y divide-line border-t border-line">
          {dipapar.map((v) => {
            const status = statusVaksin(v);
            const lewat = status === 'tertunggak';
            return (
              <li key={v.id} className="group flex items-center gap-4 px-6 py-4">
                <div className="w-14 shrink-0">
                  <p className={`figure text-[22px] ${lewat ? 'text-danger' : 'text-ink'}`}>{formatTarikhPendek(v.tarikh).split(' ')[0]}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{formatTarikhPendek(v.tarikh).split(' ')[1]}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-ink">{v.nama}</p>
                  <p className={`text-[13px] ${lewat ? 'text-danger' : 'text-muted'}`}>
                    {lewat ? `Tertunggak, ${relatif(v.tarikh).toLowerCase()}` : relatif(v.tarikh)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTandaSelesai(v.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-muted transition-[color,border-color,transform] duration-150 hover:-translate-y-px hover:border-gold hover:text-gold active:translate-y-px"
                  aria-label={`Tanda ${v.nama} selesai`}
                  title="Tanda selesai"
                >
                  <Check className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
