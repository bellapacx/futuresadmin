"use client";

import { createContext, useContext } from "react";
import type { AdminRole } from "@/lib/api/admin";

type AdminContextValue = {
  userId: string;
  role: AdminRole;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({
  value,
  children,
}: {
  value: AdminContextValue;
  children: React.ReactNode;
}) {
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used inside <AdminProvider>");
  }
  return ctx;
}

export const canWrite = (role: AdminRole) =>
  role === "admin" || role === "owner";

export const canManageAdmins = (role: AdminRole) => role === "owner";

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Admin",
  developer: "D",
};
