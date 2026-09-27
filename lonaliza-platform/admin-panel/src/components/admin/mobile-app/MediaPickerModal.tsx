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

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-foreground/5 backdrop-blur-md animate-in fade-in duration-200' dir="rtl">
      <div className='relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl bg-background border border-primary/30 shadow-2xl overflow-hidden text-foreground'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 sm:p-5 border-b border-primary/20 bg-gradient-to-r from-[#140522] via-[#220a40] to-[#120422]'>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-admin-btn-secondary-bg to-admin-btn-secondary-hover text-[#140522] shadow-md">
              <Compass className="h-5 w-5 stroke-[2.3]" />
            </div>
            <div>
              <h3 className='text-base font-black text-foreground'>{title}</h3>
              <p className='text-xs text-muted-foreground/90 font-medium'>
                اختر من آلاف الصور السياحية عالية الدقة من Unsplash أو ارفع جرافيكس متحرك خاص
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className='p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/10 transition-colors cursor-pointer'
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className='flex items-center gap-2 px-5 pt-3 border-b border-primary/10 bg-background/60'>
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === "library"
                ? "border-admin-btn-secondary-border text-secondary"
                : "border-transparent text-muted-foreground hover:text-slate-200"
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
                ? "border-admin-btn-secondary-border text-secondary"
                : "border-transparent text-muted-foreground hover:text-slate-200"
            }`}
          >
            <UploadCloud size={14} />
            <span>رفع ملف / رابط مخصص</span>
          </button>
        </div>

        {activeTab === "library" ? (
          <>
            {/* Search & Filter Bar */}
            <div className='p-4 space-y-3 bg-background/90 border-b border-primary/15'>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن وجهة، فندق، طيران، أو منظر سياحي (مثال: Cappadocia, Bosphorus, Flight)..."
                    className='w-full rounded-xl bg-card/90 border border-primary/30 pr-10 pl-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border'
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-admin-btn-secondary-bg to-admin-btn-secondary-hover text-[#140522] font-black text-xs hover:brightness-105 transition-all cursor-pointer shrink-0"
                >
                  بحث
                </button>
              </form>

              {/* Provider & Category Filter Row */}
              <div className='flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-primary/10'>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground font-bold ml-1">المصدر:</span>
                  {(["all", "unsplash", "pexels"] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setSelectedProvider(prov)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        selectedProvider === prov
                          ? "bg-secondary text-admin-btn-primary-bg shadow-sm"
                          : "bg-card text-muted-foreground hover:text-foreground"
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
                          ? "bg-primary-hover text-foreground shadow-xs border border-primary/50"
                          : "bg-card text-slate-300 hover:bg-slate-700/80 border border-slate-700/50"
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
                <div className="flex flex-col items-center justify-center py-20 text-primary">
                  <Loader2 className='h-8 w-8 animate-spin mb-3 text-secondary' />
                  <span className="text-xs font-bold">جاري تحميل صور السفر الحية من Unsplash و Pexels...</span>
                </div>
              ) : (selectedProvider === "all" ? mediaList : mediaList.filter((m) => m.source === selectedProvider)).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
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
                        className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer aspect-3/4 bg-background transition-all hover:scale-[1.02] hover:shadow-xl ${
                          isSelected
                            ? "border-admin-btn-secondary-border ring-4 ring-admin-btn-secondary-border/20"
                            : "border-border hover:border-primary"
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
                          <span className='absolute top-2 right-2 rounded-md bg-secondary/90 text-[#140522] px-2 py-0.5 text-[10px] font-black shadow-md'>
                            {item.badge}
                          </span>
                        )}

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className='absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-admin-btn-primary-bg shadow-md'>
                            <Check size={14} className="stroke-[3]" />
                          </div>
                        )}

                        {/* Bottom Label */}
                        <div className="absolute bottom-2 inset-x-2">
                          <p className='text-[11px] font-bold text-foreground line-clamp-2 leading-snug'>
                            {item.titleAr}
                          </p>
                          <span className='text-[9px] text-muted-foreground/80 uppercase font-mono'>
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
            <div className='rounded-2xl border-2 border-dashed border-primary/30 bg-primary/20 p-8 text-center flex flex-col items-center justify-center'>
              <UploadCloud className='h-12 w-12 text-secondary mb-3' />
              <h4 className='text-sm font-black text-foreground mb-1'>
                رفع صورة أو جرافيكس من جهازك
              </h4>
              <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                يدعم صيغ PNG, JPG, WebP وحتى ملفات الجرافيكس المتحركة
              </p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-admin-btn-secondary-bg to-admin-btn-secondary-hover text-admin-btn-primary-bg font-black text-xs hover:brightness-105 transition-all cursor-pointer shadow-md">
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
              <div className='border-t border-border w-full' />
              <span className='bg-background px-3 text-xs text-muted-foreground font-bold'>أو أدخل رابطاً مباشراً</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">رابط الصورة أو الجرافيكس المباشر</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... أو https://example.com/animation.webp"
                  className='flex-1 rounded-xl bg-card border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border'
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
                  className='px-4 py-2.5 rounded-xl bg-primary-hover text-foreground font-bold text-xs hover:bg-primary disabled:opacity-40 transition-colors cursor-pointer'
                >
                  استخدام الرابط
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
