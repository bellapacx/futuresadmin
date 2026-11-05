"use client";

import { createClient } from "@/lib/supabase/client";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
// Normalize so we always end up with `<host>/api/v1`
const API_BASE = RAW_BASE.replace(/\/+$/, "").endsWith("/api/v1")
  ? RAW_BASE.replace(/\/+$/, "")
  : `${RAW_BASE.replace(/\/+$/, "")}/api/v1`;

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new ApiError(401, "Not authenticated");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail);
  }

  // 204
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
