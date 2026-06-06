import type { Metadata } from "next";
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
  title: "Memory Grid – Zaya's Playground",
  description: "A polished memory card game. Find all matching pairs as fast as you can.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      /* suppressHydrationWarning prevents React from warning when JS
         sets data-theme on <html> to match the stored preference */
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
