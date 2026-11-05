"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopBar } from "./admin-topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // /login renders standalone — no sidebar, no top bar
  if (pathname === "/login") {
    return <main>{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
