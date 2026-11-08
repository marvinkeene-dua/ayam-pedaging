import type { StatusReban } from '../types';

/** Prop aria untuk medan yang mungkin ralat. */
export function ariaRalat(id: string, ralat?: string) {
  return ralat ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-ralat` } : {};
}

export const labelStatusReban: Record<StatusReban, string> = {
  aktif: 'Aktif',
  pembersihan: 'Pembersihan',
  kosong: 'Kosong',
};
