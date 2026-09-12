"use client";

import {
  BadgePercent,
  Bot,
  Car,
  CreditCard,
  FileText,
  Globe,
  Hotel,
  Languages,
  Layers,
  LayoutGrid,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Package,
  Plane,
  Receipt,
  Scan,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  Users,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function FeaturesGrid() {
  const { dir } = useLocale();

  const featureCards = [
    {
      category: "محرك الحجوزات الموحد",
      icon: Hotel,
      badge: "6 خدمات متكاملة",
      color: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-400",
      features: [
        "فنادق عالمية: ربط مباشر مع Travel Advisor و Booking.com15 وكتالوج داخلي",
        "طيران دولي ومحلي: محرك SkyScrapper مع واجهة Travelpayouts المخصصة",
        "باقات عطلات وجولات سياحية: برامج تفاعلية يومية مع معرض صور وأسعار متعددة",
        "ترانسفير وسيارات: أسطول داخلي + تكاملات تأجير دولية من المطار",
        "تأشيرات سياحية: نماذج تقديم إلكترونية متكاملة مع إدارة الطلبات",
      ],
    },
    {
      category: "جناح الذكاء الاصطناعي",
      icon: Bot,
      badge: "Gemini 2.0 AI",
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
      features: [
        "صانع البرامج السياحية: توليد جداول رحلات متكاملة ومفصلة بالذكاء الاصطناعي",
        "تصدير كتيبات PDF فاخرة: برامج الرحلات مصممة للطباعة والإرسال للعملاء",
        "شات بوت مبيعات ذكي: يجيب على استفسارات المسافرين ويقترح العروض 24/7",
        "هوامش ربح ديناميكية: قواعد تسعير ذكية ثابتة أو نسبية لكل مزود خدمة",
      ],
    },
    {
      category: "لوحة تحكم وإدارة CRM",
      icon: Layers,
      badge: "PocketBase Enterprise",
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      features: [
        "إدارة الحجوزات والطلبات: تتبع حالات الحجز، الدفع، والتأكيد بضغطة زر",
        "نظام الإلغاء والاسترداد: إدارة سياسات الإلغاء والرسوم والاسترجاع المالي",
        "فواتير وإيصالات PDF: قوالب فواتير مهنية قابلة للتخصيص الكامل",
        "سجلات العملاء والولاء: بطاقات العملاء ومحفظة نقاط المكافآت والكوبونات",
      ],
    },
    {
      category: "محرر بصري وهوية كاملة",
      icon: Scan,
      badge: "Visual Page Builder",
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      features: [
        "محرر الصفحة الرئيسية بالسحب والإفلات: تحكم في الأقسام والبانرات والعروض",
        "تخصيص الهوية البصرية: ألوان، خطوط عربية ولاتينية، شعارات، وأيقونات",
        "مدونة سفر احترافية: مقالات سياحية متوافقة مع محركات البحث SEO",
        "تطبيق PWA مثبت: إمكانية تثبيت لوحة الأدمن والموقع كتطبيق على الموبايل",
      ],
    },
    {
      category: "منظومة التسويق والعمولة",
      icon: Megaphone,
      badge: "Growth Engine",
      color: "from-rose-500/20 to-rose-500/5",
      borderColor: "border-rose-500/30",
      iconColor: "text-rose-400",
      features: [
        "أتمتة البريد وحملات التسويق: قوالب إيميل متجاوبة مع استهداف الجمهور",
        "بكسلات التتبع الإعلاني: Google Ads, Meta Pixel, TikTok, GSC, GTM",
        "نظام التسويق بالعمولة (Affiliate): روابط إحالة ونسب أرباح للمروجين",
        "قسائم التخفيض والعروض الخاصة: كوبونات بنسب أو مبالغ محددة",
      ],
    },
    {
      category: "تعدد اللغات وقنوات التواصل",
      icon: Languages,
      badge: "Auto Translation & Comms",
      color: "from-cyan-500/20 to-cyan-500/5",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
      features: [
        "ترجمة فورية بالذكاء الاصطناعي: عربي، إنجليزي، تركي + أي لغة تضيفها",
        "تعدد العملات والتحويل اللحظي: أسعار الصرف الحية مع بوابات دفع iyzico",
        "تنبيهات WhatsApp Cloud API: رسائل OTP وإشعارات الحجز المباشرة",
        "إشعارات المتصفح وتلغرام: تنبيهات فورية للمشرفين عند كل حجز جديد",
      ],
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-slate-950 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400">
            <Zap className="h-3.5 w-3.5" />
            <span>ميزات نظام LIOTRIP المستخرجة بالكامل</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            كل ما تحتاجه شركتك السياحية في{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              منصة واحدة متكاملة
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            صُمم النظام ليوفر حلاً نهائياً لوكالات السفر ومنظمي الرحلات، مغنياً عن شراء وتطوير عشرات البرمجيات المنفصلة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" dir={dir}>
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`rounded-3xl border ${card.borderColor} bg-gradient-to-b ${card.color} p-7 backdrop-blur-xl shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between space-y-6`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-white/10 ${card.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/10">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight">{card.category}</h3>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {card.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
