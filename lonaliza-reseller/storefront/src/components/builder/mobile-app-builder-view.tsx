"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Save,
  Undo2,
  Redo2,
  Smartphone,
  Eye,
  EyeOff,
  Trash2,
  Wand2,
  Layers,
  Sparkles,
  Loader2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  useBuilderStore,
  useTemporalBuilder,
} from "@/lib/builder/editor-store";
import { sectionLabel, pickCopy, type HomepageTemplateDraft } from "@/lib/visual-editor/schema";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MobileAppDeviceCanvas } from "./mobile-app-device-canvas";
import { EditorCopilotProvider, EditorCopilotPanel } from "@/components/editor";
import { InspectorPanel } from "./panels/inspector-panel";
import { cn } from "@/lib/builder/cn";

export function MobileAppBuilderView() {
  const { t, locale } = useLocale();
  const [ready, setReady] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"ai" | "layout" | "inspector">("ai");

  const theme = useBuilderStore((s) => s.theme);
  const hydrateInitial = useBuilderStore((s) => s.hydrateInitial);
  const selectedElement = useBuilderStore((s) => s.selectedElement);
  const setSelectedElement = useBuilderStore((s) => s.setSelectedElement);
  const reorderSection = useBuilderStore((s) => s.reorderSection);
  const updateSectionSettings = useBuilderStore((s) => s.updateSectionSettings);
  const isSaving = useBuilderStore((s) => s.isSaving);
  const isPublishing = useBuilderStore((s) => s.isPublishing);

  const { undo, redo, pastStates, futureStates } = useTemporalBuilder((temporal) => ({
    undo: temporal.undo,
    redo: temporal.redo,
    pastStates: temporal.pastStates,
    futureStates: temporal.futureStates,
  }));

  // Fetch initial template draft and lock device to mobile
  useEffect(() => {
    let cancelled = false;
    useBuilderStore.getState().setDevice("mobile");

    void fetch("/api/admin/homepage-template", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.ok) return;
        hydrateInitial(data.draft as HomepageTemplateDraft, data.publishedAt || null);
        setReady(true);
      })
      .catch(() => setReady(true));

    return () => {
      cancelled = true;
    };
  }, [hydrateInitial]);

  // When an element is clicked, switch sidebar to inspector
  useEffect(() => {
    if (selectedElement) {
      setSidebarTab("inspector");
    }
  }, [selectedElement]);

  const handleSave = useCallback(async (publish = false) => {
    const { theme, setSaving, setPublishing, markSaved } = useBuilderStore.getState();
    if (publish) setPublishing(true);
    else setSaving(true);

    try {
      const res = await fetch("/api/admin/homepage-template", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: theme, publish }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Save failed");
      markSaved();
      toast.success(publish ? "تم نشر التعديلات بنجاح لتطبيق الهاتف والموقع!" : "تم حفظ المسودة بنجاح!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      useBuilderStore.getState().setSaving(false);
      useBuilderStore.getState().setPublishing(false);
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 text-[color:var(--admin-text-muted)]">
        <Loader2 className="animate-spin text-[color:var(--admin-gold)]" size={24} />
        <span className="text-sm font-bold">جاري تحميل المحرر البصري لتطبيق الهاتف...</span>
      </div>
    );
  }

  return (
    <EditorCopilotProvider>
      <div className="space-y-4 font-sans" dir="rtl">
        {/* Top Floating Control Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl rounded-xl border border-border bg-card shadow-sm p-3 sm:p-4"
          
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--admin-gold)] to-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md">
              <Smartphone className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-[color:var(--admin-gold-foreground)]">
                  المحرر البصري الحي لتطبيق الهاتف (Native App Studio)
                </h2>
                <span className="rounded-md border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-black text-[color:var(--admin-gold)]" style={{ color: "#fcd34d" }}>
                  وضع الهاتف مقفل
                </span>
              </div>
              <p className="text-[11px] text-[color:var(--admin-text-muted)] font-medium" >
                تعديل نصوص وألوان التطبيق مباشرة، مع إمكانية إخفاء السيكشنات من الهاتف فقط وإبقائها في الموقع.
              </p>
            </div>
          </div>

            {/* Open Full Editor Button */}
            <a
              href="/admin/mobile-app-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-400/20 px-3.5 py-2 text-xs font-black text-amber-200 hover:bg-amber-400/30 transition-all cursor-pointer shadow-xs"
            >
              <ExternalLink size={13} className="stroke-[2.5] text-[color:var(--admin-gold)]" />
              <span className="text-[color:var(--admin-gold)] font-bold">فتح المحرر كاملاً (صفحة مستقلة)</span>
            </a>

            {/* Undo / Redo */}
            <div className="flex items-center rounded-xl bg-[color:var(--admin-bg-subtle)] p-0.5 border border-[color:var(--admin-border-subtle)]">
              <button
                type="button"
                onClick={() => undo()}
                disabled={!pastStates.length}
                title="تراجع"
                className="p-1.5 text-[color:var(--admin-gold-foreground)] hover:text-[color:var(--admin-gold)] disabled:opacity-30 transition-colors"
              >
                <Undo2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => redo()}
                disabled={!futureStates.length}
                title="إعادة"
                className="p-1.5 text-[color:var(--admin-gold-foreground)] hover:text-[color:var(--admin-gold)] disabled:opacity-30 transition-colors"
              >
                <Redo2 size={15} />
              </button>
            </div>

            {/* Save & Publish Buttons */}
            <button
              type="button"
              onClick={() => void handleSave(false)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] px-3.5 py-2 text-xs font-bold text-[color:var(--admin-gold-foreground)] hover:bg-[color:var(--admin-bg-subtle)] transition-colors cursor-pointer shadow-sm"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin text-[color:var(--admin-gold-foreground)]" /> : <Save size={13} className="text-[color:var(--admin-gold-foreground)]" />}
              <span className="text-[color:var(--admin-gold-foreground)] font-bold">حفظ كمسودة</span>
            </button>

            <button
              type="button"
              onClick={() => void handleSave(true)}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[color:var(--admin-gold)] to-[color:var(--admin-gold)] px-4 py-2 text-xs font-black text-[color:var(--admin-gold-foreground)] shadow-md shadow-amber-500/20 hover:brightness-105 transition-all cursor-pointer"
            >
              {isPublishing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>نشر للتطبيق فوراً</span>
            </button>
          </div>

        {/* Main Workspace: 2-Column Split (Live Device Frame + Real AI Copilot / Inspector) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Realistic Interactive Smartphone Canvas */}
          <div className="xl:col-span-5 flex justify-center bg-[color:var(--admin-bg-subtle)] p-3 sm:p-5 rounded-3xl border border-[color:var(--admin-border-subtle)] shadow-inner">
            <MobileAppDeviceCanvas
              initialPath="/?editor=1&preview=1"
              royalPurple={theme.global.navy || "#2E1065"}
              amberColor="#F59E0B"
              themeColor={theme.global.emerald || "#7C3AED"}
            />
          </div>

          {/* Right Column: Genuine AI Copilot & Section/Inspector Panel */}
          <div className="xl:col-span-7 space-y-4">
            {/* Tab Switcher: AI Copilot vs Sections Manager vs Inspector */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-[color:var(--admin-bg-subtle)] p-1.5 border border-[color:var(--admin-border-subtle)]">
              <button
                type="button"
                onClick={() => setSidebarTab("ai")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer",
                  sidebarTab === "ai"
                    ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md"
                    : "text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg-subtle)]"
                )}
              >
                <Wand2 size={14} className={sidebarTab === "ai" ? "text-amber-400" : ""} />
                <span>شات كوابيلوت الذكاء الاصطناعي (AI Copilot)</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("layout")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer",
                  sidebarTab === "layout"
                    ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md"
                    : "text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg-subtle)]"
                )}
              >
                <Layers size={14} className={sidebarTab === "layout" ? "text-amber-400" : ""} />
                <span>ترتيب وإخفاء سيكشنات التطبيق ({theme.layout.length})</span>
              </button>

              {selectedElement && (
                <button
                  type="button"
                  onClick={() => setSidebarTab("inspector")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer",
                    sidebarTab === "inspector"
                      ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md"
                      : "text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg-subtle)]"
                  )}
                >
                  <Smartphone size={14} className={sidebarTab === "inspector" ? "text-amber-400" : ""} />
                  <span>تخصيص العنصر المحدد</span>
                </button>
              )}
            </div>

            {/* Content Container */}
            <div className="rounded-3xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] shadow-sm overflow-hidden min-h-[640px] flex flex-col">
              {/* TAB 1: Real AI Copilot */}
              {sidebarTab === "ai" && (
                <div className="flex-1 flex flex-col p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-[color:var(--admin-border-subtle)] pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-[color:var(--admin-gold-foreground)]">
                        <Wand2 size={14} />
                      </div>
                      <span className="text-xs font-black text-[color:var(--admin-text-primary)]">
                        كوابيلوت النظام الأصلي لتعديل التطبيق
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)] px-2 py-0.5 rounded border border-[color:var(--admin-border-subtle)]">
                      Gemini Multimodal Live
                    </span>
                  </div>
                  <div className="flex-1">
                    <EditorCopilotPanel />
                  </div>
                </div>
              )}

              {/* TAB 2: Sections Layout Manager & App-Only Visibility */}
              {sidebarTab === "layout" && (
                <div className="p-5 space-y-3">
                  <div className="border-b border-[color:var(--admin-border-subtle)] pb-3">
                    <h3 className="text-sm font-black text-[color:var(--admin-text-primary)]">سيكشنات الصفحة الرئيسية للتطبيق</h3>
                    <p className="text-xs text-[color:var(--admin-text-muted)] mt-0.5">
                      يمكنك إعادة ترتيب السيكشنات وإلغاء ظهور أي سيكشن بالتطبيق فقط بنقرة زر مع بقائه ظاهراً على الموقع للكمبيوتر.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[580px] overflow-y-auto pe-1">
                    {theme.layout.map((item, index) => {
                      const label = sectionLabel(item.type);
                      const isHiddenInApp = Boolean(item.settings?.hideOnMobileApp);
                      const isSelected = selectedElement?.sectionInstanceId === item.instanceId;

                      return (
                        <div
                          key={item.instanceId}
                          className={cn(
                            "flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all",
                            isSelected
                              ? "border-[color:var(--admin-gold)] bg-[color:var(--admin-gold-soft)] shadow-sm"
                              : isHiddenInApp
                              ? "border-amber-200 bg-amber-50/40 opacity-75"
                              : "border-[color:var(--admin-border-subtle)] hover:bg-[color:var(--admin-bg-subtle)]"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[color:var(--admin-bg-subtle)] text-[11px] font-mono font-bold text-[color:var(--admin-text-muted)]">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-[color:var(--admin-text-primary)] truncate">
                                {pickCopy(label, locale)}
                              </span>
                              <div className="flex items-center gap-1 text-[10px]">
                                {isHiddenInApp ? (
                                  <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded">
                                    مخفي بتطبيق الهاتف
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-semibold">مفعل في الهاتف والموقع</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => reorderSection(item.instanceId, index - 1)}
                              className="p-1.5 rounded-lg bg-[color:var(--admin-bg-surface)] border border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg-subtle)] disabled:opacity-30 cursor-pointer"
                              title="تحريك لأعلى"
                            >
                              ↑
                            </button>
                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={index === theme.layout.length - 1}
                              onClick={() => reorderSection(item.instanceId, index + 1)}
                              className="p-1.5 rounded-lg bg-[color:var(--admin-bg-surface)] border border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg-subtle)] disabled:opacity-30 cursor-pointer"
                              title="تحريك لأسفل"
                            >
                              ↓
                            </button>

                            {/* Toggle Mobile App Visibility */}
                            <button
                              type="button"
                              onClick={() => {
                                updateSectionSettings(item.instanceId, {
                                  hideOnMobileApp: !isHiddenInApp,
                                });
                                toast.success(
                                  !isHiddenInApp
                                    ? "تم إخفاء هذا القسم من تطبيق الهاتف فقط"
                                    : "تم تفعيل القسم ليظهر في تطبيق الهاتف"
                                );
                              }}
                              className={cn(
                                "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                                isHiddenInApp
                                  ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] hover:opacity-90 shadow-xs"
                                  : "bg-amber-100 text-amber-950 hover:bg-amber-200 border border-amber-300"
                              )}
                            >
                              <Smartphone size={12} />
                              <span>{isHiddenInApp ? "إظهار بالتطبيق" : "إلغاء من التطبيق"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Element Inspector */}
              {sidebarTab === "inspector" && (
                <div className="flex-1 flex flex-col p-4">
                  <InspectorPanel />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </EditorCopilotProvider>
  );
}
