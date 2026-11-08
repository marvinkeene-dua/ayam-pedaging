import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Cell, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { RekodHarian, Tema } from '../types';
import { siriHarian } from '../lib/ladang';
import { dariISO, formatTarikh, namaHariPendek } from '../lib/tarikh';
import { nombor } from '../lib/format';
import { CardHeader } from './ui';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

const palet: Record<Tema, { emas: string; bar: string; barKini: string; grid: string; teks: string }> = {
  gelap: { emas: '#d6bf8f', bar: 'rgba(243,239,230,0.16)', barKini: 'rgba(243,239,230,0.55)', grid: 'rgba(243,239,230,0.07)', teks: '#918b7f' },
  cerah: { emas: '#9c7c3f', bar: 'rgba(20,18,14,0.12)', barKini: 'rgba(20,18,14,0.6)', grid: 'rgba(20,18,14,0.07)', teks: '#6c675d' },
};

const julat = [7, 14, 30] as const;

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { tarikh: string; kematian: number | null; dedakKg: number | null } }>;
}

function Petunjuk({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-[10px] border border-line-strong bg-raised px-4 py-3 text-[13px]" style={{ boxShadow: 'var(--c-shadow)' }}>
      <p className="mb-2 font-medium text-ink">{formatTarikh(d.tarikh)}</p>
      {d.kematian === null && d.dedakKg === null ? (
        <p className="text-muted">Tiada rekod</p>
      ) : (
        <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1">
          <dt className="text-muted">Kematian</dt>
          <dd className="tnum text-right text-ink">{d.kematian ?? 0} ekor</dd>
          <dt className="text-muted">Dedak</dt>
          <dd className="tnum text-right text-gold">{d.dedakKg !== null ? `${nombor(d.dedakKg)} kg` : '—'}</dd>
        </dl>
      )}
    </div>
  );
}

export default function ChartsSection({ log, tema }: { log: RekodHarian[]; tema: Tema }) {
  const [hari, setHari] = useLocalStorageState<(typeof julat)[number]>('julatCarta', 14);
  const p = palet[tema];

  const data = useMemo(() => {
    const siri = siriHarian(log, hari);
    return siri.map((t, i) => {
      const d = dariISO(t.tarikh);
      return {
        ...t,
        label: hari <= 7 ? `${namaHariPendek[d.getDay()]} ${d.getDate()}` : String(d.getDate()),
        kini: i === siri.length - 1,
      };
    });
  }, [log, hari]);

  const jumlahKematian = data.reduce((j, d) => j + (d.kematian ?? 0), 0);
  const hariAdaDedak = data.filter((d) => d.dedakKg !== null);
  const purataDedak = hariAdaDedak.length ? hariAdaDedak.reduce((j, d) => j + (d.dedakKg ?? 0), 0) / hariAdaDedak.length : 0;

  return (
    <section className="card flex h-full flex-col">
      <CardHeader
        tajuk="Kematian dan dedak"
        keterangan={`${hari} hari terakhir: ${nombor(jumlahKematian)} ekor mati, purata ${nombor(purataDedak)} kg dedak sehari`}
        tindakan={
          <div className="segmented" role="group" aria-label="Julat carta">
            {julat.map((n) => (
              <button key={n} type="button" aria-pressed={hari === n} onClick={() => setHari(n)}>
                {n} hari
              </button>
            ))}
          </div>
        }
      />

      <div className="flex items-center gap-5 px-6 pb-2 text-[12.5px] text-muted">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: p.barKini }} aria-hidden="true" />
          Kematian (ekor)
        </span>
        <span className="flex items-center gap-2">
          <span className="h-[2px] w-4 rounded-full" style={{ background: p.emas }} aria-hidden="true" />
          Dedak (kg)
        </span>
      </div>

      <div className="h-[300px] w-full flex-1 px-2 pb-4" role="img" aria-label={`Carta kematian dan dedak bagi ${hari} hari terakhir`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={p.grid} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: p.teks }}
              tickLine={false}
              axisLine={false}
              interval={hari === 30 ? 2 : 0}
              dy={6}
            />
            <YAxis yAxisId="kiri" tick={{ fontSize: 12, fill: p.teks }} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
            <YAxis
              yAxisId="kanan"
              orientation="right"
              tick={{ fontSize: 12, fill: p.teks }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => nombor(v)}
            />
            <Tooltip content={<Petunjuk />} cursor={{ fill: p.grid }} />
            <Bar
              yAxisId="kiri"
              dataKey="kematian"
              radius={[3, 3, 0, 0]}
              maxBarSize={hari === 30 ? 12 : 24}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.tarikh} fill={d.kini ? p.barKini : p.bar} />
              ))}
            </Bar>
            <Line
              yAxisId="kanan"
              type="monotone"
              dataKey="dedakKg"
              stroke={p.emas}
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 4, fill: p.emas, stroke: 'var(--c-surface)', strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
