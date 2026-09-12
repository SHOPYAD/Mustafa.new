"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plug } from "lucide-react";
import { AdminSettingsSections } from "@/components/admin/layout/AdminSettingsSections";
import ProviderCard from "@/components/admin/providers/ProviderCard";
import {
  PROVIDER_CATEGORIES,
  PROVIDER_VERTICALS,
  type CatalogProvider,
  type CatalogProviderId,
  type ProviderCategory,
  type ProviderClientState,
  type ProviderMode,
  type ProviderVertical,
  providerCategoryHint,
  providerCategoryLabel,
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
      جاري تحميل بطاقات المزودين...
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
      description="بطاقات مستقلة لكل مزود. الجديد مقفول بشارة «قريباً» — يمكن تغيير الشعار فقط حتى يكتمل التكامل."
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
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Plug size={14} className="text-amber-500" />
          {providerCategoryLabel(category)}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{providerCategoryHint(category)}</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((provider) => {
          const state = states[provider.id] || {
            id: provider.id,
            enabled: false,
            ready: false,
            connected: false,
            mode: "sandbox" as const,
            customLogo: null,
            fields: {},
            integration: provider.integration,
          };
          return (
            <ProviderCard
              key={provider.id}
              provider={provider}
              state={state}
              busy={busy[provider.id] || null}
              message={messages[provider.id] || null}
              onToggle={(enabled) => onToggle(provider, enabled)}
              onSave={(fields) => onSave(provider, fields)}
              onTest={() => onTest(provider)}
              onModeChange={(mode) => onModeChange(provider, mode)}
              onLogoSave={(url) => onLogoSave(provider, url)}
              onLogoUpload={(file) => onLogoUpload(provider, file)}
              onLogoReset={() => onLogoReset(provider)}
            />
          );
        })}
      </div>
    </section>
  );
}
