"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { adminApi, type AdminRole } from "@/lib/api/admin";
import { AdminProvider } from "@/lib/admin-context";

type State =
  | { kind: "checking" }
  | { kind: "allowed"; userId: string; role: AdminRole };

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<State>({ kind: "checking" });

  useEffect(() => {
    if (pathname === "/login") {
      setState({ kind: "checking" }); // will be replaced by children render
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) router.replace("/login");
          return;
        }
        const overview = await adminApi.overview();
        if (cancelled) return;
        setState({
          kind: "allowed",
          userId: overview.admin_user_id,
          role: overview.admin_role,
        });
      } catch {
        // Any failure (401, 403, 404, network) → deny
        await supabase.auth.signOut();
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router, supabase]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (state.kind === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  return (
    <AdminProvider value={{ userId: state.userId, role: state.role }}>
      {children}
    </AdminProvider>
  );
}
