import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  AirVent,
  Baby,
  Bath,
  BedDouble,
  Bell,
  BellRing,
  Building2,
  Bus,
  Car,
  Check,
  Cigarette,
  Clock,
  Coffee,
  CreditCard,
  DoorOpen,
  Dumbbell,
  Gift,
  Heater,
  Landmark,
  Languages,
  Laptop,
  Leaf,
  MapPin,
  Maximize2,
  Microwave,
  Mountain,
  PawPrint,
  Plane,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShowerHead,
  Sparkles,
  Sun,
  Trees,
  Tv,
  Umbrella,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wine,
  XCircle,
} from "lucide-react";

export type HotelFeatureKind =
  | "wifi"
  | "parking"
  | "pool"
  | "spa"
  | "restaurant"
  | "breakfast"
  | "bar"
  | "coffee"
  | "roomService"
  | "gym"
  | "family"
  | "pets"
  | "reception"
  | "airport"
  | "transport"
  | "view"
  | "sea"
  | "city"
  | "ac"
  | "heating"
  | "tv"
  | "bath"
  | "shower"
  | "bed"
  | "guests"
  | "size"
  | "cancel"
  | "noCancel"
  | "location"
  | "safe"
  | "laundry"
  | "elevator"
  | "business"
  | "wheelchair"
  | "smoking"
  | "nonsmoking"
  | "garden"
  | "terrace"
  | "beach"
  | "kids"
  | "payment"
  | "clock"
  | "kitchen"
  | "shop"
  | "sustainability"
  | "language"
  | "gift"
  | "landmark"
  | "generic";

const ICON_BY_KIND: Record<HotelFeatureKind, LucideIcon> = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  spa: Sparkles,
  restaurant: UtensilsCrossed,
  breakfast: Coffee,
  bar: Wine,
  coffee: Coffee,
  roomService: BellRing,
  gym: Dumbbell,
  family: Users,
  pets: PawPrint,
  reception: Bell,
  airport: Plane,
  transport: Bus,
  view: Mountain,
  sea: Waves,
  city: Building2,
  ac: AirVent,
  heating: Heater,
  tv: Tv,
  bath: Bath,
  shower: ShowerHead,
  bed: BedDouble,
  guests: Users,
  size: Maximize2,
  cancel: Check,
  noCancel: XCircle,
  location: MapPin,
  safe: ShieldCheck,
  laundry: Shirt,
  elevator: DoorOpen,
  business: Laptop,
  wheelchair: Accessibility,
  smoking: Cigarette,
  nonsmoking: Leaf,
  garden: Trees,
  terrace: Sun,
  beach: Umbrella,
  kids: Baby,
  payment: CreditCard,
  clock: Clock,
  kitchen: Microwave,
  shop: ShoppingBag,
  sustainability: Leaf,
  language: Languages,
  gift: Gift,
  landmark: Landmark,
  generic: Check,
};

export function hotelFeatureKind(label: string): HotelFeatureKind {
  const t = String(label || "").toLowerCase();
  if (!t) return "generic";
  if (/wifi|wi-?fi|internet|واي|إنترنت|internet/i.test(t)) return "wifi";
  if (/parking|garage|car park|موقف|otopark|valet/i.test(t)) return "parking";
  if (/pool|swim|مسبح|havuz|indoor pool|outdoor pool/i.test(t)) return "pool";
  if (/spa|sauna|hammam|hamam|massage|سبا|ساونا|wellness/i.test(t)) return "spa";
  if (/breakfast|إفطار|kahvalt|buffet breakfast/i.test(t)) return "breakfast";
  if (/coffee|قهوة|café|cafe/i.test(t)) return "coffee";
  if (/bar|lounge|مشرب|بار/i.test(t)) return "bar";
  if (/restaurant|dining|food|طعام|مطعم|yiyecek|kitchen|مطبخ/i.test(t)) {
    if (/kitchen|مطبخ|mutfak/i.test(t)) return "kitchen";
    return "restaurant";
  }
  if (/room service|خدمة الغرف/i.test(t)) return "roomService";
  if (/gym|fitness|sport|رياضي|fitness/i.test(t)) return "gym";
  if (/famil|أطفال|aile|kids club|playground/i.test(t)) return "family";
  if (/pet|حيوان|kedi|köpek|dogs?|cats?/i.test(t)) return "pets";
  if (/reception|front desk|concierge|استقبال|resepsiyon|24.?hour/i.test(t)) return "reception";
  if (/airport|مطار|havaliman/i.test(t)) return "airport";
  if (/shuttle|transfer|transport|باص|otobüs|tram/i.test(t)) return "transport";
  if (/sea view|إطلالة على البحر|deniz manzara|bosphor|boğaz/i.test(t)) return "sea";
  if (/city view|إطلالة على المدينة|şehir manzara/i.test(t)) return "city";
  if (/view|إطلالة|manzara/i.test(t)) return "view";
  if (/air.?cond|تكييف|klima|a\/c/i.test(t)) return "ac";
  if (/heat|تدفئة|ısıt/i.test(t)) return "heating";
  if (/\btv\b|television|تلفاز|flat.?screen/i.test(t)) return "tv";
  if (/bath|حمام|küvet|bathtub/i.test(t)) return "bath";
  if (/shower|دش|duş/i.test(t)) return "shower";
  if (/bed|سرير|yatak/i.test(t)) return "bed";
  if (/guest|ضيف|misafir|occupanc/i.test(t)) return "guests";
  if (/m²|sqm|size|مساحة|m2/i.test(t)) return "size";
  if (/non.?refund|غير قابل للإلغاء|غير قابل للاسترداد|iade edilemez/i.test(t)) return "noCancel";
  if (/free cancel|إلغاء مجاني|refundable|ücretsiz iptal/i.test(t)) return "cancel";
  if (/location|موقع|konum|address|عنوان/i.test(t)) return "location";
  if (/safe|أمان|security|خزنة|kasa/i.test(t)) return "safe";
  if (/laundry|غسيل|çamaşır/i.test(t)) return "laundry";
  if (/elevator|lift|مصعد|asansör/i.test(t)) return "elevator";
  if (/business|meeting|conference|أعمال/i.test(t)) return "business";
  if (/wheelchair|accessib|ذوي|engelli/i.test(t)) return "wheelchair";
  if (/non.?smok|منع التدخين|sigara içilmez/i.test(t)) return "nonsmoking";
  if (/smok|تدخين|sigara/i.test(t)) return "smoking";
  if (/garden|حديقة|bahçe/i.test(t)) return "garden";
  if (/terrace|balcony|شرفة|teras|balkon/i.test(t)) return "terrace";
  if (/beach|شاطئ|plaj/i.test(t)) return "beach";
  if (/child|baby|crib|أطفال|bebek/i.test(t)) return "kids";
  if (/visa|mastercard|american express|payment|بطاقة|ödeme/i.test(t)) return "payment";
  if (/check.?in|check.?out|تسجيل/i.test(t)) return "clock";
  if (/shop|store|متجر|mağaza/i.test(t)) return "shop";
  if (/sustain|بيئي|çevre/i.test(t)) return "sustainability";
  if (/language|لغة|dil/i.test(t)) return "language";
  if (/gift|هدية/i.test(t)) return "gift";
  if (/museum|palace|mosque|landmark|معلم|saray|cami/i.test(t)) return "landmark";
  if (/hot spring|ينابيع|kaplıca/i.test(t)) return "spa";
  if (/bike|دراجة/i.test(t)) return "transport";
  if (/plug|adapter|قابس/i.test(t)) return "ac";
  if (/hair.?dryer|مجفف/i.test(t)) return "bath";
  if (/minibar|ثلاجة/i.test(t)) return "kitchen";
  if (/iron|مكواة/i.test(t)) return "laundry";
  if (/key|بطاقة المفتاح/i.test(t)) return "reception";
  if (/luggage|أمتعة/i.test(t)) return "reception";
  if (/first aid|طبي|sağlık/i.test(t)) return "safe";
  if (/flame|bbq|شواء/i.test(t)) return "garden";
  if (/water|ماء/i.test(t)) return "coffee";
  if (/person|adult/i.test(t)) return "guests";
  return "generic";
}

const KIND_TINT: Partial<Record<HotelFeatureKind, string>> = {
  breakfast: "text-amber-700",
  cancel: "text-emerald-700",
  noCancel: "text-amber-700",
  bed: "text-sky-800",
  wifi: "text-sky-700",
  parking: "text-slate-700",
  pool: "text-cyan-700",
  spa: "text-violet-700",
  restaurant: "text-orange-700",
  location: "text-emerald-700",
  sea: "text-cyan-800",
};

type Props = {
  label: string;
  size?: number;
  className?: string;
  kind?: HotelFeatureKind;
};

export default function HotelFeatureIcon({ label, size = 18, className, kind }: Props) {
  const resolved = kind || hotelFeatureKind(label);
  const Icon = ICON_BY_KIND[resolved];
  const tint = KIND_TINT[resolved] || "text-emerald-700";
  return <Icon size={size} className={`shrink-0 ${tint} ${className || ""}`} aria-hidden />;
}

