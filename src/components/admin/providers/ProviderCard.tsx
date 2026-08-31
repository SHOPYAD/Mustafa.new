"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Loader2, Save, Wifi } from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  CatalogProvider,
  ProviderClientState,
  ProviderFieldDef,
} from "@/lib/providers/types";

const inputClass =
  "w-full px-3 py-2 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm";

function categoryBadge(category: CatalogProvider["category"]): { label: string; className: string } {
  switch (category) {
    case "gds":
      return { label: "حي / GDS", className: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-100" };
    case "scraper":
      return { label: "سكرابر", className: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-100" };
    case "affiliate":
      return { label: "عمولة", className: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-100" };
    default:
      return { label: category, className: "" };
  }
}

function ProviderLogo({ provider }: { provider: CatalogProvider }) {
  const [failed, setFailed] = useState(false);
  const initials = provider.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (failed || !provider.logo) {
    return (
      <div
        className="size-12 shrink-0 rounded-xl border border-border bg-muted flex items-center justify-center text-xs font-bold tracking-wide text-foreground"
        title={`${provider.name} — شعار كتابي (لم يُجلب ملف رسمي)`}
      >
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={provider.logo}
      alt=""
      className="size-12 shrink-0 rounded-xl border border-border bg-white object-contain p-1.5"
      onError={() => setFailed(true)}
    />
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
}: {
  provider: CatalogProvider;
  state: ProviderClientState;
  busy?: "save" | "test" | "toggle" | null;
  message?: string | null;
  extra?: ReactNode;
  onToggle: (enabled: boolean) => void;
  onSave: (fields: Record<string, string>) => void;
  onTest: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(state.fields);

  useEffect(() => {
    setDraft(state.fields);
  }, [state.fields]);

  const cat = categoryBadge(provider.category);
  const comingSoon = provider.integration === "coming_soon";

  return (
    <Card className="overflow-hidden">
      <CardContent className="px-4 py-4 space-y-3">
        <div className="flex items-start gap-3">
          <ProviderLogo provider={provider} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground leading-tight">{provider.nameAr}</h3>
              <span className="text-[11px] text-muted-foreground" dir="ltr">
                {provider.name}
              </span>
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
              checked={state.enabled}
              onChange={onToggle}
              label={state.enabled ? "مفعّل" : "متوقف"}
              disabled={busy === "toggle"}
            />
          </div>
        </div>

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

        {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}

        {open ? (
          <div className="space-y-3 border-t border-border pt-3">
            {comingSoon ? (
              <p className="text-xs text-amber-800 dark:text-amber-100 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                قريباً — يمكن حفظ المفاتيح الآن. التفعيل لا يشغّل الحجز الحي قبل التكامل الحقيقي.
              </p>
            ) : null}
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
                className="text-xs text-amber-700 dark:text-amber-300 underline"
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
