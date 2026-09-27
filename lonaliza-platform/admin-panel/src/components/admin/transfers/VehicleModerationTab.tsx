// src/components/admin/transfers/VehicleModerationTab.tsx
"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Sparkles, Car, User, Phone, Image as ImageIcon, Eye } from "lucide-react";

interface Props {
  vehicles: any[];
  autoApproveFleet: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onModerate: (vehicleId: string, status: "approved" | "rejected", note?: string) => Promise<void>;
  onToggleAutoApprove: (val: boolean) => Promise<void>;
}

export const VehicleModerationTab: React.FC<Props> = ({
  vehicles,
  autoApproveFleet,
  isLoading,
  onRefresh,
  onModerate,
  onToggleAutoApprove,
}) => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const filtered = vehicles.filter((v) => {
    if (statusFilter === "all") return true;
    return v.moderationStatus === statusFilter;
  });

  return (
    <div className="space-y-4 animate-fadeIn" dir="rtl">
      {/* Moderation Controls Header */}
      <div className="p-4 rounded-2xl bg-card border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">تدقيق واعتماد سيارات الموردين والشركات</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            مراجعة وفحص بيانات السيارات المدخلة من قبل الشركات، صور المقصورة، رقم اللوحة، ونسبة النظافة قبل إتاحتها للعملاء.
          </p>
        </div>

        {/* Auto Approve Toggle Switch */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/50 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-foreground">الاعتماد التلقائي المباشر للأسطول</div>
            <div className="text-[11px] text-muted-foreground">
              {autoApproveFleet ? "مفعل (تُنشر فوراً)" : "معطل (تتطلب موافقة الأدمن)"}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoApproveFleet}
              onChange={(e) => onToggleAutoApprove(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
        {[
          { id: "pending", label: "بانتظار المراجعة والتدقيق" },
          { id: "approved", label: "السيارات المعتمدة" },
          { id: "rejected", label: "السيارات المرفوضة" },
          { id: "all", label: "كافة السيارات" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === f.id
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Vehicles Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border/60">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            {statusFilter === "pending" ? "لا توجد سيارات بانتظار التدقيق" : "لا توجد نتائج مطابقة"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {statusFilter === "pending"
              ? "تمت مراجعة واعتماد كافة السيارات المدخلة من الموردين بنجاح."
              : "يمكنك التحقق من فلتر الحالات أعلاه."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => {
            const photo = v.ownImages?.[0]?.url || "https://images.unsplash.com/photo-1544620341-f53c95b3b9a7?w=800&q=80";
            return (
              <div
                key={v.id}
                className="rounded-2xl bg-card border border-border/70 overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-sm"
              >
                {/* Photo & Cleanliness Badge */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                  <img
                    src={photo}
                    alt={v.model}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" /> نظافة {v.cleanlinessRating || 98}%
                    </span>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-background/90 text-foreground border border-border/60">
                      {v.plateNumber}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 left-3">
                    <h4 className="text-sm font-bold text-white">{v.make} {v.model} ({v.year})</h4>
                    <div className="text-[11px] text-amber-300/90 font-medium">شركة: {v.supplierName}</div>
                  </div>
                </div>

                {/* Driver & Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-foreground truncate">{v.driver?.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono" dir="ltr">{v.driver?.phone}</div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div>
                      {v.moderationStatus === "approved" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          معتمدة ونشطة
                        </span>
                      ) : v.moderationStatus === "rejected" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          مرفوضة
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                          في انتظار التدقيق
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {v.moderationStatus !== "approved" && (
                        <button
                          onClick={() => onModerate(v.id, "approved")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد</span>
                        </button>
                      )}

                      {v.moderationStatus !== "rejected" && (
                        <button
                          onClick={() => {
                            const reason = prompt("يرجى إدخال سبب الرفض لتوجيهه للمورد:");
                            if (reason !== null) {
                              onModerate(v.id, "rejected", reason);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>رفض</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-border">
            <img src={selectedPhoto} alt="معاينة السيارة" className="w-full h-full object-contain" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 left-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
