import { describe, expect, it } from 'vitest';
import { bezaHari, formatTarikh, keISO, relatif, tambahHari } from './tarikh';
import { keCSV, selCSV } from './csv';

describe('dates', () => {
  it('keeps the local calendar date (no UTC shift before 08:00 in Malaysia)', () => {
    expect(keISO(new Date(2026, 10, 9, 0, 15))).toBe('2026-11-09');
  });
  it('adds days across month, year and leap-day boundaries', () => {
    expect(tambahHari('2026-10-31', 1)).toBe('2026-11-01');
    expect(tambahHari('2026-12-31', 1)).toBe('2027-01-01');
    expect(tambahHari('2028-03-01', -1)).toBe('2028-02-29');
  });
  it('measures whole days between dates', () => {
    expect(bezaHari('2026-10-15', '2026-11-08')).toBe(24);
  });
  it('labels dates relative to a reference day', () => {
    expect(relatif('2026-11-09', '2026-11-09')).toBe('Hari ini');
    expect(relatif('2026-11-08', '2026-11-09')).toBe('Semalam');
    expect(relatif('2026-11-12', '2026-11-09')).toBe('Dalam 3 hari');
    expect(relatif('2026-11-04', '2026-11-09')).toBe('5 hari lalu');
  });
  it('formats in Malay', () => {
    expect(formatTarikh('2026-08-31')).toBe('31 Ogos 2026');
  });
});

describe('CSV export', () => {
  it('quotes cells with commas, quotes or line breaks (RFC 4180)', () => {
    expect(selCSV('Reban 1, sebelah')).toBe('"Reban 1, sebelah"');
    expect(selCSV('kata "panas"')).toBe('"kata ""panas"""');
    expect(selCSV('a\nb')).toBe('"a\nb"');
    expect(selCSV(12)).toBe('12');
    expect(selCSV(null)).toBe('');
  });
  it('starts with a UTF-8 BOM and uses CRLF so Excel opens it correctly', () => {
    const csv = keCSV([['Tarikh', 'Kematian'], ['2026-11-09', 12]]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1)).toBe('Tarikh,Kematian\r\n2026-11-09,12');
  });
});
