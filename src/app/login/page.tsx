"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm p-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Sign In</h1>
      <form onSubmit={signIn} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setEmail(e.target.value)
          }
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setPassword(e.target.value)
          }
          required
        />
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
