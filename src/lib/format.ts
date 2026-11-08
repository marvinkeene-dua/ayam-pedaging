const nf = new Intl.NumberFormat('ms-MY');
const nf1 = new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const nombor = (n: number) => nf.format(Math.round(n));
export const nombor1 = (n: number) => nf1.format(n);
export const nombor2 = (n: number) => nf2.format(n);

export function idBaru(awalan: string) {
  return `${awalan}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function namaPertama(nama: string) {
  return nama.trim().split(/\s+/)[0] ?? '';
}

export function inisial(nama: string) {
  const bahagian = nama.trim().split(/\s+/).filter(Boolean);
  if (bahagian.length === 0) return '·';
  return (bahagian[0][0] + (bahagian.length > 1 ? bahagian[bahagian.length - 1][0] : '')).toUpperCase();
}
