// src/components/admin/transfers/ZonesTab.tsx
"use client";

import React, { useState } from "react";
import { MapPin, Plus, Plane, Building, Trees, Map, Trash2, Pencil, X } from "lucide-react";

interface Props {
  zones: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onSaveZone: (data: any) => Promise<void>;
  onDeleteZone: (id: string) => Promise<void>;
}

export const ZonesTab: React.FC<Props> = ({
  zones,
  isLoading,
  onRefresh,
  onSaveZone,
  onDeleteZone,
}) => {
  const [cityFilter, setCityFilter] = useState("all");
  const [editingZone, setEditingZone] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cities = Array.from(new Set(zones.map((z) => z.city))).filter(Boolean);

  const filtered = zones.filter((z) => {
    if (cityFilter !== "all" && z.city?.toLowerCase() !== cityFilter.toLowerCase()) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingZone({
      code: "",
      name: { ar: "", en: "", tr: "" },
      city: "Istanbul",
      country: "Turkey",
      kind: "district",
      airportCode: "",
      center: { lat: 41.0082, lng: 28.9784 },
      radiusKm: 8,
      popularityRank: 80,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone: any) => {
    setEditingZone({ ...zone });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone.code || !editingZone.city || !editingZone.name?.ar) {
      alert("كود المنطقة والمدينة والاسم بالعربية مطلوبة");
      return;
    }
    await onSaveZone(editingZone);
    setIsModalOpen(false);
  };

  const getKindBadge = (kind: string) => {
    switch (kind) {
      case "airport":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Plane className="w-3 h-3" /> مطار دولي
          </span>
        );
      case "resort":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Trees className="w-3 h-3" /> منتجع سياحي
          </span>
        );
      case "city_center":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Building className="w-3 h-3" /> مركز مدينة
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-muted text-muted-foreground">
            <MapPin className="w-3 h-3" /> حي / منطقة
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn" dir="rtl">
      {/* Header & City Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/60">
        <div>
          <h3 className="text-sm font-bold text-foreground">المناطق والمطارات المعتمدة في تركيا</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            تغطية كافة مطارات تركيا، مراكز المدن، والمنتجعات مع إحداثياتها ونطاقها الجغرافي.
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
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منطقة / مطار</span>
          </button>
        </div>
      </div>

      {/* Zones Table */}
      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">اسم المنطقة / المطار</th>
                <th className="py-3 px-4">المدينة</th>
                <th className="py-3 px-4">النوع</th>
                <th className="py-3 px-4">الكود / IATA</th>
                <th className="py-3 px-4">الإحداثيات الجغرافية</th>
                <th className="py-3 px-4">النطاق (كم)</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((z) => (
                <tr key={z.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-foreground">{z.name?.ar}</div>
                    <div className="text-[11px] text-muted-foreground">{z.name?.en}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">{z.city}</td>
                  <td className="py-3 px-4">{getKindBadge(z.kind)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-500">
                    {z.airportCode || z.code}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {z.center?.lat?.toFixed(4)}, {z.center?.lng?.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 font-mono">{z.radiusKm} كم</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(z)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                        title="تعديل المنطقة"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف ${z.name?.ar}؟`)) {
                            onDeleteZone(z.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-muted hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="حذف المنطقة"
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

      {/* Modal Add / Edit */}
      {isModalOpen && editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">
                {editingZone.id ? "تعديل المنطقة" : "إضافة منطقة / مطار جديد"}
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
                  <label className="block text-xs font-semibold text-foreground mb-1">المدينة (City)</label>
                  <input
                    type="text"
                    value={editingZone.city}
                    onChange={(e) => setEditingZone({ ...editingZone, city: e.target.value })}
                    required
                    placeholder="Istanbul / Trabzon"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">نوع المنطقة</label>
                  <select
                    value={editingZone.kind}
                    onChange={(e) => setEditingZone({ ...editingZone, kind: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                  >
                    <option value="airport">مطار دولي (Airport)</option>
                    <option value="district">حي / منطقة (District)</option>
                    <option value="city_center">مركز مدينة (City Center)</option>
                    <option value="resort">منتجع سياحي (Resort)</option>
                    <option value="landmark">معلم سياحي (Landmark)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">كود المنطقة (فريد)</label>
                  <input
                    type="text"
                    value={editingZone.code}
                    onChange={(e) => setEditingZone({ ...editingZone, code: e.target.value })}
                    required
                    placeholder="IST_AIRPORT"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">رمز المطار (إن وجد)</label>
                  <input
                    type="text"
                    value={editingZone.airportCode || ""}
                    onChange={(e) => setEditingZone({ ...editingZone, airportCode: e.target.value.toUpperCase() })}
                    placeholder="IST / SAW / AYT"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">الاسم بالعربية</label>
                <input
                  type="text"
                  value={editingZone.name?.ar || ""}
                  onChange={(e) => setEditingZone({ ...editingZone, name: { ...editingZone.name, ar: e.target.value } })}
                  required
                  placeholder="مطار إسطنبول الدولي (IST)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">خط العرض (Lat)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingZone.center?.lat || 41.0}
                    onChange={(e) =>
                      setEditingZone({
                        ...editingZone,
                        center: { ...editingZone.center, lat: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">خط الطول (Lng)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingZone.center?.lng || 28.9}
                    onChange={(e) =>
                      setEditingZone({
                        ...editingZone,
                        center: { ...editingZone.center, lng: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">النطاق (كم)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingZone.radiusKm || 8}
                    onChange={(e) => setEditingZone({ ...editingZone, radiusKm: Number(e.target.value) })}
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
                  حفظ المنطقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
