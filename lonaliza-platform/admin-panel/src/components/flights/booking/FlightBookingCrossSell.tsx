"use client";

import { useState, useMemo, useRef } from "react";
import SafeImage from "@/components/ui/SafeImage";
import {
  Hotel,
  Car,
  Compass,
  Star,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Coffee,
  Users,
  Briefcase,
  Plane,
  ArrowRightLeft,
  Check,
  Info,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import FlightBookingHotelRoomsModal, {
  type HotelCrossSellItem,
  type SelectedHotelBooking,
  type HotelRoomOption,
} from "./FlightBookingHotelRoomsModal";

export interface SelectedTransferBooking {
  id: string;
  vehicleType: "vip_van" | "sedan" | "suv" | "sprinter";
  titleAr: string;
  titleEn: string;
  vehicleName: string;
  seats: number;
  luggage: number;
  photoUrl: string;
  routeType: "airport_to_hotel" | "hotel_to_airport" | "roundtrip";
  pickupLocation: string;
  dropoffLocation: string;
  flightNumber: string;
  date: string;
  time: string;
  price: number;
  currency: string;
  guestName: string;
  guestPhone: string;
  supplier: "seeru_ride" | "internal";
}

export interface SelectedTourBooking {
  id: string;
  titleAr: string;
  titleEn: string;
  photoUrl: string;
  duration: string;
  rating: number;
  reviewsCount: number;
  highlightsAr: string[];
  highlightsEn: string[];
  pricePerPerson: number;
  paxCount: number;
  totalPrice: number;
  currency: string;
  date: string;
}

export interface PrimaryTravelerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNumber: string;
}

// Curated 5-star cross-sell hotels with full room catalogs for realistic modal selection
const CROSS_SELL_HOTELS: Record<string, HotelCrossSellItem[]> = {
  default: [
    {
      id: "fs-bosphorus",
      nameAr: "فندق فور سيزونز إسطنبول على البوسفور",
      nameEn: "Four Seasons Hotel Istanbul at the Bosphorus",
      cityAr: "إسطنبول",
      cityEn: "Istanbul",
      addressAr: "بشكتاش، الواجهة البحرية للبوسفور",
      addressEn: "Beşiktaş, Bosphorus Waterfront",
      stars: 5,
      rating: 9.7,
      reviewsCount: 1420,
      photoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
      ],
      amenitiesAr: ["مسبح مدفأ على البوسفور", "إفطار عالمي مشمول", "سبا ملكي وحمام تركي", "موقع تاريخي استثنائي"],
      amenitiesEn: ["Heated Bosphorus Pool", "Buffet Breakfast", "Luxury Spa & Turkish Bath", "Historic Waterfront"],
      supplier: "ratehawk",
      rooms: [
        {
          id: "fs-deluxe-court",
          nameAr: "غرفة ديلوكس بإطلالة على الفناء العثماني",
          nameEn: "Deluxe Courtyard View Room",
          bedTypeAr: "سرير كينغ كبير جداً أو سريرين منفصلين",
          bedTypeEn: "1 King Bed or 2 Twin Beds",
          maxGuests: 2,
          photos: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80"],
          inclusionsAr: ["إفطار بوفيه فاخر لشخصين", "إلغاء مجاني حتى 48 ساعة", "واي فاي فائق السرعة", "دخول السبا مجاناً"],
          inclusionsEn: ["Complimentary Breakfast for 2", "Free cancellation up to 48h", "High-speed WiFi", "Free Spa access"],
          pricePerNightUsd: 380,
          refundable: true,
          breakfastIncluded: true,
        },
        {
          id: "fs-bosphorus-suite",
          nameAr: "جناح البوسفور البانورامي الفاخر",
          nameEn: "Bosphorus Executive Suite",
          bedTypeAr: "سرير ماستر كينغ + صالة جلوس مستقلة",
          bedTypeEn: "Master King Bed + Separate Living Room",
          maxGuests: 3,
          photos: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80"],
          inclusionsAr: ["إطلالة مباشرة مفتوحة على البوسفور", "خدمة الخادم الشخصي (Butler)", "إفطار رئاسي في الجناح", "ترانسفير مجاني باتجاه واحد"],
          inclusionsEn: ["Direct Bosphorus View", "Personal Butler Service", "Presidential In-suite Breakfast", "Free One-way Airport Transfer"],
          pricePerNightUsd: 590,
          refundable: true,
          breakfastIncluded: true,
        },
      ],
    },
    {
      id: "ciragan-palace",
      nameAr: "قصر تشيران كمبينسكي التاريخي",
      nameEn: "Çırağan Palace Kempinski Istanbul",
      cityAr: "إسطنبول",
      cityEn: "Istanbul",
      addressAr: "أورتاكوي، قصر السلاطين، إسطنبول",
      addressEn: "Ortaköy, Imperial Palace, Istanbul",
      stars: 5,
      rating: 9.6,
      reviewsCount: 1250,
      photoUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
      ],
      amenitiesAr: ["مسبح إنفينيتي خارجي", "قصر عثماني حقيقي", "مطعم توغرا السلطاني", "مرسى يخوت خاص"],
      amenitiesEn: ["Infinity Pool", "Imperial Ottoman Palace", "Tuğra Fine Dining", "Private Pier"],
      supplier: "hotelbeds",
      rooms: [
        {
          id: "ciragan-grand-deluxe",
          nameAr: "غرفة جراند ديلوكس مع إطلالة حديقة القصر",
          nameEn: "Grand Deluxe Palace Garden View",
          bedTypeAr: "سرير كينغ وثير",
          bedTypeEn: "1 King Bed",
          maxGuests: 2,
          photos: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80"],
          inclusionsAr: ["إفطار قصر السلاطين مشمول", "إلغاء مجاني حتى قبل الوصول بيوم", "ماكينة قهوة نيسبريسو"],
          inclusionsEn: ["Imperial Palace Breakfast", "Free cancellation 24h prior", "Nespresso Machine"],
          pricePerNightUsd: 340,
          refundable: true,
          breakfastIncluded: true,
        },
        {
          id: "ciragan-palace-suite",
          nameAr: "جناح السلطان بإطلالة البوسفور",
          nameEn: "Ottoman Palace Bosphorus Suite",
          bedTypeAr: "سرير كينغ إمبراطوري + شرفة خاصة على البحر",
          bedTypeEn: "Imperial King Bed + Private Sea Balcony",
          maxGuests: 3,
          photos: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80"],
          inclusionsAr: ["شرفة مباشرة فوق مضيق البوسفور", "خدمة شاي بعد الظهر مجاناً", "إفطار وسحور فاخر"],
          inclusionsEn: ["Direct Balcony over Bosphorus", "Complimentary Afternoon Tea", "Gourmet Breakfast"],
          pricePerNightUsd: 550,
          refundable: true,
          breakfastIncluded: true,
        },
      ],
    },
    {
      id: "raffles-istanbul",
      nameAr: "فندق رافلز إسطنبول - مركز زورلو",
      nameEn: "Raffles Istanbul - Zorlu Center",
      cityAr: "إسطنبول",
      cityEn: "Istanbul",
      addressAr: "مركز زورلو للتسوق الفاخر، ليفنت",
      addressEn: "Zorlu Center, Luxury Hub, Levent",
      stars: 5,
      rating: 9.5,
      reviewsCount: 980,
      photoUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
      ],
      amenitiesAr: ["مدخل مباشر لأفخم بوتيكات زورلو", "خدمة الخادم الشخصي 24/7", "رافلز سبا الحائز على جوائز", "مهبط طائرات هليكوبتر"],
      amenitiesEn: ["Direct Zorlu Mall Access", "24/7 Butler Service", "Award-winning Spa", "Helipad"],
      supplier: "ratehawk",
      rooms: [
        {
          id: "raffles-signature-room",
          nameAr: "غرفة رافلز سجنتشر الفاخرة مع شرفة",
          nameEn: "Raffles Signature Room with Balcony",
          bedTypeAr: "سرير كينغ أو سريرين توأم",
          bedTypeEn: "King or Twin Beds",
          maxGuests: 2,
          photos: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80"],
          inclusionsAr: ["إفطار رافلز الشهير", "مشروبات ترحيبية فاخرة", "شرفة واسعة خاصة"],
          inclusionsEn: ["Raffles Iconic Breakfast", "Welcome Luxury Drinks", "Private Furnished Balcony"],
          pricePerNightUsd: 290,
          refundable: true,
          breakfastIncluded: true,
        },
      ],
    },
    {
      id: "swissotel-bosphorus",
      nameAr: "سويس أوتيل ذا بوسفور إسطنبول",
      nameEn: "Swissôtel The Bosphorus Istanbul",
      cityAr: "إسطنبول",
      cityEn: "Istanbul",
      addressAr: "ماتشكا، حدائق البوسفور التاريخية",
      addressEn: "Maçka, Historic Bosphorus Gardens",
      stars: 5,
      rating: 9.3,
      reviewsCount: 1650,
      photoUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop&q=80",
      photos: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop&q=80"],
      amenitiesAr: ["حدائق شاسعة 65 فدان", "مسبح خارجي على السطح", "سبا بيوروفيل السويسري", "عروض أطعمة عالمية"],
      amenitiesEn: ["65-acre Historic Park", "Rooftop Pool", "Pürovel Swiss Spa", "Multi-cuisine Dining"],
      supplier: "ratehawk",
      rooms: [
        {
          id: "swiss-swiss-advantage",
          nameAr: "غرفة سويس أدفانتج مع إطلالة الحديقة",
          nameEn: "Swiss Advantage Garden View",
          bedTypeAr: "سرير كينغ مريح",
          bedTypeEn: "1 King Bed",
          maxGuests: 2,
          photos: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80"],
          inclusionsAr: ["إفطار سويسري غني", "إلغاء مجاني", "دخول المسبح والنادي الصحي"],
          inclusionsEn: ["Swiss Breakfast Buffet", "Free cancellation", "Spa & Pool Access"],
          pricePerNightUsd: 220,
          refundable: true,
          breakfastIncluded: true,
        },
      ],
    },
  ],
};

// Available VIP transfer options
const TRANSFER_VEHICLES = [
  {
    type: "vip_van" as const,
    nameAr: "مرسيدس فيتو VIP مايباخ (Mercedes Vito VIP)",
    nameEn: "Mercedes Vito VIP Maybach Edition",
    seats: 7,
    luggage: 6,
    photoUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80",
    featuresAr: ["مقاعد جلدية مريحة مع مساج", "شاشة ذكية وواي فاي مجاني", "ثلاجة ومشروبات ضيافة", "سائق خاص يرتدي زياً رسمياً"],
    featuresEn: ["Leather Massage Seats", "Smart TV & High-speed WiFi", "Fridge with Cold Drinks", "Chauffeur in Uniform"],
    oneWayUsd: 55,
    roundtripUsd: 95,
  },
  {
    type: "sedan" as const,
    nameAr: "مرسيدس E-Class أو BMW 5 لرجال الأعمال",
    nameEn: "Mercedes E-Class / BMW 5 Executive Sedan",
    seats: 3,
    luggage: 2,
    photoUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80",
    featuresAr: ["مثالية للمسافرين الأفراد ورجال الأعمال", "هدوء وفخامة مطلقة", "استقبال VIP بالاسم في المطار"],
    featuresEn: ["Perfect for solo & business travelers", "Ultimate Luxury & Quietness", "Name-board VIP Airport Pickup"],
    oneWayUsd: 48,
    roundtripUsd: 85,
  },
  {
    type: "sprinter" as const,
    nameAr: "مرسيدس سبرينتر VIP عائلي فخم (Mercedes Sprinter VIP)",
    nameEn: "Mercedes Sprinter VIP Large Group Van",
    seats: 14,
    luggage: 12,
    photoUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80",
    featuresAr: ["مثالية للعائلات الكبيرة والمجموعات", "مساحة واسعة جداً للحقائب", "سقف بانورامي وإضاءة محيطية"],
    featuresEn: ["Ideal for large families & groups", "Massive luggage compartment", "Panoramic ceiling & ambient lighting"],
    oneWayUsd: 95,
    roundtripUsd: 170,
  },
  {
    type: "suv" as const,
    nameAr: "كاديلاك إسكاليد أو رينج روفر VIP فارهة",
    nameEn: "Cadillac Escalade / Range Rover Luxury SUV",
    seats: 4,
    luggage: 4,
    photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
    featuresAr: ["سيارة دفع رباعي فارهة للراحة القصوى", "خدمة بروتوكول واستقبال خاص", "مشروبات فاخرة"],
    featuresEn: ["Top-tier luxury SUV comfort", "Protocol meet & greet service", "Complimentary luxury beverages"],
    oneWayUsd: 85,
    roundtripUsd: 155,
  },
];

// Available top tours options
const DESTINATION_TOURS = [
  {
    id: "tour-bosphorus-yacht",
    titleAr: "رحلة يخت خاص في مضيق البوسفور (ساعتان مع الضيافة)",
    titleEn: "Private Luxury Bosphorus Yacht Cruise (2 Hours)",
    photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80",
    duration: "2 ساعة",
    rating: 4.9,
    reviewsCount: 310,
    highlightsAr: ["يخت فاخر مخصص لك ولعائلتك", "مشاهدة قصور السلاطين وجسور البوسفور", "شاي وعصائر ومقبلات تركية طازجة"],
    highlightsEn: ["Private Yacht exclusively for your party", "Views of Imperial Palaces & Bridges", "Fresh tea, juices and Turkish delights"],
    pricePerPerson: 65,
  },
  {
    id: "tour-sapanca-masukiye",
    titleAr: "رحلة بحيرة سبانجا والمعشوقية وقرية المحمودية VIP",
    titleEn: "Sapanca Lake, Maşukiye & Glass Terrace VIP Tour",
    photoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    duration: "يوم كامل (9 ساعات)",
    rating: 4.8,
    reviewsCount: 420,
    highlightsAr: ["سيارة خاصة VIP مع سائق مرشد", "الغداء في مطعم الشلالات بالمعشوقية", "أنشطة التلفريك ودبابات السفاري"],
    highlightsEn: ["Private VIP vehicle with chauffeur guide", "Waterfall restaurant lunch included", "Cable car & Safari ATV options"],
    pricePerPerson: 45,
  },
  {
    id: "tour-bosphorus-dinner",
    titleAr: "سهرة عشاء البوسفور الملكية مع العروض الفلكلورية",
    titleEn: "Imperial Bosphorus Dinner Cruise with Live Shows",
    photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    duration: "3.5 ساعات",
    rating: 4.7,
    reviewsCount: 560,
    highlightsAr: ["بوفيه عشاء مفتوح من 5 نجوم", "عروض الدراويش ورقصات التراث العثماني", "إطلالة ساحرة على أضواء إسطنبول"],
    highlightsEn: ["5-star open buffet dinner", "Whirling Dervishes & Ottoman folklore", "Breathtaking night view of Istanbul"],
    pricePerPerson: 40,
  },
];

type Props = {
  destinationCity: string;
  departDate: string;
  returnDate?: string;
  paxCount: number;
  currency: string;
  primaryPassenger?: PrimaryTravelerInfo;
  flightNumber?: string;
  arrivalAirportCode?: string;
  selectedHotel: SelectedHotelBooking | null;
  onSelectHotel: (hotel: SelectedHotelBooking | null) => void;
  selectedTransfer: SelectedTransferBooking | null;
  onSelectTransfer: (transfer: SelectedTransferBooking | null) => void;
  selectedTours: SelectedTourBooking[];
  onToggleTour: (tour: SelectedTourBooking) => void;
  onRemoveTour: (tourId: string) => void;
};

export default function FlightBookingCrossSell({
  destinationCity,
  departDate,
  returnDate,
  paxCount,
  currency,
  primaryPassenger,
  flightNumber = "TK 1982",
  arrivalAirportCode = "IST",
  selectedHotel,
  onSelectHotel,
  selectedTransfer,
  onSelectTransfer,
  selectedTours,
  onToggleTour,
  onRemoveTour,
}: Props) {
  const { locale } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const hotelSliderRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [modalHotel, setModalHotel] = useState<HotelCrossSellItem | null>(null);

  // Auto-sync status
  const [syncedSuccessfully, setSyncedSuccessfully] = useState(false);

  // Transfer form state inside cross-sell
  const [transferVehicleType, setTransferVehicleType] = useState<"vip_van" | "sedan" | "suv" | "sprinter">("vip_van");
  const [transferRouteType, setTransferRouteType] = useState<"airport_to_hotel" | "hotel_to_airport" | "roundtrip">("airport_to_hotel");
  const [transferTime, setTransferTime] = useState("14:30");
  const [transferFlightNum, setTransferFlightNum] = useState(flightNumber);
  const [transferHotelName, setTransferHotelName] = useState(selectedHotel?.hotelName || "الفندق / الوجهة");

  // Calculate nights count between depart and return, or default to 3
  const nightsCount = useMemo(() => {
    if (!departDate || !returnDate) return 3;
    const d1 = new Date(departDate).getTime();
    const d2 = new Date(returnDate).getTime();
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 3;
  }, [departDate, returnDate]);

  const hotelsList = CROSS_SELL_HOTELS.default;

  const scrollSlider = (direction: "left" | "right") => {
    if (!hotelSliderRef.current) return;
    const amount = direction === "left" ? -340 : 340;
    hotelSliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // One-click Auto Sync
  const handleAutoSync = () => {
    if (!primaryPassenger?.firstName) return;
    setSyncedSuccessfully(true);
    if (selectedHotel) {
      // already synced through state
    }
    if (selectedTransfer) {
      onSelectTransfer({
        ...selectedTransfer,
        guestName: `${primaryPassenger.firstName} ${primaryPassenger.lastName}`.trim(),
        guestPhone: primaryPassenger.phone,
      });
    }
    setTimeout(() => setSyncedSuccessfully(false), 5000);
  };

  // Add or update transfer
  const handleAddTransfer = () => {
    const veh = TRANSFER_VEHICLES.find((v) => v.type === transferVehicleType) || TRANSFER_VEHICLES[0];
    const priceUsd = transferRouteType === "roundtrip" ? veh.roundtripUsd : veh.oneWayUsd;
    const transferPayload: SelectedTransferBooking = {
      id: `tr-${Date.now()}`,
      vehicleType: veh.type,
      titleAr: veh.nameAr,
      titleEn: veh.nameEn,
      vehicleName: veh.nameAr,
      seats: veh.seats,
      luggage: veh.luggage,
      photoUrl: veh.photoUrl,
      routeType: transferRouteType,
      pickupLocation: transferRouteType === "hotel_to_airport" ? transferHotelName : `مطار ${arrivalAirportCode}`,
      dropoffLocation: transferRouteType === "hotel_to_airport" ? `مطار ${arrivalAirportCode}` : transferHotelName,
      flightNumber: transferFlightNum,
      date: departDate || new Date().toISOString().slice(0, 10),
      time: transferTime,
      price: priceUsd,
      currency: "USD",
      guestName: primaryPassenger ? `${primaryPassenger.firstName} ${primaryPassenger.lastName}`.trim() : "Guest",
      guestPhone: primaryPassenger?.phone || "",
      supplier: "seeru_ride",
    };
    onSelectTransfer(transferPayload);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with One-Click Sync */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-900/30 bg-gradient-to-r from-[#1b053a] via-[#2e1065] to-[#3b0764] p-6 text-white shadow-xl shadow-purple-950/20">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-black tracking-wider text-amber-300">
              <Sparkles size={14} className="animate-pulse" />
              <span>{locale === "ar" ? "خدمات المسافرين الحصرية" : "Exclusive Traveler Add-ons"}</span>
            </div>
            <h2 className="mt-2 text-xl font-black md:text-2xl text-white">
              {locale === "ar"
                ? `اكتملت رحلتك! أضف فندقاً، ترانسفير VIP، أو جولة في ${destinationCity || "وجهتك"}`
                : `Complete Your Trip! Add a hotel, VIP transfer, or tour in ${destinationCity || "your destination"}`}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-purple-200/80 leading-relaxed max-w-xl">
              {locale === "ar"
                ? "وفر حتى 25% بحجز الخدمات مع تذكرة الطيران بنقرة واحدة، وسيتم إرسال كافة القسائم والمستندات في حجز موحد."
                : "Save up to 25% by bundling hotel, private transfer, and tours with your flight in one single seamless booking."}
            </p>
          </div>

          {/* One-Click Traveler Auto-Sync Button */}
          {primaryPassenger?.firstName ? (
            <div className="w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={handleAutoSync}
                className="group relative flex w-full md:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 size={18} className="text-slate-950" />
                <span>
                  {locale === "ar"
                    ? "تطبيق بيانات المسافر تلقائياً على الفندق والترانسفير ✨"
                    : "Auto-sync Passenger Info to Hotel & Transfer ✨"}
                </span>
              </button>
              {syncedSuccessfully && (
                <p className="mt-2 text-center text-xs font-bold text-amber-300 animate-fade-in">
                  ✓ {locale === "ar" ? "تم ربط بيانات المسافر الأول تلقائياً بنجاح!" : "Passenger details synchronized!"}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* ========================================================
          1. HOTEL CROSS-SELL SLIDER & ACTIVE SELECTION CARD
      ======================================================== */}
      <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-900">
              <Hotel size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-purple-950">
                {locale === "ar" ? "فنادق 5 نجوم موصى بها في الوجهة" : "Recommended 5-Star Destination Hotels"}
              </h3>
              <p className="text-xs text-slate-500">
                {locale === "ar"
                  ? `أفضل الإقامات الفاخرة لـ ${nightsCount} ليالٍ · احجز غرفتك مباشرة دون إعادة إدخال بياناتك`
                  : `Top curated luxury stays for ${nightsCount} nights · Select room directly`}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 transition-colors"
              aria-label="Previous hotels"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("right")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 transition-colors"
              aria-label="Next hotels"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* Selected Hotel Card (if user added a room) */}
        {selectedHotel ? (
          <div className="mb-6 overflow-hidden rounded-2xl border-2 border-purple-400/40 bg-gradient-to-r from-purple-50 via-white to-amber-50/40 p-4 sm:p-5 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-24 sm:h-24 sm:w-28 shrink-0 overflow-hidden rounded-xl">
                  <SafeImage
                    src={selectedHotel.roomPhoto || selectedHotel.hotelPhoto}
                    alt={selectedHotel.hotelName}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded-md bg-purple-950/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                    ★ {selectedHotel.hotelStars}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      ✓ {locale === "ar" ? "تمت إضافة الفندق للحجز" : "Hotel Added to Booking"}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-purple-900 font-semibold">{selectedHotel.hotelName}</span>
                  </div>

                  <h4 className="mt-1 text-base font-black text-purple-950">{selectedHotel.roomName}</h4>
                  <p className="text-xs text-slate-600">{selectedHotel.bedType}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} className="text-purple-700" />
                      {selectedHotel.checkIn} ← {selectedHotel.checkOut} ({selectedHotel.nightsCount} {locale === "ar" ? "ليالٍ" : "nights"})
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Coffee size={12} />
                      {locale === "ar" ? "إفطار مشمول" : "Breakfast Included"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex w-full sm:w-auto items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-purple-100">
                <div className="text-start sm:text-end">
                  <span className="block text-[11px] text-slate-500">
                    {formatFlightPrice(selectedHotel.pricePerNight, currency)} / {locale === "ar" ? "ليلة" : "night"}
                  </span>
                  <strong className="text-xl font-black text-purple-950">
                    +{formatFlightPrice(selectedHotel.totalPrice, currency)}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const found = hotelsList.find((h) => h.id === selectedHotel.hotelId) || hotelsList[0];
                      setModalHotel(found);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs font-bold text-purple-950 hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>{locale === "ar" ? "تغيير الغرفة" : "Change Room"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectHotel(null)}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>{locale === "ar" ? "حذف" : "Remove"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Hotels Slider */}
        <div
          ref={hotelSliderRef}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {hotelsList.map((hotel) => {
            const minRoomPrice = Math.min(...hotel.rooms.map((r) => r.pricePerNightUsd));
            const isChosen = selectedHotel?.hotelId === hotel.id;

            return (
              <div
                key={hotel.id}
                className={`group relative flex w-[280px] sm:w-[310px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isChosen
                    ? "border-purple-600 bg-purple-50/40 shadow-lg ring-2 ring-purple-500/20"
                    : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-md"
                }`}
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <SafeImage
                    src={hotel.photoUrl}
                    alt={hotel.nameAr}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-amber-300 backdrop-blur-md">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{hotel.stars} نجوم</span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 left-2.5 text-white">
                    <h4 className="text-sm font-black line-clamp-1 text-white">
                      {locale === "ar" ? hotel.nameAr : hotel.nameEn}
                    </h4>
                    <p className="text-[11px] text-slate-200 line-clamp-1">{hotel.addressAr}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {hotel.amenitiesAr.slice(0, 2).map((am, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-900"
                        >
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-500">
                        {locale === "ar" ? "يبدأ من / ليلة" : "From / night"}
                      </span>
                      <strong className="text-base font-black text-purple-950">
                        {formatFlightPrice(minRoomPrice, currency)}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModalHotel(hotel)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-3.5 py-2 text-xs font-black text-white shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Hotel size={13} />
                      <span>{locale === "ar" ? "مشاهدة الغرف 🏨" : "View Rooms 🏨"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          2. AIRPORT TRANSFER CROSS-SELL SECTION
      ======================================================== */}
      <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
            <Car size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-purple-950">
              {locale === "ar" ? "خدمة الاستقبال والتوصيل VIP من وإلى المطار" : "VIP Airport Meet & Transfer Service"}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === "ar"
                ? "سائق خاص يستقبلك باللوحة الاسمية مباشرة عند الخروج من بوابة المطار بدون انتظار"
                : "Personal chauffeur with name-board pickup at airport gate"}
            </p>
          </div>
        </div>

        {/* Selected Transfer Card (if user added a transfer) */}
        {selectedTransfer ? (
          <div className="mb-5 overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-gradient-to-r from-amber-50/60 via-white to-purple-50/30 p-4 sm:p-5 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-24 sm:h-24 sm:w-28 shrink-0 overflow-hidden rounded-xl">
                  <SafeImage
                    src={selectedTransfer.photoUrl}
                    alt={selectedTransfer.vehicleName}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded-md bg-amber-900/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                    VIP
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      ✓ {locale === "ar" ? "تمت إضافة الترانسفير للحجز" : "Transfer Added to Booking"}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-amber-950 font-bold">{selectedTransfer.vehicleName}</span>
                  </div>

                  <h4 className="mt-1 text-sm font-black text-purple-950">
                    {selectedTransfer.routeType === "roundtrip"
                      ? "ذهاب وعودة (المطار ← الفندق ← المطار)"
                      : selectedTransfer.routeType === "hotel_to_airport"
                      ? "توصيل من الفندق إلى المطار"
                      : "استقبال من المطار إلى الفندق"}
                  </h4>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Plane size={12} className="text-purple-700" />
                      {locale === "ar" ? "رقم الرحلة:" : "Flight:"} {selectedTransfer.flightNumber}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} />
                      {selectedTransfer.seats} {locale === "ar" ? "مقاعد" : "seats"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase size={12} />
                      {selectedTransfer.luggage} {locale === "ar" ? "حقائب" : "bags"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price and remove */}
              <div className="flex w-full sm:w-auto items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-amber-100">
                <div className="text-start sm:text-end">
                  <span className="block text-[11px] text-slate-500">
                    {locale === "ar" ? "إجمالي خدمة التوصيل" : "Total Transfer Price"}
                  </span>
                  <strong className="text-xl font-black text-purple-950">
                    +{formatFlightPrice(selectedTransfer.price, currency)}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTransfer(null)}
                  className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>{locale === "ar" ? "حذف الترانسفير" : "Remove"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Transfer Selector Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {TRANSFER_VEHICLES.map((veh) => {
            const isSelected = transferVehicleType === veh.type;
            const price = transferRouteType === "roundtrip" ? veh.roundtripUsd : veh.oneWayUsd;

            return (
              <div
                key={veh.type}
                onClick={() => setTransferVehicleType(veh.type)}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-400/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3">
                    <SafeImage src={veh.photoUrl} alt={veh.nameAr} fill className="object-cover" />
                    <div className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                      {veh.seats} مقاعد · {veh.luggage} حقائب
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-purple-950 line-clamp-1">{veh.nameAr}</h4>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-500">
                    {veh.featuresAr.slice(0, 2).map((feat, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <Check size={11} className="text-emerald-600 shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-black text-purple-950">{formatFlightPrice(price, currency)}</span>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                      isSelected
                        ? "border-amber-600 bg-amber-500 text-slate-950"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transfer Trip Details Form */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {locale === "ar" ? "نوع المسار" : "Route Type"}
              </label>
              <select
                value={transferRouteType}
                onChange={(e) => setTransferRouteType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-purple-950 outline-none focus:border-purple-600"
              >
                <option value="airport_to_hotel">استقبال من المطار إلى الفندق (اتجاه واحد)</option>
                <option value="hotel_to_airport">توصيل من الفندق إلى المطار (اتجاه واحد)</option>
                <option value="roundtrip">ذهاب وعودة (استقبال وتوديع - وفر 15%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {locale === "ar" ? "رقم رحلة الطيران للتعقب" : "Flight Number"}
              </label>
              <input
                type="text"
                value={transferFlightNum}
                onChange={(e) => setTransferFlightNum(e.target.value)}
                dir="ltr"
                placeholder="مثال: TK 1982"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-purple-950 outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {locale === "ar" ? "اسم الفندق / الوجهة" : "Hotel / Destination"}
              </label>
              <input
                type="text"
                value={transferHotelName}
                onChange={(e) => setTransferHotelName(e.target.value)}
                placeholder="اسم الفندق أو المنطقة"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-purple-950 outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleAddTransfer}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-5 py-2.5 text-xs font-black text-slate-950 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Car size={15} />
              <span>
                {selectedTransfer
                  ? locale === "ar"
                    ? "تحديث تفاصيل الترانسفير 🚗"
                    : "Update Transfer 🚗"
                  : locale === "ar"
                  ? "إضافة خدمة الترانسفير للحجز 🚗"
                  : "Add Transfer to Booking 🚗"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. TOURS & EXPERIENCES CROSS-SELL SECTION
      ======================================================== */}
      <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-900">
            <Compass size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-purple-950">
              {locale === "ar" ? "جولات وتجارب سياحية مميزة في الوجهة" : "Top Destination Tours & Experiences"}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === "ar"
                ? "أضف جولة سياحية خاصة لتعيش أجمل اللحظات واستفد من أسعار الحجز المبكر"
                : "Add guided private or group tours at special bundled rates"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DESTINATION_TOURS.map((tour) => {
            const isTourSelected = selectedTours.some((t) => t.id === tour.id);
            const totalTourPrice = tour.pricePerPerson * Math.max(1, paxCount);

            return (
              <div
                key={tour.id}
                className={`flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isTourSelected
                    ? "border-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden">
                    <SafeImage src={tour.photoUrl} alt={tour.titleAr} fill className="object-cover" />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-amber-300 backdrop-blur-md">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{tour.rating} ({tour.reviewsCount})</span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 rounded-md bg-purple-950/80 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
                      {tour.duration}
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-sm font-black text-purple-950 leading-snug">{tour.titleAr}</h4>
                    <ul className="mt-2 space-y-1 text-xs text-slate-500">
                      {tour.highlightsAr.slice(0, 2).map((h, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <Check size={12} className="text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-500">
                      {formatFlightPrice(tour.pricePerPerson, currency)} / {locale === "ar" ? "شخص" : "person"}
                    </span>
                    <strong className="text-sm font-black text-purple-950">
                      {formatFlightPrice(totalTourPrice, currency)} ({paxCount} {locale === "ar" ? "مسافرين" : "pax"})
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isTourSelected) {
                        onRemoveTour(tour.id);
                      } else {
                        onToggleTour({
                          id: tour.id,
                          titleAr: tour.titleAr,
                          titleEn: tour.titleEn,
                          photoUrl: tour.photoUrl,
                          duration: tour.duration,
                          rating: tour.rating,
                          reviewsCount: tour.reviewsCount,
                          highlightsAr: tour.highlightsAr,
                          highlightsEn: tour.highlightsEn,
                          pricePerPerson: tour.pricePerPerson,
                          paxCount,
                          totalPrice: totalTourPrice,
                          currency: "USD",
                          date: departDate || new Date().toISOString().slice(0, 10),
                        });
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-all cursor-pointer ${
                      isTourSelected
                        ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        : "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white hover:brightness-110"
                    }`}
                  >
                    {isTourSelected ? (
                      <>
                        <Trash2 size={13} />
                        <span>{locale === "ar" ? "حذف الجولة" : "Remove"}</span>
                      </>
                    ) : (
                      <>
                        <Compass size={13} />
                        <span>{locale === "ar" ? "إضافة الجولة 🎟️" : "Add Tour 🎟️"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Large Hotel Rooms Modal */}
      {modalHotel ? (
        <FlightBookingHotelRoomsModal
          hotel={modalHotel}
          checkInDate={departDate}
          checkOutDate={returnDate || departDate}
          nightsCount={nightsCount}
          paxCount={paxCount}
          currency={currency}
          onClose={() => setModalHotel(null)}
          onSelectRoom={(booking) => {
            onSelectHotel(booking);
            setModalHotel(null);
          }}
        />
      ) : null}
    </div>
  );
}
