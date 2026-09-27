"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  KeyRound,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Truck,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ResellerCompany, ResellerCompanyProgress, ResellerServer } from "@/lib/server/resale-store";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  EnterpriseModal,
  type ColumnDef,
} from "@/components/admin/enterprise";

export default function ResaleCompaniesPage() {
  const { t, dir } = useLocale();
  const [companies, setCompanies] = useState<ResellerCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected company drawer/modal state
  const [selectedCompany, setSelectedCompany] = useState<ResellerCompany | null>(null);
  const [companyProgress, setCompanyProgress] = useState<ResellerCompanyProgress[]>([]);
  const [companyServer, setCompanyServer] = useState<ResellerServer | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Edit Server IP form
  const [serverIp, setServerIp] = useState("");
  const [aapanelUrl, setAapanelUrl] = useState("");
  const [savingServer, setSavingServer] = useState(false);
  const [serverSavedMsg, setServerSavedMsg] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resale/companies", { cache: "no-store" });
      const json = (await res.json()) as { ok?: boolean; companies?: ResellerCompany[] };
      if (json?.ok && json.companies) {
        setCompanies(json.companies);
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCompanies();
  }, []);

  const openCompanyDetails = async (company: ResellerCompany) => {
    setSelectedCompany(company);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/resale/companies?id=${company.id}`, { cache: "no-store" });
      const json = (await res.json()) as {
        ok?: boolean;
        company?: ResellerCompany;
        progress?: ResellerCompanyProgress[];
        server?: ResellerServer | null;
      };
      if (json?.ok) {
        setCompanyProgress(json.progress || []);
        setCompanyServer(json.server || null);
        setServerIp(json.server?.ipAddress || "");
        setAapanelUrl(json.server?.aapanelUrl || "");
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoadingDetail(false);
    }
  };

  const saveServer = async () => {
    if (!selectedCompany || !serverIp.trim()) return;
    try {
      setSavingServer(true);
      const res = await fetch("/api/admin/resale/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_server",
          companyId: selectedCompany.id,
          ipAddress: serverIp.trim(),
          aapanelUrl: aapanelUrl.trim(),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; server?: ResellerServer };
      if (json?.ok && json.server) {
        setCompanyServer(json.server);
        setServerSavedMsg(true);
        setTimeout(() => setServerSavedMsg(false), 3000);
      }
    } catch {
      /* error handling */
    } finally {
      setSavingServer(false);
    }
  };

  const updateCompanyStatus = async (status: ResellerCompany["status"]) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch("/api/admin/resale/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          companyId: selectedCompany.id,
          status,
        }),
      });
      const json = (await res.json()) as { ok?: boolean };
      if (json?.ok) {
        setSelectedCompany({ ...selectedCompany, status });
        setCompanies(companies.map((c) => (c.id === selectedCompany.id ? { ...c, status } : c)));
      }
    } catch {
      /* non-blocking */
    }
  };

  const filtered = companies.filter((c) => {
    const matchSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.requestedDomain && c.requestedDomain.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c) => c.status === "active").length;
  const provisioningCompanies = companies.filter((c) => c.status === "provisioning" || c.status === "paid").length;
  const newCompanies = companies.filter((c) => c.status === "registered").length;

  const columns: ColumnDef<ResellerCompany>[] = [
    {
      key: "companyName",
      title: "الشركة وبيانات التواصل",
      render: (c) => (
        <div>
          <p className="font-bold text-foreground text-sm">{c.companyName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Mail className="h-3 w-3 text-primary" />
            {c.email}
          </p>
        </div>
      ),
    },
    {
      key: "requestedDomain",
      title: "النطاق المطلوب",
      render: (c) =>
        c.requestedDomain ? (
          <span className="font-mono text-xs text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg w-fit">
            <Globe className="h-3.5 w-3.5 text-amber-400/80" />
            {c.requestedDomain}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs italic">لم يُحدد بعد</span>
        ),
    },
    {
      key: "status",
      title: "الحالة التشغيلية",
      render: (c) => (
        <EnterpriseStatusBadge
          status={
            c.status === "active"
              ? "active"
              : c.status === "paid"
              ? "paid"
              : c.status === "provisioning"
              ? "pending"
              : c.status === "suspended"
              ? "inactive"
              : "draft"
          }
          label={
            c.status === "active"
              ? "مفعل حي"
              : c.status === "paid"
              ? "تم الدفع"
              : c.status === "provisioning"
              ? "قيد التجهيز"
              : c.status === "suspended"
              ? "موقوف"
              : "مسجل جديد"
          }
        />
      ),
    },
    {
      key: "created",
      title: "تاريخ التسجيل",
      render: (c) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(c.created).toLocaleDateString("ar-EG")}
        </span>
      ),
    },
    {
      key: "actions",
      title: "إجراءات السيرفر",
      align: "left",
      render: (c) => (
        <button
          type="button"
          onClick={() => void openCompanyDetails(c)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-foreground hover:border-primary/40 hover:bg-card/90 font-bold text-xs transition-all shadow-xs active:scale-95"
        >
          <Server className="h-3.5 w-3.5 text-primary" />
          <span>إدارة السيرفر والتقدم</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8" dir={dir}>
      <EnterprisePageHeader
        title={t.admin?.resaleCompanies || "شركات الموزعين والشركاء (B2B Tenants)"}
        description={t.admin?.resaleCompaniesDesc || "متابعة الشركات المسجلة، تعيين خوادم Contabo VPS، وإدارة دورة حياة التسليم الشاملة."}
        icon={Building2}
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الموزعين", href: "/admin/resale" },
          { label: "الشركات الشريكة" },
        ]}
        actions={
          <button
            type="button"
            onClick={() => void loadCompanies()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2.5 text-xs font-bold text-foreground backdrop-blur-md transition-all hover:bg-card hover:border-primary/40 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            تحديث القائمة
          </button>
        }
      />

      <EnterpriseKpiGrid cols={4}>
        <EnterpriseKpiCard
          label="إجمالي الشركات"
          value={totalCompanies}
          hint="جميع الحسابات المسجلة"
          icon={Building2}
          tone="royal"
        />
        <EnterpriseKpiCard
          label="الشركات النشطة"
          value={activeCompanies}
          hint="منصات تعمل مباشرة"
          icon={ShieldCheck}
          tone="emerald"
        />
        <EnterpriseKpiCard
          label="قيد التجهيز والنشر"
          value={provisioningCompanies}
          hint="بانتظار السيرفر والدومين"
          icon={Truck}
          tone="amber"
        />
        <EnterpriseKpiCard
          label="تسجيلات جديدة"
          value={newCompanies}
          hint="بانتظار خطوة الدفع"
          icon={Clock}
          tone="indigo"
        />
      </EnterpriseKpiGrid>

      <div className="space-y-4">
        <EnterpriseFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="بحث باسم الشركة، البريد الإلكتروني، أو النطاق..."
          totalResults={filtered.length}
          filterTabs={[
            { id: "all", label: "الكل" },
            { id: "registered", label: "مسجل جديد" },
            { id: "paid", label: "تم الدفع" },
            { id: "provisioning", label: "قيد التجهيز" },
            { id: "active", label: "مفعل حي" },
            { id: "suspended", label: "موقوف" },
          ]}
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
        />

        <EnterpriseDataTable
          data={filtered}
          columns={columns}
          keyExtractor={(c) => c.id}
          loading={loading}
          emptyTitle="لا توجد شركات مطابقة"
          emptyDescription="ستظهر الشركات هنا تلقائياً عند التسجيل من بوابة الشركاء"
        />
      </div>

      {selectedCompany && (
        <EnterpriseModal
          isOpen={Boolean(selectedCompany)}
          onClose={() => setSelectedCompany(null)}
          title={`إدارة شركة: ${selectedCompany.companyName}`}
          description={selectedCompany.email}
          size="lg"
        >
          {loadingDetail ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">تغيير الحالة التشغيلية:</label>
                <div className="flex flex-wrap gap-2">
                  {(["registered", "paid", "provisioning", "active", "suspended"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => void updateCompanyStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        selectedCompany.status === st
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                          : "bg-card border border-border/60 text-foreground hover:bg-card/90"
                      }`}
                    >
                      {st === "active" && "مفعل حي"}
                      {st === "paid" && "تم الدفع"}
                      {st === "provisioning" && "قيد التجهيز"}
                      {st === "suspended" && "موقوف"}
                      {st === "registered" && "مسجل جديد"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Server IP Configuration */}
              <div className="p-5 rounded-2xl bg-card/80 border border-primary/20 space-y-4 backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">
                      بيانات سيرفر العميل (Contabo VPS & aaPanel)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      بمجرد إدخال عنوان IP السيرفر، ستظهر تعليمات ربط الدومين مع الـ IP تلقائياً في لوحة العميل.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      عنوان IP السيرفر
                    </label>
                    <input
                      type="text"
                      value={serverIp}
                      onChange={(e) => setServerIp(e.target.value)}
                      placeholder="مثال: 5.189.147.52"
                      className="w-full px-3.5 py-2.5 bg-background border border-border/70 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      رابط لوحة aaPanel
                    </label>
                    <input
                      type="text"
                      value={aapanelUrl}
                      onChange={(e) => setAapanelUrl(e.target.value)}
                      placeholder="http://IP:8888/login"
                      className="w-full px-3.5 py-2.5 bg-background border border-border/70 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => void saveServer()}
                    disabled={savingServer || !serverIp.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-md active:scale-95"
                  >
                    {savingServer ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Server className="h-3.5 w-3.5" />
                    )}
                    <span>{serverSavedMsg ? "تم الحفظ وإشعار العميل بنجاح!" : "حفظ بيانات السيرفر"}</span>
                  </button>
                </div>
              </div>

              {/* Delivery Progress Checklist */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-500" />
                  مراحل خط التسليم الآلي (12–24 ساعة)
                </h3>
                <div className="divide-y divide-border/40 border border-border/50 rounded-2xl bg-card/50 overflow-hidden">
                  {companyProgress.map((p, idx) => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-card/80 text-xs transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-[11px] font-black">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-foreground">
                          {p.stageInfo?.titleAr || `مرحلة ${idx + 1}`}
                        </span>
                      </div>
                      <EnterpriseStatusBadge
                        status={
                          p.status === "done"
                            ? "active"
                            : p.status === "in_progress"
                            ? "pending"
                            : "draft"
                        }
                        label={
                          p.status === "done"
                            ? "مكتمل"
                            : p.status === "in_progress"
                            ? "قيد التنفيذ"
                            : p.status === "pending"
                            ? "معلق"
                            : "تم تخطيه"
                        }
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </EnterpriseModal>
      )}
    </div>
  );
}
