"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  AFFILIATE_SERVICES,
  type AffiliateCommissions,
  type CommissionKind,
  DEFAULT_COMMISSIONS,
} from "@/lib/affiliate/types";

type Tab = "settings" | "marketers" | "visits" | "conversions" | "withdrawals";

const inputClass =
  "w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm";

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
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.admin.affiliate}</h1>
        <p className="mt-1 text-sm text-white/45">{t.admin.affiliateSubtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === item.id
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                : "bg-white/[0.04] text-white/50 border border-white/[0.06]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-amber-400" />
        </div>
      ) : tab === "settings" ? (
        <div className="space-y-5 rounded-2xl border border-white/[0.06] bg-[#0f0f17] p-6">
          <label className="flex items-center gap-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            {t.admin.affiliateEnabled}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-white/40">
              {t.admin.cookieDays}
              <input
                type="number"
                value={cookieDays}
                onChange={(e) => setCookieDays(Number(e.target.value) || 30)}
                className={inputClass + " mt-1"}
              />
            </label>
            <label className="text-xs text-white/40">
              {t.admin.minWithdraw}
              <input
                type="number"
                value={minWithdraw}
                onChange={(e) => setMinWithdraw(Number(e.target.value) || 100)}
                className={inputClass + " mt-1"}
              />
            </label>
          </div>
          <div className="space-y-3">
            {AFFILIATE_SERVICES.map((service) => (
              <div
                key={service}
                className="grid items-center gap-3 rounded-xl bg-white/[0.03] p-3 sm:grid-cols-[140px_1fr_1fr]"
              >
                <p className="text-sm font-semibold text-white/80">{serviceLabel(service)}</p>
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
          <button
            type="button"
            onClick={() => void saveSettings()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950"
          >
            <Save size={14} />
            {saving ? t.admin.loading : t.admin.saveSettings}
          </button>
          {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
        </div>
      ) : tab === "marketers" ? (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-white/40">
              <tr>
                <th className="px-4 py-3 text-start">{t.admin.colCustomer}</th>
                <th className="px-4 py-3 text-start">{t.account.referralCode}</th>
                <th className="px-4 py-3 text-start">{t.admin.visits}</th>
                <th className="px-4 py-3 text-start">{t.admin.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {marketers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                    {t.admin.noMarketers}
                  </td>
                </tr>
              ) : (
                marketers.map((m) => (
                  <tr key={m.id} className="border-t border-white/[0.04] text-white/80">
                    <td className="px-4 py-3">
                      <p>{m.name || "—"}</p>
                      <p className="text-xs text-white/40">{m.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono">{m.code}</td>
                    <td className="px-4 py-3">{m.visitCount}</td>
                    <td className="px-4 py-3">
                      <select
                        value={m.status}
                        onChange={(e) => void patch("marketer", m.id, e.target.value)}
                        className={inputClass}
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
          <div className="grid gap-3 sm:grid-cols-4">
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
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-white/40">
                <tr>
                  <th className="px-4 py-3 text-start">{t.account.referralCode}</th>
                  <th className="px-4 py-3 text-start">path</th>
                  <th className="px-4 py-3 text-start">{t.admin.colService}</th>
                  <th className="px-4 py-3 text-start">{t.admin.colDateStatus}</th>
                </tr>
              </thead>
              <tbody>
                {visits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                      {t.admin.noVisits}
                    </td>
                  </tr>
                ) : (
                  visits.map((v) => (
                    <tr key={v.id} className="border-t border-white/[0.04] text-white/75">
                      <td className="px-4 py-3 font-mono">{v.code}</td>
                      <td className="px-4 py-3">{v.path}</td>
                      <td className="px-4 py-3">{serviceLabel(v.service)}</td>
                      <td className="px-4 py-3 text-xs">{v.created}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "conversions" ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f17] p-5">
            <h3 className="mb-3 font-semibold text-white">{t.admin.createConversion}</h3>
            <p className="mb-4 text-xs text-white/40">{t.admin.confirmTp}</p>
            <div className="grid gap-3 sm:grid-cols-3">
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
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
            >
              {t.admin.createConversion}
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-white/40">
                <tr>
                  <th className="px-4 py-3 text-start">{t.admin.colCustomer}</th>
                  <th className="px-4 py-3 text-start">{t.admin.colService}</th>
                  <th className="px-4 py-3 text-start">{t.admin.commission}</th>
                  <th className="px-4 py-3 text-start">{t.admin.colDateStatus}</th>
                  <th className="px-4 py-3 text-start">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {conversions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                      {t.admin.noConversions}
                    </td>
                  </tr>
                ) : (
                  conversions.map((c) => (
                    <tr key={c.id} className="border-t border-white/[0.04] text-white/80">
                      <td className="px-4 py-3">
                        <p>{c.name || c.code}</p>
                        <p className="text-xs text-white/40">{c.email}</p>
                        {c.tp_ref ? (
                          <p className="text-xs text-amber-400/80">TP: {c.tp_ref}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{serviceLabel(c.service)}</td>
                      <td className="px-4 py-3">
                        {money(c.commission)}
                        <span className="block text-xs text-white/35">
                          {money(c.booking_amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            c.status === "approved"
                              ? "text-emerald-400"
                              : c.status === "rejected"
                                ? "text-red-400"
                                : "text-amber-400"
                          }
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void patch("conversion", c.id, "approved")}
                            className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400"
                            title={t.admin.approve}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void patch("conversion", c.id, "rejected")}
                            className="rounded-lg bg-red-500/15 p-2 text-red-400"
                            title={t.admin.reject}
                          >
                            <X size={14} />
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
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-white/40">
              <tr>
                <th className="px-4 py-3 text-start">{t.admin.colCustomer}</th>
                <th className="px-4 py-3 text-start">{t.admin.binanceDetails}</th>
                <th className="px-4 py-3 text-start">{t.common.price}</th>
                <th className="px-4 py-3 text-start">{t.admin.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                    {t.admin.noWithdrawals}
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="border-t border-white/[0.04] text-white/80">
                    <td className="px-4 py-3">
                      <p>{w.name || "—"}</p>
                      <p className="text-xs text-white/40">{w.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-amber-300">{w.binance_id}</p>
                      <p className="text-xs text-white/40">{w.status}</p>
                    </td>
                    <td className="px-4 py-3">{money(w.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void patch("withdrawal", w.id, "paid")}
                          className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-400"
                        >
                          {t.admin.markPaid}
                        </button>
                        <button
                          type="button"
                          onClick={() => void patch("withdrawal", w.id, "rejected")}
                          className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-400"
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
    </div>
  );
}
