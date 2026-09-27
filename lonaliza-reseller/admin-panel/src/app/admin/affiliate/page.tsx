"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Filter,
  Loader2,
  Plus,
  Save,
  Share2,
  Users2,
  X,
  TrendingUp,
  DollarSign,
  ArrowDownToLine,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  AFFILIATE_SERVICES,
  type AffiliateCommissions,
  type CommissionKind,
  DEFAULT_COMMISSIONS,
} from "@/lib/affiliate/types";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseStatusBadge,
} from "@/components/admin/enterprise";
import { Button } from "@/components/ui/button";

type Tab = "settings" | "marketers" | "visits" | "conversions" | "withdrawals";

const inputClass =
  "w-full px-3.5 py-2.5 bg-background/80 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium transition-colors";

function money(n: number) {
  return `$${Math.round((Number(n) || 0) * 100) / 100}`;
}

export default function AdminAffiliatePage() {
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [enabled, setEnabled] = useState(true);
  const [cookieDays, setCookieDays] = useState(30);
  const [minWithdraw, setMinWithdraw] = useState(100);
  const [commissions, setCommissions] = useState<AffiliateCommissions>(DEFAULT_COMMISSIONS);

  const [marketers, setMarketers] = useState<
    Array<{ id: string; code: string; status: string; name: string; email: string; visitCount: number }>
  >([]);
  const [visits, setVisits] = useState<
    Array<{ id: string; code: string; path: string; service: string; created: string }>
  >([]);
  const [visitFilter, setVisitFilter] = useState({ code: "", service: "", from: "", to: "" });
  const [conversions, setConversions] = useState<
    Array<{
      id: string;
      code: string;
      service: string;
      status: string;
      booking_amount: number;
      commission: number;
      notes?: string;
    }>
  >([]);
  const [withdrawals, setWithdrawals] = useState<
    Array<{
      id: string;
      code: string;
      amount: number;
      status: string;
      method: string;
      payout_details: Record<string, unknown>;
      created: string;
    }>
  >([]);

  const [newConv, setNewConv] = useState({
    code: "",
    service: "hotel",
    booking_amount: "",
    commission: "",
    notes: "",
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/affiliate", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok) {
        if (data.settings) {
          setEnabled(data.settings.enabled ?? true);
          setCookieDays(data.settings.cookieDays ?? 30);
          setMinWithdraw(data.settings.minWithdraw ?? 100);
          if (data.settings.commissions) setCommissions(data.settings.commissions);
        }
        setMarketers(Array.isArray(data.marketers) ? data.marketers : []);
        setVisits(Array.isArray(data.visits) ? data.visits : []);
        setConversions(Array.isArray(data.conversions) ? data.conversions : []);
        setWithdrawals(Array.isArray(data.withdrawals) ? data.withdrawals : []);
      }
    } catch {
      setMsg("Failed to load affiliate data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const saveSettings = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/affiliate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          cookieDays,
          minWithdraw,
          commissions,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setMsg(t.admin.saved);
      } else {
        setMsg(data?.error || t.admin.saveFailed);
      }
    } catch {
      setMsg(t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const patch = async (type: string, id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/affiliate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, status }),
      });
      const data = await res.json();
      if (data?.ok) {
        await loadAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createConversion = async () => {
    if (!newConv.code.trim()) return;
    try {
      const res = await fetch("/api/admin/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_conversion",
          ...newConv,
          booking_amount: Number(newConv.booking_amount) || 0,
          commission: Number(newConv.commission) || 0,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setNewConv({ code: "", service: "hotel", booking_amount: "", commission: "", notes: "" });
        await loadAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const serviceLabel = (s: string) => {
    switch (s) {
      case "hotel":
        return t.admin.typeHotel;
      case "car":
        return t.admin.cars;
      case "transfer":
        return t.admin.typeTransfer;
      case "package":
        return t.admin.typePackage;
      default:
        return t.admin.typeGeneral;
    }
  };

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: "settings", label: t.admin.settings || "إعدادات العمولات" },
    { id: "marketers", label: t.admin.marketers || "المسوقون", count: marketers.length },
    { id: "visits", label: t.admin.visits || "سجل الزيارات", count: visits.length },
    { id: "conversions", label: t.admin.conversions || "المبيعات والتحويلات", count: conversions.length },
    { id: "withdrawals", label: t.admin.withdrawals || "طلبات السحب", count: withdrawals.length },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "المبيعات والشركاء", href: "/admin/affiliate" },
          { label: "برنامج التسويق بالعمولة" },
        ]}
        icon={<Share2 className="h-6 w-6 text-primary" />}
        title={t.admin.affiliate || "برنامج التسويق بالعمولة وإدارة المسوقين"}
        subtitle={t.admin.affiliateSubtitle || "إدارة نسب عمولات الخدمات، تتبع كودات الإحالة، رصد التحويلات، ومعالجة طلبات سحب الأرباح."}
      />

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={4}>
        <EnterpriseKpiCard
          title="المسوقون المسجلون"
          value={marketers.length}
          subValue="كود إحالة نشط"
          icon={<Users2 className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="إجمالي الزيارات المحالة"
          value={visits.length}
          subValue="نقرة من روابط الإحالة"
          icon={<MousePointerClick className="size-5" />}
          color="blue"
        />
        <EnterpriseKpiCard
          title="المبيعات والتحويلات"
          value={conversions.length}
          subValue="حجز مكتمل بالعمولة"
          icon={<TrendingUp className="size-5" />}
          color="emerald"
        />
        <EnterpriseKpiCard
          title="طلبات سحب الأرباح"
          value={withdrawals.length}
          subValue="سحب للأرصدة المستحقة"
          icon={<ArrowDownToLine className="size-5" />}
          color="amber"
        />
      </EnterpriseKpiGrid>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-card/60 border border-border/50 rounded-2xl w-fit backdrop-blur-xl">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              tab === item.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className="rounded-full bg-background/50 px-1.5 py-0.2 text-[10px] font-mono">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-card/50 rounded-3xl border border-border/50">
          <Loader2 className="animate-spin text-primary size-8" />
        </div>
      ) : tab === "settings" ? (
        <div className="space-y-6 rounded-2xl border border-border/50 bg-card/70 p-6 sm:p-8 shadow-xs backdrop-blur-xl">
          <div className="flex items-center justify-between pb-5 border-b border-border/40">
            <div>
              <h2 className="text-base font-bold text-foreground">
                {t.admin.settings || "إعدادات نظام العمولة"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                تفعيل أو تعطيل البرنامج وضبط الشروط العامة وصلاحية الكوكيز
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ms-3 text-xs font-bold text-foreground">
                {enabled ? "البرنامج مفعّل" : "البرنامج معطل"}
              </span>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-bold text-muted-foreground space-y-1.5 block">
              <span>{t.admin.cookieDays || "صلاحية كوكيز الإحالة (أيام)"}</span>
              <input
                type="number"
                value={cookieDays}
                onChange={(e) => setCookieDays(Number(e.target.value) || 30)}
                className={inputClass}
              />
            </label>
            <label className="text-xs font-bold text-muted-foreground space-y-1.5 block">
              <span>{t.admin.minWithdraw || "الحد الأدنى للسحب"} ($)</span>
              <input
                type="number"
                value={minWithdraw}
                onChange={(e) => setMinWithdraw(Number(e.target.value) || 100)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-foreground">
              {t.admin.commission || "عمولات الخدمات للمسوقين"}
            </h3>
            <div className="space-y-2.5">
              {AFFILIATE_SERVICES.map((service) => (
                <div
                  key={service}
                  className="grid items-center gap-3 rounded-xl bg-muted/30 border border-border/40 p-3.5 sm:grid-cols-[160px_1fr_1fr]"
                >
                  <p className="text-xs font-bold text-foreground">
                    {serviceLabel(service)}
                  </p>
                  <select
                    value={commissions[service].type}
                    onChange={(e) =>
                      setCommissions((prev) => ({
                        ...prev,
                        [service]: {
                          ...prev[service],
                          type: e.target.value as CommissionKind,
                        },
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="percent">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت ($)</option>
                  </select>
                  <input
                    type="number"
                    value={commissions[service].value}
                    onChange={(e) =>
                      setCommissions((prev) => ({
                        ...prev,
                        [service]: {
                          ...prev[service],
                          value: Number(e.target.value) || 0,
                        },
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border/40">
            <Button
              type="button"
              onClick={() => void saveSettings()}
              disabled={saving}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-lg shadow-amber-500/20 px-6"
            >
              <Save size={16} />
              <span>{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</span>
            </Button>
            {msg && (
              <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <Check size={16} /> {msg}
              </p>
            )}
          </div>
        </div>
      ) : tab === "marketers" ? (
        <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card/70 shadow-xs backdrop-blur-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border/40 text-xs">
              <tr>
                <th className="px-5 py-3.5 text-start">المسوق</th>
                <th className="px-5 py-3.5 text-start">كود الإحالة</th>
                <th className="px-5 py-3.5 text-start">عدد الزيارات</th>
                <th className="px-5 py-3.5 text-start">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {marketers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                    <Users2 className="size-8 mx-auto mb-2 opacity-40 text-primary" />
                    لا يوجد مسوقون مسجلون حالياً
                  </td>
                </tr>
              ) : (
                marketers.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-foreground">{m.name || "—"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{m.email}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-primary">
                      {m.code}
                    </td>
                    <td className="px-5 py-3.5 font-bold tabular-nums">{m.visitCount}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={m.status}
                        onChange={(e) => void patch("marketer", m.id, e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border/60 rounded-lg text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="active">نشط</option>
                        <option value="paused">موقف مؤقتاً</option>
                        <option value="banned">محظور</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : tab === "visits" ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4 bg-card/70 p-4 rounded-2xl border border-border/50 shadow-xs backdrop-blur-xl">
            <input
              value={visitFilter.code}
              onChange={(e) => setVisitFilter((p) => ({ ...p, code: e.target.value }))}
              placeholder="فلترة بكود الإحالة..."
              className={inputClass}
            />
            <select
              value={visitFilter.service}
              onChange={(e) => setVisitFilter((p) => ({ ...p, service: e.target.value }))}
              className={inputClass}
            >
              <option value="">جميع الخدمات</option>
              {AFFILIATE_SERVICES.map((s) => (
                <option key={s} value={s}>
                  {serviceLabel(s)}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={visitFilter.from}
              onChange={(e) => setVisitFilter((p) => ({ ...p, from: e.target.value }))}
              className={inputClass}
            />
            <input
              type="date"
              value={visitFilter.to}
              onChange={(e) => setVisitFilter((p) => ({ ...p, to: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card/70 shadow-xs backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border/40 text-xs">
                <tr>
                  <th className="px-5 py-3.5 text-start">كود المسوق</th>
                  <th className="px-5 py-3.5 text-start">المسار</th>
                  <th className="px-5 py-3.5 text-start">الخدمة</th>
                  <th className="px-5 py-3.5 text-start">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {visits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                      لا توجد زيارات مسجلة
                    </td>
                  </tr>
                ) : (
                  visits.map((v) => (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-primary">
                        {v.code}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{v.path}</td>
                      <td className="px-5 py-3.5 font-medium">{serviceLabel(v.service)}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground tabular-nums">{v.created}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "conversions" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card/70 p-6 sm:p-7 shadow-xs backdrop-blur-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">تسجيل تحويل يدوي</h3>
              <p className="text-xs text-muted-foreground mt-0.5">إضافة عمولة لمسوق يدوياً بناءً على حجز ناجح</p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-3">
              <input
                value={newConv.code}
                onChange={(e) => setNewConv((p) => ({ ...p, code: e.target.value }))}
                placeholder="كود الإحالة..."
                className={inputClass}
              />
              <select
                value={newConv.service}
                onChange={(e) => setNewConv((p) => ({ ...p, service: e.target.value }))}
                className={inputClass}
              >
                {AFFILIATE_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {serviceLabel(s)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={newConv.booking_amount}
                onChange={(e) => setNewConv((p) => ({ ...p, booking_amount: e.target.value }))}
                placeholder="قيمة الحجز ($)"
                className={inputClass}
              />
              <input
                type="number"
                value={newConv.commission}
                onChange={(e) => setNewConv((p) => ({ ...p, commission: e.target.value }))}
                placeholder="قيمة العمولة المستحقة ($)"
                className={inputClass}
              />
              <input
                value={newConv.notes}
                onChange={(e) => setNewConv((p) => ({ ...p, notes: e.target.value }))}
                placeholder="ملاحظات الحجز..."
                className={`sm:col-span-2 ${inputClass}`}
              />
            </div>
            <Button
              type="button"
              onClick={() => void createConversion()}
              className="rounded-xl bg-primary text-primary-foreground font-bold"
            >
              تسجيل التحويل الآن
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card/70 shadow-xs backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border/40 text-xs">
                <tr>
                  <th className="px-5 py-3.5 text-start">كود المسوق</th>
                  <th className="px-5 py-3.5 text-start">الخدمة</th>
                  <th className="px-5 py-3.5 text-start">قيمة الحجز</th>
                  <th className="px-5 py-3.5 text-start">العمولة</th>
                  <th className="px-5 py-3.5 text-start">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {conversions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      لا توجد تحويلات مسجلة
                    </td>
                  </tr>
                ) : (
                  conversions.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-primary">{c.code}</td>
                      <td className="px-5 py-3.5 font-medium">{serviceLabel(c.service)}</td>
                      <td className="px-5 py-3.5 font-bold tabular-nums">${c.booking_amount}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-500 tabular-nums">${c.commission}</td>
                      <td className="px-5 py-3.5">
                        <select
                          value={c.status}
                          onChange={(e) => void patch("conversion", c.id, e.target.value)}
                          className="px-3 py-1.5 bg-background border border-border/60 rounded-lg text-xs font-semibold text-foreground focus:outline-none"
                        >
                          <option value="pending">معلق</option>
                          <option value="approved">معتمد</option>
                          <option value="rejected">مرفوض</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card/70 shadow-xs backdrop-blur-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border/40 text-xs">
              <tr>
                <th className="px-5 py-3.5 text-start">كود المسوق</th>
                <th className="px-5 py-3.5 text-start">المبلغ المطلوب</th>
                <th className="px-5 py-3.5 text-start">طريقة السحب</th>
                <th className="px-5 py-3.5 text-start">الحالة</th>
                <th className="px-5 py-3.5 text-start">تاريخ الطلب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    لا توجد طلبات سحب أرباح معلقة
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-primary">{w.code}</td>
                    <td className="px-5 py-3.5 font-bold text-emerald-500 tabular-nums">${w.amount}</td>
                    <td className="px-5 py-3.5 font-mono text-xs">{w.method}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={w.status}
                        onChange={(e) => void patch("withdrawal", w.id, e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border/60 rounded-lg text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="pending">قيد المعالجة</option>
                        <option value="paid">تم التحويل</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground tabular-nums">{w.created}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
