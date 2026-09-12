"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, MessageCircle, Save, ShieldCheck, XCircle } from "lucide-react";

const inputClass =
  "w-full px-3 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 text-sm";
const labelClass = "block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider";
const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] p-5";

type SettingsState = {
  otpEnabled: boolean;
  otpChannels: string[];
  otpTtlSec: number;
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
  whatsappWabaId: string;
  whatsappVerifyToken: string;
  whatsappGraphVersion: string;
  whatsappOtpTemplate: string;
  whatsappTransactionalTemplate: string;
  whatsappMarketingTemplate: string;
  telegramBotToken: string;
  telegramDefaultChatId: string;
  rateLimitPerMinute: number;
  whatsappReady?: boolean;
  telegramReady?: boolean;
  whatsappPhoneIdInvalid?: boolean;
};

type TestResult = {
  ok: boolean;
  summaryAr: string;
  error?: string;
  details?: Record<string, unknown>;
};

const empty: SettingsState = {
  otpEnabled: false,
  otpChannels: ["whatsapp", "telegram", "email"],
  otpTtlSec: 600,
  whatsappPhoneNumberId: "",
  whatsappAccessToken: "",
  whatsappWabaId: "",
  whatsappVerifyToken: "",
  whatsappGraphVersion: "v21.0",
  whatsappOtpTemplate: "otp_code",
  whatsappTransactionalTemplate: "",
  whatsappMarketingTemplate: "",
  telegramBotToken: "",
  telegramDefaultChatId: "",
  rateLimitPerMinute: 20,
};

function Copyable({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="mt-1 inline-flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-start font-mono text-[12px] text-amber-200"
    >
      <span className="break-all">{value}</span>
      <Copy className="size-3.5 shrink-0" />
      {done ? <span className="text-[10px] text-emerald-300">نُسخ</span> : null}
    </button>
  );
}

export default function CommsSettings() {
  const [values, setValues] = useState<SettingsState>(empty);
  const [webhooks, setWebhooks] = useState({ whatsapp: "", telegram: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState({ email: 0, whatsapp: 0, telegram: 0 });
  const [coupons, setCoupons] = useState<Array<{ code: string; title: string; discount: string }>>([]);
  const [waTest, setWaTest] = useState<TestResult | null>(null);
  const [tgTest, setTgTest] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [phoneHint, setPhoneHint] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/automation/comms", { cache: "no-store" });
      const data = (await res.json()) as {
        settings?: SettingsState;
        audience?: { email: number; whatsapp: number; telegram: number };
        liveCoupons?: Array<{ code: string; title: string; discount: string }>;
        webhooks?: { whatsapp: string; telegram: string };
      };
      if (data.settings) {
        setValues({ ...empty, ...data.settings });
        if (data.settings.whatsappPhoneIdInvalid) {
          setPhoneHint("كان الحقل يحتوي إيميلاً بالخطأ — أدخلوا Phone Number ID الرقمي فقط.");
        }
      }
      if (data.audience) setAudience(data.audience);
      if (data.liveCoupons) setCoupons(data.liveCoupons);
      if (data.webhooks) setWebhooks(data.webhooks);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/automation/comms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; settings?: SettingsState };
      if (!res.ok || !data.ok) {
        setMessage(data.error || "تعذّر الحفظ");
        return;
      }
      if (data.settings) setValues({ ...empty, ...data.settings });
      setMessage("تم حفظ إعدادات الرسائل.");
      setPhoneHint("");
    } catch {
      setMessage("تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const test = async (channel: "whatsapp" | "telegram") => {
    setTesting(channel);
    try {
      const res = await fetch("/api/admin/automation/comms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
      const data = (await res.json()) as { result?: TestResult };
      if (channel === "whatsapp") setWaTest(data.result || { ok: false, summaryAr: "لا نتيجة" });
      else setTgTest(data.result || { ok: false, summaryAr: "لا نتيجة" });
    } finally {
      setTesting(null);
    }
  };

  const toggleChannel = (channel: string, on: boolean) => {
    setValues((prev) => {
      const next = new Set(prev.otpChannels);
      if (on) next.add(channel);
      else next.delete(channel);
      return { ...prev, otpChannels: [...next] };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-sm">
        <Loader2 size={16} className="animate-spin" />
        جاري تحميل إعدادات واتساب وتيليجرام…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className={`${cardClass} flex flex-col gap-3`}>
        <div className="flex items-center gap-2 text-emerald-300">
          <ShieldCheck size={16} />
          <h2 className="text-sm font-semibold">رمز التحقق OTP — متى يُرسل؟</h2>
        </div>
        <p className="text-xs leading-6 text-white/55">
          يُرسل الرمز فقط عند تأكيد حجز، تسجيل حساب جديد، أو طلب تحقق من لوحة الدخول — وليس للحملات التسويقية.
          يبقى تسجيل الدخول بكلمة المرور يعمل حتى لو عطّلتم OTP.
        </p>
        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={values.otpEnabled}
            onChange={(e) => setValues({ ...values, otpEnabled: e.target.checked })}
          />
          تفعيل OTP للحجز والتسجيل والتحقق
        </label>
        <div className="flex flex-wrap gap-4 text-sm text-white/70">
          {["whatsapp", "telegram", "email"].map((channel) => (
            <label key={channel} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.otpChannels.includes(channel)}
                onChange={(e) => toggleChannel(channel, e.target.checked)}
              />
              {channel === "whatsapp" ? "واتساب" : channel === "telegram" ? "تيليجرام" : "بريد"}
            </label>
          ))}
        </div>
        <div>
          <label className={labelClass}>صلاحية الرمز (ثوانٍ)</label>
          <input
            className={inputClass}
            type="number"
            min={60}
            max={1800}
            value={values.otpTtlSec}
            onChange={(e) => setValues({ ...values, otpTtlSec: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className={`${cardClass} flex flex-col gap-4`}>
        <div className="flex items-center gap-2 text-amber-300">
          <MessageCircle size={16} />
          <h2 className="text-sm font-semibold">واتساب Cloud API — إعداد إنتاج</h2>
        </div>
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] leading-relaxed text-amber-100/90">
          كتالوج MCP يستخدم نفس هذه الإعدادات (ربط وتحقق يبقى متزامناً). لا نربط واتساب عبر QR أو أرشيف
          الماك لأن ميتا تحظره وقد يُحظر الرقم — Cloud API الرسمي فقط.
        </p>
        <ol className="list-decimal space-y-2 pe-5 text-xs leading-6 text-white/65">
          <li>ادخلوا developers.facebook.com → أنشئوا تطبيقاً من نوع Business.</li>
          <li>أضيفوا منتج WhatsApp → اربطوا حساب واتساب للأعمال (WABA).</li>
          <li>
            من WhatsApp → API Setup انسخوا <strong>Phone number ID</strong> — رقم طويل فقط (15 رقم تقريباً). ليس
            الإيميل ولا WABA ID.
          </li>
          <li>أنشئوا System User في Business Settings → أعطوه WhatsApp وأصدروا Permanent token.</li>
          <li>في التطبيق: WhatsApp → Configuration → Callback URL والصقوا الرابط أدناه مع Verify Token الذي تختارونه.</li>
          <li>اشتركوا في الحقول: messages. أنشئوا قوالب OTP/تسويق في مدير واتساب ووافقوا عليها.</li>
        </ol>
        {webhooks.whatsapp ? (
          <div>
            <label className={labelClass}>Callback URL (انسخوه إلى ميتا)</label>
            <Copyable value={webhooks.whatsapp} />
          </div>
        ) : null}
        {phoneHint ? <p className="text-xs text-amber-300">{phoneHint}</p> : null}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Phone Number ID (أرقام فقط)</label>
            <input
              className={inputClass}
              inputMode="numeric"
              autoComplete="off"
              placeholder="مثال: 123456789012345"
              value={values.whatsappPhoneNumberId}
              onChange={(e) => {
                const next = e.target.value.trim();
                setValues({ ...values, whatsappPhoneNumberId: next });
                setPhoneHint(next.includes("@") ? "هذا يبدو إيميلاً — الحقل يجب أن يكون رقمياً." : "");
              }}
            />
          </div>
          <div>
            <label className={labelClass}>Access Token</label>
            <input
              className={inputClass}
              type="password"
              value={values.whatsappAccessToken}
              onChange={(e) => setValues({ ...values, whatsappAccessToken: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>WABA ID</label>
            <input
              className={inputClass}
              value={values.whatsappWabaId}
              onChange={(e) => setValues({ ...values, whatsappWabaId: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Verify Token للويب هوك</label>
            <input
              className={inputClass}
              type="password"
              value={values.whatsappVerifyToken}
              onChange={(e) => setValues({ ...values, whatsappVerifyToken: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>قالب OTP</label>
            <input
              className={inputClass}
              value={values.whatsappOtpTemplate}
              onChange={(e) => setValues({ ...values, whatsappOtpTemplate: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>قالب الحالة / الكوبون</label>
            <input
              className={inputClass}
              value={values.whatsappTransactionalTemplate}
              onChange={(e) => setValues({ ...values, whatsappTransactionalTemplate: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>قالب التسويق (مطلوب للحملات لجمهور CRM الموافق فقط)</label>
            <input
              className={inputClass}
              value={values.whatsappMarketingTemplate}
              onChange={(e) => setValues({ ...values, whatsappMarketingTemplate: e.target.value })}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void test("whatsapp")}
          disabled={testing === "whatsapp"}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-amber-500/40 px-4 py-2 text-sm text-amber-200"
        >
          {testing === "whatsapp" ? <Loader2 size={14} className="animate-spin" /> : null}
          اختبار الاتصال
        </button>
        {waTest ? (
          <p className={`text-xs ${waTest.ok ? "text-emerald-300" : "text-rose-300"}`}>
            {waTest.ok ? <CheckCircle2 className="inline size-3.5" /> : <XCircle className="inline size-3.5" />}{" "}
            {waTest.summaryAr}
            {waTest.error ? ` — ${waTest.error}` : ""}
          </p>
        ) : null}
      </div>

      <div className={`${cardClass} flex flex-col gap-4`}>
        <h2 className="text-sm font-semibold text-sky-300">تيليجرام Bot API — إعداد إنتاج</h2>
        <ol className="list-decimal space-y-2 pe-5 text-xs leading-6 text-white/65">
          <li>افتحوا @BotFather في تيليجرام → /newbot → اختاروا اسماً واسم مستخدم ينتهي بـ bot.</li>
          <li>انسخوا الرمز بالشكل 123456789:AA… والصقوه أدناه. لا تشاركوه ولا تسجّلوه في اللوج.</li>
          <li>أضيفوا البوت مشرفاً على قناتكم أو ابدأوا محادثة خاصة معه.</li>
          <li>
            لمعرفة Chat ID: راسلوا البوت ثم زوروا getUpdates، أو استخدموا @userinfobot. للقنوات استخدموا
            -100… .
          </li>
          <li>بعد الحفظ اضغطوا اختبار الاتصال — نضبط setWebhook تلقائياً على الرابط أدناه.</li>
        </ol>
        {webhooks.telegram ? (
          <div>
            <label className={labelClass}>Webhook URL</label>
            <Copyable value={webhooks.telegram} />
          </div>
        ) : null}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Bot Token</label>
            <input
              className={inputClass}
              type="password"
              value={values.telegramBotToken}
              onChange={(e) => setValues({ ...values, telegramBotToken: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>قناة/محادثة الإدارة (للاعتماد: انشر / أطلق)</label>
            <input
              className={inputClass}
              value={values.telegramDefaultChatId}
              onChange={(e) => setValues({ ...values, telegramDefaultChatId: e.target.value })}
              placeholder="-100… أو رقم المحادثة"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void test("telegram")}
          disabled={testing === "telegram"}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-sky-500/40 px-4 py-2 text-sm text-sky-200"
        >
          {testing === "telegram" ? <Loader2 size={14} className="animate-spin" /> : null}
          اختبار الاتصال
        </button>
        {tgTest ? (
          <p className={`text-xs ${tgTest.ok ? "text-emerald-300" : "text-rose-300"}`}>
            {tgTest.ok ? <CheckCircle2 className="inline size-3.5" /> : <XCircle className="inline size-3.5" />}{" "}
            {tgTest.summaryAr}
            {tgTest.error ? ` — ${tgTest.error}` : ""}
          </p>
        ) : null}
      </div>

      <div className={`${cardClass} flex flex-col gap-3`}>
        <h2 className="text-sm font-semibold text-white/80">كوبونات ونقاط من لوحة الولاء</h2>
        {coupons.length === 0 ? (
          <p className="text-xs text-white/40">لا كوبونات نشطة حالياً — العروض تُقرأ من /admin/marketing/coupons.</p>
        ) : (
          <ul className="text-sm text-white/70 space-y-1">
            {coupons.map((row) => (
              <li key={row.code}>
                <span className="text-amber-300 font-mono">{row.code}</span> · {row.discount} · {row.title}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-white/35">
          جمهور التسويق من CRM الموافق فقط: بريد {audience.email} · واتساب {audience.whatsapp} · تيليجرام{" "}
          {audience.telegram}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 transition-colors shadow-sm"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          حفظ الإعدادات
        </button>
        {message ? <span className="text-sm text-emerald-300">{message}</span> : null}
      </div>
    </div>
  );
}
