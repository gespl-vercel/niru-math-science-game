import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  findUserByEmail,
  setSessionCookie,
  toSessionUser,
  verifyPassword,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const userRow = await findUserByEmail(body.email);
    if (!userRow) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const ok = await verifyPassword(body.password, userRow.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = toSessionUser(userRow);
    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid login data." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
