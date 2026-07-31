import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Niru Quest Lab — Math & Science Games",
  description:
    "Play grade-wise math and science games. Optional login, admin SMTP, and MySQL-backed scores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable} h-full`}>
      <body className="site-shell antialiased">
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
