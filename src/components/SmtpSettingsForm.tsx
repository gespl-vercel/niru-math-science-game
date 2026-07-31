"use client";

import { FormEvent, useEffect, useState } from "react";

type SmtpForm = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
};

const empty: SmtpForm = {
  host: "",
  port: 587,
  secure: false,
  username: "",
  password: "",
  fromEmail: "",
  fromName: "Niru Quest Lab",
  isActive: true,
};

export function SmtpSettingsForm() {
  const [form, setForm] = useState<SmtpForm>(empty);
  const [hasPassword, setHasPassword] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/smtp")
      .then((r) => r.json())
      .then((data) => {
        if (data.smtp) {
          setForm({
            host: data.smtp.host,
            port: data.smtp.port,
            secure: data.smtp.secure,
            username: data.smtp.username,
            password: "",
            fromEmail: data.smtp.fromEmail,
            fromName: data.smtp.fromName,
            isActive: data.smtp.isActive,
          });
          setHasPassword(Boolean(data.smtp.hasPassword));
          setTestTo(data.smtp.fromEmail || "");
        }
      })
      .catch(() => setError("Could not load SMTP settings."));
  }, []);

  function update<K extends keyof SmtpForm>(key: K, value: SmtpForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/smtp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("SMTP settings saved.");
      if (form.password) setHasPassword(true);
      update("password", "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function sendTest() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");
      setMessage(`Test email sent to ${testTo}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-panel">
      <form className="auth-form admin-form" onSubmit={onSave}>
        <div className="form-grid">
          <label className="field">
            <span>SMTP host</span>
            <input
              required
              value={form.host}
              onChange={(e) => update("host", e.target.value)}
              placeholder="smtp.gmail.com"
            />
          </label>
          <label className="field">
            <span>Port</span>
            <input
              type="number"
              required
              value={form.port}
              onChange={(e) => update("port", Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Username</span>
            <input
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Password {hasPassword ? "(leave blank to keep)" : ""}</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            <span>From email</span>
            <input
              type="email"
              required
              value={form.fromEmail}
              onChange={(e) => update("fromEmail", e.target.value)}
            />
          </label>
          <label className="field">
            <span>From name</span>
            <input
              required
              value={form.fromName}
              onChange={(e) => update("fromName", e.target.value)}
            />
          </label>
        </div>
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.secure}
            onChange={(e) => update("secure", e.target.checked)}
          />
          <span>Use TLS/SSL (secure)</span>
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
          />
          <span>SMTP active</span>
        </label>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-ok">{message}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save SMTP"}
        </button>
      </form>

      <div className="test-mail">
        <h3>Send test email</h3>
        <div className="test-row">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="you@example.com"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={sendTest}
            disabled={loading || !testTo}
          >
            Send test
          </button>
        </div>
      </div>
    </div>
  );
}
