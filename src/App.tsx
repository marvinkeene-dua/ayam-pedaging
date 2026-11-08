import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LockScreen from './components/LockScreen';
import { useToast } from './components/Toast';
import Dashboard from './pages/Dashboard';
// Halaman selain papan pemuka dimuat apabila dibuka, supaya muatan pertama kekal kecil.
const LadangSaya = lazy(() => import('./pages/LadangSaya'));
const RekodKesihatan = lazy(() => import('./pages/RekodKesihatan'));
const Laporan = lazy(() => import('./pages/Laporan'));
const Tetapan = lazy(() => import('./pages/Tetapan'));
import { janaDataContoh } from './data/mockData';
import { padamSemuaStorage, useLocalStorageState } from './hooks/useLocalStorageState';
import { rebanUtama, statusVaksin } from './lib/ladang';
import { gunaKemaskini } from './lib/kemaskini';
import { formatTarikhPendek, hariIni } from './lib/tarikh';
import { idBaru, nombor } from './lib/format';
import type {
  Halaman,
  KemaskiniHarian,
  NotaHarian,
  ProfilPengguna,
  Reban,
  RekodHarian,
  RekodVaksin,
  Tema,
} from './types';

const halamanSah: Halaman[] = ['papanPemuka', 'ladangSaya', 'rekodKesihatan', 'laporan', 'tetapan'];
const tajukHalaman: Record<Halaman, string> = {
  papanPemuka: 'Papan pemuka',
  ladangSaya: 'Reban',
  rekodKesihatan: 'Kesihatan',
  laporan: 'Laporan',
  tetapan: 'Tetapan',
};

function halamanDariHash(): Halaman {
  const h = window.location.hash.replace('#/', '') as Halaman;
  return halamanSah.includes(h) ? h : 'papanPemuka';
}

// Data contoh dijana sekali sahaja; storan yang sedia ada didahulukan.
let contoh: ReturnType<typeof janaDataContoh> | null = null;
const dapatContoh = () => (contoh ??= janaDataContoh());

/** Masukkan semula item ke kedudukan asalnya (untuk Buat asal). */
function sisip<T>(senarai: T[], item: T, indeks: number) {
  const salinan = [...senarai];
  salinan.splice(Math.min(indeks, salinan.length), 0, item);
  return salinan;
}

function App() {
  const toast = useToast();
  const [halaman, setHalaman] = useState<Halaman>(halamanDariHash);
  const [menuMobile, setMenuMobile] = useState(false);
  const [terkunci, setTerkunci] = useLocalStorageState('terkunci', false);
  const [tema, setTema] = useLocalStorageState<Tema>('tema', 'gelap');

  const [reban, setReban] = useLocalStorageState<Reban[]>('reban', () => dapatContoh().reban);
  const [log, setLog] = useLocalStorageState<RekodHarian[]>('log', () => dapatContoh().log);
  const [vaksin, setVaksin] = useLocalStorageState<RekodVaksin[]>('vaksin', () => dapatContoh().vaksin);
  const [nota, setNota] = useLocalStorageState<NotaHarian[]>('nota', () => dapatContoh().nota);
  const [profil, setProfil] = useLocalStorageState<ProfilPengguna>('profil', () => dapatContoh().profil);

  const kandungan = useRef<HTMLDivElement>(null);

  // Tema pada <html>, dan warna bar pelayar.
  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'cerah' ? '#faf9f6' : '#0c0b0a');
  }, [tema]);

  // Navigasi melalui hash supaya butang Kembali pelayar berfungsi.
  useEffect(() => {
    const onHash = () => setHalaman(halamanDariHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.title = `${tajukHalaman[halaman]} · ${profil.namaLadang || 'Ayam Pedaging'}`;
  }, [halaman, profil.namaLadang]);

  const navigasi = useCallback((h: Halaman) => {
    if (window.location.hash !== `#/${h}`) window.location.hash = `/${h}`;
    setHalaman(h);
    setMenuMobile(false);
    kandungan.current?.scrollTo({ top: 0 });
  }, []);

  const tutupMenu = useCallback(() => setMenuMobile(false), []);

  // ——— Rekod harian ———
  function handleHantarKemaskini(data: KemaskiniHarian) {
    const { tarikh, kematian, dedakKg, nota: teks } = data;
    const hasil = gunaKemaskini({ reban, log, nota }, data, new Date(), idBaru('n'));
    setReban(hasil.reban);
    setLog(hasil.log);
    setNota(hasil.nota);

    const bahagian: string[] = [];
    if (kematian !== undefined) bahagian.push(`${nombor(kematian)} kematian`);
    if (dedakKg !== undefined) bahagian.push(`${nombor(dedakKg)} kg dedak`);
    if (teks) bahagian.push('satu nota');
    const bila = tarikh === hariIni() ? 'hari ini' : formatTarikhPendek(tarikh);
    toast(`Disimpan untuk ${bila}: ${bahagian.join(', ')}.`);
  }

  function handlePadamNota(id: string) {
    const i = nota.findIndex((n) => n.id === id);
    if (i < 0) return;
    const item = nota[i];
    setNota((s) => s.filter((n) => n.id !== id));
    toast('Catatan dipadam.', { label: 'Buat asal', onKlik: () => setNota((s) => sisip(s, item, i)) });
  }

  // ——— Reban ———
  function handleSimpanReban(r: Reban) {
    const baru = !reban.some((x) => x.id === r.id);
    setReban((s) => (baru ? [...s, r] : s.map((x) => (x.id === r.id ? r : x))));
    toast(baru ? `${r.nama} ditambah.` : `${r.nama} dikemas kini.`);
  }

  function handlePadamReban(id: string) {
    const i = reban.findIndex((r) => r.id === id);
    if (i < 0) return;
    const item = reban[i];
    setReban((s) => s.filter((r) => r.id !== id));
    toast(`${item.nama} dipadam.`, { label: 'Buat asal', onKlik: () => setReban((s) => sisip(s, item, i)) });
  }

  // ——— Vaksin ———
  function handleTogolSelesai(id: string) {
    const v = vaksin.find((x) => x.id === id);
    if (!v) return;
    setVaksin((s) => s.map((x) => (x.id === id ? { ...x, selesai: !x.selesai } : x)));
    toast(v.selesai ? `${v.nama} dibuka semula.` : `${v.nama} ditanda selesai.`, {
      label: 'Buat asal',
      onKlik: () => setVaksin((s) => s.map((x) => (x.id === id ? { ...x, selesai: v.selesai } : x))),
    });
  }

  function handleSimpanVaksin(rekod: RekodVaksin | Omit<RekodVaksin, 'id'>) {
    if ('id' in rekod) {
      setVaksin((s) => s.map((x) => (x.id === rekod.id ? rekod : x)));
      toast(`${rekod.nama} dikemas kini.`);
    } else {
      setVaksin((s) => [...s, { ...rekod, id: idBaru('v') }]);
      toast(`${rekod.nama} ditambah pada ${formatTarikhPendek(rekod.tarikh)}.`);
    }
  }

  function handlePadamVaksin(id: string) {
    const i = vaksin.findIndex((v) => v.id === id);
    if (i < 0) return;
    const item = vaksin[i];
    setVaksin((s) => s.filter((v) => v.id !== id));
    toast(`${item.nama} dipadam.`, { label: 'Buat asal', onKlik: () => setVaksin((s) => sisip(s, item, i)) });
  }

  // ——— Tetapan ———
  function handleSimpanProfil(p: ProfilPengguna) {
    setProfil(p);
    toast('Profil ladang disimpan.');
  }

  function handleSetSemula() {
    padamSemuaStorage();
    contoh = null;
    const d = dapatContoh();
    setReban(d.reban);
    setLog(d.log);
    setVaksin(d.vaksin);
    setNota(d.nota);
    setProfil(d.profil);
    toast('Data contoh dimuat semula.');
    navigasi('papanPemuka');
  }

  if (terkunci) {
    return <LockScreen profil={profil} onMasuk={() => setTerkunci(false)} />;
  }

  const utama = rebanUtama(reban, profil.rebanAktifId);
  const bilTertunggak = vaksin.filter((v) => statusVaksin(v) === 'tertunggak').length;

  return (
    <div className="print-flat flex h-full w-full overflow-hidden bg-bg">
      <a
        href="#kandungan"
        className="no-print sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-action focus:px-4 focus:py-2.5 focus:text-on-action"
      >
        Langkau ke kandungan
      </a>

      <Sidebar
        halamanAktif={halaman}
        onNavigate={navigasi}
        mobileTerbuka={menuMobile}
        onTutupMobile={tutupMenu}
        onLogKeluar={() => setTerkunci(true)}
        namaLadang={profil.namaLadang}
        bilTertunggak={bilTertunggak}
      />

      <div ref={kandungan} className="print-flat flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Header
          profil={profil}
          namaRebanUtama={utama?.nama ?? null}
          tema={tema}
          onTukarTema={() => setTema((t) => (t === 'gelap' ? 'cerah' : 'gelap'))}
          onBukaMenu={() => setMenuMobile(true)}
        />

        <main id="kandungan" tabIndex={-1} className="flex-1 px-4 py-8 outline-none sm:px-8 sm:py-10">
          <Suspense fallback={null}>
          <div key={halaman} className="anim-halaman mx-auto w-full max-w-[1400px]">
            {halaman === 'papanPemuka' && (
              <Dashboard
                profil={profil}
                reban={reban}
                log={log}
                vaksin={vaksin}
                nota={nota}
                tema={tema}
                onHantarKemaskini={handleHantarKemaskini}
                onTandaSelesai={handleTogolSelesai}
                onPadamNota={handlePadamNota}
                onKeKesihatan={() => navigasi('rekodKesihatan')}
              />
            )}
            {halaman === 'ladangSaya' && (
              <LadangSaya
                rebanList={reban}
                rebanUtamaId={utama?.id ?? null}
                onSimpanReban={handleSimpanReban}
                onPadamReban={handlePadamReban}
              />
            )}
            {halaman === 'rekodKesihatan' && (
              <RekodKesihatan
                jadual={vaksin}
                onTogolSelesai={handleTogolSelesai}
                onSimpan={handleSimpanVaksin}
                onPadam={handlePadamVaksin}
              />
            )}
            {halaman === 'laporan' && <Laporan profil={profil} reban={reban} log={log} />}
            {halaman === 'tetapan' && (
              <Tetapan
                profil={profil}
                reban={reban}
                tema={tema}
                onSimpan={handleSimpanProfil}
                onTema={setTema}
                onSetSemula={handleSetSemula}
              />
            )}
          </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
