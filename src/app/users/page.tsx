"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminApi, type UserListItem } from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const PAGE_SIZE = 25;

export default function UsersPage() {
  const [items, setItems] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .users({ q: appliedQuery || undefined, limit: PAGE_SIZE, offset })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setErr(null);
      })
      .catch((e) => !cancelled && setErr(String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [appliedQuery, offset]);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );
  const page = Math.floor(offset / PAGE_SIZE) + 1;

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    setAppliedQuery(query.trim());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <form onSubmit={submitSearch} className="flex gap-2">
          <Input
            placeholder="Search email or name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <Table>
        <THead>
          <TR>
            <TH>User</TH>
            <TH>Email</TH>
            <TH>Signed up</TH>
            <TH>Entitlement</TH>
            <TH>Plan</TH>
            <TH>Expires</TH>
          </TR>
        </THead>
        <TBody>
          {items.length === 0 && !loading && (
            <TableEmpty colSpan={6}>No users found</TableEmpty>
          )}
          {items.map((u) => (
            <TR key={u.user_id}>
              <TD>
                <Link
                  href={`/users/${u.user_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {u.display_name || u.user_id.slice(0, 8)}
                </Link>
              </TD>
              <TD className="text-muted-foreground">{u.email ?? "—"}</TD>
              <TD className="text-muted-foreground">
                {u.created_at
                  ? new Date(u.created_at).toLocaleDateString()
                  : "—"}
              </TD>
              <TD>
                {u.entitlement_active ? (
                  <Badge tone="success">Active</Badge>
                ) : (
                  <Badge tone="neutral">Inactive</Badge>
                )}
              </TD>
              <TD className="text-muted-foreground">
                {u.entitlement_plan_tier ?? "—"}
              </TD>
              <TD className="text-muted-foreground">
                {u.entitlement_expires_at
                  ? new Date(u.entitlement_expires_at).toLocaleDateString()
                  : "never"}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page} of {pages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={offset + PAGE_SIZE >= total}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
