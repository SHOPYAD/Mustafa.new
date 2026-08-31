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

const inputClass =
  "w-full px-3 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm";
const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] p-5";

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
    minConvertPoints: 100,
  });

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
    } finally {
      setLoading(false);
    }
  }, []);

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
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{l.adminTitle}</h1>
        <p className="mt-1 text-sm text-white/55">{l.adminSubtitle}</p>
      </div>

      <div className="flex gap-2">
        {(["coupons", "points"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              tab === key ? "bg-amber-500 text-slate-950" : "bg-white/5 text-white/70"
            }`}
          >
            {key === "coupons" ? l.tabCoupons : l.tabPoints}
          </button>
        ))}
      </div>

      {msg ? <p className="text-sm text-amber-300">{msg}</p> : null}

      {tab === "points" ? (
        <div className={cardClass}>
          <label className="mb-4 flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            />
            {l.pointsEnabled}
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs text-white/60">
              {l.pointsPerUsd}
              <input
                type="number"
                min={0}
                step="0.1"
                value={settings.pointsPerUsd}
                onChange={(e) => setSettings({ ...settings, pointsPerUsd: Number(e.target.value) })}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-xs text-white/60">
              {l.pointsRedeem}
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
            <label className="text-xs text-white/60">
              {l.minConvert}
              <input
                type="number"
                min={0}
                value={settings.minConvertPoints}
                onChange={(e) =>
                  setSettings({ ...settings, minConvertPoints: Number(e.target.value) })
                }
                className={`mt-1 ${inputClass}`}
              />
            </label>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-white/40">{l.perService}</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LOYALTY_SERVICES.filter((s) => s !== "all").map((service) => (
              <label key={service} className="text-xs text-white/60">
                {serviceLabel(service)}
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder={String(settings.pointsPerUsd)}
                  value={settings.pointsPerUsdByService[service] ?? ""}
                  onChange={(e) => {
                    const next = { ...settings.pointsPerUsdByService };
                    if (e.target.value === "") delete next[service];
                    else next[service] = Number(e.target.value);
                    setSettings({ ...settings, pointsPerUsdByService: next });
                  }}
                  className={`mt-1 ${inputClass}`}
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void saveSettings()}
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950"
          >
            <Save size={16} />
            {t.common.save}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div key={coupon.id} className={cardClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white" dir="ltr">
                      {coupon.code}
                    </p>
                    <p className="text-sm text-white/60">{coupon.title.ar || coupon.title.en}</p>
                    <p className="mt-1 text-xs text-white/40">
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
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white"
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
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <Plus size={16} />
              {form.id ? t.common.edit : t.common.add}
            </h2>
            <div className="space-y-3">
              <label className="block text-xs text-white/60">
                {l.code}
                <input
                  value={form.code || ""}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className={`mt-1 ${inputClass}`}
                  dir="ltr"
                  placeholder="FIRST20"
                />
              </label>
              <label className="block text-xs text-white/60">
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
                <label className="text-xs text-white/60">
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
                <label className="text-xs text-white/60">
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
                <label className="block text-xs text-white/60">
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
                <label className="text-xs text-white/60">
                  {l.validFrom}
                  <input
                    type="date"
                    value={form.validFrom || ""}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-xs text-white/60">
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
                <label className="text-xs text-white/60">
                  {l.maxUses}
                  <input
                    type="number"
                    min={0}
                    value={form.maxUsesTotal ?? 0}
                    onChange={(e) => setForm({ ...form, maxUsesTotal: Number(e.target.value) })}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-xs text-white/60">
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
                <label className="text-xs text-white/60">
                  {l.minAmount}
                  <input
                    type="number"
                    min={0}
                    value={form.minBookingAmount ?? 0}
                    onChange={(e) => setForm({ ...form, minBookingAmount: Number(e.target.value) })}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-xs text-white/60">
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
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={Boolean(form.firstBookingOnly)}
                  onChange={(e) => setForm({ ...form, firstBookingOnly: e.target.checked })}
                />
                {l.firstOnly}
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={Boolean(form.newUserOnly)}
                  onChange={(e) => setForm({ ...form, newUserOnly: e.target.checked })}
                />
                {l.newUserOnly}
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={form.active !== false}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                {t.common.active}
              </label>
              {(["ar", "en", "tr"] as const).map((lang) => (
                <div key={lang} className="space-y-2">
                  <label className="block text-xs text-white/60">
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
                  <label className="block text-xs text-white/60">
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
    </div>
  );
}
