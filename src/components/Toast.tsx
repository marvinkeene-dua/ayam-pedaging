import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, X } from 'lucide-react';

interface Toast {
  id: number;
  mesej: string;
  tindakan?: { label: string; onKlik: () => void };
}

type Tunjuk = (mesej: string, tindakan?: Toast['tindakan']) => void;

const ToastKonteks = createContext<Tunjuk>(() => {});

// eslint-disable-next-line react/only-export-components
export function useToast() {
  return useContext(ToastKonteks);
}

const TEMPOH = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [senarai, setSenarai] = useState<Toast[]>([]);
  const kiraan = useRef(0);

  const tutup = useCallback((id: number) => {
    setSenarai((s) => s.filter((t) => t.id !== id));
  }, []);

  const tunjuk = useCallback<Tunjuk>((mesej, tindakan) => {
    kiraan.current += 1;
    const id = kiraan.current;
    // Paling banyak tiga serentak; yang lama keluar dahulu.
    setSenarai((s) => [...s.slice(-2), { id, mesej, tindakan }]);
  }, []);

  return (
    <ToastKonteks.Provider value={tunjuk}>
      {children}
      <div
        className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        role="status"
        aria-live="polite"
      >
        {senarai.map((t) => (
          <ItemToast key={t.id} toast={t} onTutup={() => tutup(t.id)} />
        ))}
      </div>
    </ToastKonteks.Provider>
  );
}

function ItemToast({ toast, onTutup }: { toast: Toast; onTutup: () => void }) {
  const [dijeda, setDijeda] = useState(false);

  useEffect(() => {
    if (dijeda) return;
    const t = setTimeout(onTutup, TEMPOH);
    return () => clearTimeout(t);
  }, [dijeda, onTutup]);

  return (
    <div
      className="anim-toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[10px] border border-line-strong bg-raised py-2.5 pl-3.5 pr-2 text-[14px] text-ink"
      style={{ boxShadow: 'var(--c-shadow)' }}
      onMouseEnter={() => setDijeda(true)}
      onMouseLeave={() => setDijeda(false)}
      onFocus={() => setDijeda(true)}
      onBlur={() => setDijeda(false)}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold">
        <Check className="h-3 w-3" strokeWidth={2.2} />
      </span>
      <p className="min-w-0 flex-1 leading-snug">{toast.mesej}</p>
      {toast.tindakan && (
        <button
          type="button"
          onClick={() => {
            toast.tindakan?.onKlik();
            onTutup();
          }}
          className="h-9 shrink-0 rounded-md px-3 text-[13px] font-medium text-gold transition-colors hover:bg-gold-soft"
        >
          {toast.tindakan.label}
        </button>
      )}
      <button
        type="button"
        onClick={onTutup}
        aria-label="Tutup makluman"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-gold-soft hover:text-ink"
      >
        <X className="h-4 w-4" strokeWidth={1.6} />
      </button>
    </div>
  );
}
