"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "student";
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden />
        <span className="brand-text">Niru Quest Lab</span>
      </Link>
      <nav className="nav-links">
        <Link href="/play">Play</Link>
        <Link href="/scores">Scores</Link>
        {user?.role === "admin" && <Link href="/admin">Admin</Link>}
        {user ? (
          <button type="button" className="nav-btn" onClick={logout}>
            Log out ({user.name})
          </button>
        ) : (
          <Link href="/login" className="nav-cta">
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}
