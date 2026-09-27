"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  DollarSign,
  BadgePercent,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Sparkles,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PreviewSafeguardsPage() {
  const { locale } = useLocale();

  const [minBooking, setMinBooking] = useState(500);
  const [maxDiscount, setMaxDiscount] = useState(15);
  const [requireApproval, setRequireApproval] = useState(true);

  const [pendingQueue, setPendingQueue] = useState([
    {
      id: "pt_8921a",
      user: "khalid_traveler",
      points: 850,
      valueUsd: 85,
      source: "منشور سياحي في مجتمع Nostr",
      status: "pending",
      date: "منذ ساعتين",
    },
    {
      id: "pt_9422b",
      user: "sara_vip",
      points: 500,
      valueUsd: 50,
      source: "مشاركة ريلز جولة البسفور",
      status: "pending",
      date: "منذ 4 ساعات",
    },
    {
      id: "pt_1029c",
      user: "omar_journey",
      points: 1200,
      valueUsd: 120,
      source: "مراجعة فندقية مصورة",
      status: "pending",
      date: "منذ يوم",
    },
  ]);

  const handleAction = (id: string, newStatus: "approved" | "rejected") => {
    setPendingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Safeguards Header Card */}
      <div className="rounded-2xl border-2 border-emerald-500/20 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {locale === "ar"
                  ? "منظومة الأمان المالي وضوابط منع الخسارة"
                  : "Financial Safeguards & Anti-Loss Protection"}
              </h2>
              <p className="text-xs text-slate-500">
                {locale === "ar"
                  ? "سياسات صارمة لحماية تدفقات وكالتك النقدية ومنع الحجوزات الصفرية أو خصومات النقاط غير المصرحة"
                  : "Strict policies safeguarding agency cash flow, preventing zero-dollar bookings and unverified points"}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>{locale === "ar" ? "الحماية النشطة مفعلة" : "Active Protection Enabled"}</span>
          </span>
        </div>

        {/* 3 Parameter Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span>{locale === "ar" ? "الحد الأدنى لقيمة الحجز" : "Minimum Booking Value"}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">${minBooking}</div>
            <div className="text-[11px] text-slate-500 leading-snug">
              {locale === "ar"
                ? "يمنع استخدام قسائم النقاط في أي حجز يقل عن هذا المبلغ"
                : "Vouchers cannot be applied to bookings below this threshold"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <BadgePercent className="h-4 w-4 text-emerald-600" />
              <span>{locale === "ar" ? "سقف الخصم الأقصى (Cap)" : "Maximum Discount Cap"}</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 font-mono">{maxDiscount}%</div>
            <div className="text-[11px] text-slate-500 leading-snug">
              {locale === "ar"
                ? "يدفع العميل دائماً 85%+ نقداً — لا يمكن أن يصل الحجز إلى $0 أبداً"
                : "Customer must pay 85%+ cash — bookings can never be $0"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-emerald-600" />
              <span>{locale === "ar" ? "اعتماد نقاط السوشيال" : "Social Points Approval"}</span>
            </div>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2 pt-1">
              <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>{locale === "ar" ? "مراجعة إدارية إلزامية" : "Admin Review Required"}</span>
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">
              {locale === "ar"
                ? "النقاط المكتسبة من التفاعل الاجتماعي معلقة حتى اعتمادها"
                : "Points earned from social activity remain pending until admin confirms"}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Points Queue Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <h3 className="text-base font-black text-slate-900">
              {locale === "ar" ? "طابور اعتماد النقاط المعلقة (Pending Points Queue)" : "Pending Points Approval Queue"}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {pendingQueue.filter((p) => p.status === "pending").length} {locale === "ar" ? "طلبات معلقة" : "Pending requests"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-100 font-bold">
              <tr>
                <th className="p-3 text-start">{locale === "ar" ? "المستخدم" : "User"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "مصدر النقاط" : "Source"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "النقاط / القيمة" : "Points / Value"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "التاريخ" : "Date"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "الحالة" : "Status"}</th>
                <th className="p-3 text-end">{locale === "ar" ? "الإجراء الإداري" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-bold text-slate-800">@{item.user}</td>
                  <td className="p-3 text-slate-600">{item.source}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {item.points} pts (${item.valueUsd})
                  </td>
                  <td className="p-3 text-slate-400">{item.date}</td>
                  <td className="p-3">
                    {item.status === "pending" ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        {locale === "ar" ? "معلّق للمراجعة" : "Pending"}
                      </span>
                    ) : item.status === "approved" ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {locale === "ar" ? "تم الاعتماد" : "Approved"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                        {locale === "ar" ? "تم التجميد" : "Rejected"}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-end">
                    {item.status === "pending" ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleAction(item.id, "approved")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                        >
                          {locale === "ar" ? "اعتماد" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(item.id, "rejected")}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors"
                        >
                          {locale === "ar" ? "تجميد" : "Freeze"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">{locale === "ar" ? "مكتمل" : "Resolved"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
