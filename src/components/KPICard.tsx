import type { ReactNode } from 'react';

export interface Angka {
  label: string;
  nilai: string;
  unit?: string;
  nota?: ReactNode;
  amaran?: boolean;
}

/**
 * Satu jalur angka utama. Garis rambut dilukis oleh jurang 1px grid,
 * jadi ia kekal betul pada setiap lebar skrin.
 */
export default function JalurAngka({ angka }: { angka: Angka[] }) {
  return (
    <section
      aria-label="Angka utama"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:grid-cols-3 xl:grid-cols-5"
    >
      {angka.map((a, i) => (
        <div
          key={a.label}
          className={`flex min-h-[150px] flex-col justify-between gap-6 bg-surface p-5 sm:p-6 ${
            i === 4 ? 'col-span-2 xl:col-span-1' : ''
          }`}
        >
          <p className="text-[13px] font-medium text-muted">{a.label}</p>
          <div>
            <p className={`figure text-[38px] sm:text-[44px] ${a.amaran ? 'text-danger' : 'text-ink'}`}>
              {a.nilai}
              {a.unit && <span className="ml-1.5 font-sans text-[14px] font-normal tracking-normal text-muted">{a.unit}</span>}
            </p>
            {a.nota && <p className="mt-2.5 text-[13px] leading-snug text-muted">{a.nota}</p>}
          </div>
        </div>
      ))}
    </section>
  );
}
