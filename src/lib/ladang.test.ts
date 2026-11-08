import { describe, expect, it } from 'vitest';
import { rebanUtama, ringkasanLadang, siriHarian, statusVaksin, susunVaksin, umurReban } from './ladang';
import { hariIni, tambahHari } from './tarikh';
import { janaDataContoh } from '../data/mockData';
import type { Reban, RekodVaksin } from '../types';

const H = hariIni();
const reban = (o: Partial<Reban>): Reban => ({
  id: 'r', nama: 'Reban', kapasiti: 1000, populasiAwal: 1000, populasiSemasa: 1000, tarikhMasuk: tambahHari(H, -10), status: 'aktif', ...o,
});
const vaksin = (o: Partial<RekodVaksin>): RekodVaksin => ({ id: 'v', nama: 'Vaksin', keterangan: '', tarikh: H, selesai: false, ...o });

describe('statusVaksin', () => {
  it('derives status from completion and date', () => {
    expect(statusVaksin(vaksin({ selesai: true, tarikh: tambahHari(H, -5) }))).toBe('selesai');
    expect(statusVaksin(vaksin({ tarikh: tambahHari(H, -1) }))).toBe('tertunggak');
    expect(statusVaksin(vaksin({ tarikh: H }))).toBe('akanDatang'); // due today is not yet overdue
    expect(statusVaksin(vaksin({ tarikh: tambahHari(H, 3) }))).toBe('akanDatang');
  });
});

describe('susunVaksin', () => {
  it('puts overdue first (oldest first), then upcoming (soonest first), then done (newest first)', () => {
    const list = [
      vaksin({ id: 'done-old', selesai: true, tarikh: tambahHari(H, -20) }),
      vaksin({ id: 'up-late', tarikh: tambahHari(H, 9) }),
      vaksin({ id: 'over-new', tarikh: tambahHari(H, -1) }),
      vaksin({ id: 'done-new', selesai: true, tarikh: tambahHari(H, -2) }),
      vaksin({ id: 'up-soon', tarikh: tambahHari(H, 1) }),
      vaksin({ id: 'over-old', tarikh: tambahHari(H, -6) }),
    ];
    expect(susunVaksin(list).map((v) => v.id)).toEqual(['over-old', 'over-new', 'up-soon', 'up-late', 'done-new', 'done-old']);
  });
  it('does not mutate its input', () => {
    const list = [vaksin({ id: 'b', tarikh: tambahHari(H, 2) }), vaksin({ id: 'a', tarikh: tambahHari(H, 1) })];
    susunVaksin(list);
    expect(list.map((v) => v.id)).toEqual(['b', 'a']);
  });
});

describe('umurReban', () => {
  it('counts days since placement for active coops only', () => {
    expect(umurReban(reban({ tarikhMasuk: tambahHari(H, -24) }))).toBe(24);
    expect(umurReban(reban({ status: 'kosong', tarikhMasuk: null }))).toBeNull();
    expect(umurReban(undefined)).toBeNull();
  });
  it('never returns a negative age for a future placement date', () => {
    expect(umurReban(reban({ tarikhMasuk: tambahHari(H, 2) }))).toBe(0);
  });
});

describe('rebanUtama', () => {
  const list = [reban({ id: 'a', status: 'kosong' }), reban({ id: 'b' }), reban({ id: 'c' })];
  it('returns the chosen coop when it is active', () => {
    expect(rebanUtama(list, 'c')?.id).toBe('c');
  });
  it('falls back to the first active coop when the choice is missing or inactive', () => {
    expect(rebanUtama(list, 'a')?.id).toBe('b');
    expect(rebanUtama(list, 'deleted')?.id).toBe('b');
    expect(rebanUtama([], null)).toBeUndefined();
  });
});

describe('siriHarian', () => {
  it('returns exactly n calendar days ending today, with gaps as null', () => {
    const log = [{ tarikh: tambahHari(H, -2), kematian: 4, dedakKg: 500 }];
    const s = siriHarian(log, 7);
    expect(s).toHaveLength(7);
    expect(s[6].tarikh).toBe(H);
    expect(s[0].tarikh).toBe(tambahHari(H, -6));
    expect(s[4]).toEqual({ tarikh: tambahHari(H, -2), kematian: 4, dedakKg: 500 });
    expect(s[5]).toEqual({ tarikh: tambahHari(H, -1), kematian: null, dedakKg: null });
  });
});

describe('ringkasanLadang', () => {
  it('sums only active coops and compares today with yesterday', () => {
    const r = [
      reban({ id: 'a', populasiAwal: 3000, populasiSemasa: 2900 }),
      reban({ id: 'b', populasiAwal: 2000, populasiSemasa: 1950 }),
      reban({ id: 'c', status: 'pembersihan', populasiAwal: 0, populasiSemasa: 0 }),
    ];
    const log = [
      { tarikh: tambahHari(H, -1), kematian: 7, dedakKg: 900 },
      { tarikh: H, kematian: 10, dedakKg: 950 },
    ];
    const s = ringkasanLadang(r, log);
    expect(s.bilAktif).toBe(2);
    expect(s.populasiSemasa).toBe(4850);
    expect(s.kematianKumulatif).toBe(150);
    expect(s.kadarKematian).toBeCloseTo(3, 5);
    expect(s.kematianHariIni).toBe(10);
    expect(s.kematianSemalam).toBe(7);
    expect(s.adaRekodHariIni).toBe(true);
  });
  it('reports no record rather than zero when yesterday is missing', () => {
    const s = ringkasanLadang([reban({})], []);
    expect(s.kematianSemalam).toBeNull();
    expect(s.adaRekodHariIni).toBe(false);
    expect(s.kadarKematian).toBe(0);
  });
  it('does not divide by zero with no active coops', () => {
    expect(ringkasanLadang([], []).kadarKematian).toBe(0);
  });
});

describe('sample data', () => {
  it('is internally consistent: logged deaths equal the drop in coop population', () => {
    const d = janaDataContoh();
    const logged = d.log.reduce((n, l) => n + l.kematian, 0);
    const s = ringkasanLadang(d.reban, d.log);
    expect(s.kematianKumulatif).toBe(logged);
    expect(d.log.at(-1)?.tarikh).toBe(H);
  });
});
