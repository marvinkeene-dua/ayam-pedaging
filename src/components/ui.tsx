import type { ReactNode } from 'react';
import type { StatusReban, StatusVaksin } from '../types';
import { labelStatusReban } from '../lib/borang';

export function PageHeader({
  kecil,
  tajuk,
  keterangan,
  tindakan,
}: {
  kecil?: string;
  tajuk: string;
  keterangan?: ReactNode;
  tindakan?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        {kecil && <p className="mb-2 text-[13px] font-medium text-gold">{kecil}</p>}
        <h1 className="text-[34px] leading-[1.05] sm:text-[42px]">{tajuk}</h1>
        {keterangan && <p className="mt-2 max-w-[62ch] text-[15px] text-muted">{keterangan}</p>}
      </div>
      {tindakan && <div className="no-print flex flex-wrap gap-2">{tindakan}</div>}
    </div>
  );
}

export function CardHeader({ tajuk, keterangan, tindakan }: { tajuk: string; keterangan?: ReactNode; tindakan?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-6 pb-4 pt-5">
      <div className="min-w-0">
        <h2 className="text-[22px] leading-tight">{tajuk}</h2>
        {keterangan && <p className="mt-1 text-[13px] text-muted">{keterangan}</p>}
      </div>
      {tindakan}
    </div>
  );
}

export function Medan({
  id,
  label,
  ralat,
  petunjuk,
  children,
}: {
  id: string;
  label: string;
  ralat?: string;
  petunjuk?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {ralat ? (
        <p id={`${id}-ralat`} className="field-error">
          {ralat}
        </p>
      ) : (
        petunjuk && <p className="field-hint">{petunjuk}</p>
      )}
    </div>
  );
}

const gayaVaksin: Record<StatusVaksin, { label: string; kelas: string }> = {
  tertunggak: { label: 'Tertunggak', kelas: 'text-danger bg-danger-soft' },
  akanDatang: { label: 'Akan datang', kelas: 'text-gold bg-gold-soft' },
  selesai: { label: 'Selesai', kelas: 'text-muted bg-raised' },
};

export function LencanaVaksin({ status }: { status: StatusVaksin }) {
  const g = gayaVaksin[status];
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[12.5px] font-medium ${g.kelas}`}>{g.label}</span>
  );
}

export function LencanaReban({ status }: { status: StatusReban }) {
  const kelas =
    status === 'aktif' ? 'text-gold bg-gold-soft' : status === 'pembersihan' ? 'text-ink-2 bg-raised' : 'text-muted bg-raised';
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium ${kelas}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'aktif' ? 'bg-gold' : 'bg-current opacity-60'}`} />
      {labelStatusReban[status]}
    </span>
  );
}

export function Kosong({ children }: { children: ReactNode }) {
  return <p className="px-6 py-10 text-center text-[14px] text-muted">{children}</p>;
}
