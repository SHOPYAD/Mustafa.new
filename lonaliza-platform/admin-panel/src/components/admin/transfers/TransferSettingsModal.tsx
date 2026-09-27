// src/components/admin/transfers/TransferSettingsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Percent, ShieldAlert, Phone, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSave: (newSettings: any) => Promise<void>;
}

export const TransferSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [onlineDiscount, setOnlineDiscount] = useState(10);
  const [depositDiscount, setDepositDiscount] = useState(5);
  const [commission, setCommission] = useState(15);
  const [autoApprove, setAutoApprove] = useState(false);
  const [phone, setPhone] = useState("+90 534 231 12 34");
  const [whatsapp, setWhatsapp] = useState("905342311234");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setOnlineDiscount(settings.onlineFullDiscountPercent ?? 10);
      setDepositDiscount(settings.depositDiscountPercent ?? 5);
      setCommission(settings.defaultCommissionPercent ?? 15);
      setAutoApprove(Boolean(settings.autoApproveFleet));
      setPhone(settings.emergencyContactPhone || "+90 534 231 12 34");
      setWhatsapp(settings.emergencyContactWhatsapp || "905342311234");
    }
  }, [settings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave({
        onlineFullDiscountPercent: Number(onlineDiscount),
        depositDiscountPercent: Number(depositDiscount),
        defaultCommissionPercent: Number(commission),
        autoApproveFleet: Boolean(autoApprove),
        emergencyContactPhone: phone,
        emergencyContactWhatsapp: whatsapp,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
          <h3 className="text-base font-bold text-foreground">إعدادات النقل والخصومات المالية</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Payment Discounts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">خصومات طرق الدفع للعملاء</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
                <label className="block text-xs font-semibold text-foreground mb-1">
                  خصم الدفع الإلكتروني الكامل (100%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={onlineDiscount}
                    onChange={(e) => setOnlineDiscount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm font-bold rounded-lg bg-background border border-border focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">يُطبق تلقائياً على العميل عند الدفع الكامل أونلاين</p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
                <label className="block text-xs font-semibold text-foreground mb-1">
                  خصم دفع العربون (50% أونلاين)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={depositDiscount}
                    onChange={(e) => setDepositDiscount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm font-bold rounded-lg bg-background border border-border focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">يُطبق عند دفع نصف المبلغ أونلاين والنصف كاش</p>
              </div>
            </div>
          </div>

          {/* Fleet Moderation & Commission */}
          <div className="space-y-3 pt-3 border-t border-border/40">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">سياسات الأسطول والعمولة</h4>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">الاعتماد التلقائي لسيارات الموردين</div>
                  <div className="text-[11px] text-muted-foreground">
                    عند التفعيل، تُنشر سيارات الشركات في نتائج البحث فور إدخالها دون انتظار مراجعة يدوية.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">نسبة عمولة المنصة الافتراضية</label>
                <div className="flex items-center gap-1.5 w-24">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs font-bold rounded-lg bg-background border border-border focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-xs text-muted-foreground font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">هاتف الطوارئ والتنسيق</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-background border border-border focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">واتساب المتابعة السريعة</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                dir="ltr"
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-background border border-border focus:border-amber-500 focus:outline-none"
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
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
