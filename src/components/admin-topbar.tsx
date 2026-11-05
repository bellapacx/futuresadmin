"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAdmin, ROLE_LABEL } from "@/lib/admin-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle"; // ← new

export function AdminTopBar() {
  const router = useRouter();
  const supabase = createClient();
  const { userId, role } = useAdmin();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="text-sm text-muted-foreground">
        Signed in as <span className="font-mono text-xs">{role}</span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle /> {/* ← new */}
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
          {ROLE_LABEL[role]}
        </span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
