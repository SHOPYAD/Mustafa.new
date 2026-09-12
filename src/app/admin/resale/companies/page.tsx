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
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ResellerCompany, ResellerCompanyProgress, ResellerServer } from "@/lib/server/resale-store";

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

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-amber-500" />
            {t.admin.resaleCompanies}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t.admin.resaleCompaniesDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadCompanies()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>تحديث</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد أو الدومين..."
            className="w-full pl-4 pr-10 py-2.5 bg-card/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-card/60 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        >
          <option value="all">جميع الحالات</option>
          <option value="registered">مسجل (registered)</option>
          <option value="paid">تم الدفع (paid)</option>
          <option value="provisioning">قيد التجهيز (provisioning)</option>
          <option value="active">مفعل حي (active)</option>
          <option value="suspended">موقوف (suspended)</option>
        </select>
      </div>

      {/* Companies Table */}
      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="font-medium text-foreground">لا توجد شركات مطابقة</p>
            <p className="text-xs">ستظهر الشركات هنا تلقائياً عند التسجيل من بوابة الشركاء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-5 py-3.5">الشركة</th>
                  <th className="px-5 py-3.5">الدومين المطلوب</th>
                  <th className="px-5 py-3.5">الحالة</th>
                  <th className="px-5 py-3.5">تاريخ التسجيل</th>
                  <th className="px-5 py-3.5 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{c.companyName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {c.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-amber-500">
                      {c.requestedDomain ? (
                        <span className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.requestedDomain}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">لم يُحدد بعد</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          c.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : c.status === "paid"
                            ? "bg-blue-500/10 text-blue-500"
                            : c.status === "provisioning"
                            ? "bg-purple-500/10 text-purple-500"
                            : c.status === "suspended"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {c.status === "active" && "مفعل حي"}
                        {c.status === "paid" && "تم الدفع"}
                        {c.status === "provisioning" && "قيد التجهيز"}
                        {c.status === "suspended" && "موقوف"}
                        {c.status === "registered" && "مسجل جديد"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {new Date(c.created).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-5 py-4 text-left">
                      <button
                        type="button"
                        onClick={() => void openCompanyDetails(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-foreground hover:bg-muted font-medium text-xs transition-colors"
                      >
                        <Server className="h-3.5 w-3.5 text-amber-500" />
                        <span>إدارة السيرفر والتقدم</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Company Detail Drawer / Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-500" />
                  {selectedCompany.companyName}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedCompany.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="p-1.5 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <>
                {/* Status Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">تغيير حالة الشركة:</label>
                  <div className="flex flex-wrap gap-2">
                    {(["registered", "paid", "provisioning", "active", "suspended"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => void updateCompanyStatus(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          selectedCompany.status === st
                            ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                            : "bg-secondary text-foreground hover:bg-muted"
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
                <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Server className="h-4 w-4 text-purple-500" />
                    بيانات سيرفر العميل (Contabo VPS & aaPanel)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    بمجرد إدخال عنوان IP السيرفر، ستظهر تعليمات ربط الدومين مع الـ IP تلقائياً في لوحة العميل.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        عنوان IP السيرفر
                      </label>
                      <input
                        type="text"
                        value={serverIp}
                        onChange={(e) => setServerIp(e.target.value)}
                        placeholder="مثال: 5.189.147.52"
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        رابط لوحة aaPanel
                      </label>
                      <input
                        type="text"
                        value={aapanelUrl}
                        onChange={(e) => setAapanelUrl(e.target.value)}
                        placeholder="http://IP:8888/login"
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => void saveServer()}
                      disabled={savingServer || !serverIp.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 font-semibold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all"
                    >
                      {savingServer ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Server className="h-3.5 w-3.5" />
                      )}
                      <span>{serverSavedMsg ? "تم الحفظ وإشعار العميل" : "حفظ بيانات السيرفر"}</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Progress Checklist */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Truck className="h-4 w-4 text-amber-500" />
                    مراحل خط التسليم (12–24 ساعة)
                  </h3>
                  <div className="divide-y divide-border border border-border rounded-xl bg-card/50 overflow-hidden">
                    {companyProgress.map((p, idx) => (
                      <div key={p.id} className="p-3 flex items-center justify-between hover:bg-muted/20 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-foreground">
                            {p.stageInfo?.titleAr || `مرحلة ${idx + 1}`}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            p.status === "done"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : p.status === "in_progress"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {p.status === "done" && "مكتمل"}
                          {p.status === "in_progress" && "قيد التنفيذ"}
                          {p.status === "pending" && "معلق"}
                          {p.status === "skipped" && "تم تخطيه"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
