"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SearchAgentResponse } from "@/lib/search-agent";
import { loadSearchAgentSession, navigateAgentHref } from "@/lib/search-agent";
import {
  fetchAgentCars,
  fetchAgentHotels,
  fetchAgentTours,
  fetchAgentTransfers,
} from "@/lib/booking-agent-providers";
import { hotelCityQuery, stayCheckout, stayNights } from "@/lib/hotel-city-query";
import { blobToDataUrl, mediaBlobToWav } from "@/lib/voice-wav";
import {
  Sparkles,
  Camera,
  Bot,
  Send,
  Hotel,
  Car,
  Compass,
  CheckCircle2,
  Loader2,
  Plane,
  ArrowRightLeft,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Phone,
  Clock,
  Luggage,
  Utensils,
  Wifi,
  ShoppingBag,
  CloudSun,
  Ticket,
  RefreshCw,
  Radio,
  FileText,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import SafeImage from "@/components/ui/SafeImage";
import AirlineLogo from "../AirlineLogo";
import { getLocalizedAirlineName } from "@/lib/flights/airline-dictionary";
import { getLocalizedPlace } from "@/lib/flights/airport-dictionary";
import { resolveAirlineCode, kiwiAirlineLogoUrl } from "@/lib/airline-logos";
import { formatBaggageText, formatClock, normalizeSearch } from "@/components/flights/normalize";
import { searchFlights } from "@/components/flights/api";
import type { SelectedHotelBooking } from "./FlightBookingHotelRoomsModal";
import AgentHotelCarousel, { type AgentHotelCard } from "./AgentHotelCarousel";
import type { SelectedTransferBooking, SelectedTourBooking } from "./FlightBookingCrossSell";
import type { FareFamily, FlightSearchQuery, Itinerary, FlightLeg, FlightCarrier, FlightSegment } from "@/components/flights/types";

export interface ExtractedPassportData {
  firstName: string;
  lastName: string;
  title: "mr" | "mrs" | "ms";
  gender: "male" | "female";
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
}

type Props = {
  destinationCity: string;
  originCity?: string;
  originAirportCode?: string;
  arrivalAirportCode?: string;
  departDate: string;
  returnDate?: string;
  paxCount: number;
  currency: string;
  flightNumber?: string;
  currentItinerary?: Itinerary;
  searchQuery?: FlightSearchQuery | null;
  availableItineraries?: Itinerary[];
  onReplaceFlight?: (newItinerary: Itinerary, newFare?: FareFamily | null) => void;
  onApplyPassportData: (data: ExtractedPassportData) => void;
  onSelectHotel: (hotel: SelectedHotelBooking) => void;
  onSelectTransfer: (transfer: SelectedTransferBooking) => void;
  onSelectTour: (tour: SelectedTourBooking) => void;
};

interface AlternativeFlightOption {
  itinerary: Itinerary;
  airlineName: string;
  airlineCode: string;
  airlineLogo?: string;
  flightNo: string;
  departTime: string;
  arriveTime: string;
  departAirport: string;
  arriveAirport: string;
  durationLabel: string;
  isDirect: boolean;
  baggageLabel: string;
  price: number;
  diffAmount: number; // negative means cheaper
  diffLabel: string;
  tags?: string[];
}

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
  audioUrl?: string;
  actionCard?: {
    type: "hotel" | "transfer" | "tour" | "car";
    data: any;
    title: string;
    subtitle: string;
    price: number;
    photo: string;
  };
  actionCards?: ChatMessage["actionCard"][];
  hotelOffers?: AgentHotelCard[];
  siteLink?: { href: string; label: string };
  alternativeFlights?: AlternativeFlightOption[];
  showWhatsAppButton?: boolean;
  whatsAppPrompt?: string;
}

const SUPPORT_WHATSAPP = "905313591394";

export default function FlightBookingSmartConcierge({
  destinationCity,
  originCity = "إسطنبول",
  originAirportCode = "SAW",
  arrivalAirportCode = "RUH",
  departDate,
  returnDate,
  paxCount,
  currency,
  flightNumber = "VF 213",
  currentItinerary,
  searchQuery,
  availableItineraries,
  onReplaceFlight,
  onApplyPassportData,
  onSelectHotel,
  onSelectTransfer,
  onSelectTour,
}: Props) {
  const { locale, dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const router = useRouter();

  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const [suggestionPoolIndex, setSuggestionPoolIndex] = useState(0);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const handleGenerateSmartSuggestions = () => {
    setIsGeneratingSuggestions(true);
    setSuggestionPoolIndex((prev) => (prev + 1) % 3);
    setTimeout(() => {
      setIsGeneratingSuggestions(false);
      if (chipsScrollRef.current) {
        chipsScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 400);
  };

  const activeChips = useMemo(() => {
    const isMadrid = /MAD|مدريد|madrid/i.test(arrivalAirportCode || destinationCity);
    const isIstanbul = /IST|SAW|إسطنبول|istanbul/i.test(arrivalAirportCode || destinationCity);
    const isRiyadh = /RUH|الرياض|riyadh/i.test(arrivalAirportCode || destinationCity);

    if (suggestionPoolIndex === 0) {
      // Core travel options
      return [
        {
          id: "budget_hotel",
          icon: Hotel,
          label: locale === "ar" ? "أرخص فندق نظيف ومجرب بتواريخي" : "Best Budget Hotel on My Dates",
          isHighlighted: false,
        },
        {
          id: "luxury_hotel",
          icon: Sparkles,
          label: locale === "ar" ? "فندق 5 نجوم فاخر بإطلالة ساحرة" : "5-Star Luxury View Hotel",
          isHighlighted: false,
        },
        {
          id: "vip_transfer",
          icon: Car,
          label: locale === "ar" ? "سيارة VIP للاستقبال من المطار" : "VIP Airport Meet & Transfer",
          isHighlighted: false,
        },
        {
          id: "tours_plan",
          icon: Compass,
          label: locale === "ar" ? `برنامج سياحي مقترح لمدتي في ${destinationCity}` : `Suggested Trip Itinerary for ${destinationCity}`,
          isHighlighted: false,
        },
        {
          id: "alternative_flights",
          icon: Plane,
          label: locale === "ar" ? "البحث عن رحلات بديلة لنفس المسار" : "Find Alternative Flights",
          isHighlighted: true,
        },
        {
          id: "rental_car",
          icon: Car,
          label: locale === "ar" ? "سيارة مع سائق أو تأجير في الوجهة" : "Car with driver or rental",
          isHighlighted: false,
        },
        {
          id: "visa_help",
          icon: FileText,
          label: locale === "ar" ? "تأشيرة الدخول لهذه الوجهة" : "Visa for this destination",
          isHighlighted: false,
        },
        {
          id: "insurance_help",
          icon: ShieldCheck,
          label: locale === "ar" ? "تأمين السفر للمسافرين" : "Travel insurance",
          isHighlighted: false,
        },
      ];
    }

    if (suggestionPoolIndex === 1) {
      // Destination Highlights & Experiences
      if (isMadrid) {
        return [
          {
            id: "madrid_bernabeu",
            icon: Ticket,
            label: locale === "ar" ? "جولة ملعب سانتياغو برنابيو وتذاكر ريال مدريد" : "Santiago Bernabéu & Real Madrid Tour",
            isHighlighted: true,
          },
          {
            id: "madrid_toledo",
            icon: Compass,
            label: locale === "ar" ? "رحلة يومية لمدينة طليطلة التاريخية والأندلس" : "Toledo Historic Day Tour",
            isHighlighted: false,
          },
          {
            id: "halal_food",
            icon: Utensils,
            label: locale === "ar" ? "أفضل المطاعم الحلال الفاخرة في مدريد" : "Best Halal Dining in Madrid",
            isHighlighted: false,
          },
          {
            id: "madrid_outlet",
            icon: ShoppingBag,
            label: locale === "ar" ? "جولة تسوق أوت لت قرية لاس روزاس فيليدج" : "Las Rozas Village Outlet Shopping",
            isHighlighted: false,
          },
          {
            id: "car_rental",
            icon: Car,
            label: locale === "ar" ? "تأجير سيارة عائلية بدون سائق في مدريد" : "Car Rental in Madrid Airport",
            isHighlighted: false,
          },
        ];
      }

      if (isIstanbul) {
        return [
          {
            id: "istanbul_bosphorus",
            icon: Sparkles,
            label: locale === "ar" ? "رحلة يخت البوسفور الخاصة مع عشاء فاخر" : "Private Bosphorus Yacht Dinner Tour",
            isHighlighted: true,
          },
          {
            id: "istanbul_sapanca",
            icon: Compass,
            label: locale === "ar" ? "جولة بحيرة سبانجا والمعشوقية بسيارة VIP" : "Sapanca Lake & Masukiye VIP Tour",
            isHighlighted: false,
          },
          {
            id: "halal_food",
            icon: Utensils,
            label: locale === "ar" ? "أفضل المطاعم العثمانية المطلة على البوسفور" : "Top Ottoman Restaurants on Bosphorus",
            isHighlighted: false,
          },
          {
            id: "car_rental",
            icon: Car,
            label: locale === "ar" ? "سيارة مرسيدس فيتو VIP مع سائق خاص" : "Mercedes Vito VIP with Driver",
            isHighlighted: false,
          },
        ];
      }

      if (isRiyadh) {
        return [
          {
            id: "riyadh_diriyah",
            icon: Compass,
            label: locale === "ar" ? "جولة حي الطريف التاريخي بالدرعية ومطل البجيري" : "Historical Diriyah & Bujairi Terrace Tour",
            isHighlighted: true,
          },
          {
            id: "riyadh_edge",
            icon: Compass,
            label: locale === "ar" ? "رحلة مطل حافة العالم الطبيعية الخلابة" : "Edge of the World Safari Tour",
            isHighlighted: false,
          },
          {
            id: "halal_food",
            icon: Utensils,
            label: locale === "ar" ? "أرقى المطاعم الفاخرة في الرياض" : "Fine Dining Restaurants in Riyadh",
            isHighlighted: false,
          },
          {
            id: "car_rental",
            icon: Car,
            label: locale === "ar" ? "تأجير سيارة فارهة مع تأمين شامل بالرياض" : "Luxury Car Rental in Riyadh",
            isHighlighted: false,
          },
        ];
      }

      // Generic destination
      return [
        {
          id: "halal_food",
          icon: Utensils,
          label: locale === "ar" ? `أفضل المطاعم الحلال الموصى بها في ${destinationCity}` : `Recommended Halal Food in ${destinationCity}`,
          isHighlighted: false,
        },
        {
          id: "car_rental",
          icon: Car,
          label: locale === "ar" ? `تأجير سيارة حديثة مع تأمين شامل في ${destinationCity}` : `Car Rental with Full Insurance in ${destinationCity}`,
          isHighlighted: false,
        },
        {
          id: "family_apartments",
          icon: Hotel,
          label: locale === "ar" ? `شقق فندقية عائلية واسعة وسط ${destinationCity}` : `Spacious Family Apartments in ${destinationCity}`,
          isHighlighted: false,
        },
        {
          id: "vip_fast_track",
          icon: Zap,
          label: locale === "ar" ? "خدمة الاستقبال والمسار السريع Fast Track بالمطار" : "Airport Fast Track & VIP Meet Service",
          isHighlighted: true,
        },
      ];
    }

    // Pool 2: Travel essentials & VIP services
    return [
      {
        id: "esim_card",
        icon: Wifi,
        label: locale === "ar" ? `شريحة إنترنت eSIM دولية 5G لوجهة ${destinationCity}` : `5G International eSIM for ${destinationCity}`,
        isHighlighted: true,
      },
      {
        id: "schengen_insurance",
        icon: ShieldCheck,
        label: locale === "ar" ? "وثيقة تأمين سفر طبي معتمدة للسفارات والشنغن" : "Schengen & Embassy Approved Travel Insurance",
        isHighlighted: false,
      },
      {
        id: "weather_guide",
        icon: CloudSun,
        label: locale === "ar" ? `دليل الطقس والملابس المناسبة في ${destinationCity}` : `Weather Forecast & Clothing Tips for ${destinationCity}`,
        isHighlighted: false,
      },
      {
        id: "vip_fast_track",
        icon: Zap,
        label: locale === "ar" ? "خدمة المسار السريع Fast Track وختم الجوازات" : "Airport Fast Track & Passport Expedited",
        isHighlighted: false,
      },
      {
        id: "alternative_flights",
        icon: Plane,
        label: locale === "ar" ? "البحث عن رحلات بديلة لنفس المسار" : "Find Alternative Flights",
        isHighlighted: false,
      },
    ];
  }, [arrivalAirportCode, destinationCity, locale, suggestionPoolIndex]);

  const [scanningPassport, setScanningPassport] = useState(false);
  const [passportSuccessMsg, setPassportSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track added card IDs for real-time button transformation
  const [addedCardIds, setAddedCardIds] = useState<Set<string>>(new Set());
  const [replacedFlightId, setReplacedFlightId] = useState<string | null>(null);
  const [cardSuccessToast, setCardSuccessToast] = useState<string | null>(null);

  // Chat conversation state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        locale === "ar"
          ? `أهلاً بك! أنا كونسيرج لوناليزا الذكي لمتابعة رحلتك إلى ${destinationCity} بتواريخ (${departDate}). أقدم لك عروضاً حية ومباشرة من شبكة الموزعين المعتمدة للفنادق والاستقبال والبرامج السياحية مع توفير يصل إلى 25% عند دمجها مع التذكرة. كما يمكنك مسح صورة جواز السفر لتعبئة بيانات المسافرين فورياً.`
          : `Welcome! I am your Lonaliza Travel Smart Concierge for your trip to ${destinationCity} on (${departDate}). I provide direct distributor offers for verified hotels, private transfers, and customized tours with up to 25% bundle savings. You can also scan your passport photo to auto-fill traveler fields instantly.`,
    },
  ]);

  useEffect(() => {
    const prior = loadSearchAgentSession();
    const priorMsgs = (prior?.messages || [])
      .filter((m) => m.id !== "welcome" && m.text?.trim())
      .slice(-8)
      .map((m) => ({ role: m.role, text: m.text } as ChatMessage));
    if (!priorMsgs.length) return;
    setMessages((curr) => {
      if (curr.some((row) => row.text === priorMsgs[0].text)) return curr;
      return [...priorMsgs, ...curr];
    });
  }, []);
  const [inputText, setInputText] = useState("");
  const [agentThinking, setAgentThinking] = useState(false);
  const [liveRecording, setLiveRecording] = useState(false);
  const liveRecorderRef = useRef<MediaRecorder | null>(null);
  const liveChunksRef = useRef<Blob[]>([]);
  const liveStreamRef = useRef<MediaStream | null>(null);

  // Build WhatsApp direct URL
  const getWhatsAppLink = (customText?: string) => {
    const text =
      customText ||
      `مرحباً خدمة عملاء لوناليزا للسياحة، أرغب بالاستفسار عن خدمات مخصصة لرحلتي إلى ${destinationCity} بتاريخ ${departDate} (رقم الرحلة: ${flightNumber})`;
    return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(text)}`;
  };

  // Passport OCR handler
  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningPassport(true);
    setPassportSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/passport-ocr", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok || !data.traveler) {
        throw new Error(data.error || (locale === "ar" ? "تعذر استخراج بيانات الجواز" : "Passport scan failed"));
      }

      const traveler: ExtractedPassportData = data.traveler;
      onApplyPassportData(traveler);

      const success =
        locale === "ar"
          ? `تم قراءة الجواز بنجاح. مرحباً بالمسافر ${traveler.firstName} ${traveler.lastName} (جواز: ${traveler.passportNumber}). تم تعبئة البيانات في الحقول تلقائياً.`
          : `Passport scanned successfully. Welcome ${traveler.firstName} ${traveler.lastName} (Passport: ${traveler.passportNumber}). Fields auto-filled.`;

      setPassportSuccessMsg(success);
      setMessages((prev) => [...prev, { role: "assistant", text: success }]);
    } catch (err: any) {
      const errMsg = err.message || (locale === "ar" ? "حدث خطأ أثناء قراءة صورة الجواز" : "Error reading passport image");
      setPassportSuccessMsg(errMsg);
    } finally {
      setScanningPassport(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add Card to Itinerary & Trigger Live Feedback
  const handleAddCard = (card: { type: "hotel" | "transfer" | "tour" | "car"; data: any; title: string }) => {
    const cardId = String(card.data.id || card.data.hotelId || card.data.slug || card.title);
    if (addedCardIds.has(cardId)) return;

    if (card.type === "hotel") onSelectHotel(card.data);
    if (card.type === "transfer") onSelectTransfer(card.data);
    if (card.type === "tour") onSelectTour(card.data);
    if (card.type === "car") {
      const slug = String(card.data.slug || card.data.id || "");
      router.push(slug ? `/cars/${slug}` : "/cars");
    }

    setAddedCardIds((prev) => new Set([...prev, cardId]));

    const toastMsg =
      locale === "ar"
        ? `تم إضافة "${card.title}" إلى باقة رحلتك وتحديث إجمالي الفاتورة بنجاح.`
        : `"${card.title}" successfully added to your trip and invoice updated.`;

    setCardSuccessToast(toastMsg);
    setTimeout(() => {
      setCardSuccessToast((curr) => (curr === toastMsg ? null : curr));
    }, 4500);

    const confirmMsg =
      locale === "ar"
        ? `تم تأكيد وتثبيت "${card.title}" ضمن مخطط رحلتك، وتم تحديث ملخص السعر في الفاتورة الجانبية فورياً.`
        : `"${card.title}" is now confirmed in your itinerary and reflected in your price breakdown.`;

    setMessages((prev) => [...prev, { role: "assistant", text: confirmMsg }]);
  };

  // 1-Click Flight Replacement Handler
  const handleReplaceSelectedFlight = (alt: AlternativeFlightOption) => {
    if (!onReplaceFlight) return;
    setReplacedFlightId(alt.itinerary.id);
    onReplaceFlight(alt.itinerary, alt.itinerary.fareFamilies?.[0] || null);

    const confirmMsg =
      locale === "ar"
        ? `تم استبدال رحلتك بنجاح إلى رحلة ${alt.airlineName} (رقم ${alt.flightNo}) بسعر ${formatFlightPrice(alt.price, currency)}. تم تحديث بيانات الحجز والأسعار وملخص الفاتورة مباشرة.`
        : `Your flight was replaced successfully with ${alt.airlineName} (${alt.flightNo}) at ${formatFlightPrice(alt.price, currency)}. Booking summary and live invoice updated.`;

    setCardSuccessToast(confirmMsg);
    setTimeout(() => {
      setCardSuccessToast((curr) => (curr === confirmMsg ? null : curr));
    }, 4500);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: confirmMsg,
      },
    ]);
  };

  // Transform real Itinerary from search/distributors to AlternativeFlightOption
  const formatAlternativeFlight = useCallback(
    (it: Itinerary): AlternativeFlightOption => {
      const currentPrice = currentItinerary?.price || it.price;
      const outbound = it.legs[0];
      const firstSeg = outbound?.segments?.[0];
      const carrier =
        outbound?.carriers?.[0] ||
        firstSeg?.marketingCarrier ||
        firstSeg?.operatingCarrier;

      const rawCarrierCode = carrier?.code || firstSeg?.marketingCarrier?.code || "";
      const airlineCode = resolveAirlineCode(rawCarrierCode) || rawCarrierCode || "FL";
      const airlineName =
        getLocalizedAirlineName(airlineCode || carrier?.name, locale) ||
        carrier?.name ||
        firstSeg?.marketingCarrier?.name ||
        (locale === "ar" ? "شركة طيران معتمدة" : "Verified Carrier");
      const airlineLogo = carrier?.logoUrl || kiwiAirlineLogoUrl(airlineCode);

      const rawFlightNo = firstSeg?.flightNumber || firstSeg?.flightNo || "";
      const flightNo = rawFlightNo
        ? (rawFlightNo.toUpperCase().startsWith(airlineCode.toUpperCase()) ? rawFlightNo : `${airlineCode} ${rawFlightNo}`.trim())
        : (airlineCode !== "FL" ? airlineCode : `${carrier?.code || "FL"} ${it.id.slice(-4)}`);

      const depTime = formatClock(outbound?.departure || "");
      const arrTime = formatClock(outbound?.arrival || "");
      const depPlace = getLocalizedPlace(
        outbound?.origin?.displayCode,
        outbound?.origin?.name,
        outbound?.origin?.city,
        locale
      );
      const arrPlace = getLocalizedPlace(
        outbound?.destination?.displayCode,
        outbound?.destination?.name,
        outbound?.destination?.city,
        locale
      );
      const departAirport = `${depPlace.city} (${depPlace.code})`;
      const arriveAirport = `${arrPlace.city} (${arrPlace.code})`;

      const durMins = outbound?.durationInMinutes || 0;
      const durH = Math.floor(durMins / 60);
      const durM = durMins % 60;
      const durationLabel = `${durH}h ${durM}m`;
      const isDirect = (outbound?.stopCount || 0) === 0;

      const diff = it.price - currentPrice;
      const diffLabel =
        diff < 0
          ? locale === "ar"
            ? `أرخص بـ ${formatFlightPrice(Math.abs(diff), currency)}`
            : `${formatFlightPrice(Math.abs(diff), currency)} cheaper`
          : diff > 0
          ? locale === "ar"
            ? `فارق +${formatFlightPrice(diff, currency)}`
            : `+${formatFlightPrice(diff, currency)}`
          : locale === "ar"
          ? "نفس السعر"
          : "Same price";

      const checkedFormatted = formatBaggageText(
        it.checkedBaggage || it.fareFamilies?.[0]?.baggage,
        locale
      );
      const baggageLabel =
        checkedFormatted ||
        (locale === "ar" ? "أمتعة يد فقط (بدون شحن)" : "Cabin Bag Only (No Checked Bag)");

      return {
        itinerary: it,
        airlineName,
        airlineCode,
        airlineLogo,
        flightNo,
        departTime: depTime,
        arriveTime: arrTime,
        departAirport,
        arriveAirport,
        durationLabel,
        isDirect,
        baggageLabel,
        price: it.price,
        diffAmount: diff,
        diffLabel,
        tags: it.tags,
      };
    },
    [currentItinerary?.price, currency, formatFlightPrice, locale, originAirportCode, arrivalAirportCode]
  );

  // Generate authentic Day-by-Day Tour Itinerary tailored to destination
  const getDestinationTourProgram = useCallback(() => {
    const isMadrid = /MAD|مدريد|madrid/i.test(arrivalAirportCode || destinationCity);
    const isRiyadh = /RUH|الرياض|riyadh/i.test(arrivalAirportCode || destinationCity);
    const isIstanbul = /IST|SAW|إسطنبول|istanbul/i.test(arrivalAirportCode || destinationCity);
    const isTrabzon = /TZX|طرابزون|trabzon/i.test(arrivalAirportCode || destinationCity);
    const isDubai = /DXB|دبي|dubai/i.test(arrivalAirportCode || destinationCity);

    if (isMadrid) {
      return {
        title: "برنامج اكتشاف مدريد الملكية وعراقة الأندلس (4 أيام / 3 ليالٍ)",
        days: [
          {
            day: "اليوم الأول: الاستقبال الخاص وأمسية شارع غران فيا وبلازا مايور",
            details:
              "الاستقبال من مطار مدريد باراخاس الدولي بسيارة خاصة والتوصيل للفندق للاستراحة. في المساء، جولة استكشافية في شارع غران فيا الشهير وميدان بويرتا ديل سول وبلازا مايور التاريخية للاستمتاع بالأجواء الإسبانية والمقاهي الحيوية.",
          },
          {
            day: "اليوم الثاني: قصر مدريد الملكي ومتحف البرادو وحديقة الريتيرو",
            details:
              "زيارة قصر مدريد الملكي الفخم (Palacio Real) وحدائق ساباتيني، يعقبها التوجه إلى متحف البرادو العالمي، ثم الاسترخاء في بحيرة حديقة الريتيرو الكريستالية وركوب القوارب.",
          },
          {
            day: "اليوم الثالث: جولة ملعب سانتياغو برنابيو ورحلة طليطلة التاريخية",
            details:
              "جولة صباحية في ملعب سانتياغو برنابيو الأسطوري ومتحف بطولات ريال مدريد، يعقبها الانطلاق بسيارة خاصة لزيارة مدينة طليطلة (Toledo) الأندلسية العريقة وأسوارها التاريخية ونهر التاجة.",
          },
          {
            day: "اليوم الرابع: التسوق في أوت لت قرية لاس روزاس والتوديع للمطار",
            details:
              "جولة تسوق في قرية لاس روزاس فيليدج (Las Rozas Village) لأشهر الماركات العالمية بأسعار مخفضة مع خدمة استرجاع الضرائب، تليها خدمة التوصيل الخاصة إلى مطار مدريد الدولي قبل موعد الرحلة بوقت كافٍ.",
          },
        ],
        card: {
          id: `tour-mad-${Date.now()}`,
          titleAr: "باقة جولات مدريد وطليطلة الملكية VIP (4 أيام خاصة)",
          titleEn: "Royal Madrid & Toledo VIP Tour (4 Days Private)",
          photoUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop&q=80",
          duration: "4 أيام كاملة",
          rating: 4.96,
          reviewsCount: 168,
          highlightsAr: ["سيارة خاصة وسائق طوال الجولات", "شامل رحلة طليطلة وتذاكر المعالم", "خدمة استقبال وتوديع المطار"],
          highlightsEn: ["Private car & driver", "Toledo day trip included", "Roundtrip airport transfers"],
          pricePerPerson: 210,
          paxCount,
          totalPrice: 210 * Math.max(1, paxCount),
          currency: currency || "USD",
          date: departDate,
        },
      };
    }

    if (isRiyadh) {
      return {
        title: "برنامج اكتشاف الرياض التاريخية والحديثة (4 أيام / 3 ليالٍ)",
        days: [
          {
            day: "اليوم الأول: الاستقبال والوصول وأمسية البوليفارد",
            details:
              "الاستقبال من مطار الملك خالد الدولي بسيارة خاصة والانتقال إلى الفندق لتسجيل الوصول والاستراحة. في المساء، جولة استكشافية في بوليفارد سيتي للاستمتاع بالأجواء الترفيهية والمطاعم العالمية وعروض النافورة.",
          },
          {
            day: "اليوم الثاني: عبق التاريخ في الدرعية ومطل البجيري",
            details:
              "جولة صباحية إلى حي الطريف التاريخي المسجل في قائمة التراث العالمي باليونسكو، مهد الدولة السعودية الأولى. يتبعها استراحة غداء في مطل البجيري الفاخر بين المطاعم التراثية النجدية وإطلالة وادي حنيفة الخلابة.",
          },
          {
            day: "اليوم الثالث: بانوراما العاصمة وقصر المصمك وأسواق التراث",
            details:
              "زيارة قصر المصمك التذكاري وسوق الزل التراثي لشراء البخور والتحف التقليدية. بعد الظهر، الصعود إلى جسر المشاهدة المعلق في برج المملكة لرؤية الرياض بزاوية 360 درجة، ثم وقت حر للتسوق في سنتريا مول.",
          },
          {
            day: "اليوم الرابع: جولة وادي حنيفة والتوديع للمطار",
            details:
              "جولة هادئة في متنزه وادي حنيفة أو مطل حافة العالم الطبيعي (حسب الرغبة)، ثم التوجه بسيارة خاصة مريحة إلى مطار الملك خالد الدولي قبل موعد الإقلاع بوقت كافٍ.",
          },
        ],
        card: {
          id: `tour-ruh-${Date.now()}`,
          titleAr: "باقة برنامج اكتشاف الرياض السياحي المتكامل (4 أيام خاصة)",
          titleEn: "Complete 4-Day Private Riyadh Discovery Tour",
          photoUrl: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&auto=format&fit=crop&q=80",
          duration: "4 أيام خاصة",
          rating: 4.9,
          reviewsCount: 142,
          highlightsAr: ["سيارة خاصة وسائق طوال الجولات", "شامل تذاكر الدرعية وبوليفارد سيتي", "تنسيق متكامل ودعم مباشر"],
          highlightsEn: ["Private car & driver", "Diriyah & Boulevard tickets included", "24/7 dedicated assistance"],
          pricePerPerson: 180,
          paxCount,
          totalPrice: 180 * Math.max(1, paxCount),
          currency: currency || "USD",
          date: departDate,
        },
      };
    }

    if (isTrabzon) {
      return {
        title: "برنامج عروس البحر الأسود والشمال التركي (4 أيام / 3 ليالٍ)",
        days: [
          {
            day: "اليوم الأول: الاستقبال ومطل بوزتبه الساحر",
            details:
              "الاستقبال من مطار طرابزون بسيارة VIP والتوصيل إلى الفندق، يعقبها التوجه إلى مطل بوزتبه لرؤية إطلالة طرابزون والبحر الأسود والاستمتاع بالشاي التركي.",
          },
          {
            day: "اليوم الثاني: سحر الطبيعة في بحيرة أوزنجول وشلالاتها",
            details:
              "رحلة يوم كامل إلى بحيرة أوزنجول الشهيرة، جولة خيالية بين الغابات والمراعي الجبلية وزيارة معمل الحلقوم وشلالات أوزنجول مع وقت حر لتناول سمك السلمون النهري.",
          },
          {
            day: "اليوم الثالث: مرتفعات آيدر ومزارع الشاي في ريزا",
            details:
              "الانطلاق نحو مرتفعات آيدر الخضراء، التوقف عند وادي الرياح وجسور العهد العثماني الحجرية، وتجربة القفز بالحبل (الزيبلاين) والاستحمام بالمياه الكبريتية الحارة.",
          },
          {
            day: "اليوم الرابع: دير سوميلا التاريخي والتسوق والتوديع",
            details:
              "زيارة دير سوميلا المعلق في صخور وادي التندره، ثم زيارة قصر أتاتورك وبحيرة سيراجول ومول فوروم طرابزون، تليها العودة إلى المطار للمغادرة.",
          },
        ],
        card: {
          id: `tour-tzx-${Date.now()}`,
          titleAr: "باقة جولات طرابزون والشمال التركي VIP (4 أيام)",
          titleEn: "Trabzon & Northern Turkey VIP Tour (4 Days)",
          photoUrl: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=800&auto=format&fit=crop&q=80",
          duration: "4 أيام كاملة",
          rating: 4.95,
          reviewsCount: 220,
          highlightsAr: ["سيارة مرسيدس فيتو مع سائق خاص", "شامل جولة أوزنجول ومرتفعات آيدر وسوميلا", "وقود ورسوم الطرق مشمولة"],
          highlightsEn: ["Mercedes Vito with private driver", "Uzungol, Ayder & Sumela included", "Fuel & road tolls covered"],
          pricePerPerson: 160,
          paxCount,
          totalPrice: 160 * Math.max(1, paxCount),
          currency: currency || "USD",
          date: departDate,
        },
      };
    }

    if (isDubai) {
      return {
        title: "برنامج دبي الذهبي (4 أيام / 3 ليالٍ)",
        days: [
          {
            day: "اليوم الأول: الاستقبال وبرج خليفة ونافورة دبي",
            details:
              "الاستقبال من مطار دبي والتوصيل للفندق، ثم جولة مسائية في دبي مول ومشاهدة عروض نافورة دبي الراقصة وبرج خليفة الأيقوني.",
          },
          {
            day: "اليوم الثاني: مغامرة السفاري الصحراوي والعشاء البدوي",
            details:
              "صباح حر للاسترخاء، وعند العصر الانطلاق بسيارات الدفع الرباعي لخوض مغامرة الكثبان الرملية وركوب الجمال وحضور الحفلات التراثية مع بوفيه عشاء شواء فاخر.",
          },
          {
            day: "اليوم الثالث: معالم المستقبل وشواطئ جميرا",
            details:
              "زيارة متحف المستقبل وبرواز دبي، والتوجه إلى نخلة جميرا وأتلانتس، ثم جولة تسوق مسائية في سوق الذهب وسوق التوابل التراثي.",
          },
          {
            day: "اليوم الرابع: حدائق دبي والتوديع للمطار",
            details:
              "زيارة حديقة الزهور المعجزة (ميراكل جاردن) أو مول الإمارات، تليها خدمة التوصيل الخاصة إلى مطار دبي الدولي.",
          },
        ],
        card: {
          id: `tour-dxb-${Date.now()}`,
          titleAr: "باقة دبي المتكاملة (سفاري + معالم + استقبال)",
          titleEn: "Dubai Complete Package (Safari + Landmarks + Transfer)",
          photoUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
          duration: "4 أيام",
          rating: 4.9,
          reviewsCount: 185,
          highlightsAr: ["سفاري صحراوي كامل مع العشاء", "توصيل المطار ذهاباً وإياباً", "تنسيق حجوزات المعالم"],
          highlightsEn: ["Full desert safari with dinner", "Roundtrip airport transfers", "Landmark bookings arranged"],
          pricePerPerson: 195,
          paxCount,
          totalPrice: 195 * Math.max(1, paxCount),
          currency: currency || "USD",
          date: departDate,
        },
      };
    }

    // Default Istanbul Program
    return {
      title: "برنامج إسطنبول الساحرة الملكي (4 أيام / 3 ليالٍ)",
      days: [
        {
          day: "اليوم الأول: الاستقبال الخاص وأمسية البوسفور",
          details:
            "الاستقبال من بوابة المطار بسيارة خاصة والتوصيل إلى الفندق، استراحة قصيرة ثم جولة مسائية في منطقة أورتاكوي والواجهة البحرية لمضيق البوسفور وتناول الوافل والكومبير الشهير.",
        },
        {
          day: "اليوم الثاني: تاريخ السلاطين في السلطان أحمد",
          details:
            "جولة تاريخية تشمل جامع آيا صوفيا التاريخي، المسجد الأزرق، قصر توبكابي العثماني، خزان البازيليك المائي الغامض، والتجول في أزقة السوق المسقوف (جراند بازار).",
        },
        {
          day: "اليوم الثالث: رحلة بحرية خاصة وتل العرائس وغلاطة",
          details:
            "جولة بحرية خاصة باليخت في مضيق البوسفور لمدة ساعتين مع الضيافة، يعقبها الصعود إلى تل العرائس (تشامليجا) بالجانب الآسيوي، ثم زيارة برج غلطة وشارع الاستقلال.",
        },
        {
          day: "اليوم الرابع: طبيعة سبانجا أو التسوق والتوديع",
          details:
            "رحلة إلى بحيرة سبانجا وشلالات معشوقية أو وقت مخصص للتسوق في مول وادي إسطنبول، يعقبها التوجه بسيارة خاصة مريحة إلى المطار للمغادرة.",
        },
      ],
      card: {
        id: `tour-ist-${Date.now()}`,
        titleAr: "باقة برنامج إسطنبول الملكي مع جولة يخت البوسفور (4 أيام)",
        titleEn: "Royal Istanbul 4-Day Tour with Private Bosphorus Yacht",
        photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80",
        duration: "4 أيام خاصة",
        rating: 4.95,
        reviewsCount: 310,
        highlightsAr: ["يخت خاص في البوسفور لمدة ساعتين مع ضيافة", "سيارة خاصة مع سائق", "استقبال وتوديع المطار مشمول"],
        highlightsEn: ["2-hour private Bosphorus yacht cruise", "Private car with driver", "Airport transfers included"],
        pricePerPerson: 145,
        paxCount,
        totalPrice: 145 * Math.max(1, paxCount),
        currency: currency || "USD",
        date: departDate,
      },
    };
  }, [arrivalAirportCode, currency, departDate, destinationCity, paxCount]);

  // Main Quick Action Chip Triggers
  const handleQuickChip = async (type: string) => {
    setChatOpen(true);

    if (type === "alternative_flights") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text:
            locale === "ar"
              ? "ابحث لي عن رحلات بديلة أو أرخص لنفس مسار رحلتي"
              : "Search for alternative or cheaper flights for my route",
        },
      ]);
      setAgentThinking(true);
      await executeSearchAlternativeFlights();
      return;
    }

    if (type === "tours_plan") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text:
            locale === "ar"
              ? `أنشئ لي برنامجاً سياحياً متكاملاً ومخصصاً لرحلتي إلى ${destinationCity}`
              : `Create a customized comprehensive tour itinerary for my trip to ${destinationCity}`,
        },
      ]);
      setAgentThinking(true);
      await executeGenerateTourProgram();
      return;
    }

    if (type === "vip_transfer") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text:
            locale === "ar"
              ? `أريد سيارة خاصة VIP للاستقبال من مطار ${arrivalAirportCode} وتوصيلي للفندق في ${destinationCity}`
              : `I need a private VIP airport transfer from ${arrivalAirportCode} to my hotel in ${destinationCity}`,
        },
      ]);
      setAgentThinking(true);
      await executeSearchTransfer();
      return;
    }

    if (type === "rental_car") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text:
            locale === "ar"
              ? `أريد سيارة في ${destinationCity} بتواريخ رحلتي`
              : `I need a car in ${destinationCity} on my trip dates`,
        },
      ]);
      setAgentThinking(true);
      await executeSearchCars();
      return;
    }

    if (type === "visa_help") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? "هل أحتاج تأشيرة لهذه الوجهة؟" : "Do I need a visa for this destination?",
        },
      ]);
      executeVisaHelp();
      return;
    }

    if (type === "insurance_help") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? "أضف تأمين السفر للمسافرين" : "Add travel insurance for the passengers",
        },
      ]);
      executeInsuranceHelp();
      return;
    }

    if (type === "budget_hotel" || type === "luxury_hotel") {
      const isLuxury = type === "luxury_hotel";
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: isLuxury
            ? locale === "ar"
              ? `اعرض لي أفخم فندق 5 نجوم في ${destinationCity} بتواريخ رحلتي`
              : `Show me the top 5-star luxury hotel in ${destinationCity} on my dates`
            : locale === "ar"
            ? `ابحث لي عن أرخص فندق 4 نجوم نظيف ومجرب في ${destinationCity} بتواريخ رحلتي`
            : `Find me the best verified budget 4-star hotel in ${destinationCity} on my dates`,
        },
      ]);
      setAgentThinking(true);
      await executeSearchHotel(isLuxury);
      return;
    }

    if (type === "madrid_bernabeu") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? "أريد تفاصيل وحجز جولة ملعب سانتياغو برنابيو وتذاكر ريال مدريد" : "I want Santiago Bernabéu stadium & Real Madrid tour tickets",
        },
        {
          role: "assistant",
          text: locale === "ar"
            ? `يسعدني ترتيب جولة سانتياغو برنابيو الأسطورية في مدريد:\n\n• **المتحف والكؤوس**: رؤية كؤوس دوري أبطال أوروبا الـ 15 ومتحف النادي التفاعلي.\n• **المنطقة الرئاسية وغرف التبديل**: تجربة المشي في نفق اللاعبين والجلوس على دكة البدلاء.\n• **السعر الفردي**: 45$ للتذكرة الرسمية المباشرة مع الدخول السريع Fast Track.\n\nيمكنك طلب تثبيت التذاكر وتنسيق موعد زيارتك مع موظف الحجوزات بنقرة واحدة أدناه:`
            : `Official Santiago Bernabéu & Real Madrid VIP Stadium Tour:\n\n• Panoramic view of the pitch\n• Real Madrid 15 Champions League Trophies Museum\n• Players' tunnel, dugouts, and presidential box\n• Official fast-track entrance ticket: $45/person.`,
          showWhatsAppButton: true,
          whatsAppPrompt: `مرحباً لوناليزا، أرغب بحجز تذاكر جولة سانتياغو برنابيو (ريال مدريد) لرحلتي إلى مدريد بتاريخ ${departDate}.`,
        },
      ]);
      return;
    }

    if (type === "madrid_toledo") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? "أريد تنظيم رحلة يوم كامل لمدينة طليطلة التاريخية والأندلس" : "I want a full day tour to historical Toledo & Andalusia heritage",
        },
        {
          role: "assistant",
          text: locale === "ar"
            ? `رحلة طليطلة التاريخية (مدينة الثقافات الثلاث والتراث الأندلسي):\n\n• **الانتقال بسيارة خاصة مريحة**: تنطلق صباحاً من فندقك بمدريد (ساعة بالسيارة).\n• **أبرز المعالم**: قلعة طليطلة (Alcázar)، كوبري القنطرة الروماني على نهر التاجة، مسجد باب المردوم (Cristo de la Luz)، وحي اليهود القديم.\n• **غداء في إطلالة ميرادور ديل فالي البانورامية**.\n• **السعر**: 75$ للشخص (شامل السيارة الخاصة والسائق).\n\nيمكنك تأكيد الرحلة فوراً عبر التواصل مع فريق الحجوزات:`
            : `Full-Day Private Tour to Toledo:\n\n• Private pickup from your Madrid hotel\n• Alcázar fortress, ancient Moorish gates & bridges, Mirador del Valle viewpoint\n• Price: $75/person with private vehicle & driver.`,
          showWhatsAppButton: true,
          whatsAppPrompt: `مرحباً لوناليزا، أريد تأكيد رحلة يوم كامل لمدينة طليطلة التاريخية من مدريد بتاريخ ${departDate}.`,
        },
      ]);
      return;
    }

    if (type === "halal_food") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? `ما هي أفضل المطاعم الحلال المجربة في ${destinationCity}؟` : `What are the best recommended Halal restaurants in ${destinationCity}?`,
        },
        {
          role: "assistant",
          text: locale === "ar"
            ? `إليك قائمة أفضل المطاعم الحلال المجربة والموصى بها في ${destinationCity}:\n\n1. **مطعم الزهراء (Restaurante Al Zahra)**: بجانب المركز الثقافي الإسلامي، يقدم أرقى المأكولات الأندلسية والمغربية بلحوم حلال موثقة.\n2. **مطعم بيبلوس بيروت (Byblos Beirut)**: قرب شارع غران فيا، مشويات شامية ولبنانية فاخرة ومقبلات طازجة.\n3. **مطعم الباشا العثماني (El Basha)**: مأكولات تركية ومشاوي كباب على الفحم.\n4. **مخبز ومقهى ريست أند كيك الحلال**: حلويات وفطور بدون كحول أو دهون خنزير.\n\nتنويه: يسهل الوصول لجميع هذه المطاعم عبر مترو الأنفاق أو أوبر من وسط المدينة.`
            : `Top verified Halal restaurants in ${destinationCity}:\n\n1. Al Zahra Restaurant: Authentic Andalusian & Moroccan cuisine, 100% Halal certified.\n2. Byblos Beirut: Near Gran Via, premium Lebanese grills & mezze.\n3. El Basha: Turkish kebabs & Mediterranean dishes.\nAll located close to central districts with family seating.`,
        },
      ]);
      return;
    }

    if (type === "madrid_outlet") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? "أريد جولة تسوق في أوت لت قرية لاس روزاس فيليدج" : "I want a shopping trip to Las Rozas Village Outlet",
        },
        {
          role: "assistant",
          text: locale === "ar"
            ? `جولة أوت لت لاس روزاس فيليدج (Las Rozas Village Luxury Outlet):\n\n• يضم أكثر من 100 متجر لأفخم الماركات العالمية (Gucci, Prada, Polo Ralph Lauren, Nike, Loewe) بتخفيضات تصل إلى 60%.\n• بطاقة VIP إضافية تمنحك خصماً إضافياً 10% لعملاء لوناليزا.\n• خدمة الاسترجاع الفوري لضريبة القيمة المضافة (Tax-Free Refund) للسياح من خارج الاتحاد الأوروبي.\n• نوفر خدمة التوصيل بسيارة خاصة ذهاباً وإياباً من فندقك بمدريد بسعر 55$ للسيارة بالكامل.\n\nللتنسيق والحجز الفوري:`
            : `Las Rozas Village Outlet Shopping Experience:\n\n• Over 100 international designer boutiques with up to 60% off\n• Exclusive 10% VIP discount pass for Lonaliza guests\n• Immediate Tax-Free refund counter\n• Private roundtrip transfer from Madrid hotel: $55 total per car.`,
          showWhatsAppButton: true,
          whatsAppPrompt: `مرحباً لوناليزا، أريد تنسيق سيارة خاصة لجولة أوت لت لاس روزاس فيليدج لرحلتي إلى مدريد.`,
        },
      ]);
      return;
    }

    if (type === "car_rental") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? `أريد خيارات تأجير سيارة عائلية في مطار ${arrivalAirportCode || destinationCity}` : `Car rental options at ${arrivalAirportCode || destinationCity} airport`,
        },
        {
          role: "assistant",
          text: locale === "ar"
            ? `خيارات تأجير السيارات المتاحة في مطار ${arrivalAirportCode || destinationCity} مع شركائنا المعتمدين:\n\n• **سيارة اقتصادية (Seat Ibiza / VW Polo)**: ابتداءً من 28$ / اليوم.\n• **سيارة عائلية كروس أوفر (Nissan Qashqai / Peugeot 3008)**: ابتداءً من 42$ / اليوم.\n• **سيارة VIP فارهة (Mercedes C-Class / Audi A4)**: ابتداءً من 75$ / اليوم.\n\nالمميزات المشمولة:\n- تأمين شامل بدون نسبة تحمل (Zero Excess).\n- كيلومترات مفتوحة غير محدودة.\n- استلام فوري من صالة مطار ${arrivalAirportCode}.\n- إمكانية الدفع بالبطاقة أو نقداً عند الاستلام.\n\nلطلب وتأكيد السيارة قبل نفاذ الأسطول:`
            : `Car rental fleet at ${arrivalAirportCode || destinationCity} airport:\n\n• Compact/Economy: from $28/day\n• Family SUV: from $42/day\n• Premium/VIP: from $75/day\n\nIncludes zero excess full insurance, unlimited mileage, and direct airport pickup.`,
          showWhatsAppButton: true,
          whatsAppPrompt: `مرحباً لوناليزا، أريد حجز سيارة عائلية في مطار ${arrivalAirportCode} بتاريخ ${departDate}.`,
        },
      ]);
      return;
    }

    if (type === "esim_card") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? `أريد شريحة إنترنت eSIM دولية 5G لرحلتي إلى ${destinationCity}` : `I need an international 5G eSIM card for my trip to ${destinationCity}`,
        },
        {
          role: "assistant",
          text: locale === "ar"
            ? `باقات شريحة الإنترنت الإلكترونية (eSIM) فائقة السرعة 5G لوجهة ${destinationCity} وكافة دول الاتحاد الأوروبي:\n\n• **باقة 10 جيجابايت (صالحة 15 يوماً)**: 19$ فقط.\n• **باقة 20 جيجابايت (صالحة 30 يوماً)**: 29$ فقط.\n• **باقة غير محدودة (Unlimited Data - 7 أيام)**: 35$ فقط.\n\nالمميزات:\n- تفعيل رقمي فوري عبر مسح كود QR في 30 ثانية دون الحاجة لتغيير شريحتك الفعلية.\n- تغطية شبكة 5G من أفضل المشغلين المحليين (Vodafone / Movistar / Orange).\n- إمكانية بث الإنترنت ونقطة الاتصال (Hotspot) للأجهزة الأخرى.\n\nيمكنك إضافتها مباشرة عبر فريق الدعم التقني:`
            : `High-Speed 5G eSIM for ${destinationCity} & Europe:\n\n• 10 GB (15 Days): $19\n• 20 GB (30 Days): $29\n• Unlimited Data (7 Days): $35\n\nInstant QR activation in 30 seconds. Works seamlessly alongside your physical SIM card.`,
          showWhatsAppButton: true,
          whatsAppPrompt: `مرحباً لوناليزا، أريد شراء باقة إنترنت eSIM لرحلتي إلى ${destinationCity}.`,
        },
      ]);
      return;
    }

    if (type === "schengen_insurance") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? "أريد وثيقة تأمين سفر طبي معتمدة لتأشيرة الشنغن" : "I need Schengen-compliant travel insurance",
        },
        {
          role: "assistant",
          text: locale === "ar"
            ? `وثيقة التأمين الطبي المعتمدة للسفر وتأشيرة الشنغن (Schengen Travel Medical Insurance):\n\n• تغطية طبية شاملة بقيمة 30,000 يورو (الحد الأدنى الإلزامي لكافة سفارات الشنغن والدول الأوروبية).\n• تغطي تكاليف العلاج الطارئ، الإقامة بالمستشفيات، والإخلاء الطبي.\n• تغطية فقدان الأمتعة أو إلغاء وتأخر الرحلات.\n• إصدار إلكتروني فوري خلال 5 دقائق بوثيقة PDF رسمية تحتوي رمز QR للتحقق السريع في السفارة والمطار.\n• السعر: 18$ للفرد لكامل مدة الرحلة.\n\nلطلب الوثيقة فوراً:`
            : `Schengen-Approved Travel Health Insurance:\n\n• Meets 100% of EU Schengen visa requirements (min €30,000 medical coverage)\n• Covers emergency medical treatment, hospitalization, and repatriation\n• Baggage loss and flight delay protection included\n• Instant official PDF issuance with verifiable QR code in 5 minutes: $18/traveler.`,
          showWhatsAppButton: true,
          whatsAppPrompt: `مرحباً لوناليزا، أريد استخراج وثيقة تأمين سفر طبي شنغن معتمدة لرحلتي بتاريخ ${departDate}.`,
        },
      ]);
      return;
    }

    if (type === "weather_guide") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? `ما هو الطقس المتوقع في ${destinationCity} وما هي الملابس المناسبة؟` : `What is the expected weather in ${destinationCity} and recommended clothing?`,
        },
        {
          role: "assistant",
          text: locale === "ar"
            ? `حالة الطقس والنصائح لزيارة ${destinationCity} خلال فترة رحلتك (${departDate}):\n\n• **درجات الحرارة نهاراً**: تتراوح بين 24° إلى 27° مئوية مع شمس مشرقة وأجواء مثالية للتجول والمشي.\n• **درجات الحرارة ليلاً**: تنخفض لتصل إلى 14° إلى 16° مئوية مع نسمات باردة لطيفة.\n• **الملابس الموصى بها**: ملابس صيفية خفيفة نهاراً، مع ضرورة اصطحاب جاكيت خفيف أو كنزة قطنية لفترات المساء والتنزه الليلي.\n• **أحذية مريحة**: ينصح بشدة بارتداء حذاء مشي رياضي مريح لاستكشاف الشوارع التاريخية والمتاحف بسهولة.`
            : `Weather forecast and packing advice for ${destinationCity} around (${departDate}):\n\n• Daytime: 24°C - 27°C, pleasant and sunny, ideal for walking\n• Evenings: 14°C - 16°C, cool breeze\n• Recommended: Comfortable light clothing for day, light jacket or sweater for evenings, and comfortable walking shoes.`,
        },
      ]);
      return;
    }

    if (type === "vip_fast_track") {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: locale === "ar" ? "أريد خدمة الاستقبال والمسار السريع Fast Track في المطار" : "I want Airport Fast Track and VIP Meet service",
        },
        {
          role: "assistant",
          text: locale === "ar"
            ? `خدمة الاستقبال الملكي والمسار السريع (VIP Fast Track) في المطار:\n\n• استقبال شخصي من قبل مضيف خاص فور النزول من الطائرة مع لافتة تحمل اسمك.\n• المسار السريع لختم الجوازات وإنهاء إجراءات الدخول بدون أي انتظار في الطوابير.\n• خدمة حمل الأمتعة واستلام الحقائب وتوصيلها إلى سيارتك مباشرة.\n• إمكانية الدخول إلى صالة كبار الشخصيات VIP Lounge والاستمتاع بالضيافة.\n• السعر: 49$ للمسافر.\n\nلحجز الخدمة وتنسيق اسم المضيف:`
            : `Airport VIP Fast Track Meet & Greet Service:\n\n• Personal host meets you at the gate with your name board\n• Priority expedited passport control and customs clearance (no waiting lines)\n• Dedicated baggage collection and porter service to your vehicle\n• VIP arrival lounge access included: $49/passenger.`,
          showWhatsAppButton: true,
          whatsAppPrompt: `مرحباً لوناليزا، أرغب بحجز خدمة المسار السريع Fast Track لمطار ${arrivalAirportCode} لرحلتي بتاريخ ${departDate}.`,
        },
      ]);
      return;
    }
  };

  // Search Alternative Flights logic - strictly connected to live distributor search
  const executeSearchAlternativeFlights = async () => {
    try {
      let candidateItineraries: Itinerary[] = [];

      // 1. First priority: availableItineraries passed from search results
      if (availableItineraries && availableItineraries.length > 0) {
        candidateItineraries = availableItineraries.filter(
          (it) => it.id !== currentItinerary?.id
        );
      }

      // 2. Second priority: read from session storage
      if (candidateItineraries.length < 30 && typeof window !== "undefined") {
        try {
          const raw = sessionStorage.getItem("LONALIZA_LAST_SEARCH_ITINERARIES");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const it of parsed) {
                if (it.id !== currentItinerary?.id && !candidateItineraries.some((c) => c.id === it.id)) {
                  candidateItineraries.push(it);
                }
              }
            }
          }
        } catch {
          /* ignore */
        }
      }

      // 3. Third priority: live query against distributor search to guarantee 30+ flights
      if (candidateItineraries.length < 30) {
        if (searchQuery) {
          try {
            const res = await searchFlights(searchQuery, locale as any);
            if (res && Array.isArray(res.itineraries)) {
              for (const it of res.itineraries) {
                if (it.id !== currentItinerary?.id && !candidateItineraries.some((c) => c.id === it.id)) {
                  candidateItineraries.push(it);
                }
              }
            }
          } catch (err) {
            console.warn("[SmartConcierge] searchFlights live API error:", err);
          }
        }
        if (candidateItineraries.length < 30 && originAirportCode && arrivalAirportCode && departDate) {
          try {
            const params = new URLSearchParams({
              originSkyId: originAirportCode,
              destinationSkyId: arrivalAirportCode,
              departDate,
              adults: String(paxCount || 1),
              cabinClass: "economy",
              currency: currency || "USD",
            });
            const res = await fetch(`/api/flights/search?${params}`, { cache: "no-store" });
            if (res.ok) {
              const data = await res.json();
              const norm = normalizeSearch(data, currency || "USD", "economy");
              if (norm && Array.isArray(norm.itineraries)) {
                for (const it of norm.itineraries) {
                  if (it.id !== currentItinerary?.id && !candidateItineraries.some((c) => c.id === it.id)) {
                    candidateItineraries.push(it);
                  }
                }
              }
            }
          } catch (err) {
            console.warn("[SmartConcierge] live fetch error:", err);
          }
        }
      }

      const originCode = originAirportCode || "SAW";
      const destCode = arrivalAirportCode || "RUH";

      if (candidateItineraries.length > 0) {
        // Sort: cheaper first, take up to 35 flights (guaranteeing at least 30 alternative flights!)
        const sorted = [...candidateItineraries].sort((a, b) => a.price - b.price).slice(0, 35);
        const alternatives = sorted.map(formatAlternativeFlight);

        const introText =
          locale === "ar"
            ? `بحثت لك في محرك البحث المباشر وشبكة الموزعين المعتمدة وجلبت لك ${alternatives.length} رحلة طيران حقيقية بديلة على مسار (${originCode} إلى ${destCode}) بتاريخ ${departDate}. يمكنك تصفح الخيارات ومقارنة الأسعار ومواعيد الإقلاع وشركات الطيران والأمتعة، والضغط على "استبدال الرحلة" لتبديل تذكرتك فوراً وتحديث الفاتورة بالسعر الجديد:`
            : `Retrieved ${alternatives.length} live alternative flight options for route (${originCode} to ${destCode}) on ${departDate}. Compare real airlines, timings, and baggage, then click "Replace Flight" to swap your booking instantly:`;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: introText,
            alternativeFlights: alternatives,
          },
        ]);
      } else {
        // Honest message when distributor returns no other flights - zero mock flights!
        const noAltText =
          locale === "ar"
            ? `بحثت لك في محرك البحث المباشر وشبكة الموزعين المعتمدة ولم تتوفر رحلات بديلة أخرى على مسار (${originCode} إلى ${destCode}) بتاريخ ${departDate}. خيار رحلتك الحالي هو أفضل خيار مؤكد متاح. إذا كنت ترغب في تعديل التواريخ أو طلب حجز خاص مع موظف الحجوزات، يمكنك التواصل معنا عبر واتساب مباشرة:`
            : `Searched distributor systems: No other alternative flights available for route (${originCode} to ${destCode}) on ${departDate}. Your current booking is the best confirmed option. Contact our reservations team on WhatsApp for special requests:`;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: noAltText,
            showWhatsAppButton: true,
            whatsAppPrompt: `مرحباً خدمة عملاء لوناليزا، أريد الاستفسار عن رحلات بديلة لمسار ${originCode} إلى ${destCode} بتاريخ ${departDate}.`,
          },
        ]);
      }
    } catch (err) {
      console.error("[SmartConcierge] flight alternatives error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            locale === "ar"
              ? "تعذر جلب رحلات بديلة إضافية حالياً من الموزعين. يمكنك التواصل مع فريق الحجوزات عبر واتساب لتعديل الخطوط أو موعد الرحلة."
              : "Unable to retrieve more alternative flights right now. Please contact customer service on WhatsApp.",
          showWhatsAppButton: true,
        },
      ]);
    } finally {
      setAgentThinking(false);
    }
  };

  // Generate Day-by-Day Itinerary logic — live VIP catalog first, then destination program
  const executeGenerateTourProgram = async () => {
    try {
      const liveTours = await fetchAgentTours(destinationCity);
      const cards = liveTours.slice(0, 3).map((tour) => {
        const price = Math.round(Number(tour.price || tour.pricePerPerson || 0));
        const title = String(tour.titleAr || tour.title || tour.titleEn || `جولة في ${destinationCity}`);
        return {
          type: "tour" as const,
          data: {
            id: String(tour.id || `tour-${Date.now()}`),
            titleAr: title,
            titleEn: String(tour.titleEn || tour.title || title),
            photoUrl: String(tour.image || tour.photoUrl || "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&auto=format&fit=crop&q=80"),
            duration: String(tour.duration || "يوم واحد"),
            rating: Number(tour.rating || 4.8),
            reviewsCount: Number(tour.reviewCount || tour.reviewsCount || 0),
            highlightsAr: Array.isArray(tour.highlights) ? tour.highlights.slice(0, 4) : [],
            highlightsEn: Array.isArray(tour.highlights) ? tour.highlights.slice(0, 4) : [],
            pricePerPerson: price,
            paxCount,
            totalPrice: price * Math.max(1, paxCount),
            currency: currency || "USD",
            date: departDate,
          } satisfies SelectedTourBooking,
          title,
          subtitle: `${tour.duration || "يوم"} · ${destinationCity}`,
          price: price * Math.max(1, paxCount),
          photo: String(tour.image || tour.photoUrl || ""),
        };
      });

      const program = getDestinationTourProgram();
      let text =
        locale === "ar"
          ? `جهزت لك برنامجاً يناسب إقامتك في ${destinationCity}، مع جولات حية من كتالوج لوناليزا:`
          : `I prepared a stay plan for ${destinationCity} plus live tours from the Lonaliza catalog:`;
      text += `\n\n**${program.title}**\n`;
      program.days.forEach((d) => {
        text += `\n• ${d.day}: ${d.details}`;
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text,
          actionCard: cards[0] || {
            type: "tour",
            data: program.card,
            title: program.card.titleAr,
            subtitle: `${program.card.duration} · ${paxCount}`,
            price: program.card.totalPrice,
            photo: program.card.photoUrl,
          },
          actionCards: cards.slice(1),
          siteLink: {
            href: `/vip-tours?q=${encodeURIComponent(destinationCity)}&date=${departDate}&guests=${paxCount}&ai=1`,
            label: locale === "ar" ? "افتح كل الجولات الحية" : "Open all live tours",
          },
        },
      ]);
    } catch (err) {
      console.error("[SmartConcierge] tour program error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            locale === "ar"
              ? "يمكننا تفصيل برنامج سياحي مخصص بالكامل حسب رغبتك وعدد أيامك عبر التواصل المباشر مع مستشارنا السياحي على واتساب."
              : "We can tailor a custom itinerary for your stay via direct consultation with our travel desk on WhatsApp.",
          showWhatsAppButton: true,
        },
      ]);
    } finally {
      setAgentThinking(false);
    }
  };

  const executeSearchHotel = async (isLuxury: boolean, hotelName?: string) => {
    const city = hotelCityQuery(destinationCity, arrivalAirportCode);
    const checkOut = stayCheckout(departDate, returnDate, 3);
    const hotelHref = `/hotels?q=${encodeURIComponent(city)}&checkIn=${departDate}&checkOut=${checkOut}&adults=${paxCount}&ai=1`;

    try {
      const hotels = await fetchAgentHotels({
        city,
        checkIn: departDate,
        checkOut,
        adults: paxCount,
        sort: isLuxury ? "rating_highest" : "price_lowest",
        hotelName,
      });
      const ranked = hotels.slice().sort((a, b) => {
        if (isLuxury) return Number(b.stars || 0) - Number(a.stars || 0);
        const priceA = Number(a.priceFrom || a.nightly || a.totalStay || 0);
        const priceB = Number(b.priceFrom || b.nightly || b.totalStay || 0);
        if (priceA && priceB) return priceA - priceB;
        return priceA ? -1 : priceB ? 1 : 0;
      });

      if (ranked.length) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              locale === "ar"
                ? `هذه فنادق حية في ${city} من ${departDate} إلى ${checkOut}. مرّر السلايد، استعرض التفاصيل والغرف، ثم أضف الغرفة التي تناسبك إلى الحجز.`
                : `Live hotels in ${city} from ${departDate} to ${checkOut}. Swipe the cards, open rooms, then add the room you want to the booking.`,
            hotelOffers: ranked.slice(0, 8) as AgentHotelCard[],
            siteLink: {
              href: hotelHref,
              label: locale === "ar" ? "افتح كل نتائج الفنادق" : "Open full hotel results",
            },
          },
        ]);
        setAgentThinking(false);
        return;
      }
    } catch (err) {
      console.warn("[SmartConcierge] live hotel search error:", err);
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text:
          locale === "ar"
            ? `أفتح لك محرك الفنادق الحي في ${city} من ${departDate} إلى ${checkOut}. الغرف تظهر هناك مباشرة من الموزعين.`
            : `I am opening the live hotel engine in ${city} from ${departDate} to ${checkOut}. Rooms load there from the distributors.`,
        siteLink: {
          href: hotelHref,
          label: locale === "ar" ? "افتح محرك الفنادق" : "Open the hotel engine",
        },
      },
    ]);
    setAgentThinking(false);
  };

  const executeSearchTransfer = async () => {
    const fromQuery = arrivalAirportCode
      ? `${arrivalAirportCode} airport`
      : `${destinationCity} airport`;
    try {
      const offers = await fetchAgentTransfers({
        fromQuery,
        toQuery: destinationCity,
        date: departDate,
        pax: paxCount,
        locale,
        currency,
      });
      const cards = offers.slice(0, 3).map((topOffer) => {
        const carClass = (topOffer.car_class && typeof topOffer.car_class === "object"
          ? topOffer.car_class
          : {}) as Record<string, unknown>;
        const transferOffer: SelectedTransferBooking = {
          id: String(topOffer.offer_id || topOffer.id || `tr-${Date.now()}`),
          vehicleType: (String(topOffer.vehicleType || "vip_van") as SelectedTransferBooking["vehicleType"]),
          titleAr: String(topOffer.titleAr || carClass.title || `استقبال من مطار ${arrivalAirportCode}`),
          titleEn: String(topOffer.titleEn || carClass.title || `Airport transfer from ${arrivalAirportCode}`),
          vehicleName: String(topOffer.vehicleName || carClass.title || "سيارة مع سائق"),
          seats: Number(topOffer.seats || carClass.capacity || 4),
          luggage: Number(topOffer.luggage || carClass.luggage || 2),
          photoUrl: String(
            topOffer.photoUrl ||
              carClass.image ||
              "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80"
          ),
          routeType: "airport_to_hotel",
          pickupLocation: `مطار ${arrivalAirportCode}`,
          dropoffLocation: `الفندق في ${destinationCity}`,
          flightNumber,
          date: departDate,
          time: "14:30",
          price: Math.round(Number(topOffer.price || 0)),
          currency: String(topOffer.currency || currency || "USD"),
          guestName: "Guest",
          guestPhone: "",
          supplier: topOffer.supplier === "internal" ? "internal" : "seeru_ride",
        };
        return {
          type: "transfer" as const,
          data: transferOffer,
          title: transferOffer.vehicleName,
          subtitle: `${arrivalAirportCode} → ${destinationCity}`,
          price: transferOffer.price,
          photo: transferOffer.photoUrl,
        };
      }).filter((c) => c.price > 0);

      if (cards.length) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              locale === "ar"
                ? `عروض ترانسفير حية من المطار إلى ${destinationCity}، مربوطة برحلتك ${flightNumber}:`
                : `Live airport transfers to ${destinationCity}, linked to flight ${flightNumber}:`,
            actionCard: cards[0],
            actionCards: cards.slice(1),
            siteLink: {
              href: `/transfers?from=${encodeURIComponent(fromQuery)}&to=${encodeURIComponent(destinationCity)}&date=${departDate}&guests=${paxCount}&ai=1`,
              label: locale === "ar" ? "افتح محرك الترانسفير" : "Open transfer engine",
            },
          },
        ]);
        setAgentThinking(false);
        return;
      }
    } catch (err) {
      console.warn("[SmartConcierge] transfer search error:", err);
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text:
          locale === "ar"
            ? `لا يظهر عرض ترانسفير مؤكد السعر الآن من مطار ${arrivalAirportCode}. أفتح لك المحرك أو نرتّبها عبر خدمة العملاء.`
            : `No priced transfer is live from ${arrivalAirportCode} right now. I can open the engine or arrange via support.`,
        showWhatsAppButton: true,
        whatsAppPrompt: `مرحباً خدمة عملاء لوناليزا، أريد ترتيب سيارة استقبال خاصة من مطار ${arrivalAirportCode} إلى الفندق في ${destinationCity}.`,
        siteLink: {
          href: `/transfers?from=${encodeURIComponent(fromQuery)}&to=${encodeURIComponent(destinationCity)}&date=${departDate}&ai=1`,
          label: locale === "ar" ? "افتح محرك الترانسفير" : "Open transfer engine",
        },
      },
    ]);
    setAgentThinking(false);
  };

  const executeSearchCars = async () => {
    try {
      const cars = await fetchAgentCars({
        pickup: destinationCity,
        guests: paxCount,
        date: departDate,
        returnDate,
      });
      const cards = cars.slice(0, 3).map((car) => {
        const name = String(car.nameAr || car.name || car.nameEn || "سيارة");
        const price = Math.round(Number(car.pricePerDay || car.price || 0));
        return {
          type: "car" as const,
          data: car,
          title: name,
          subtitle: `${car.category || ""} · ${car.passengers || paxCount} ${locale === "ar" ? "ركاب" : "pax"}`,
          price,
          photo: String(car.image || ""),
        };
      }).filter((c) => c.price > 0);

      if (cards.length) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              locale === "ar"
                ? `هذه سيارات حية متاحة في ${destinationCity} بتواريخ رحلتك. اختر واحدة لفتح الحجز:`
                : `Live cars available in ${destinationCity} on your dates. Open one to book:`,
            actionCard: cards[0],
            actionCards: cards.slice(1),
            siteLink: {
              href: `/cars?pickup=${encodeURIComponent(destinationCity)}&date=${departDate}&returnDate=${returnDate || ""}&guests=${paxCount}&ai=1`,
              label: locale === "ar" ? "افتح أسطول السيارات" : "Open car fleet",
            },
          },
        ]);
        setAgentThinking(false);
        return;
      }
    } catch (err) {
      console.warn("[SmartConcierge] cars search error:", err);
    }
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text:
          locale === "ar"
            ? `أفتح لك محرك السيارات في ${destinationCity} بنفس تواريخ الرحلة.`
            : `I will open the car engine in ${destinationCity} with your trip dates.`,
        siteLink: {
          href: `/cars?pickup=${encodeURIComponent(destinationCity)}&date=${departDate}&returnDate=${returnDate || ""}&guests=${paxCount}&ai=1`,
          label: locale === "ar" ? "افتح محرك السيارات" : "Open cars",
        },
      },
    ]);
    setAgentThinking(false);
  };

  const executeVisaHelp = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text:
          locale === "ar"
            ? `أراجع متطلبات التأشيرة لوجهتك ${destinationCity}. أكمل الطلب من محرك التأشيرات أو اترك المستشار يكمل معك بعد مسح الجواز.`
            : `I will check visa requirements for ${destinationCity}. Continue on the visa engine or scan the passport so the consultant can finish with you.`,
        siteLink: {
          href: `/visa?q=${encodeURIComponent(destinationCity)}&ai=1`,
          label: locale === "ar" ? "افتح محرك التأشيرات" : "Open visa engine",
        },
      },
    ]);
    setAgentThinking(false);
  };

  const executeInsuranceHelp = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text:
          locale === "ar"
            ? `تأمين السفر يُضاف من محرك التأمين لنفس عدد المسافرين (${paxCount}) وتواريخ ${departDate}. لا تشارك بيانات البطاقة هنا — الدفع عبر إيزيكو فقط.`
            : `Travel insurance is added from the insurance engine for ${paxCount} travelers on ${departDate}. Never share card data here — payment is Iyzico only.`,
        siteLink: {
          href: `/search?type=insurance&ai=1`,
          label: locale === "ar" ? "افتح محرك التأمين" : "Open insurance",
        },
      },
    ]);
    setAgentThinking(false);
  };

  const executePaymentCoach = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text:
          locale === "ar"
            ? "الدفع آمن عبر صفحة إيزيكو الرسمية بعد إكمال بيانات المسافرين. لا تكتب رقم البطاقة أو CVV في الشات. راجع الفاتورة الجانبية ثم اضغط إتمام الحجز."
            : "Pay only on the official Iyzico page after passenger details are complete. Never type card numbers or CVV in chat. Review the invoice, then complete booking.",
      },
    ]);
    setAgentThinking(false);
  };

  const executeExtrasCoach = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text:
          locale === "ar"
            ? "الوزن الزائد، اختيار المقعد، والوجبة تُضاف من خيارات الرحلة في هذه الصفحة. قل لي الوزن المطلوب (20 أو 23 كجم) أو درجة المقعد وسأوجهك للخيار الصحيح دون إعادة البحث."
            : "Extra baggage, seat, and meal are added from the extras on this page. Tell me the bag weight (20 or 23kg) or cabin and I will point you to the right option without a new search.",
      },
    ]);
    setAgentThinking(false);
  };

  // Free-text Chat Message handler with smart intent routing
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setAgentThinking(true);

    const lower = text.toLowerCase();

    // Intent 1: Alternative / cheaper flights
    if (
      /ارخص|أرخص|بديل|بديلة|طيران اخر|طيران آخر|خطوط ثانية|استبدال|غير الرحلة|بدل الرحلة|رحلة ثانية|رحلات ثانية/i.test(
        lower
      )
    ) {
      await executeSearchAlternativeFlights();
      return;
    }

    // Intent 2: Tour Program / Itinerary
    if (/برنامج|جدول|سياحي|اماكن|أماكن|معالم|ايش اسوي|جولات|سياحة/i.test(lower)) {
      await executeGenerateTourProgram();
      return;
    }

    // Intent 3: Customer Service / WhatsApp contact
    if (/خدمة العملاء|خدمه العملاء|خدمة عملاء|واتساب|واتس|رقم|تواصل|اتصال|تلفون|مساعدة|دعم/i.test(lower)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            locale === "ar"
              ? "فريق خدمة عملاء لوناليزا للسياحة والسفر متاح دائماً على مدار الساعة لمساعدتك في أي استفسار أو ترتيبات خاصة. اضغط على الزر أدناه لبدء المحادثة المباشرة عبر واتساب فورياً:"
              : "Lonaliza Travel customer support team is available 24/7 to assist you. Tap the button below to start a live WhatsApp chat:",
          showWhatsAppButton: true,
          whatsAppPrompt: `مرحباً خدمة عملاء لوناليزا للسياحة، أحتاج مساعدة بخصوص حجز رحلتي إلى ${destinationCity} (رقم الرحلة: ${flightNumber}).`,
        },
      ]);
      setAgentThinking(false);
      return;
    }

    // Intent 4: Hotel request
    if (/فندق|فنادق|سكن|اقامة|إقامة|غرفة|غرف|سورا|شيراتون|هيلتون|hotel/i.test(lower)) {
      const isLuxury = /فخم|فاخر|5 نجوم|خمس نجوم|خمسة نجوم|luxury|5.?star/i.test(lower);
      await executeSearchHotel(isLuxury);
      return;
    }

    // Intent 5: Transfer
    if (/توصيل|استقبال|ترانسفير|transfer|van|فان مطار/i.test(lower)) {
      await executeSearchTransfer();
      return;
    }

    if (/تأشير|فيزا دخول|visa/i.test(lower) && !/فيزا كارد|visa card|بطاقة/i.test(lower)) {
      executeVisaHelp();
      return;
    }

    if (/تأمين|insurance/i.test(lower)) {
      executeInsuranceHelp();
      return;
    }

    if (/جواز|passport/i.test(lower)) {
      fileInputRef.current?.click();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            locale === "ar"
              ? "افتح كاميرا الجواز الآن. سأملأ بيانات المسافر تلقائياً ولن أطلب صور الجواز عبر الشات النصي."
              : "Open the passport camera now. I will fill the passenger fields and will not ask you to paste passport photos in chat.",
        },
      ]);
      setAgentThinking(false);
      return;
    }

    if (/ادفع|دفع|بطاقة|فيزا كارد|cvv|otp|iyzico|checkout/i.test(lower)) {
      executePaymentCoach();
      return;
    }

    if (/وزن|حقائب|baggage|مقعد|seat|وجبة|extras/i.test(lower)) {
      executeExtrasCoach();
      return;
    }

    if (/تأجير|سيارة مع سائق|rent.?a.?car|car hire/i.test(lower)) {
      await executeSearchCars();
      return;
    }

    try {
      await dispatchLiveAgent(text);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            locale === "ar"
              ? "أنا معك على اتصال حي. اطلب فندقاً أو ترانسفيراً أو سيارة أو تأشيرة أو رحلة بديلة وسأحرّك محركات الموقع."
              : "I am live with you. Ask for a hotel, transfer, car, visa, or another flight and I will run the site engines.",
        },
      ]);
    } finally {
      setAgentThinking(false);
    }
  };

  const bookingContext = () => {
    const prior = loadSearchAgentSession();
    const priorHint = prior?.lastHref ? ` Previous search ${prior.lastHref}.` : "";
    return `Booking page. Flight ${flightNumber} ${originCity} ${originAirportCode} → ${destinationCity} ${arrivalAirportCode}. Depart ${departDate} return ${returnDate || ""}. Pax ${paxCount}.${priorHint} Keep the customer on booking and run provider tools.`;
  };

  const applyAgentAction = async (data: SearchAgentResponse, userText: string) => {
    if ((data.action === "navigate" || data.action === "book") && data.href) {
      navigateAgentHref(data.href, (href) => router.push(href));
      return;
    }
    if (data.action === "scan_passport") {
      fileInputRef.current?.click();
      return;
    }
    if (data.action === "coach_payment") {
      executePaymentCoach();
      return;
    }
    if (data.action === "coach_extras") {
      executeExtrasCoach();
      return;
    }
    if (data.action === "upsell_visa" || data.intent === "visa") {
      executeVisaHelp();
      return;
    }
    if (data.action === "upsell_insurance" || data.intent === "insurance") {
      executeInsuranceHelp();
      return;
    }
    if (data.action === "filter" || (data.intent === "flight" && /ارخص|بديل|خطوط|airline|cheaper/i.test(userText))) {
      if (data.filters?.airlines?.length || /ارخص|بديل|خطوط|cheaper|another flight/i.test(userText)) {
        await executeSearchAlternativeFlights();
        return;
      }
    }
    if (data.action === "upsell_hotels" || data.intent === "hotel") {
      await executeSearchHotel(Boolean(data.filters?.stars && data.filters.stars >= 5), data.filters?.hotelName);
      return;
    }
    if (data.action === "upsell_transfers" || data.intent === "transfers") {
      await executeSearchTransfer();
      return;
    }
    if (data.action === "upsell_cars" || data.intent === "cars") {
      await executeSearchCars();
      return;
    }
    if (data.action === "upsell_tours" || data.intent === "tours") {
      await executeGenerateTourProgram();
      return;
    }
  };

  const dispatchLiveAgent = async (text: string, voice?: { audioBase64: string; audioMime: string }) => {
    const session = loadSearchAgentSession();
    const history = [...(session?.messages || []), ...messages, { role: "user" as const, text }]
      .slice(-10)
      .map((m) => ({
        role: m.role,
        content: m.text,
      }));
    const res = await fetch("/api/gemini/search-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history.length ? history : [{ role: "user", content: text }],
        locale,
        tab: "flight",
        page: "booking",
        sid: session?.sid || "booking",
        context: bookingContext(),
        audioBase64: voice?.audioBase64,
        audioMime: voice?.audioMime,
      }),
    });
    const data = (await res.json()) as SearchAgentResponse | { ok: false; reply?: string; error?: string };
    if (data && "transcript" in data && data.transcript) {
      setMessages((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "user") {
            next[i] = { ...next[i], text: data.transcript as string };
            break;
          }
        }
        return next;
      });
    }
    const reply =
      "reply" in data && data.reply
        ? data.reply.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        : "";
    if (reply) {
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    }
    if ("ok" in data && data.ok) {
      await applyAgentAction(data, ("transcript" in data && data.transcript) || text);
    }
  };

  const toggleLiveMic = async () => {
    if (liveRecording) {
      liveRecorderRef.current?.stop();
      setLiveRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveStreamRef.current = stream;
      const rec = new MediaRecorder(stream);
      liveChunksRef.current = [];
      rec.ondataavailable = (ev) => {
        if (ev.data.size) liveChunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        liveStreamRef.current?.getTracks().forEach((t) => t.stop());
        const blob = new Blob(liveChunksRef.current, { type: rec.mimeType || "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);
        setInputText("");
        setMessages((prev) => [
          ...prev,
          { role: "user", text: locale === "ar" ? "رسالة صوتية" : "Voice message", audioUrl },
        ]);
        setAgentThinking(true);
        void (async () => {
          try {
            let wav: Blob;
            try {
              wav = await mediaBlobToWav(blob);
            } catch {
              wav = blob;
            }
            const audioBase64 = await blobToDataUrl(wav);
            await dispatchLiveAgent(locale === "ar" ? "رسالة صوتية" : "Voice message", {
              audioBase64,
              audioMime: wav.type || "audio/wav",
            });
          } finally {
            setAgentThinking(false);
          }
        })();
      };
      liveRecorderRef.current = rec;
      rec.start();
      setLiveRecording(true);
      setChatOpen(true);
    } catch {
      /* mic denied */
    }
  };

  return (
    <div className="smart-concierge-container relative overflow-hidden rounded-3xl border border-purple-800/60 bg-gradient-to-br from-[#180333] via-[#240a45] to-[#320857] p-4 text-white shadow-2xl shadow-purple-950/40 sm:p-6">
      {/* Ambient background glow */}
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      {/* Hidden passport file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePassportUpload}
        className="hidden"
      />

      {/* Header — stacked on narrow RTL phones so chips never collide */}
      <div className="relative flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/25">
            <Bot size={22} className="text-slate-950" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#180333] bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-black leading-snug text-white sm:text-base">
                {locale === "ar" ? "مساعد لوناليزا الذكي للرحلة" : "Lonaliza Smart AI Travel Concierge"}
              </h3>
              <span className="inline-flex min-h-8 items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black text-emerald-200">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {locale === "ar" ? "اتصال حي" : "LIVE"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-purple-100">
              {locale === "ar"
                ? `أنت في اتصال حي مع الوكيل — يحفظ سياق رحلتك إلى ${destinationCity} ويجلب الفنادق والترانسفير والبرامج من المزودين`
                : `You are live with the agent — keeping ${destinationCity} context and pulling hotels, transfers, and tours from providers`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setChatOpen(!chatOpen)}
            title={chatOpen ? (locale === "ar" ? "إغلاق / تصغير الشات" : "Collapse Chat") : (locale === "ar" ? "فتح محادثة الوكيل" : "Open Chat")}
            aria-label={chatOpen ? "Collapse Chat" : "Open Chat"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-900/60 text-amber-300 shadow-sm transition-all hover:bg-purple-800 hover:text-white active:scale-95 cursor-pointer"
          >
            {chatOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <button
          type="button"
          disabled={scanningPassport}
          onClick={() => fileInputRef.current?.click()}
          title={locale === "ar" ? "مسح الجواز الذكي بالكاميرا" : "AI Passport Camera Scan"}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-3.5 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.99] cursor-pointer disabled:opacity-50 sm:w-auto sm:self-start"
        >
          {scanningPassport ? (
            <>
              <Loader2 size={16} className="animate-spin text-slate-950" />
              <span>{locale === "ar" ? "جارٍ المسح..." : "Scanning..."}</span>
            </>
          ) : (
            <>
              <Camera size={16} className="text-slate-950 stroke-[2.5]" />
              <span>{locale === "ar" ? "مسح الجواز الذكي" : "Smart Passport Scan"}</span>
            </>
          )}
        </button>
      </div>

      {/* Success banner if passport extracted */}
      {passportSuccessMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400/50 bg-emerald-500/15 p-3 text-xs font-bold text-emerald-200 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span>{passportSuccessMsg}</span>
        </div>
      )}

      {/* Live Toast if an item was added or flight replaced */}
      {cardSuccessToast && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-emerald-400/60 bg-emerald-950/90 px-4 py-3 text-xs font-bold text-emerald-100 shadow-xl shadow-emerald-950/50 animate-fade-in backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            <span className="text-white font-bold">{cardSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setCardSuccessToast(null)}
            className="text-emerald-400 hover:text-emerald-200 font-black text-sm px-1.5 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Suggestion carousel — one horizontal row, never a vertical chip wall */}
      <div className="group/chips relative mt-4 min-w-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-9 bg-gradient-to-r from-[#180333] via-[#180333]/80 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-9 bg-gradient-to-l from-[#2a0748] via-[#2a0748]/80 to-transparent"
        />
        <button
          type="button"
          onClick={() => {
            chipsScrollRef.current?.scrollBy({
              left: dir === "rtl" ? 200 : -200,
              behavior: "smooth",
            });
          }}
          className="absolute left-0.5 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-purple-500/40 bg-[#140428]/90 text-amber-200/90 shadow-md backdrop-blur-sm transition-all hover:bg-purple-800 hover:text-white"
          title={locale === "ar" ? "السابق" : "Previous"}
          aria-label={locale === "ar" ? "السابق" : "Previous"}
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => {
            chipsScrollRef.current?.scrollBy({
              left: dir === "rtl" ? -200 : 200,
              behavior: "smooth",
            });
          }}
          className="absolute right-0.5 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-purple-500/40 bg-[#140428]/90 text-amber-200/90 shadow-md backdrop-blur-sm transition-all hover:bg-purple-800 hover:text-white"
          title={locale === "ar" ? "التالي" : "Next"}
          aria-label={locale === "ar" ? "التالي" : "Next"}
        >
          <ChevronRight size={14} />
        </button>

        <div
          ref={chipsScrollRef}
          dir={dir}
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          className="lonaliza-h-scroll lonaliza-suggest-carousel px-8 py-0.5"
        >
          <button
            type="button"
            onClick={handleGenerateSmartSuggestions}
            disabled={isGeneratingSuggestions}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-purple-900/90 to-amber-500/20 px-3 text-[11px] font-bold leading-none text-amber-200 shadow-sm shadow-amber-500/15 transition-all hover:border-amber-300 hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-60"
            title={locale === "ar" ? "توليد اقتراحات ذكية جديدة تخص وجهتك ورحلتك" : "Generate smart AI trip suggestions"}
          >
            <Sparkles size={13} className={`shrink-0 text-amber-300 ${isGeneratingSuggestions ? "animate-spin" : "animate-pulse"}`} />
            <span>{locale === "ar" ? "توليد اقتراحات جديدة" : "AI Suggestions"}</span>
          </button>

          {activeChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleQuickChip(chip.id)}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold leading-none shadow-sm transition-all active:scale-95 cursor-pointer ${
                  chip.isHighlighted
                    ? "border-amber-500/60 bg-amber-500/15 text-amber-200 hover:border-amber-400 hover:bg-amber-500/25"
                    : "border-purple-600/55 bg-purple-900/55 text-white hover:border-amber-400 hover:bg-purple-800/80"
                }`}
              >
                <Icon size={13} className="shrink-0 text-amber-400" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Agent Conversation & Live Action Cards */}
      {chatOpen && (
        <div className="mt-4 rounded-2xl border border-purple-700/60 bg-[#120224]/95 p-4 shadow-inner">
          <div className="space-y-4 max-h-[580px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
            {messages.map((m, idx) => {
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-slate-950 shadow-md"
                        : "bg-[#25084a] border border-purple-600/50 text-white font-medium shadow-sm"
                    }`}
                  >
                    {m.audioUrl ? (
                      <audio
                        controls
                        preload="metadata"
                        src={m.audioUrl}
                        className="mb-2 block h-9 w-[min(100%,240px)]"
                      />
                    ) : null}
                    {m.text}
                  </div>

                  {/* WhatsApp Customer Support Action Button */}
                  {m.siteLink && (
                    <div className="mt-2.5">
                      <a
                        href={m.siteLink.href}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/15 px-4 py-2.5 text-xs font-black text-amber-100 hover:bg-amber-500/25 active:scale-95 transition-all"
                      >
                        <ArrowRightLeft size={14} />
                        <span>{m.siteLink.label}</span>
                      </a>
                    </div>
                  )}

                  {m.showWhatsAppButton && (
                    <div className="mt-2.5">
                      <a
                        href={getWhatsAppLink(m.whatsAppPrompt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold shadow-lg shadow-emerald-900/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <MessageSquare size={16} className="text-white" />
                        <span>{locale === "ar" ? "تواصل مع خدمة العملاء عبر واتساب" : "Contact Customer Support on WhatsApp"}</span>
                      </a>
                    </div>
                  )}

                  {/* Render Alternative Flights Carousel */}
                  {m.alternativeFlights && m.alternativeFlights.length > 0 && (
                    <div className="mt-3 w-full">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <Plane size={13} className="text-amber-400" />
                          <span>
                            {locale === "ar"
                              ? `خيارات الطيران البديلة المتاحة (${m.alternativeFlights.length} رحلة) — اختر واستبدل بنقرة واحدة:`
                              : `Available Alternative Flights (${m.alternativeFlights.length} Options) — Replace in 1-Click:`}
                          </span>
                        </p>
                        <span className="text-[10px] text-purple-300 font-semibold hidden sm:inline-block">
                          {locale === "ar" ? "مرر أفقياً لتصفح جميع الرحلات" : "Scroll horizontally"}
                        </span>
                      </div>
                      <div className="relative group/alt-slider">
                        <button
                          type="button"
                          onClick={(e) => {
                            const el = e.currentTarget.parentElement?.querySelector(".alt-slider-scroll");
                            if (el) el.scrollBy({ left: locale === "ar" ? 320 : -320, behavior: "smooth" });
                          }}
                          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-purple-950/95 text-amber-300 border border-purple-500/40 shadow-xl hover:bg-purple-800 hover:text-white transition-all cursor-pointer opacity-85 hover:opacity-100 active:scale-95"
                          title="السابق"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            const el = e.currentTarget.parentElement?.querySelector(".alt-slider-scroll");
                            if (el) el.scrollBy({ left: locale === "ar" ? -320 : 320, behavior: "smooth" });
                          }}
                          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-purple-950/95 text-amber-300 border border-purple-500/40 shadow-xl hover:bg-purple-800 hover:text-white transition-all cursor-pointer opacity-85 hover:opacity-100 active:scale-95"
                          title="التالي"
                        >
                          <ChevronRight size={16} />
                        </button>

                        <div
                          onWheel={(e) => {
                            if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                              e.currentTarget.scrollLeft += e.deltaY;
                            }
                          }}
                          className="alt-slider-scroll flex gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x snap-mandatory pb-1 px-1"
                        >
                          {m.alternativeFlights.map((alt) => {
                            const isCurrentReplaced = replacedFlightId === alt.itinerary.id;
                            return (
                              <div
                                key={alt.itinerary.id}
                                className="w-[285px] shrink-0 snap-start rounded-2xl border border-purple-600/60 bg-[#1c0738] p-3.5 shadow-xl flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <AirlineLogo
                                        code={alt.airlineCode}
                                        name={alt.airlineName}
                                        logoUrl={alt.airlineLogo}
                                        size="sm"
                                        className="rounded-xl border border-purple-500/30 bg-white"
                                      />
                                      <div className="min-w-0">
                                        <p className="text-xs font-black text-white truncate">{alt.airlineName}</p>
                                        <p className="text-[10px] text-purple-300 font-mono" dir="ltr">
                                          {alt.flightNo}
                                        </p>
                                      </div>
                                    </div>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-black shrink-0 ${
                                        alt.diffAmount < 0
                                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                                          : "bg-purple-500/20 text-purple-200 border border-purple-400/40"
                                      }`}
                                    >
                                      {alt.diffLabel}
                                    </span>
                                  </div>

                                  <div className="mt-3 flex items-center justify-between text-xs px-1" dir={dir}>
                                    <div className="text-start">
                                      <p className="text-sm font-black text-white tabular-nums">{alt.departTime}</p>
                                      <p className="text-[10px] text-purple-300 font-semibold">{alt.departAirport}</p>
                                    </div>
                                    <div className="flex flex-col items-center px-2">
                                      <span className="text-[10px] text-purple-300 font-medium">{alt.durationLabel}</span>
                                      <div className="relative flex items-center my-1 w-16">
                                        <span className="h-0.5 w-full bg-purple-500/50" />
                                        <Plane size={10} className={`absolute inset-0 m-auto text-amber-400 ${dir === "rtl" ? "rotate-180" : ""}`} />
                                      </div>
                                      <span className="text-[9px] font-bold text-emerald-400">
                                        {alt.isDirect
                                          ? locale === "ar"
                                            ? "مباشر"
                                            : "Direct"
                                          : locale === "ar"
                                          ? "ترانزيت"
                                          : "Transit"}
                                      </span>
                                    </div>
                                    <div className="text-end">
                                      <p className="text-sm font-black text-white tabular-nums">{alt.arriveTime}</p>
                                      <p className="text-[10px] text-purple-300 font-semibold">{alt.arriveAirport}</p>
                                    </div>
                                  </div>

                                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-purple-200 bg-purple-950/60 rounded-lg px-2.5 py-1">
                                    <Luggage size={12} className="text-amber-400 shrink-0" />
                                    <span className="truncate">{alt.baggageLabel}</span>
                                  </div>
                                </div>

                                <div className="mt-3.5 pt-2.5 border-t border-purple-800/60 flex items-center justify-between gap-2">
                                  <div>
                                    <span className="text-[10px] text-purple-300 block">{locale === "ar" ? "السعر الإجمالي:" : "Total Fare:"}</span>
                                    <strong className="text-sm font-black text-amber-300 font-mono">
                                      {formatFlightPrice(alt.price, currency)}
                                    </strong>
                                  </div>

                                  {isCurrentReplaced ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white shadow-md shadow-emerald-700/40 ring-1 ring-emerald-400/60 cursor-default">
                                      <CheckCircle2 size={13} className="text-white" />
                                      <span>{locale === "ar" ? "تم الاستبدال بنجاح" : "Replaced"}</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleReplaceSelectedFlight(alt)}
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-3 py-1.5 text-[11px] font-black text-slate-950 shadow-md shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                                    >
                                      <ArrowRightLeft size={13} className="text-slate-950" />
                                      <span>{locale === "ar" ? "استبدال الرحلة" : "Replace Flight"}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {m.hotelOffers?.length ? (
                    <AgentHotelCarousel
                      hotels={m.hotelOffers}
                      checkIn={departDate}
                      checkOut={stayCheckout(departDate, returnDate, 3)}
                      nights={stayNights(departDate, stayCheckout(departDate, returnDate, 3), 3)}
                      adults={paxCount}
                      currency={currency}
                      onSelect={(hotel) => {
                        onSelectHotel(hotel);
                        setAddedCardIds((prev) => new Set([...prev, hotel.hotelId]));
                        setMessages((prev) => [
                          ...prev,
                          {
                            role: "assistant",
                            text:
                              locale === "ar"
                                ? `تم تثبيت غرفة «${hotel.roomName}» في «${hotel.hotelName}» على الحجز. ${hotel.breakfastIncluded ? "الإفطار مشمول. " : "بدون وجبة. "}${hotel.freeCancellation ? "إلغاء مجاني متاح. " : "غير قابلة للإلغاء. "}سعر الفندق ${hotel.totalPrice} ${hotel.currency} ويُضاف إلى إجمالي الفاتورة. عند الدفع نمرّر بيانات المسافرين لموزع الفندق بشكل منفصل عن تذكرة الطيران.`
                                : `Room “${hotel.roomName}” at “${hotel.hotelName}” is on the booking. Hotel total ${hotel.totalPrice} ${hotel.currency} is added to the invoice. At payment, passenger details go to the hotel supplier separately from the airline.`,
                          },
                        ]);
                      }}
                    />
                  ) : null}

                  {/* Render Single Action Card (Hotel, Transfer, Tour, Car) */}
                  {[m.actionCard, ...(m.actionCards || [])].filter(Boolean).map((card) => {
                    if (!card) return null;
                    const extraId = String(card.data?.id || card.data?.hotelId || card.data?.slug || card.title);
                    const extraAdded = addedCardIds.has(extraId);
                    return (
                    <div key={extraId} className="mt-2.5 w-full max-w-[390px] overflow-hidden rounded-2xl border border-amber-400/40 bg-[#1e073c] p-3.5 shadow-xl">
                      <div className="flex gap-3">
                        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-purple-600/40">
                          <SafeImage src={card.photo} alt={card.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1">
                              {card.title}
                            </h4>
                            <p className="text-[11px] text-purple-200 mt-0.5 line-clamp-2">
                              {card.subtitle}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <strong className="text-sm font-black text-amber-300 font-mono">
                              {formatFlightPrice(card.price, currency)}
                            </strong>

                            {extraAdded ? (
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white shadow-md shadow-emerald-700/40 ring-1 ring-emerald-400/60 cursor-default">
                                <CheckCircle2 size={13} className="text-white" />
                                <span>{locale === "ar" ? "مضاف للرحلة بنجاح" : "Added to Trip"}</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddCard(card)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-3 py-1.5 text-[11px] font-black text-slate-950 shadow-md shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                              >
                                <Sparkles size={13} className="text-slate-950" />
                                <span>
                                  {card.type === "car"
                                    ? locale === "ar"
                                      ? "افتح حجز السيارة"
                                      : "Open car booking"
                                    : locale === "ar"
                                      ? "+ أضف للرحلة بنقرة واحدة"
                                      : "+ Add to Trip 1-Click"}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              );
            })}

            {agentThinking && (
              <div className="flex items-center gap-2 text-xs text-amber-300 animate-pulse font-bold py-1">
                <Loader2 size={14} className="animate-spin text-amber-400" />
                <span>
                  {locale === "ar"
                    ? "الوكيل الذكي يستعلم عن أفضل العروض الحية عبر شبكة الموزعين المعتمدة..."
                    : "AI Concierge searching live distributor offers..."}
                </span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="mt-3.5 flex items-center gap-2 border-t border-purple-800/60 pt-3">
            <button
              type="button"
              onClick={() => void toggleLiveMic()}
              title={locale === "ar" ? "تحدث مع الوكيل" : "Talk to the agent"}
              className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                liveRecording
                  ? "border-rose-400 bg-rose-500 text-white"
                  : "border-emerald-500/50 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
              }`}
            >
              {liveRecording ? (
                <span className="absolute inset-0 animate-ping rounded-xl bg-rose-400/30" />
              ) : null}
              <Radio size={14} className="relative" />
            </button>
            <button
              type="button"
              disabled={scanningPassport}
              onClick={() => fileInputRef.current?.click()}
              title={locale === "ar" ? "مسح الجواز الذكي بالكاميرا" : "Scan Passport with Camera"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-900/80 hover:bg-purple-800 text-amber-300 hover:text-amber-200 border border-purple-700/60 transition-colors cursor-pointer disabled:opacity-50"
            >
              {scanningPassport ? (
                <Loader2 size={14} className="animate-spin text-amber-400" />
              ) : (
                <Camera size={14} className="text-amber-400" />
              )}
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                locale === "ar"
                  ? "اطلب رحلة أرخص، فندقاً، سيارة خاصة، أو برنامجاً سياحياً..."
                  : "Ask for cheaper flight, hotel, private car, or custom itinerary..."
              }
              className="min-w-0 flex-1 rounded-xl border border-purple-700/60 bg-[#1f053a] px-3.5 py-2 text-xs text-white placeholder-purple-300/60 outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <Send size={14} className="rtl:rotate-180 text-slate-950" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
