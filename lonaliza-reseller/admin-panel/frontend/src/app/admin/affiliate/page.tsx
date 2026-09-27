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
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import {
  AFFILIATE_SERVICES,
  type AffiliateCommissions,
  type CommissionKind,
  DEFAULT_COMMISSIONS,
} from "@/lib/affiliate/types";

type Tab = "settings" | "marketers" | "visits" | "conversions" | "withdrawals";

const inputClass =
  "w-full px-3.5 py-2.5 bg-slate-50 dark:bg-background border border-slate-200 dark:border-border rounded-xl text-slate-900 dark:text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 text-sm font-medium transition-colors";

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
      tp_ref?: string;
      name?: string;
      email?: string;
      created: string;
    }>
  >([]);
  const [withdrawals, setWithdrawals] = useState<
    Array<{
      id: string;
      amount: number;
      binance_id: string;
      status: string;
      note?: string;
      name?: string;
      email?: string;
      created: string;
    }>
  >([]);
  const [newConv, setNewConv] = useState({
    code: "",
    service: "flight",
    booking_amount: "",
    commission: "",
    tp_ref: "",
    notes: "",
  });

  const load = useCallback(async (nextTab: Tab) => {
    setLoading(true);
    try {
      if (nextTab === "settings") {
        const res = await fetch("/api/admin/affiliate?tab=settings", { cache: "no-store" });
        const data = await res.json();
        if (data.settings) {
          setEnabled(data.settings.enabled !== false);
          setCookieDays(data.settings.cookie_days || 30);
          setMinWithdraw(data.settings.min_withdraw || 100);
          setCommissions(data.settings.commissions || DEFAULT_COMMISSIONS);
        }
      } else if (nextTab === "marketers") {
        const res = await fetch("/api/admin/affiliate?tab=marketers", { cache: "no-store" });
        const data = await res.json();
        setMarketers(data.marketers || []);
      } else if (nextTab === "visits") {
        const qs = new URLSearchParams({
          tab: "visits",
          code: visitFilter.code,
          service: visitFilter.service,
          from: visitFilter.from,
          to: visitFilter.to,
        });
        const res = await fetch(`/api/admin/affiliate?${qs}`, { cache: "no-store" });
        const data = await res.json();
        setVisits(data.visits || []);
      } else if (nextTab === "conversions") {
        const res = await fetch("/api/admin/affiliate?tab=conversions", { cache: "no-store" });
        const data = await res.json();
        setConversions(data.conversions || []);
      } else if (nextTab === "withdrawals") {
        const res = await fetch("/api/admin/affiliate?tab=withdrawals", { cache: "no-store" });
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      } else {
        const _never: never = nextTab;
        return _never;
      }
    } finally {
      setLoading(false);
    }
  }, [visitFilter]);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const saveSettings = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_settings",
          enabled,
          cookie_days: cookieDays,
          min_withdraw: minWithdraw,
          commissions,
        }),
      });
      const data = await res.json();
      setMsg(data.ok ? t.admin.saved : t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const patch = async (kind: string, id: string, status: string, extra?: Record<string, unknown>) => {
    await fetch("/api/admin/affiliate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id, status, ...extra }),
    });
    void load(tab);
  };

  const createConversion = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_conversion",
          ...newConv,
          booking_amount: Number(newConv.booking_amount || 0),
          commission: newConv.commission === "" ? undefined : Number(newConv.commission),
        }),
      });
      setNewConv({
        code: "",
        service: "flight",
        booking_amount: "",
        commission: "",
        tp_ref: "",
        notes: "",
      });
      setTab("conversions");
      void load("conversions");
    } finally {
      setSaving(false);
    }
  };

  const serviceLabel = (service: string) => {
    switch (service) {
      case "flight":
        return t.admin.typeFlight;
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

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "settings", label: t.admin.settings },
    { id: "marketers", label: t.admin.marketers },
    { id: "visits", label: t.admin.visits },
    { id: "conversions", label: t.admin.conversions },
    { id: "withdrawals", label: t.admin.withdrawals },
  ];

  return (
    <AdminPage className="space-y-6">
      <AdminPageHeader
        icon={<Share2 className="size-5" />}
        title={t.admin.affiliate}
        description={t.admin.affiliateSubtitle}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100/70 dark:bg-card/70 border border-slate-200/80 dark:border-border rounded-2xl w-fit">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              tab === item.id
                ? "bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] text-amber-300 shadow-sm shadow-purple-950/15"
                : "bg-transparent text-slate-600 dark:text-slate-300 hover:text-purple-950 dark:hover:text-foreground hover:bg-white/60 dark:hover:bg-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border">
          <Loader2 className="animate-spin text-purple-700 dark:text-purple-400 size-8" />
        </div>
      ) : tab === "settings" ? (
        <div className="space-y-6 rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-border">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-foreground">
                {t.admin.settings}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.admin.affiliateSubtitle}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2e1065]"></div>
              <span className="ms-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.admin.affiliateEnabled}
              </span>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 space-y-1.5 block">
              <span>{t.admin.cookieDays}</span>
              <input
                type="number"
                value={cookieDays}
                onChange={(e) => setCookieDays(Number(e.target.value) || 30)}
                className={inputClass}
              />
            </label>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 space-y-1.5 block">
              <span>{t.admin.minWithdraw} ($)</span>
              <input
                type="number"
                value={minWithdraw}
                onChange={(e) => setMinWithdraw(Number(e.target.value) || 100)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
              {t.admin.commission}
            </h3>
            <div className="space-y-2.5">
              {AFFILIATE_SERVICES.map((service) => (
                <div
                  key={service}
                  className="grid items-center gap-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-border p-3.5 sm:grid-cols-[160px_1fr_1fr]"
                >
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
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
                    <option value="percent">{t.admin.percent}</option>
                    <option value="fixed">{t.admin.fixed}</option>
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

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-border">
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] px-6 py-2.5 text-sm font-bold text-amber-300 hover:text-amber-200 shadow-md shadow-purple-950/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={16} />
              {saving ? t.admin.loading : t.admin.saveSettings}
            </button>
            {msg ? (
              <p className="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Check size={16} /> {msg}
              </p>
            ) : null}
          </div>
        </div>
      ) : tab === "marketers" ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xs">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-border">
              <tr>
                <th className="px-5 py-3.5 text-start">{t.admin.colCustomer}</th>
                <th className="px-5 py-3.5 text-start">{t.account.referralCode}</th>
                <th className="px-5 py-3.5 text-start">{t.admin.visits}</th>
                <th className="px-5 py-3.5 text-start">{t.admin.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border">
              {marketers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    <Users2 className="size-8 mx-auto mb-2 opacity-40 text-purple-600" />
                    {t.admin.noMarketers}
                  </td>
                </tr>
              ) : (
                marketers.map((m) => (
                  <tr key={m.id} className="text-slate-700 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-foreground">{m.name || "—"}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{m.email}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-purple-900 dark:text-purple-300">
                      {m.code}
                    </td>
                    <td className="px-5 py-3.5 font-bold">{m.visitCount}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={m.status}
                        onChange={(e) => void patch("marketer", m.id, e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-background border border-slate-200 dark:border-border rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="active">{t.common.active}</option>
                        <option value="paused">paused</option>
                        <option value="banned">banned</option>
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
          <div className="grid gap-3 sm:grid-cols-4 bg-white dark:bg-card p-4 rounded-2xl border border-slate-200 dark:border-border shadow-xs">
            <input
              value={visitFilter.code}
              onChange={(e) => setVisitFilter((p) => ({ ...p, code: e.target.value }))}
              placeholder={t.admin.filterCode}
              className={inputClass}
            />
            <select
              value={visitFilter.service}
              onChange={(e) => setVisitFilter((p) => ({ ...p, service: e.target.value }))}
              className={inputClass}
            >
              <option value="">{t.admin.allTypes}</option>
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
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xs">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-border">
                <tr>
                  <th className="px-5 py-3.5 text-start">{t.account.referralCode}</th>
                  <th className="px-5 py-3.5 text-start">path</th>
                  <th className="px-5 py-3.5 text-start">{t.admin.colService}</th>
                  <th className="px-5 py-3.5 text-start">{t.admin.colDateStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border">
                {visits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                      {t.admin.noVisits}
                    </td>
                  </tr>
                ) : (
                  visits.map((v) => (
                    <tr key={v.id} className="text-slate-700 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                      <td className="px-5 py-3.5 font-mono font-bold text-purple-900 dark:text-purple-300">
                        {v.code}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-slate-500 dark:text-slate-400">{v.path}</td>
                      <td className="px-5 py-3.5 font-medium">{serviceLabel(v.service)}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 dark:text-slate-500">{v.created}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "conversions" ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card p-6 sm:p-7 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-foreground">{t.admin.createConversion}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.admin.confirmTp}</p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-3">
              <input
                value={newConv.code}
                onChange={(e) => setNewConv((p) => ({ ...p, code: e.target.value }))}
                placeholder={t.account.referralCode}
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
                value={newConv.booking_amount}
                onChange={(e) => setNewConv((p) => ({ ...p, booking_amount: e.target.value }))}
                placeholder={t.admin.bookingAmount}
                className={inputClass}
              />
              <input
                value={newConv.commission}
                onChange={(e) => setNewConv((p) => ({ ...p, commission: e.target.value }))}
                placeholder={t.admin.commission}
                className={inputClass}
              />
              <input
                value={newConv.tp_ref}
                onChange={(e) => setNewConv((p) => ({ ...p, tp_ref: e.target.value }))}
                placeholder={t.admin.tpRef}
                className={inputClass}
              />
              <input
                value={newConv.notes}
                onChange={(e) => setNewConv((p) => ({ ...p, notes: e.target.value }))}
                placeholder={t.admin.notes}
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => void createConversion()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 shadow-sm shadow-purple-950/20 cursor-pointer"
            >
              <Plus size={16} />
              {t.admin.createConversion}
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xs">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-border">
                <tr>
                  <th className="px-5 py-3.5 text-start">{t.admin.colCustomer}</th>
                  <th className="px-5 py-3.5 text-start">{t.admin.colService}</th>
                  <th className="px-5 py-3.5 text-start">{t.admin.commission}</th>
                  <th className="px-5 py-3.5 text-start">{t.admin.colDateStatus}</th>
                  <th className="px-5 py-3.5 text-start">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border">
                {conversions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                      {t.admin.noConversions}
                    </td>
                  </tr>
                ) : (
                  conversions.map((c) => (
                    <tr key={c.id} className="text-slate-700 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-foreground">{c.name || c.code}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{c.email}</p>
                        {c.tp_ref ? (
                          <p className="text-xs font-mono text-amber-600 dark:text-amber-400">TP: {c.tp_ref}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 font-medium">{serviceLabel(c.service)}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-purple-900 dark:text-purple-300">{money(c.commission)}</span>
                        <span className="block text-xs text-slate-400 dark:text-slate-500">
                          {money(c.booking_amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                            c.status === "approved"
                              ? "bg-purple-100 text-purple-950 dark:bg-purple-950/60 dark:text-purple-200 border border-purple-200 dark:border-purple-800"
                              : c.status === "rejected"
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void patch("conversion", c.id, "approved")}
                            className="rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 p-2 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
                            title={t.admin.approve}
                          >
                            <Check size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void patch("conversion", c.id, "rejected")}
                            className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-2 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                            title={t.admin.reject}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xs">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-border">
              <tr>
                <th className="px-5 py-3.5 text-start">{t.admin.colCustomer}</th>
                <th className="px-5 py-3.5 text-start">{t.admin.binanceDetails}</th>
                <th className="px-5 py-3.5 text-start">{t.common.price}</th>
                <th className="px-5 py-3.5 text-start">{t.admin.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    {t.admin.noWithdrawals}
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="text-slate-700 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-foreground">{w.name || "—"}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{w.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-mono font-bold text-amber-700 dark:text-amber-400">{w.binance_id}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{w.status}</p>
                    </td>
                    <td className="px-5 py-3.5 font-bold font-mono text-slate-900 dark:text-foreground">{money(w.amount)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void patch("withdrawal", w.id, "paid")}
                          className="rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-3 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-200 hover:bg-purple-100 transition-colors"
                        >
                          {t.admin.markPaid}
                        </button>
                        <button
                          type="button"
                          onClick={() => void patch("withdrawal", w.id, "rejected")}
                          className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                        >
                          {t.admin.reject}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}
