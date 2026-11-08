import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  tajuk: string;
  keterangan?: string;
  onTutup: () => void;
  children: ReactNode;
  lebar?: 'sm' | 'md';
}

const BOLEH_FOKUS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ tajuk, keterangan, onTutup, children, lebar = 'md' }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const tajukId = useId();
  const ketId = useId();
  const onTutupRef = useRef(onTutup);
  useEffect(() => {
    onTutupRef.current = onTutup;
  }, [onTutup]);

  useEffect(() => {
    const sebelum = document.activeElement as HTMLElement | null;
    const badan = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Fokus medan pertama, atau panel itu sendiri.
    const pertama = panel.current?.querySelector<HTMLElement>('input, select, textarea') ?? panel.current;
    pertama?.focus();

    function onKekunci(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onTutupRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const unsur = Array.from(panel.current.querySelectorAll<HTMLElement>(BOLEH_FOKUS));
      if (unsur.length === 0) return;
      const awal = unsur[0];
      const akhir = unsur[unsur.length - 1];
      if (e.shiftKey && document.activeElement === awal) {
        e.preventDefault();
        akhir.focus();
      } else if (!e.shiftKey && document.activeElement === akhir) {
        e.preventDefault();
        awal.focus();
      }
    }

    document.addEventListener('keydown', onKekunci);
    return () => {
      document.removeEventListener('keydown', onKekunci);
      document.body.style.overflow = badan;
      sebelum?.focus?.();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="anim-lapik absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onTutup}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tajukId}
        aria-describedby={keterangan ? ketId : undefined}
        tabIndex={-1}
        className={`anim-dialog relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-line-strong bg-surface p-6 outline-none sm:rounded-2xl sm:p-8 ${
          lebar === 'sm' ? 'sm:max-w-md' : 'sm:max-w-xl'
        }`}
        style={{ boxShadow: 'var(--c-shadow)' }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={tajukId} className="text-[26px] leading-tight">
              {tajuk}
            </h2>
            {keterangan && (
              <p id={ketId} className="mt-1.5 text-[14px] text-muted">
                {keterangan}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onTutup}
            className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
