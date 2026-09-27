"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Palette,
  Moon,
  Sun,
  Check,
  Sparkles,
  X,
  Shield,
  Type,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  ADMIN_THEME_PRESETS,
  type AdminThemeConfig,
  type AdminThemePreset,
  applyAdminThemeConfig,
  persistThemeConfig,
  readStoredThemeConfig,
} from "@/lib/admin-theme-engine";
import {
  FONTS_CATALOG,
  type FontDefinition,
  readStoredAdminFont,
  persistAdminFont,
  applyAdminFont,
  getFontDefinition,
} from "@/lib/theme/fonts-catalog";

export default function AdminThemeSwitcher() {
  const [config, setConfig] = useState<AdminThemeConfig>({
    preset: "royal-luxury",
    mode: "light",
    fontFamily: "cairo",
  });
  const [activeTab, setActiveTab] = useState<"themes" | "fonts">("themes");
  const [fontCategory, setFontCategory] = useState<"all" | "arabic" | "latin">("all");
  const [fontSearch, setFontSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial = readStoredThemeConfig();
    const storedFont = readStoredAdminFont();
    initial.fontFamily = storedFont;
    setConfig(initial);
    applyAdminThemeConfig(initial);

    const handleThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<AdminThemeConfig>).detail;
      if (detail) {
        setConfig(detail);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("lonaliza:admin-theme-change", handleThemeChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("lonaliza:admin-theme-change", handleThemeChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectPreset = (preset: AdminThemePreset) => {
    const updated: AdminThemeConfig = { ...config, preset };
    setConfig(updated);
    applyAdminThemeConfig(updated);
    persistThemeConfig(updated);
  };

  const selectFont = (fontId: string) => {
    const updated: AdminThemeConfig = { ...config, fontFamily: fontId };
    setConfig(updated);
    applyAdminFont(fontId);
    persistAdminFont(fontId);
    persistThemeConfig(updated);
  };

  const toggleMode = (mode: "light" | "dark") => {
    if (config.mode === mode) return;
    const updated: AdminThemeConfig = { ...config, mode };
    setConfig(updated);
    applyAdminThemeConfig(updated);
    persistThemeConfig(updated);
  };

  const activePresetMeta =
    ADMIN_THEME_PRESETS.find((p) => p.id === config.preset) ||
    ADMIN_THEME_PRESETS[0];

  const activeFontMeta = getFontDefinition(config.fontFamily);

  const isDark = config.mode === "dark";

  const filteredFonts = FONTS_CATALOG.filter((f) => {
    const matchCategory = fontCategory === "all" || f.category === fontCategory;
    const matchSearch =
      !fontSearch ||
      f.name.toLowerCase().includes(fontSearch.toLowerCase()) ||
      f.nameAr.includes(fontSearch) ||
      f.descriptionAr.includes(fontSearch);
    return matchCategory && matchSearch;
  });

  return (
    <div className="relative inline-block text-start" ref={containerRef}>
      {/* Trigger Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3 rounded-xl border transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
          isDark
            ? "border-purple-800/80 bg-[#1e1338] text-foreground hover:bg-[#28194a]"
            : "border-purple-200 bg-white text-foreground hover:bg-purple-50"
        }`}
        title="تخصيص ثيم وخط لوحة التحكم"
        aria-label="تخصيص ثيم وخط لوحة التحكم"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/20"
            style={{ backgroundColor: activePresetMeta.primaryColor }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/20"
            style={{ backgroundColor: activePresetMeta.secondaryColor }}
          />
        </div>
        <Palette size={15} className={isDark ? "text-purple-300" : "text-purple-600"} />
        <span className="hidden md:inline text-xs font-bold">
          {activePresetMeta.nameAr}
        </span>
        <span className="hidden xl:inline text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium">
          {activeFontMeta.nameAr}
        </span>
      </button>

      {/* Backdrop Scrim Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9990] bg-foreground/10 backdrop-blur-[2px] transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 100% Solid Opaque Popover Dialog */}
      {isOpen && (
        <div
          className="fixed sm:absolute end-2 sm:end-0 top-16 mt-2 w-[calc(100vw-1rem)] sm:w-[520px] max-h-[88vh] flex flex-col rounded-3xl border-2 shadow-2xl z-[9999] p-5 animate-in fade-in zoom-in-95 duration-150"
          dir="rtl"
          style={{
            backgroundColor: isDark ? "#160d29" : "#ffffff",
            borderColor: isDark ? "#3b2266" : "#ddd3ee",
            color: isDark ? "#f8fafc" : "#0f172a",
          }}
        >
          {/* Popover Header */}
          <div
            className="flex items-center justify-between pb-3 mb-3 border-b shrink-0"
            style={{ borderColor: isDark ? "#281745" : "#ede6f7" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: isDark ? "rgba(167, 139, 250, 0.15)" : "rgba(124, 58, 237, 0.1)",
                  color: isDark ? "#c4b5fd" : "#7c3aed",
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wide" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
                  استوديو الهوية البصرية والطباعة
                </h3>
                <p className="text-[11px]" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
                  15 ثيماً تنفيذياً فخماً + 50 خطاً عربياً وعالمياً حديثاً
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl transition-colors cursor-pointer"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                color: isDark ? "#cbd5e1" : "#475569",
              }}
              title="إغلاق"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mode Selector (Light / Dark) */}
          <div className="mb-3 shrink-0">
            <div
              className="grid grid-cols-2 gap-2 p-1 rounded-2xl border"
              style={{
                backgroundColor: isDark ? "#20133b" : "#f5f0fb",
                borderColor: isDark ? "#331f57" : "#e4daf5",
              }}
            >
              <button
                type="button"
                onClick={() => toggleMode("light")}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isDark
                    ? "bg-white text-foreground shadow-md ring-1 ring-black/5"
                    : "text-slate-400 hover:text-foreground"
                }`}
              >
                <Sun size={15} className="text-amber-500 shrink-0" />
                <span>الوضع النهاري (ناصع وعالي التباين)</span>
              </button>
              <button
                type="button"
                onClick={() => toggleMode("dark")}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? "bg-[#331f57] text-foreground shadow-md ring-1 ring-purple-500/40"
                    : "text-slate-500 hover:text-foreground"
                }`}
              >
                <Moon size={15} className="text-indigo-400 shrink-0" />
                <span>الوضع الليلي (ملكي معزز)</span>
              </button>
            </div>
          </div>

          {/* Top Switcher Tabs: Themes vs Fonts */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-purple-950/40 mb-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("themes")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "themes"
                  ? "bg-white dark:bg-purple-900 text-purple-700 dark:text-purple-200 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground"
              }`}
            >
              <Palette size={14} />
              <span>الثيمات الفاخرة ({ADMIN_THEME_PRESETS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fonts")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "fonts"
                  ? "bg-white dark:bg-purple-900 text-purple-700 dark:text-purple-200 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground"
              }`}
            >
              <Type size={14} />
              <span>كتالوج الخطوط ({FONTS_CATALOG.length}+)</span>
            </button>
          </div>

          {/* TAB 1: THEMES LIST */}
          {activeTab === "themes" && (
            <div className="flex-1 overflow-y-auto pe-1 space-y-2 [scrollbar-width:thin]">
              <div className="flex items-center justify-between text-[11px] font-bold px-1 mb-1" style={{ color: isDark ? "#b8a9cf" : "#574670" }}>
                <span>اختر الهوية المناسبة لمنصتك</span>
                <span className="text-purple-600 dark:text-purple-400">النشط: {activePresetMeta.nameAr}</span>
              </div>

              {ADMIN_THEME_PRESETS.map((preset) => {
                const isSelected = config.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border-2 text-start transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? "border-purple-400 bg-[#261543] ring-2 ring-purple-500/30 shadow-md"
                          : "border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-md"
                        : isDark
                          ? "border-[#2b174a] bg-[#1a0f30] hover:bg-[#231442] hover:border-purple-800"
                          : "border-slate-200 bg-slate-50/70 hover:bg-white hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 4-Color Swatch Palette */}
                      <div className="flex items-center -space-x-1.5 rtl:space-x-reverse shrink-0">
                        <span
                          className="w-4.5 h-4.5 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                        <span
                          className="w-4.5 h-4.5 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: preset.secondaryColor }}
                        />
                        <span
                          className="w-4.5 h-4.5 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: preset.accentColor }}
                        />
                        <span
                          className="w-4.5 h-4.5 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: isDark ? preset.previewBgDark : preset.previewBgLight }}
                        />
                      </div>

                      <div>
                        <div className="text-xs font-black flex items-center gap-1.5" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
                          <span>{preset.nameAr}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({preset.nameEn})</span>
                          {preset.id === "royal-luxury" && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md font-black bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              الأصل
                            </span>
                          )}
                        </div>
                        <div
                          className="text-[10px] mt-0.5 leading-snug line-clamp-1"
                          style={{ color: isDark ? "#94a3b8" : "#64748b" }}
                        >
                          {preset.descriptionAr}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                          backgroundColor: preset.accentColor,
                          color: "#ffffff",
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: FONTS CATALOG */}
          {activeTab === "fonts" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Category Filter & Search */}
              <div className="space-y-2 mb-2 shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute start-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                    placeholder="ابحث عن خط بالاسم العربي أو الإنجليزي..."
                    className="w-full h-8 ps-8 pe-3 rounded-xl border text-xs bg-slate-50 dark:bg-purple-950/30 border-slate-200 dark:border-purple-800/60 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  {fontSearch && (
                    <button
                      type="button"
                      onClick={() => setFontSearch("")}
                      className="absolute end-3 top-2 text-slate-400 hover:text-foreground"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Subcategory Pills */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFontCategory("all")}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                      fontCategory === "all"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-purple-950/40 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    الكل ({FONTS_CATALOG.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontCategory("arabic")}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                      fontCategory === "arabic"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-purple-950/40 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    خطوط عربية أصيلة (25)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontCategory("latin")}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                      fontCategory === "latin"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-purple-950/40 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    خطوط عالمية / لاتينية (25)
                  </button>
                </div>
              </div>

              {/* Fonts List */}
              <div className="flex-1 overflow-y-auto pe-1 space-y-2 [scrollbar-width:thin]">
                {filteredFonts.map((font) => {
                  const isSelected = (config.fontFamily || "cairo") === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => selectFont(font.id)}
                      className={`w-full p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "border-purple-400 bg-[#261543] ring-2 ring-purple-500/30 shadow-md"
                            : "border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-md"
                          : isDark
                            ? "border-[#2b174a] bg-[#1a0f30] hover:bg-[#231442]"
                            : "border-slate-200 bg-slate-50/70 hover:bg-white hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-foreground">
                            {font.nameAr}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {font.name}
                          </span>
                          {font.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md font-black bg-purple-500/10 text-purple-600 dark:text-purple-300">
                              {font.badge}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-purple-600 dark:text-purple-400">
                            <CheckCircle2 size={16} />
                          </span>
                        )}
                      </div>

                      {/* Live Typography Preview Sample */}
                      <div
                        className="p-2 rounded-xl bg-white/70 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 my-1"
                        style={{ fontFamily: font.cssFamily }}
                      >
                        <div className="text-sm font-semibold text-foreground leading-snug">
                          {font.previewTextAr}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {font.previewTextEn}
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        {font.descriptionAr}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div
            className="mt-3 pt-2.5 border-t text-center flex items-center justify-between shrink-0"
            style={{ borderColor: isDark ? "#281745" : "#ede6f7" }}
          >
            <div className="flex items-center gap-1.5">
              <Shield size={13} style={{ color: isDark ? "#a78bfa" : "#7c3aed" }} />
              <span
                className="text-[11px] font-bold"
                style={{ color: isDark ? "#94a3b8" : "#64748b" }}
              >
                تطبيق فوري لجميع شاشات النظام وبطاقات البيانات
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                selectPreset("royal-luxury");
                selectFont("cairo");
              }}
              className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-bold cursor-pointer"
            >
              استعادة الافتراضي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
