import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(process.cwd(), "rsvp.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

/* ── Accommodations table ─────────────────────────────── */
db.exec(`
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

/* ── Guests table ─────────────────────────────────────── */
db.exec(`
  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    attending TEXT NOT NULL CHECK(attending IN ('yes', 'no')),
    guest_count INTEGER DEFAULT 1,
    arriving_early TEXT CHECK(arriving_early IN ('yes', 'no', NULL)),
    needs_accommodation TEXT CHECK(needs_accommodation IN ('yes', 'no', NULL)),
    accommodation_id INTEGER REFERENCES accommodations(id),
    staying_for_dinner TEXT CHECK(staying_for_dinner IN ('yes', 'no', NULL)),
    dietary_notes TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/* ── Migrations for pre-existing databases ────────────── */
try {
  db.exec(`ALTER TABLE guests ADD COLUMN accommodation_id INTEGER REFERENCES accommodations(id)`);
} catch {
  /* column already exists — no-op */
}

export default db;
