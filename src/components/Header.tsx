import { useEffect, useState } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import type { ProfilPengguna, Tema } from '../types';
import { formatMasa, formatTarikhPanjang, formatTarikhPendek, keISO } from '../lib/tarikh';
import { inisial } from '../lib/format';

interface HeaderProps {
  profil: ProfilPengguna;
  namaRebanUtama: string | null;
  tema: Tema;
  onTukarTema: () => void;
  onBukaMenu: () => void;
}

export default function Header({ profil, namaRebanUtama, tema, onTukarTema, onBukaMenu }: HeaderProps) {
  const [masa, setMasa] = useState(() => new Date());

  useEffect(() => {
    // Selaraskan dengan awal minit supaya jam tidak lewat.
    let interval: ReturnType<typeof setInterval>;
    const tunggu = setTimeout(() => {
      setMasa(new Date());
      interval = setInterval(() => setMasa(new Date()), 60_000);
    }, (60 - new Date().getSeconds()) * 1000);
    return () => {
      clearTimeout(tunggu);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="no-print sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-line bg-bg px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBukaMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:bg-raised lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <p className="truncate text-[14px] text-muted">
          <span className="hidden text-ink-2 sm:inline">{formatTarikhPanjang(masa)}</span>
          <span className="text-ink-2 sm:hidden">{formatTarikhPendek(keISO(masa))}</span>
          <span className="mx-2 text-line-strong">/</span>
          <span className="tnum">{formatMasa(masa)}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {namaRebanUtama && (
          <span className="hidden h-9 items-center gap-2 rounded-full border border-line px-3.5 text-[13px] text-ink-2 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            Reban utama: {namaRebanUtama}
          </span>
        )}
        <button
          type="button"
          onClick={onTukarTema}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
          aria-label={tema === 'gelap' ? 'Tukar ke tema cerah' : 'Tukar ke tema gelap'}
          title={tema === 'gelap' ? 'Tema cerah' : 'Tema gelap'}
        >
          {tema === 'gelap' ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
        </button>
        <div className="flex items-center gap-3 pl-1">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-raised text-[13px] font-medium tracking-wide text-ink"
            aria-hidden="true"
          >
            {inisial(profil.namaPengurus)}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-[14px] font-medium text-ink">{profil.namaPengurus || 'Pengurus'}</p>
            <p className="text-[12.5px] text-muted">Pengurus ladang</p>
          </div>
        </div>
      </div>
    </header>
  );
}
