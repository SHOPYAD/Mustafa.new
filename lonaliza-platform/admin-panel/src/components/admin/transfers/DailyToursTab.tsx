// src/components/admin/transfers/DailyToursTab.tsx
"use client";

import React, { useState } from "react";
import { Clock, Plus, MapPin, DollarSign, Calendar, Trash2, Pencil, X, Check, Trees, Eye } from "lucide-react";

interface Props {
  tours: any[];
  vehicleClasses: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onSaveTour: (data: any) => Promise<void>;
  onDeleteTour: (id: string) => Promise<void>;
}

export const DailyToursTab: React.FC<Props> = ({
  tours,
  vehicleClasses,
  isLoading,
  onRefresh,
  onSaveTour,
  onDeleteTour,
}) => {
  const [editingTour, setEditingTour] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("all");
  const [aiCity, setAiCity] = useState("istanbul");
  const [aiFullDayPrice, setAiFullDayPrice] = useState(180);
  const [aiExtraHourPrice, setAiExtraHourPrice] = useState(20);
  const [aiTourCount, setAiTourCount] = useState(5);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  const handleAiTourGenerate = async () => {
    setAiGenerating(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/transfers/driver/ai-tour-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: aiCity,
          baseFullDayPrice: aiFullDayPrice,
          extraHourPrice: aiExtraHourPrice,
          tourCount: aiTourCount,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setAiResult(data);
        onRefresh();
      } else {
        alert(data.error || "فشل توليد الجولات السياحية");
      }
    } catch (e: any) {
      alert("خطأ في الاتصال: " + e.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const cities = Array.from(new Set(tours.map((t) => t.hubCity))).filter(Boolean);

  const filtered = tours.filter((t) => {
    if (cityFilter !== "all" && t.hubCity?.toLowerCase() !== cityFilter.toLowerCase()) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTour({
      slug: "",
      title: { ar: "", en: "", tr: "" },
      summary: { ar: "", en: "", tr: "" },
      description: { ar: "", en: "", tr: "" },
      hubCity: "Istanbul",
      country: "Turkey",
      category: "nature",
      durationHours: 8,
      itinerary: [
        {
          order: 1,
          name: { ar: "استقبال من الفندق", en: "Hotel Pickup", tr: "Otelden Alınış" },
          description: { ar: "لقاء السائق في بهو الفندق", en: "Meet chauffeur", tr: "Lobide buluşma" },
          kind: "sightseeing",
          stayMinutes: 15,
        },
      ],
      prices: vehicleClasses.map((vc) => ({
        vehicleClassId: vc.id,
        price: vc.tier === "group" ? 280 : vc.tier === "vip" ? 200 : 160,
        currency: "USD",
        minPax: 1,
        maxPax: vc.capacity.passengers,
      })),
      extraHourPrice: { amount: 20, currency: "USD" },
      inclusions: ["سيارة خاصة VIP وسائق", "الوقود ومواقف السيارات", "مياه معدنية مجانية"],
      exclusions: ["تذاكر الدخول والمصاريف الشخصية"],
      driverLanguages: ["ar", "en", "tr"],
      images: [{ url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80", isCover: true }],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tour: any) => {
    setEditingTour({ ...tour });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour.slug || !editingTour.title?.ar || !editingTour.hubCity) {
      alert("يرجى ملء اسم المعرف وعنوان الجولة والمدينة");
      return;
    }
    await onSaveTour(editingTour);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/60">
        <div>
          <h3 className="text-sm font-bold text-foreground">كتالوج الجولات السياحية اليومية بالساعات</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            البرامج السياحية المبرمجة بالسيارات الخاصة في كافة مدن تركيا مع تفاصيل المحطات والأسعار.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-muted/50 border border-border focus:border-amber-500 focus:outline-none"
          >
            <option value="all">كافة المدن</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-sm"
          >
            <Trees className="w-4 h-4 text-amber-200" />
            <span>توليد جولات بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة برنامج جولة يدوي</span>
          </button>
        </div>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const coverImg = t.images?.find((i: any) => i.isCover)?.url || t.images?.[0]?.url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80";
          const startingPrice = t.prices?.[0]?.price || 180;

          return (
            <div
              key={t.id}
              className="rounded-2xl bg-card border border-border/70 overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img
                  src={coverImg}
                  alt={t.title?.ar}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950 shadow-sm">
                    {t.durationHours} ساعات
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/80 text-amber-300 border border-amber-500/30">
                    {t.hubCity}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 left-3">
                  <h4 className="text-sm font-bold text-white leading-snug">{t.title?.ar}</h4>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                  {t.summary?.ar || t.description?.ar}
                </p>

                {/* Itinerary stops count */}
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                  <div className="flex items-center justify-between text-foreground font-semibold">
                    <span className="flex items-center gap-1 text-amber-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.itinerary?.length || 0} محطات توقف سياحية</span>
                    </span>
                    <span className="text-muted-foreground font-mono">
                      +${t.extraHourPrice?.amount || 20}/ساعة إضافية
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {t.itinerary?.map((s: any) => s.name?.ar).filter(Boolean).join(" ← ")}
                  </div>
                </div>

                {/* Pricing summary & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">يبدأ من:</span>
                    <span className="text-base font-extrabold text-emerald-500 font-mono">
                      ${startingPrice} USD
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                      title="تعديل البرنامج"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف ${t.title?.ar}؟`)) {
                          onDeleteTour(t.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-muted hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-colors"
                      title="حذف البرنامج"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && editingTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">
                {editingTour.id ? "تعديل برنامج الجولة السياحية" : "إضافة برنامج جولة جديد"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">اسم المعرف (Slug)</label>
                  <input
                    type="text"
                    value={editingTour.slug}
                    onChange={(e) => setEditingTour({ ...editingTour, slug: e.target.value })}
                    required
                    placeholder="istanbul-bosphorus-vip"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">المدينة المركزية</label>
                  <input
                    type="text"
                    value={editingTour.hubCity}
                    onChange={(e) => setEditingTour({ ...editingTour, hubCity: e.target.value })}
                    required
                    placeholder="Istanbul / Trabzon"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">عنوان الجولة بالعربية</label>
                <input
                  type="text"
                  value={editingTour.title?.ar || ""}
                  onChange={(e) => setEditingTour({ ...editingTour, title: { ...editingTour.title, ar: e.target.value } })}
                  required
                  placeholder="جولة البوسفور ومعالم إسطنبول VIP"
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">المدة الافتراضية (ساعات)</label>
                  <input
                    type="number"
                    min="4"
                    max="16"
                    value={editingTour.durationHours || 8}
                    onChange={(e) => setEditingTour({ ...editingTour, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">سعر الساعة الإضافية ($)</label>
                  <input
                    type="number"
                    min="5"
                    value={editingTour.extraHourPrice?.amount || 20}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        extraHourPrice: { amount: Number(e.target.value), currency: "USD" },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono text-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">رابط الصورة الرئيسية</label>
                <input
                  type="text"
                  value={editingTour.images?.[0]?.url || ""}
                  onChange={(e) =>
                    setEditingTour({
                      ...editingTour,
                      images: [{ url: e.target.value, isCover: true }],
                    })
                  }
                  dir="ltr"
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">الملخص والوصف</label>
                <textarea
                  rows={3}
                  value={editingTour.summary?.ar || editingTour.description?.ar || ""}
                  onChange={(e) =>
                    setEditingTour({
                      ...editingTour,
                      summary: { ...editingTour.summary, ar: e.target.value },
                      description: { ...editingTour.description, ar: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-muted text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  حفظ برنامج الجولة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Tour Copilot Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border/80 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">وكيل توليد وتسعير الجولات السياحية VIP</h3>
                  <p className="text-xs text-muted-foreground">توليد برامج سياحية متكاملة (10 ساعات) مع تسعيرها</p>
                </div>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/50">
                <X className="w-4 h-4" />
              </button>
            </div>

            {aiResult ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <span>✓</span>
                  <span>{aiResult.message}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  أصبحت الجولات متاحة للعملاء في المتجر مع برامج المحطات والتسعير التنافسي.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAiResult(null);
                    setIsAiModalOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                >
                  إغلاق وتحديث
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">المدينة السياحية:</label>
                  <select
                    value={aiCity}
                    onChange={(e) => setAiCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  >
                    <option value="istanbul">إسطنبول (صبنجة، بورصة، البسفور، معشوقية)</option>
                    <option value="trabzon">طرابزون والشمال التركي (أوزنجول، حيدر نبي، ريزا)</option>
                    <option value="antalya">أنطاليا والريفيرا (الشلالات، المدينة القديمة، كيمير)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">سعر اليوم الكامل ($):</label>
                    <input
                      type="number"
                      value={aiFullDayPrice}
                      onChange={(e) => setAiFullDayPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">سعر الساعة الإضافية ($):</label>
                    <input
                      type="number"
                      value={aiExtraHourPrice}
                      onChange={(e) => setAiExtraHourPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">عدد البرامج السياحية:</label>
                  <select
                    value={aiTourCount}
                    onChange={(e) => setAiTourCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  >
                    <option value={3}>3 جولات رئيسية</option>
                    <option value={5}>5 جولات شاملة</option>
                    <option value={8}>8 جولات شاملة للمنطقة</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-muted text-foreground font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={handleAiTourGenerate}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold disabled:opacity-50 transition-colors"
                  >
                    {aiGenerating ? "جاري التوليد..." : "توليد وتثبيت الجولات"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
