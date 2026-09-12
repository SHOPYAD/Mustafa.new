"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Megaphone, Pause, Play, Save, Send } from "lucide-react";

const inputClass =
  "w-full px-3 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 text-sm";
const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] p-5";

type Geo = { iso2: string; nameAr: string; googleCriterionId: string };
type Campaign = {
  id: string;
  platform: "google" | "meta";
  name: string;
  dailyBudget: number;
  status: string;
  dryRun: boolean;
  createdAt: string;
};
type Report = {
  date: string;
  mode: string;
  telegramSent: boolean;
  telegramError?: string;
  metrics: Array<{
    platform: string;
    spend: number;
    clicks: number;
    ctr: number;
    conversions: number;
    currency: string;
  }>;
  alerts: Array<{ platform: string; level: number }>;
};

type AdsState = {
  connection: {
    googleLive: boolean;
    metaLive: boolean;
    googleOAuth: boolean;
    metaOAuth: boolean;
  };
  credentials: Record<string, string>;
  settings: { defaultGeoCodes: string[]; telegramChatId: string; currency: string };
  geos: Geo[];
  campaigns: Campaign[];
  lastReport: Report | null;
};

const emptyCreds: Record<string, string> = {
  googleDeveloperToken: "",
  googleClientId: "",
  googleClientSecret: "",
  googleRefreshToken: "",
  googleCustomerId: "",
  googleLoginCustomerId: "",
  metaAccessToken: "",
  metaAdAccountId: "",
  metaPageId: "",
  metaAppId: "",
  metaAppSecret: "",
  metaPixelId: "",
};

export default function AdminAdsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState<AdsState | null>(null);
  const [creds, setCreds] = useState(emptyCreds);
  const [geos, setGeos] = useState<string[]>([]);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [approved, setApproved] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [form, setForm] = useState({
    name: "",
    landingUrl: "https://lonaliza.com",
    dailyBudget: "25",
    lifetimeBudget: "",
    platforms: "both",
    googleChannel: "search",
    metaCreative: "link",
    postId: "",
    permalink: "",
    imageUrl: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads", { cache: "no-store" });
      const json = (await res.json()) as AdsState & { ok?: boolean };
      if (!res.ok) throw new Error("unauthorized");
      setData(json);
      setCreds({ ...emptyCreds, ...json.credentials });
      setGeos(json.settings?.defaultGeoCodes || []);
      setTelegramChatId(json.settings?.telegramChatId || "");
      setCurrency(json.settings?.currency || "USD");
    } catch {
      setMsg("تعذّر تحميل إعدادات الإعلانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentials: creds,
          settings: { defaultGeoCodes: geos, telegramChatId, currency },
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      setMsg(json.ok ? "تم الحفظ" : json.error || "فشل الحفظ");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const launch = async () => {
    setLaunching(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/ads/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved,
          dryRun,
          name: form.name || undefined,
          landingUrl: form.landingUrl,
          dailyBudget: Number(form.dailyBudget),
          lifetimeBudget: form.lifetimeBudget ? Number(form.lifetimeBudget) : undefined,
          platforms: form.platforms,
          googleChannel: form.googleChannel,
          metaCreative: form.metaCreative,
          postId: form.postId || undefined,
          permalink: form.permalink || undefined,
          imageUrl: form.imageUrl || undefined,
          geoCodes: geos,
          currency,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        dryRun?: boolean;
        reason?: string;
        errors?: Array<{ message: string }>;
      };
      if (!json.ok) {
        setMsg(json.errors?.map((e) => e.message).join(" — ") || json.reason || "فشل الإطلاق");
      } else {
        setMsg(
          json.dryRun
            ? `تم التحقق (dryRun) — ${json.reason || "بدون mutate حي"}`
            : "تم إطلاق الحملة على الحساب الإعلاني"
        );
        await load();
      }
    } finally {
      setLaunching(false);
    }
  };

  const sendReport = async () => {
    setReporting(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/ads/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const json = (await res.json()) as { ok?: boolean; report?: Report };
      setMsg(
        json.report?.telegramSent
          ? "أُرسل تقرير تيليجرام"
          : json.report?.telegramError || "تم إنشاء التقرير"
      );
      await load();
    } finally {
      setReporting(false);
    }
  };

  const toggleCampaign = async (id: string, action: "pause" | "resume") => {
    await fetch("/api/admin/ads/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    await load();
  };

  const allGeos = data?.geos || [];
  const last = data?.lastReport;
  const liveHint = useMemo(() => {
    if (!data) return "";
    if (data.connection.googleLive && data.connection.metaLive) return "جوجل وميتا جاهزان للإطلاق الحي";
    if (data.connection.googleLive) return "جوجل حي — ميتا في dryRun";
    if (data.connection.metaLive) return "ميتا حي — جوجل في dryRun";
    return "لا توجد بيانات دخول كافية — الإطلاق يتحقق من الحمولة فقط (dryRun)";
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/60">
        <Loader2 className="animate-spin me-2" size={18} />
        جاري التحميل…
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="text-amber-400" size={22} />
            إعلانات جوجل وميتا
          </h1>
          <p className="text-sm text-white/50 mt-1">
            الفوترة على حساب المعلن. لا بطاقات ائتمان هنا. الحماية الرسمية فقط ضد الزيارات غير الصالحة.
          </p>
          <p className="text-xs text-amber-300/80 mt-2">{liveHint}</p>
        </div>
        <button
          type="button"
          onClick={() => void sendReport()}
          disabled={reporting}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-slate-950 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {reporting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          تقرير تيليجرام
        </button>
      </div>

      {msg ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {msg}
        </div>
      ) : null}

      <section className={cardClass}>
        <h2 className="text-white font-semibold mb-4">الاتصال</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm text-white/70">
              Google Ads {data?.connection.googleLive ? "● متصل" : "○ غير متصل"}
            </p>
            {(
              [
                ["googleDeveloperToken", "Developer token"],
                ["googleClientId", "Client ID"],
                ["googleClientSecret", "Client secret"],
                ["googleRefreshToken", "Refresh token"],
                ["googleCustomerId", "Customer ID"],
                ["googleLoginCustomerId", "Login customer (MCC)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-xs text-white/50">
                {label}
                <input
                  className={`${inputClass} mt-1`}
                  value={creds[key] || ""}
                  onChange={(e) => setCreds({ ...creds, [key]: e.target.value })}
                  autoComplete="off"
                />
              </label>
            ))}
            <a
              href="/api/admin/ads/google/oauth"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
            >
              ربط جوجل (OAuth)
            </a>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-white/70">
              Meta Ads {data?.connection.metaLive ? "● متصل" : "○ غير متصل"}
            </p>
            {(
              [
                ["metaAppId", "App ID"],
                ["metaAppSecret", "App secret"],
                ["metaAccessToken", "Access token"],
                ["metaAdAccountId", "Ad account ID"],
                ["metaPageId", "Page ID"],
                ["metaPixelId", "Pixel ID (اختياري)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-xs text-white/50">
                {label}
                <input
                  className={`${inputClass} mt-1`}
                  value={creds[key] || ""}
                  onChange={(e) => setCreds({ ...creds, [key]: e.target.value })}
                  autoComplete="off"
                />
              </label>
            ))}
            <a
              href="/api/admin/ads/meta/oauth"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
            >
              ربط ميتا (OAuth)
            </a>
          </div>
        </div>
        <label className="block text-xs text-white/50 mt-4">
          شات تيليجرام للتقارير (اختياري — وإلا TELEGRAM_DEFAULT_CHAT_ID)
          <input
            className={`${inputClass} mt-1`}
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
          />
        </label>
        <div className="mt-4">
          <p className="text-xs text-white/50 mb-2">الدول الافتراضية (الخليج + المغرب/الجزائر/تونس/العراق)</p>
          <div className="flex flex-wrap gap-2">
            {allGeos.map((g) => {
              const on = geos.includes(g.iso2);
              return (
                <button
                  key={g.iso2}
                  type="button"
                  onClick={() =>
                    setGeos(on ? geos.filter((c) => c !== g.iso2) : [...geos, g.iso2])
                  }
                  className={`rounded-full px-3 py-1 text-xs border ${
                    on
                      ? "bg-amber-500/20 border-amber-400/40 text-amber-100"
                      : "border-white/10 text-white/50"
                  }`}
                >
                  {g.nameAr}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          حفظ الاتصال والدول
        </button>
      </section>

      <section className={cardClass}>
        <h2 className="text-white font-semibold mb-4">إطلاق حملة</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-xs text-white/50">
            الاسم
            <input
              className={`${inputClass} mt-1`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="text-xs text-white/50">
            رابط الهبوط
            <input
              className={`${inputClass} mt-1`}
              value={form.landingUrl}
              onChange={(e) => setForm({ ...form, landingUrl: e.target.value })}
            />
          </label>
          <label className="text-xs text-white/50">
            الميزانية اليومية
            <input
              className={`${inputClass} mt-1`}
              value={form.dailyBudget}
              onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })}
            />
          </label>
          <label className="text-xs text-white/50">
            سقف العمر (اختياري)
            <input
              className={`${inputClass} mt-1`}
              value={form.lifetimeBudget}
              onChange={(e) => setForm({ ...form, lifetimeBudget: e.target.value })}
            />
          </label>
          <label className="text-xs text-white/50">
            المنصة
            <select
              className={`${inputClass} mt-1`}
              value={form.platforms}
              onChange={(e) => setForm({ ...form, platforms: e.target.value })}
            >
              <option value="both">جوجل + ميتا</option>
              <option value="google">جوجل فقط</option>
              <option value="meta">ميتا فقط</option>
            </select>
          </label>
          <label className="text-xs text-white/50">
            قناة جوجل
            <select
              className={`${inputClass} mt-1`}
              value={form.googleChannel}
              onChange={(e) => setForm({ ...form, googleChannel: e.target.value })}
            >
              <option value="search">بحث Search</option>
              <option value="pmax">Performance Max</option>
              <option value="demand_gen">Demand Gen</option>
            </select>
          </label>
          <label className="text-xs text-white/50">
            إبداع ميتا
            <select
              className={`${inputClass} mt-1`}
              value={form.metaCreative}
              onChange={(e) => setForm({ ...form, metaCreative: e.target.value })}
            >
              <option value="link">رابط + صورة</option>
              <option value="boost">تعزيز منشور قائم</option>
            </select>
          </label>
          <label className="text-xs text-white/50">
            صورة (رابط)
            <input
              className={`${inputClass} mt-1`}
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </label>
          <label className="text-xs text-white/50">
            معرف منشور ميتا (boost)
            <input
              className={`${inputClass} mt-1`}
              value={form.postId}
              onChange={(e) => setForm({ ...form, postId: e.target.value })}
            />
          </label>
          <label className="text-xs text-white/50">
            رابط المنشور
            <input
              className={`${inputClass} mt-1`}
              value={form.permalink}
              onChange={(e) => setForm({ ...form, permalink: e.target.value })}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
            أوافق على الإطلاق والميزانية (إلزامي)
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            dryRun — تحقق فقط دون mutate حي
          </label>
        </div>
        <button
          type="button"
          onClick={() => void launch()}
          disabled={launching}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {launching ? <Loader2 className="animate-spin" size={16} /> : <Megaphone size={16} />}
          إطلاق
        </button>
      </section>

      <section className={cardClass}>
        <h2 className="text-white font-semibold mb-3">آخر تقرير</h2>
        {last ? (
          <div className="space-y-2 text-sm text-white/80">
            <p>
              {last.date} — {last.mode === "dryRun" ? "dryRun" : "حي"}
              {last.telegramSent ? " — أُرسل لتيليجرام" : last.telegramError ? ` — ${last.telegramError}` : ""}
            </p>
            {last.metrics.map((row) => (
              <p key={row.platform}>
                {row.platform === "google" ? "جوجل" : "ميتا"}: إنفاق {row.spend.toFixed(2)}{" "}
                {row.currency} | نقرات {row.clicks} | CTR {row.ctr.toFixed(2)}% | تحويلات{" "}
                {row.conversions}
              </p>
            ))}
            {last.alerts.map((a) => (
              <p key={`${a.platform}-${a.level}`} className="text-amber-300">
                تنبيه {a.platform}: {a.level}% من الميزانية اليومية
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">لا يوجد تقرير بعد. اضغط «تقرير تيليجرام» أو اربط كرون على POST /api/admin/ads/report.</p>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="text-white font-semibold mb-3">الحملات</h2>
        <div className="space-y-2">
          {(data?.campaigns || []).length === 0 ? (
            <p className="text-sm text-white/40">لا حملات بعد.</p>
          ) : (
            data?.campaigns.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"
              >
                <div className="text-white/80">
                  <span className="text-white/40 me-2">{c.platform}</span>
                  {c.name} · {c.dailyBudget} · {c.status}
                  {c.dryRun ? " (dryRun)" : ""}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleCampaign(c.id, "pause")}
                    className="rounded-lg border border-white/10 px-2 py-1 text-white/70"
                  >
                    <Pause size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleCampaign(c.id, "resume")}
                    className="rounded-lg border border-white/10 px-2 py-1 text-white/70"
                  >
                    <Play size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
