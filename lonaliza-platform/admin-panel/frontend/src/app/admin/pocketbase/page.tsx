"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Status = {
  ok?: boolean;
  healthy: boolean;
  url: string;
  publicUrl: string;
  defaultInternalUrl: string;
  collectionsCount: number;
  collectionNames: string[];
  healthError?: string;
  appName?: string;
  appURL?: string;
  expectedAppName?: string;
  expectedAppURL?: string;
  pbVersion?: string;
  googleProviderPresent?: boolean;
  currentAdminEmail: string;
  adminEmailMasked: string;
  adminEmailConfigured: boolean;
  adminPasswordConfigured: boolean;
  googleEnabled: boolean;
  googleReady: boolean;
  googleClientIdMasked: string;
  googleClientIdConfigured: boolean;
  googleSecretConfigured: boolean;
  googleRedirectUris: string[];
  drafts?: {
    POCKETBASE_URL: string;
    POCKETBASE_ADMIN_EMAIL: string;
    POCKETBASE_GOOGLE_ENABLED: string;
  };
  message?: string;
  googleSyncError?: string;
  error?: string;
};

const GOOGLE_CONSOLE_URL = "https://console.cloud.google.com/";
const JS_ORIGINS = [
  "https://lonaliza.com",
  "https://pocketbase.lonaliza.com",
] as const;
const FALLBACK_REDIRECT_URIS = [
  "https://lonaliza.com/api/auth/callback",
  "https://pocketbase.lonaliza.com/api/oauth2-redirect",
  "https://lonaliza.com/api/mobile/v1/auth/google/callback",
  "https://lonaliza.com/api/partners/auth/google/callback",
] as const;

const labelClass =
  "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Badge variant={ok ? "secondary" : "outline"} className="gap-1.5">
      {ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {label}
    </Badge>
  );
}

function CopyableUri({
  value,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 p-2.5 font-mono text-xs">
      <span className="truncate select-all font-semibold" dir="ltr">
        {value}
      </span>
      <Button type="button" variant="outline" size="xs" onClick={copy}>
        {copied ? (
          <>
            <Check size={12} />
            {copiedLabel}
          </>
        ) : (
          <>
            <Copy size={12} />
            {copyLabel}
          </>
        )}
      </Button>
    </div>
  );
}

export default function PocketbaseAdminPage() {
  const { t } = useLocale();
  const pb = t.pocketbaseSettings;

  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSuperuser, setSavingSuperuser] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [internalUrl, setInternalUrl] = useState("");
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");
  const [newSuperuserEmail, setNewSuperuserEmail] = useState("");
  const [newSuperuserPassword, setNewSuperuserPassword] = useState("");
  const [confirmSuperuserPassword, setConfirmSuperuserPassword] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleSecret, setGoogleSecret] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pocketbase", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = (await res.json()) as Status;
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || pb.loadFailed);
      }
      setStatus(data);
      setInternalUrl(data.drafts?.POCKETBASE_URL || data.url || "");
      setCurrentAdminEmail(
        data.currentAdminEmail || data.drafts?.POCKETBASE_ADMIN_EMAIL || ""
      );
      setGoogleEnabled(Boolean(data.googleEnabled));
      setNewSuperuserEmail("");
      setNewSuperuserPassword("");
      setConfirmSuperuserPassword("");
      setGoogleClientId("");
      setGoogleSecret("");
    } catch (e) {
      setError(e instanceof Error ? e.message : pb.loadFailed);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [pb.loadFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const values: Record<string, string> = {
        POCKETBASE_URL: internalUrl.trim(),
        POCKETBASE_GOOGLE_ENABLED: googleEnabled ? "true" : "false",
      };
      if (googleClientId.trim()) {
        values.POCKETBASE_GOOGLE_CLIENT_ID = googleClientId.trim();
      }
      if (googleSecret.trim()) {
        values.POCKETBASE_GOOGLE_CLIENT_SECRET = googleSecret.trim();
      }

      const res = await fetch("/api/admin/pocketbase", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = (await res.json()) as Status;
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || pb.saveFailed);
      }
      setStatus(data);
      if (data.currentAdminEmail) setCurrentAdminEmail(data.currentAdminEmail);
      setGoogleClientId("");
      setGoogleSecret("");
      setMessage(
        data.googleSyncError
          ? `${data.message || pb.saved} — ${pb.warningPrefix} ${data.googleSyncError}`
          : data.message || pb.savedOnServer
      );
      setTimeout(() => setMessage(""), 8000);
    } catch (e) {
      setError(e instanceof Error ? e.message : pb.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const saveSuperuser = async () => {
    setSavingSuperuser(true);
    setMessage("");
    setError("");
    const email = newSuperuserEmail.trim() || currentAdminEmail.trim();
    const password = newSuperuserPassword;
    const passwordConfirm = confirmSuperuserPassword;
    if (!email) {
      setError(pb.emailRequired);
      setSavingSuperuser(false);
      return;
    }
    if (password.length < 8) {
      setError(pb.passwordTooShort);
      setSavingSuperuser(false);
      return;
    }
    if (password !== passwordConfirm) {
      setError(pb.passwordMismatch);
      setSavingSuperuser(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/pocketbase/superuser", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, passwordConfirm }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        email?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || pb.saveFailed);
      }
      setCurrentAdminEmail(data.email || email);
      setNewSuperuserEmail("");
      setNewSuperuserPassword("");
      setConfirmSuperuserPassword("");
      setMessage(data.message || pb.superuserUpdated);
      setTimeout(() => setMessage(""), 8000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : pb.saveFailed);
    } finally {
      setSavingSuperuser(false);
    }
  };

  const redirectUris =
    status?.googleRedirectUris?.length
      ? status.googleRedirectUris
      : [...FALLBACK_REDIRECT_URIS];

  if (loading && !status) {
    return (
      <AdminPage className="flex flex-col gap-4">
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage className="flex flex-col gap-6">
      <AdminPageHeader
        breadcrumb={
          <span>
            لوحة التحكم <span className="mx-1 opacity-50">/</span> PocketBase
          </span>
        }
        icon={<Database className="size-5" />}
        title="إدارة قاعدة البيانات السحابية"
        description="متابعة حالة الاتصال، إعدادات تسجيل الدخول الموحد (Google OAuth)، وأمان الحسابات الإدارية — الأرقام من المحرك الحي دون اختراع."
        actions={
          <Button asChild>
            <a href="/api/admin/pocketbase/open">
              <ExternalLink size={15} />
              {pb.openDatabase}
            </a>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2.5">
        <StatusPill
          ok={Boolean(status?.healthy)}
          label={status?.healthy ? "الخادم السحابي يعمل بكفاءة" : "تعذر الاتصال بقاعدة البيانات"}
        />
        <StatusPill
          ok={Boolean(status?.adminEmailConfigured && status?.adminPasswordConfigured)}
          label="حساب المشرف الفائق مؤمّن"
        />
        <StatusPill
          ok={Boolean(status?.googleReady)}
          label={status?.googleReady ? "دخول Google OAuth مفعّل ومضبوط" : "دخول Google OAuth غير مكتمل"}
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <XCircle />
          <AlertTitle>تعذر التحميل أو الحفظ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {message ? (
        <Alert>
          <CheckCircle2 />
          <AlertTitle>تم</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {!status?.healthy ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>PocketBase غير متصل</EmptyTitle>
            <EmptyDescription>
              {status?.healthError || "لا جداول مستجابة من المحرك. العدد الحقيقي للجداول هو صفر — لن نعرض أرقاماً مخترعة."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server size={18} />
                  حالة الخادم وقاعدة البيانات
                </CardTitle>
                <CardDescription>الأرقام من المحرك الحي. إن كان الاتصال منقطعاً تظهر صفر جداول.</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {status?.pbVersion ? `v${status.pbVersion}` : "إصدار غير متاح"}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/40 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground">اسم المنصة المسجل</p>
                <p className="mt-1 text-sm font-semibold">{status?.appName || "غير متاح — المحرك لم يُجبِ"}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground">عدد الجداول الفعالة</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                  <Layers size={14} />
                  <span className="tabular-nums">{status?.collectionsCount ?? 0}</span>
                  <span className="font-medium text-muted-foreground">
                    {(status?.collectionsCount ?? 0) === 0
                      ? "لا جداول مستجابة من المحرك"
                      : "جداول مستجابة"}
                  </span>
                </p>
              </div>
              {(status?.collectionsCount ?? 0) === 0 ? (
                <div className="sm:col-span-2">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>لا جداول للقراءة</EmptyTitle>
                      <EmptyDescription>
                        إن كان PocketBase متوقفاً أو غير مصادق، تظهر هذه الحالة. لن نختلق عدداً للجداول.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              ) : (
                <div className="sm:col-span-2 rounded-lg border bg-muted/40 p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground">أسماء الجداول</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {(status?.collectionNames || []).join(" · ") || "—"}
                  </p>
                </div>
              )}
              <div className="rounded-lg border bg-muted/40 p-3.5 sm:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground">رابط لوحة التحكم العامة</p>
                {status?.publicUrl ? (
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-xs font-semibold" dir="ltr">
                      {status.publicUrl}
                    </span>
                    <Button variant="link" size="sm" asChild>
                      <a href={status.publicUrl} target="_blank" rel="noreferrer">
                        فتح اللوحة
                        <ExternalLink size={12} />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">غير متاح من حالة المحرك</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>رابط الاتصال الداخلي (POCKETBASE_URL)</label>
                <Input
                  dir="ltr"
                  className="font-mono"
                  value={internalUrl}
                  onChange={(e) => setInternalUrl(e.target.value)}
                  placeholder="http://127.0.0.1:8090"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  عنوان الاتصال المحلي الداخلي بين سيرفر Next.js ومحرك PocketBase على نفس السيرفر.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 size={18} />
                  دخول Google OAuth 2.0 الموحد
                </CardTitle>
                <CardDescription>تسجيل دخول العملاء والشركاء بنقرة واحدة عبر حساب جوجل</CardDescription>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={googleEnabled}
                  onChange={(e) => setGoogleEnabled(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                تفعيل الدخول عبر Google
              </label>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles size={14} />
                    روابط إعادة التوجيه المطلوبة في Google Cloud Console
                  </p>
                  <Button variant="outline" size="xs" asChild>
                    <a href={GOOGLE_CONSOLE_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={11} />
                      Google Console
                    </a>
                  </Button>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Authorized JavaScript Origins
                </p>
                {JS_ORIGINS.map((uri) => (
                  <CopyableUri key={uri} value={uri} copyLabel="نسخ" copiedLabel="تم النسخ!" />
                ))}
                <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Authorized Redirect URIs
                </p>
                {redirectUris.map((uri) => (
                  <CopyableUri key={uri} value={uri} copyLabel="نسخ" copiedLabel="تم النسخ!" />
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Google Client ID</label>
                  <Input
                    dir="ltr"
                    className="font-mono"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder={status?.googleClientIdMasked || "xxxx.apps.googleusercontent.com"}
                  />
                </div>
                <div>
                  <label className={labelClass}>Google Client Secret</label>
                  <div className="relative">
                    <Input
                      dir="ltr"
                      className="pe-12 font-mono"
                      type={showSecret ? "text" : "password"}
                      value={googleSecret}
                      onChange={(e) => setGoogleSecret(e.target.value)}
                      placeholder={
                        status?.googleSecretConfigured
                          ? "•••••••••••••••••••••••• (مضبوط بالفعل)"
                          : "GOCSPX-…"
                      }
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((v) => !v)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={() => void save()} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                حفظ وتطبيق إعدادات الربط
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck size={18} />
                حساب المشرف الفائق (Superuser)
              </CardTitle>
              <CardDescription>إدارة بريد وكلمة مرور مدير قاعدة البيانات الكاملة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={labelClass}>البريد الإلكتروني الحالي</label>
                <Input
                  dir="ltr"
                  type="email"
                  className="bg-muted font-mono"
                  value={currentAdminEmail}
                  readOnly
                  placeholder={status?.adminEmailMasked || "غير مضبوط"}
                />
              </div>
              <div>
                <label className={labelClass}>تحديث بريد المشرف (اختياري)</label>
                <Input
                  dir="ltr"
                  type="email"
                  className="font-mono"
                  value={newSuperuserEmail}
                  onChange={(e) => setNewSuperuserEmail(e.target.value)}
                  placeholder={currentAdminEmail || "admin@lonaliza.com"}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className={labelClass}>كلمة مرور جديدة (8 خانات على الأقل)</label>
                <div className="relative">
                  <Input
                    dir="ltr"
                    className="pe-12 font-mono"
                    type={showPassword ? "text" : "password"}
                    value={newSuperuserPassword}
                    onChange={(e) => setNewSuperuserPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>تأكيد كلمة المرور الجديدة</label>
                <Input
                  dir="ltr"
                  type={showPassword ? "text" : "password"}
                  className="font-mono"
                  value={confirmSuperuserPassword}
                  onChange={(e) => setConfirmSuperuserPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button" className="w-full" onClick={() => void saveSuperuser()} disabled={savingSuperuser}>
                {savingSuperuser ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                تحديث بيانات المشرف الفائق
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <KeyRound size={14} />
                أمان ومزامنة الجلسات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                تُشفَّر جلسات الدخول في ملف <span className="font-mono font-semibold">.env.local</span> على السيرفر، مع التحقق المستمر من التوكن وشهادات SSL لدومين{" "}
                <span className="font-mono font-semibold">pocketbase.lonaliza.com</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}
