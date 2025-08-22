import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('offline.db');
  }
  return db as SQLite.SQLiteDatabase;
};

const execSql = async (sql: string, params: any[] = []): Promise<any> => {
  const database = getDb();
  const upper = sql.trim().toUpperCase();

  if (upper.startsWith('SELECT') || upper.startsWith('PRAGMA')) {
    const rows: any[] = await database.getAllAsync(sql, params as any);
    return {
      rows: {
        length: rows.length,
        item: (i: number) => rows[i],
      },
    };
  }

  await database.runAsync(sql, params as any);
  return {
    rows: { length: 0, item: (_: number) => undefined },
  };
};

export const initOfflineDb = async (): Promise<void> => {
  await execSql(`CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    ttl INTEGER NOT NULL,
    timestamp INTEGER NOT NULL
  );`);

  await execSql(`CREATE TABLE IF NOT EXISTS queue (
    id TEXT PRIMARY KEY,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    body TEXT,
    headers TEXT,
    entity TEXT,
    temp_id TEXT,
    createdAt INTEGER NOT NULL
  );`);

  await execSql(`CREATE TABLE IF NOT EXISTS id_map (
    entity TEXT NOT NULL,
    temp_id TEXT NOT NULL,
    server_id TEXT NOT NULL,
    PRIMARY KEY (entity, temp_id)
  );`);

  await execSql(`CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`);
};

export const dbExec = execSql; 