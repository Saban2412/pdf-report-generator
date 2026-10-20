import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const dbPath = path.resolve(process.cwd(), "report.db");
export const db = new DatabaseSync(dbPath);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT NOT NULL,
      product TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
