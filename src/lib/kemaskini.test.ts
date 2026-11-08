import { describe, expect, it } from 'vitest';
import { gunaKemaskini } from './kemaskini';
import type { KeadaanLadang } from './kemaskini';

const keadaan = (): KeadaanLadang => ({
  reban: [
    { id: 'r1', nama: 'Reban 1', kapasiti: 3000, populasiAwal: 3000, populasiSemasa: 2900, tarikhMasuk: '2026-10-15', status: 'aktif' },
    { id: 'r2', nama: 'Reban 2', kapasiti: 3000, populasiAwal: 3000, populasiSemasa: 5, tarikhMasuk: '2026-10-15', status: 'aktif' },
  ],
  log: [
    { tarikh: '2026-11-07', kematian: 6, dedakKg: 1100 },
    { tarikh: '2026-11-09', kematian: 4, dedakKg: 600 },
  ],
  nota: [],
});
const KINI = new Date(2026, 10, 9, 14, 30, 5);

describe('gunaKemaskini', () => {
  it('deducts deaths from the chosen coop only', () => {
    const k = gunaKemaskini(keadaan(), { tarikh: '2026-11-09', rebanId: 'r1', kematian: 12 }, KINI, 'n1');
    expect(k.reban.map((r) => r.populasiSemasa)).toEqual([2888, 5]);
  });

  it('never takes a population below zero', () => {
    const k = gunaKemaskini(keadaan(), { tarikh: '2026-11-09', rebanId: 'r2', kematian: 50 }, KINI, 'n1');
    expect(k.reban[1].populasiSemasa).toBe(0);
  });

  it('adds to an existing day instead of creating a duplicate row', () => {
    const k = gunaKemaskini(keadaan(), { tarikh: '2026-11-09', rebanId: 'r1', kematian: 3, dedakKg: 250.5 }, KINI, 'n1');
    expect(k.log.filter((l) => l.tarikh === '2026-11-09')).toEqual([{ tarikh: '2026-11-09', kematian: 7, dedakKg: 850.5 }]);
    expect(k.log).toHaveLength(2);
  });

  it('inserts a back-filled day in date order', () => {
    const k = gunaKemaskini(keadaan(), { tarikh: '2026-11-08', rebanId: 'r1', dedakKg: 1000 }, KINI, 'n1');
    expect(k.log.map((l) => l.tarikh)).toEqual(['2026-11-07', '2026-11-08', '2026-11-09']);
    expect(k.log[1]).toEqual({ tarikh: '2026-11-08', kematian: 0, dedakKg: 1000 });
  });

  it('keeps feed to one decimal place across repeated additions', () => {
    let k = keadaan();
    for (let i = 0; i < 3; i++) k = gunaKemaskini(k, { tarikh: '2026-11-10', rebanId: null, dedakKg: 0.1 }, KINI, `n${i}`);
    expect(k.log.at(-1)?.dedakKg).toBe(0.3); // not 0.30000000000000004
  });

  it('stamps a note on the chosen date at the current local time, and ignores blank notes', () => {
    const k = gunaKemaskini(keadaan(), { tarikh: '2026-11-08', rebanId: 'r1', nota: '  Kipas rosak  ' }, KINI, 'n1');
    expect(k.nota).toEqual([{ id: 'n1', tarikh: '2026-11-08T14:30:05', mesej: 'Kipas rosak', rebanId: 'r1' }]);
    expect(gunaKemaskini(keadaan(), { tarikh: '2026-11-08', rebanId: null, nota: '   ' }, KINI, 'n2').nota).toEqual([]);
  });

  it('leaves untouched parts of state referentially equal (cheap React re-renders)', () => {
    const before = keadaan();
    const k = gunaKemaskini(before, { tarikh: '2026-11-09', rebanId: null, nota: 'Hanya nota' }, KINI, 'n1');
    expect(k.reban).toBe(before.reban);
    expect(k.log).toBe(before.log);
  });
});
