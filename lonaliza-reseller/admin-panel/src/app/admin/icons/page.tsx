"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Library, Menu, RotateCcw, Save, Search, Trash2, Upload } from "lucide-react";
import { iconNames } from "lucide-react/dynamic";
import UiIcon from "@/components/ui/UiIcon";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  UI_ICON_CATEGORIES,
  categoryLabel,
  type UiIconCategoryId,
} from "@/lib/ui-icons-catalog";
import {
  DEFAULT_UI_ICONS,
  NAV_ICON_IDS,
  SEARCH_TAB_ICON_IDS,
  UI_ICONS_UPDATED_EVENT,
  navIconKey,
  normalizeUiIcons,
  sanitizeSvgMarkup,
  searchTabIconKey,
  setIconRef,
  type CustomSvgDef,
  type NavIconId,
  type SearchTabIconId,
  type UiIconRef,
  type UiIconsFile,
} from "@/lib/ui-icons-store";

type CategoryFilter = UiIconCategoryId | "all" | "custom";

const LUCIDE_NAMES: string[] = (iconNames as string[]).filter(
  (name, index, all) => all.indexOf(name) === index && !name.endsWith("-icon")
);

function slotLabel(
  kind: "nav" | "search",
  id: string,
  t: { nav: { [K in NavIconId]: string }; search: { [K in SearchTabIconId]: string } }
): string {
  if (kind === "nav") {
    return id in t.nav ? t.nav[id as NavIconId] : id;
  }
  return id in t.search ? t.search[id as SearchTabIconId] : id;
}

function copy(locale: string) {
  if (locale === "ar") {
    return {
      subtitle: "اختر أيقونة لكل بند في القائمة ولكل تبويب في محرك البحث. المكتبة تشمل Lucide بالكامل وأي SVG تخزّنه.",
      nav: "بنود القائمة",
      tabs: "تبويبات البحث",
      library: "مكتبة الأيقونات",
      searchPh: "ابحث بالاسم…",
      customTitle: "إضافة SVG",
      customHint: "الصق وسم <svg>…</svg> كاملاً. يُحفظ في المكتبة ويمكن تعيينه لأي بند.",
      customLabel: "اسم الأيقونة",
      customSvg: "وسم SVG",
      addSvg: "إضافة إلى المكتبة",
      save: "حفظ التعيينات",
      reset: "استعادة الافتراضي",
      saved: "تم الحفظ",
      failed: "فشل الحفظ",
      selected: "البند المحدد",
      none: "اختر بنداً ثم انقر أيقونة لتعيينها.",
    };
  }
  if (locale === "tr") {
    return {
      subtitle: "Menü öğeleri ve arama sekmeleri için ikon seçin. Tüm Lucide seti ve kaydettiğiniz SVG’ler.",
      nav: "Menü öğeleri",
      tabs: "Arama sekmeleri",
      library: "İkon kütüphanesi",
      searchPh: "İsimle ara…",
      customTitle: "SVG ekle",
      customHint: "Tam <svg>…</svg> işaretlemesini yapıştırın. Kütüphaneye kaydedilir.",
      customLabel: "İkon adı",
      customSvg: "SVG işaretlemesi",
      addSvg: "Kütüphaneye ekle",
      save: "Atamaları kaydet",
      reset: "Varsayılana dön",
      saved: "Kaydedildi",
      failed: "Kayıt başarısız",
      selected: "Seçili öğe",
      none: "Bir öğe seçin, sonra bir ikona tıklayın.",
    };
  }
  return {
    subtitle:
      "Pick an icon for every menu item and search-engine tab. The library includes all Lucide icons plus any SVG you store.",
    nav: "Menu items",
    tabs: "Search tabs",
    library: "Icon library",
    searchPh: "Search by name…",
    customTitle: "Add SVG",
    customHint: "Paste a full <svg>…</svg> mark-up. It is stored in the library and can be assigned to any slot.",
    customLabel: "Icon name",
    customSvg: "SVG mark-up",
    addSvg: "Add to library",
    save: "Save assignments",
    reset: "Restore defaults",
    saved: "Saved",
    failed: "Save failed",
    selected: "Selected slot",
    none: "Select a slot, then click an icon to assign it.",
  };
}

export default function AdminIconsPage() {
  const { t, locale } = useLocale();
  const labels = copy(locale);
  const [store, setStore] = useState<UiIconsFile>(DEFAULT_UI_ICONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string>("nav.home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("travel");
  const [svgLabel, setSvgLabel] = useState("");
  const [svgMarkup, setSvgMarkup] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/ui-icons", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const data = (await res.json()) as { ok?: boolean; icons?: UiIconsFile };
        if (!cancelled && data?.ok && data.icons) {
          setStore(normalizeUiIcons(data.icons));
        }
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const extraNavIds = useMemo(
    () =>
      Object.keys(store.nav).filter(
        (id) => !(NAV_ICON_IDS as readonly string[]).includes(id)
      ),
    [store.nav]
  );

  const knownLucide = useMemo(() => new Set(LUCIDE_NAMES), []);

  const visibleIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (category === "custom") return [];
    let names: string[] =
      category === "all"
        ? LUCIDE_NAMES
        : UI_ICON_CATEGORIES.find((group) => group.id === category)?.names.filter(
            (name) => knownLucide.has(name)
          ) ?? [];
    if (q) {
      names = (category === "all" ? LUCIDE_NAMES : names).filter((name) =>
        name.includes(q)
      );
    }
    return names.slice(0, category === "all" && !q ? 240 : 480);
  }, [category, query, knownLucide]);

  const assign = (icon: UiIconRef) => {
    setStore((prev) => setIconRef(prev, activeKey, icon));
    setMessage(null);
  };

  const addCustomSvg = () => {
    const svg = sanitizeSvgMarkup(svgMarkup);
    if (!svg) {
      setMessage(labels.failed);
      return;
    }
    const id = `svg-${Date.now().toString(36)}`;
    const def: CustomSvgDef = {
      id,
      label: svgLabel.trim() || id,
      svg,
    };
    setStore((prev) => {
      const next = normalizeUiIcons({
        ...prev,
        customSvgs: [...prev.customSvgs, def],
      });
      return setIconRef(next, activeKey, { source: "svg", name: id, svg });
    });
    setSvgLabel("");
    setSvgMarkup("");
    setCategory("custom");
  };

  const removeCustom = (id: string) => {
    setStore((prev) =>
      normalizeUiIcons({
        ...prev,
        customSvgs: prev.customSvgs.filter((item) => item.id !== id),
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ui-icons", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icons: store }),
      });
      const data = (await res.json()) as { ok?: boolean; icons?: UiIconsFile };
      if (!data?.ok || !data.icons) throw new Error("save");
      const next = normalizeUiIcons(data.icons);
      setStore(next);
      window.dispatchEvent(
        new CustomEvent(UI_ICONS_UPDATED_EVENT, { detail: next })
      );
      setMessage(labels.saved);
    } catch {
      setMessage(labels.failed);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStore(normalizeUiIcons(DEFAULT_UI_ICONS));
    setMessage(null);
  };

  const renderSlot = (key: string, label: string) => {
    const icon =
      key.startsWith("nav.")
        ? store.nav[key.slice(4)]
        : key.startsWith("searchTab.")
          ? store.searchTab[key.slice("searchTab.".length) as SearchTabIconId]
          : undefined;
    const active = activeKey === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setActiveKey(key)}
        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition ${
          active
            ? "border-purple-400/40 bg-purple-500/15"
            : "border-admin-border-subtle bg-white/[0.03] hover:bg-white/[0.06]"
        }`}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-amber-300">
          <UiIcon icon={icon} size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {label}
          </span>
          <span className="block truncate font-mono text-[11px] text-admin-text-muted">
            {key}
          </span>
        </span>
        {active ? <Check size={16} className="text-amber-400" /> : null}
      </button>
    );
  };

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <Library className="text-amber-400" size={28} />
            {t.admin.iconLibrary}
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{labels.subtitle}</p>
          <Link
            href="/admin/content#menu"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:text-amber-200"
          >
            <Menu size={14} />
            {t.menuVisibility.title}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-admin-border-subtle bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/[0.08]"
          >
            <RotateCcw size={14} />
            {labels.reset}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 px-4 py-2.5 text-sm font-bold text-foreground hover:brightness-110 shadow-sm disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? t.admin.loading : labels.save}
          </button>
        </div>
      </div>

      {message ? (
        <p
          className={`mb-4 text-sm ${
            message === labels.saved ? "text-amber-300 font-medium" : "text-rose-400"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,22rem)_minmax(0,1fr)]">
        <section className="space-y-5">
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {labels.nav}
            </h2>
            <div className="space-y-2">
              {NAV_ICON_IDS.map((id: NavIconId) =>
                renderSlot(
                  navIconKey(id),
                  slotLabel("nav", id, t)
                )
              )}
              {extraNavIds.map((id) =>
                renderSlot(navIconKey(id), slotLabel("nav", id, t))
              )}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {labels.tabs}
            </h2>
            <div className="space-y-2">
              {SEARCH_TAB_ICON_IDS.map((id) =>
                renderSlot(
                  searchTabIconKey(id),
                  slotLabel("search", id, t)
                )
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-admin-border-subtle bg-white/[0.03] p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{labels.library}</h2>
              <p className="text-xs text-admin-text-muted">
                {labels.selected}:{" "}
                <span className="font-mono text-amber-300">{activeKey}</span>
              </p>
            </div>
            <label className="relative block w-full max-w-sm">
              <Search
                size={14}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={labels.searchPh}
                className="w-full rounded-xl border border-admin-border-subtle bg-slate-950/60 py-2.5 ps-9 pe-3 text-sm text-foreground placeholder:text-admin-text-faint focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </label>
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {(["all", "custom", ...UI_ICON_CATEGORIES.map((g) => g.id)] as CategoryFilter[]).map(
              (id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    category === id
                      ? "bg-gradient-to-r from-purple-700 to-indigo-800 text-white"
                      : "bg-admin-bg-subtle text-white/65 hover:bg-muted hover:text-white"
                  }`}
                >
                  {categoryLabel(id, locale)}
                </button>
              )
            )}
          </div>

          {category === "custom" ? (
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {store.customSvgs.length === 0 ? (
                  <p className="text-sm text-muted-foreground sm:col-span-2">{labels.none}</p>
                ) : (
                  store.customSvgs.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-xl border border-admin-border-subtle bg-slate-950/50 p-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          assign({ source: "svg", name: item.id, svg: item.svg })
                        }
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-start hover:bg-muted"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-amber-300">
                          <UiIcon
                            icon={{ source: "svg", name: item.id, svg: item.svg }}
                            size={18}
                          />
                        </span>
                        <span className="truncate text-sm text-foreground">
                          {item.label}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustom(item.id)}
                        className="rounded-lg p-2 text-admin-text-muted hover:bg-muted hover:text-rose-400"
                        aria-label={t.common.delete}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="rounded-xl border border-dashed border-white/15 p-4">
                <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Upload size={14} />
                  {labels.customTitle}
                </h3>
                <p className="mb-3 text-xs text-admin-text-muted">{labels.customHint}</p>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {labels.customLabel}
                </label>
                <input
                  value={svgLabel}
                  onChange={(e) => setSvgLabel(e.target.value)}
                  className="mb-3 w-full rounded-xl border border-admin-border-subtle bg-slate-950/60 px-3 py-2.5 text-sm text-foreground placeholder:text-admin-text-faint focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {labels.customSvg}
                </label>
                <textarea
                  value={svgMarkup}
                  onChange={(e) => setSvgMarkup(e.target.value)}
                  rows={5}
                  className="mb-3 w-full rounded-xl border border-admin-border-subtle bg-slate-950/60 px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-admin-text-faint focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  placeholder='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">…</svg>'
                />
                <button
                  type="button"
                  onClick={addCustomSvg}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100"
                >
                  {labels.addSvg}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid max-h-[70vh] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6 md:grid-cols-8">
              {visibleIcons.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => assign({ source: "lucide", name })}
                  className="flex flex-col items-center gap-1 rounded-xl border border-admin-border-subtle bg-slate-900 px-1.5 py-2 text-purple-200 hover:border-purple-400/40 hover:bg-purple-500/15 hover:text-foreground"
                >
                  <UiIcon icon={{ source: "lucide", name }} size={20} />
                  <span className="w-full truncate text-[10px] text-muted-foreground">
                    {name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
