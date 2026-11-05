"use client";

import { Suspense } from "react";
import { AdminGuardInner } from "./admin-guard-inner";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <AdminGuardInner>{children}</AdminGuardInner>
    </Suspense>
  );
}
