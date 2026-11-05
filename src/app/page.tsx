"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminHome() {
  const supabase = createClient();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Futures Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You are signed in as an admin.
      </p>
      <button
        onClick={signOut}
        className="mt-6 rounded bg-destructive px-4 py-2 text-white"
      >
        Sign out
      </button>
    </div>
  );
}
