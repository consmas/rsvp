import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/* Singleton init promise — safe for concurrent requests */
let _init: Promise<void> | null = null;

export async function ensureInit(): Promise<void> {
  if (_init) return _init;
  _init = (async () => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS accommodations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_name TEXT NOT NULL,
        room_type TEXT NOT NULL,
        description TEXT,
        price_per_night REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'GHS',
        max_guests INTEGER NOT NULL DEFAULT 2,
        available INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        attending TEXT NOT NULL,
        guest_count INTEGER DEFAULT 1,
        arriving_early TEXT,
        needs_accommodation TEXT,
        accommodation_id INTEGER,
        staying_for_dinner TEXT,
        dietary_notes TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'GHS',
        donor_name TEXT,
        donor_phone TEXT,
        donor_network TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    /* Migration for databases created before accommodation_id column existed */
    try {
      await db.execute(`ALTER TABLE guests ADD COLUMN accommodation_id INTEGER`);
    } catch { /* column already exists — no-op */ }
  })();
  return _init;
}

export default db;
