"use client";

import { useEffect, useState } from "react";
import { adminApi, type AuditLogItem } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  TableEmpty,
} from "@/components/ui/table";
import React from "react";

const PAGE_SIZE = 50;

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .auditLog({ limit: PAGE_SIZE, offset })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((e) => setErr(String(e)));
  }, [offset]);

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">{total} entries</p>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <Table>
        <THead>
          <TR>
            <TH>When</TH>
            <TH>Admin</TH>
            <TH>Action</TH>
            <TH>Target</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {items.length === 0 && (
            <TableEmpty colSpan={5}>No audit entries yet</TableEmpty>
          )}
          {items.map((e) => (
            <React.Fragment key={e.id}>
              <TR key={e.id}>
                <TD className="text-muted-foreground">
                  {new Date(e.created_at).toLocaleString()}
                </TD>
                <TD>
                  <div className="font-medium">
                    {e.admin_email ?? e.admin_user_id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.admin_role}
                  </div>
                </TD>
                <TD className="font-mono text-xs">{e.action}</TD>
                <TD className="text-muted-foreground">
                  {e.target_table ?? "—"}
                  {e.target_user_id && (
                    <div className="font-mono text-xs">
                      {e.target_user_id.slice(0, 8)}…
                    </div>
                  )}
                </TD>
                <TD className="text-right">
                  {e.payload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpanded(expanded === e.id ? null : e.id)
                      }
                    >
                      {expanded === e.id ? "Hide" : "Details"}
                    </Button>
                  )}
                </TD>
              </TR>
              {expanded === e.id && e.payload && (
                <TR key={e.id + "-detail"}>
                  <TD colSpan={5}>
                    <pre className="overflow-x-auto rounded-lg bg-secondary p-3 text-xs">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                  </TD>
                </TR>
              )}
            </React.Fragment>
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
