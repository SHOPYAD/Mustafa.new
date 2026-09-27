"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Database,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserPlus,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { ProfileRow } from "@/types/database";
import { useLocale, dateLocaleTag } from "@/lib/i18n/LocaleProvider";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  type ColumnDef,
} from "@/components/admin/enterprise";
import { Button } from "@/components/ui/button";

export default function AdminCustomersPage() {
  const { t, locale } = useLocale();
  const [customers, setCustomers] = useState<ProfileRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [pocketbase, setPocketbase] = useState(false);
  const [message, setMessage] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (roleFilter === "admin" && c.role !== "admin") return false;
      if (roleFilter === "customer" && c.role === "admin") return false;
      return true;
    });
  }, [customers, roleFilter]);

  const adminCount = customers.filter((c) => c.role === "admin").length;
  const userCount = customers.length - adminCount;

  const columns: ColumnDef<ProfileRow>[] = [
    {
      key: "customer",
      header: "بيانات العميل",
      render: (c) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 text-primary font-bold text-sm border border-primary/20 shadow-xs">
            {c.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.avatar_url} alt="" className="h-full w-full object-cover no-theme-image" />
            ) : (
              (c.full_name || c.email || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
              {c.full_name || "عميل بدون اسم"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">ID: {c.id.slice(0, 8)}…</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "معلومات الاتصال",
      render: (c) => (
        <div className="space-y-1 text-xs text-muted-foreground font-mono">
          {c.email && (
            <a
              href={`mailto:${c.email}`}
              className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
            >
              <Mail size={12} className="text-primary shrink-0" />
              <span className="truncate">{c.email}</span>
            </a>
          )}
          {c.phone && (
            <a
              href={`tel:${c.phone}`}
              className="flex items-center gap-1.5 text-foreground hover:text-emerald-500 transition-colors"
            >
              <Phone size={12} className="text-emerald-500 shrink-0" />
              <span dir="ltr">{c.phone}</span>
            </a>
          )}
          {!c.email && !c.phone && <span>—</span>}
        </div>
      ),
    },
    {
      key: "role",
      header: "الدور والصلاحية",
      align: "center",
      render: (c) => (
        <EnterpriseStatusBadge
          variant={c.role === "admin" ? "royal" : "neutral"}
          label={c.role === "admin" ? "مدير نظام" : "عميل مسافر"}
          icon={c.role === "admin" ? <Shield size={12} /> : undefined}
        />
      ),
    },
    {
      key: "joined",
      header: "تاريخ الانضمام",
      sortable: true,
      render: (c) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(c.created_at).toLocaleDateString(dateLocaleTag(locale), {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "إدارة العملاء", href: "/admin/customers" },
          { label: "قاعدة بيانات المسافرين" },
        ]}
        icon={<Users className="h-6 w-6 text-primary" />}
        title={t.admin.customers || "إدارة قاعدة بيانات العملاء والمسافرين"}
        subtitle={t.admin.customersSubtitle || "استعراض سجلات العملاء المسجلين، بيانات الاتصال، سجل الحجوزات، والأذونات المرتبطة بحساباتهم."}
        actions={
          <div className="flex items-center gap-2">
            <EnterpriseStatusBadge
              variant={pocketbase ? "active" : "warning"}
              label={pocketbase ? t.admin.pocketbaseConnected : "تخزين محلي مؤقت"}
              pulse={pocketbase}
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-border/60 bg-card/60 hover:bg-muted font-semibold text-xs"
              onClick={() => void load()}
            >
              تحديث البيانات
            </Button>
          </div>
        }
      />

      {!pocketbase && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-500 flex items-center justify-between gap-3 backdrop-blur-xl">
          <span>{message || t.admin.noCustomersHint}</span>
          <Link href="/admin/pocketbase" className="underline font-bold hover:text-amber-400 shrink-0">
            {t.admin.connectPocketbase}
          </Link>
        </div>
      )}

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={3}>
        <EnterpriseKpiCard
          title="إجمالي حسابات العملاء"
          value={customers.length}
          subValue="حساب مسجل بالمنصة"
          icon={<Users className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="المسافرون النشطون"
          value={userCount}
          subValue="حسابات عملاء عادية"
          icon={<UserCheck className="size-5" />}
          color="emerald"
        />
        <EnterpriseKpiCard
          title="طاقم إدارة النظام"
          value={adminCount}
          subValue="حسابات مدراء ومشرفين"
          icon={<Shield className="size-5" />}
          color="amber"
        />
      </EnterpriseKpiGrid>

      {/* Filter Bar */}
      <EnterpriseFilterBar
        searchPlaceholder={t.admin.customersSearchPlaceholder || "البحث بالاسم، البريد، أو الهاتف..."}
        searchValue={q}
        onSearchChange={setQ}
        tabs={[
          { id: "all", label: "كافة الحسابات", count: customers.length },
          { id: "customer", label: "العملاء المسافرون", count: userCount },
          { id: "admin", label: "طاقم الإدارة", count: adminCount },
        ]}
        activeTab={roleFilter}
        onTabChange={setRoleFilter}
        totalResults={filtered.length}
      />

      {/* Data Table */}
      <EnterpriseDataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        keyField="id"
        isLoading={loading}
        pageSize={12}
        emptyTitle={t.admin.noCustomers || "لا يوجد عملاء مسجلون"}
        emptyDescription={t.admin.noCustomersHint || "لم يتم العثور على أي حساب يطابق شروط البحث الحالية."}
      />
    </div>
  );
}
