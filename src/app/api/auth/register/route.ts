import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  findUserByEmail,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { execute } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  password: z.string().min(6).max(100),
  gradeLevel: z.number().int().min(1).max(12).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(body.password);
    const result = await execute(
      `INSERT INTO users (name, email, password_hash, role, grade_level)
       VALUES (:name, :email, :passwordHash, 'student', :gradeLevel)`,
      {
        name: body.name.trim(),
        email,
        passwordHash,
        gradeLevel: body.gradeLevel ?? null,
      },
    );

    const user = {
      id: result.insertId,
      name: body.name.trim(),
      email,
      role: "student" as const,
      gradeLevel: body.gradeLevel ?? null,
    };

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
