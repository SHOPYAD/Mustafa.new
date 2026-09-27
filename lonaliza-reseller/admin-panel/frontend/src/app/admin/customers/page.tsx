"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Search,
  Loader2,
  Database,
  Mail,
  Phone,
  Shield,
  UserCircle,
} from "lucide-react";
import type { ProfileRow } from "@/types/database";
import { useLocale, dateLocaleTag } from "@/lib/i18n/LocaleProvider";
import {
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminCustomersPage() {
  const { t, locale } = useLocale();
  const [customers, setCustomers] = useState<ProfileRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [pocketbase, setPocketbase] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      const res = await fetch(`/api/customers${qs}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const json = (await res.json()) as {
        customers: ProfileRow[];
        pocketbase?: boolean;
        message?: string;
        error?: string;
      };
      setCustomers(json.customers || []);
      setPocketbase(Boolean(json.pocketbase));
      setMessage(json.message || json.error || "");
    } catch {
      setCustomers([]);
      setPocketbase(false);
      setMessage(t.admin.failedLoadCustomers);
    }
    setLoading(false);
  }, [q, t.admin.failedLoadCustomers]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <AdminPage className="flex flex-col gap-6">
      <AdminPageHeader
        breadcrumb={<span>لوحة التحكم <span className="mx-1 opacity-50">/</span> العملاء</span>}
        icon={<Users className="size-5" />}
        title={t.admin.customers}
        description={t.admin.customersSubtitle}
        actions={
          <Badge variant={pocketbase ? "secondary" : "outline"}>
            <Database size={14} />
            {pocketbase ? t.admin.pocketbaseConnected : t.admin.connectPocketbase}
          </Badge>
        }
      />

      {!pocketbase ? (
        <Alert>
          <AlertDescription>{message || t.admin.noCustomersHint}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.admin.customersSearchPlaceholder}
            />
          </div>
          {loading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : customers.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t.admin.noCustomers}</EmptyTitle>
                <EmptyDescription>{t.admin.noCustomersHint}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.colCustomer}</TableHead>
                  <TableHead>{t.admin.colContact}</TableHead>
                  <TableHead>{t.admin.colRole}</TableHead>
                  <TableHead>{t.admin.colJoined}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                          {c.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            (c.full_name || c.email || "?").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{c.full_name || "—"}</p>
                          <p className="font-mono text-xs text-muted-foreground">{c.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {c.email ? (
                          <p className="flex items-center gap-1.5">
                            <Mail size={12} />
                            {c.email}
                          </p>
                        ) : null}
                        {c.phone ? (
                          <p className="flex items-center gap-1.5">
                            <Phone size={12} />
                            {c.phone}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.role === "admin" ? "secondary" : "outline"}>
                        <Shield size={10} />
                        {c.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString(dateLocaleTag(locale), {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminPage>
  );
}
