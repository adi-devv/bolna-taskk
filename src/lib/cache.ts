const store: Record<string, { data: unknown; ts: number }> = {};
const TTL = 30_000;

export function getCache<T>(key: string): T | null {
  const e = store[key];
  return e && Date.now() - e.ts < TTL ? (e.data as T) : null;
}

export function setCache(key: string, data: unknown) {
  store[key] = { data, ts: Date.now() };
}
