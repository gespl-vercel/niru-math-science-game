/**
 * Initialize schema + seed default admin.
 * Usage: node --env-file=.env scripts/seed.mjs
 */
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const host = process.env.MYSQL_HOST || "127.0.0.1";
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD || "";
  const database = process.env.MYSQL_DATABASE || "niru_game";

  const root = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  const sql = fs.readFileSync(path.join(__dirname, "init-db.sql"), "utf8");
  await root.query(sql);
  await root.end();

  const db = await mysql.createConnection({ host, port, user, password, database });
  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", ["admin@niru.local"]);
  if (Array.isArray(rows) && rows.length === 0) {
    const hash = await bcrypt.hash("Admin@123", 10);
    await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@niru.local", hash, "admin"],
    );
    console.log("Created admin: admin@niru.local / Admin@123");
  } else {
    console.log("Admin already exists — skipped.");
  }
  await db.end();
  console.log("Database ready:", database);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
