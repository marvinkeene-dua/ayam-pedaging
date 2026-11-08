import { AlertCircle } from 'lucide-react';
import JalurAngka from '../components/KPICard';
import type { Angka } from '../components/KPICard';
import { Suspense, lazy } from 'react';

// Recharts ialah bahagian terbesar bundle; muat selepas angka utama dipaparkan.
const ChartsSection = lazy(() => import('../components/ChartsSection'));
import VaccineSchedule from '../components/VaccineSchedule';
import DailyEntryForm from '../components/DailyEntryForm';
import DailyNotesFeed from '../components/DailyNotesFeed';
import type { KemaskiniHarian, NotaHarian, ProfilPengguna, Reban, RekodHarian, RekodVaksin, Tema } from '../types';
import { rebanUtama, ringkasanLadang, statusVaksin, umurReban } from '../lib/ladang';
import { formatTarikhPendek } from '../lib/tarikh';
import { nombor, nombor2, namaPertama } from '../lib/format';

interface DashboardProps {
  profil: ProfilPengguna;
  reban: Reban[];
  log: RekodHarian[];
  vaksin: RekodVaksin[];
  nota: NotaHarian[];
  tema: Tema;
  onHantarKemaskini: (data: KemaskiniHarian) => void;
  onTandaSelesai: (id: string) => void;
  onPadamNota: (id: string) => void;
  onKeKesihatan: () => void;
}

function sapaan(jam: number) {
  if (jam >= 5 && jam < 12) return 'Selamat pagi';
  if (jam >= 12 && jam < 15) return 'Selamat tengah hari';
  if (jam >= 15 && jam < 19) return 'Selamat petang';
  return 'Selamat malam';
}

function bandingSemalam(kini: number, semalam: number | null, unit: string) {
  if (semalam === null) return 'Tiada rekod semalam';
  const beza = kini - semalam;
  if (beza === 0) return 'Sama seperti semalam';
  return `${beza > 0 ? '+' : '−'}${nombor(Math.abs(beza))} ${unit} berbanding semalam`;
}

export default function Dashboard({
  profil,
  reban,
  log,
  vaksin,
  nota,
  tema,
  onHantarKemaskini,
  onTandaSelesai,
  onPadamNota,
  onKeKesihatan,
}: DashboardProps) {
  const s = ringkasanLadang(reban, log);
  const utama = rebanUtama(reban, profil.rebanAktifId);
  const umur = umurReban(utama);
  const rebanAktif = reban.filter((r) => r.status === 'aktif');
  const tertunggak = vaksin.filter((v) => statusVaksin(v) === 'tertunggak');
  const gramSeekor = s.populasiSemasa > 0 ? (s.dedakHariIni * 1000) / s.populasiSemasa : 0;

  const angka: Angka[] = [
    {
      label: 'Populasi semasa',
      nilai: nombor(s.populasiSemasa),
      unit: 'ekor',
      nota: s.populasiAwal ? `Daripada ${nombor(s.populasiAwal)} ekor` : 'Tiada reban aktif',
    },
    {
      label: 'Kematian hari ini',
      nilai: nombor(s.kematianHariIni),
      unit: 'ekor',
      nota: bandingSemalam(s.kematianHariIni, s.kematianSemalam, 'ekor'),
      amaran: s.populasiSemasa > 0 && s.kematianHariIni / s.populasiSemasa > 0.002,
    },
    {
      label: 'Kadar kematian',
      nilai: nombor2(s.kadarKematian),
      unit: '%',
      nota: `${nombor(s.kematianKumulatif)} ekor sepanjang kitaran`,
      amaran: s.kadarKematian > 5,
    },
    {
      label: 'Dedak hari ini',
      nilai: nombor(s.dedakHariIni),
      unit: 'kg',
      nota: s.dedakHariIni > 0 ? `Lebih kurang ${nombor(gramSeekor)} g seekor` : 'Belum direkodkan',
    },
    {
      label: 'Umur ternakan',
      nilai: umur !== null ? String(umur) : '—',
      unit: umur !== null ? 'hari' : undefined,
      nota: utama?.tarikhMasuk ? `${utama.nama}, masuk ${formatTarikhPendek(utama.tarikhMasuk)}` : 'Tiada reban aktif',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2">
        <div>
          <p className="mb-2 text-[13px] font-medium text-gold">{profil.namaLadang}</p>
          <h1 className="text-[36px] leading-[1.05] sm:text-[46px]">
            {sapaan(new Date().getHours())}, {namaPertama(profil.namaPengurus) || 'pengurus'}.
          </h1>
        </div>
        {!s.adaRekodHariIni && rebanAktif.length > 0 && (
          <a href="#rekod-harian" className="link text-[14px]">
            Rekod hari ini belum diisi
          </a>
        )}
      </div>

      {tertunggak.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--radius-card)] border px-5 py-3.5 text-[14px]"
          style={{ borderColor: 'color-mix(in srgb, var(--c-danger) 35%, transparent)', background: 'var(--c-danger-soft)' }}
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" strokeWidth={1.75} />
          <p className="min-w-0 flex-1 text-ink">
            {tertunggak.length === 1
              ? `${tertunggak[0].nama} tertunggak sejak ${formatTarikhPendek(tertunggak[0].tarikh)}.`
              : `${tertunggak.length} rawatan tertunggak. Yang paling lama: ${tertunggak[0].nama}.`}
          </p>
          <button type="button" onClick={onKeKesihatan} className="link text-[14px]" style={{ color: 'var(--c-danger)' }}>
            Buka rekod kesihatan
          </button>
        </div>
      )}

      <JalurAngka angka={angka} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Suspense fallback={<section className="card h-full min-h-[440px]" aria-busy="true" aria-label="Memuatkan carta" />}>
            <ChartsSection log={log} tema={tema} />
          </Suspense>
        </div>
        <VaccineSchedule jadual={vaksin} onTandaSelesai={onTandaSelesai} onLihatSemua={onKeKesihatan} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div id="rekod-harian" className="scroll-mt-24">
          <DailyEntryForm rebanAktif={rebanAktif} rebanUtamaId={utama?.id ?? null} onHantar={onHantarKemaskini} />
        </div>
        <div className="xl:col-span-2">
          <DailyNotesFeed notaList={nota} reban={reban} onPadam={onPadamNota} />
        </div>
      </div>
    </div>
  );
}
