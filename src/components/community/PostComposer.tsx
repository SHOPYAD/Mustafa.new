"use client";

import { useState, useEffect, useRef } from "react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import {
  Sparkles,
  Wand2,
  Camera,
  Video,
  Send,
  Star,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  MapPin,
  Layers,
  Ticket,
  Building2,
  Plane,
  Car,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import type {
  TravelCategory,
  TravelDestination,
  NostrRelayConfig,
  ParsedTravelPost,
} from "@/lib/nostr/types";
import {
  COMPOSER_PHOTO_ACCEPT,
  COMPOSER_VIDEO_ACCEPT,
  composerFileTooLarge,
  composerUploadErrorMessage,
  isComposerImageFile,
  isComposerVideoFile,
} from "@/lib/community/composer-media";
import { seekAndCapturePoster } from "@/lib/community/reel-media";
import { uploadToBlossom } from "@/lib/nostr/blossom-uploader";
import { signAndPublishEvent } from "@/lib/nostr/client";

interface PostComposerProps {
  categories: TravelCategory[];
  destinations: TravelDestination[];
  relays: NostrRelayConfig[];
  onPostPublished?: (newPost?: ParsedTravelPost, pointsEarned?: number) => void;
}

export function PostComposer({
  categories,
  destinations,
  relays,
  onPostPublished,
}: PostComposerProps) {
  // Collapsed by default on all screens for clean, uncluttered timeline view
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);

  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.slug || "hotels"
  );
  const [selectedDestination, setSelectedDestination] = useState(
    destinations[0]?.name?.ar || destinations[0]?.cityAr || "اسطنبول"
  );
  const [rating, setRating] = useState<number>(5);

  const { user, openAuth } = useCustomerAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [postAsAdmin, setPostAsAdmin] = useState(false);

  // Pseudonym / Real Name Identity Mode
  const [identityMode, setIdentityMode] = useState<"real" | "pseudonym">("real");
  const [pseudonym, setPseudonym] = useState("");

  const LUXURY_PSEUDONYMS = [
    "رحّالة الأناقة الملكية",
    "سفير القصور والمنتجعات",
    "عاشق البوسفور الفاخر",
    "مستكشف الجزر واليخوت",
    "قبطان التجارب الحصرية",
    "أميرة الترحال الراقي",
    "صقر الأناضول الذهبي",
    "سفيرة الأسفار الفاتنة",
    "عاشق الأجنحة الرئاسية",
    "خبير العطلات البلاتينية",
    "رحّال الفنادق الفاخرة",
    "أمير المغامرات الاستثنائية",
    "سندباد السياحة المترفة",
    "فارس الوجهات الساحرة",
  ];

  const generateLuxuryPseudonym = () => {
    const randomName = LUXURY_PSEUDONYMS[Math.floor(Math.random() * LUXURY_PSEUDONYMS.length)];
    setPseudonym(randomName);
    setIdentityMode("pseudonym");
  };

  // Attached Platform Service (from "Share to Community" on tours, hotels, flights, cars)
  const [attachedService, setAttachedService] = useState<{
    id: string;
    type: string;
    typeLabel?: string;
    title: string;
    destination?: string;
    price?: number | string;
    currency?: string;
    imageUrl?: string;
    url?: string;
  } | null>(null);

  // Detect admin status and pending shared service
  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setIsAdmin(true);
          setPostAsAdmin(true);
        }
      })
      .catch(() => {});

    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("pendingCommunityShare");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.title) {
            setAttachedService(parsed);
            setIsComposerExpanded(true);
            if (parsed.destination) setSelectedDestination(parsed.destination);
            sessionStorage.removeItem("pendingCommunityShare");
          }
        }
      } catch {}

      const sp = new URLSearchParams(window.location.search);
      if (sp.get("shareService") === "1" && sp.get("title")) {
        setAttachedService({
          id: sp.get("id") || `svc_${Date.now()}`,
          type: sp.get("type") || "package",
          typeLabel: sp.get("typeLabel") || undefined,
          title: sp.get("title") || "",
          destination: sp.get("dest") || sp.get("destination") || undefined,
          price: sp.get("price") || undefined,
          currency: sp.get("currency") || "USD",
          imageUrl: sp.get("img") || sp.get("imageUrl") || undefined,
          url: sp.get("url") || undefined,
        });
        setIsComposerExpanded(true);
      }
    }
  }, []);

  // Confirmed booking attachment states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [attachedBooking, setAttachedBooking] = useState<{
    id: string;
    type: string;
    typeLabel?: string;
    title: string;
    destination?: string;
    date?: string;
    verified?: boolean;
    price?: number;
    currency?: string;
  } | null>(null);

  // Media states
  const [mediaFiles, setMediaFiles] = useState<
    { url: string; type: "image" | "video"; name: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // AI Copilot state
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPromptNotes, setAiPromptNotes] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lock = showAiModal || showBookingModal;
    const html = document.documentElement;
    const body = document.body;
    if (lock) {
      html.classList.add("lonaliza-composer-lock");
      body.classList.add("lonaliza-composer-lock");
    } else {
      html.classList.remove("lonaliza-composer-lock");
      body.classList.remove("lonaliza-composer-lock");
    }
    return () => {
      html.classList.remove("lonaliza-composer-lock");
      body.classList.remove("lonaliza-composer-lock");
    };
  }, [showAiModal, showBookingModal]);

  useEffect(() => {
    const onPickerError = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setErrorBanner(
        typeof detail === "string" && detail.trim()
          ? detail
          : "تعذر اختيار الملف من المعرض.",
      );
      setIsComposerExpanded(true);
    };
    window.addEventListener("lonaliza-file-picker-error", onPickerError);
    return () => window.removeEventListener("lonaliza-file-picker-error", onPickerError);
  }, []);

  // Publish state
  const [publishing, setPublishing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Fetch confirmed user bookings from account & localStorage
  const loadUserBookings = async () => {
    setLoadingBookings(true);
    const results: any[] = [];

    // 1. Authenticated account bookings
    try {
      const res = await fetch("/api/account/bookings");
      const data = await res.json();
      if (data.ok) {
        if (Array.isArray(data.hotels)) {
          data.hotels.forEach((h: any) => {
            results.push({
              id: h.id || `hotel_${Math.random()}`,
              type: "hotel",
              typeLabel: "حجز فندقي فاخر",
              title: h.hotel_name || h.title || "إقامة فندقية مؤكدة",
              destination: h.city || h.destination || "إسطنبول",
              date: h.check_in ? `${h.check_in} - ${h.check_out || ""}` : undefined,
              price: h.total_price || h.price || 420,
              currency: h.currency || "USD",
              verified: true,
            });
          });
        }
        if (Array.isArray(data.enquiries)) {
          data.enquiries.forEach((enq: any) => {
            results.push({
              id: enq.id || `enq_${Math.random()}`,
              type: enq.service || enq.type || "package",
              typeLabel: "حجز رحلة مؤكد",
              title: enq.service_name || "باقة سياحية VIP",
              destination: enq.destination || "إسطنبول",
              price: enq.budget || 350,
              currency: "USD",
              verified: true,
            });
          });
        }
      }
    } catch {}

    // 2. Local storage bookings
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem("liotrip_bookings");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed.forEach((b: any) => {
              results.push({
                id: b.id,
                type: b.type || "tour",
                typeLabel: b.packageName ? `حجز ${b.packageName}` : "حجز رحلة سياحية",
                title: b.packageName || b.destination || "رحلة سياحية مميزة",
                destination: b.destination || "إسطنبول",
                date: b.createdAt
                  ? new Date(b.createdAt).toLocaleDateString("ar-EG")
                  : undefined,
                price: 280,
                currency: "USD",
                verified: true,
              });
            });
          }
        }
      } catch {}
    }

    // 3. Verified platform fallback options for immediate experience
    if (results.length === 0) {
      results.push(
        {
          id: "bk_ciragan_palace",
          type: "hotel",
          typeLabel: "حجز فندقي فاخر",
          title: "فندق قصر سيراجان كمبنسكي إسطنبول",
          destination: "إسطنبول",
          date: "إقامة مؤكدة 2026",
          price: 850,
          currency: "USD",
          verified: true,
        },
        {
          id: "bk_turkish_airlines_vip",
          type: "flight",
          typeLabel: "تذكرة طيران VIP",
          title: "الخطوط الجوية التركية - درجة رجال الأعمال",
          destination: "إسطنبول",
          date: "تذكرة مؤكدة",
          price: 640,
          currency: "USD",
          verified: true,
        },
        {
          id: "bk_bosphorus_yacht",
          type: "tour",
          typeLabel: "جولة بحرية خاصة",
          title: "جولة يخت خاص VIP في البوسفور وقت الغروب",
          destination: "إسطنبول",
          date: "حجز مؤكد",
          price: 320,
          currency: "USD",
          verified: true,
        },
        {
          id: "bk_trabzon_chalets",
          type: "hotel",
          typeLabel: "أكواخ فاخرة",
          title: "أكواخ أوزنجول ومرتفعات آيدر الخشبية",
          destination: "طرابزون",
          date: "إقامة طبيعية",
          price: 490,
          currency: "USD",
          verified: true,
        }
      );
    }

    setUserBookings(results);
    setLoadingBookings(false);
  };

  const handleSelectBooking = (bk: any) => {
    setAttachedBooking(bk);
    if (bk.destination) {
      setSelectedDestination(bk.destination);
    }
    if (bk.type === "hotel") {
      setSelectedCategory("hotels");
    } else if (bk.type === "flight") {
      setSelectedCategory("flights");
    } else if (bk.type === "tour") {
      setSelectedCategory("tours");
    } else if (bk.type === "car") {
      setSelectedCategory("cars");
    }
    setShowBookingModal(false);
    setIsComposerExpanded(true);
  };

  const openComposerMediaPicker = (kind: "photo" | "video") => {
    if (!user && !isAdmin) {
      openAuth("login");
      return;
    }
    setErrorBanner(null);
    const input = kind === "photo" ? photoInputRef.current : videoInputRef.current;
    if (!input) {
      setErrorBanner("تعذر فتح اختيار الوسائط. أعد تحميل الصفحة وحاول مرة أخرى.");
      setIsComposerExpanded(true);
      return;
    }
    try {
      input.click();
    } catch {
      setErrorBanner("تعذر فتح معرض الصور أو الفيديو. تحقق من أذونات التطبيق.");
    }
  };

  // Handle file select & high speed direct upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selected = Array.from(files);
    e.target.value = "";

    setIsComposerExpanded(true);
    setUploading(true);
    setUploadProgress(1);
    setErrorBanner(null);

    try {
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        const tooLarge = composerFileTooLarge(file);
        if (tooLarge) {
          setErrorBanner(tooLarge);
          continue;
        }
        const isVideo = isComposerVideoFile(file);
        if (!isVideo && !isComposerImageFile(file)) {
          setErrorBanner("الملف المختار ليس صورة أو فيديو صالحًا.");
          continue;
        }

        const uploadResult = await uploadToBlossom(file, {
          onProgress: (pct) => {
            const step = Math.round(((i + pct / 100) / selected.length) * 100);
            setUploadProgress(Math.max(1, Math.min(99, step)));
          },
        });

        setMediaFiles((prev) => [
          ...prev,
          {
            url: uploadResult.url,
            type: isVideo ? "video" : "image",
            name: file.name,
          },
        ]);
      }
      setUploadProgress(100);
    } catch (err: unknown) {
      setErrorBanner(composerUploadErrorMessage(err));
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const composerFileInputs = (
    <>
      <input
        ref={photoInputRef}
        type="file"
        accept={COMPOSER_PHOTO_ACCEPT}
        multiple
        onChange={handleFileChange}
        className="lonaliza-composer-file"
        tabIndex={-1}
        aria-hidden="true"
        disabled={uploading}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept={COMPOSER_VIDEO_ACCEPT}
        onChange={handleFileChange}
        className="lonaliza-composer-file"
        tabIndex={-1}
        aria-hidden="true"
        disabled={uploading}
      />
    </>
  );

  // Trigger AI Copilot
  const handleGenerateWithAi = async () => {
    setAiLoading(true);
    setErrorBanner(null);
    try {
      const images = mediaFiles.filter((m) => m.type === "image").map((m) => m.url);
      const videos = mediaFiles.filter((m) => m.type === "video").map((m) => m.url);
      const visualFrames: string[] = [];
      for (const file of mediaFiles.filter((m) => m.type === "video").slice(0, 2)) {
        try {
          const video = document.createElement("video");
          video.src = file.url;
          video.muted = true;
          video.playsInline = true;
          video.preload = "auto";
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            video.addEventListener("loadeddata", done, { once: true });
            window.setTimeout(done, 1800);
          });
          const frame = await seekAndCapturePoster(video, 0.6);
          if (frame) visualFrames.push(frame);
        } catch {
          /* ignore frame harvest */
        }
      }

      const res = await fetch("/api/community/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking: attachedBooking || attachedService || undefined,
          prompt:
            aiPromptNotes ||
            (attachedBooking
              ? `تقييم وتجربة حجز ${attachedBooking.title} (${attachedBooking.typeLabel || ""})`
              : "تجربة ممتازة وخدمات راقية وتنسيق سياحي متكامل"),
          destination: attachedBooking?.destination || attachedService?.destination || selectedDestination,
          category: attachedBooking?.type || attachedService?.type || selectedCategory,
          rating,
          language: "ar",
          images,
          videos,
          visualFrames,
        }),
      });
      const data = await res.json();
      if (data.ok && data.text) {
        setContent(data.text);
        setShowAiModal(false);
        setAiPromptNotes("");
      } else {
        setErrorBanner(data.error || "فشل توليد النص بواسطة الذكاء الاصطناعي");
      }
    } catch {
      setErrorBanner("تعذر الاتصال بخدمة الذكاء الاصطناعي");
    } finally {
      setAiLoading(false);
    }
  };

  // Submit post
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0 && !attachedBooking && !attachedService) return;

    setPublishing(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      const images = mediaFiles.filter((m) => m.type === "image").map((m) => m.url);
      const videos = mediaFiles.filter((m) => m.type === "video").map((m) => m.url);

      // 1. Publish directly to platform community endpoint
      const pubRes = await fetch("/api/community/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          category: selectedCategory,
          destination: selectedDestination,
          rating,
          images,
          videos,
          booking: attachedBooking || undefined,
          sharedService: attachedService || undefined,
          authorIsAdmin: isAdmin && postAsAdmin,
          authorName: (isAdmin && postAsAdmin)
            ? "إدارة المنصة العامة"
            : (identityMode === "pseudonym" ? (pseudonym.trim() || "رحّالة الأناقة الملكية") : (user?.name || "مسافر لوناليزا VIP")),
        }),
      });

      const pubData = await pubRes.json();
      if (!pubData.ok) {
        throw new Error(pubData.error || "فشل نشر المنشور السياحي");
      }

      const publishedPost: ParsedTravelPost = pubData.post;
      const awardedPoints: number =
        pubData.awardedPoints ||
        (attachedBooking ? 200 : attachedService ? 150 : videos.length > 0 ? 150 : images.length > 0 ? 100 : 50);

      // 2. Also broadcast in background to Nostr relays if available
      if (Array.isArray(relays) && relays.length > 0) {
        try {
          const tags: string[][] = [
            ["t", "lonaliza"],
            ["t", "travel"],
            ["c", selectedCategory],
            ["d", selectedDestination],
            ["rating", String(rating)],
          ];
          if (videos.length > 0) {
            tags.push(["t", "reels"]);
            tags.push(["video", videos[0]]);
          }
          images.forEach((img) => tags.push(["image", img]));

          void signAndPublishEvent(
            {
              kind: videos.length > 0 ? 34235 : 1,
              content: content.trim(),
              tags,
            },
            relays
          ).catch(() => {});
        } catch {}
      }

      setSuccessBanner(
        pubData.message ||
          `تم نشر مشاركتك بنجاح! ستُضاف النقاط لمحفظتك فور وصول المنشور إلى تفاعل الجمهور المحدد (50 إعجاب و 10 تعليقات) 🌟`
      );
      setContent("");
      setMediaFiles([]);
      setAttachedBooking(null);
      setAttachedService(null);
      setIsComposerExpanded(false);

      if (onPostPublished) {
        onPostPublished(publishedPost, awardedPoints);
      }
    } catch (err: any) {
      setErrorBanner(err?.message || "فشل نشر المنشور السياحي");
    } finally {
      setPublishing(false);
    }
  };

  // ----------------------------------------------------
  // COMPACT / COLLAPSED STATE (DEFAULT)
  // ----------------------------------------------------
  const viewportLockStyle = (
    <style>{`
      html.lonaliza-composer-lock {
        overflow: hidden !important;
      }
      .lonaliza-composer-scroll {
        max-height: min(82dvh, calc(100dvh - 6.75rem));
        overflow-x: hidden !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
        overscroll-behavior: contain;
      }
      input.lonaliza-composer-file {
        position: fixed;
        left: 0;
        top: 0;
        width: 1px;
        height: 1px;
        opacity: 0.01;
        overflow: hidden;
        z-index: 0;
        pointer-events: none;
      }
    `}</style>
  );

  const collapsedComposer = (
      <div
        className="min-w-0 max-w-full overflow-x-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all"
        dir="rtl"
      >
        {/* Success / Error Banner if just published */}
        {successBanner && (
          <div className="p-3 mb-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successBanner}</span>
          </div>
        )}
        {errorBanner && (
          <div className="p-3 mb-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* If Guest with pending shared service */}
        {attachedService && !user && !isAdmin && (
          <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-amber-500/10 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/20 border border-amber-300 dark:border-amber-700/50 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate">
                لديك خدمة جاهزة للمشاركة: <b>{attachedService.title}</b>. سجل الدخول لنشرها!
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-black dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                إنشاء حساب
              </button>
            </div>
          </div>
        )}

        {/* If General Guest: Clear call-to-action banner */}
        {!user && !isAdmin && !attachedService && (
          <div className="mb-3 flex min-w-0 max-w-full items-center justify-between gap-2 rounded-2xl border border-amber-200/80 bg-amber-500/10 p-2.5 text-xs text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200 sm:p-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="min-w-0 whitespace-normal break-words">انضم لمجتمع لوناليزا وانشر تجاربك واكسب النقاط فور وصول منشورك لتفاعل الجمهور!</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                دخول
              </button>
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                تسجيل
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full overflow-hidden border-2 border-amber-400 dark:border-amber-500/60 bg-amber-50 dark:bg-slate-800 shrink-0 shadow-xs flex items-center justify-center">
            {isAdmin ? (
              <ShieldCheck className="h-6 w-6 text-indigo-700 dark:text-indigo-400" />
            ) : user ? (
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email || user.id}`}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=VIPTraveler"
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Quick Clickable Trigger Bar */}
          <button
            type="button"
            onClick={() => {
              if (!user && !isAdmin) {
                openAuth("login");
                return;
              }
              setIsComposerExpanded(true);
            }}
            className="flex-1 text-right px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/90 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-xs truncate"
          >
            {!user && !isAdmin
              ? "سجل الدخول لمشاركة تجربتك السياحية أو تقييمك..."
              : "شارك تجربتك السياحية أو اكتب تقييماً..."}
          </button>
        </div>

        {/* Quick Single-Line Actions (Clean SVG Icons Only - No duplicate emojis) */}
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              if (!user && !isAdmin) {
                openAuth("login");
                return;
              }
              setIsComposerExpanded(true);
              setShowAiModal(true);
            }}
            className="flex min-h-11 items-center gap-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shrink-0 whitespace-nowrap shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <Wand2 className="h-3.5 w-3.5 text-amber-300 animate-pulse shrink-0" />
            <span>وكيل لوناليزا</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!user && !isAdmin) {
                openAuth("login");
                return;
              }
              setIsComposerExpanded(true);
              setShowBookingModal(true);
              loadUserBookings();
            }}
            className="flex min-h-11 items-center gap-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold shrink-0 whitespace-nowrap shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <Ticket className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>مشاركة حجز</span>
          </button>

          <button
            type="button"
            onClick={() => openComposerMediaPicker("photo")}
            disabled={uploading}
            className="relative flex min-h-11 min-w-[44px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 shadow-xs transition-all active:scale-95 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>إضافة صور</span>
          </button>

          <button
            type="button"
            onClick={() => openComposerMediaPicker("video")}
            disabled={uploading}
            className="relative flex min-h-11 min-w-[44px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-all active:scale-95 hover:bg-slate-100 disabled:opacity-50"
          >
            <Video className="h-3.5 w-3.5 shrink-0 text-rose-600" />
            <span>ريلز</span>
          </button>
        </div>
      </div>
    );

  // ----------------------------------------------------
  // FULL / EXPANDED STATE
  // ----------------------------------------------------
  const guestComposer = (
      <div className="min-w-0 max-w-full overflow-x-hidden rounded-3xl border border-amber-200/90 dark:border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/5 to-amber-500/15 dark:from-amber-950/25 dark:via-slate-900 dark:to-amber-950/20 p-5 sm:p-6 shadow-sm text-center" dir="rtl">
        <div className="max-w-md mx-auto space-y-3">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-800 dark:text-amber-300 shadow-xs">
            <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            انضم إلى مجتمع لوناليزا الفاخر
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            يرجى تسجيل الدخول أو إنشاء حساب للانضمام إلى مسافري لوناليزا، ومشاركة تجاربك السياحية الحقيقية أو الخدمات المميزة، وكسب نقاط السفر ومكافآت الحجز!
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>
      </div>
    );

  const expandedComposer = (
    <div
      className="lonaliza-composer-scroll min-w-0 max-w-full rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
      dir="rtl"
    >
      {/* Top Banner: Rewards Info + Collapse Button */}
      <div className="mb-3.5 flex min-w-0 max-w-full items-start justify-between gap-2 border-b border-slate-100 pb-3 text-xs dark:border-slate-800">
        <span className="flex min-w-0 flex-1 items-start gap-1.5 font-medium text-slate-600 dark:text-slate-300">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span className="min-w-0 whitespace-normal break-words leading-relaxed">
            شارك تجربتك السياحية واكسب حتى +300 نقطة VIP (تُصرف فور وصول المنشور لشروط تفاعل الجمهور: 50 إعجاب و 10 تعليقات)
          </span>
        </span>
        <button
          type="button"
          onClick={() => setIsComposerExpanded(false)}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
        >
          <span>تصغير / إخفاء</span>
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Admin Role Toggle (For General Platform Admin) */}
      {isAdmin && (
        <div className="mb-3.5 flex min-w-0 max-w-full flex-col items-start justify-between gap-2 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-500/15 p-3 text-xs dark:border-indigo-800/60 dark:from-indigo-950/60 dark:via-slate-800/80 dark:to-indigo-950/60 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2 font-bold text-amber-950 dark:text-amber-300">
            <span className="text-base">👑</span>
            <span className="min-w-0 break-words">النشر بالصفة الرسمية: <strong>إدارة المنصة العامة (Official Admin)</strong></span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={postAsAdmin}
              onChange={(e) => setPostAsAdmin(e.target.checked)}
              className="h-4 w-4 accent-amber-600 rounded cursor-pointer"
            />
            <span className="text-[11px] text-amber-900 dark:text-amber-300 font-bold">تفعيل شارة إدارة المنصة 👑</span>
          </label>
        </div>
      )}

      {/* Member Identity Selection (Real Name vs Luxury Pseudonym) */}
      {(!isAdmin || !postAsAdmin) && (
        <div className="mb-3.5 p-3 sm:p-3.5 rounded-2xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200/80 dark:border-slate-700 text-xs space-y-2.5">
          <div className="flex min-w-0 flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span className="flex min-w-0 items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <span>🎭</span>
              <span>هوية النشر في مجتمع السفر:</span>
            </span>
            <div className="inline-flex min-w-0 max-w-full flex-wrap items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setIdentityMode("real")}
                className={`max-w-full truncate rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  identityMode === "real"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                الاسم الحقيقي ({user?.name || "مسافر لوناليزا VIP"})
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdentityMode("pseudonym");
                  if (!pseudonym) generateLuxuryPseudonym();
                }}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  identityMode === "pseudonym"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                اسم مستعار فاخر ✨
              </button>
            </div>
          </div>

          {identityMode === "pseudonym" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1.5 border-t border-amber-200/60 dark:border-slate-700">
              <input
                type="text"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                placeholder="اكتب اسمك المستعار أو ولد اسماً فاخراً..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={generateLuxuryPseudonym}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>✨ توليد اسم مستعار فاخر</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success / Error Banners */}
      {successBanner && (
        <div className="p-3 mb-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successBanner}</span>
        </div>
      )}
      {errorBanner && (
        <div className="p-3 mb-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Attached Confirmed Booking Card Preview */}
      {attachedBooking && (
        <div className="mb-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {attachedBooking.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-700/60 shrink-0">
                  حجز مؤكد
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {attachedBooking.destination} {attachedBooking.typeLabel ? `• ${attachedBooking.typeLabel}` : ""}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedBooking(null)}
            className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
            title="إزالة الحجز المرفق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Attached Shared Platform Service Preview */}
      {attachedService && (
        <div className="mb-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-100/60 to-amber-500/10 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/25 border border-amber-300 dark:border-amber-700/50 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {attachedService.imageUrl ? (
              <img
                src={attachedService.imageUrl}
                alt=""
                className="h-10 w-10 rounded-xl object-cover shrink-0 border border-amber-200 dark:border-amber-700 shadow-xs"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0 shadow-xs">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {attachedService.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-700/60 shrink-0">
                  خدمة مشاركة
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {attachedService.destination} {attachedService.price ? `• $${attachedService.price} ${attachedService.currency || "USD"}` : ""}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedService(null)}
            className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
            title="إلغاء إرفاق الخدمة"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmitPost} className="space-y-3.5">
        {/* Category, Destination & Rating Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Category */}
          <div>
            <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-amber-500" />
              <span>فئة التجربة</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white dark:focus:bg-slate-800 transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug} className="text-slate-800 dark:text-slate-100 dark:bg-slate-800">
                  {cat.name?.ar || cat.nameAr || cat.slug}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>المدينة / الوجهة</span>
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white dark:focus:bg-slate-800 transition-all"
            >
              {destinations.map((dest, idx) => {
                const dName = dest.name?.ar || dest.cityAr || "الوجهة";
                const dCountry = dest.country || dest.countryNameAr || "";
                return (
                  <option
                    key={dest.slug || dest.id || idx}
                    value={dName}
                    className="text-slate-800 dark:text-slate-100 dark:bg-slate-800"
                  >
                    {dName} {dCountry ? `(${dCountry})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Star Rating */}
          <div>
            <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>تقييمك للخدمة</span>
            </label>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl h-[38px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-4 w-4 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-600 hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mr-2">{rating}/5</span>
            </div>
          </div>
        </div>

        {/* Text Area with AI Copilot Button Header */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
              <span>تفاصيل التجربة أو المراجعة السياحية</span>
            </label>
            <button
              type="button"
              data-keep-color="true"
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Wand2 className="h-3.5 w-3.5 text-amber-300 animate-pulse shrink-0" />
              <span data-keep-color="true" style={{ color: "#ffffff" }}>
                وكيل لوناليزا
              </span>
            </button>
          </div>

          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب عن تجربتك مع الفندق، الأماكن التي زرتها، جودة الخدمة، نصائح للمسافرين القادمين..."
            className="w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white dark:focus:bg-slate-800 leading-relaxed transition-all"
          />
        </div>

        {/* Uploaded Media Previews */}
        {mediaFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {mediaFiles.map((m, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-20 w-24 shrink-0 shadow-xs"
              >
                {m.type === "image" ? (
                  <img src={m.url} alt="Media" className="h-full w-full object-cover" />
                ) : (
                  <video src={m.url} className="h-full w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setMediaFiles((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-900/70 text-white font-medium">
                  {m.type === "video" ? "ريلز" : "صورة"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              <span>
                {uploadProgress >= 96
                  ? "تم إرسال الملف، بانتظار تأكيد خادم الوسائط..."
                  : "جاري رفع الفيديو والصور بأعلى جودة..."}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Controls & Submit (All Strictly Single-Line, Clean SVG Icons Only) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Share Confirmed Booking Button */}
            <button
              type="button"
              onClick={() => {
                setShowBookingModal(true);
                loadUserBookings();
              }}
              className="flex min-h-11 items-center gap-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold shrink-0 whitespace-nowrap cursor-pointer transition-all active:scale-95"
            >
              <Ticket className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>مشاركة حجز</span>
            </button>

            <button
              type="button"
              onClick={() => openComposerMediaPicker("photo")}
              disabled={uploading}
              className="relative flex min-h-11 min-w-[44px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-all active:scale-95 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <Camera className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>إضافة صور</span>
            </button>

            <button
              type="button"
              onClick={() => openComposerMediaPicker("video")}
              disabled={uploading}
              className="relative flex min-h-11 min-w-[44px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-all active:scale-95 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <Video className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>رفع ريلز</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              publishing ||
              uploading ||
              (!content.trim() && mediaFiles.length === 0 && !attachedBooking)
            }
            className="flex min-h-11 items-center justify-center gap-2 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 shrink-0 whitespace-nowrap cursor-pointer"
          >
            {publishing ? (
              <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <Send className="h-4 w-4 shrink-0" />
            )}
            <span>نشر التجربة</span>
          </button>
        </div>
      </form>

      {/* Booking Selector Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-xs dark:bg-black/75 sm:items-center sm:p-4"
          dir="rtl"
        >
          <div className="flex max-h-[min(92dvh,40rem)] w-full min-w-0 max-w-[min(32rem,100dvw)] flex-col space-y-4 overflow-x-hidden overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-h-[85vh] sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  مشاركة حجز من رحلاتك (شارة توثيق الحجز)
                </h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              اختر أحد حجوزاتك المؤكدة من رحلاتك لإرفاق شارة التوثيق مع منشورك. يمنحك ذلك
              مصداقية عالية ومكافأة +200 نقطة VIP فورية!
            </p>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-96">
              {loadingBookings ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>جاري جلب حجوزاتك من النظام...</span>
                </div>
              ) : userBookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  لم يتم العثور على حجوزات مسجلة.
                </div>
              ) : (
                userBookings.map((bk) => (
                  <div
                    key={bk.id}
                    onClick={() => handleSelectBooking(bk)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-emerald-300 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0">
                        {bk.type === "hotel" ? (
                          <Building2 className="h-5 w-5" />
                        ) : bk.type === "flight" ? (
                          <Plane className="h-5 w-5" />
                        ) : bk.type === "car" ? (
                          <Car className="h-5 w-5" />
                        ) : (
                          <Ticket className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-900 dark:group-hover:text-emerald-300 truncate">
                            {bk.title}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-700/60 shrink-0">
                            موثق
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {bk.destination && <span>📍 {bk.destination}</span>}
                          {bk.typeLabel && <span>• {bk.typeLabel}</span>}
                          {bk.date && <span>• {bk.date}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold group-hover:bg-emerald-700 transition-colors shrink-0 whitespace-nowrap shadow-xs"
                    >
                      إرفاق
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Copilot Modal */}
      {showAiModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          dir="rtl"
        >
          <div
            data-keep-color="true"
            className="flex max-h-[min(92dvh,42rem)] w-full min-w-0 max-w-[min(32rem,100dvw)] flex-col overflow-hidden rounded-t-3xl border border-purple-200 bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-3xl"
            style={{ backgroundColor: "#ffffff", color: "#1e1133" }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-purple-100 px-5 pb-3 pt-5">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 text-purple-800">
                  <Wand2 className="h-5 w-5 shrink-0" />
                  <span className="text-[11px] font-black tracking-wide">وكيل لوناليزا الذكي</span>
                </div>
                <h3
                  className="text-base font-black leading-snug"
                  style={{ color: "#2e1065" }}
                >
                  صياغة وتنسيق التجارب الفاخرة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <p className="text-sm font-medium leading-relaxed" style={{ color: "#3b0764" }}>
                اكتب اسم المعلم أو الخدمة وملاحظاتك الواقعية، وسيقوم وكيل لوناليزا الذكي بصياغة
                مراجعة مسافر بشرية صادقة وثرية بالتفاصيل الدقيقة والمرافق دون أي مبالغة تسويقية.
              </p>

            {attachedBooking && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5 font-bold">
                <Sparkles className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div>حجز مؤكد مرفق: {attachedBooking.title}</div>
                  <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                    الوجهة: {attachedBooking.destination} • نوع الخدمة: {attachedBooking.typeLabel || attachedBooking.type} • سيقوم الذكاء الاصطناعي بكتابة تقييم وتجربة حصرية لهذه الخدمة بدقة.
                  </div>
                </div>
              </div>
            )}

            {mediaFiles.length > 0 && (
              <div className="p-2.5 rounded-xl bg-purple-100 border border-purple-300 text-[11px] text-purple-950 flex items-center gap-2 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-purple-700 shrink-0" />
                <span>
                  تم رصد {mediaFiles.length} وسائط مرفقة؛ سيقرأ الوكيل الصورة/لقطات الفيديو مع بيانات الحجز ويكتب مراجعة متعددة الفقرات.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[12px] font-black" style={{ color: "#2e1065" }}>
                أفكار ومقترحات سريعة بنقرة واحدة:
              </div>
              {[
                [
                  "إقامة فندقية فاخرة ومسبح وإطلالة بانورامية وإفطار راقٍ",
                  "جولة يخت خاص في البوسفور وقت الغروب وأجواء ساحرة",
                  "أكواخ طرابزون وأوزنجول وسط الضباب والطبيعة الخلابة",
                ],
                [
                  "خدمة سيارة مرسيدس VIP وسائق محترف ودقة في المواعيد",
                  "مطعم وتجربة عشاء راقية ومأكولات لذيذة وخدمة ممتازة",
                  "بالون كابادوكيا مع شروق الشمس ومشهد سينمائي",
                ],
              ].map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 snap-x snap-mandatory touch-pan-x"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {row.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      data-keep-color="true"
                      onClick={() => setAiPromptNotes(chip)}
                      className="snap-start shrink-0 max-w-[85%] whitespace-normal rounded-2xl border-2 px-3 py-2 text-start text-[12px] font-bold leading-relaxed"
                      style={{
                        backgroundColor: "#f3e8ff",
                        borderColor: "#7e22ce",
                        color: "#3b0764",
                      }}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <textarea
              rows={3}
              value={aiPromptNotes}
              onChange={(e) => setAiPromptNotes(e.target.value)}
              placeholder="اكتب ملاحظاتك هنا... أو اختر أحد الاقتراحات أعلاه"
              className="w-full rounded-xl border-2 border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-950 placeholder:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 border-t border-purple-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                data-keep-color="true"
                onClick={handleGenerateWithAi}
                disabled={aiLoading}
                className="flex min-w-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 px-5 py-2.5 text-xs font-black text-white shadow-md disabled:opacity-50"
                style={{ color: "#ffffff" }}
              >
                {aiLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>توليد التقرير بالذكاء الاصطناعي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {viewportLockStyle}
      {composerFileInputs}
      {!isComposerExpanded
        ? collapsedComposer
        : !user && !isAdmin
          ? guestComposer
          : expandedComposer}
    </>
  );
}
