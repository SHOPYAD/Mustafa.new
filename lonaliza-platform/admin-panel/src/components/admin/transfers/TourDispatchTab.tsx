// src/components/admin/transfers/TourDispatchTab.tsx
"use client";

import React, { useState } from "react";
import {
  Compass,
  Search,
  Clock,
  User,
  Phone,
  Car,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  MapPin,
  RefreshCw,
  Eye,
} from "lucide-react";

interface Props {
  bookings: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenAssign: (booking: any) => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onChangeStatus: (bookingId: string, status: string) => Promise<void>;
}

export const TourDispatchTab: React.FC<Props> = ({
  bookings,
  isLoading,
  onRefresh,
  onOpenAssign,
  onCancelBooking,
  onChangeStatus,
}) => {
  const [search, setSearch] = useState("");
  const [selectedItinerary, setSelectedItinerary] = useState<any | null>(null);

  const tourBookings = bookings.filter((b) => {
    if (b.serviceType !== "daily_tour") return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.bookingNumber?.toLowerCase().includes(q) ||
      b.contact?.name?.toLowerCase().includes(q) ||
      b.tour?.titleSnapshot?.toLowerCase().includes(q) ||
      b.assignment?.driverName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 animate-fadeIn" dir="rtl">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الحجز، اسم العميل، عنوان الجولة..."
            className="w-full pr-10 pl-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/50 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
          <span>تحديث الجولات</span>
        </button>
      </div>

      {/* Tour Bookings List */}
      {tourBookings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border/60">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">لا توجد حجوزات جولات يومية</h3>
          <p className="text-xs text-muted-foreground">عند قيام العميل بحجز جولة سياحية بالساعات ستظهر هنا مع ملف برنامج الرحلة ومحطاتها.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {tourBookings.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-foreground px-2.5 py-0.5 rounded-lg bg-muted border border-border/50">
                      {b.bookingNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      جولة خاصة {b.tour?.hours || 8} ساعات
                    </span>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {b.vehicleClassName || "مرسيدس VIP"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>{b.tour?.titleSnapshot || "جولة سياحية VIP"}</span>
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-foreground font-semibold">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      {b.contact?.name}
                    </span>
                    <span className="font-mono" dir="ltr">{b.contact?.phone}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {new Date(b.tour?.startAt || b.createdAt).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                    <span>موقع الانطلاق: <strong className="text-foreground">{b.tour?.pickupAddress || "الفندق"}</strong></span>
                  </div>
                </div>

                {/* Driver */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 min-w-[200px] text-xs space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground">السائق المرشد المعين:</div>
                  {b.assignment?.driverName ? (
                    <div>
                      <div className="font-bold text-foreground">{b.assignment.driverName}</div>
                      <div className="text-muted-foreground font-mono">{b.assignment.plateNumber}</div>
                    </div>
                  ) : (
                    <div className="text-amber-500 font-bold">⚠️ في انتظار تعيين سائق</div>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2.5 shrink-0">
                  <div className="text-right font-mono text-base font-extrabold text-emerald-500">
                    ${b.pricing?.total} {b.pricing?.currency || "USD"}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenAssign(b)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                    >
                      {b.assignment?.driverName ? "تغيير السائق" : "تعيين سائق"}
                    </button>

                    <button
                      onClick={() => setSelectedItinerary(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      <span>برنامج الرحلة</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Itinerary Preview Modal */}
      {selectedItinerary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">
                برنامج الجولة السياحية — {selectedItinerary.tour?.titleSnapshot}
              </h3>
              <button
                onClick={() => setSelectedItinerary(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground space-y-1">
                <div>العميل: <strong>{selectedItinerary.contact?.name}</strong> ({selectedItinerary.contact?.phone})</div>
                <div>المدة المحددة: <strong>{selectedItinerary.tour?.hours || 8} ساعات</strong> مع سيارة خاصة وسائق</div>
                <div>مكان التجمع: <strong>{selectedItinerary.tour?.pickupAddress}</strong></div>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed">
                {selectedItinerary.tour?.itinerarySummary || "برنامج جولة سياحية مخصص من قبل وكيل الذكاء الاصطناعي بلوناليزا، يشمل أهم المعالم والوقفات التذكارية والوجبات."}
              </div>

              <div className="pt-4 border-t border-border/60 flex justify-end">
                <button
                  onClick={() => {
                    const printWin = window.open("", "_blank");
                    if (printWin) {
                      printWin.document.write(`<h1>برنامج جولة لوناليزا - ${selectedItinerary.bookingNumber}</h1><p>${selectedItinerary.tour?.titleSnapshot}</p>`);
                      printWin.print();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  <Download className="w-4 h-4" />
                  <span>طباعة / تنزيل PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
