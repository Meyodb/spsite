import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "contact.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sujet TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    entreprise TEXT,
    fonction TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT
  );
`);

export function saveContactMessage(payload) {
  const stmt = db.prepare(`
    INSERT INTO contact_messages (
      sujet,
      nom,
      prenom,
      email,
      telephone,
      entreprise,
      fonction,
      message,
      created_at,
      ip,
      user_agent
    ) VALUES (
      @sujet,
      @nom,
      @prenom,
      @email,
      @telephone,
      @entreprise,
      @fonction,
      @message,
      @created_at,
      @ip,
      @user_agent
    )
  `);

  const info = stmt.run(payload);
  return info.lastInsertRowid;
}

export function listContactMessages(limit = 100) {
  const stmt = db.prepare(
    "SELECT * FROM contact_messages ORDER BY id DESC LIMIT ?"
  );
  return stmt.all(limit);
}

