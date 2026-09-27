// src/components/admin/transfers/RoutesTab.tsx
"use client";

import React, { useState } from "react";
import { Route, Plus, DollarSign, Clock, ArrowLeftRight, Trash2, Pencil, X, MapPin } from "lucide-react";

interface Props {
  routes: any[];
  zones: any[];
  vehicleClasses: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onSaveRoute: (data: any) => Promise<void>;
  onDeleteRoute: (id: string) => Promise<void>;
}

export const RoutesTab: React.FC<Props> = ({
  routes,
  zones,
  vehicleClasses,
  isLoading,
  onRefresh,
  onSaveRoute,
  onDeleteRoute,
}) => {
  const [editingRoute, setEditingRoute] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCity, setAiCity] = useState("istanbul");
  const [aiPreset, setAiPreset] = useState("vip");
  const [aiRouteCount, setAiRouteCount] = useState(20);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  const handleAiGenerate = async () => {
    setAiGenerating(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/transfers/driver/ai-route-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: aiCity,
          pricingPreset: aiPreset,
          routeCount: aiRouteCount,
          prompt: aiPrompt.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setAiResult(data);
        onRefresh();
      } else {
        alert(data.error || "فشل توليد المسارات");
      }
    } catch (e: any) {
      alert("خطأ في الاتصال: " + e.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const getZoneName = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId || z.code === zoneId);
    return zone?.name?.ar || zoneId;
  };

  const getVehicleClassName = (vcId: string) => {
    const vc = vehicleClasses.find((c) => c.id === vcId || c.code === vcId);
    return vc?.name?.ar || vcId;
  };

  const handleOpenAdd = () => {
    setEditingRoute({
      fromZoneId: zones[0]?.id || "",
      toZoneId: zones[1]?.id || "",
      vehicleClassId: vehicleClasses[0]?.id || "",
      direction: "both",
      basePrice: 65,
      currency: "USD",
      returnDiscountPercent: 10,
      nightSurcharge: { startHour: 23, endHour: 6, amount: 10, percent: 0 },
      estimatedDurationMinutes: 45,
      estimatedDistanceKm: 35,
      supplierNet: 50,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route: any) => {
    setEditingRoute({ ...route });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute.fromZoneId || !editingRoute.toZoneId || !editingRoute.vehicleClassId || editingRoute.basePrice === undefined) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    await onSaveRoute(editingRoute);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/60">
        <div>
          <h3 className="text-sm font-bold text-foreground">مصفوفة المسارات والتسعير الذكي</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            تحديد الأسعار الثابتة والمسافات ونسب خصم الذهاب والعودة والرسوم الليلية لكل فئة سيارة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-sm"
          >
            <Route className="w-4 h-4 text-amber-400" />
            <span>توليد مسارات بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مسار يدوي</span>
          </button>
        </div>
      </div>

      {/* Routes Table */}
      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">نقطة الانطلاق (From)</th>
                <th className="py-3 px-4">الوجهة (To)</th>
                <th className="py-3 px-4">فئة السيارة</th>
                <th className="py-3 px-4">الاتجاه</th>
                <th className="py-3 px-4">المسافة / الزمن</th>
                <th className="py-3 px-4">السعر الأساسي</th>
                <th className="py-3 px-4">خصم العودة</th>
                <th className="py-3 px-4">الرسوم الليلية</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {routes.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-foreground">{getZoneName(r.fromZoneId)}</td>
                  <td className="py-3 px-4 font-bold text-foreground">{getZoneName(r.toZoneId)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                      {getVehicleClassName(r.vehicleClassId)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {r.direction === "both" ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <ArrowLeftRight className="w-3 h-3" /> ذهاب وعودة
                      </span>
                    ) : (
                      <span className="text-muted-foreground">اتجاه واحد</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">
                    {r.estimatedDistanceKm} كم / ~{r.estimatedDurationMinutes} د
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-500 text-sm">
                    ${r.basePrice}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-500">
                    {r.returnDiscountPercent}% خصم
                  </td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">
                    +${r.nightSurcharge?.amount || 0}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                        title="تعديل المسار"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا المسار؟")) {
                            onDeleteRoute(r.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-muted hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="حذف المسار"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">
                {editingRoute.id ? "تعديل تسعير المسار" : "إضافة مسار وتسعير جديد"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">نقطة الانطلاق (From)</label>
                  <select
                    value={editingRoute.fromZoneId}
                    onChange={(e) => setEditingRoute({ ...editingRoute, fromZoneId: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name?.ar} ({z.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">الوجهة (To)</label>
                  <select
                    value={editingRoute.toZoneId}
                    onChange={(e) => setEditingRoute({ ...editingRoute, toZoneId: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name?.ar} ({z.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">فئة السيارة</label>
                  <select
                    value={editingRoute.vehicleClassId}
                    onChange={(e) => setEditingRoute({ ...editingRoute, vehicleClassId: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                  >
                    {vehicleClasses.map((vc) => (
                      <option key={vc.id} value={vc.id}>
                        {vc.name?.ar} ({vc.tier})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">الاتجاه</label>
                  <select
                    value={editingRoute.direction}
                    onChange={(e) => setEditingRoute({ ...editingRoute, direction: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                  >
                    <option value="both">كلا الاتجاهين (ذهاب وعودة)</option>
                    <option value="oneway">اتجاه واحد فقط</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">السعر الأساسي ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingRoute.basePrice}
                    onChange={(e) => setEditingRoute({ ...editingRoute, basePrice: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono font-bold text-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">خصم العودة (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editingRoute.returnDiscountPercent}
                    onChange={(e) => setEditingRoute({ ...editingRoute, returnDiscountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">إضافة الليل ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingRoute.nightSurcharge?.amount || 10}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        nightSurcharge: { ...editingRoute.nightSurcharge, amount: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">المسافة المقدرة (كم)</label>
                  <input
                    type="number"
                    value={editingRoute.estimatedDistanceKm || 35}
                    onChange={(e) => setEditingRoute({ ...editingRoute, estimatedDistanceKm: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">المدة المقدرة (دقيقة)</label>
                  <input
                    type="number"
                    value={editingRoute.estimatedDurationMinutes || 45}
                    onChange={(e) => setEditingRoute({ ...editingRoute, estimatedDurationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono"
                  />
                </div>
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
                  حفظ المسار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Route Copilot Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border/80 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">وكيل توليد وتسعير المسارات بالذكاء الاصطناعي</h3>
                  <p className="text-xs text-muted-foreground">توليد مسارات حقيقية للمدينة مع حساب المسافات ومنع التكرار</p>
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
                  تمت معالجة {aiResult.summary?.totalProcessed || aiRouteCount} مساراً حقيقياً وتثبيت الأسعار بالمتجر مع الفرز بالأرخص أولاً للعملاء.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAiResult(null);
                    setIsAiModalOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
                >
                  إغلاق وتحديث الجدول
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">المدينة أو المنطقة المستهدفة:</label>
                  <select
                    value={aiCity}
                    onChange={(e) => setAiCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  >
                    <option value="istanbul">إسطنبول (مطار إسطنبول ومطار صبيحة)</option>
                    <option value="trabzon">طرابزون وريزا وزيغانة</option>
                    <option value="antalya">أنطاليا وألانيا وبيليك</option>
                    <option value="cappadocia">كابادوكيا وقيصري</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">نموذج التسعير الوسطي المعتمد:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "economy", title: "اقتصادي منافس", price: "$45 وسط" },
                      { id: "vip", title: "VIP متوازن", price: "$55 وسط" },
                      { id: "luxury", title: "ملكي فاخر", price: "$75 وسط" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAiPreset(p.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          aiPreset === p.id
                            ? "bg-purple-600/10 border-purple-500 text-purple-400 font-bold"
                            : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className="font-bold">{p.title}</div>
                        <div className="text-[10px] mt-0.5 opacity-80">{p.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">عدد المسارات المطلوب توليدها:</label>
                  <select
                    value={aiRouteCount}
                    onChange={(e) => setAiRouteCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  >
                    <option value={10}>10 مسارات رئيسية الأكثر طلباً</option>
                    <option value={20}>20 مساراً معلماً وسياحياً</option>
                    <option value={35}>35 مساراً شاملاً للمدينة والضواحي</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">توجيهات أو ملاحظات إضافية (اختياري):</label>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="مثلاً: زد مسارات صبنجة أو ركز على فنادق الجانب الآسيوي..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  />
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
                    onClick={handleAiGenerate}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50 transition-colors"
                  >
                    {aiGenerating ? "جاري التوليد ومنع التكرار..." : "توليد المسارات وتثبيت التسعير"}
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
