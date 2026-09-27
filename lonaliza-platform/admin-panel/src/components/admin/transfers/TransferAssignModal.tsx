// src/components/admin/transfers/TransferAssignModal.tsx
"use client";

import React, { useState } from "react";
import { X, CheckCircle2, SteeringWheel, Car, User, Phone, Shield } from "lucide-react";

interface DriverOption {
  vehicleId: string;
  supplierId: string;
  make: string;
  model: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleClassId: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  availableDrivers: DriverOption[];
  onAssign: (data: {
    bookingId: string;
    supplierId: string;
    vehicleId: string;
    driverName: string;
    driverPhone: string;
    plateNumber: string;
  }) => Promise<void>;
}

export const TransferAssignModal: React.FC<Props> = ({
  isOpen,
  onClose,
  booking,
  availableDrivers,
  onAssign,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [customDriverName, setCustomDriverName] = useState("");
  const [customDriverPhone, setCustomDriverPhone] = useState("");
  const [customPlateNumber, setCustomPlateNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSelectDriver = (driver: DriverOption) => {
    setSelectedVehicleId(driver.vehicleId);
    setCustomDriverName(driver.driverName);
    setCustomDriverPhone(driver.driverPhone);
    setCustomPlateNumber(driver.plateNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDriverName || !customPlateNumber) {
      alert("يرجى تحديد السائق أو إدخال الاسم ورقم اللوحة");
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedDriver = availableDrivers.find((d) => d.vehicleId === selectedVehicleId);
      await onAssign({
        bookingId: booking.id,
        supplierId: selectedDriver?.supplierId || "sup-lonaliza-official",
        vehicleId: selectedVehicleId || "custom",
        driverName: customDriverName,
        driverPhone: customDriverPhone,
        plateNumber: customPlateNumber,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء التعيين");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">تعيين سائق للرحلة</h3>
              <p className="text-xs text-muted-foreground font-mono">{booking.bookingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Trip Summary Card */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>العميل: <strong className="text-foreground">{booking.contact?.name}</strong></span>
              <span>الهاتف: <strong className="text-foreground font-mono" dir="ltr">{booking.contact?.phone}</strong></span>
            </div>
            <div className="text-foreground font-medium">
              المسار: {booking.serviceType === "daily_tour"
                ? `${booking.tour?.titleSnapshot || "جولة يومية"} (${booking.tour?.hours || 8} ساعات)`
                : `${booking.legs?.[0]?.fromLabel || "?"} ← ${booking.legs?.[0]?.toLabel || "?"}`}
            </div>
            <div className="flex justify-between text-muted-foreground pt-1 border-t border-border/30">
              <span>الفئة المطلوبة: <strong className="text-amber-500">{booking.vehicleClassName || "VIP"}</strong></span>
              <span>المبلغ الإجمالي: <strong className="text-emerald-500 font-bold">${booking.pricing?.total}</strong></span>
            </div>
          </div>

          {/* Quick Select Available Drivers */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              اختر من السائقين والسيارات المتاحة والمعتمدة:
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {availableDrivers.map((driver) => {
                const isSelected = selectedVehicleId === driver.vehicleId;
                return (
                  <div
                    key={driver.vehicleId}
                    onClick={() => handleSelectDriver(driver)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-foreground"
                        : "bg-muted/20 hover:bg-muted/50 border-border/50 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? "bg-amber-500 text-slate-950" : "bg-muted text-foreground"}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{driver.driverName}</div>
                        <div className="text-[11px] text-muted-foreground">{driver.make} {driver.model}</div>
                      </div>
                    </div>
                    <div className="text-left font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-bold">
                        {driver.plateNumber}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual / Confirmation Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">اسم السائق</label>
              <input
                type="text"
                value={customDriverName}
                onChange={(e) => setCustomDriverName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                placeholder="اسم السائق الكامل"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">هاتف السائق</label>
              <input
                type="text"
                value={customDriverPhone}
                onChange={(e) => setCustomDriverPhone(e.target.value)}
                dir="ltr"
                className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none font-mono"
                placeholder="+90 5xx xxx xx xx"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">رقم اللوحة</label>
              <input
                type="text"
                value={customPlateNumber}
                onChange={(e) => setCustomPlateNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none font-mono"
                placeholder="34 LONA 01"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "جارٍ التعيين..." : "تأكيد التعيين وإرسال للتطبيق"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
