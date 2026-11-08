import { useEffect, useRef } from 'react';
import { Tanda } from './Sidebar';
import type { ProfilPengguna } from '../types';

export default function LockScreen({ profil, onMasuk }: { profil: ProfilPengguna; onMasuk: () => void }) {
  const butang = useRef<HTMLButtonElement>(null);
  useEffect(() => butang.current?.focus(), []);

  return (
    <main className="anim-lapik flex min-h-full items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center">
          <Tanda huruf={(profil.namaLadang.trim()[0] ?? 'A').toUpperCase()} besar />
        </div>
        <p className="text-[13px] font-medium text-gold">{profil.namaLadang}</p>
        <h1 className="mt-3 text-[40px] leading-[1.05]">Anda telah log keluar.</h1>
        <p className="mx-auto mt-4 max-w-[34ch] text-[15px] text-muted">
          Rekod ladang kekal tersimpan pada peranti ini. Log masuk semula untuk menyambung.
        </p>
        <button ref={butang} type="button" onClick={onMasuk} className="btn btn--primary mt-10 w-full">
          Log masuk sebagai {profil.namaPengurus || 'pengurus'}
        </button>
      </div>
    </main>
  );
}
