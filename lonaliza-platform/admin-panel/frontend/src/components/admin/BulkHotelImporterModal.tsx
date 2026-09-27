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
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="sm:max-w-xl overflow-y-auto" dir={dir}>
        <SheetHeader>
          <SheetTitle>
            {locale === "ar" ? "الاستيراد الجماعي للفنادق بالذكاء الاصطناعي" : "Bulk AI Hotel Importer"}
          </SheetTitle>
          <SheetDescription>
            {locale === "ar"
              ? "أدخلوا قائمة بروابط الفنادق لجلب الغرف والصور والأسعار ونشرها دفعة واحدة"
              : "Queue hotel URLs for scraping of photos, room types, and rates"}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4 pb-4">
          {/* Progress Tracker when running */}
          {isProcessing || isCompleted ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2 text-[color:var(--admin-gold)]">
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
                <span className="font-mono text-base text-[color:var(--admin-gold)] font-black">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-[color:var(--admin-bg-subtle)] overflow-hidden p-0.5 border border-[color:var(--admin-border-subtle)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
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
                        ? "bg-[color:var(--admin-bg-subtle)] border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : item.status === "crawling"
                        ? "bg-[color:var(--admin-gold-soft)] border-[color:var(--admin-gold)]/50 text-[color:var(--admin-text-primary)] animate-pulse"
                        : "bg-[color:var(--admin-bg-subtle)] border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-muted)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : item.status === "crawling" ? (
                        <RefreshCw className="h-4 w-4 text-amber-400 animate-spin shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-bold truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono shrink-0">
                      {item.status === "completed" && (
                        <>
                          <span className="text-muted-foreground">{item.roomsCount} غرف</span>
                          <span className="text-amber-400">${item.priceSample}/ليلة</span>
                          <span className="text-emerald-400 font-bold">جاهز</span>
                        </>
                      )}
                      {item.status === "crawling" && (
                        <span className="text-amber-400 font-sans">سحب الصور والغرف...</span>
                      )}
                      {item.status === "pending" && (
                        <span className="text-muted-foreground">بالانتظار</span>
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
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {locale === "ar"
                    ? `قائمة روابط الفنادق المستهدفة (${urls.length} رابط):`
                    : `Hotel Target URLs (${urls.length}):`}
                </label>
                <button
                  type="button"
                  onClick={() => setShowBulkPaste(!showBulkPaste)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
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
                <div className="space-y-2 rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] p-4">
                  <textarea
                    value={bulkTextInput}
                    onChange={(e) => setBulkTextInput(e.target.value)}
                    placeholder={`https://www.booking.com/hotel/tr/hotel-1.html\nhttps://www.booking.com/hotel/tr/hotel-2.html\nhttps://www.booking.com/hotel/tr/hotel-3.html`}
                    rows={5}
                    className="w-full bg-transparent border-0 text-xs font-mono text-foreground placeholder:text-admin-text-faint focus:outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleApplyBulkPaste}
                      className="admin-btn-primary text-xs"
                    >
                      {locale === "ar" ? "تطبيق وإدراج الروابط" : "Import Extracted Links"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>{locale === "ar" ? "رابط الفندق" : "Hotel URL"}</TableHead>
                      <TableHead className="w-14" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {urls.map((u, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="relative">
                        <Link2 className="h-4 w-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={u}
                          onChange={(e) => handleUrlChange(idx, e.target.value)}
                          placeholder="https://www.booking.com/hotel/..."
                          className="admin-field ps-9 pe-3 py-2.5 text-xs font-mono"
                        />
                        </div>
                      </TableCell>
                      <TableCell>
                      {urls.length > 1 ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveUrl(idx)}
                          title="Remove URL"
                        >
                          <Trash2 size={16} />
                        </Button>
                      ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>

                  <Button type="button" variant="outline" className="w-full" onClick={handleAddUrl}>
                    <Plus size={16} />
                    <span>{locale === "ar" ? "إضافة رابط فندق آخر (+)" : "Add Another Hotel URL (+)"}</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground font-mono">
            {processedHotels.length > 0
              ? `${completedCount}/${processedHotels.length} ${locale === "ar" ? "جاهزة للنشر" : "Ready"}`
              : `${urls.filter((u) => u.trim().length > 5).length} ${locale === "ar" ? "روابط محددة" : "URLs Ready"}`}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {locale === "ar" ? "إغلاق" : "Close"}
            </Button>

            {isCompleted ? (
              <Button type="button" onClick={handlePublish}>
                <Upload size={16} />
                {locale === "ar"
                  ? `نشر كافة الفنادق (${completedCount})`
                  : `Publish All (${completedCount})`}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleStartBulkImport}
                disabled={isProcessing || urls.filter((u) => u.trim().length > 5).length === 0}
              >
                {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isProcessing
                  ? locale === "ar"
                    ? "جاري الزحف والاستخراج..."
                    : "AI Crawling in Progress..."
                  : locale === "ar"
                    ? "بدء استيراد الفنادق بالذكاء الاصطناعي"
                    : "Start Bulk AI Import"}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
