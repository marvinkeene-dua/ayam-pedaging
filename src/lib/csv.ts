type Sel = string | number | null | undefined;

/** Petik sel yang mengandungi koma, petikan atau baris baru (RFC 4180). */
export function selCSV(v: Sel): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Bina CSV yang dibuka dengan betul dalam Excel: BOM UTF-8 di hadapan
 * (supaya huruf bukan ASCII tidak rosak) dan CRLF di hujung baris.
 */
export function keCSV(baris: Sel[][]): string {
  return '﻿' + baris.map((b) => b.map(selCSV).join(',')).join('\r\n');
}
