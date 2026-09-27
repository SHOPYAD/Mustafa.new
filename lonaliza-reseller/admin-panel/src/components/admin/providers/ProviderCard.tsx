"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, RotateCcw, Save, Wifi, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSegment } from "@/components/admin/ui/AdminSegment";
import {
  COMING_SOON_LOCKED_AR,
  PROVIDER_MODES,
  providerModeLabel,
  type CatalogProvider,
  type ProviderClientState,
  type ProviderFieldDef,
  type ProviderMode,
} from "@/lib/providers/types";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const inputClass = "admin-field";

export function categoryBadge(category: CatalogProvider["category"]): { label: string; className: string } {
  switch (category) {
    case "gds":
      return { label: "حي / GDS", className: "admin-chip" };
    case "scraper":
      return { label: "سكرابر", className: "admin-chip" };
    case "affiliate":
      return { label: "عمولة", className: "admin-chip" };
    default: {
      const _never: never = category;
      return { label: String(_never), className: "admin-chip" };
    }
  }
}

function resolveLogoSrc(provider: CatalogProvider, customLogo?: string | null): string {
  const custom = customLogo?.trim() || "";
  if (custom) return custom;
  return provider.logo || "";
}

export function ProviderLogoButton({
  provider,
  customLogo,
  locked,
  onClick,
  compact,
}: {
  provider: CatalogProvider;
  customLogo?: string | null;
  locked?: boolean;
  onClick: () => void;
  compact?: boolean;
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
        "group relative shrink-0 overflow-hidden rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)]",
        compact ? "size-9" : "size-12",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
        locked && "opacity-80"
      )}
    >
      {failed || !src ? (
        <span className="flex size-full items-center justify-center text-[10px] font-bold tracking-wide text-[color:var(--admin-text-primary)]">
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
      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <ImagePlus size={14} />
      </span>
    </button>
  );
}

export function LogoDialog({
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

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <DialogContent className="sm:max-w-md space-y-4" showCloseButton={false} aria-labelledby={titleId}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 id={titleId} className="text-sm font-bold">
              تغيير شعار {provider.nameAr}
            </h4>
            <p className="mt-1 text-[11px] text-[color:var(--admin-text-muted)]">
              ارفعوا صورة (png / svg / webp / jpg) أو الصقوا رابطاً صحيحاً.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="admin-btn-secondary px-2 py-1.5"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex justify-center">
          <div className="size-20 rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview || provider.logo} alt="" className="size-full object-contain" />
          </div>
        </div>

        <div>
          <label className="admin-field-label">رابط الشعار</label>
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
            className="admin-btn-secondary"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            رفع من الجهاز
          </button>
          <button
            type="button"
            disabled={busy || !currentCustom}
            onClick={onReset}
            className="admin-btn-secondary disabled:opacity-40"
          >
            <RotateCcw size={14} />
            إعادة الافتراضي
          </button>
        </div>

        {localError ? <p className="text-xs text-rose-500">{localError}</p> : null}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[color:var(--admin-border-subtle)] pt-3">
          <button type="button" disabled={busy} onClick={onClose} className="admin-btn-secondary">
            إلغاء
          </button>
          <button
            type="button"
            disabled={busy || !url.trim()}
            onClick={() => onSaveUrl(url.trim())}
            className="admin-btn-primary disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            حفظ الرابط
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProviderSettingsSheet({
  open,
  provider,
  state,
  busy,
  message,
  onClose,
  onSave,
  onTest,
  onModeChange,
}: {
  open: boolean;
  provider: CatalogProvider;
  state: ProviderClientState;
  busy?: "save" | "test" | "toggle" | "mode" | "logo" | null;
  message?: string | null;
  onClose: () => void;
  onSave: (fields: Record<string, string>) => void;
  onTest: () => void;
  onModeChange: (mode: ProviderMode) => void;
}) {
  const titleId = useId();
  const [draft, setDraft] = useState<Record<string, string>>(state.fields);
  const comingSoon = provider.integration === "coming_soon";
  const mode = state.mode || "sandbox";

  useEffect(() => {
    if (!open) return;
    setDraft(state.fields);
  }, [open, state.fields]);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && busy !== "save") onClose(); }}>
      <DialogContent className="sm:max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto" showCloseButton={false} aria-labelledby={titleId}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 id={titleId} className="text-sm font-bold">
              إعدادات {provider.nameAr}
            </h4>
            <p className="mt-1 text-[11px] text-[color:var(--admin-text-muted)]" dir="ltr">
              {provider.name}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[color:var(--admin-text-muted)]">
              {provider.noteAr}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-btn-secondary px-2 py-1.5" aria-label="إغلاق">
            <X size={16} />
          </button>
        </div>

        <AdminSegment
          aria-label="وضع المزود"
          value={mode}
          disabled={comingSoon || busy === "mode"}
          options={PROVIDER_MODES.map((item) => ({
            value: item,
            label: providerModeLabel(item),
          }))}
          onChange={onModeChange}
        />

        {comingSoon ? (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-[color:var(--admin-text-primary)]">
            {COMING_SOON_LOCKED_AR}. يمكن تغيير الشعار فقط.
          </p>
        ) : provider.fields.length === 0 ? (
          <p className="text-xs text-[color:var(--admin-text-muted)]">لا مفاتيح خارجية — المصدر محلي.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
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
            className="text-xs text-amber-700 underline dark:text-amber-300"
            dir="ltr"
          >
            {provider.docsUrl}
          </a>
        ) : null}

        {message ? <p className="text-xs text-[color:var(--admin-text-muted)]">{message}</p> : null}

        {!comingSoon ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-[color:var(--admin-border-subtle)] pt-3">
            <button type="button" onClick={onClose} className="admin-btn-secondary">
              إغلاق
            </button>
            <button
              type="button"
              onClick={onTest}
              disabled={busy === "test"}
              className="admin-btn-secondary disabled:opacity-60"
            >
              {busy === "test" ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
              اختبار
            </button>
            <button
              type="button"
              onClick={() => onSave(draft)}
              disabled={busy === "save"}
              className="admin-btn-primary disabled:opacity-60"
            >
              {busy === "save" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              حفظ
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
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
