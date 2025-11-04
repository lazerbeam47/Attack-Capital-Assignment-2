import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import '@/lib/server-scheduler'; // Initialize scheduler on server start

export const metadata: Metadata = {
  title: "Unified Inbox - Multi-Channel Customer Outreach",
  description: "Unified communication platform for SMS, WhatsApp, Email, and Social Media",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

