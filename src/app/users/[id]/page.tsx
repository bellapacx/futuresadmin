"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { adminApi, type UserDetailResponse } from "@/lib/api/admin";
import { useAdmin, canWrite } from "@/lib/admin-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { role } = useAdmin();
  const { toast } = useToast();
  const [user, setUser] = useState<UserDetailResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [isActive, setIsActive] = useState(false);
  const [planTier, setPlanTier] = useState("");
  const [expiresAt, setExpiresAt] = useState(""); // ISO date input value

  useEffect(() => {
    adminApi
      .user(id)
      .then((u) => {
        setUser(u);
        const ent = u.entitlement ?? {};
        setIsActive(Boolean(ent.is_active));
        setPlanTier((ent.plan_tier as string) ?? "");
        const exp = ent.expires_at as string | undefined;
        setExpiresAt(exp ? exp.slice(0, 10) : "");
      })
      .catch((e) => setErr(String(e)));
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      const updated = await adminApi.updateEntitlement(id, {
        is_active: isActive,
        plan_tier: planTier || null,
        expires_at: expiresAt
          ? new Date(expiresAt + "T23:59:59Z").toISOString()
          : null,
      });
      setUser(updated);
      toast("Entitlement updated", "success");
    } catch (e) {
      toast(String(e), "error");
    } finally {
      setSaving(false);
    }
  }

  const editable = canWrite(role);

  if (err) return <p className="text-sm text-destructive">{err}</p>;
  if (!user) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/users"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to users
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {user.display_name || user.email || user.user_id}
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            {user.user_id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Email" value={user.email ?? "—"} />
            <Row label="Name" value={user.display_name ?? "—"} />
            <Row label="Provider" value={user.auth_provider ?? "—"} />
            <Row
              label="Joined"
              value={
                user.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : "—"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Entitlement</CardTitle>
              {!editable && <Badge tone="warning">Read only (D)</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                disabled={!editable}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Active
            </label>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
                Plan tier
              </label>
              <Input
                value={planTier}
                disabled={!editable}
                onChange={(e) => setPlanTier(e.target.value)}
                placeholder="monthly / annual / pro"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
                Expires at (leave empty = never)
              </label>
              <Input
                type="date"
                value={expiresAt}
                disabled={!editable}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {editable && (
              <Button onClick={save} disabled={saving} className="w-full">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
