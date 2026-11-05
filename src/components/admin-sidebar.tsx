"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  CreditCard,
  LineChart,
  ShieldCheck,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin, canManageAdmins, ROLE_LABEL } from "@/lib/admin-context";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ownerOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: BarChart3 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/entitlements", label: "Entitlements", icon: CreditCard },
  { href: "/indicator-versions", label: "Indicators", icon: LineChart },
  { href: "/admins", label: "Admins", icon: ShieldCheck, ownerOnly: true },
  { href: "/audit-log", label: "Audit Log", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { role } = useAdmin();

  const items = NAV.filter((i) => !i.ownerOnly || canManageAdmins(role));

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="text-sm font-semibold">Futures Admin</div>
        <div className="text-xs text-muted-foreground">
          Role: {ROLE_LABEL[role]}
        </div>
      </div>
      <nav className="flex-1 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-foreground/80 hover:bg-accent/50",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
