"use client";

import { useEffect } from "react";
import { Settings, Palette, Type, SunMoon, Maximize2, Compass, LayoutGrid } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type FontKey, fontOptions } from "@/lib/fonts/registry";
import type { ContentLayout, NavbarStyle, SidebarCollapsible, SidebarVariant } from "@/lib/preferences/layout";
import { THEME_PRESET_OPTIONS, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { applyAdminTheme, persistAdminTheme } from "@/lib/admin-theme";

function ensureFontLoaded(slug?: string) {
  if (!slug || typeof document === "undefined") return;
  const id = `gf-${slug.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${slug}&display=swap`;
  document.head.appendChild(link);
}

export function LayoutControls() {
  const { values, resolvedThemeMode, setPreference, resetPreferences } = usePreferencesStore(
    useShallow((state) => ({
      values: state.values,
      resolvedThemeMode: state.resolvedThemeMode,
      setPreference: state.setPreference,
      resetPreferences: state.resetPreferences,
    })),
  );

  const {
    theme_mode: themeMode,
    theme_preset: themePreset,
    content_layout: contentLayout,
    navbar_style: navbarStyle,
    sidebar_variant: variant,
    sidebar_collapsible: collapsible,
    font,
  } = values;

  // Ensure current font is loaded if it uses Google Fonts
  useEffect(() => {
    const opt = fontOptions.find((f) => f.key === font);
    if (opt?.googleSlug) {
      ensureFontLoaded(opt.googleSlug);
    }
  }, [font]);

  const onThemePresetChange = (preset: ThemePreset) => {
    setPreference("theme_preset", preset);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme-preset", preset);
      const root = document.getElementById("admin-root");
      if (root) root.setAttribute("data-theme-preset", preset);
    }
  };

  const onThemeModeChange = (mode: ThemeMode | "") => {
    if (!mode) return;
    setPreference("theme_mode", mode);
    const resolved =
      mode === "dark"
        ? "dark"
        : mode === "light"
        ? "light"
        : typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
        ? "dark"
        : "light";

    persistAdminTheme(resolved);
    applyAdminTheme(resolved);
  };

  const onContentLayoutChange = (layout: ContentLayout | "") => {
    if (!layout) return;
    setPreference("content_layout", layout);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-content-layout", layout);
      const root = document.getElementById("admin-root");
      if (root) root.setAttribute("data-content-layout", layout);
    }
  };

  const onNavbarStyleChange = (style: NavbarStyle | "") => {
    if (!style) return;
    setPreference("navbar_style", style);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-navbar-style", style);
      const root = document.getElementById("admin-root");
      if (root) root.setAttribute("data-navbar-style", style);
    }
  };

  const onSidebarStyleChange = (value: SidebarVariant | "") => {
    if (!value) return;
    setPreference("sidebar_variant", value);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-sidebar-variant", value);
      const root = document.getElementById("admin-root");
      if (root) root.setAttribute("data-sidebar-variant", value);
    }
  };

  const onSidebarCollapseModeChange = (value: SidebarCollapsible | "") => {
    if (!value) return;
    setPreference("sidebar_collapsible", value);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-sidebar-collapsible", value);
      const root = document.getElementById("admin-root");
      if (root) root.setAttribute("data-sidebar-collapsible", value);
    }
  };

  const onFontChange = (value: FontKey | "") => {
    if (!value) return;
    setPreference("font", value);
    const opt = fontOptions.find((f) => f.key === value);
    if (opt?.googleSlug) {
      ensureFontLoaded(opt.googleSlug);
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-font", value);
      const root = document.getElementById("admin-root");
      if (root) root.setAttribute("data-font", value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-xl border border-border bg-secondary text-foreground hover:bg-muted p-0 flex items-center justify-center transition-colors"
          title="تخصيص المظهر والسمات والخطوط | Theme & Layout Preferences"
        >
          <Settings className="size-4 text-amber-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-88 max-h-[85vh] overflow-y-auto p-4 border border-border/80 bg-popover text-popover-foreground shadow-2xl rounded-2xl">
        <div className="flex flex-col gap-4" dir="rtl">
          <div className="space-y-1 border-b border-border/40 pb-2">
            <h4 className="font-bold text-sm leading-none flex items-center gap-1.5 text-foreground">
              <Palette className="size-4 text-amber-500" />
              <span>إعدادات المظهر والسمات المتقدمة</span>
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              تحكم كامل في ألوان اللوحة، الخطوط العربية واللاتينية، ونمط العرض بسلاسة وفورية.
            </p>
          </div>

          <div className="space-y-4 **:data-[slot=toggle-group]:w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs">
            {/* 1. Theme Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                  <Palette className="size-3.5 text-primary" />
                  <span>السمة اللونية (Theme Preset)</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">12 ثيم متطور</span>
              </div>
              <Select value={themePreset} onValueChange={onThemePresetChange}>
                <SelectTrigger size="sm" className="w-full text-xs h-9 bg-background">
                  <SelectValue placeholder="اختر السمة" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectGroup>
                    {THEME_PRESET_OPTIONS.map((preset) => (
                      <SelectItem key={preset.value} className="text-xs py-2 cursor-pointer" value={preset.value}>
                        <div className="flex items-center gap-2.5">
                          <span
                            className="size-3.5 rounded-full shrink-0 border border-black/20 shadow-xs"
                            style={{
                              backgroundColor: resolvedThemeMode === "dark" ? preset.primary.dark : preset.primary.light,
                            }}
                          />
                          <span className="font-medium">{preset.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Fonts */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                <Type className="size-3.5 text-primary" />
                <span>نوع الخط (Typography)</span>
              </Label>
              <Select value={font} onValueChange={onFontChange}>
                <SelectTrigger size="sm" className="w-full text-xs h-9 bg-background">
                  <SelectValue placeholder="اختر الخط" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectGroup>
                    {fontOptions.map((fontItem) => (
                      <SelectItem key={fontItem.key} className="text-xs py-1.5 cursor-pointer" value={fontItem.key}>
                        {fontItem.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Theme Mode */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                <SunMoon className="size-3.5 text-primary" />
                <span>وضع الإضاءة (Theme Mode)</span>
              </Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                type="single"
                value={themeMode}
                onValueChange={onThemeModeChange}
                className="bg-muted/40 p-0.5 rounded-lg border border-border"
              >
                <ToggleGroupItem value="light" aria-label="نهاري" className="font-medium">
                  نهاري (Light)
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="ليلي" className="font-medium">
                  ليلي (Dark)
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="النظام" className="font-medium">
                  تلقائي (System)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* 4. Page Layout */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                <Maximize2 className="size-3.5 text-primary" />
                <span>عرض محتوى الصفحة (Page Layout)</span>
              </Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                type="single"
                value={contentLayout}
                onValueChange={onContentLayoutChange}
                className="bg-muted/40 p-0.5 rounded-lg border border-border"
              >
                <ToggleGroupItem value="centered" aria-label="توسيط المحتوى">
                  توسيط (Centered)
                </ToggleGroupItem>
                <ToggleGroupItem value="full-width" aria-label="عرض كامل">
                  عرض كامل (Full)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* 5. Navbar Behavior */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                <Compass className="size-3.5 text-primary" />
                <span>سلوك الشريط العلوي (Navbar Behavior)</span>
              </Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                type="single"
                value={navbarStyle}
                onValueChange={onNavbarStyleChange}
                className="bg-muted/40 p-0.5 rounded-lg border border-border"
              >
                <ToggleGroupItem value="sticky" aria-label="ثابت أثناء التمرير">
                  ثابت (Sticky)
                </ToggleGroupItem>
                <ToggleGroupItem value="scroll" aria-label="يتحرك مع التمرير">
                  متحرك (Scroll)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* 6. Sidebar Style */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                <LayoutGrid className="size-3.5 text-primary" />
                <span>نمط القائمة الجانبية (Sidebar Style)</span>
              </Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                type="single"
                value={variant}
                onValueChange={onSidebarStyleChange}
                className="bg-muted/40 p-0.5 rounded-lg border border-border"
              >
                <ToggleGroupItem value="sidebar" aria-label="قياسي ممتد">
                  قياسي (Sidebar)
                </ToggleGroupItem>
                <ToggleGroupItem value="inset" aria-label="إطار داخلي">
                  إطار (Inset)
                </ToggleGroupItem>
                <ToggleGroupItem value="floating" aria-label="عائم بظل">
                  عائم (Floating)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* 7. Sidebar Collapse Mode */}
            <div className="space-y-1.5">
              <Label className="font-medium text-xs text-muted-foreground">وضع طي القائمة (Collapse Mode)</Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                type="single"
                value={collapsible}
                onValueChange={onSidebarCollapseModeChange}
                className="bg-muted/40 p-0.5 rounded-lg border border-border"
              >
                <ToggleGroupItem value="icon" aria-label="أيقونات">
                  أيقونات (Icon)
                </ToggleGroupItem>
                <ToggleGroupItem value="offcanvas" aria-label="إخفاء كامل">
                  إخفاء (OffCanvas)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full text-xs mt-2 border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={resetPreferences}
            >
              استعادة الإعدادات الافتراضية (Restore Defaults)
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
