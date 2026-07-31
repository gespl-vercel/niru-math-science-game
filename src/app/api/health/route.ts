import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUser = Boolean(process.env.MYSQL_USER || process.env.DB_USER);
  const hasPassword = Boolean(
    process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  );
  const config = {
    host:
      process.env.MYSQL_HOST ||
      process.env.DB_HOST ||
      "(missing)",
    port: process.env.MYSQL_PORT || process.env.DB_PORT || "3306",
    user: hasUser ? "set" : "(missing)",
    password: hasPassword ? "set" : "(missing/empty)",
    database:
      process.env.MYSQL_DATABASE ||
      process.env.DB_NAME ||
      "(missing)",
  };

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.query("SELECT 1 AS ok");
      const [tables] = await conn.query(
        "SHOW TABLES LIKE 'game_sessions'",
      );
      const hasSessions = Array.isArray(tables) && tables.length > 0;
      return NextResponse.json({
        ok: true,
        database: "connected",
        tables: {
          game_sessions: hasSessions,
        },
        config,
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        database: "not connected",
        error: message,
        config,
        hint:
          "Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE in Hostinger Environment Variables, then redeploy. Create tables with scripts/init-db.sql in phpMyAdmin.",
      },
      { status: 500 },
    );
  }
}
