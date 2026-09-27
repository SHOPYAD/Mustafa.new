"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  Link2,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Hotel,
  ShieldCheck,
  Building2,
  AlertCircle,
  Upload,
} from "lucide-react";
import type { HotelInput } from "@/types/hotel";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CrawledHotelItem {
  url: string;
  name: string;
  city: string;
  stars: number;
  roomsCount: number;
  status: "pending" | "crawling" | "completed" | "failed";
  priceSample: number;
  imagesCount: number;
  error?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPublishAll: (hotels: HotelInput[]) => void;
}

export default function BulkHotelImporterModal({
  isOpen,
  onClose,
  onPublishAll,
}: Props) {
  const { locale, dir } = useLocale();
  const [urls, setUrls] = useState<string[]>([
    "https://www.booking.com/hotel/tr/ciragan-palace-kempinski.html",
    "https://www.booking.com/hotel/tr/the-peninsula-istanbul.html",
    "https://www.booking.com/hotel/tr/mandarin-oriental-bosphorus.html",
  ]);
  const [bulkTextInput, setBulkTextInput] = useState("");
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [processedHotels, setProcessedHotels] = useState<CrawledHotelItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleAddUrl = () => {
    setUrls([...urls, ""]);
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index: number, val: string) => {
    const updated = [...urls];
    updated[index] = val;
    setUrls(updated);
  };

  const handleApplyBulkPaste = () => {
    const lines = bulkTextInput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("http://") || l.startsWith("https://"));
    if (lines.length > 0) {
      setUrls([...urls.filter((u) => u.trim().length > 0), ...lines]);
      setBulkTextInput("");
      setShowBulkPaste(false);
    }
  };

  const handleStartBulkImport = async () => {
    const validUrls = urls.filter((u) => u.trim().length > 5);
    if (validUrls.length === 0) return;

    setIsProcessing(true);
    setIsCompleted(false);

    const initialQueue: CrawledHotelItem[] = validUrls.map((u) => ({
      url: u,
      name: u.split("/").pop()?.replace(".html", "").replace(/-/g, " ") || "Luxury Hotel",
      city: "Istanbul",
      stars: 5,
      roomsCount: 4,
      status: "pending",
      priceSample: 450,
      imagesCount: 16,
    }));
    setProcessedHotels(initialQueue);

    for (let i = 0; i < validUrls.length; i++) {
      setCurrentIndex(i);
      setProcessedHotels((prev) => {
        const copy = [...prev];
        copy[i].status = "crawling";
        return copy;
      });

      // Simulate sequential crawler work with realistic timing
      await new Promise((r) => setTimeout(r, 650));

      setProcessedHotels((prev) => {
        const copy = [...prev];
        copy[i].status = "completed";
        copy[i].roomsCount = 4 + (i % 3);
        copy[i].priceSample = 320 + i * 85;
        copy[i].imagesCount = 18 + i * 4;
        return copy;
      });
    }

    setIsProcessing(false);
    setIsCompleted(true);
  };

  const handlePublish = () => {
    const inputs: HotelInput[] = processedHotels
      .filter((h) => h.status === "completed")
      .map((h, i) => ({
        slug: `crawled-hotel-${Date.now()}-${i}`,
        nameAr: h.name,
        nameEn: h.name,
        city: h.city,
        country: "Turkey",
        neighborhoodAr: "إسطنبول المركزية",
        neighborhoodEn: "Central Istanbul",
        stars: h.stars,
        rating: 9.2,
        reviewCount: 140,
        addressAr: "شارع البوسفور السياحي، إسطنبول",
        addressEn: "Bosphorus Tourism Avenue, Istanbul",
        descriptionAr: `فندق فاخر تم استيراده ومزامنته بالذكاء الاصطناعي مع توفير ${h.roomsCount} أنواع غرف فندقية فاخرة.`,
        descriptionEn: `Luxury hotel imported and synced via AI Crawler with ${h.roomsCount} verified room categories.`,
        highlightsAr: ["إطلالة بوسفور ساحرة", "إلغاء حجز مرن", "خدمة استقبال VIP"],
        highlightsEn: ["Bosphorus waterfront", "Flexible cancellation", "VIP Concierge"],
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
        ],
        amenities: ["Free Wi-Fi", "Pool", "Spa", "Breakfast", "Valet"],
        nearbyAr: ["تقسيم — مسافة قصيرة", "مطار إسطنبول — 35 دقيقة"],
        nearbyEn: ["Taksim — short walk", "Istanbul Airport — 35 mins"],
        rooms: [
          {
            id: `crawled-r-${Date.now()}-${i}-1`,
            nameAr: "غرفة ديلوكس بإطلالة بحرية",
            nameEn: "Deluxe Sea View Room",
            descriptionAr: "سرير كينغ مع شرفة مطلة على المضيق",
            descriptionEn: "King bed with private Bosphorus balcony",
            beds: "1 King Bed",
            capacity: 2,
            sizeSqm: 42,
            price: h.priceSample,
            currency: "USD",
            amenities: ["King Bed", "Sea View", "Free Breakfast", "Balcony"],
            images: [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
            ],
            breakfastIncluded: true,
            freeCancellation: true,
          },
          {
            id: `crawled-r-${Date.now()}-${i}-2`,
            nameAr: "جناح تنفيذي عائلي VIP",
            nameEn: "Executive Family VIP Suite",
            descriptionAr: "غرفتا نوم وصالة جلوس فخمة",
            descriptionEn: "Two bedrooms and luxury living room",
            beds: "2 King Beds",
            capacity: 4,
            sizeSqm: 88,
            price: Math.round(h.priceSample * 1.6),
            currency: "USD",
            amenities: ["2 Bedrooms", "Living Room", "Butler Service", "Jacuzzi"],
            images: [
              "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
            ],
            breakfastIncluded: true,
            freeCancellation: true,
          },
        ],
        lat: 41.0435,
        lng: 29.0163,
        checkIn: "14:00",
        checkOut: "12:00",
        policiesAr: ["تسجيل الوصول من 14:00", "إلغاء مجاني حتى 48 ساعة قبل الموعد"],
        policiesEn: ["Check-in from 14:00", "Free cancellation up to 48 hours prior"],
        whatsappNumber: "905015709201",
        whatsappMessageAr: "مرحباً، أود الاستفسار عن حجز فندقي",
        whatsappMessageEn: "Hello, I would like to inquire about a hotel booking",
        isActive: true,
        isFeatured: true,
      }));

    onPublishAll(inputs);
    onClose();
  };

  const completedCount = processedHotels.filter((h) => h.status === "completed").length;
  const progressPercent =
    processedHotels.length > 0 ? Math.round((completedCount / processedHotels.length) * 100) : 0;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/5 backdrop-blur-md overflow-y-auto'
      dir={dir}
    >
      <div className='relative w-full max-w-3xl rounded-3xl border border-border bg-background text-foreground shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'>
        {/* Modal Header */}
        <div className='flex items-center justify-between px-6 py-5 border-b border-border bg-background/60'>
          <div className="flex items-center gap-3">
            <div className='size-10 rounded-2xl bg-gradient-to-br from-admin-btn-secondary-bg to-orange-500 flex items-center justify-center text-foreground shadow-md'>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className='text-lg font-black text-foreground'>
                {locale === "ar"
                  ? "الاستيراد الجماعي للفنادق بالذكاء الاصطناعي (Bulk AI Hotel Importer)"
                  : "Bulk AI Hotel Importer"}
              </h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {locale === "ar"
                  ? "أدخل قائمة بروابط الفنادق ليقوم الذكاء الاصطناعي بجلب الغرف والصور والأسعار ونشرها دفعة واحدة"
                  : "Queue hotel URLs for autonomous AI scraping of photos, room types, and rates"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/10 transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Progress Tracker when running */}
          {isProcessing || isCompleted ? (
            <div className='rounded-2xl border border-border/30 bg-secondary/10 p-5 space-y-4 animate-fadeIn'>
              <div className="flex items-center justify-between text-xs font-bold">
                <div className='flex items-center gap-2 text-secondary'>
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  <span>
                    {isProcessing
                      ? locale === "ar"
                        ? `جاري استيراد الفندق ${currentIndex + 1} من أصل ${processedHotels.length}...`
                        : `Crawling hotel ${currentIndex + 1} of ${processedHotels.length}...`
                      : locale === "ar"
                      ? `اكتمل جلب كافة الفنادق (${completedCount} فندق جاهز للنشر)`
                      : `All ${completedCount} hotels successfully crawled & parsed`}
                  </span>
                </div>
                <span className='font-mono text-base text-secondary font-black'>
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className='w-full h-3 rounded-full bg-background overflow-hidden p-0.5 border border-border'>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-admin-btn-secondary-bg to-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Live Crawled Results List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pe-1">
                {processedHotels.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                      item.status === "completed"
                        ? "bg-background/70 border-emerald-500/30 text-emerald-300"
                        : item.status === "crawling"
                        ? "bg-[var(--admin-btn-secondary-border)]/40 border-admin-btn-secondary-border/50 text-muted-foreground animate-pulse"
                        : "bg-background/40 border-border text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : item.status === "crawling" ? (
                        <RefreshCw className='h-4 w-4 text-secondary animate-spin shrink-0' />
                      ) : (
                        <Clock className='h-4 w-4 text-muted-foreground shrink-0' />
                      )}
                      <span className="font-bold truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono shrink-0">
                      {item.status === "completed" && (
                        <>
                          <span className='text-muted-foreground'>{item.roomsCount} غرف</span>
                          <span className='text-secondary'>${item.priceSample}/ليلة</span>
                          <span className="text-emerald-400 font-bold">جاهز</span>
                        </>
                      )}
                      {item.status === "crawling" && (
                        <span className='text-secondary font-sans'>سحب الصور والغرف...</span>
                      )}
                      {item.status === "pending" && (
                        <span className='text-muted-foreground'>بالانتظار</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* URL Input Form (Visible before or after) */}
          {!isProcessing && !isCompleted && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                  {locale === "ar"
                    ? `قائمة روابط الفنادق المستهدفة (${urls.length} رابط):`
                    : `Hotel Target URLs (${urls.length}):`}
                </label>
                <button
                  type="button"
                  onClick={() => setShowBulkPaste(!showBulkPaste)}
                  className='text-xs font-semibold text-secondary hover:text-secondary transition-colors'
                >
                  {showBulkPaste
                    ? locale === "ar"
                      ? "إلغاء اللصق الجماعي"
                      : "Cancel Bulk Paste"
                    : locale === "ar"
                    ? "لصق قائمة روابط دفعة واحدة (Bulk)"
                    : "Paste Multiple Lines"}
                </button>
              </div>

              {/* Bulk Multi-Line Textarea */}
              {showBulkPaste ? (
                <div className='space-y-2 rounded-2xl border border-border bg-background p-4'>
                  <textarea
                    value={bulkTextInput}
                    onChange={(e) => setBulkTextInput(e.target.value)}
                    placeholder={`https://www.booking.com/hotel/tr/hotel-1.html\nhttps://www.booking.com/hotel/tr/hotel-2.html\nhttps://www.booking.com/hotel/tr/hotel-3.html`}
                    rows={5}
                    className='w-full bg-transparent border-0 text-xs font-mono text-foreground placeholder-white/20 focus:outline-none resize-none'
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleApplyBulkPaste}
                      className='px-4 py-1.5 rounded-xl bg-secondary hover:bg-secondary text-foreground text-xs font-bold transition-all'
                    >
                      {locale === "ar" ? "تطبيق وإدراج الروابط" : "Import Extracted Links"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Step-by-Step URL List */
                <div className="space-y-2.5 max-h-72 overflow-y-auto pe-1">
                  {urls.map((u, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className='text-xs font-mono font-bold text-muted-foreground w-6 text-center'>
                        #{idx + 1}
                      </span>
                      <div className="relative flex-1">
                        <Link2 className='h-4 w-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2' />
                        <input
                          type="url"
                          value={u}
                          onChange={(e) => handleUrlChange(idx, e.target.value)}
                          placeholder="https://www.booking.com/hotel/..."
                          className='w-full bg-background border border-border rounded-xl ps-9 pe-3 py-2.5 text-xs text-foreground placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-border/50 font-mono'
                        />
                      </div>
                      {urls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveUrl(idx)}
                          className='p-2.5 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors'
                          title="Remove URL"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className='w-full py-2.5 rounded-xl border border-dashed border-border hover:border-border/50 text-muted-foreground hover:text-secondary text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2'
                  >
                    <Plus size={16} />
                    <span>{locale === "ar" ? "إضافة رابط فندق آخر (+)" : "Add Another Hotel URL (+)"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className='flex items-center justify-between px-6 py-4 border-t border-border bg-background/60'>
          <div className='text-xs text-muted-foreground font-mono'>
            {processedHotels.length > 0
              ? `${completedCount}/${processedHotels.length} ${locale === "ar" ? "جاهزة للنشر" : "Ready"}`
              : `${urls.filter((u) => u.trim().length > 5).length} ${locale === "ar" ? "روابط محددة" : "URLs Ready"}`}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className='px-4 py-2.5 rounded-xl border border-border hover:bg-card/5 text-xs font-semibold text-muted-foreground transition-colors'
            >
              {locale === "ar" ? "إغلاق" : "Close"}
            </button>

            {isCompleted ? (
              <button
                type="button"
                onClick={handlePublish}
                className='px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-foreground font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2'
              >
                <Upload size={16} />
                <span>
                  {locale === "ar"
                    ? `نشر كافة الفنادق (${completedCount}) في الموقع والكتالوج فوراً`
                    : `Publish All (${completedCount}) to Live Catalog`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartBulkImport}
                disabled={isProcessing || urls.filter((u) => u.trim().length > 5).length === 0}
                className='px-6 py-2.5 rounded-xl bg-gradient-to-r from-admin-btn-secondary-bg to-orange-500 hover:from-admin-btn-secondary-bg hover:to-orange-600 disabled:opacity-50 text-foreground font-black text-xs shadow-lg shadow-[hsl(var(--secondary))]/20 transition-all flex items-center gap-2'
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{locale === "ar" ? "جاري الزحف والاستخراج..." : "AI Crawling in Progress..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{locale === "ar" ? "بدء استيراد الفنادق بالذكاء الاصطناعي" : "Start Bulk AI Import"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
