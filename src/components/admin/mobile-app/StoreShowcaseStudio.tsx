"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  Layers,
  Palette,
  Eye,
  Check,
  ShieldCheck,
  HelpCircle,
  Wand2,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { MediaPickerModal } from "./MediaPickerModal";

interface ShowcaseSlide {
  id: string;
  category: string;
  headlineAr: string;
  subheadlineAr: string;
  headlineEn: string;
  badgeAr: string;
  themeGradient: string;
  mockupFrame: "titanium-gold" | "titanium-black" | "silver-luxury" | "minimal-notch";
  accentColor: string;
  bgImageUrl?: string;
  appScreenshotUrl?: string;
}

const DEFAULT_SLIDES: ShowcaseSlide[] = [
  {
    id: "slide-1",
    category: "flights",
    headlineAr: "احجز طيرانك بضغطة زر مع أسعار حصرية",
    subheadlineAr: "مقارنة فورية بين أكثر من 500 شركة طيران عالمية مع تأكيد فوري",
    headlineEn: "Instant Flight Bookings with VIP Rates",
    badgeAr: "طيران وفنادق VIP",
    themeGradient: "linear-gradient(135deg, #140522 0%, #2a0e50 50%, #0d0218 100%)",
    mockupFrame: "titanium-gold",
    accentColor: "#F59E0B",
    bgImageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1080&q=80",
    appScreenshotUrl: "",
  },
  {
    id: "slide-2",
    category: "wallet",
    headlineAr: "كاش باك نقدي حقيقي يدخل محفظتك فوراً",
    subheadlineAr: "استرداد نقدي فوري على كل حجز يمكنك سحبه أو إعادة استخدامه في رحلاتك",
    headlineEn: "Real Cash Back Directly Into Your Wallet",
    badgeAr: "المحفظة الذكية",
    themeGradient: "linear-gradient(135deg, #091e14 0%, #134e32 50%, #06150e 100%)",
    mockupFrame: "titanium-gold",
    accentColor: "#10B981",
    bgImageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1080&q=80",
    appScreenshotUrl: "",
  },
  {
    id: "slide-3",
    category: "ai",
    headlineAr: "مستشارك السياحي الذكي 24/7",
    subheadlineAr: "ذكاء اصطناعي لتخطيط جدول الرحلة وحجز الفنادق والجولات خطوة بخطوة",
    headlineEn: "Your 24/7 AI Luxury Travel Concierge",
    badgeAr: "مساعد الذكاء الاصطناعي",
    themeGradient: "linear-gradient(135deg, #1e0836 0%, #44137e 50%, #150527 100%)",
    mockupFrame: "titanium-black",
    accentColor: "#FBBF24",
    bgImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80",
    appScreenshotUrl: "",
  },
  {
    id: "slide-4",
    category: "tours",
    headlineAr: "أفخم الجولات والسيارات الخاصة مع سائق VIP",
    subheadlineAr: "سيارات مرسيدس VIP مع سائق خاص يتحدث العربية في كافة مدن تركيا",
    headlineEn: "Private VIP Chauffeurs & Exclusive Tours",
    badgeAr: "سيارات خاصة VIP",
    themeGradient: "linear-gradient(135deg, #220d3a 0%, #3e1866 50%, #160627 100%)",
    mockupFrame: "titanium-gold",
    accentColor: "#F59E0B",
    bgImageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1080&q=80",
    appScreenshotUrl: "",
  },
];

const STORE_PRESETS = [
  { id: "gplay-phone", name: "Google Play (الهاتف)", width: 1080, height: 1920, ratio: "9:16" },
  { id: "gplay-feature", name: "Google Play (بانر متميز Feature Graphic)", width: 1024, height: 500, ratio: "1024:500" },
  { id: "appstore-69", name: "Apple App Store (شاشات 6.9\" / 6.7\")", width: 1290, height: 2796, ratio: "19.5:9" },
  { id: "appstore-65", name: "Apple App Store (شاشات 6.5\")", width: 1242, height: 2688, ratio: "19.5:9" },
] as const;

export function StoreShowcaseStudio() {
  const [slides, setSlides] = useState<ShowcaseSlide[]>(DEFAULT_SLIDES);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<(typeof STORE_PRESETS)[number]>(STORE_PRESETS[0]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"bg" | "screenshot">("bg");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentSlide = slides[activeSlideIdx] || slides[0];

  const updateCurrentSlide = (patch: Partial<ShowcaseSlide>) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIdx ? { ...s, ...patch } : s))
    );
  };

  const handleGenerateAiShowcase = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/admin/mobile-app/ai-showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.slides)) {
        setSlides(data.slides);
        setActiveSlideIdx(0);
      }
    } catch {
      alert("تعذر الاتصال بمولد الذكاء الاصطناعي");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // High quality canvas rendering for download
  const downloadShowcaseImage = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = selectedPreset.width;
      canvas.height = selectedPreset.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const isFeatureGraphic = selectedPreset.id === "gplay-feature";

      // 1. Draw Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#140522");
      grad.addColorStop(0.5, "#2a0e50");
      grad.addColorStop(1, "#0d0218");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Background Image with dark overlay if exists
      if (currentSlide.bgImageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // continue on error
            img.src = currentSlide.bgImageUrl!;
          });
          if (img.width > 0) {
            ctx.save();
            ctx.globalAlpha = 0.25;
            // Cover fit
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShiftX = (canvas.width - img.width * ratio) / 2;
            const centerShiftY = (canvas.height - img.height * ratio) / 2;
            ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
            ctx.restore();
          }
        } catch {}
      }

      // Draw Top / Header Glow
      const glowGrad = ctx.createRadialGradient(
        canvas.width / 2,
        0,
        50,
        canvas.width / 2,
        0,
        canvas.width * 0.75
      );
      glowGrad.addColorStop(0, "rgba(245, 158, 11, 0.35)");
      glowGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

      // 3. Draw Arabic Marketing Typography
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (isFeatureGraphic) {
        // Feature graphic layout (1024x500)
        // Badge
        ctx.fillStyle = currentSlide.accentColor;
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(currentSlide.badgeAr || "LONALIZA VIP", canvas.width / 2, 80);

        // Headline
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 48px sans-serif";
        ctx.fillText(currentSlide.headlineAr, canvas.width / 2, 170);

        // Subtitle
        ctx.fillStyle = "#E2E8F0";
        ctx.font = "normal 26px sans-serif";
        ctx.fillText(currentSlide.subheadlineAr, canvas.width / 2, 240);

        // Brand signature
        ctx.fillStyle = "#F59E0B";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("🌟 Lonaliza — Luxury Travel Concierge & Cash Back", canvas.width / 2, 430);
      } else {
        // Vertical Store Screenshot (1080x1920 or 1290x2796)
        const scale = canvas.width / 1080;

        // Badge Pill
        const badgeY = 140 * scale;
        ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
        const badgeWidth = 320 * scale;
        const badgeHeight = 52 * scale;
        ctx.beginPath();
        ctx.roundRect(
          (canvas.width - badgeWidth) / 2,
          badgeY - badgeHeight / 2,
          badgeWidth,
          badgeHeight,
          26 * scale
        );
        ctx.fill();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        ctx.fillStyle = currentSlide.accentColor;
        ctx.font = `bold ${22 * scale}px sans-serif`;
        ctx.fillText(currentSlide.badgeAr || "LONALIZA VIP", canvas.width / 2, badgeY);

        // Primary Headline
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `900 ${56 * scale}px sans-serif`;
        ctx.fillText(currentSlide.headlineAr, canvas.width / 2, 250 * scale);

        // Subtitle
        ctx.fillStyle = "#CBD5E1";
        ctx.font = `normal ${28 * scale}px sans-serif`;
        ctx.fillText(currentSlide.subheadlineAr, canvas.width / 2, 340 * scale);

        // 4. Draw Device Mockup Phone
        const phoneWidth = canvas.width * 0.78;
        const phoneHeight = canvas.height * 0.68;
        const phoneX = (canvas.width - phoneWidth) / 2;
        const phoneY = canvas.height - phoneHeight + 60 * scale;

        // Phone Frame Shadow
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 60 * scale;
        ctx.shadowOffsetY = 30 * scale;

        // Phone Outer Border (Titanium Gold)
        ctx.fillStyle = currentSlide.mockupFrame === "titanium-black" ? "#1e293b" : "#F59E0B";
        ctx.beginPath();
        ctx.roundRect(phoneX, phoneY, phoneWidth, phoneHeight, 56 * scale);
        ctx.fill();
        ctx.restore();

        // Phone Inner Bezel
        const innerPadding = 12 * scale;
        ctx.fillStyle = "#09090b";
        ctx.beginPath();
        ctx.roundRect(
          phoneX + innerPadding,
          phoneY + innerPadding,
          phoneWidth - innerPadding * 2,
          phoneHeight - innerPadding * 2,
          46 * scale
        );
        ctx.fill();

        // Phone Screen Area (draw screenshot or default app UI mockup)
        const screenX = phoneX + innerPadding + 4 * scale;
        const screenY = phoneY + innerPadding + 4 * scale;
        const screenW = phoneWidth - innerPadding * 2 - 8 * scale;
        const screenH = phoneHeight - innerPadding * 2 - 8 * scale;

        // Dynamic Island
        ctx.fillStyle = "#000000";
        const islandW = 160 * scale;
        const islandH = 34 * scale;
        ctx.beginPath();
        ctx.roundRect((canvas.width - islandW) / 2, screenY + 16 * scale, islandW, islandH, 17 * scale);
        ctx.fill();

        // Screen default content
        ctx.fillStyle = "#140522";
        ctx.beginPath();
        ctx.roundRect(screenX, screenY, screenW, screenH, 42 * scale);
        ctx.fill();

        // Screen App Logo & Text
        ctx.fillStyle = "#F59E0B";
        ctx.font = `bold ${32 * scale}px sans-serif`;
        ctx.fillText("LONALIZA", canvas.width / 2, screenY + 140 * scale);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${24 * scale}px sans-serif`;
        ctx.fillText("تطبيق السفر والسياحة الفاخرة", canvas.width / 2, screenY + 190 * scale);
      }

      // Download
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `lonaliza-showcase-${currentSlide.category}-${selectedPreset.id}.png`;
      a.href = url;
      a.click();
    } catch (err) {
      alert("حدث خطأ أثناء تصدير الصورة");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="admin-isolated-dark space-y-6 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#140522] via-[#1a082e] to-[#0f031b] p-6 sm:p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-purple-950 font-black shadow-lg shadow-amber-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">
                استوديو شاشات المتاجر والأصول التسويقية بالذكاء الاصطناعي (Store Showcase Studio)
              </h2>
              <span className="rounded-md border border-amber-400/40 bg-amber-400/20 px-2 py-0.5 text-[11px] font-black text-amber-300">
                Official Stores Ready
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              تصميم وتصدير لقطات الشاشة الاحترافية المعتمدة لمتجر Google Play و Apple App Store مع إطارات هواتف فاخرة
              ونصوص تسويقية بالذكاء الاصطناعي.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={downloadShowcaseImage}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 px-5 py-2.5 text-xs font-black text-purple-950 shadow-md shadow-amber-500/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-purple-950" /> : <Download className="h-4 w-4 text-purple-950" />}
            <span>تصدير وتنزيل الشاشة بدقة ({selectedPreset.width}×{selectedPreset.height})</span>
          </button>
        </div>
      </div>

      {/* Preset Store Dimensions Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-purple-950/60 p-2.5 rounded-2xl border border-purple-500/30">
        <span className="text-xs font-black text-amber-300 px-2 flex items-center gap-1.5">
          <Smartphone className="h-4 w-4" />
          المقاس المعتمد:
        </span>
        {STORE_PRESETS.map((preset) => {
          const isActive = selectedPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedPreset(preset)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-amber-400 text-purple-950 shadow-md font-black"
                  : "bg-white/5 text-purple-200 hover:bg-white/10"
              }`}
            >
              <span>{preset.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${isActive ? "bg-purple-950/20 text-purple-950 font-black" : "bg-black/40 text-purple-300"}`}>
                {preset.width}×{preset.height}
              </span>
            </button>
          );
        })}
      </div>

      {/* AI Showcase Generator Copilot */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#200a3b] via-[#320f5c] to-[#200a3b] p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-purple-950 font-black">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">توليد وصياغة شاشات العرض بالذكاء الاصطناعي (Gemini ASO AI)</h3>
              <p className="text-[11px] text-purple-200">
                أدخل فكرة الحملة أو الميزة وسيقوم الذكاء الاصطناعي بكتابة وتنسيق كافة الشاشات بأفضل معايير ASO لجذب التحميلات.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="مثال: التركيز على رحلات الطيران الفاخرة، كاش باك المحفظة الفورية، السائق الخاص VIP..."
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white placeholder:text-purple-300/60 focus:bg-white/15 focus:outline-amber-400"
          />
          <button
            type="button"
            onClick={handleGenerateAiShowcase}
            disabled={isAiGenerating}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 px-5 py-2.5 text-xs font-black text-purple-950 shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isAiGenerating ? <Loader2 className="h-4 w-4 animate-spin text-purple-950" /> : <Sparkles className="h-4 w-4 text-purple-950" />}
            <span>توليد الشاشات بالذكاء الاصطناعي</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Customizer Controls (Left) & Realtime Showcase Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Slide Selector & Form Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Slide Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSlideIdx(idx)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition shrink-0 cursor-pointer ${
                  activeSlideIdx === idx
                    ? "bg-amber-400 text-purple-950 shadow-md"
                    : "bg-white/5 border border-white/10 text-purple-200 hover:bg-white/10"
                }`}
              >
                <span>شاشة {idx + 1}:</span>
                <span className="truncate max-w-[120px]">{s.badgeAr || s.category}</span>
              </button>
            ))}
          </div>

          {/* Current Slide Form */}
          <div className="rounded-2xl border border-purple-500/30 bg-white/5 p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-amber-300 block mb-1">العنوان التسويقي الرئيسي (بالعربية)</label>
              <input
                type="text"
                value={currentSlide.headlineAr}
                onChange={(e) => updateCurrentSlide({ headlineAr: e.target.value })}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-black text-white focus:bg-white/15 focus:outline-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-amber-300 block mb-1">الوصف الفرعي الجذاب (Subheadline)</label>
              <textarea
                rows={2}
                value={currentSlide.subheadlineAr}
                onChange={(e) => updateCurrentSlide({ subheadlineAr: e.target.value })}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white focus:bg-white/15 focus:outline-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">الشارة العلوية (Badge)</label>
                <input
                  type="text"
                  value={currentSlide.badgeAr}
                  onChange={(e) => updateCurrentSlide({ badgeAr: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white focus:bg-white/15 focus:outline-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">إطار الهاتف (Mockup Frame)</label>
                <select
                  value={currentSlide.mockupFrame}
                  onChange={(e) => updateCurrentSlide({ mockupFrame: e.target.value as any })}
                  className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white focus:bg-slate-800 focus:outline-amber-400"
                >
                  <option value="titanium-gold">تيتانيوم ذهبي فاخر (Titanium Gold)</option>
                  <option value="titanium-black">تيتانيوم أسود ملكي (Titanium Black)</option>
                  <option value="silver-luxury">فضي ملوكي (Silver Luxury)</option>
                </select>
              </div>
            </div>

            {/* Background Image / Travel Artwork */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300">الخلفية والمناظر السياحية الفاخرة</label>
                <button
                  type="button"
                  onClick={() => {
                    setMediaTarget("bg");
                    setIsMediaPickerOpen(true);
                  }}
                  className="flex items-center gap-1 text-[11px] font-black text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>تصفح مكتبة Unsplash & Pexels</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentSlide.bgImageUrl || ""}
                  onChange={(e) => updateCurrentSlide({ bgImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono text-white focus:bg-white/15 focus:outline-amber-400"
                  dir="ltr"
                />
                {currentSlide.bgImageUrl && (
                  <img
                    src={currentSlide.bgImageUrl}
                    alt="bg preview"
                    className="h-9 w-9 rounded-lg object-cover border border-amber-400/40 shrink-0"
                  />
                )}
              </div>
            </div>

            {/* Store Compliance Checklist */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>شروط ومعايير القبول في Google Play و App Store:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-emerald-200/90 list-disc list-inside">
                <li>التباين اللوني العالي للنصوص لضمان وضوح القراءة للزوار</li>
                <li>أبعاد دقيقة ومطابقة للمقاييس الرسمية (بدون تشويه نسبي)</li>
                <li>خلفيات كاملة بدون أي شفافية ألفا غير مدعومة في كونسول المتجر</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Canvas Preview (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-3xl bg-black/40 border border-purple-500/30 shadow-inner">
          <div className="text-xs font-bold text-purple-300 mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-400" />
            <span>معاينة حية فورية للشاشة الترويجية:</span>
          </div>

          {/* Interactive Screen Mockup Container */}
          <div
            className="relative overflow-hidden rounded-3xl shadow-2xl border border-amber-400/30 transition-all duration-300 flex flex-col items-center justify-between p-6 text-center"
            style={{
              width: selectedPreset.id === "gplay-feature" ? "100%" : "320px",
              height: selectedPreset.id === "gplay-feature" ? "220px" : "560px",
              background: currentSlide.themeGradient,
            }}
          >
            {/* Background Image overlay */}
            {currentSlide.bgImageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
                style={{ backgroundImage: `url(${currentSlide.bgImageUrl})` }}
              />
            )}

            {/* Ambient Gold Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-44 bg-amber-500/30 blur-3xl pointer-events-none" />

            {/* Content Header */}
            <div className="relative z-10 space-y-2 mt-2">
              <span
                className="inline-block px-3 py-1 rounded-full text-[10px] font-black border tracking-wider shadow-sm"
                style={{
                  borderColor: `${currentSlide.accentColor}60`,
                  color: currentSlide.accentColor,
                  backgroundColor: `${currentSlide.accentColor}20`,
                }}
              >
                {currentSlide.badgeAr || "LONALIZA VIP"}
              </span>

              <h3 className="font-black text-sm sm:text-base text-white leading-tight px-2">
                {currentSlide.headlineAr}
              </h3>

              <p className="text-[11px] text-slate-300 line-clamp-2 px-3">
                {currentSlide.subheadlineAr}
              </p>
            </div>

            {/* Device Mockup Inside Frame */}
            {selectedPreset.id !== "gplay-feature" && (
              <div className="relative z-10 w-[78%] h-[65%] mt-auto -mb-6 rounded-t-3xl border-4 border-b-0 bg-slate-950 p-1.5 shadow-2xl transition"
                   style={{ borderColor: currentSlide.mockupFrame === "titanium-black" ? "#334155" : "#f59e0b" }}>
                {/* Dynamic Island */}
                <div className="w-16 h-3 bg-black rounded-full mx-auto mb-2" />
                {/* App Content Placeholder or Screenshot */}
                <div className="w-full h-full rounded-t-2xl bg-gradient-to-b from-[#140522] to-[#250d3f] p-3 text-center flex flex-col items-center justify-center">
                  <span className="text-amber-400 font-black text-xs">LONALIZA</span>
                  <span className="text-[9px] text-purple-200 mt-1">تطبيق السفر والسياحة الفاخرة</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          if (mediaTarget === "bg") {
            updateCurrentSlide({ bgImageUrl: url });
          } else {
            updateCurrentSlide({ appScreenshotUrl: url });
          }
        }}
        title="اختر خلفية سياحية فاخرة من مكتبة Unsplash & Pexels"
      />
    </div>
  );
}
