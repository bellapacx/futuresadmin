"use client";

import { useEffect, useState } from "react";
import { adminApi, type OverviewResponse } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHome() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .overview()
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) return <p className="text-sm text-destructive">{err}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const stats = [
    { label: "Total Users", value: data.total_users },
    { label: "Active Entitlements", value: data.active_entitlements },
    {
      label: "Active Indicator Versions",
      value: data.active_indicator_versions,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle>{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
