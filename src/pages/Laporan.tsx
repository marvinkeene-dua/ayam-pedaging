import { useMemo } from 'react';
import { Download, Printer } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { useToast } from '../components/Toast';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import type { ProfilPengguna, Reban, RekodHarian } from '../types';
import { ringkasanLadang, siriHarian } from '../lib/ladang';
import { dariISO, formatTarikh, hariIni, namaHari } from '../lib/tarikh';
import { nombor, nombor1, nombor2 } from '../lib/format';
import { keCSV } from '../lib/csv';

interface LaporanProps {
  profil: ProfilPengguna;
  reban: Reban[];
  log: RekodHarian[];
}

const julat = [7, 14, 30] as const;

export default function Laporan({ profil, reban, log }: LaporanProps) {
  const [hari, setHari] = useLocalStorageState<(typeof julat)[number]>('julatLaporan', 7);
  const toast = useToast();
  const s = ringkasanLadang(reban, log);

  const siri = useMemo(() => siriHarian(log, hari), [log, hari]);
  const adaRekod = siri.filter((d) => d.kematian !== null || d.dedakKg !== null);
  const jumlahKematian = siri.reduce((j, d) => j + (d.kematian ?? 0), 0);
  const jumlahDedak = siri.reduce((j, d) => j + (d.dedakKg ?? 0), 0);
  const purataDedak = adaRekod.length ? jumlahDedak / adaRekod.length : 0;
  const gramSeekor = s.populasiSemasa > 0 ? (purataDedak * 1000) / s.populasiSemasa : 0;
  const kelangsungan = s.populasiAwal > 0 ? (s.populasiSemasa / s.populasiAwal) * 100 : 0;

  function muatTurunCSV() {
    const baris = [
      ['Tarikh', 'Hari', 'Kematian (ekor)', 'Dedak (kg)'],
      ...siri.map((d) => [d.tarikh, namaHari[dariISO(d.tarikh).getDay()], d.kematian ?? '', d.dedakKg ?? '']),
      ['Jumlah', '', jumlahKematian, jumlahDedak],
    ];
    const csv = keCSV(baris);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${profil.namaLadang.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ladang'}-${hariIni()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Laporan ${hari} hari dimuat turun.`);
  }

  const angka = [
    { label: 'Kematian', nilai: nombor(jumlahKematian), unit: 'ekor', nota: `Dalam ${hari} hari` },
    { label: 'Purata dedak sehari', nilai: nombor(purataDedak), unit: 'kg', nota: `${nombor(jumlahDedak)} kg keseluruhan` },
    { label: 'Dedak seekor sehari', nilai: nombor(gramSeekor), unit: 'g', nota: 'Purata dibahagi populasi semasa' },
    { label: 'Kadar hidup', nilai: nombor1(kelangsungan), unit: '%', nota: `${nombor2(s.kadarKematian)}% kematian kumulatif` },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        kecil="Laporan"
        tajuk="Ringkasan ladang"
        keterangan={`${profil.namaLadang}${profil.lokasi ? `, ${profil.lokasi}` : ''}. Dijana ${formatTarikh(hariIni())}.`}
        tindakan={
          <>
            <button type="button" onClick={() => window.print()} className="btn btn--secondary">
              <Printer className="h-4 w-4" strokeWidth={1.5} />
              Cetak
            </button>
            <button type="button" onClick={muatTurunCSV} className="btn btn--primary">
              <Download className="h-4 w-4" strokeWidth={1.5} />
              Muat turun CSV
            </button>
          </>
        }
      />

      <div className="no-print segmented" role="group" aria-label="Tempoh laporan">
        {julat.map((n) => (
          <button key={n} type="button" aria-pressed={hari === n} onClick={() => setHari(n)}>
            {n} hari
          </button>
        ))}
      </div>

      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line lg:grid-cols-4">
        {angka.map((a) => (
          <div key={a.label} className="flex min-h-[140px] flex-col justify-between gap-5 bg-surface p-5 sm:p-6">
            <p className="text-[13px] font-medium text-muted">{a.label}</p>
            <div>
              <p className="figure text-[36px] text-ink sm:text-[40px]">
                {a.nilai}
                <span className="ml-1.5 font-sans text-[14px] tracking-normal text-muted">{a.unit}</span>
              </p>
              <p className="mt-2 text-[13px] text-muted">{a.nota}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-baseline justify-between gap-4 px-6 pb-4 pt-5">
          <h2 className="text-[22px]">Rekod harian</h2>
          <p className="text-[13px] text-muted">
            {adaRekod.length} daripada {hari} hari ada rekod
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[14.5px]">
            <thead>
              <tr className="border-y border-line text-[12.5px] text-muted">
                <th scope="col" className="px-6 py-3 font-medium">Tarikh</th>
                <th scope="col" className="px-6 py-3 font-medium">Hari</th>
                <th scope="col" className="px-6 py-3 text-right font-medium">Kematian (ekor)</th>
                <th scope="col" className="px-6 py-3 text-right font-medium">Dedak (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...siri].reverse().map((d) => {
                const kosong = d.kematian === null && d.dedakKg === null;
                return (
                  <tr key={d.tarikh} className="transition-colors hover:bg-raised/50">
                    <td className="tnum px-6 py-3 text-ink">{formatTarikh(d.tarikh)}</td>
                    <td className="px-6 py-3 text-muted">{namaHari[dariISO(d.tarikh).getDay()]}</td>
                    <td className="tnum px-6 py-3 text-right text-ink">{kosong ? <span className="text-muted">—</span> : nombor(d.kematian ?? 0)}</td>
                    <td className="tnum px-6 py-3 text-right text-ink">{d.dedakKg === null ? <span className="text-muted">—</span> : nombor(d.dedakKg)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-line-strong">
                <th scope="row" colSpan={2} className="px-6 py-4 text-left font-medium text-ink">
                  Jumlah
                </th>
                <td className="figure px-6 py-4 text-right text-[20px] text-ink">{nombor(jumlahKematian)}</td>
                <td className="figure px-6 py-4 text-right text-[20px] text-gold">{nombor(jumlahDedak)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
