"use client";

import { apiFetch } from "./client";

// ---- Types ---------------------------------------------------------------

export type AdminRole = "owner" | "admin" | "developer";

export type OverviewResponse = {
  total_users: number;
  active_entitlements: number;
  active_indicator_versions: number;
  admin_user_id: string;
  admin_role: AdminRole;
};

export type UserListItem = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string | null;
  entitlement_active: boolean;
  entitlement_plan_tier: string | null;
  entitlement_expires_at: string | null;
};

export type UsersListResponse = {
  items: UserListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type UserDetailResponse = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
  created_at: string | null;
  entitlement: Record<string, unknown> | null;
};

export type EntitlementItem = {
  user_id: string;
  membership_id: string | null;
  is_active: boolean;
  plan_tier: string | null;
  expires_at: string | null;
  last_verified_at: string | null;
  updated_at: string;
  email: string | null;
  display_name: string | null;
};

export type EntitlementsListResponse = {
  items: EntitlementItem[];
  total: number;
  limit: number;
  offset: number;
};

export type IndicatorVersionItem = {
  id: string;
  version_label: string;
  status: string;
  source_hash: string | null;
  validated_at: string | null;
  activated_at: string | null;
  activated_by: string | null;
  created_at: string;
  created_by: string | null;
  notes: string | null;
  has_source: boolean;
};

export type IndicatorVersionsListResponse = {
  items: IndicatorVersionItem[];
  total: number;
};

export type AdminListItem = {
  user_id: string;
  role: AdminRole;
  email: string | null;
  display_name: string | null;
  created_at: string;
};

export type AdminsListResponse = { items: AdminListItem[] };

export type AuditLogItem = {
  id: string;
  admin_user_id: string;
  admin_role: string;
  action: string;
  target_user_id: string | null;
  target_table: string | null;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  admin_email: string | null;
};

export type AuditLogListResponse = {
  items: AuditLogItem[];
  total: number;
  limit: number;
  offset: number;
};

// ---- Endpoints -----------------------------------------------------------

export const adminApi = {
  overview: () => apiFetch<OverviewResponse>("/admin/overview"),

  users: (params: { q?: string; limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.q) q.set("q", params.q);
    if (params.limit != null) q.set("limit", String(params.limit));
    if (params.offset != null) q.set("offset", String(params.offset));
    const qs = q.toString();
    return apiFetch<UsersListResponse>(`/admin/users${qs ? `?${qs}` : ""}`);
  },

  user: (userId: string) =>
    apiFetch<UserDetailResponse>(`/admin/users/${userId}`),

  updateEntitlement: (
    userId: string,
    body: {
      is_active?: boolean;
      plan_tier?: string | null;
      expires_at?: string | null;
    },
  ) =>
    apiFetch<UserDetailResponse>(`/admin/users/${userId}/entitlement`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  entitlements: (
    params: { is_active?: boolean; limit?: number; offset?: number } = {},
  ) => {
    const q = new URLSearchParams();
    if (params.is_active != null) q.set("is_active", String(params.is_active));
    if (params.limit != null) q.set("limit", String(params.limit));
    if (params.offset != null) q.set("offset", String(params.offset));
    const qs = q.toString();
    return apiFetch<EntitlementsListResponse>(
      `/admin/entitlements${qs ? `?${qs}` : ""}`,
    );
  },

  indicatorVersions: () =>
    apiFetch<IndicatorVersionsListResponse>("/admin/indicator-versions"),

  admins: () => apiFetch<AdminsListResponse>("/admin/admins"),

  createAdmin: (body: { email: string; role: AdminRole }) =>
    apiFetch<AdminListItem>("/admin/admins", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateAdminRole: (userId: string, role: AdminRole) =>
    apiFetch<AdminListItem>(`/admin/admins/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  deleteAdmin: (userId: string) =>
    apiFetch<{ deleted: boolean; user_id: string }>(`/admin/admins/${userId}`, {
      method: "DELETE",
    }),

  auditLog: (params: { limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.limit != null) q.set("limit", String(params.limit));
    if (params.offset != null) q.set("offset", String(params.offset));
    const qs = q.toString();
    return apiFetch<AuditLogListResponse>(
      `/admin/audit-log${qs ? `?${qs}` : ""}`,
    );
  },
};
