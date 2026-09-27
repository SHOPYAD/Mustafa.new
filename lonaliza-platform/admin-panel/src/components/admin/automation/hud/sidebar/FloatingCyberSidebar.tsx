"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Zap,
  CheckCircle2,
  Folder,
  Layers,
  Compass,
} from "lucide-react";
import { buildAdminNav, type NavGroup, type NavBranch, type NavLeaf } from "@/components/admin/admin-nav";
import arDict from "@/lib/i18n/dictionaries/ar";

export interface CyberNavSection {
  id: string;
  key: string;
  titleAr: string;
  category: string;
  icon: any;
  color: string;
  description: string;
  href: string;
  metrics: { label: string; value: string };
  availableActions: string[];
}

// Color palette for the 11 groups
const GROUP_COLORS: Record<string, string> = {
  overview: "#00e5ff",
  bookings: "#38bdf8",
  inventory: "#06b6d4",
  storefront: "#a855f7",
  customers: "#ec4899",
  marketing: "#f59e0b",
  ai_center: "#10b981",
  finance: "#eab308",
  legal: "#ef4444",
  system: "#64748b",
  resale: "#8b5cf6",
};

export const REAL_PLATFORM_SECTIONS: CyberNavSection[] = [
  {
    id: "dashboard",
    key: "dashboard",
    titleAr: "لوحة المؤشرات العامة والإحصائيات",
    category: "الرئيسية والمؤشرات",
    icon: Compass,
    color: "#00e5ff",
    description: "الإحصائيات الشاملة للمنصة، حجم المبيعات اليومي، نمو الحجوزات، والأداء التشغيلي المباشر.",
    href: "/admin",
    metrics: { label: "إجمالي التداول اليومي", value: "$307,400 (SAR 1,152,750)" },
    availableActions: ["قراءة وتحليل تقرير الإحصائيات صوتياً", "تحديث المؤشرات المالية", "فحص الحجوزات النشطة"],
  },
  {
    id: "bookings",
    key: "bookings",
    titleAr: "الحجوزات والعمليات التشغيلية",
    category: "الحجوزات والعمليات",
    icon: Layers,
    color: "#38bdf8",
    description: "إدارة ومتابعة كافة حجوزات الطيران والفنادق والنقل، معالجة التذاكر، وطلبات الإلغاء والاسترداد.",
    href: "/admin/bookings",
    metrics: { label: "الحجوزات النشطة اليوم", value: "38 حجزاً مؤكداً" },
    availableActions: ["عرض الحجوزات العاجلة", "مزامنة التذاكر مع GDS", "تأكيد حجوزات الوكالات"],
  },
  {
    id: "hotels",
    key: "hotels",
    titleAr: "محرك الفنادق والـ GDS وشبكة الموردين",
    category: "المنتجات والخدمات",
    icon: Folder,
    color: "#06b6d4",
    description: "محرك البحث الحي On-Demand عبر ترافلبورت وسيرو وبكفير لكافة مدن العالم، مع إدارة عروض الـ 140 فندق المعروضة بالسلايدر الرئيسي.",
    href: "/admin/hotels",
    metrics: { label: "عروض المتجر الرئيسية", value: "140 فندق مختار (تغطية عالمية On-Demand)" },
    availableActions: ["مزامنة أسعار فنادق السلايدر الرئيسي", "تحديث هوامش الربح (+15%)", "فحص اتصال الموردين"],
  },
  {
    id: "flights",
    key: "flights",
    titleAr: "رادار تذاكر الطيران وبوابات GDS",
    category: "المنتجات والخدمات",
    icon: Compass,
    color: "#60a5fa",
    description: "رادار رحلات الطيران الحي، إصدار التذاكر الفوري الآلي، والتحكم في هوامش ربح الوكالات والأفراد.",
    href: "/admin/flights",
    metrics: { label: "ربط GDS التلقائي", value: "Travelport & Seeru" },
    availableActions: ["فحص تذاكر الطيران الصادرة", "تحديث عمولات التذاكر", "مراقبة مسارات الخليج وتركيا"],
  },
  {
    id: "transfers",
    key: "transfers",
    titleAr: "أسطول النقل البري وتتبع السائقين VIP",
    category: "المنتجات والخدمات",
    icon: Folder,
    color: "#10b981",
    description: "أسطول مرسيدس فيتو العائلي، تتبع السائقين بالـ GPS، تسعير المسارات بالكيلومتر، واستقبال المطارات.",
    href: "/admin/transfers",
    metrics: { label: "سيارات مرسيدس فيتو", value: "18 سيارة VIP نشطة" },
    availableActions: ["مراجعة جداول حركة الأسطول", "تعيين سائقي استقبال المطار", "تحديث أسعار مسارات طرابزون"],
  },
  {
    id: "packages",
    key: "packages",
    titleAr: "البرامج والعروض السياحية المتكاملة VIP",
    category: "المنتجات والخدمات",
    icon: Layers,
    color: "#34d399",
    description: "باقات سياحية متكاملة شاملة الطيران والفنادق والجولات اليومية مع تثبيت الصرف والحجز الفوري.",
    href: "/admin/packages",
    metrics: { label: "الباقات المعروضة بالمتجر", value: "24 باقة VIP فعالة" },
    availableActions: ["تحديث أسعار الباقات بالريال", "تفعيل الحجز الفوري للباقات", "إضافة مزارات سياحية جديدة"],
  },
  {
    id: "b2b",
    key: "b2b",
    titleAr: "شبكة وكالات السفر ومحافظ B2B",
    category: "المالية وتوزيع B2B",
    icon: Compass,
    color: "#a855f7",
    description: "محفظة التوريد والديبوزيت المركزي، خطوط الائتمان، أسعار الجملة للشركات، والتسويات المالية.",
    href: "/admin/b2b-wallet",
    metrics: { label: "رصيد ديبوزيت الشركات", value: "$307,400 محفظة مركزية" },
    availableActions: ["مراجعة إيداعات الوكالات", "تعديل خطوط الائتمان", "إصدار كشوف حسابات الشركاء"],
  },
  {
    id: "ads",
    key: "ads",
    titleAr: "حملات Meta Ads و Google Ads وإدارة الـ ROAS",
    category: "التسويق والنمو",
    icon: Zap,
    color: "#f59e0b",
    description: "إدارة الحملات الإعلانية الممولة، مراقبة كلفة النقرة والتحويل، ومضاعفة الميزانية للباقات الرابحة.",
    href: "/admin/ads",
    metrics: { label: "متوسط عائد الإعلانات ROAS", value: "4.8x (ميزانية $1,450 / يوم)" },
    availableActions: ["مضاعفة ميزانية الحملات الأكثر تحويلاً", "إيقاف الإعلانات المنهكة", "توليد 6 نسخ إعلانية جديدة"],
  },
  {
    id: "social",
    key: "social",
    titleAr: "مصنع المحتوى والنشر واستوديو الفيديو",
    category: "التسويق والنشر",
    icon: Sparkles,
    color: "#ec4899",
    description: "نشر متزامن رسمي عبر الـ API لكافة الشبكات (Instagram, TikTok, X, Telegram)، ريلز درون 4K، ومقالات SEO.",
    href: "/admin/publish",
    metrics: { label: "أدلة السفر المفهرسة", value: "48 مقالاً E-E-A-T + 6 ريلز 4K" },
    availableActions: ["إطلاق جدولة منشورات اليوم", "تصدير ريلز البسفور للتيك توك", "طلب أرشفة مقالات SEO"],
  },
  {
    id: "finance",
    key: "finance",
    titleAr: "المالية وبوابات الدفع والعملات",
    category: "المالية والفوترة",
    icon: Folder,
    color: "#eab308",
    description: "إدارة بوابات الدفع الإلكتروني (Iyzico و Stripe)، أسعار صرف العملات، والفواتير الضريبية المعتمدة.",
    href: "/admin/payments",
    metrics: { label: "بوابات الدفع النشطة", value: "Iyzico 3D Secure & Stripe 100%" },
    availableActions: ["فحص تسويات بوابات الدفع", "تحديث أسعار صرف الليرة والريال", "مراجعة الفواتير المصدرة"],
  },
  {
    id: "settings",
    key: "settings",
    titleAr: "إعدادات المنصة والربط البرمجي والأمان",
    category: "النظام والربط",
    icon: Layers,
    color: "#64748b",
    description: "إعدادات الربط البرمجي للموردين، مفاتيح الـ API، خوادم البريد، والهوية البصرية الشاملة للمنصة.",
    href: "/admin/settings",
    metrics: { label: "حالة الربط البرمجي", value: "جميع الـ APIs متصلة 100%" },
    availableActions: ["اختبار اتصال Webhooks", "فحص خادم SMTP", "مراجعة جدار الحماية السيبراني"],
  },
];

interface FloatingCyberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: CyberNavSection) => void;
  activeSectionKey?: string;
}

export default function FloatingCyberSidebar({
  isOpen,
  onClose,
  onSelectSection,
  activeSectionKey,
}: FloatingCyberSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    bookings: true,
    inventory: true,
    marketing: true,
  });

  // Build authentic 11 groups directly from official admin-nav.ts
  const adminGroups: NavGroup[] = useMemo(() => {
    return buildAdminNav(arDict.admin);
  }, []);

  // Flatten all leaves for search and conversion
  const allNavLeaves = useMemo(() => {
    const list: Array<{ group: NavGroup; branch: NavBranch; leaf: NavLeaf }> = [];
    for (const group of adminGroups) {
      for (const branch of group.branches) {
        for (const item of branch.items) {
          list.push({ group, branch, leaf: item });
        }
      }
    }
    return list;
  }, [adminGroups]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const convertLeafToCyberSection = (group: NavGroup, leaf: NavLeaf): CyberNavSection => {
    const color = GROUP_COLORS[group.id] || "#00e5ff";
    let defaultActions = [
      `تحليل ومراجعة بيانات [${leaf.label}] صوتياً`,
      `فحص حالة السجل والاتصال المباشر`,
      `تحديث المؤشرات والبيانات التشغيلية`,
    ];

    if (leaf.href === "/admin") {
      defaultActions = [
        "عرض الإحصائيات الشاملة والـ ROAS وحجم التداول",
        "مراجعة نمو الحجوزات اليومية للأقسام",
        "تحديث مؤشرات أداء الموردين المباشرة",
      ];
    } else if (leaf.href.includes("bookings")) {
      defaultActions = [
        "فحص الحجوزات العاجلة المعلقة",
        "مزامنة التذاكر الصادرة مع GDS",
        "تأكيد حجوزات وكالات السفر B2B",
      ];
    } else if (leaf.href.includes("hotels")) {
      defaultActions = [
        "مزامنة أسعار محرك البحث On-Demand العالمي",
        "تحديث هوامش ربح الفنادق (+15%)",
        "فحص اتصال Travelport و Seeru و PKFare",
      ];
    } else if (leaf.href.includes("flights")) {
      defaultActions = [
        "فحص تذاكر الطيران الصادرة و PNR",
        "تعديل عمولات وكالات الطيران",
        "مراقبة رحلات الخليج وتركيا",
      ];
    } else if (leaf.href.includes("ads")) {
      defaultActions = [
        "مضاعفة ميزانية الحملات الأكثر تحويلاً (ROAS > 4x)",
        "إيقاف الإعلانات المنهكة تلقائياً",
        "توليد 6 نسخ إعلانية جديدة بواسطة الذكاء الاصطناعي",
      ];
    }

    return {
      id: leaf.id,
      key: leaf.id,
      titleAr: leaf.label,
      category: group.label,
      icon: leaf.icon,
      color,
      description:
        leaf.description ||
        `القسم التشغيلي المباشر لإدارة ${leaf.label} ومزامنة السجلات والربط البرمجي.`,
      href: leaf.href,
      metrics: {
        label: "المسار التشغيلي المباشر",
        value: leaf.href,
      },
      availableActions: defaultActions,
    };
  };

  // Filtered search results
  const filteredLeaves = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return null;
    return allNavLeaves.filter(({ group, branch, leaf }) => {
      return (
        leaf.label.toLowerCase().includes(q) ||
        leaf.href.toLowerCase().includes(q) ||
        (leaf.description && leaf.description.toLowerCase().includes(q)) ||
        group.label.toLowerCase().includes(q) ||
        branch.label.toLowerCase().includes(q)
      );
    });
  }, [allNavLeaves, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Cyber Drawer Container */}
      <aside
        className="relative w-full max-w-lg h-full bg-[#020b18]/95 border-l border-cyan-500/40 shadow-[-10px_0_50px_rgba(0,229,255,0.25)] flex flex-col text-right select-none"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-cyan-500/30 flex items-center justify-between bg-[#031429]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <Compass className="w-5 h-5 animate-pulse text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-mono text-white">
                  شجرة تحكم المنصة السيادية
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {allNavLeaves.length} مساراً تشغيلياً
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80 mt-0.5">
                LONALIZA OPERATIONS · 11 OFFICIAL GROUPS
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-white hover:bg-rose-500/20 transition-all"
            title="إغلاق القائمة"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-cyan-500/20 bg-[#020a16]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في كافة الأقسام (فنادق، طيران، أسطول، إعلانات، بوابات...)"
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#031429] border border-cyan-500/30 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <Search className="absolute right-3 w-4 h-4 text-cyan-400/70" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute left-3 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {/* SEARCH MODE RESULTS */}
          {filteredLeaves !== null ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
                <span>نتائج البحث ({filteredLeaves.length}) مسار:</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  إلغاء البحث
                </button>
              </div>

              {filteredLeaves.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  لا توجد مسارات مطابقة لكلمة البحث "{searchTerm}".
                </div>
              ) : (
                filteredLeaves.map(({ group, leaf }) => {
                  const Icon = leaf.icon;
                  const sec = convertLeafToCyberSection(group, leaf);
                  const isActive = activeSectionKey === leaf.id;

                  return (
                    <div
                      key={leaf.id}
                      onClick={() => {
                        onSelectSection(sec);
                        onClose();
                      }}
                      className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                          : "bg-[#031124] border-slate-800/90 hover:border-cyan-500/50 hover:bg-[#041a38]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="p-2.5 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${sec.color}20`,
                            border: `1px solid ${sec.color}60`,
                          }}
                        >
                          <Icon size={18} style={{ color: sec.color }} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {leaf.label}
                            </span>
                            <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40 shrink-0">
                              {group.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                            {leaf.href}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-cyan-400">
                        <span className="text-[11px] font-mono hidden sm:inline">فتح</span>
                        <ChevronLeft size={14} className="group-hover:translate-x-[-2px] transition-transform" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* ACCORDION 11 GROUPS MODE */
            adminGroups.map((group, gIdx) => {
              const isOpenGroup = Boolean(openGroups[group.id]);
              const GroupIcon = group.icon;
              const groupColor = GROUP_COLORS[group.id] || "#00e5ff";
              const totalItems = group.branches.reduce((acc, b) => acc + b.items.length, 0);

              return (
                <div
                  key={group.id}
                  className="rounded-2xl border border-slate-800/90 bg-[#031021] overflow-hidden transition-colors hover:border-slate-700"
                >
                  {/* Group Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full p-3.5 flex items-center justify-between text-right bg-[#031429]/90 hover:bg-[#041c3a] transition-colors border-b border-slate-800/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="p-2 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                        style={{
                          backgroundColor: `${groupColor}15`,
                          border: `1px solid ${groupColor}40`,
                        }}
                      >
                        <GroupIcon size={16} style={{ color: groupColor }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          {gIdx + 1}. {group.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-black/40 border border-slate-700/50">
                          {totalItems}
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isOpenGroup ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
                    </div>
                  </button>

                  {/* Branches & Leaves */}
                  {isOpenGroup && (
                    <div className="p-2 space-y-1.5 bg-[#020b18]/60">
                      {group.branches.map((branch) => (
                        <div key={branch.id} className="space-y-1">
                          {branch.label && (
                            <div className="px-2 py-1 text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1.5 border-r-2 border-cyan-500/50 my-1">
                              <span>{branch.label}</span>
                            </div>
                          )}

                          {branch.items.map((leaf) => {
                            const LeafIcon = leaf.icon;
                            const sec = convertLeafToCyberSection(group, leaf);
                            const isActive = activeSectionKey === leaf.id;

                            return (
                              <div
                                key={leaf.id}
                                onClick={() => {
                                  onSelectSection(sec);
                                  onClose();
                                }}
                                className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  isActive
                                    ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)]"
                                    : "bg-[#031226]/80 border-slate-800/80 hover:border-cyan-500/40 hover:bg-[#041a38]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className="p-1.5 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                      backgroundColor: `${groupColor}15`,
                                      border: `1px solid ${groupColor}40`,
                                    }}
                                  >
                                    <LeafIcon size={14} style={{ color: groupColor }} />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                                      {leaf.label}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-400 truncate">
                                      {leaf.href}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 text-cyan-400/70 group-hover:text-cyan-300">
                                  <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                    فتح
                                  </span>
                                  <ChevronLeft size={13} className="group-hover:translate-x-[-2px] transition-transform" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 border-t border-cyan-500/25 bg-[#020914] text-[10px] font-mono text-slate-400 text-center flex items-center justify-center gap-2">
          <Zap size={12} className="text-amber-400" />
          <span>يمكنك فتح أي قسم صوتياً عبر الوكيل بقول: "افتح قسم [الاسم]"</span>
        </div>
      </aside>
    </div>
  );
}
