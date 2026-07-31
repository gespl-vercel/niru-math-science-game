import mysql, {
  Pool,
  PoolOptions,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __niruDbPool: Pool | undefined;
}

type QueryParams = Record<string, string | number | boolean | null | Date>;

function resolveHost(raw: string | undefined): string {
  const host = (raw || "127.0.0.1").trim();
  // Hostinger MySQL grants are usually for 127.0.0.1 / localhost (IPv4).
  // "localhost" often resolves to ::1 in Node and causes Access denied.
  if (host.toLowerCase() === "localhost") {
    return "127.0.0.1";
  }
  return host;
}

function getConfig(): PoolOptions {
  return {
    host: resolveHost(process.env.MYSQL_HOST || process.env.DB_HOST),
    port: Number(
      process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
    ),
    user: (process.env.MYSQL_USER || process.env.DB_USER || "root").trim(),
    password: (
      process.env.MYSQL_PASSWORD ||
      process.env.DB_PASSWORD ||
      ""
    ).trim(),
    database: (
      process.env.MYSQL_DATABASE ||
      process.env.DB_NAME ||
      "niru_game"
    ).trim(),
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  };
}

export function getPool(): Pool {
  if (!global.__niruDbPool) {
    global.__niruDbPool = mysql.createPool(getConfig());
  }
  return global.__niruDbPool;
}

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params?: QueryParams,
): Promise<T> {
  const [rows] = await getPool().execute<T>(sql, params);
  return rows;
}

export async function execute(
  sql: string,
  params?: QueryParams,
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}

export type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "student";
  grade_level: number | null;
};

export type SmtpRow = RowDataPacket & {
  id: number;
  host: string;
  port: number;
  secure: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  is_active: number;
};

export type SessionRow = RowDataPacket & {
  id: number;
  user_id: number | null;
  guest_name: string | null;
  subject: "math" | "science";
  difficulty: "simple" | "medium" | "hard" | "very_hard";
  total_questions: number;
  correct_answers: number;
  score: number;
  duration_seconds: number | null;
  created_at: Date;
};
