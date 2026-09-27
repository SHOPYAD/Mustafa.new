"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  emptyLocalized,
  LOYALTY_SERVICES,
  type LoyaltyCoupon,
  type LoyaltyService,
  type LoyaltySettings,
} from "@/lib/loyalty/types";
import { AdminPage } from "@/components/admin/layout";
import { EnterprisePageHeader } from "@/components/admin/enterprise";
import { Tag } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 bg-background/50 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-sm transition-all";
const cardClass = "rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/20";

type Tab = "coupons" | "points";

function emptyForm(): Partial<LoyaltyCoupon> {
  const today = new Date().toISOString().slice(0, 10);
  return {
    code: "",
    service: "all",
    discountType: "percent",
    discountValue: 10,
    currency: "USD",
    validFrom: today,
    validTo: "2027-12-31",
    maxUsesTotal: 0,
    maxUsesPerUser: 1,
    minBookingAmount: 0,
    minBookingCurrency: "USD",
    newUserOnly: false,
    firstBookingOnly: false,
    active: true,
    title: emptyLocalized(),
    description: emptyLocalized(),
  };
}

export default function AdminCouponsPage() {
  const { t } = useLocale();
  const l = t.loyalty;
  const [tab, setTab] = useState<Tab>("coupons");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [coupons, setCoupons] = useState<LoyaltyCoupon[]>([]);
  const [currencies, setCurrencies] = useState<string[]>(["USD", "EUR", "TRY", "AED"]);
  const [form, setForm] = useState<Partial<LoyaltyCoupon>>(emptyForm);
  const [settings, setSettings] = useState<LoyaltySettings>({
    enabled: true,
    pointsPerUsd: 10,
    pointsPerUsdByService: {},
    pointsPerUsdRedeem: 100,
    minConvertPoints: 500,
    requireAdminApproval: true,
    minBookingAmountUsd: 500,
    maxDiscountPercent: 15,
    maxVoucherDiscountUsd: 150,
    autoApproveVerifiedBookings: true,
  });
  const [pendingData, setPendingData] = useState<{
    pendingCount: number;
    pendingTotalPoints: number;
    pendingTotalUsd: number;
    items: Array<{
      id: string;
      userId: string;
      points: number;
      usdValue: number;
      note?: string;
      createdAt: string;
    }>;
  }>({ pendingCount: 0, pendingTotalPoints: 0, pendingTotalUsd: 0, items: [] });

  const loadPendingPoints = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/loyalty?tab=pending", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setPendingData({
          pendingCount: json.pendingCount || 0,
          pendingTotalPoints: json.pendingTotalPoints || 0,
          pendingTotalUsd: json.pendingTotalUsd || 0,
          items: json.items || [],
        });
      }
    } catch {}
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch("/api/admin/loyalty?tab=coupons", { cache: "no-store" }),
        fetch("/api/admin/loyalty?tab=settings", { cache: "no-store" }),
      ]);
      const cJson = (await cRes.json()) as {
        coupons?: LoyaltyCoupon[];
        currencyCodes?: string[];
      };
      const sJson = (await sRes.json()) as { settings?: LoyaltySettings; currencyCodes?: string[] };
      setCoupons(cJson.coupons || []);
      if (sJson.settings) setSettings(sJson.settings);
      const codes = cJson.currencyCodes || sJson.currencyCodes || [];
      if (codes.length) setCurrencies(codes);
      void loadPendingPoints();
    } finally {
      setLoading(false);
    }
  }, [loadPendingPoints]);

  const handleApprovePoint = async (id: string) => {
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", id }),
      });
      const json = await res.json();
      if (json.ok) {
        void loadPendingPoints();
        setMsg("تم اعتماد النقاط ونقلها بنجاح للرصيد المؤكد");
      }
    } catch {}
  };

  const handleRejectPoint = async (id: string) => {
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", id, reason: "مرفوض بقرار الإدارة" }),
      });
      const json = await res.json();
      if (json.ok) {
        void loadPendingPoints();
        setMsg("تم رفض النقاط وتجميدها");
      }
    } catch {}
  };

  const handleApproveAll = async () => {
    if (!confirm("هل أنت متأكد من اعتماد كافة طلبات النقاط المعلقة دفعة واحدة؟")) return;
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all" }),
      });
      const json = await res.json();
      if (json.ok) {
        void loadPendingPoints();
        setMsg(`تم اعتماد ${json.approvedCount} طلب معلق بنجاح`);
      }
    } catch {}
  };

  useEffect(() => {
    void load();
  }, [load]);

  const saveCoupon = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", ...form }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMsg(json.error || t.admin.saveFailed);
        return;
      }
      setMsg(t.admin.saved);
      setForm(emptyForm());
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setSaving(true);
    try {
      await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "settings", ...settings }),
      });
      const json = (await res.json()) as { ok?: boolean };
      setMsg(json.ok ? t.admin.saved : t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const serviceLabel = (service: LoyaltyService) => {
    switch (service) {
      case "flights":
        return l.svcFlights;
      case "hotels":
        return l.svcHotels;
      case "transfers":
        return l.svcTransfers;
      case "cars":
        return l.svcCars;
      case "packages":
        return l.svcPackages;
      case "all":
        return l.svcAll;
      default: {
        const _never: never = service;
        return _never;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <AdminPage className="space-y-6 w-full min-w-0">
      <EnterprisePageHeader
        icon={Tag}
        title={l.adminTitle}
        description={l.adminSubtitle}
        badge="Marketing & Loyalty"
        actions={
          <div className="inline-flex items-center gap-1.5 p-1 bg-secondary/80 border border-border/60 rounded-xl">
            {(["coupons", "points"] as Tab[]).map((key) => (
              <button
                key={key}
                type="button"
                data-active={tab === key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === key
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {key === "coupons" ? l.tabCoupons : l.tabPoints}
              </button>
            ))}
          </div>
        }
      />

      {msg ? <p className="text-sm text-amber-300">{msg}</p> : null}

      {tab === "points" ? (
        <div className="space-y-6">
          {/* 1. FINANCIAL SAFEGUARDS & PROFIT PROTECTION */}
          <div className={`${cardClass} border border-amber-500/30 bg-amber-500/[0.04]`}>
            <div className="flex items-center justify-between border-b border-admin-border-subtle pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="text-amber-400">🛡️</span>
                  <span>قواعد الحماية المالية وضمان عدم خسارة المنصة (Anti-Loss Safeguards)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  ضوابط صارمة تمنع الحجوزات المجانية تماماً، وتشترط حجزاً حقيقياً مدفوعاً، وتلزم بموافقة الإدارة قبل صرف النقاط.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                حماية وهوامش ربح
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs text-muted-foreground">
                الحد الأدنى لقيمة الحجز للخصم ($ USD)
                <input
                  type="number"
                  min={100}
                  value={settings.minBookingAmountUsd ?? 500}
                  onChange={(e) =>
                    setSettings({ ...settings, minBookingAmountUsd: Number(e.target.value) || 0 })
                  }
                  className={`mt-1 ${inputClass}`}
                />
                <span className="text-[10px] text-admin-text-muted mt-0.5 block">
                  لا يقبل النظام القسائم إذا كان الحجز أقل من هذا المبلغ
                </span>
              </label>

              <label className="text-xs text-muted-foreground">
                الحد الأقصى للتخفيض من الحجز (%)
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.maxDiscountPercent ?? 15}
                  onChange={(e) =>
                    setSettings({ ...settings, maxDiscountPercent: Number(e.target.value) || 15 })
                  }
                  className={`mt-1 ${inputClass}`}
                />
                <span className="text-[10px] text-admin-text-muted mt-0.5 block">
                  يضمن أن العميل يسدد 85%+ من قيمة الحجز نقداً بالبطاقة
                </span>
              </label>

              <label className="text-xs text-muted-foreground">
                الحد الأدنى للنقاط للتحويل إلى قسيمة
                <input
                  type="number"
                  min={100}
                  value={settings.minConvertPoints ?? 500}
                  onChange={(e) =>
                    setSettings({ ...settings, minConvertPoints: Number(e.target.value) || 0 })
                  }
                  className={`mt-1 ${inputClass}`}
                />
                <span className="text-[10px] text-admin-text-muted mt-0.5 block">
                  أقل رصيد نقاط يجمعه العضو للبدء بإصدار قسائم
                </span>
              </label>

              <label className="text-xs text-muted-foreground">
                سقف الخصم الأقصى للحجز الواحد ($)
                <input
                  type="number"
                  min={10}
                  value={settings.maxVoucherDiscountUsd ?? 150}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxVoucherDiscountUsd: Number(e.target.value) || 0,
                    })
                  }
                  className={`mt-1 ${inputClass}`}
                />
                <span className="text-[10px] text-admin-text-muted mt-0.5 block">
                  أقصى خصم إجمالي بالدولار مهما بلغت قيمة الحجز
                </span>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-admin-border-subtle mt-4">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.requireAdminApproval)}
                  onChange={(e) =>
                    setSettings({ ...settings, requireAdminApproval: e.target.checked })
                  }
                  className="rounded border-white/20 text-amber-500 focus:ring-amber-500"
                />
                <span>
                  <strong className="text-foreground block">إلزامية موافقة الإدارة على نقاط السوشيال ميديا</strong>
                  <span className="text-[11px] text-muted-foreground block">
                    تبقى النقاط معلّقة ولا تصرف إلا بعد اعتماد الإدارة لها يدوياً من السجل أدناه
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.autoApproveVerifiedBookings)}
                  onChange={(e) =>
                    setSettings({ ...settings, autoApproveVerifiedBookings: e.target.checked })
                  }
                  className="rounded border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  <strong className="text-foreground block">اعتماد تلقائي لنقاط أصحاب الحجوزات المؤكدة VIP</strong>
                  <span className="text-[11px] text-muted-foreground block">
                    استثناء العملاء الذين دفعوا وحجزوا بالفعل لتشجيع توثيق رحلاتهم فوراً
                  </span>
                </span>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-admin-border-subtle mt-4">
              <label className="text-xs text-muted-foreground">
                {l.pointsPerUsd}
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={settings.pointsPerUsd}
                  onChange={(e) =>
                    setSettings({ ...settings, pointsPerUsd: Number(e.target.value) })
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                معدل التحويل (كم نقطة = 1$ خصم)
                <input
                  type="number"
                  min={1}
                  value={settings.pointsPerUsdRedeem}
                  onChange={(e) =>
                    setSettings({ ...settings, pointsPerUsdRedeem: Number(e.target.value) })
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => void saveSettings()}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md"
                >
                  <Save size={16} />
                  <span>حفظ إعدادات الحماية المالية</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. PENDING POINTS AUDIT & APPROVAL QUEUE */}
          <div className={cardClass}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-admin-border-subtle pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>⚖️</span>
                  <span>سجل مراجعة واعتماد نقاط السوشيال ميديا المعلقة (Pending Approvals)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  طلبات النقاط التي جمعها الأعضاء وتنتظر مراجعة الإدارة لمنع التكرار وضمان صحة التفاعل.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-admin-bg-subtle border border-admin-border-subtle px-3 py-1.5 rounded-xl text-xs text-foreground">
                  <span>المعلق:</span>
                  <strong className="text-amber-400 font-bold font-mono">
                    {pendingData.pendingCount} طلب
                  </strong>
                  <span>({pendingData.pendingTotalPoints.toLocaleString()} نقطة ≈ ${pendingData.pendingTotalUsd})</span>
                </div>

                {pendingData.pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleApproveAll()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white text-xs font-bold hover:brightness-110 transition-all shadow-sm"
                  >
                    <span>⚡ اعتماد الكل دفعة واحدة</span>
                  </button>
                )}
              </div>
            </div>

            {pendingData.items.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                <p className="text-sm font-bold text-amber-300">✅ لا توجد طلبات نقاط معلقة حالياً</p>
                <p>كافة نقاط السوشيال ميديا معتمدة أو تم البت فيها. المنصة محمية ومستقرة تماماً.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs text-foreground">
                  <thead>
                    <tr className="border-b border-admin-border-subtle text-admin-text-muted">
                      <th className="pb-2 font-semibold">المستخدم</th>
                      <th className="pb-2 font-semibold">التفاعل / الملاحظة</th>
                      <th className="pb-2 font-semibold">النقاط</th>
                      <th className="pb-2 font-semibold">القيمة التقديرية</th>
                      <th className="pb-2 font-semibold">التاريخ</th>
                      <th className="pb-2 text-center font-semibold">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border-subtle">
                    {pendingData.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-mono text-[11px] text-foreground">
                          {item.userId}
                        </td>
                        <td className="py-3 max-w-[240px] truncate text-muted-foreground">
                          {item.note || "تفاعل في مجتمع السفر"}
                        </td>
                        <td className="py-3 font-bold text-amber-400 font-mono">
                          +{item.points.toLocaleString()}
                        </td>
                        <td className="py-3 font-bold text-amber-300 font-mono">
                          ${item.usdValue.toFixed(2)}
                        </td>
                        <td className="py-3 text-muted-foreground text-[11px]">
                          {new Date(item.createdAt).toLocaleString("ar-EG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => void handleApprovePoint(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-[11px] font-bold transition-all"
                            >
                              ✅ اعتماد
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRejectPoint(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 text-[11px] font-bold transition-all"
                            >
                              ❌ تجميد
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div key={coupon.id} className={cardClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground" dir="ltr">
                      {coupon.code}
                    </p>
                    <p className="text-sm text-muted-foreground">{coupon.title.ar || coupon.title.en}</p>
                    <p className="mt-1 text-xs text-admin-text-muted">
                      {serviceLabel(coupon.service)} ·{" "}
                      {coupon.discountType === "percent"
                        ? `${coupon.discountValue}%`
                        : `${coupon.currency} ${coupon.discountValue}`}{" "}
                      · {coupon.validFrom} → {coupon.validTo}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm(coupon)}
                      className="rounded-lg bg-admin-bg-subtle px-3 py-1.5 text-xs font-bold text-foreground"
                    >
                      {t.common.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(coupon.id)}
                      className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={cardClass}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <Plus size={16} />
              {form.id ? t.common.edit : t.common.add}
            </h2>
            <div className="space-y-3">
              <label className="block text-xs text-muted-foreground">
                {l.code}
                <input
                  value={form.code || ""}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className={`mt-1 ${inputClass}`}
                  dir="ltr"
                  placeholder="FIRST20"
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                {l.service}
                <select
                  value={form.service || "all"}
                  onChange={(e) => setForm({ ...form, service: e.target.value as LoyaltyService })}
                  className={`mt-1 ${inputClass}`}
                >
                  {LOYALTY_SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {serviceLabel(s)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-muted-foreground">
                  {l.discountType}
                  <select
                    value={form.discountType || "percent"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountType: e.target.value === "fixed" ? "fixed" : "percent",
                      })
                    }
                    className={`mt-1 ${inputClass}`}
                  >
                    <option value="percent">{l.percent}</option>
                    <option value="fixed">{l.fixed}</option>
                  </select>
                </label>
                <label className="text-xs text-muted-foreground">
                  {l.discountValue}
                  <input
                    type="number"
                    min={0}
                    value={form.discountValue ?? 0}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
              </div>
              {form.discountType === "fixed" ? (
                <label className="block text-xs text-muted-foreground">
                  {t.common.currency}
                  <select
                    value={form.currency || "USD"}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className={`mt-1 ${inputClass}`}
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-muted-foreground">
                  {l.validFrom}
                  <input
                    type="date"
                    value={form.validFrom || ""}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  {l.validTo}
                  <input
                    type="date"
                    value={form.validTo || ""}
                    onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-muted-foreground">
                  {l.maxUses}
                  <input
                    type="number"
                    min={0}
                    value={form.maxUsesTotal ?? 0}
                    onChange={(e) => setForm({ ...form, maxUsesTotal: Number(e.target.value) })}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  {l.maxPerUser}
                  <input
                    type="number"
                    min={0}
                    value={form.maxUsesPerUser ?? 1}
                    onChange={(e) => setForm({ ...form, maxUsesPerUser: Number(e.target.value) })}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-muted-foreground">
                  {l.minAmount}
                  <input
                    type="number"
                    min={0}
                    value={form.minBookingAmount ?? 0}
                    onChange={(e) => setForm({ ...form, minBookingAmount: Number(e.target.value) })}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  {t.common.currency}
                  <select
                    value={form.minBookingCurrency || "USD"}
                    onChange={(e) => setForm({ ...form, minBookingCurrency: e.target.value })}
                    className={`mt-1 ${inputClass}`}
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(form.firstBookingOnly)}
                  onChange={(e) => setForm({ ...form, firstBookingOnly: e.target.checked })}
                />
                {l.firstOnly}
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(form.newUserOnly)}
                  onChange={(e) => setForm({ ...form, newUserOnly: e.target.checked })}
                />
                {l.newUserOnly}
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.active !== false}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                {t.common.active}
              </label>
              {(["ar", "en", "tr"] as const).map((lang) => (
                <div key={lang} className="space-y-2">
                  <label className="block text-xs text-muted-foreground">
                    {l.title} ({lang})
                    <input
                      value={form.title?.[lang] || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          title: { ...(form.title || emptyLocalized()), [lang]: e.target.value },
                        })
                      }
                      className={`mt-1 ${inputClass}`}
                    />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    {l.description} ({lang})
                    <input
                      value={form.description?.[lang] || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: {
                            ...(form.description || emptyLocalized()),
                            [lang]: e.target.value,
                          },
                        })
                      }
                      className={`mt-1 ${inputClass}`}
                    />
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={() => void saveCoupon()}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950"
              >
                <Save size={16} />
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
