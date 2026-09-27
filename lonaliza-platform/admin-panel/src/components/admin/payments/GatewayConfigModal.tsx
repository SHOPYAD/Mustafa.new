"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Check,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Save,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Globe,
  Radio,
} from "lucide-react";
import type { CatalogEntry } from "@/lib/gateways/catalog";

interface GatewayConfigModalProps {
  gateway: CatalogEntry;
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedConfig: Record<string, unknown>) => void;
  initialConfig?: {
    enabled?: boolean;
    testMode?: boolean;
    credentials?: Record<string, string>;
  };
}

export default function GatewayConfigModal({
  gateway,
  tenantId,
  isOpen,
  onClose,
  onSaved,
  initialConfig,
}: GatewayConfigModalProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [testMode, setTestMode] = useState<boolean>(true);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string>("");

  // Testing state
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  // Saving state
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setCredentials(initialConfig?.credentials || {});
      setTestMode(initialConfig?.testMode ?? true);
      setEnabled(initialConfig?.enabled ?? false);
      setTestResult(null);
      setSavedSuccess(false);
      setErrorMessage("");
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://lonaliza.com";
  const webhookUrl = `${origin}/api/payments/${gateway.kind}/webhook`;
  const callbackUrl = `${origin}/api/payments/${gateway.kind}/callback`;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setErrorMessage("");
    try {
      const res = await fetch("/api/admin/payments/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          kind: gateway.kind,
          credentials,
          testMode,
        }),
      });
      const data = await res.json();
      setTestResult({
        ok: Boolean(data.ok),
        message: data.message || (data.ok ? "الاتصال سليم 100%" : "فشل التحقق من الاتصال"),
        latencyMs: data.latencyMs,
      });
    } catch (err: unknown) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : "فشل إرسال طلب فحص الاتصال",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/payments/configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          kind: gateway.kind,
          enabled,
          testMode,
          credentials,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "فشل حفظ الإعدادات");
      }

      setSavedSuccess(true);
      onSaved(data.config || {});
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const toggleShowSecret = (fieldKey: string) => {
    setShowSecrets((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const logoSrc = gateway.marketing?.logoPath
    ? `/payment-gateways/${gateway.marketing.logoPath}`
    : `/payment-gateways/${gateway.kind}.svg`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3.5">
            <div className="relative size-12 rounded-2xl bg-white p-2 shadow-xs border border-border/60 flex items-center justify-center shrink-0">
              <Image
                src={logoSrc}
                alt={gateway.displayName}
                width={40}
                height={40}
                className="max-h-full max-w-full object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-foreground">
                  {gateway.marketing?.brandLabel || gateway.displayName}
                </h2>
                {gateway.kind === "iyzico" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    الافتراضية للنظام ⭐
                  </span>
                )}
                {gateway.region && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {gateway.region.icon} {gateway.region.nameAr}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {gateway.marketing?.description || "تكوين إعدادات الربط المالي والمفاتيح المشفرة"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-xl border border-border/60 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Mode Switchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-border/70 bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">تفعيل البوابة</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                عند التفعيل، يمكن للعملاء اختيار هذه البوابة للدفع مباشرة.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-border/70 bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">بيئة العمل (Mode)</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${testMode ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"}`}>
                  {testMode ? "تجريبي (Sandbox)" : "إنتاج حي (Live)"}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTestMode(true)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    testMode
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setTestMode(false)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    !testMode
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Live Production
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Configuration Fields */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" />
              <span>مفاتيح وبيانات الربط المشفرة (AES-256-GCM)</span>
            </h3>

            <div className="space-y-3.5">
              {gateway.configFields.map((field) => {
                const isSecret = field.secret;
                const showSecret = showSecrets[field.key];
                const value = credentials[field.key] ?? "";

                return (
                  <div key={field.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        {field.label}
                        {field.required && <span className="text-rose-500 ms-1">*</span>}
                      </label>
                      {field.helpText && (
                        <span className="text-[10px] text-muted-foreground/80">
                          {field.helpText}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type={isSecret && !showSecret ? "password" : "text"}
                        value={value}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        placeholder={field.placeholder || `أدخل ${field.label}`}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs sm:text-sm font-mono transition-all"
                      />

                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleShowSecret(field.key)}
                          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
                        >
                          {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Webhook & Callback URLs */}
          <div className="p-4 rounded-2xl border border-border/80 bg-muted/15 space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe size={14} className="text-primary" />
              <span>عناوين الويب هوك والإشعار التلقائي (Webhook & Callback)</span>
            </h4>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">Webhook URL:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-[11px] font-mono text-muted-foreground select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookUrl, "webhook")}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold text-foreground inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedKey === "webhook" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedKey === "webhook" ? "تم النسخ" : "نسخ"}</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">Callback / Return URL:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={callbackUrl}
                    className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-[11px] font-mono text-muted-foreground select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(callbackUrl, "callback")}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold text-foreground inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedKey === "callback" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedKey === "callback" ? "تم النسخ" : "نسخ"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test Result Alert */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-2.5 animate-in fade-in ${
                testResult.ok
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
              }`}
            >
              {testResult.ok ? (
                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p>{testResult.message}</p>
                {testResult.latencyMs !== undefined && (
                  <p className="text-[10px] opacity-80 font-mono">
                    سرعة الاستجابة: {testResult.latencyMs}ms
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check size={16} className="text-emerald-500 shrink-0" />
              <span>تم حفظ الإعدادات وتشفيرها بنجاح فوري دون أي ريفريش!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              <span>{testing ? "جاري الفحص الحي..." : "اختبار الاتصال المباشر"}</span>
            </button>

            {gateway.marketing?.docsUrl && (
              <a
                href={gateway.marketing.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>توثيق المزود</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={(e) => void handleSave(e)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:brightness-110 text-white text-xs sm:text-sm font-black shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin text-white" />
              ) : savedSuccess ? (
                <Check size={15} className="text-white" />
              ) : (
                <Save size={15} className="text-white" />
              )}
              <span className="text-white">
                {saving ? "جاري الحفظ..." : savedSuccess ? "تم الحفظ بنجاح!" : "حفظ فوري"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
