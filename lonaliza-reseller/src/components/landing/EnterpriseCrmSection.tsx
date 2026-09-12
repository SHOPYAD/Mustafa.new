"use client";

import {
  BadgePercent,
  Coins,
  CreditCard,
  FileSpreadsheet,
  Receipt,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function EnterpriseCrmSection() {
  const { locale } = useLocale();

  const businessPillars = [
    {
      title: locale === "ar" ? "نظام التسويق بالعمولة (Affiliate)" : "Affiliate & Referral Network",
      desc:
        locale === "ar"
          ? "لوحة مخصصة للمسوقين مع روابط إحالة وتتبع فوري لنسب الأرباح والزيارات وطلبات السحب المالي."
          : "Affiliate portal with unique referral links, real-time conversion tracking, and payout management.",
      icon: BadgePercent,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: locale === "ar" ? "محفظة نقاط الولاء والمكافآت" : "Loyalty Reward Points Wallet",
      desc:
        locale === "ar"
          ? "يحصل المسافر على نقاط تلقائية عند كل حجز، يستطيع تحويلها إلى رصيد مالي أو خصم على حجوزاته القادمة."
          : "Reward customers with loyalty points on every booking, redeemable for discounts on future trips.",
      icon: Coins,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: locale === "ar" ? "فواتير وسندات PDF آلية فاخرة" : "Luxury Branded PDF Invoicing",
      desc:
        locale === "ar"
          ? "توليد فواتير ضريبية وسندات قبض إلكترونية برقم الحجز وبيانات الشركة والعملات المتعددة جاهزة للطباعة."
          : "Automated multi-currency electronic tax invoices and payment receipts with customizable branding.",
      icon: Receipt,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: locale === "ar" ? "بوابات دفع مدمجة وآمنة" : "Integrated Checkout & Payments",
      desc:
        locale === "ar"
          ? "دفع إلكتروني مباشر عبر iyzico لبطاقات فيزا وماستركارد، مع خيار الدفع عبر التحويل البنكي وتأكيد واتساب."
          : "Direct credit card processing via iyzico plus instant WhatsApp bank transfer verification.",
      icon: CreditCard,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <section className="relative py-24 bg-slate-950 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {locale === "ar" ? "منظومة النمو وإدارة العملاء CRM" : "Enterprise Growth & CRM Engine"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {locale === "ar"
              ? "أدوات مبيعات واحتفاظ بالعملاء تضاعف أرباح شركتك السياحية"
              : "Enterprise Commercial Tools Designed to Maximize Repeat Bookings"}
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            {locale === "ar"
              ? "تحكم في قاعدة عملائك، وزع العمولات للمسوقين، وكافئ المسافرين الأوفياء بنقاط الخصم دون الحاجة للاشتراك في برامج CRM خارجية."
              : "Manage customer lifecycles, run an affiliate sales force, and retain travelers with loyalty incentives out of the box."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition-all backdrop-blur-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`size-12 rounded-2xl border flex items-center justify-center ${p.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
