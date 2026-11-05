"use client";

import { useEffect, useState } from "react";
import { adminApi, type AdminListItem, type AdminRole } from "@/lib/api/admin";
import { useAdmin } from "@/lib/admin-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  TableEmpty,
} from "@/components/ui/table";

const ROLES: AdminRole[] = ["owner", "admin", "developer"];
const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Admin",
  developer: "D",
};

export default function AdminsPage() {
  const { role: myRole, userId: myId } = useAdmin();
  const { toast } = useToast();
  const [items, setItems] = useState<AdminListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const res = await adminApi.admins();
      setItems(res.items);
      setErr(null);
    } catch (e) {
      setErr(String(e));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  if (myRole !== "owner") {
    return <p className="text-sm text-destructive">Owner access required.</p>;
  }

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi.createAdmin({ email: newEmail.trim(), role: newRole });
      setNewEmail("");
      await refresh();
      toast("Admin added", "success");
    } catch (e) {
      toast(String(e), "error");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(u: AdminListItem, newR: AdminRole) {
    if (newR === u.role) return;
    try {
      await adminApi.updateAdminRole(u.user_id, newR);
      await refresh();
      toast(`${u.email ?? u.user_id} → ${ROLE_LABEL[newR]}`, "success");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function removeAdmin(u: AdminListItem) {
    if (!confirm(`Remove ${u.email ?? u.user_id} from admins?`)) return;
    try {
      await adminApi.deleteAdmin(u.user_id);
      await refresh();
      toast("Admin removed", "success");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admins</h1>
        <p className="text-sm text-muted-foreground">
          Only owners can manage this page. There is exactly one owner.
        </p>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <form
        onSubmit={addAdmin}
        className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-4"
      >
        <Input
          type="email"
          placeholder="admin@example.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="min-w-[240px] flex-1"
          required
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as AdminRole)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="admin">Admin</option>
          <option value="developer">D</option>
        </select>
        <Button type="submit" disabled={busy}>
          {busy ? "Adding…" : "Add admin"}
        </Button>
      </form>

      <Table>
        <THead>
          <TR>
            <TH>Email</TH>
            <TH>Name</TH>
            <TH>Role</TH>
            <TH>Since</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {items.length === 0 && <TableEmpty colSpan={5}>No admins</TableEmpty>}
          {items.map((u) => {
            const isSelf = u.user_id === myId;
            const isOwner = u.role === "owner";
            return (
              <TR key={u.user_id}>
                <TD>{u.email ?? "—"}</TD>
                <TD className="text-muted-foreground">
                  {u.display_name ?? "—"}
                </TD>
                <TD>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u, e.target.value as AdminRole)}
                    disabled={isOwner} // owner role is fixed (transfer via SQL)
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </TD>
                <TD className="text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </TD>
                <TD className="text-right">
                  {isOwner ? (
                    <Badge tone="success">Owner</Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdmin(u)}
                      disabled={isSelf}
                    >
                      Remove
                    </Button>
                  )}
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}
