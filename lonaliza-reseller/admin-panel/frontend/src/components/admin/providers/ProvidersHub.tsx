"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Settings2, Wifi } from "lucide-react";
import { AdminSettingsSections } from "@/components/admin/layout/AdminSettingsSections";
import AdminSwitch from "@/components/admin/AdminSwitch";
import {
  categoryBadge,
  LogoDialog,
  ProviderLogoButton,
  ProviderSettingsSheet,
} from "@/components/admin/providers/ProviderCard";
import { cn } from "@/lib/utils";
import { AdminSegment } from "@/components/admin/ui/AdminSegment";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PROVIDER_CATEGORIES,
  PROVIDER_MODES,
  PROVIDER_VERTICALS,
  type CatalogProvider,
  type CatalogProviderId,
  type ProviderCategory,
  type ProviderClientState,
  type ProviderMode,
  type ProviderVertical,
  providerCategoryHint,
  providerCategoryLabel,
  providerModeLabel,
  providerVerticalLabel,
} from "@/lib/providers/types";

type HubResponse = {
  ok: boolean;
  catalog: CatalogProvider[];
  states: Record<CatalogProviderId, ProviderClientState>;
  error?: string;
};

type BusyKind = "save" | "test" | "toggle" | "mode" | "logo";

const emptyStates = {} as Record<CatalogProviderId, ProviderClientState>;

export default function ProvidersHub({
  vertical,
  onLiveChange,
}: {
  vertical?: ProviderVertical;
  onLiveChange?: () => void;
}) {
  const [tab, setTab] = useState<ProviderVertical>(vertical || "flights");
  const [catalog, setCatalog] = useState<CatalogProvider[]>([]);
  const [states, setStates] = useState<Record<CatalogProviderId, ProviderClientState>>(emptyStates);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Partial<Record<CatalogProviderId, BusyKind>>>({});
  const [messages, setMessages] = useState<Partial<Record<CatalogProviderId, string>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/providers", { cache: "no-store" });
      const data = (await res.json()) as HubResponse;
      if (data?.ok) {
        setCatalog(data.catalog);
        setStates(data.states);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeVertical = vertical || tab;

  const grouped = useMemo(() => {
    const items = catalog.filter((item) => item.vertical === activeVertical);
    return PROVIDER_CATEGORIES.map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0);
  }, [catalog, activeVertical]);

  const patchState = (id: CatalogProviderId, next: Partial<ProviderClientState>) => {
    setStates((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...next } as ProviderClientState,
    }));
  };

  const runToggle = async (provider: CatalogProvider, enabled: boolean) => {
    if (provider.integration === "coming_soon") return;
    setBusy((prev) => ({ ...prev, [provider.id]: "toggle" }));
    setMessages((prev) => ({ ...prev, [provider.id]: undefined }));
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: provider.id, enabled }),
      });
      const data = await res.json();
      if (data?.ok && data.state) {
        patchState(provider.id, data.state);
        if (provider.integration === "live") onLiveChange?.();
        await load();
        return;
      }
      setMessages((prev) => ({ ...prev, [provider.id]: data?.error || "فشل التفعيل" }));
    } catch {
      setMessages((prev) => ({ ...prev, [provider.id]: "فشل التفعيل" }));
    } finally {
      setBusy((prev) => ({ ...prev, [provider.id]: undefined }));
    }
  };

  const runSave = async (provider: CatalogProvider, fields: Record<string, string>) => {
    if (provider.integration === "coming_soon") return;
    setBusy((prev) => ({ ...prev, [provider.id]: "save" }));
    setMessages((prev) => ({ ...prev, [provider.id]: undefined }));
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: provider.id, fields }),
      });
      const data = await res.json();
      if (data?.ok && data.state) {
        patchState(provider.id, data.state);
        setMessages((prev) => ({ ...prev, [provider.id]: "تم حفظ الإعدادات" }));
        if (provider.integration === "live") onLiveChange?.();
        return;
      }
      setMessages((prev) => ({ ...prev, [provider.id]: data?.error || "فشل الحفظ" }));
    } catch {
      setMessages((prev) => ({ ...prev, [provider.id]: "فشل الحفظ" }));
    } finally {
      setBusy((prev) => ({ ...prev, [provider.id]: undefined }));
    }
  };

  const runTest = async (provider: CatalogProvider) => {
    if (provider.integration === "coming_soon") return;
    setBusy((prev) => ({ ...prev, [provider.id]: "test" }));
    setMessages((prev) => ({ ...prev, [provider.id]: undefined }));
    try {
      const res = await fetch("/api/admin/providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: provider.id }),
      });
      const data = await res.json();
      setMessages((prev) => ({
        ...prev,
        [provider.id]: data?.result?.message || data?.error || "تعذّر الاختبار",
      }));
    } catch {
      setMessages((prev) => ({ ...prev, [provider.id]: "تعذّر الاختبار" }));
    } finally {
      setBusy((prev) => ({ ...prev, [provider.id]: undefined }));
    }
  };

  const runMode = async (provider: CatalogProvider, mode: ProviderMode) => {
    if (provider.integration === "coming_soon") return;
    setBusy((prev) => ({ ...prev, [provider.id]: "mode" }));
    setMessages((prev) => ({ ...prev, [provider.id]: undefined }));
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: provider.id, mode }),
      });
      const data = await res.json();
      if (data?.ok && data.state) {
        patchState(provider.id, data.state);
        setMessages((prev) => ({
          ...prev,
          [provider.id]: mode === "sandbox" ? "تم ضبط الوضع التجريبي" : "تم ضبط وضع الإنتاج",
        }));
        return;
      }
      setMessages((prev) => ({ ...prev, [provider.id]: data?.error || "فشل حفظ الوضع" }));
    } catch {
      setMessages((prev) => ({ ...prev, [provider.id]: "فشل حفظ الوضع" }));
    } finally {
      setBusy((prev) => ({ ...prev, [provider.id]: undefined }));
    }
  };

  const runLogoUrl = async (provider: CatalogProvider, customLogo: string) => {
    setBusy((prev) => ({ ...prev, [provider.id]: "logo" }));
    setMessages((prev) => ({ ...prev, [provider.id]: undefined }));
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: provider.id, customLogo }),
      });
      const data = await res.json();
      if (data?.ok && data.state) {
        patchState(provider.id, data.state);
        setMessages((prev) => ({ ...prev, [provider.id]: "تم حفظ الشعار" }));
        return;
      }
      setMessages((prev) => ({ ...prev, [provider.id]: data?.error || "فشل حفظ الشعار" }));
    } catch {
      setMessages((prev) => ({ ...prev, [provider.id]: "فشل حفظ الشعار" }));
    } finally {
      setBusy((prev) => ({ ...prev, [provider.id]: undefined }));
    }
  };

  const runLogoUpload = async (provider: CatalogProvider, file: File) => {
    setBusy((prev) => ({ ...prev, [provider.id]: "logo" }));
    setMessages((prev) => ({ ...prev, [provider.id]: undefined }));
    try {
      const form = new FormData();
      form.set("id", provider.id);
      form.set("file", file);
      const res = await fetch("/api/admin/providers/logo", { method: "POST", body: form });
      const data = await res.json();
      if (data?.ok) {
        if (typeof data.customLogo === "string" && data.customLogo) {
          patchState(provider.id, { customLogo: data.customLogo });
        }
        await load();
        setMessages((prev) => ({ ...prev, [provider.id]: "تم رفع الشعار" }));
        return;
      }
      setMessages((prev) => ({ ...prev, [provider.id]: data?.error || "فشل رفع الشعار" }));
    } catch {
      setMessages((prev) => ({ ...prev, [provider.id]: "فشل رفع الشعار" }));
    } finally {
      setBusy((prev) => ({ ...prev, [provider.id]: undefined }));
    }
  };

  const runLogoReset = async (provider: CatalogProvider) => {
    setBusy((prev) => ({ ...prev, [provider.id]: "logo" }));
    setMessages((prev) => ({ ...prev, [provider.id]: undefined }));
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: provider.id, resetLogo: true }),
      });
      const data = await res.json();
      if (data?.ok && data.state) {
        patchState(provider.id, data.state);
        setMessages((prev) => ({ ...prev, [provider.id]: "تمت إعادة الشعار الافتراضي" }));
        return;
      }
      setMessages((prev) => ({ ...prev, [provider.id]: data?.error || "فشل إعادة الشعار" }));
    } catch {
      setMessages((prev) => ({ ...prev, [provider.id]: "فشل إعادة الشعار" }));
    } finally {
      setBusy((prev) => ({ ...prev, [provider.id]: undefined }));
    }
  };

  const body = loading ? (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Loader2 size={16} className="animate-spin" />
      جاري تحميل مكتب الموصلات...
    </div>
  ) : (
    <div className="space-y-8">
      {grouped.map((group) => (
        <CategoryBlock
          key={group.category}
          category={group.category}
          items={group.items}
          states={states}
          busy={busy}
          messages={messages}
          onToggle={runToggle}
          onSave={runSave}
          onTest={runTest}
          onModeChange={runMode}
          onLogoSave={runLogoUrl}
          onLogoUpload={runLogoUpload}
          onLogoReset={runLogoReset}
        />
      ))}
    </div>
  );

  if (vertical) {
    return <div className="mb-8">{body}</div>;
  }

  return (
    <AdminSettingsSections
      title="مزودو البحث والحجز"
      description="مكتب موصلات: صف لكل مزود، والإعدادات في لوحة. الجديد مقفول بشارة «قريباً» — يمكن تغيير الشعار فقط حتى يكتمل التكامل."
      items={PROVIDER_VERTICALS.map((id) => ({
        id,
        label: providerVerticalLabel(id),
      }))}
      activeId={tab}
      onChange={(id) => setTab(id as ProviderVertical)}
    >
      {body}
    </AdminSettingsSections>
  );
}

function fallbackState(provider: CatalogProvider): ProviderClientState {
  return {
    id: provider.id,
    enabled: false,
    ready: false,
    connected: false,
    mode: "sandbox",
    customLogo: null,
    fields: {},
    integration: provider.integration,
  };
}

function statusLabel(provider: CatalogProvider, state: ProviderClientState): string {
  if (provider.integration === "coming_soon") return "قريباً";
  if (state.connected) return "متصل";
  if (state.enabled) return "مفعّل";
  return "متوقف";
}

function CategoryBlock({
  category,
  items,
  states,
  busy,
  messages,
  onToggle,
  onSave,
  onTest,
  onModeChange,
  onLogoSave,
  onLogoUpload,
  onLogoReset,
}: {
  category: ProviderCategory;
  items: CatalogProvider[];
  states: Record<CatalogProviderId, ProviderClientState>;
  busy: Partial<Record<CatalogProviderId, BusyKind>>;
  messages: Partial<Record<CatalogProviderId, string>>;
  onToggle: (provider: CatalogProvider, enabled: boolean) => void;
  onSave: (provider: CatalogProvider, fields: Record<string, string>) => void;
  onTest: (provider: CatalogProvider) => void;
  onModeChange: (provider: CatalogProvider, mode: ProviderMode) => void;
  onLogoSave: (provider: CatalogProvider, url: string) => void;
  onLogoUpload: (provider: CatalogProvider, file: File) => void;
  onLogoReset: (provider: CatalogProvider) => void;
}) {
  const [sheetId, setSheetId] = useState<CatalogProviderId | null>(null);
  const [logoId, setLogoId] = useState<CatalogProviderId | null>(null);
  const sheetProvider = items.find((item) => item.id === sheetId) || null;
  const logoProvider = items.find((item) => item.id === logoId) || null;

  return (
    <Card className="space-y-3 p-4">
      <div>
        <CardTitle className="admin-section-title">{providerCategoryLabel(category)}</CardTitle>
        <p className="text-xs text-[color:var(--admin-text-muted)]">{providerCategoryHint(category)}</p>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المزود</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الوضع</TableHead>
              <TableHead>التفعيل</TableHead>
              <TableHead>إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((provider) => {
              const state = states[provider.id] || fallbackState(provider);
              const comingSoon = provider.integration === "coming_soon";
              const cat = categoryBadge(provider.category);
              const mode = state.mode || "sandbox";
              return (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProviderLogoButton
                        provider={provider}
                        customLogo={state.customLogo}
                        locked={comingSoon}
                        compact
                        onClick={() => setLogoId(provider.id)}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold leading-tight">{provider.nameAr}</div>
                        <div className="text-[11px] text-[color:var(--admin-text-muted)]" dir="ltr">
                          {provider.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cat.className}>{cat.label}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{statusLabel(provider, state)}</div>
                    {messages[provider.id] ? (
                      <div className="mt-1 text-[11px] text-[color:var(--admin-text-muted)]">
                        {messages[provider.id]}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <AdminSegment
                      aria-label="وضع المزود"
                      value={mode}
                      disabled={comingSoon || busy[provider.id] === "mode"}
                      options={PROVIDER_MODES.map((item) => ({
                        value: item,
                        label: providerModeLabel(item),
                      }))}
                      onChange={(item) => onModeChange(provider, item)}
                    />
                  </TableCell>
                  <TableCell>
                    <AdminSwitch
                      compact
                      checked={comingSoon ? false : state.enabled}
                      onChange={(enabled) => onToggle(provider, enabled)}
                      label={comingSoon ? "مقفل" : state.enabled ? "مفعّل" : "متوقف"}
                      disabled={comingSoon || busy[provider.id] === "toggle"}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={comingSoon}
                        onClick={() => setSheetId(provider.id)}
                        className="admin-btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                      >
                        <Settings2 size={13} />
                        إعدادات
                      </button>
                      <button
                        type="button"
                        disabled={comingSoon || busy[provider.id] === "test"}
                        onClick={() => onTest(provider)}
                        className="admin-btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                      >
                        {busy[provider.id] === "test" ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Wifi size={13} />
                        )}
                        اختبار
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {items.map((provider) => {
          const state = states[provider.id] || fallbackState(provider);
          const comingSoon = provider.integration === "coming_soon";
          const cat = categoryBadge(provider.category);
          const mode = state.mode || "sandbox";
          return (
            <article key={provider.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <ProviderLogoButton
                  provider={provider}
                  customLogo={state.customLogo}
                  locked={comingSoon}
                  compact
                  onClick={() => setLogoId(provider.id)}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{provider.nameAr}</p>
                  <p className="text-[11px] text-[color:var(--admin-text-muted)]" dir="ltr">
                    {provider.name}
                  </p>
                </div>
                <AdminSwitch
                  compact
                  checked={comingSoon ? false : state.enabled}
                  onChange={(enabled) => onToggle(provider, enabled)}
                  label={comingSoon ? "مقفل" : state.enabled ? "مفعّل" : "متوقف"}
                  disabled={comingSoon || busy[provider.id] === "toggle"}
                />
              </div>
              <dl>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt>الفئة</dt>
                  <dd>{cat.label}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt>الحالة</dt>
                  <dd>{statusLabel(provider, state)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt>الوضع</dt>
                  <dd>
                    <AdminSegment
                      aria-label="وضع المزود"
                      value={mode}
                      disabled={comingSoon || busy[provider.id] === "mode"}
                      options={PROVIDER_MODES.map((item) => ({
                        value: item,
                        label: providerModeLabel(item),
                      }))}
                      onChange={(item) => onModeChange(provider, item)}
                    />
                  </dd>
                </div>
              </dl>
              {messages[provider.id] ? (
                <p className="text-[11px] text-[color:var(--admin-text-muted)]">{messages[provider.id]}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={comingSoon}
                  onClick={() => setSheetId(provider.id)}
                  className="admin-btn-secondary text-xs disabled:opacity-40"
                >
                  <Settings2 size={13} />
                  إعدادات
                </button>
                <button
                  type="button"
                  disabled={comingSoon || busy[provider.id] === "test"}
                  onClick={() => onTest(provider)}
                  className="admin-btn-secondary text-xs disabled:opacity-40"
                >
                  {busy[provider.id] === "test" ? <Loader2 size={13} className="animate-spin" /> : <Wifi size={13} />}
                  اختبار
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {sheetProvider ? (
        <ProviderSettingsSheet
          open
          provider={sheetProvider}
          state={states[sheetProvider.id] || fallbackState(sheetProvider)}
          busy={busy[sheetProvider.id] || null}
          message={messages[sheetProvider.id] || null}
          onClose={() => setSheetId(null)}
          onSave={(fields) => onSave(sheetProvider, fields)}
          onTest={() => onTest(sheetProvider)}
          onModeChange={(mode) => onModeChange(sheetProvider, mode)}
        />
      ) : null}

      {logoProvider ? (
        <LogoDialog
          open
          provider={logoProvider}
          currentCustom={(states[logoProvider.id] || fallbackState(logoProvider)).customLogo}
          busy={busy[logoProvider.id] === "logo"}
          onClose={() => setLogoId(null)}
          onSaveUrl={(url) => {
            onLogoSave(logoProvider, url);
            setLogoId(null);
          }}
          onUpload={(file) => {
            onLogoUpload(logoProvider, file);
            setLogoId(null);
          }}
          onReset={() => {
            onLogoReset(logoProvider);
            setLogoId(null);
          }}
        />
      ) : null}
    </Card>
  );
}
