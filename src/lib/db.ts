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

function getConfig(): PoolOptions {
  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "niru_game",
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
