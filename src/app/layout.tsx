import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zone — Football Analytics",
  description: "Football analytics for Europe's top five leagues and the UEFA Champions League."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zone-black font-sans">
        <header className="sticky top-0 border-b border-zone-border bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-xl font-semibold">Zone</Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
