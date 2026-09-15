import type { Metadata, Viewport } from "next";
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
  title: "AmritChidiya (अमृतचिड़िया) - Apni Sone Ki Chidiya",
  description: "AI-powered scheme matching & voice companion for Indian citizens.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-hidden bg-zinc-950 text-zinc-100 dark`}
    >
      <body className="h-full max-h-screen overflow-hidden flex flex-col touch-none select-none bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}

