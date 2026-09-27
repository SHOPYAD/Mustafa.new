// src/components/admin/transfers/SuppliersTab.tsx
"use client";

import React, { useState } from "react";
import {
  Building2,
  Plus,
  Car,
  User,
  Phone,
  Mail,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  ShieldAlert,
  X,
  Clock,
  ExternalLink,
  ShieldCheck,
  Ban,
  FileText,
  CreditCard,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface Props {
  suppliers: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onSaveSupplier: (data: any) => Promise<void>;
  onAddPayoutVoucher: (data: any) => Promise<void>;
  onApproveSupplier?: (supplierId: string) => Promise<void>;
  onRejectSupplier?: (supplierId: string, reason?: string) => Promise<void>;
}

export const SuppliersTab: React.FC<Props> = ({
  suppliers,
  isLoading,
  onRefresh,
  onSaveSupplier,
  onAddPayoutVoucher,
  onApproveSupplier,
  onRejectSupplier,
}) => {
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected supplier for viewing complete dossier / documents / bank
  const [dossierSupplier, setDossierSupplier] = useState<any | null>(null);

  // Payout voucher modal state
  const [voucherModalSupplier, setVoucherModalSupplier] = useState<any | null>(null);
  const [voucherAmount, setVoucherAmount] = useState("");
  const [voucherUrl, setVoucherUrl] = useState("");
  const [voucherNote, setVoucherNote] = useState("");
  const [isSubmittingVoucher, setIsSubmittingVoucher] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pendingSuppliers = suppliers.filter((s) => s.status === "pending");
  const activeSuppliers = suppliers.filter((s) => s.status !== "pending");

  const handleOpenAdd = () => {
    setEditingSupplier({
      accountType: "company",
      legalName: "",
      tradeName: "",
      contactEmail: "",
      contactPhone: "",
      commissionPct: 15,
      autoApproveVehicles: false,
      settlementModel: "weekly",
      status: "active",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleSubmitSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier.legalName || !editingSupplier.tradeName || !editingSupplier.contactEmail) {
      alert("يرجى ملء جميع الحقول الإلزامية");
      return;
    }
    await onSaveSupplier(editingSupplier);
    setIsModalOpen(false);
  };

  const handleApprove = async (supplierId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في اعتماد وتفعيل هذا الشريك فوراً؟")) return;
    try {
      setActionLoading(supplierId);
      if (onApproveSupplier) {
        await onApproveSupplier(supplierId);
      } else {
        await onSaveSupplier({ id: supplierId, status: "active", isActive: true });
      }
      if (dossierSupplier?.id === supplierId) {
        setDossierSupplier(null);
      }
    } catch (err: any) {
      alert(err.message || "فشل اعتماد الشريك");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (supplierId: string) => {
    const reason = prompt("يرجى إدخال سبب رفض طلب الشريك (سيتم إبلاغ الشريك به):", "المستندات أو رخصة النقل غير مكتملة");
    if (reason === null) return;
    try {
      setActionLoading(supplierId);
      if (onRejectSupplier) {
        await onRejectSupplier(supplierId, reason);
      } else {
        await onSaveSupplier({ id: supplierId, status: "rejected", rejectionReason: reason });
      }
      if (dossierSupplier?.id === supplierId) {
        setDossierSupplier(null);
      }
    } catch (err: any) {
      alert(err.message || "فشل رفض الشريك");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherAmount || !voucherUrl) {
      alert("يرجى إدخال المبلغ ورابط إيصال التحويل");
      return;
    }
    try {
      setIsSubmittingVoucher(true);
      await onAddPayoutVoucher({
        supplierId: voucherModalSupplier.id,
        amount: Number(voucherAmount),
        voucherUrl,
        note: voucherNote,
        currency: "USD",
      });
      setVoucherModalSupplier(null);
      setVoucherAmount("");
      setVoucherUrl("");
      setVoucherNote("");
    } finally {
      setIsSubmittingVoucher(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-foreground">شركاء النقل وأساطيل الـ VIP</h3>
            {pendingSuppliers.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingSuppliers.length} طلبات انضمام جديدة قيد المراجعة</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة أساطيل شركات النقل المرخصة وسائقي VIP، مراجعة واعتماد السجلات التجارية، فحص الحسابات البنكية (IBAN)، وضبط نسب العمولة.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>إضافة شركة / شريك يدوياً</span>
        </button>
      </div>

      {/* ── SECTION 1: PENDING APPROVALS DOSSIER (Crucial for Reviewing New Signups) ── */}
      {pendingSuppliers.length > 0 && (
        <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/[0.04] via-card to-amber-500/[0.02] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-foreground">طلبات انضمام الشركاء والسائقين الجدد (قيد المراجعة والاعتماد)</h4>
                <p className="text-xs text-muted-foreground">
                  تم تسجيل هذه الحسابات عبر تطبيق لوناليزا كابتن وتنتظر تدقيق أوراق الشركة والحساب البنكي لتفعيل استقبال الرحلات.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950">
              {pendingSuppliers.length} قيد التدقيق
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSuppliers.map((sup) => {
              const hasDocs = Array.isArray(sup.documents) && sup.documents.length > 0;
              const iban = sup.payoutDetails?.iban || "";
              const bankName = sup.payoutDetails?.bankName || "";
              const holder = sup.payoutDetails?.accountHolder || "";

              return (
                <div
                  key={sup.id}
                  className="rounded-2xl border border-amber-500/30 bg-card p-4.5 space-y-3.5 shadow-sm hover:border-amber-500 transition-colors"
                >
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        {sup.accountType === "company" ? (
                          <Building2 className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-black text-foreground">{sup.tradeName}</h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            {sup.accountType === "company" ? "شركة نقل / أسطول" : "سائق مالك VIP"}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          الاسم القانوني: {sup.legalName}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setDossierSupplier(sup)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      title="عرض كامل الملف"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contact & Banking info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-muted/30 border border-border/50">
                    <div className="space-y-1">
                      <div className="text-muted-foreground font-medium">بيانات التواصل:</div>
                      <div className="font-mono text-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span dir="ltr">{sup.contactPhone || "—"}</span>
                      </div>
                      <div className="text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span>{sup.contactEmail}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-muted-foreground font-medium flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-amber-500" />
                        <span>الحساب البنكي (IBAN):</span>
                      </div>
                      {iban ? (
                        <div className="font-mono text-[10px] font-bold text-foreground truncate" dir="ltr">
                          {iban}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-[10px]">لم يتم تسجيل الـ IBAN بعد</div>
                      )}
                      <div className="text-muted-foreground text-[10px] truncate">
                        {bankName ? `${bankName} • ${holder}` : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Documents count & Vehicles preview */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold text-foreground">{sup.vehicleCount || 1}</span> سيارة
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-bold text-foreground">{sup.documents?.length || 0}</span> وثيقة مرفقة
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-amber-500">
                      عمولة المنصة: {sup.commissionPct}%
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => handleApprove(sup.id)}
                      disabled={actionLoading === sup.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{actionLoading === sup.id ? "جارٍ الاعتماد..." : "اعتماد وتفعيل الشريك"}</span>
                    </button>

                    <button
                      onClick={() => handleReject(sup.id)}
                      disabled={actionLoading === sup.id}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all border border-rose-500/30 active:scale-95 disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>رفض</span>
                    </button>

                    <button
                      onClick={() => setDossierSupplier(sup)}
                      className="py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors"
                    >
                      مراجعة الأوراق
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SECTION 2: APPROVED SUPPLIERS DIRECTORY ── */}
      <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-black text-foreground">دليل الشركاء والأساطيل المعتمدة</h4>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {activeSuppliers.length} شركة وسائق مسجل
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4">اسم الشركة التجاري</th>
                <th className="py-3.5 px-4">نوع الحساب والاسم القانوني</th>
                <th className="py-3.5 px-4">بيانات التواصل</th>
                <th className="py-3.5 px-4">الأسطول المعتمد</th>
                <th className="py-3.5 px-4">العمولة</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {activeSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-black text-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{s.tradeName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-foreground">{s.legalName}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {s.accountType === "company" ? "شركة نقل رسمي" : "سائق مالك VIP"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5">
                    <div className="flex items-center gap-1 text-foreground font-mono" dir="ltr">
                      <Phone className="w-3 h-3 text-muted-foreground" /> {s.contactPhone || "—"}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="w-3 h-3" /> {s.contactEmail}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1 font-bold text-foreground">
                      <Car className="w-3.5 h-3.5 text-amber-500" />
                      <span>{s.vehicleCount || 0} سيارات</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-amber-500">
                    {s.commissionPct}%
                  </td>
                  <td className="py-3.5 px-4">
                    {s.status === "active" ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        <span>نشط ومعتمد</span>
                      </span>
                    ) : s.status === "rejected" ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                        <Ban className="w-3 h-3" />
                        <span>مرفوض</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        <span>قيد المراجعة</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setDossierSupplier(s)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-[11px] font-bold transition-colors"
                        title="تفاصيل الملف والأوراق"
                      >
                        <Eye className="w-3 h-3" />
                        <span>الملف والأوراق</span>
                      </button>

                      <button
                        onClick={() => setVoucherModalSupplier(s)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-colors"
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>سند تحويل</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DOSSIER & DOCUMENTS REVIEW MODAL ── */}
      {dossierSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" dir="rtl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/40">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-foreground">
                  ملف الشريك: {dossierSupplier.tradeName}
                </h3>
              </div>
              <button
                onClick={() => setDossierSupplier(null)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Profile Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/20 border border-border/50 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">الاسم القانوني:</span>
                  <div className="font-bold text-foreground mt-0.5">{dossierSupplier.legalName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">نوع الحساب:</span>
                  <div className="font-bold text-foreground mt-0.5">
                    {dossierSupplier.accountType === "company" ? "شركة نقل وسياحة" : "سائق مالك VIP"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">البريد الإلكتروني:</span>
                  <div className="font-mono text-foreground mt-0.5">{dossierSupplier.contactEmail}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">رقم الهاتف:</span>
                  <div className="font-mono text-foreground mt-0.5" dir="ltr">{dossierSupplier.contactPhone || "—"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">نسبة العمولة:</span>
                  <div className="font-mono font-black text-amber-500 mt-0.5">{dossierSupplier.commissionPct}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">حالة الاعتماد:</span>
                  <div className="font-bold mt-0.5">
                    {dossierSupplier.status === "active" ? (
                      <span className="text-emerald-400">معتمد ونشط</span>
                    ) : dossierSupplier.status === "rejected" ? (
                      <span className="text-rose-400">مرفوض</span>
                    ) : (
                      <span className="text-amber-400">قيد المراجعة</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank & Payout Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>تفاصيل الحساب البنكي لتحويل الأرباح (IBAN)</span>
                </h4>
                <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">رقم الآيبان (IBAN):</span>
                    <span className="font-mono font-black text-foreground" dir="ltr">
                      {dossierSupplier.payoutDetails?.iban || "غير مسجل"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">اسم البنك:</span>
                    <span className="font-bold text-foreground">
                      {dossierSupplier.payoutDetails?.bankName || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">اسم صاحب الحساب:</span>
                    <span className="font-bold text-foreground">
                      {dossierSupplier.payoutDetails?.accountHolder || dossierSupplier.legalName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents & Company Papers Review */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>المستندات والأوراق الرسمية المرفوعة للتدقيق</span>
                </h4>

                {Array.isArray(dossierSupplier.documents) && dossierSupplier.documents.length > 0 ? (
                  <div className="space-y-2">
                    {dossierSupplier.documents.map((doc: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-500" />
                          <div>
                            <span className="font-bold text-foreground">
                              {doc.kind === "commercial_registry"
                                ? "السجل التجاري للشركة"
                                : doc.kind === "operating_license"
                                ? "رخصة النقل السياحي (TURSAB / D2)"
                                : doc.kind === "tax_certificate"
                                ? "الشهادة الضريبية"
                                : "وثيقة رسمية"}
                            </span>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              تاريخ الرفع: {new Date(doc.uploadedAt || Date.now()).toLocaleDateString("ar-EG")}
                            </div>
                          </div>
                        </div>

                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>عرض المستند</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">الملف غير متوفر</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-muted/10 border border-dashed border-border/80 text-center text-xs text-muted-foreground">
                    لم يقم الشريك برفع مستندات إضافية أثناء التسجيل.
                  </div>
                )}
              </div>

              {/* Status Decision Footer */}
              {dossierSupplier.status === "pending" && (
                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <button
                    onClick={() => handleApprove(dossierSupplier.id)}
                    disabled={actionLoading === dossierSupplier.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد الشريك وتفعيل حسابه فوراً</span>
                  </button>

                  <button
                    onClick={() => handleReject(dossierSupplier.id)}
                    disabled={actionLoading === dossierSupplier.id}
                    className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-black text-xs border border-rose-500/30 transition-all active:scale-95"
                  >
                    <Ban className="w-4 h-4" />
                    <span>رفض الطلب</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payout Voucher Modal */}
      {voucherModalSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">
                رفع إيصال تحويل بنكي — {voucherModalSupplier.tradeName}
              </h3>
              <button
                onClick={() => setVoucherModalSupplier(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVoucher} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">المبلغ المحول ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={voucherAmount}
                  onChange={(e) => setVoucherAmount(e.target.value)}
                  placeholder="1250.00"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none font-mono font-bold text-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">رابط صورة أو مستند الإيصال البنكي</label>
                <input
                  type="text"
                  required
                  value={voucherUrl}
                  onChange={(e) => setVoucherUrl(e.target.value)}
                  placeholder="https://... /receipt-123.pdf"
                  dir="ltr"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ملاحظة التحويل (رقم الحوالة أو الأسبوع)</label>
                <input
                  type="text"
                  value={voucherNote}
                  onChange={(e) => setVoucherNote(e.target.value)}
                  placeholder="مستحقات أسبوع 10-17 سبتمبر 2026"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setVoucherModalSupplier(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-muted text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVoucher}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingVoucher ? "جارٍ الحفظ..." : "تأكيد رفع الإيصال"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
