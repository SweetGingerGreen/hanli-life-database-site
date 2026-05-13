// src/lib/db.ts — better-sqlite3 singleton
import Database from "better-sqlite3";
import path from "node:path";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  const dbPath = process.env.DATABASE_PATH
    || path.join(process.cwd(), "data", "han-li.sqlite");
  _db = new Database(dbPath, { readonly: true, fileMustExist: true });
  _db.pragma("query_only = ON");
  // schema sanity check
  const row = _db.prepare(
    "SELECT value FROM meta WHERE key = 'schema_version'"
  ).get() as { value: string } | undefined;
  if (row?.value !== "1.1") {
    console.warn(`[db] schema_version mismatch: expected 1.1, got ${row?.value}`);
  }
  return _db;
}
