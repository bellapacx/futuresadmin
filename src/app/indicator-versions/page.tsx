"use client";

import { useEffect, useState } from "react";
import { adminApi, type IndicatorVersionItem } from "@/lib/api/admin";
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

export default function IndicatorVersionsPage() {
  const [items, setItems] = useState<IndicatorVersionItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .indicatorVersions()
      .then((res) => setItems(res.items))
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Indicator Versions</h1>
        <p className="text-sm text-muted-foreground">
          Pine source is never shown in the admin UI, for any role.
        </p>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <Table>
        <THead>
          <TR>
            <TH>Version</TH>
            <TH>Status</TH>
            <TH>Source</TH>
            <TH>Created</TH>
            <TH>Activated</TH>
            <TH>Notes</TH>
          </TR>
        </THead>
        <TBody>
          {items.length === 0 && (
            <TableEmpty colSpan={6}>No indicator versions</TableEmpty>
          )}
          {items.map((v) => (
            <TR key={v.id}>
              <TD className="font-medium">{v.version_label}</TD>
              <TD>
                <Badge
                  tone={
                    v.status === "active"
                      ? "success"
                      : v.status === "draft"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {v.status}
                </Badge>
              </TD>
              <TD className="text-muted-foreground">
                {v.has_source ? "present" : "missing"}
              </TD>
              <TD className="text-muted-foreground">
                {new Date(v.created_at).toLocaleDateString()}
              </TD>
              <TD className="text-muted-foreground">
                {v.activated_at
                  ? new Date(v.activated_at).toLocaleDateString()
                  : "—"}
              </TD>
              <TD className="text-muted-foreground">{v.notes ?? "—"}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
