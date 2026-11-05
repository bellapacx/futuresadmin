"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi, type EntitlementItem } from "@/lib/api/admin";
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

type Filter = "all" | "active" | "inactive";
const PAGE_SIZE = 25;

export default function EntitlementsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<EntitlementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setErr(null);
    adminApi
      .entitlements({
        is_active: filter === "all" ? undefined : filter === "active",
        limit: PAGE_SIZE,
        offset,
      })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((e) => setErr(String(e)));
  }, [filter, offset]);

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Entitlements</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-secondary p-0.5">
          {(["all", "active", "inactive"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setOffset(0);
              }}
              className={`px-3 py-1 text-xs font-medium capitalize rounded-md transition-colors ${
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <Table>
        <THead>
          <TR>
            <TH>User</TH>
            <TH>Email</TH>
            <TH>Status</TH>
            <TH>Plan</TH>
            <TH>Expires</TH>
            <TH>Updated</TH>
          </TR>
        </THead>
        <TBody>
          {items.length === 0 && (
            <TableEmpty colSpan={6}>No entitlements</TableEmpty>
          )}
          {items.map((e) => (
            <TR key={e.user_id}>
              <TD>
                <Link
                  href={`/users/${e.user_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {e.display_name || e.user_id.slice(0, 8)}
                </Link>
              </TD>
              <TD className="text-muted-foreground">{e.email ?? "—"}</TD>
              <TD>
                {e.is_active ? (
                  <Badge tone="success">Active</Badge>
                ) : (
                  <Badge tone="neutral">Inactive</Badge>
                )}
              </TD>
              <TD className="text-muted-foreground">{e.plan_tier ?? "—"}</TD>
              <TD className="text-muted-foreground">
                {e.expires_at
                  ? new Date(e.expires_at).toLocaleDateString()
                  : "never"}
              </TD>
              <TD className="text-muted-foreground">
                {new Date(e.updated_at).toLocaleString()}
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
