"use client";

import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Allow /login through without an admin check
    if (pathname === "/login") {
      setChecking(false);
      return;
    }

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // Ask backend if this user is an admin
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/overview`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );

      if (res.status === 403 || res.status === 401) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setChecking(false);
    }
    check();
  }, [pathname, router, supabase]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
