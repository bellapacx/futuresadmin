import type { Metadata } from "next";
import "./globals.css";
import { AdminGuard } from "@/components/admin-guard";

export const metadata: Metadata = {
  title: "Futures Admin",
  description: "Admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AdminGuard>{children}</AdminGuard>
      </body>
    </html>
  );
}
