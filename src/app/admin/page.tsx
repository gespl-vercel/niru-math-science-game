import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SmtpSettingsForm } from "@/components/SmtpSettingsForm";
import Link from "next/link";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/play");

  return (
    <div className="page admin-page">
      <div className="page-hero">
        <p className="eyebrow">Admin</p>
        <h1>SMTP mail setup</h1>
        <p className="lede">
          Configure the mail server used for welcome notes, password resets, and
          test messages.
        </p>
      </div>
      <SmtpSettingsForm />
      <p className="form-foot" style={{ marginTop: "1.25rem" }}>
        <Link href="/play">← Back to play</Link>
      </p>
    </div>
  );
}
