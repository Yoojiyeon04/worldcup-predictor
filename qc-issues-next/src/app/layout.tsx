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
  title: "QC 이슈 추적",
  description: "Supabase qc_issues 기반 QC 이슈 추적 웹앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-100 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="text-lg font-bold text-teal-800">
              QC 이슈 추적
            </Link>
            <nav className="flex gap-4 text-sm font-medium">
              <Link href="/" className="text-zinc-600 hover:text-teal-700">
                목록
              </Link>
              <Link href="/new" className="text-zinc-600 hover:text-teal-700">
                등록
              </Link>
              <Link href="/admin" className="text-zinc-600 hover:text-teal-700">
                관리
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-zinc-200 bg-white py-4 text-center text-xs text-zinc-500">
          Supabase qc_issues · 공개 API는 anon key · 관리 API는 service_role (서버 전용)
        </footer>
      </body>
    </html>
  );
}
