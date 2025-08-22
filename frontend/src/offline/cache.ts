import { dbExec } from './db';

export const setCache = async (key: string, value: any, ttlMs: number): Promise<void> => {
  const now = Date.now();
  await dbExec(`INSERT OR REPLACE INTO cache (key, value, ttl, timestamp) VALUES (?, ?, ?, ?);`, [
    key,
    JSON.stringify(value ?? null),
    ttlMs,
    now,
  ]);
};

export const getCache = async <T = any>(key: string): Promise<T | null> => {
  const res = await dbExec(`SELECT value, ttl, timestamp FROM cache WHERE key = ?;`, [key]);
  if (res.rows.length === 0) return null;
  const row = res.rows.item(0);
  const expired = Date.now() > (row.timestamp + row.ttl);
  if (expired) {
    await dbExec(`DELETE FROM cache WHERE key = ?;`, [key]);
    return null;
  }
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
};

export const invalidateByPattern = async (patternPrefix: string): Promise<void> => {
  await dbExec(`DELETE FROM cache WHERE key LIKE ?;`, [`${patternPrefix}%`]);
};

export const clearAllCache = async (): Promise<void> => {
  await dbExec(`DELETE FROM cache;`);
}; 