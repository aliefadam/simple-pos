// Generic localStorage helper. This is the ONLY layer that talks to localStorage.
// When migrating to a real backend, only this file (and the other *Service files
// that call it) need to change — the rest of the app talks to the service layer.

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const storageService = {
  getAll<T>(key: string): T[] {
    return safeParse<T[]>(localStorage.getItem(key), []);
  },

  getOne<T extends { id: string }>(key: string, id: string): T | undefined {
    return this.getAll<T>(key).find((item) => item.id === id);
  },

  saveAll<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  },

  insert<T extends { id: string }>(key: string, item: T): T {
    const all = this.getAll<T>(key);
    all.push(item);
    this.saveAll(key, all);
    return item;
  },

  update<T extends { id: string }>(key: string, id: string, patch: Partial<T>): T | undefined {
    const all = this.getAll<T>(key);
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...patch };
    this.saveAll(key, all);
    return all[idx];
  },

  remove<T extends { id: string }>(key: string, id: string): void {
    const all = this.getAll<T>(key);
    this.saveAll(
      key,
      all.filter((item) => item.id !== id)
    );
  },

  getObject<T>(key: string, fallback: T): T {
    return safeParse<T>(localStorage.getItem(key), fallback);
  },

  setObject<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  clearKey(key: string): void {
    localStorage.removeItem(key);
  },

  exportAll(keys: string[]): Record<string, unknown> {
    const dump: Record<string, unknown> = {};
    keys.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) dump[key] = JSON.parse(raw);
    });
    return dump;
  },

  importAll(dump: Record<string, unknown>): void {
    Object.entries(dump).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  },
};
