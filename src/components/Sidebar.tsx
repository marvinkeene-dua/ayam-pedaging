import { useEffect } from 'react';
import {
  LayoutGrid,
  Warehouse,
  Syringe,
  FileText,
  Settings2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Halaman } from '../types';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

interface ItemNav {
  halaman: Halaman;
  label: string;
  icon: LucideIcon;
}

const itemNav: ItemNav[] = [
  { halaman: 'papanPemuka', label: 'Papan pemuka', icon: LayoutGrid },
  { halaman: 'ladangSaya', label: 'Reban', icon: Warehouse },
  { halaman: 'rekodKesihatan', label: 'Kesihatan', icon: Syringe },
  { halaman: 'laporan', label: 'Laporan', icon: FileText },
  { halaman: 'tetapan', label: 'Tetapan', icon: Settings2 },
];

interface SidebarProps {
  halamanAktif: Halaman;
  onNavigate: (halaman: Halaman) => void;
  mobileTerbuka: boolean;
  onTutupMobile: () => void;
  onLogKeluar: () => void;
  namaLadang: string;
  bilTertunggak: number;
}

export function Tanda({ huruf, besar = false }: { huruf: string; besar?: boolean }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-full border border-gold font-display text-ink ${
        besar ? 'h-14 w-14 text-[26px]' : 'h-9 w-9 text-[17px]'
      }`}
      aria-hidden="true"
    >
      <span className="translate-y-[-1px]">{huruf}</span>
    </span>
  );
}

export default function Sidebar({
  halamanAktif,
  onNavigate,
  mobileTerbuka,
  onTutupMobile,
  onLogKeluar,
  namaLadang,
  bilTertunggak,
}: SidebarProps) {
  const [dikecilkan, setDikecilkan] = useLocalStorageState('sidebarKecil', false);

  useEffect(() => {
    if (!mobileTerbuka) return;
    const onKekunci = (e: KeyboardEvent) => e.key === 'Escape' && onTutupMobile();
    document.addEventListener('keydown', onKekunci);
    return () => document.removeEventListener('keydown', onKekunci);
  }, [mobileTerbuka, onTutupMobile]);

  const kecil = dikecilkan && !mobileTerbuka;

  return (
    <>
      {mobileTerbuka && (
        <div onClick={onTutupMobile} className="anim-lapik fixed inset-0 z-40 bg-black/60 lg:hidden" aria-hidden="true" />
      )}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 flex h-full w-[264px] flex-col border-r border-line bg-bg transition-[transform,width] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] lg:static lg:translate-x-0 ${
          mobileTerbuka ? 'translate-x-0' : '-translate-x-full'
        } ${kecil ? 'lg:w-[80px]' : 'lg:w-[248px]'}`}
        aria-label="Navigasi utama"
      >
        <div className={`flex h-[76px] items-center gap-3 ${kecil ? 'justify-center px-0' : 'px-6'}`}>
          <Tanda huruf={(namaLadang.trim()[0] ?? 'A').toUpperCase()} />
          {!kecil && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[19px] leading-tight text-ink">{namaLadang || 'Ayam Pedaging'}</p>
              <p className="truncate text-[12.5px] text-muted">Ayam pedaging</p>
            </div>
          )}
          <button
            type="button"
            onClick={onTutupMobile}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-raised hover:text-ink lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className={`hairline ${kecil ? 'mx-4' : 'mx-6'}`} />

        <nav className={`flex-1 space-y-0.5 py-5 ${kecil ? 'px-3' : 'px-4'}`}>
          {itemNav.map((item) => {
            const Icon = item.icon;
            const aktif = item.halaman === halamanAktif;
            const lencana = item.halaman === 'rekodKesihatan' && bilTertunggak > 0 ? bilTertunggak : 0;
            return (
              <button
                key={item.halaman}
                type="button"
                onClick={() => onNavigate(item.halaman)}
                aria-current={aktif ? 'page' : undefined}
                title={kecil ? item.label : undefined}
                aria-label={kecil ? item.label : undefined}
                className={`group relative flex h-11 w-full items-center gap-3 rounded-lg text-[15px] transition-colors duration-150 ${
                  kecil ? 'justify-center' : 'px-3'
                } ${aktif ? 'bg-raised text-ink' : 'text-muted hover:bg-raised/60 hover:text-ink'}`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-gold transition-opacity duration-200 ${
                    aktif ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden="true"
                />
                <Icon className={`h-[18px] w-[18px] shrink-0 ${aktif ? 'text-gold' : ''}`} strokeWidth={1.5} />
                {!kecil && <span className="flex-1 truncate text-left">{item.label}</span>}
                {lencana > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-soft px-1.5 text-[11.5px] font-medium text-danger ${
                      kecil ? 'absolute right-1.5 top-1' : ''
                    }`}
                    aria-label={`${lencana} rawatan tertunggak`}
                  >
                    {lencana}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className={`space-y-0.5 border-t border-line py-4 ${kecil ? 'px-3' : 'px-4'}`}>
          <button
            type="button"
            onClick={() => setDikecilkan((v) => !v)}
            className={`hidden h-11 w-full items-center gap-3 rounded-lg text-[15px] text-muted transition-colors hover:bg-raised/60 hover:text-ink lg:flex ${
              kecil ? 'justify-center' : 'px-3'
            }`}
            aria-label={kecil ? 'Besarkan bar sisi' : 'Kecilkan bar sisi'}
            aria-expanded={!kecil}
          >
            {kecil ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.5} />
            )}
            {!kecil && <span>Kecilkan</span>}
          </button>
          <button
            type="button"
            onClick={onLogKeluar}
            title={kecil ? 'Log keluar' : undefined}
            aria-label={kecil ? 'Log keluar' : undefined}
            className={`flex h-11 w-full items-center gap-3 rounded-lg text-[15px] text-muted transition-colors hover:bg-raised/60 hover:text-ink ${
              kecil ? 'justify-center' : 'px-3'
            }`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
            {!kecil && <span>Log keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
