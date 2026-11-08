import { useEffect, useState } from 'react';

const AWALAN = 'ap.v2.';

export function bacaStorage<T>(kunci: string, nilaiAwal: T): T {
  try {
    const tersimpan = localStorage.getItem(AWALAN + kunci);
    return tersimpan ? (JSON.parse(tersimpan) as T) : nilaiAwal;
  } catch {
    return nilaiAwal;
  }
}

export function useLocalStorageState<T>(kunci: string, nilaiAwal: T | (() => T)) {
  const [nilai, setNilai] = useState<T>(() => {
    const awal = typeof nilaiAwal === 'function' ? (nilaiAwal as () => T)() : nilaiAwal;
    return bacaStorage(kunci, awal);
  });

  useEffect(() => {
    try {
      localStorage.setItem(AWALAN + kunci, JSON.stringify(nilai));
    } catch {
      // Storan penuh atau disekat (mod peribadi): aplikasi terus berfungsi dalam memori.
    }
  }, [kunci, nilai]);

  return [nilai, setNilai] as const;
}

export function padamSemuaStorage() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(AWALAN) && k !== AWALAN + 'tema')
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* abaikan */
  }
}
