import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import { UserButton } from "@/shared/components/UserButton";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Muse Dinners',
  description: 'Matching residents for dinner gatherings',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-50 dark:bg-zinc-900`}
      >
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main content */}
          <div className="flex-1 overflow-auto">
            <header className="bg-white dark:bg-zinc-800 border-b">
              <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link
                  href="/"
                  className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
                >
                  Muse Dinners
                </Link>
                <UserButton />
              </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
