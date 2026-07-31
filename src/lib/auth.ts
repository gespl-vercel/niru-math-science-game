import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { query, type UserRow } from "./db";

const COOKIE_NAME = "niru_session";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "student";
  gradeLevel: number | null;
};

function getSecret() {
  const secret = process.env.JWT_SECRET || "dev-only-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    gradeLevel: user.gradeLevel,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: Number(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as "admin" | "student",
      gradeLevel:
        payload.gradeLevel === null || payload.gradeLevel === undefined
          ? null
          : Number(payload.gradeLevel),
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function findUserByEmail(email: string) {
  const rows = await query<UserRow[]>(
    "SELECT * FROM users WHERE email = :email LIMIT 1",
    { email: email.toLowerCase() },
  );
  return rows[0] ?? null;
}

export function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    gradeLevel: row.grade_level,
  };
}
