import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MAPID Catalyst 2026 - Management Dashboard",
  description: "Internal management dashboard for MAPID Catalyst 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-bgbase text-zinc-900 antialiased flex h-screen overflow-hidden`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
