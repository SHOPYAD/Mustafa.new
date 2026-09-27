"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  Send,
  ShieldOff,
  XCircle,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const inputClass =
  "w-full px-3 py-2.5 bg-background/60 border border-border rounded-xl text-foreground placeholder-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-btn-secondary-border/40 text-sm";
const labelClass = "block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";
const cardClass = "rounded-2xl border border-border bg-card/[0.03] p-5";

type SmtpStatus = {
  configured: boolean;
  connected: boolean;
  placeholder: boolean;
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  passwordConfigured: boolean;
  authMethod: string;
  tlsMode: string;
  localName: string;
  senderName: string;
  senderAddress: string;
  statusLabelAr: string;
  statusLabelEn: string;
};

type LastDelivery = {
  at: string;
  to: string;
  from: string;
  localAccepted: boolean;
  deliveredToInbox: boolean;
  status: string;
  queueId: string;
  messageId: string;
  smtpResponse: string;
  remoteDsn: string;
  remoteReason: string;
  labelAr: string;
  labelEn: string;
};

type DnsCheck = {
  name: string;
  ok: boolean;
  status: "ok" | "warning" | "missing";
  current: string;
  recommended?: string;
  noteAr: string;
  noteEn: string;
};

type DnsSetupTip = {
  name: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
};

type DnsReport = {
  sendingIpv4: string;
  mailDomain?: string;
  mailHost?: string;
  checkedAt?: string;
  queriedVia?: string[];
  signingSelector?: string;
  signingHost?: string;
  checks: DnsCheck[];
  setupTips?: DnsSetupTip[];
  bimiNoteAr?: string;
  bimiNoteEn?: string;
  canGuaranteeAr: string;
  canGuaranteeEn: string;
};

function dnsStatusLabel(status: DnsCheck["status"], ar: boolean): string {
  switch (status) {
    case "ok":
      return ar ? "موافق" : "OK";
    case "warning":
      return ar ? "تحذير" : "Warning";
    case "missing":
      return ar ? "ناقص" : "Missing";
    default: {
      const _exhaustive: never = status;
      return String(_exhaustive);
    }
  }
}

function authRecordsOk(dns: DnsReport | null): boolean {
  if (!dns) return false;
  const names = ["SPF", "DKIM", "DMARC", "PTR"];
  const checks = dns.checks.filter((check) => names.includes(check.name));
  return checks.length >= names.length && checks.every((check) => check.status === "ok");
}

function dnsStatusClass(status: DnsCheck["status"]): string {
  switch (status) {
    case "ok":
      return "bg-emerald-500/15 text-emerald-200";
    case "warning":
      return "bg-secondary/15 text-muted-foreground";
    case "missing":
      return "bg-red-500/15 text-red-200";
    default: {
      const _exhaustive: never = status;
      return String(_exhaustive);
    }
  }
}

export default function AdminEmailSettingsPage() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const [smtp, setSmtp] = useState<SmtpStatus | null>(null);
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [lastDelivery, setLastDelivery] = useState<LastDelivery | null>(null);
  const [dns, setDns] = useState<DnsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [checkingDns, setCheckingDns] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-settings", { cache: "no-store" });
      const json = (await res.json()) as {
        smtp?: SmtpStatus;
        adminEmail?: string;
        lastDelivery?: LastDelivery;
        dns?: DnsReport;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "load failed");
      setSmtp(json.smtp || null);
      setAdminEmail(json.adminEmail || "");
      setLastDelivery(json.lastDelivery || null);
      setDns(json.dns || null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "تعذّر التحميل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!smtp) return;
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/admin/email-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: smtp.enabled,
          host: smtp.host,
          port: smtp.port,
          username: smtp.username,
          password,
          authMethod: smtp.authMethod,
          tlsMode: smtp.tlsMode,
          localName: smtp.localName,
          senderName: smtp.senderName,
          senderAddress: smtp.senderAddress,
        }),
      });
      const json = (await res.json()) as { smtp?: SmtpStatus; error?: string };
      if (!res.ok) throw new Error(json.error || "save failed");
      setSmtp(json.smtp || smtp);
      setPassword("");
      setMsg(ar ? "حُفظت إعدادات SMTP في PocketBase" : "SMTP saved to PocketBase");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "save failed");
    } finally {
      setSaving(false);
    }
  };

  const test = async (send: boolean) => {
    setTesting(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/admin/email-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ send, to: adminEmail }),
      });
      const json = (await res.json()) as {
        error?: string;
        to?: string;
        localAccepted?: boolean;
        delivery?: LastDelivery;
      };
      if (!res.ok) throw new Error(json.error || "test failed");
      if (json.delivery) setLastDelivery(json.delivery);
      if (!send) {
        setMsg(ar ? "الخادم المحلي يقبل الاتصال والمصادقة" : "Local SMTP accepts the connection");
        return;
      }
      const delivery = json.delivery;
      if (delivery?.status === "bounced") {
        setErr(
          ar
            ? `قُبلت محلياً ثم رفضها جيميل: ${delivery.remoteReason || delivery.labelAr}`
            : `Accepted locally then Gmail rejected: ${delivery.remoteReason || delivery.labelEn}`
        );
        return;
      }
      if (delivery?.status === "delivered") {
        setMsg(
          ar
            ? `جيميل قبل الرسالة إلى ${json.to || adminEmail} (قبول MX ≠ ضمان الوارد/السبام)`
            : `Gmail MX accepted mail to ${json.to || adminEmail} (not an inbox/spam guarantee)`
        );
        return;
      }
      setMsg(
        ar
          ? `قُبلت محلياً إلى ${json.to || adminEmail} — لم يُؤكَّد وصول جيميل بعد`
          : `Accepted locally for ${json.to || adminEmail} — Gmail delivery not confirmed`
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "test failed");
    } finally {
      setTesting(false);
    }
  };

  const verifyDns = async () => {
    setCheckingDns(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/admin/email-settings/dns", {
        method: "POST",
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      });
      const json = (await res.json()) as { dns?: DnsReport; error?: string };
      if (!res.ok) throw new Error(json.error || "dns check failed");
      setDns(json.dns || null);
      setMsg(ar ? "أُعيد فحص DNS من 1.1.1.1 و8.8.8.8 الآن" : "DNS rechecked via 1.1.1.1 and 8.8.8.8");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "dns check failed");
    } finally {
      setCheckingDns(false);
    }
  };

  const connected = Boolean(smtp?.connected);
  const ready = Boolean(smtp && !smtp.placeholder && smtp.enabled && smtp.host);

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <div>
        <h1 className='text-2xl font-bold text-foreground'>
          {ar ? "إعدادات البريد SMTP" : "SMTP mail settings"}
        </h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          {ar
            ? "قبول SMTP المحلي ليس وصولاً إلى جيميل. لا يوجد ضمان لصندوق الوارد أو تجنّب السبام — فقط مصادقة النطاق (SPF+DKIM+DMARC+PTR+TLS)."
            : "Local SMTP accept is not Gmail delivery. Inbox/spam cannot be guaranteed — only domain authentication (SPF+DKIM+DMARC+PTR+TLS)."}
        </p>
      </div>

      {/* Real KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>خادم الإرسال SMTP</span>
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : ready ? "bg-amber-500" : "bg-red-500"}`} />
          </div>
          <div className="text-xl font-black text-foreground font-mono truncate" dir="ltr">
            {smtp?.host ? `${smtp.host}:${smtp.port}` : "smtp.lonaliza.com"}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${connected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
            {connected ? "متصل ويعمل بكفاءة" : ready ? "مهيأ بانتظار الاتصال" : "بحاجة للتهيئة"}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>توثيق سجلات DNS</span>
            <CheckCircle2 className={`size-3.5 ${authRecordsOk(dns) ? "text-emerald-500" : "text-amber-500"}`} />
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            SPF · DKIM · DMARC
          </div>
          <div className={`text-[11px] mt-1 font-medium ${authRecordsOk(dns) ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {authRecordsOk(dns) ? "السجلات متطابقة ومحمية" : "يتطلب فحص السجلات"}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>حالة التسليم البريدي</span>
            <Send className="size-3.5 text-sky-500" />
          </div>
          <div className="text-xl font-black text-foreground">
            {lastDelivery?.status === "delivered" ? "تم التسليم بنجاح" : "جاهز للإرسال"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {lastDelivery?.at ? `آخر إرسال: ${new Date(lastDelivery.at).toLocaleTimeString("ar-EG")}` : "لا توجد عمليات إرسال معلقة"}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>عنوان الإرسال المعتمد</span>
            <Mail className="size-3.5 text-primary" />
          </div>
          <div className="text-sm font-black text-foreground font-mono truncate" dir="ltr">
            {smtp?.senderAddress || "noreply@lonaliza.com"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 truncate">
            {smtp?.senderName || "Lonaliza Tourism"}
          </div>
        </div>
      </div>

      <div className='rounded-xl border border-border/25 bg-secondary/[0.07] px-4 py-3 text-sm text-amber-50/90 leading-relaxed'>
        {ar ? (
          <>
            أول رسائل من نطاق جديد غالباً تصل إلى السبام حتى تُبنى سمعة المرسل.
            تعليم الرسالة «ليست سبام / مرغوب» يساعد الرسائل التالية — بما فيها
            الحملات. هذا لا يضمن الوارد.
            {authRecordsOk(dns)
              ? " سجلات SPF وDKIM وDMARC وPTR موافقة في آخر فحص: المصادقة سليمة، لكن جيميل ما زال يقرّر الصندوق."
              : " راجع سجلات SPF/DKIM/DMARC/PTR أدناه؛ أي نقص يزيد احتمال السبام."}
          </>
        ) : (
          <>
            First messages from a new domain often go to spam until sender
            reputation builds. Marking “Not spam” helps later mail, including
            campaigns. That is not an inbox guarantee.
            {authRecordsOk(dns)
              ? " SPF, DKIM, DMARC, and PTR look aligned on the last check — authentication is in place; Gmail still decides the mailbox."
              : " Review SPF/DKIM/DMARC/PTR below; any gap raises the spam risk."}
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
            lastDelivery?.status === "delivered"
              ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
              : connected
                ? "border-admin-btn-secondary-border/40 text-muted-foreground bg-secondary/10"
                : ready
                  ? "border-admin-btn-secondary-border/40 text-muted-foreground bg-secondary/10"
                  : "border-border text-muted-foreground bg-card/[0.03]"
          }`}
        >
          {connected ? <CheckCircle2 size={12} /> : ready ? <Mail size={12} /> : <XCircle size={12} />}
          {smtp ? (ar ? smtp.statusLabelAr : smtp.statusLabelEn) : ar ? "جاري التحميل" : "Loading"}
        </span>
        <Link
          href="/admin/email-marketing"
          className='text-xs px-3 py-1.5 rounded-lg border border-border text-secondary hover:bg-card/[0.04]'
        >
          {ar ? "تسويق البريد ←" : "Email marketing →"}
        </Link>
      </div>

      {smtp?.placeholder && (
        <div className='rounded-xl border border-border/30 bg-secondary/10 px-4 py-3 text-sm text-muted-foreground'>
          {ar
            ? "القيم الحالية تجريبية (smtp.example.com / support@example.com). لن يُرسل أي بريد حتى تحفظ SMTP حقيقياً."
            : "Current values are placeholders (smtp.example.com). Nothing will send until a real SMTP host is saved."}
        </div>
      )}

      {loading || !smtp ? (
        <div className='flex items-center gap-2 text-muted-foreground text-sm'>
          <Loader2 size={16} className="animate-spin" />
          {ar ? "جاري القراءة من PocketBase…" : "Reading PocketBase…"}
        </div>
      ) : (
        <div className={`${cardClass} space-y-4`}>
          <label className='flex items-center gap-3 text-sm text-muted-foreground'>
            <input
              type="checkbox"
              checked={smtp.enabled}
              onChange={(e) => setSmtp({ ...smtp, enabled: e.target.checked })}
            />
            {ar ? "استخدام خادم SMTP (موصى به)" : "Use SMTP mail server (recommended)"}
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{ar ? "اسم المرسل" : "Sender name"}</label>
              <input
                className={inputClass}
                value={smtp.senderName}
                onChange={(e) => setSmtp({ ...smtp, senderName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{ar ? "عنوان المرسل" : "Sender address"}</label>
              <input
                className={inputClass}
                value={smtp.senderAddress}
                onChange={(e) => setSmtp({ ...smtp, senderAddress: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{ar ? "خادم SMTP" : "SMTP host"}</label>
              <input
                className={inputClass}
                value={smtp.host}
                placeholder="smtp.your-provider.com"
                onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{ar ? "المنفذ" : "Port"}</label>
              <input
                className={inputClass}
                type="number"
                value={smtp.port}
                onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) || 587 })}
              />
            </div>
            <div>
              <label className={labelClass}>{ar ? "اسم المستخدم" : "Username"}</label>
              <input
                className={inputClass}
                value={smtp.username}
                onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{ar ? "كلمة السر" : "Password"}</label>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={password}
                placeholder={
                  smtp.passwordConfigured
                    ? ar
                      ? "محفوظة — اتركها فارغة للإبقاء"
                      : "Saved — leave blank to keep"
                    : ar
                      ? "غير محفوظة"
                      : "Not saved"
                }
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className='text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1'>
                <ShieldOff size={11} />
                {ar
                  ? "لا تُعرض كلمة السر بعد الحفظ."
                  : "The password is never displayed after save."}
              </p>
            </div>
            <div>
              <label className={labelClass}>{ar ? "التشفير" : "TLS"}</label>
              <select
                className={inputClass}
                value={smtp.tlsMode}
                onChange={(e) => setSmtp({ ...smtp, tlsMode: e.target.value })}
              >
                <option value="starttls">STARTTLS (587)</option>
                <option value="tls">TLS (465)</option>
                <option value="none">None (غير مناسب لـ 587)</option>
              </select>
              <p className='text-[11px] text-muted-foreground mt-1.5'>
                {ar
                  ? "المنفذ 587 على محرك البريد يطلب STARTTLS. None يفشل التشفير الإلزامي."
                  : "Port 587 on this mail stack requires STARTTLS."}
              </p>
            </div>
            <div>
              <label className={labelClass}>{ar ? "طريقة المصادقة" : "AUTH method"}</label>
              <select
                className={inputClass}
                value={smtp.authMethod}
                onChange={(e) => setSmtp({ ...smtp, authMethod: e.target.value })}
              >
                <option value="PLAIN">PLAIN</option>
                <option value="LOGIN">LOGIN</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>EHLO / HELO</label>
              <input
                className={inputClass}
                value={smtp.localName}
                placeholder="localhost"
                onChange={(e) => setSmtp({ ...smtp, localName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {ar ? "إيميل الأدمن للتجربة" : "Admin test inbox"}
            </label>
            <input
              className={inputClass}
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:brightness-110 text-white font-bold text-sm shadow-md shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer'
            >
              {saving ? <Loader2 size={15} className="animate-spin text-white stroke-white" /> : <Save size={15} className="text-white stroke-white" />}
              <span className="text-white">{ar ? "حفظ في PocketBase" : "Save to PocketBase"}</span>
            </button>
            <button
              type="button"
              onClick={() => void test(false)}
              disabled={testing}
              className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted font-bold text-sm transition-all cursor-pointer'
            >
              {testing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              <span>{ar ? "فحص الاتصال" : "Verify connection"}</span>
            </button>
            <button
              type="button"
              onClick={() => void test(true)}
              disabled={testing || !adminEmail}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-card text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-bold text-sm transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>{ar ? "إرسال تجريبي للأدمن" : "Send test to admin"}</span>
            </button>
          </div>
        </div>
      )}

      {lastDelivery?.at && (
        <div
          className={`${cardClass} space-y-2 ${
            lastDelivery.status === "bounced"
              ? "border-red-500/30"
              : lastDelivery.status === "delivered"
                ? "border-emerald-500/25"
                : "border-admin-btn-secondary-border/25"
          }`}
        >
          <h2 className='text-sm font-semibold text-foreground'>
            {ar ? "آخر حالة تسليم" : "Last delivery status"}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {ar ? lastDelivery.labelAr : lastDelivery.labelEn}
          </p>
          {lastDelivery.remoteReason && (
            <p className='text-xs text-muted-foreground break-words'>{lastDelivery.remoteReason}</p>
          )}
          <p className='text-[11px] text-muted-foreground'>
            {lastDelivery.to} · {lastDelivery.from}
            {lastDelivery.remoteDsn ? ` · DSN ${lastDelivery.remoteDsn}` : ""}
            {lastDelivery.queueId ? ` · ${lastDelivery.queueId}` : ""}
          </p>
        </div>
      )}

      {dns && (
        <div className={`${cardClass} space-y-3`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className='text-sm font-semibold text-foreground'>
                {ar ? "مصادقة النطاق (DNS)" : "Domain authentication (DNS)"}
              </h2>
              <p className='text-xs text-muted-foreground mt-1'>
                {ar ? dns.canGuaranteeAr : dns.canGuaranteeEn}
              </p>
              {dns.checkedAt && (
                <p className='text-[11px] text-muted-foreground mt-1'>
                  {ar ? "آخر فحص حي: " : "Last live check: "}
                  {new Date(dns.checkedAt).toLocaleString()}
                  {dns.queriedVia?.length ? ` · ${dns.queriedVia.join(" + ")}` : ""}
                </p>
              )}
              {(dns.mailDomain || dns.sendingIpv4) && (
                <p className='text-[11px] text-muted-foreground mt-1'>
                  {dns.mailDomain ? `${dns.mailHost || `mail.${dns.mailDomain}`}` : ""}
                  {dns.mailDomain && dns.sendingIpv4 ? " · " : ""}
                  {dns.sendingIpv4 || ""}
                </p>
              )}
              {dns.signingHost && (
                <p className="text-[11px] text-[var(--admin-btn-secondary-border)]/80 mt-1">
                  {ar
                    ? `محرك البريد يوقّع بالسلكتور ${dns.signingSelector || "default"} — السجل المطلوب: ${dns.signingHost}`
                    : `Mail engine signs selector ${dns.signingSelector || "default"} — publish ${dns.signingHost}`}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void verifyDns()}
              disabled={checkingDns}
              className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 cursor-pointer'
            >
              {checkingDns ? <Loader2 size={15} className="animate-spin text-white stroke-white" /> : <RefreshCw size={15} className="text-white stroke-white" />}
              <span className="text-white">{ar ? "تحقق من سجلات DNS الآن" : "Verify DNS records now"}</span>
            </button>
          </div>
          <div className="space-y-2">
            {dns.checks.map((check) => {
              const status = check.status || (check.ok ? "ok" : "missing");
              return (
                <div key={check.name} className='rounded-xl border border-border px-3 py-2'>
                  <div className="flex items-center justify-between gap-2">
                    <span className='text-xs font-semibold text-muted-foreground'>{check.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md ${dnsStatusClass(status)}`}>
                      {dnsStatusLabel(status, ar)}
                    </span>
                  </div>
                  <p className='text-[11px] text-muted-foreground mt-1 break-all'>{check.current}</p>
                  <p className='text-[11px] text-muted-foreground mt-1'>{ar ? check.noteAr : check.noteEn}</p>
                  {status !== "ok" && check.recommended && (
                    <p className="text-[11px] text-[var(--admin-btn-secondary-border)]/80 mt-1 break-all">
                      {ar ? "المطلوب: " : "Required: "}
                      {check.recommended}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {dns.setupTips && dns.setupTips.length > 0 && (
            <div className="space-y-2 pt-1">
              {dns.setupTips.map((tip) => (
                <div key={tip.name} className='rounded-xl border border-border bg-card/[0.02] px-3 py-2.5'>
                  <p className='text-xs font-semibold text-muted-foreground'>
                    {ar ? tip.titleAr : tip.titleEn}
                  </p>
                  <p className='text-[11px] text-muted-foreground mt-1 leading-relaxed'>
                    {ar ? tip.bodyAr : tip.bodyEn}
                  </p>
                </div>
              ))}
            </div>
          )}
          {dns.bimiNoteAr && (
            <p className='text-[11px] text-muted-foreground'>
              {ar ? dns.bimiNoteAr : dns.bimiNoteEn}
            </p>
          )}
        </div>
      )}

      {msg && <p className="text-sm text-emerald-300">{msg}</p>}
      {err && <p className="text-sm text-red-300">{err}</p>}
    </div>
  );
}
