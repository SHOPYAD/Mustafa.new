// src/components/admin/transfers/VehicleClassesTab.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  Car,
  Plus,
  Users,
  Luggage,
  Star,
  ShieldCheck,
  Sparkles,
  Check,
  Trash2,
  Pencil,
  X,
  LayoutGrid,
  List,
  Upload,
  Video,
  Play,
  Image as ImageIcon,
  Wifi,
  Tv,
  Coffee,
  UserCheck,
  Plane,
  Zap,
  Baby,
  Wind,
  EyeOff,
  CheckCircle2,
  Accessibility,
  Clock,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Film,
  Loader2,
  Bot,
  Wand2,
  VolumeX,
  Wine,
} from "lucide-react";
import { AiFleetOnboardingModal } from "./AiFleetOnboardingModal";

interface Props {
  vehicleClasses: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onSaveClass: (data: any) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
}

// Pre-configured rich amenities with icons
export const AVAILABLE_AMENITIES = [
  { id: "wifi_5g", label: "واي فاي 5G فائق السرعة", icon: Wifi },
  { id: "smart_tv", label: "شاشة ذكية / Apple TV / Netflix", icon: Tv },
  { id: "sound_isolated", label: "مقصورة عازلة للصوت بالكامل", icon: VolumeX },
  { id: "massage_seats", label: "مقاعد جلدية VIP مع مساج وتبريد", icon: Sparkles },
  { id: "mini_bar", label: "ثلاجة ومشروبات وضيافة مجانية", icon: Wine },
  { id: "arabic_driver", label: "سائق خاص يتحدث العربية", icon: UserCheck },
  { id: "meet_greet", label: "استقبال بالاسم في المطار وتتبع الرحلات", icon: Plane },
  { id: "chargers_220v", label: "شواحن هواتف ومنافذ كهرباء 220V", icon: Zap },
  { id: "child_seat", label: "مقاعد أطفال معتمدة مجاناً", icon: Baby },
  { id: "dual_ac", label: "تكييف هواء مركزي مزدوج", icon: Wind },
  { id: "privacy_curtains", label: "ستائر خصوصية وزجاج مظلل بالكامل", icon: EyeOff },
  { id: "starlight_roof", label: "سقف مضاء بنجوم السماء (Starlight)", icon: Star },
  { id: "cleanliness_98", label: "نسبة نظافة وتعقيم معتمدة 98%", icon: CheckCircle2 },
  { id: "wheelchair_ready", label: "ملائمة للكراسي المتحركة", icon: Accessibility },
];

// Helper to resolve specific meaningful Lucide icon for any amenity text
export function getAmenityIcon(amenityText: string): React.ElementType {
  if (!amenityText) return Sparkles;
  const t = amenityText.toLowerCase();

  const found = AVAILABLE_AMENITIES.find(
    (a) =>
      t.includes(a.id) ||
      a.label.toLowerCase().includes(t) ||
      t.includes(a.label.toLowerCase())
  );
  if (found) return found.icon;

  if (t.includes("صوت") || t.includes("عازل") || t.includes("عازلة") || t.includes("هدوء")) return VolumeX;
  if (t.includes("مقعد") || t.includes("مقاعد") || t.includes("جلد") || t.includes("مساج") || t.includes("استلقاء")) return Sparkles;
  if (t.includes("شاش") || t.includes("شاشة") || t.includes("تلفز") || t.includes("tv") || t.includes("netflix") || t.includes("apple")) return Tv;
  if (t.includes("ثلاج") || t.includes("ثلاجة") || t.includes("مشروب") || t.includes("مشروبات") || t.includes("ضياف") || t.includes("بارد") || t.includes("باردة") || t.includes("ماء")) return Wine;
  if (t.includes("واي فاي") || t.includes("wifi") || t.includes("انترنت") || t.includes("إنترنت") || t.includes("5g")) return Wifi;
  if (t.includes("شاحن") || t.includes("شواحن") || t.includes("كهرب") || t.includes("usb") || t.includes("منفذ") || t.includes("220v")) return Zap;
  if (t.includes("سائق") || t.includes("لغات") || t.includes("بروتوكول") || t.includes("خاص") || t.includes("محترف")) return UserCheck;
  if (t.includes("حقائب") || t.includes("شنط") || t.includes("امتعة") || t.includes("أمتعة")) return Luggage;
  if (t.includes("تكييف") || t.includes("مكيف") || t.includes("هواء") || t.includes("مركزي")) return Wind;
  if (t.includes("ميكروفون") || t.includes("مايك")) return Mic;
  if (t.includes("ستائر") || t.includes("زجاج") || t.includes("مظلل") || t.includes("خصوصية")) return EyeOff;
  if (t.includes("سقف") || t.includes("نجوم") || t.includes("بانوراما")) return Star;
  if (t.includes("نظافة") || t.includes("تعقيم") || t.includes("معتمد")) return Sparkles;
  if (t.includes("أطفال") || t.includes("اطفال") || t.includes("طفل")) return Baby;
  if (t.includes("طيران") || t.includes("مطار") || t.includes("استقبال") || t.includes("رحلات")) return Plane;
  if (t.includes("كراسي") || t.includes("متحركة")) return Accessibility;
  if (t.includes("جولة") || t.includes("ساعات")) return Clock;
  if (t.includes("مدن") || t.includes("طريق") || t.includes("ملاحة")) return Navigation;
  return Sparkles;
}

export const AVAILABLE_SERVICES = [
  { id: "transfer", label: "توصيل واستقبال مطارات (Transfers)", icon: Plane },
  { id: "daily_tour", label: "جولات سياحية بالساعات (Daily Tours)", icon: Clock },
  { id: "intercity", label: "تنقلات طويلة بين المدن (Intercity)", icon: Navigation },
];

export const AVAILABLE_TIERS = [
  { id: "vip", label: "VIP (ملكي فاخر)", color: "from-purple-600 to-indigo-600" },
  { id: "maybach", label: "Maybach Luxury (قمة الفخامة الرئاسية)", color: "from-amber-500 to-yellow-600" },
  { id: "business", label: "Business (رجال أعمال)", color: "from-blue-600 to-indigo-700" },
  { id: "group", label: "Group / Family (عائلات ومجموعات كبيرة)", color: "from-emerald-600 to-teal-700" },
  { id: "suv", label: "Executive SUV (دفع رباعي فاخر)", color: "from-slate-700 to-slate-900" },
  { id: "electric", label: "Luxury Electric (كهربائي فاخر)", color: "from-cyan-600 to-blue-600" },
];

export const VehicleClassesTab: React.FC<Props> = ({
  vehicleClasses,
  isLoading,
  onRefresh,
  onSaveClass,
  onDeleteClass,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Media Gallery Lightbox modal state
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    title: string;
    images: string[];
    videoUrl?: string;
    currentIndex: number;
  }>({
    isOpen: false,
    title: "",
    images: [],
    videoUrl: "",
    currentIndex: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingClass({
      code: "",
      tier: "vip",
      name: { ar: "", en: "", tr: "" },
      description: { ar: "", en: "", tr: "" },
      exampleModels: [""],
      capacity: { passengers: 6, luggageLarge: 6, luggageSmall: 4 },
      amenities: [
        "واي فاي 5G فائق السرعة",
        "مقصورة عازلة للصوت بالكامل",
        "مقاعد جلدية VIP مع مساج وتبريد",
        "ثلاجة ومشروبات وضيافة مجانية",
        "سائق خاص يتحدث العربية",
        "نسبة نظافة وتعقيم معتمدة 98%",
      ],
      serviceTypes: ["transfer", "daily_tour"],
      images: [
        { url: "https://images.unsplash.com/photo-1544620341-f53c95b3b9a7?w=1600&q=80", isCover: true },
      ],
      videoUrl: "",
      driver: {
        name: "مراد دمير",
        phone: "+90 530 000 0000",
        rating: 4.98,
        tripsCount: 342,
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      },
      cleanlinessScore: 98,
      isActive: true,
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vc: any) => {
    setEditingClass({
      ...vc,
      amenities: vc.amenities || [],
      serviceTypes: vc.serviceTypes || ["transfer", "daily_tour"],
      images: vc.images?.length
        ? vc.images
        : [{ url: "https://images.unsplash.com/photo-1544620341-f53c95b3b9a7?w=1600&q=80", isCover: true }],
      driver: vc.driver || {
        name: "سائق معتمد",
        phone: "+90 530 000 0000",
        rating: 4.95,
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      },
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Upload handler for files (images & video)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVideo = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/transfers/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!data.ok) {
          throw new Error(data.error || "فشل رفع الملف");
        }

        if (isVideo || data.mediaType === "video") {
          setEditingClass((prev: any) => ({
            ...prev,
            videoUrl: data.url,
          }));
        } else {
          setEditingClass((prev: any) => {
            const currentImgs = prev.images || [];
            const isFirst = currentImgs.length === 0;
            return {
              ...prev,
              images: [...currentImgs, { url: data.url, isCover: isFirst }],
            };
          });
        }
      }
    } catch (err: any) {
      setUploadError(err.message || "حدث خطأ أثناء رفع الملف");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSetCoverImage = (index: number) => {
    setEditingClass((prev: any) => {
      const updated = prev.images.map((img: any, i: number) => ({
        ...img,
        isCover: i === index,
      }));
      return { ...prev, images: updated };
    });
  };

  const handleRemoveImage = (index: number) => {
    setEditingClass((prev: any) => {
      const updated = prev.images.filter((_: any, i: number) => i !== index);
      if (updated.length > 0 && !updated.some((img: any) => img.isCover)) {
        updated[0].isCover = true;
      }
      return { ...prev, images: updated };
    });
  };

  const handleToggleAmenity = (amenityLabel: string) => {
    setEditingClass((prev: any) => {
      const current = prev.amenities || [];
      const exists = current.includes(amenityLabel);
      const updated = exists
        ? current.filter((item: string) => item !== amenityLabel)
        : [...current, amenityLabel];
      return { ...prev, amenities: updated };
    });
  };

  const handleToggleService = (serviceId: string) => {
    setEditingClass((prev: any) => {
      const current = prev.serviceTypes || [];
      const exists = current.includes(serviceId);
      const updated = exists
        ? current.filter((item: string) => item !== serviceId)
        : [...current, serviceId];
      return { ...prev, serviceTypes: updated };
    });
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass.code || !editingClass.name?.ar) {
      alert("كود الفئة والاسم بالعربية مطلوبان");
      return;
    }
    await onSaveClass(editingClass);
    setIsModalOpen(false);
  };

  const openLightbox = (vc: any, startIndex = 0) => {
    const imgs = vc.images?.map((i: any) => i.url) || [];
    setLightboxData({
      isOpen: true,
      title: vc.name?.ar || vc.code,
      images: imgs.length ? imgs : ["https://images.unsplash.com/photo-1544620341-f53c95b3b9a7?w=1600&q=80"],
      videoUrl: vc.videoUrl || "",
      currentIndex: startIndex,
    });
  };

  return (
    <div className="space-y-5 animate-fadeIn" dir="rtl">
      {/* Header with View Mode Switcher and Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>أسطول فئات السيارات الفاخرة المعتمدة بالمنصة</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة الفئات القياسية المعروضة للعملاء، دعم رفع الصور وفيديوهات 360°، تخصيص المميزات والخدمات، وملفات السائقين.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="عرض الشبكة (Grid)"
            >
              <LayoutGrid size={15} />
              <span>شبكة</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="عرض القائمة (List)"
            >
              <List size={15} />
              <span>قائمة تفصيلية</span>
            </button>
          </div>

          {/* AI Fleet Copilot CTA */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 transition-all shadow-md shadow-amber-500/25 border border-amber-300 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-slate-950" />
            <span>إضافة ذكية بالذكاء الاصطناعي (AI Copilot)</span>
            <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-950 text-white transition-all shadow-md shadow-purple-900/30 border border-purple-500/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فئة سيارة جديدة</span>
          </button>
        </div>
      </div>

      {/* ── MODE 1: GRID VIEW ── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicleClasses.map((vc) => {
            const coverImg =
              vc.images?.find((i: any) => i.isCover)?.url ||
              vc.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1544620341-f53c95b3b9a7?w=800&q=80";
            const tierObj = AVAILABLE_TIERS.find((t) => t.id === vc.tier) || AVAILABLE_TIERS[0];
            const hasVideo = !!vc.videoUrl;

            return (
              <div
                key={vc.id || vc.code}
                className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden hover:border-purple-500/50 hover:shadow-xl dark:hover:shadow-purple-950/20 transition-all flex flex-col justify-between"
              >
                {/* Visual Cover Header */}
                <div
                  className="relative h-52 w-full bg-slate-950 overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(vc)}
                >
                  <img
                    src={coverImg}
                    alt={vc.name?.ar || vc.code}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

                  {/* Badges Overlay */}
                  <div className="absolute top-3.5 right-3.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r ${tierObj.color} text-white shadow-md uppercase tracking-wider`}
                    >
                      {vc.tier?.toUpperCase()}
                    </span>
                    {hasVideo && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/90 text-white backdrop-blur-md shadow-xs">
                        <Play size={10} className="fill-white" />
                        <span>فيديو 360°</span>
                      </span>
                    )}
                    {vc.isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                        نشطة
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur-sm">
                        معطلة
                      </span>
                    )}
                  </div>

                  {/* Gallery Count & Preview Trigger */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1 px-2 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                    <ImageIcon size={12} />
                    <span>{vc.images?.length || 1}</span>
                    <Maximize2 size={11} className="ms-1 opacity-80" />
                  </div>

                  {/* Cleanliness VIP Badge */}
                  <div className="absolute bottom-16 right-3.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold backdrop-blur-md">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>98% نظافة VIP معتمدة</span>
                  </div>

                  {/* Title & Code */}
                  <div className="absolute bottom-3 right-3.5 left-3.5">
                    <h4 className="text-base font-black text-white leading-snug">{vc.name?.ar}</h4>
                    <div className="text-xs text-purple-200/90 font-medium font-sans">{vc.name?.en}</div>
                  </div>
                </div>

                {/* Details Container */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between text-xs">
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {vc.description?.ar || vc.description?.en || "تجربة نقل سياحي فاخرة بمعايير ملكية."}
                  </p>

                  {/* Capacity & Luggage */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                        <Users size={14} />
                      </div>
                      <span className="font-bold text-xs">سعة {vc.capacity?.passengers || 6} ركاب</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                        <Luggage size={14} />
                      </div>
                      <span className="font-bold text-xs">سعة {vc.capacity?.luggageLarge || 6} حقائب</span>
                    </div>
                  </div>

                  {/* Pre-configured Amenities Badges with Icons */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">أبرز التجهيزات والمميزات:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(vc.amenities || []).slice(0, 4).map((amenity: string, idx: number) => {
                        const IconComp = getAmenityIcon(amenity);
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 border border-purple-200/80 dark:border-purple-800/60 text-[10px] font-bold shadow-2xs"
                          >
                            <IconComp size={12} className="text-purple-700 dark:text-purple-400 shrink-0" />
                            <span>{amenity}</span>
                          </span>
                        );
                      })}
                      {(vc.amenities?.length || 0) > 4 && (
                        <span className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                          +{(vc.amenities.length - 4)} إضافية
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Driver Profile preview */}
                  {vc.driver && (
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={vc.driver.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"}
                          alt={vc.driver.name}
                          className="size-8 rounded-full object-cover border border-purple-300 dark:border-purple-700 shadow-xs"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{vc.driver.name}</div>
                          <div className="text-[10px] text-slate-500">سائق VIP معتمد</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-black text-amber-500">
                        <Star size={12} className="fill-amber-400" />
                        <span>{vc.driver.rating || 4.98}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                    <button
                      type="button"
                      onClick={() => openLightbox(vc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-purple-950 dark:text-purple-100 border border-purple-300 dark:border-purple-700 text-xs font-black shadow-xs transition-colors cursor-pointer"
                    >
                      <ImageIcon size={13} className="text-purple-700 dark:text-purple-400" />
                      <span>معرض الصور والفيديو</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(vc)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-xs border border-purple-600 transition-colors cursor-pointer"
                        title="تعديل الفئة"
                      >
                        <Pencil className="w-3.5 h-3.5 text-white" />
                        <span>تعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف فئة ${vc.name?.ar}؟`)) {
                            onDeleteClass(vc.id || vc.code);
                          }
                        }}
                        className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all shadow-xs cursor-pointer"
                        title="حذف الفئة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODE 2: LIST VIEW (HORIZONTAL RECTANGULAR CARDS WITH SLIDER) ── */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {vehicleClasses.map((vc) => {
            const images = vc.images?.length ? vc.images : [{ url: "https://images.unsplash.com/photo-1544620341-f53c95b3b9a7?w=1600&q=80" }];
            const tierObj = AVAILABLE_TIERS.find((t) => t.id === vc.tier) || AVAILABLE_TIERS[0];
            const hasVideo = !!vc.videoUrl;

            return (
              <div
                key={vc.id || vc.code}
                className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden hover:border-purple-500/50 hover:shadow-xl dark:hover:shadow-purple-950/20 transition-all flex flex-col lg:flex-row items-stretch"
              >
                {/* Horizontal Media Slider Area */}
                <div className="relative lg:w-96 w-full h-64 lg:h-auto bg-slate-950 shrink-0 overflow-hidden">
                  <img
                    src={images[0]?.url}
                    alt={vc.name?.ar}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                    onClick={() => openLightbox(vc)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r ${tierObj.color} text-white shadow-md uppercase`}>
                      {vc.tier?.toUpperCase()}
                    </span>
                    {hasVideo && (
                      <button
                        type="button"
                        onClick={() => openLightbox(vc)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-600 text-white shadow-md cursor-pointer hover:bg-purple-700 transition-colors"
                      >
                        <Play size={11} className="fill-white" />
                        <span>مشاهدة الفيديو</span>
                      </button>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-bold">
                      <Sparkles size={13} className="text-amber-400" />
                      <span>98% نظافة VIP معتمدة</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => openLightbox(vc)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[11px] font-bold hover:bg-white hover:text-black transition-colors"
                    >
                      <Maximize2 size={12} />
                      <span>{images.length} صور</span>
                    </button>
                  </div>
                </div>

                {/* Content Center */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{vc.name?.ar}</span>
                          <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                            {vc.code}
                          </span>
                        </h4>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-bold">{vc.name?.en}</div>
                      </div>

                      {/* Capacity Chips */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold text-xs border border-purple-200 dark:border-purple-800/80">
                          <Users size={14} className="text-purple-700 dark:text-purple-400" />
                          <span>{vc.capacity?.passengers || 6} ركاب</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold text-xs border border-indigo-200 dark:border-indigo-800/80">
                          <Luggage size={14} className="text-indigo-700 dark:text-indigo-400" />
                          <span>{vc.capacity?.luggageLarge || 6} حقائب</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mt-2">
                      {vc.description?.ar || vc.description?.en || "سيارة سياحية فاخرة مجهزة بأرقى وسائل الراحة والضيافة الملكية."}
                    </p>
                  </div>

                  {/* Amenities List with Specific Icons */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">التجهيزات والمميزات المعتمدة:</div>
                    <div className="flex flex-wrap gap-2">
                      {(vc.amenities || []).map((amenity: string, idx: number) => {
                        const IconComp = getAmenityIcon(amenity);
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 text-xs font-bold border border-purple-200/80 dark:border-purple-800/80 shadow-2xs"
                          >
                            <IconComp size={13} className="text-purple-700 dark:text-purple-400 shrink-0" />
                            <span>{amenity}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Driver Card & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {vc.driver && (
                      <div className="flex items-center gap-3">
                        <img
                          src={vc.driver.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"}
                          alt={vc.driver.name}
                          className="size-10 rounded-full object-cover border-2 border-purple-400 shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{vc.driver.name}</span>
                            <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-600 dark:text-amber-300 text-[10px] font-black">
                              <Star size={10} className="fill-amber-400" />
                              <span>{vc.driver.rating || 4.98}</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{vc.driver.phone}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openLightbox(vc)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-purple-950 dark:text-purple-100 border border-purple-300 dark:border-purple-700 text-xs font-black shadow-xs transition-colors cursor-pointer"
                      >
                        <Film size={14} className="text-purple-700 dark:text-purple-400" />
                        <span>استعراض الوسائط</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(vc)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-xs border border-purple-600 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} className="text-white" />
                        <span>تعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف فئة ${vc.name?.ar}؟`)) {
                            onDeleteClass(vc.id || vc.code);
                          }
                        }}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all shadow-xs cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── RICH ADD / EDIT MODAL FORM ── */}
      {isModalOpen && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingClass.id ? "تعديل وإثراء بيانات فئة السيارة" : "إضافة فئة سيارة فاخرة جديدة للأسطول"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أدخل المواصفات الكاملة، ارفع الصور والفيديوهات، وحدد التجهيزات بدقة.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmitModal} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
              {/* SECTION 1: IDENTIFICATION & TIER */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <h4 className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <span>1. التصنيف والمعرف البرمجي الفريد</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      كود الفئة الفريد (Slug / ID) *
                    </label>
                    <input
                      type="text"
                      value={editingClass.code}
                      onChange={(e) => setEditingClass({ ...editingClass, code: e.target.value })}
                      required
                      placeholder="vito_vip أو maybach_s"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      المستوى الفندقي / الأسطول (Tier) *
                    </label>
                    <select
                      value={editingClass.tier}
                      onChange={(e) => setEditingClass({ ...editingClass, tier: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 text-xs font-bold outline-none cursor-pointer"
                    >
                      {AVAILABLE_TIERS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: MULTILINGUAL TITLES & DESCRIPTIONS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <h4 className="text-xs font-black text-purple-600 dark:text-purple-400">2. الأسماء والأوصاف التسويقية</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم بالعربية *</label>
                    <input
                      type="text"
                      value={editingClass.name?.ar || ""}
                      onChange={(e) =>
                        setEditingClass({ ...editingClass, name: { ...editingClass.name, ar: e.target.value } })
                      }
                      required
                      placeholder="مرسيدس فيتو VIP (فخامة فائقة)"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم بالإنجليزية</label>
                    <input
                      type="text"
                      value={editingClass.name?.en || ""}
                      onChange={(e) =>
                        setEditingClass({ ...editingClass, name: { ...editingClass.name, en: e.target.value } })
                      }
                      placeholder="Mercedes-Benz Vito VIP Luxury"
                      dir="ltr"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم بالتركية</label>
                    <input
                      type="text"
                      value={editingClass.name?.tr || ""}
                      onChange={(e) =>
                        setEditingClass({ ...editingClass, name: { ...editingClass.name, tr: e.target.value } })
                      }
                      placeholder="Mercedes Vito VIP Lüks"
                      dir="ltr"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الوصف التسويقي بالعربية</label>
                  <textarea
                    rows={2}
                    value={editingClass.description?.ar || ""}
                    onChange={(e) =>
                      setEditingClass({ ...editingClass, description: { ...editingClass.description, ar: e.target.value } })
                    }
                    placeholder="مقصورة ملكية خاصة لـ 6 ركاب مع مقاعد مساج جلدية متقابلة، شاشة ذكية، ثلاجة مأكولات ومشروبات، طاولة اجتماعات وستائر حماية..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 text-xs outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: DIRECT MEDIA UPLOADER (IMAGES & VIDEO) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <Upload size={14} />
                    <span>3. رفع وسائط السيارة الفاخرة (الصور وفيديوهات 360°)</span>
                  </h4>
                  {isUploading && (
                    <span className="flex items-center gap-1.5 text-xs text-purple-600 font-bold">
                      <Loader2 size={13} className="animate-spin" />
                      <span>جاري رفع الملف إلى السيرفر...</span>
                    </span>
                  )}
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold">
                    {uploadError}
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Image Uploader */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700/60 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-900/30 transition-all cursor-pointer text-center"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                    <div className="p-2.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 mb-2">
                      <ImageIcon size={20} />
                    </div>
                    <span className="font-black text-slate-800 dark:text-slate-200">انقر لرفع صور جديدة من جهازك</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, WEBP حتى 15 ميجابايت (متعدد)</span>
                  </div>

                  {/* Video Uploader */}
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700/60 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30 transition-all cursor-pointer text-center"
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                    <div className="p-2.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 mb-2">
                      <Video size={20} />
                    </div>
                    <span className="font-black text-slate-800 dark:text-slate-200">انقر لرفع فيديو السيارة (360°)</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">MP4, WEBM, MOV حتى 100 ميجابايت</span>
                  </div>
                </div>

                {/* Uploaded Images Gallery Grid */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    الصور المرفوعة ({editingClass.images?.length || 0}):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {(editingClass.images || []).map((img: any, idx: number) => (
                      <div
                        key={idx}
                        className={`group relative h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          img.isCover
                            ? "border-purple-600 shadow-md shadow-purple-500/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-purple-400"
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        {img.isCover && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-purple-600 text-white font-bold text-[9px] shadow-sm">
                            الغلاف
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                          {!img.isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(idx)}
                              className="px-2 py-1 rounded-md bg-purple-600 text-white text-[10px] font-bold hover:bg-purple-700 transition-colors"
                              title="تعيين كصورة غلاف"
                            >
                              غلاف
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                            title="حذف الصورة"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Preview If Present */}
                {editingClass.videoUrl && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-xs text-purple-300">
                        <Film size={14} />
                        <span>فيديو السيارة المرفوع (جاهز للعرض المباشر):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingClass({ ...editingClass, videoUrl: "" })}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                      >
                        إزالة الفيديو
                      </button>
                    </div>
                    <video
                      src={editingClass.videoUrl}
                      controls
                      className="w-full max-h-48 rounded-xl object-contain bg-black"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 4: CAPACITIES */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <h4 className="text-xs font-black text-purple-600 dark:text-purple-400">4. السعة والركاب والأمتعة</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سعة الركاب (أفراد) *</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={editingClass.capacity?.passengers || 6}
                      onChange={(e) =>
                        setEditingClass({
                          ...editingClass,
                          capacity: { ...editingClass.capacity, passengers: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الحقائب الكبيرة (Luggage)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={editingClass.capacity?.luggageLarge || 6}
                      onChange={(e) =>
                        setEditingClass({
                          ...editingClass,
                          capacity: { ...editingClass.capacity, luggageLarge: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الحقائب الصغيرة (Handbags)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={editingClass.capacity?.luggageSmall || 4}
                      onChange={(e) =>
                        setEditingClass({
                          ...editingClass,
                          capacity: { ...editingClass.capacity, luggageSmall: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: PRE-CONFIGURED AMENITIES CHECKBOXES */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-purple-600 dark:text-purple-400">
                    5. التجهيزات والمميزات الجاهزة (حدد لتظهر فوراً على السيارة)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-bold">
                    المحدد: {editingClass.amenities?.length || 0} ميزة
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const Icon = amenity.icon;
                    const isChecked = (editingClass.amenities || []).includes(amenity.label);

                    return (
                      <label
                        key={amenity.id}
                        onClick={() => handleToggleAmenity(amenity.label)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:border-purple-300"
                        }`}
                      >
                        <div
                          className={`size-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <Icon size={14} className={isChecked ? "text-purple-600 dark:text-purple-400 shrink-0" : "text-slate-400 shrink-0"} />
                        <span className="text-xs font-bold leading-tight">{amenity.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 6: SUPPORTED SERVICES */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-black text-purple-600 dark:text-purple-400">6. أنواع الخدمات والرحلات المدعومة</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {AVAILABLE_SERVICES.map((srv) => {
                    const Icon = srv.icon;
                    const isChecked = (editingClass.serviceTypes || []).includes(srv.id);

                    return (
                      <label
                        key={srv.id}
                        onClick={() => handleToggleService(srv.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <div
                          className={`size-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <Icon size={15} className={isChecked ? "text-indigo-600 dark:text-indigo-400 shrink-0" : "text-slate-400 shrink-0"} />
                        <span className="text-xs font-bold">{srv.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 7: DRIVER PROFILE */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-black text-purple-600 dark:text-purple-400">7. بروفايل السائق المعتمد</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم السائق</label>
                    <input
                      type="text"
                      value={editingClass.driver?.name || ""}
                      onChange={(e) =>
                        setEditingClass({
                          ...editingClass,
                          driver: { ...editingClass.driver, name: e.target.value },
                        })
                      }
                      placeholder="مراد دمير"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">هاتف / واتساب السائق</label>
                    <input
                      type="text"
                      value={editingClass.driver?.phone || ""}
                      onChange={(e) =>
                        setEditingClass({
                          ...editingClass,
                          driver: { ...editingClass.driver, phone: e.target.value },
                        })
                      }
                      placeholder="+90 530 000 0000"
                      dir="ltr"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تقييم السائق (من 5)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="5"
                      value={editingClass.driver?.rating || 4.98}
                      onChange={(e) =>
                        setEditingClass({
                          ...editingClass,
                          driver: { ...editingClass.driver, rating: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black shadow-md shadow-purple-500/25 transition-all cursor-pointer"
                >
                  حفظ الفئة في الأسطول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MEDIA GALLERY LIGHTBOX & VIDEO PLAYER MODAL ── */}
      {lightboxData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden text-white animate-fadeIn">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-black/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/50 text-purple-300">
                  <Film size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black">{lightboxData.title}</h3>
                  <div className="text-xs text-slate-400">معرض الصور وعرض الفيديو الفاخر 360°</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLightboxData({ ...lightboxData, isOpen: false })}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lightbox Main Stage */}
            <div className="relative flex-1 min-h-[420px] max-h-[65vh] flex items-center justify-center bg-black/90 p-4">
              {/* If Video is available and toggled or selected */}
              {lightboxData.videoUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <video
                    src={lightboxData.videoUrl}
                    controls
                    autoPlay
                    className="max-h-[58vh] max-w-full rounded-2xl shadow-2xl border border-purple-500/30"
                  />
                  <div className="text-xs text-purple-300 font-bold mt-2 flex items-center gap-1.5">
                    <Play size={12} className="fill-purple-300" />
                    <span>فيديو جولة السيارة 360°</span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={lightboxData.images[lightboxData.currentIndex]}
                    alt=""
                    className="max-h-[58vh] max-w-full object-contain rounded-2xl shadow-2xl"
                  />
                  {lightboxData.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxData((prev) => ({
                            ...prev,
                            currentIndex:
                              prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1,
                          }))
                        }
                        className="absolute right-4 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-colors cursor-pointer"
                        title="الصورة السابقة"
                      >
                        <ChevronRight size={22} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxData((prev) => ({
                            ...prev,
                            currentIndex:
                              prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1,
                          }))
                        }
                        className="absolute left-4 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-colors cursor-pointer"
                        title="الصورة التالية"
                      >
                        <ChevronLeft size={22} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {lightboxData.images.length > 1 && (
              <div className="p-3 border-t border-slate-800 bg-black/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {lightboxData.images.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxData({ ...lightboxData, currentIndex: i })}
                    className={`relative h-14 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      lightboxData.currentIndex === i
                        ? "border-purple-500 scale-105 shadow-md shadow-purple-500/30"
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI FLEET ONBOARDING COPILOT MODAL ── */}
      <AiFleetOnboardingModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSaveDirect={async (vc) => {
          await onSaveClass(vc);
          onRefresh();
        }}
        onEditInForm={(vc) => {
          setEditingClass(vc);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
};
