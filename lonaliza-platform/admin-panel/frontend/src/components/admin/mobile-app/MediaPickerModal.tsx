"use client";

import { useState, useEffect } from "react";
import {
  Search,
  X,
  Sparkles,
  Check,
  UploadCloud,
  Image as ImageIcon,
  Compass,
  Loader2,
} from "lucide-react";
import type { TravelMediaItem } from "@/app/api/admin/media/search/route";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, title?: string) => void;
  currentUrl?: string;
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  title = "مكتبة وسائط وخلفيات السفر الفاخرة (Unsplash & Pexels)",
}: MediaPickerModalProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState<"all" | "pexels" | "unsplash">("all");
  const [categories, setCategories] = useState<{ id: string; nameAr: string }[]>([]);
  const [mediaList, setMediaList] = useState<TravelMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [customUrl, setCustomUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchMedia();
  }, [isOpen, selectedCategory]);

  const fetchMedia = async (searchQuery = query) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/admin/media/search?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setMediaList(data.media || []);
        if (data.categories) setCategories(data.categories);
      }
    } catch {
      /* fallback */
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia(query);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Convert to local data URL or upload
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onSelect(base64, file.name);
        onClose();
      };
      reader.readAsDataURL(file);
    } catch {
      alert("تعذر قراءة الملف");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent dir="rtl" className="sm:max-w-5xl p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--admin-gold)] to-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md">
              <Compass className="h-5 w-5 stroke-[2.3]" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">{title}</h3>
              <p className="text-xs text-[color:var(--admin-text-muted)] font-medium">
                اختر من آلاف الصور السياحية عالية الدقة من Unsplash أو ارفع جرافيكس متحرك خاص
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)]">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === "library"
                ? "border-amber-400 text-[color:var(--admin-gold)]"
                : "border-transparent text-[color:var(--admin-text-muted)] hover:text-slate-200"
            }`}
          >
            <Sparkles size={14} />
            <span>مكتبة Unsplash والسفر الفاخر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "border-amber-400 text-[color:var(--admin-gold)]"
                : "border-transparent text-[color:var(--admin-text-muted)] hover:text-slate-200"
            }`}
          >
            <UploadCloud size={14} />
            <span>رفع ملف / رابط مخصص</span>
          </button>
        </div>

        {activeTab === "library" ? (
          <>
            {/* Search & Filter Bar */}
            <div className="p-4 space-y-3 bg-[color:var(--admin-bg-surface)] border-b border-[color:var(--admin-border-subtle)]">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[color:var(--admin-text-muted)] h-4 w-4" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن وجهة، فندق، طيران، أو منظر سياحي (مثال: Cappadocia, Bosphorus, Flight)..."
                    className="w-full rounded-xl bg-[color:var(--admin-input-bg,var(--admin-bg-subtle))] border border-[color:var(--admin-border-subtle)] pr-10 pl-4 py-2.5 text-xs text-foreground placeholder:text-[color:var(--admin-text-faint)] focus:outline-none focus:border-[color:var(--admin-gold)]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[color:var(--admin-gold)] to-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] font-black text-xs hover:brightness-105 transition-all cursor-pointer shrink-0"
                >
                  بحث
                </button>
              </form>

              {/* Provider & Category Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[color:var(--admin-border-subtle)]">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[color:var(--admin-text-muted)] font-bold ml-1">المصدر:</span>
                  {(["all", "unsplash", "pexels"] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setSelectedProvider(prov)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        selectedProvider === prov
                          ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-sm"
                          : "bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-muted)] hover:text-foreground"
                      }`}
                    >
                      {prov === "all" ? "الكل" : prov === "unsplash" ? "Unsplash 4K" : "Pexels HD"}
                    </button>
                  ))}
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-xs border border-[color:var(--admin-gold)]"
                          : "bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]"
                      }`}
                    >
                      {cat.nameAr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-[360px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[color:var(--admin-text-muted)]">
                  <Loader2 className="h-8 w-8 animate-spin mb-3 text-amber-400" />
                  <span className="text-xs font-bold">جاري تحميل صور السفر الحية من Unsplash و Pexels...</span>
                </div>
              ) : (selectedProvider === "all" ? mediaList : mediaList.filter((m) => m.source === selectedProvider)).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[color:var(--admin-text-muted)]">
                  <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
                  <span className="text-xs">لم يتم العثور على صور تطابق بحثك.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {(selectedProvider === "all" ? mediaList : mediaList.filter((m) => m.source === selectedProvider)).map((item) => {
                    const isSelected = currentUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelect(item.url, item.titleAr);
                          onClose();
                        }}
                        className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer aspect-3/4 bg-[color:var(--admin-bg-canvas)] transition-all hover:scale-[1.02] hover:shadow-xl ${
                          isSelected
                            ? "border-amber-400 ring-4 ring-amber-400/20"
                            : "border-[color:var(--admin-border-subtle)] hover:border-[color:var(--admin-gold)]"
                        }`}
                      >
                        <img
                          src={item.thumbnail}
                          alt={item.titleAr}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Top Badge */}
                        {item.badge && (
                          <span className="absolute top-2 right-2 rounded-md bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] px-2 py-0.5 text-[10px] font-black shadow-md">
                            {item.badge}
                          </span>
                        )}

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md">
                            <Check size={14} className="stroke-[3]" />
                          </div>
                        )}

                        {/* Bottom Label */}
                        <div className="absolute bottom-2 inset-x-2">
                          <p className="text-[11px] font-bold text-foreground line-clamp-2 leading-snug">
                            {item.titleAr}
                          </p>
                          <span className="text-[9px] text-[color:var(--admin-text-muted)] uppercase font-mono">
                            {item.source}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Custom Upload or URL Tab */
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="rounded-2xl border-2 border-dashed border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-gold-soft)] p-8 text-center flex flex-col items-center justify-center">
              <UploadCloud className="h-12 w-12 text-amber-400 mb-3" />
              <h4 className="text-sm font-black text-foreground mb-1">
                رفع صورة أو جرافيكس من جهازك
              </h4>
              <p className="text-xs text-[color:var(--admin-text-muted)] mb-4 max-w-sm">
                يدعم صيغ PNG, JPG, WebP وحتى ملفات الجرافيكس المتحركة
              </p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[color:var(--admin-gold)] to-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] font-black text-xs hover:brightness-105 transition-all cursor-pointer shadow-md">
                {isUploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
                <span>اختيار ملف من الكمبيوتر</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[color:var(--admin-border-subtle)] w-full" />
              <span className="bg-[color:var(--admin-bg-surface)] px-3 text-xs text-[color:var(--admin-text-muted)] font-bold">أو أدخل رابطاً مباشراً</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[color:var(--admin-text-muted)]">رابط الصورة أو الجرافيكس المباشر</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... أو https://example.com/animation.webp"
                  className="flex-1 rounded-xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)] px-3.5 py-2.5 text-xs text-foreground placeholder:text-[color:var(--admin-text-faint)] focus:outline-none focus:border-[color:var(--admin-gold)]"
                />
                <button
                  type="button"
                  disabled={!customUrl.trim()}
                  onClick={() => {
                    if (customUrl.trim()) {
                      onSelect(customUrl.trim(), "صورة مخصصة");
                      onClose();
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] font-bold text-xs hover:opacity-90 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  استخدام الرابط
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
