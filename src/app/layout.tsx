import type { Metadata } from "next";
import "./globals.css";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Futures Admin",
  description: "Admin dashboard",
};

// Inline script: runs before paint, sets .dark on <html> from storage
// so there's no flash-of-light on first load.
const THEME_INIT = `
(function() {
  try {
    var stored = localStorage.getItem('futures-admin-theme') || 'system';
    var dark = stored === 'dark' ||
      (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-screen antialiased bg-background text-foreground">
        <ThemeProvider>
          <AdminGuard>
            <AdminShell>{children}</AdminShell>
          </AdminGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
