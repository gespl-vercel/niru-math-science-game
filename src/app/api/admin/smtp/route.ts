import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getLatestSmtpSettings, saveSmtpSettings } from "@/lib/mail";

const schema = z.object({
  host: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean(),
  username: z.string().max(255),
  password: z.string().max(255),
  fromEmail: z.string().email(),
  fromName: z.string().min(1).max(120),
  isActive: z.boolean(),
});

export async function GET() {
  try {
    await requireAdmin();
    const smtp = await getLatestSmtpSettings();
    if (!smtp) {
      return NextResponse.json({ smtp: null });
    }
    return NextResponse.json({
      smtp: {
        host: smtp.host,
        port: smtp.port,
        secure: Boolean(smtp.secure),
        username: smtp.username,
        fromEmail: smtp.from_email,
        fromName: smtp.from_name,
        isActive: Boolean(smtp.is_active),
        hasPassword: Boolean(smtp.password),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = schema.parse(await request.json());
    await saveSmtpSettings(body, admin.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid SMTP settings." }, { status: 400 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to save SMTP settings." }, { status: 500 });
  }
}
