import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import session from "express-session";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Store de sessions adossé à SQLite.
 *
 * Le MemoryStore par défaut d'express-session fuit en mémoire et perd toutes
 * les sessions à chaque redémarrage du process. Une base SQLite séparée de
 * celle du catalogue évite de mêler données applicatives et sessions.
 */
export function createSessionStore() {
  const db = new Database(path.join(__dirname, "data", "sessions.db"));
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `);
  db.exec("CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)");

  const statements = {
    get: db.prepare("SELECT data FROM sessions WHERE sid = ? AND expires_at > ?"),
    set: db.prepare(
      `INSERT INTO sessions (sid, data, expires_at) VALUES (?, ?, ?)
       ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at`
    ),
    destroy: db.prepare("DELETE FROM sessions WHERE sid = ?"),
    touch: db.prepare("UPDATE sessions SET expires_at = ? WHERE sid = ?"),
    clear: db.prepare("DELETE FROM sessions"),
    length: db.prepare("SELECT COUNT(*) AS count FROM sessions WHERE expires_at > ?"),
    purge: db.prepare("DELETE FROM sessions WHERE expires_at <= ?"),
  };

  const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

  const expiryOf = (sess) => {
    const maxAge = sess?.cookie?.maxAge;
    if (typeof maxAge === "number") return Date.now() + maxAge;

    const expires = sess?.cookie?.expires;
    if (expires) return new Date(expires).getTime();

    return Date.now() + DEFAULT_TTL_MS;
  };

  class SqliteStore extends session.Store {
    get(sid, callback) {
      try {
        const row = statements.get.get(sid, Date.now());
        callback(null, row ? JSON.parse(row.data) : null);
      } catch (err) {
        callback(err);
      }
    }

    set(sid, sess, callback) {
      try {
        statements.set.run(sid, JSON.stringify(sess), expiryOf(sess));
        callback(null);
      } catch (err) {
        callback(err);
      }
    }

    destroy(sid, callback) {
      try {
        statements.destroy.run(sid);
        callback(null);
      } catch (err) {
        callback(err);
      }
    }

    touch(sid, sess, callback) {
      try {
        statements.touch.run(expiryOf(sess), sid);
        callback(null);
      } catch (err) {
        callback(err);
      }
    }

    clear(callback) {
      try {
        statements.clear.run();
        callback(null);
      } catch (err) {
        callback(err);
      }
    }

    length(callback) {
      try {
        callback(null, statements.length.get(Date.now()).count);
      } catch (err) {
        callback(err);
      }
    }
  }

  // Purge horaire des sessions expirées.
  statements.purge.run(Date.now());
  setInterval(() => {
    try {
      statements.purge.run(Date.now());
    } catch (err) {
      console.error("Purge des sessions expirées impossible:", err);
    }
  }, 60 * 60 * 1000).unref();

  return new SqliteStore();
}
