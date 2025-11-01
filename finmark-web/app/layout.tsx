import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinMark Network Config Helper",
  description:
    "Guided setup for VirtualBox NAT + Host-Only networking and Windows static IP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(127,127,127,0.2)",
            position: "sticky",
            top: 0,
            backdropFilter: "blur(6px)",
          }}
        >
          <Link href="/" style={{ fontWeight: 700 }}>FinMark</Link>
          <nav style={{ display: "flex", gap: 16 }}>
            <Link href="/">Configurator</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/troubleshooting">Troubleshooting</Link>
          </nav>
        </header>
        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
