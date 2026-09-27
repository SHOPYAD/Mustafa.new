"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ImagePlus, Loader2, Lock, RotateCcw, Save, Wifi, X } from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  COMING_SOON_LOCKED_AR,
  PROVIDER_MODES,
  providerModeLabel,
  type CatalogProvider,
  type ProviderClientState,
  type ProviderFieldDef,
  type ProviderMode,
} from "@/lib/providers/types";

const inputClass =
  "w-full px-3 py-2 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-btn-secondary-border/40 text-sm";

function categoryBadge(category: CatalogProvider["category"]): { label: string; className: string } {
  switch (category) {
    case "gds":
      return { label: "حي / GDS", className: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-100" };
    case "scraper":
      return { label: "سكرابر", className: "border-[var(--admin-accent)]/30 bg-primary/10 text-[var(--admin-btn-primary-hover)] dark:text-admin-bg-subtle" };
    case "affiliate":
      return { label: "عمولة", className: "border-admin-btn-secondary-border/30 bg-secondary/10 text-admin-btn-secondary-hover dark:text-muted-foreground" };
    default: {
      const _never: never = category;
      return { label: String(_never), className: "" };
    }
  }
}

function resolveLogoSrc(provider: CatalogProvider, customLogo?: string | null): string {
  const custom = customLogo?.trim() || "";
  if (custom) return custom;
  return provider.logo || "";
}

function ProviderLogoButton({
  provider,
  customLogo,
  locked,
  onClick,
}: {
  provider: CatalogProvider;
  customLogo?: string | null;
  locked?: boolean;
  onClick: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const src = resolveLogoSrc(provider, customLogo);
  const initials = provider.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <button
      type="button"
      onClick={onClick}
      title="تغيير الشعار"
      className={cn(
        'group relative size-12 shrink-0 rounded-xl border border-border bg-card overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-border/50',
        locked && "opacity-80"
      )}
    >
      {failed || !src ? (
        <span className="flex size-full items-center justify-center bg-muted text-xs font-bold tracking-wide text-foreground">
          {initials}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="size-full object-contain p-1.5"
          onError={() => setFailed(true)}
        />
      )}
      <span className='absolute inset-0 flex items-center justify-center bg-foreground/5 text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
        <ImagePlus size={16} />
      </span>
    </button>
  );
}

function LogoDialog({
  open,
  provider,
  currentCustom,
  busy,
  onClose,
  onSaveUrl,
  onUpload,
  onReset,
}: {
  open: boolean;
  provider: CatalogProvider;
  currentCustom?: string | null;
  busy: boolean;
  onClose: () => void;
  onSaveUrl: (url: string) => void;
  onUpload: (file: File) => void;
  onReset: () => void;
}) {
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(currentCustom || "");
  const [preview, setPreview] = useState(currentCustom || provider.logo);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) return;
    setUrl(currentCustom || "");
    setPreview(currentCustom || provider.logo);
    setLocalError("");
  }, [open, currentCustom, provider.logo]);

  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-foreground/5 p-4'
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 id={titleId} className="text-sm font-bold text-foreground">
              تغيير شعار {provider.nameAr}
            </h4>
            <p className="mt-1 text-[11px] text-muted-foreground">
              ارفعوا صورة (png / svg / webp / jpg) أو الصقوا رابطاً صحيحاً.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex justify-center">
          <div className='size-20 rounded-2xl border border-border bg-card p-2'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview || provider.logo} alt="" className="size-full object-contain" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">رابط الشعار</label>
          <input
            className={inputClass}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (e.target.value.trim()) setPreview(e.target.value.trim());
            }}
            placeholder="https://… أو /providers/…"
            autoComplete="off"
            name="provider-logo-url"
            dir="ltr"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > 2 * 1024 * 1024) {
                setLocalError("حجم الملف أكبر من 2MB");
                return;
              }
              setLocalError("");
              setPreview(URL.createObjectURL(file));
              onUpload(file);
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            رفع من الجهاز
          </button>
          <button
            type="button"
            disabled={busy || !currentCustom}
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold disabled:opacity-40"
          >
            <RotateCcw size={14} />
            إعادة الافتراضي
          </button>
        </div>

        {localError ? <p className="text-xs text-rose-400">{localError}</p> : null}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-xl border border-border px-3 py-2 text-xs font-semibold"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={busy || !url.trim()}
            onClick={() => onSaveUrl(url.trim())}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            حفظ الرابط
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProviderCard({
  provider,
  state,
  busy,
  message,
  extra,
  onToggle,
  onSave,
  onTest,
  onModeChange,
  onLogoSave,
  onLogoUpload,
  onLogoReset,
}: {
  provider: CatalogProvider;
  state: ProviderClientState;
  busy?: "save" | "test" | "toggle" | "mode" | "logo" | null;
  message?: string | null;
  extra?: ReactNode;
  onToggle: (enabled: boolean) => void;
  onSave: (fields: Record<string, string>) => void;
  onTest: () => void;
  onModeChange: (mode: ProviderMode) => void;
  onLogoSave: (url: string) => void;
  onLogoUpload: (file: File) => void;
  onLogoReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(state.fields);

  useEffect(() => {
    setDraft(state.fields);
  }, [state.fields]);

  const cat = categoryBadge(provider.category);
  const comingSoon = provider.integration === "coming_soon";
  const mode = state.mode || "sandbox";

  useEffect(() => {
    if (comingSoon && open) setOpen(false);
  }, [comingSoon, open]);

  return (
    <>
      <Card className={cn("overflow-hidden", comingSoon && "opacity-90")}>
        <CardContent className="px-4 py-4 space-y-3">
          <div className="flex items-start gap-3">
            <ProviderLogoButton
              provider={provider}
              customLogo={state.customLogo}
              locked={comingSoon}
              onClick={() => setLogoOpen(true)}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-foreground leading-tight">{provider.nameAr}</h3>
                <span className="text-[11px] text-muted-foreground" dir="ltr">
                  {provider.name}
                </span>
                {comingSoon ? <Lock size={12} className="text-orange-500" aria-hidden /> : null}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge variant="outline" className={cat.className}>
                  {cat.label}
                </Badge>
                {comingSoon ? (
                  <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-800 dark:text-orange-100">
                    قريباً
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100">
                    حي
                  </Badge>
                )}
                {state.connected ? (
                  <Badge variant="outline" className="border-teal-500/30 bg-teal-500/10 text-teal-800 dark:text-teal-100">
                    متصل
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{provider.noteAr}</p>
            </div>
            <div className="shrink-0">
              <AdminSwitch
                checked={comingSoon ? false : state.enabled}
                onChange={onToggle}
                label={comingSoon ? "مقفل" : state.enabled ? "مفعّل" : "متوقف"}
                disabled={comingSoon || busy === "toggle"}
              />
            </div>
          </div>

          <div
            className={cn(
              "inline-flex rounded-xl border border-border p-0.5",
              comingSoon && "opacity-50 pointer-events-none"
            )}
            role="group"
            aria-label="وضع المزود"
            aria-disabled={comingSoon}
          >
            {PROVIDER_MODES.map((item) => (
              <button
                key={item}
                type="button"
                disabled={comingSoon || busy === "mode"}
                onClick={() => onModeChange(item)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                  mode === item
                    ? 'bg-secondary text-foreground'
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {providerModeLabel(item)}
              </button>
            ))}
          </div>

          {comingSoon ? (
            <p className="text-[11px] leading-relaxed text-orange-800/90 dark:text-orange-100/90 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
              {COMING_SOON_LOCKED_AR}. يمكن تغيير الشعار فقط.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold"
              >
                <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
                إعدادات
              </button>
              <button
                type="button"
                onClick={onTest}
                disabled={busy === "test"}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold disabled:opacity-60"
              >
                {busy === "test" ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                اختبار
              </button>
              <button
                type="button"
                onClick={() => onSave(draft)}
                disabled={busy === "save"}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-60"
              >
                {busy === "save" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                حفظ
              </button>
            </div>
          )}

          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}

          {!comingSoon && open ? (
            <div className="space-y-3 border-t border-border pt-3">
              {provider.fields.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا مفاتيح خارجية — المصدر محلي.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {provider.fields.map((field) => (
                    <FieldInput
                      key={field.key}
                      field={field}
                      value={draft[field.key] || ""}
                      onChange={(value) => setDraft((prev) => ({ ...prev, [field.key]: value }))}
                    />
                  ))}
                </div>
              )}
              {provider.docsUrl ? (
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className='text-xs text-admin-btn-secondary-hover dark:text-secondary underline'
                  dir="ltr"
                >
                  {provider.docsUrl}
                </a>
              ) : null}
              {extra}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <LogoDialog
        open={logoOpen}
        provider={provider}
        currentCustom={state.customLogo}
        busy={busy === "logo"}
        onClose={() => setLogoOpen(false)}
        onSaveUrl={(logoUrl) => {
          onLogoSave(logoUrl);
          setLogoOpen(false);
        }}
        onUpload={(file) => {
          onLogoUpload(file);
          setLogoOpen(false);
        }}
        onReset={() => {
          onLogoReset();
          setLogoOpen(false);
        }}
      />
    </>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ProviderFieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={field.key === "embedScript" || field.key === "cookieScript" || field.key === "flags" ? "sm:col-span-2" : ""}>
      <label className="block text-[11px] text-muted-foreground mb-1">
        {field.labelAr}
        {field.required ? <span className="text-red-400"> *</span> : null}
      </label>
      <p className="text-[11px] text-muted-foreground/80 mb-1.5 leading-snug">{field.hintAr}</p>
      <input
        type={field.kind === "password" ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={field.placeholder}
        autoComplete="off"
        dir="ltr"
      />
    </div>
  );
}
