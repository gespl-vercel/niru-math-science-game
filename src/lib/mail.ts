import nodemailer from "nodemailer";
import { execute, query, type SmtpRow } from "./db";

export type SmtpSettingsInput = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
};

export async function getSmtpSettings() {
  const rows = await query<SmtpRow[]>(
    "SELECT * FROM smtp_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1",
  );
  return rows[0] ?? null;
}

export async function getLatestSmtpSettings() {
  const rows = await query<SmtpRow[]>(
    "SELECT * FROM smtp_settings ORDER BY id DESC LIMIT 1",
  );
  return rows[0] ?? null;
}

export async function saveSmtpSettings(
  input: SmtpSettingsInput,
  adminId: number,
) {
  const existing = await getLatestSmtpSettings();
  const password =
    input.password.trim().length > 0
      ? input.password
      : (existing?.password ?? "");

  if (existing) {
    await execute(
      `UPDATE smtp_settings SET
        host = :host,
        port = :port,
        secure = :secure,
        username = :username,
        password = :password,
        from_email = :fromEmail,
        from_name = :fromName,
        is_active = :isActive,
        updated_by = :updatedBy
      WHERE id = :id`,
      {
        id: existing.id,
        host: input.host,
        port: input.port,
        secure: input.secure ? 1 : 0,
        username: input.username,
        password,
        fromEmail: input.fromEmail,
        fromName: input.fromName,
        isActive: input.isActive ? 1 : 0,
        updatedBy: adminId,
      },
    );
    return existing.id;
  }

  const result = await execute(
    `INSERT INTO smtp_settings
      (host, port, secure, username, password, from_email, from_name, is_active, updated_by)
     VALUES
      (:host, :port, :secure, :username, :password, :fromEmail, :fromName, :isActive, :updatedBy)`,
    {
      host: input.host,
      port: input.port,
      secure: input.secure ? 1 : 0,
      username: input.username,
      password,
      fromEmail: input.fromEmail,
      fromName: input.fromName,
      isActive: input.isActive ? 1 : 0,
      updatedBy: adminId,
    },
  );

  return result.insertId;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const smtp = await getSmtpSettings();
  if (!smtp) {
    throw new Error("SMTP is not configured. Ask an admin to set it up.");
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: Boolean(smtp.secure),
    auth:
      smtp.username && smtp.password
        ? { user: smtp.username, pass: smtp.password }
        : undefined,
  });

  await transporter.sendMail({
    from: `"${smtp.from_name}" <${smtp.from_email}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function sendTestMail(to: string) {
  await sendMail({
    to,
    subject: "Niru Quest Lab — SMTP test",
    text: "Your SMTP settings are working.",
    html: `
      <div style="font-family:sans-serif;padding:24px">
        <h2>SMTP connected</h2>
        <p>Your mail settings for <strong>Niru Quest Lab</strong> are working.</p>
      </div>
    `,
  });
}
