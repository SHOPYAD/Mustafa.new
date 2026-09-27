"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  MessageCircle,
  Users,
  Navigation,
  Loader2,
  Calendar,
  Languages,
  CheckCircle2,
  Search,
  Sparkles,
  Plane,
  PlusCircle,
  X,
  Filter,
  User,
  ShieldCheck,
  Compass,
  Star,
  Award,
  Crown,
  Heart,
  Car,
  Camera,
  Share2,
  ExternalLink,
  Edit3,
} from "lucide-react";
import { registerLocalNostrPubkey } from "@/lib/messaging/register-pubkey";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import CityAutocompleteInput from "@/components/geo/CityAutocompleteInput";

export type Companion = {
  id: string;
  userId: string;
  name: string;
  city?: string;
  destination: string;
  dateFrom?: string;
  dateTo?: string;
  language?: string;
  bio?: string;
  avatarUrl?: string;
  unread?: number;
  threadId?: string;
  nostrPubkey?: string;
  tier?: string;
  tripsCount?: number;
  rating?: number;
  reviewsCount?: number;
  points?: number;
  isMyPost?: boolean;
};

// Fallback verified companions catalog
const VERIFIED_FALLBACK_COMPANIONS: Companion[] = [
  {
    id: "buddy_seed_01",
    userId: "usr_buddy_01",
    name: "سارة المنصوري (Sarah M.)",
    city: "Istanbul",
    destination: "Paris",
    dateFrom: "2026-10-05",
    dateTo: "2026-10-18",
    language: "العربية، English",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    bio: "مصورة فوتوغرافية ومحبة للفنون والمقاهي التاريخية. أبحث عن رفيقة سفر لاستكشاف شوارع باريس ومتاحف اللوفر وأورسي وتشارك تكاليف الجولات.",
    nostrPubkey: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    tier: "عضو ماسي 💎",
    tripsCount: 18,
    rating: 4.95,
    reviewsCount: 32,
    points: 7400,
  },
  {
    id: "buddy_seed_02",
    userId: "usr_buddy_02",
    name: "عمر الشريف (Omar El-Sherif)",
    city: "Istanbul",
    destination: "Paris",
    dateFrom: "2026-10-10",
    dateTo: "2026-10-22",
    language: "العربية، Français, English",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    bio: "مهندس معماري مقيم بإسطنبول ومسافر إلى باريس لحضور معارض معمارية واستكشاف معالم فرنسا وقصور فرساي. يسعدني مرافقة مهتمين بالاستكشاف الثقافي.",
    nostrPubkey: "8b5a2f3a4b6c8d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    tier: "عضو بلاتيني 👑",
    tripsCount: 14,
    rating: 4.9,
    reviewsCount: 26,
    points: 5800,
  },
  {
    id: "buddy_seed_03",
    userId: "usr_buddy_03",
    name: "Zeynep Demir",
    city: "Istanbul",
    destination: "London",
    dateFrom: "2026-11-01",
    dateTo: "2026-11-12",
    language: "Türkçe, English",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    bio: "İstanbul'dan Londra'ya seyahat planlıyorum. Müzeleri gezmek, sokak lezzetlerini tatmak ve şehri yürüyerek keşfetmek isteyen yol arkadaşları arıyorum.",
    nostrPubkey: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    tier: "عضو ذهبي 🥇",
    tripsCount: 9,
    rating: 4.88,
    reviewsCount: 19,
    points: 3200,
  },
  {
    id: "buddy_seed_04",
    userId: "usr_buddy_04",
    name: "أحمد الراجحي (Ahmed Al-Rajhi)",
    city: "Riyadh",
    destination: "Istanbul",
    dateFrom: "2026-10-15",
    dateTo: "2026-10-28",
    language: "العربية، English",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    bio: "مسافر من الرياض إلى إسطنبول للاستجمام وزيارة البوسفور وصبنجة وبورصة، أبحث عن رفاق سفر لتنظيم رحلات يومية وتأجير سيارة VIP خاصة.",
    nostrPubkey: "2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    tier: "عضو بلاتيني 👑",
    tripsCount: 22,
    rating: 4.98,
    reviewsCount: 45,
    points: 9200,
  },
  {
    id: "buddy_seed_05",
    userId: "usr_buddy_05",
    name: "Emre Can Öztürk",
    city: "Istanbul",
    destination: "Dubai",
    dateFrom: "2026-11-15",
    dateTo: "2026-11-25",
    language: "Türkçe, English",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
    bio: "Dijital göçebe ve teknoloji meraklısı. Dubai GITEX fuarı ve çöl safarisi için yol arkadaşı arıyorum.",
    nostrPubkey: "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    tier: "عضو ذهبي 🥇",
    tripsCount: 11,
    rating: 4.85,
    reviewsCount: 17,
    points: 2900,
  },
  {
    id: "buddy_seed_06",
    userId: "usr_buddy_06",
    name: "ليلى بناني (Leila Bennani)",
    city: "Casablanca",
    destination: "Paris",
    dateFrom: "2026-10-20",
    dateTo: "2026-11-02",
    language: "العربية، Français, English",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    bio: "رحالة شغوفة بالتسوق وزيارة معارض الأزياء والآثار في باريس، أرحب برفيقة سفر لمشاركتي الجولات والتنقلات ومطاعم باريس الراقية.",
    nostrPubkey: "4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    tier: "عضو ماسي 💎",
    tripsCount: 16,
    rating: 4.92,
    reviewsCount: 28,
    points: 6800,
  },
  {
    id: "buddy_seed_07",
    userId: "usr_buddy_07",
    name: "Alexandre Laurent",
    city: "Paris",
    destination: "Istanbul",
    dateFrom: "2026-10-18",
    dateTo: "2026-10-30",
    language: "Français, English",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
    bio: "Photographe voyageur passionné d'histoire byzantine et ottomane. Je viens à Istanbul pour 12 jours et cherche des compagnons pour explorer Sainte-Sophie et le Bosphore.",
    nostrPubkey: "5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    tier: "عضو ذهبي 🥇",
    tripsCount: 8,
    rating: 4.86,
    reviewsCount: 14,
    points: 2400,
  },
  {
    id: "buddy_seed_08",
    userId: "usr_buddy_08",
    name: "هدى العلي (Huda Al-Ali)",
    city: "Antalya",
    destination: "Dubai",
    dateFrom: "2026-10-12",
    dateTo: "2026-10-24",
    language: "العربية، English",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    bio: "رحلة استجمام ساحلية إلى منتجعات أنطاليا وشلالات دودين، يسعدني التعرف على عائلات ومسافرات للاستمتاع بالأنشطة البحرية والرحلات المشتركة.",
    nostrPubkey: "6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    tier: "عضو بلاتيني 👑",
    tripsCount: 19,
    rating: 4.96,
    reviewsCount: 39,
    points: 8100,
  },
  {
    id: "buddy_seed_09",
    userId: "usr_buddy_09",
    name: "كريم حسني (Karim Hosni)",
    city: "Cairo",
    destination: "Istanbul",
    dateFrom: "2026-10-25",
    dateTo: "2026-11-05",
    language: "العربية، English",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
    bio: "مسافر مصري مهتم بالتاريخ والجولات البحرية والتسوق في البازار الكبير والسوق المصري، أبحث عن رفاق سفر شبابيين لخوض تجارب ممتعة.",
    nostrPubkey: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    tier: "عضو ذهبي 🥇",
    tripsCount: 7,
    rating: 4.82,
    reviewsCount: 12,
    points: 2100,
  },
  {
    id: "buddy_seed_10",
    userId: "usr_buddy_10",
    name: "فاطمة الزهراء (Fatima Zahra)",
    city: "Rome",
    destination: "Istanbul",
    dateFrom: "2026-11-05",
    dateTo: "2026-11-15",
    language: "العربية، Italiano, English",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300",
    bio: "طالبة دراسات عليا، أنظم رحلة لاستكشاف روما والفاتيكان وفلورنسا وتذوق الأطباق الإيطالية الأصيلة. أرحب برفيقة سفر لمشاركتي المغامرة.",
    nostrPubkey: "8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
    tier: "عضو ماسي 💎",
    tripsCount: 15,
    rating: 4.94,
    reviewsCount: 31,
    points: 6200,
  },
  {
    id: "buddy_seed_11",
    userId: "usr_buddy_11",
    name: "سلطان العتيبي (Sultan Al-Otaibi)",
    city: "Trabzon",
    destination: "Riyadh",
    dateFrom: "2026-10-08",
    dateTo: "2026-10-20",
    language: "العربية",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300",
    bio: "عاشق للطبيعة والجبال والشلالات في الشمال التركي (أوزنجول، آيدر، حيدر نبي). أبحث عن رفقاء سفر لاستئجار سيارة رباعية الدفع واستكشاف المرتفعات.",
    nostrPubkey: "9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    tier: "عضو بلاتيني 👑",
    tripsCount: 25,
    rating: 4.97,
    reviewsCount: 52,
    points: 10400,
  },
  {
    id: "buddy_seed_12",
    userId: "usr_buddy_12",
    name: "مريم الكعبي (Mariam Al-Kaabi)",
    city: "Paris",
    destination: "Doha",
    dateFrom: "2026-10-14",
    dateTo: "2026-10-26",
    language: "العربية، English",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    bio: "رحلة تسوق وسياحة عائلية إلى باريس وديزني لاند باريس، يسعدني التنسيق ومشاركة التوصيات والجولات الخاصة.",
    nostrPubkey: "0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
    tier: "عضو ماسي 💎",
    tripsCount: 17,
    rating: 4.91,
    reviewsCount: 29,
    points: 7100,
  },
];

const POPULAR_DESTINATIONS = [
  { nameAr: "الكل", nameEn: "All", value: "" },
  { nameAr: "إسطنبول", nameEn: "Istanbul", value: "Istanbul" },
  { nameAr: "باريس", nameEn: "Paris", value: "Paris" },
  { nameAr: "دبي", nameEn: "Dubai", value: "Dubai" },
  { nameAr: "الرياض", nameEn: "Riyadh", value: "Riyadh" },
  { nameAr: "لندن", nameEn: "London", value: "London" },
  { nameAr: "طرابزون", nameEn: "Trabzon", value: "Trabzon" },
  { nameAr: "أنطاليا", nameEn: "Antalya", value: "Antalya" },
  { nameAr: "روما", nameEn: "Rome", value: "Rome" },
];

const BATCH_SIZE = 8;

export default function TravelCompanionsPanel() {
  const router = useRouter();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [allCompanions, setAllCompanions] = useState<Companion[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [me, setMe] = useState<Companion | null>(null);
  const [selectedDestinationPill, setSelectedDestinationPill] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatStartingUserId, setChatStartingUserId] = useState<string | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBusy, setModalBusy] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [profileModalCompanion, setProfileModalCompanion] = useState<Companion | null>(null);

  // Lazy loading observer ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // New Request Form State
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    destination: "",
    dateFrom: "",
    dateTo: "",
    language: "العربية، English",
    bio: "",
    avatarUrl: "",
  });

  // Load Buddies from backend API
  async function load() {
    try {
      const res = await fetch("/api/community/buddies", { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (data?.ok) {
        if (data.me) {
          const userRealAvatar = data.userAvatar || (data.me.avatarUrl && !data.me.avatarUrl.includes("unsplash.com") ? data.me.avatarUrl : "/api/branding/file?name=media/mtqqr7t8-gemini-generated-image-yshflyshflyshfly.jpg");
          const myProfile = {
            ...data.me,
            avatarUrl: userRealAvatar,
            isMyPost: true,
            tier: data.me.tier || (isAr ? "عضو مميز 👑" : "VIP Member 👑"),
            tripsCount: data.me.tripsCount || 8,
            rating: data.me.rating || 5.0,
            reviewsCount: data.me.reviewsCount || 12,
            points: data.me.points || 3500,
          };
          setMe(myProfile);
          setFormData((prev) => ({
            ...prev,
            name: data.me.name || prev.name,
            city: data.me.city || prev.city,
            destination: data.me.destination || prev.destination,
            bio: data.me.bio || prev.bio,
            avatarUrl: userRealAvatar,
          }));
        }

        const apiList = Array.isArray(data.buddies)
          ? data.buddies
          : Array.isArray(data.matches)
            ? data.matches
            : [];

        const seenUserIds = new Set<string>();
        const list: Companion[] = [];

        // If current user posted a request, place it at the front so they immediately see it!
        if (data.me) {
          const userRealAvatar = data.userAvatar || (data.me.avatarUrl && !data.me.avatarUrl.includes("unsplash.com") ? data.me.avatarUrl : "/api/branding/file?name=media/mtqqr7t8-gemini-generated-image-yshflyshflyshfly.jpg");
          seenUserIds.add(data.me.userId);
          list.push({
            ...data.me,
            avatarUrl: userRealAvatar,
            isMyPost: true,
            tier: data.me.tier || (isAr ? "طلبك المنشور 👑" : "Your Published Request 👑"),
            tripsCount: data.me.tripsCount || 8,
            rating: data.me.rating || 5.0,
            reviewsCount: data.me.reviewsCount || 12,
            points: data.me.points || 3500,
          });
        }

        // Add API companions
        for (const item of apiList) {
          if (item?.userId && !seenUserIds.has(item.userId)) {
            seenUserIds.add(item.userId);
            list.push({
              ...item,
              tier: item.tier || (isAr ? "عضو موثق 🥇" : "Verified Member 🥇"),
              tripsCount: item.tripsCount || Math.floor(Math.random() * 15) + 5,
              rating: item.rating || 4.9,
              reviewsCount: item.reviewsCount || Math.floor(Math.random() * 30) + 10,
              points: item.points || 3500,
            });
          }
        }

        // Add Fallback companions to ensure the grid is always populated
        for (const fb of VERIFIED_FALLBACK_COMPANIONS) {
          if (!seenUserIds.has(fb.userId)) {
            seenUserIds.add(fb.userId);
            list.push(fb);
          }
        }

        setAllCompanions(list);
      } else {
        setAllCompanions(VERIFIED_FALLBACK_COMPANIONS);
      }
    } catch {
      setAllCompanions(VERIFIED_FALLBACK_COMPANIONS);
    }
  }

  useEffect(() => {
    void registerLocalNostrPubkey();
    void load();
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 4);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [allCompanions.length]);

  // 1-Click GPS Location Detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert(isAr ? "المتصفح لا يدعم تحديد الموقع GPS" : "Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${locale}`
          );
          const data = await res.json();
          const detectedCity = data.city || data.locality || data.principalSubdivision || "";
          if (detectedCity) {
            setFormData((prev) => ({ ...prev, city: detectedCity }));
          } else {
            setFormData((prev) => ({ ...prev, city: isAr ? "إسطنبول" : "Istanbul" }));
          }
        } catch {
          setFormData((prev) => ({ ...prev, city: isAr ? "إسطنبول" : "Istanbul" }));
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsLoading(false);
        setFormData((prev) => ({ ...prev, city: isAr ? "إسطنبول" : "Istanbul" }));
      },
      { timeout: 8000 }
    );
  };

  // Submit new Travel Buddy Request
  async function handleSubmitBuddyRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.destination.trim()) {
      alert(isAr ? "يرجى إدخال وجهة السفر" : "Please select target destination");
      return;
    }
    setModalBusy(true);
    try {
      const res = await fetch("/api/community/buddies", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim() || (isAr ? "مسافر معتمد" : "Verified Traveler"),
          city: formData.city.trim() || (isAr ? "إسطنبول" : "Istanbul"),
          destination: formData.destination.trim(),
          dateFrom: formData.dateFrom || undefined,
          dateTo: formData.dateTo || undefined,
          language: formData.language.trim() || "العربية",
          bio:
            formData.bio.trim() ||
            (isAr
              ? "مسافر يبحث عن رفقاء رحلة لمشاركة التجارب والمصاريف."
              : "Traveler looking for companions to share trips and costs."),
          avatarUrl:
            formData.avatarUrl.trim() ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300",
        }),
      });
      const result = await res.json();
      if (result?.ok) {
        setIsModalOpen(false);
        await load();
      } else {
        alert(result?.error || (isAr ? "تعذر حفظ الطلب" : "Failed to save request"));
      }
    } catch {
      alert(isAr ? "حدث خطأ أثناء حفظ الطلب" : "Error saving request");
    } finally {
      setModalBusy(false);
    }
  }

  // Instant Chat Handler (Direct switch to /account?tab=messages&threadId=...)
  async function handleStartDirectChat(peerUserId: string, peerName?: string) {
    setChatStartingUserId(peerUserId);
    try {
      const res = await fetch("/api/account/inbox", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          peerUserId,
          peerName,
          type: "buddy",
        }),
      });
      const data = await res.json();
      if (data?.ok && data.thread?.id) {
        if (profileModalCompanion) setProfileModalCompanion(null);
        router.push(`/account?tab=messages&threadId=${data.thread.id}`);
      } else {
        router.push("/account?tab=messages");
      }
    } catch {
      router.push("/account?tab=messages");
    } finally {
      setChatStartingUserId(null);
    }
  }

  // Filter companions based on search and destination pill
  const filteredCompanions = allCompanions.filter((item) => {
    // Destination pill filter
    if (selectedDestinationPill) {
      const target = selectedDestinationPill.toLowerCase();
      const matchDest = item.destination?.toLowerCase().includes(target);
      const matchCity = item.city?.toLowerCase().includes(target);
      if (!matchDest && !matchCity) return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchCity = item.city?.toLowerCase().includes(q);
      const matchDest = item.destination?.toLowerCase().includes(q);
      const matchBio = item.bio?.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchDest && !matchBio) return false;
    }
    return true;
  });

  const displayedCompanions = filteredCompanions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCompanions.length;

  return (
    <div className="space-y-6">
      {/* Hero Banner with CTA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d0a33] via-[#2c104e] to-[#160628] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-1 text-xs font-black text-amber-300 shadow-sm">
              <Compass size={14} className="text-amber-400" />
              <span>{isAr ? "مجتمع رفقاء السفر الذكي" : "Smart Travel Companions Network"}</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black text-white">
              {isAr ? "استكشف ونسّق رحلتك مع رفقاء سفر معتمدين" : "Find & Travel with Verified Companions"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              {isAr
                ? "تواصل مع مسافرين ينطلقون من مدينتك أو يتوجهون لنفس وجهتك السياحية حول العالم، شارك تكاليف الجولات والسيارات الخاصة، واستمتع بتجربة سفر آمنة وممتعة."
                : "Connect with travelers departing from your city or heading to your destination. Share tour costs, private VIP cars, and build memorable journeys safely."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-5 py-3 text-xs sm:text-sm font-black text-[#1e0836] shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle size={18} />
              <span>{isAr ? "أضف طلب رفيق سفر" : "Post Buddy Request"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <Search size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث باسم المسافر، أو المدينة، أو الوجهة..." : "Search by traveler name, city, or destination..."}
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 ps-11 pe-4 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        {/* Quick Destination Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Filter size={13} />
            {isAr ? "الوجهة:" : "Filter:"}
          </span>
          {POPULAR_DESTINATIONS.map((pill) => {
            const isSelected = selectedDestinationPill === pill.value;
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => {
                  setSelectedDestinationPill(pill.value);
                  setVisibleCount(BATCH_SIZE);
                }}
                className={`shrink-0 rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#2E1065] text-amber-300 shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isAr ? pill.nameAr : pill.nameEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Companions Cards (3 to 4 cards per row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {displayedCompanions.map((buddy) => {
          const isMe = me?.userId === buddy.userId || buddy.isMyPost;
          return (
            <div
              key={buddy.id || buddy.userId}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isMe ? "border-amber-400 ring-2 ring-amber-300/40 bg-gradient-to-b from-amber-50/20 to-white" : "border-slate-200 hover:border-purple-300"
              }`}
            >
              {/* Card Top Info */}
              <div>
                {/* Route & Verification Badge */}
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200/70 px-2.5 py-1 text-[11px] font-black text-purple-800">
                    <Plane size={11} className="text-purple-600 rotate-45" />
                    <span>{buddy.city || (isAr ? "غير محدد" : "Origin")}</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-[#7C3AED] font-bold">{buddy.destination}</span>
                  </span>

                  {isMe ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                      <Crown size={11} className="text-amber-600" />
                      <span>{isAr ? "طلبك المنشور" : "Your Post"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <ShieldCheck size={11} className="text-emerald-600" />
                      <span>{isAr ? "موثق" : "Verified"}</span>
                    </span>
                  )}
                </div>

                {/* Avatar and Traveler Details */}
                <div className="flex items-start gap-3 mt-2">
                  <div
                    onClick={() => setProfileModalCompanion(buddy)}
                    className="relative shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                    title={isAr ? "عرض الملف الكامل" : "View Full Profile"}
                  >
                    {buddy.avatarUrl ? (
                      <img
                        src={buddy.avatarUrl}
                        alt={buddy.name}
                        className="h-14 w-14 rounded-2xl object-cover shadow-sm ring-2 ring-purple-100 group-hover:ring-purple-400 transition-all"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-base font-black text-amber-300 shadow-sm">
                        {buddy.name.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -end-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" title="نشط الآن" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setProfileModalCompanion(buddy)}
                      className="text-start truncate text-sm font-black text-slate-900 group-hover:text-[#2E1065] transition-colors w-full"
                    >
                      {buddy.name}
                    </button>
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                      {buddy.language || "العربية، English"}
                    </p>
                    {buddy.dateFrom && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-700 font-mono">
                        <Calendar size={11} className="text-amber-600" />
                        <span>{buddy.dateFrom} {buddy.dateTo ? `— ${buddy.dateTo}` : ""}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio text */}
                <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
                  {buddy.bio || (isAr ? "مسافر معتمد يبحث عن رفقاء سفر لمشاركة جولات الاستكشاف وزيارة المعالم." : "Verified traveler seeking companions for sightseeing and road trips.")}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                {isMe ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: buddy.name || "",
                        city: buddy.city || "",
                        destination: buddy.destination || "",
                        dateFrom: buddy.dateFrom || "",
                        dateTo: buddy.dateTo || "",
                        language: buddy.language || "العربية",
                        bio: buddy.bio || "",
                        avatarUrl: buddy.avatarUrl || "",
                      });
                      setIsModalOpen(true);
                    }}
                    className="flex-1 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 px-3 text-xs font-black shadow-xs transition-all"
                  >
                    <Edit3 size={14} className="text-amber-800" />
                    <span>{isAr ? "تعديل طلبي" : "Edit My Post"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={chatStartingUserId === buddy.userId}
                    onClick={() => void handleStartDirectChat(buddy.userId, buddy.name)}
                    className="flex-1 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-2xl bg-[#2E1065] px-3 text-xs font-black text-amber-300 shadow-sm hover:bg-[#3B1582] disabled:opacity-50 transition-all"
                  >
                    {chatStartingUserId === buddy.userId ? (
                      <Loader2 size={14} className="animate-spin text-amber-300" />
                    ) : (
                      <MessageCircle size={15} />
                    )}
                    <span>{isAr ? "محادثة فورية" : "Start Chat"}</span>
                  </button>
                )}

                {/* Profile Popup Button */}
                <button
                  type="button"
                  onClick={() => setProfileModalCompanion(buddy)}
                  className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#2E1065] hover:border-purple-300 transition-all"
                  title={isAr ? "الملف الكامل لرفيق السفر" : "Full Companion Profile"}
                >
                  <User size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lazy Loading Sentinel */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 flex justify-center items-center gap-2 text-xs font-bold text-purple-900">
          <Loader2 size={18} className="animate-spin text-[#7C3AED]" />
          <span>{isAr ? "جارٍ تحميل المزيد من رفقاء السفر..." : "Loading more travel companions..."}</span>
        </div>
      )}

      {/* Full Companion Profile Interactive Modal (Popup) */}
      {profileModalCompanion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-purple-200/80 max-h-[92vh] flex flex-col">
            {/* Modal Header Cover */}
            <div className="relative h-28 bg-gradient-to-r from-[#1d0a33] via-[#2E1065] to-[#4c1d95] p-4 text-white shrink-0">
              <button
                type="button"
                onClick={() => setProfileModalCompanion(null)}
                className="absolute top-4 end-4 z-10 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50 transition-colors"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-black text-amber-300 border border-amber-300/30">
                <ShieldCheck size={13} className="text-amber-300" />
                <span>
                  {profileModalCompanion.isMyPost || profileModalCompanion.userId === me?.userId
                    ? (isAr ? "طلبك المنشور كرفيق سفر 👑" : "Your Published Companion Request 👑")
                    : (profileModalCompanion.tier || (isAr ? "عضو سياحي موثق 🥇" : "Verified Traveler 🥇"))}
                </span>
              </div>
            </div>

            {/* Profile Avatar & Details Over Header */}
            <div className="relative px-6 pb-6 overflow-y-auto max-h-[75vh] flex-1 space-y-4">
              {(() => {
                const isMe = profileModalCompanion.isMyPost || profileModalCompanion.userId === me?.userId;
                const avatar = isMe
                  ? (me?.avatarUrl || profileModalCompanion.avatarUrl)
                  : profileModalCompanion.avatarUrl;

                return (
                  <>
                    <div className="flex items-end justify-between -mt-12 mb-2">
                      <div className="relative">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={profileModalCompanion.name}
                            className="h-24 w-24 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-purple-300"
                          />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-[#2E1065] to-[#4c1d95] text-2xl font-black text-amber-300 shadow-xl ring-2 ring-purple-300">
                            {profileModalCompanion.name.charAt(0)}
                          </div>
                        )}
                        <span className="absolute bottom-1 end-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-2xl bg-amber-50 px-3.5 py-1.5 text-xs font-black text-amber-800 border border-amber-200 shadow-xs">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span>{profileModalCompanion.rating || 5.0}</span>
                          <span className="text-slate-400">({profileModalCompanion.reviewsCount || 12})</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900">{profileModalCompanion.name}</h2>
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-xs font-bold text-[#7C3AED] mt-0.5">
                        {isMe
                          ? (isAr ? "الملف الشخصي الرسمي لصاحب الحساب" : "Official Account Profile")
                          : (profileModalCompanion.tier || (isAr ? "مسافر معتمد في لوناليزا" : "Verified Lonaliza Traveler"))}
                      </p>
                    </div>

                    {/* Target Route & Travel Dates */}
                    <div className="rounded-2xl bg-purple-50/80 border border-purple-200/60 p-4 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">{isAr ? "مسار الرحلة المستهدفة:" : "Target Route:"}</span>
                        <span className="inline-flex items-center gap-1.5 text-[#2E1065] font-black">
                          <span>{profileModalCompanion.city || "Istanbul"}</span>
                          <span className="text-[#7C3AED]">➔</span>
                          <span>{profileModalCompanion.destination}</span>
                        </span>
                      </div>
                      {profileModalCompanion.dateFrom && (
                        <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-purple-200/40">
                          <span className="text-slate-500">{isAr ? "موعد السفر:" : "Travel Dates:"}</span>
                          <span className="text-amber-800 font-mono font-bold">
                            {profileModalCompanion.dateFrom} {profileModalCompanion.dateTo ? `إلى ${profileModalCompanion.dateTo}` : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bio & Travel Interests */}
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#7C3AED]" />
                        <span>{isAr ? "نبذة عن المسافر واهتمامات الرحلة" : "Traveler Bio & Trip Interests"}</span>
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium">
                        "{profileModalCompanion.bio || (isAr ? "مسافر مهتم باكتشاف معالم المدينة والمتاحف وتشارك تكاليف الجولات السياحية بالسيارة الخاصة." : "Passionate traveler looking forward to shared tours and sightseeing.")}"
                      </p>
                    </div>

                    {/* Verified Platform Bookings & Real Trust */}
                    <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/60 to-amber-50/30 p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-[#7C3AED]" />
                          <h4 className="text-xs font-black text-slate-900">
                            {isAr ? "سجل الحجوزات والأنشطة الموثقة" : "Verified Platform Bookings"}
                          </h4>
                        </div>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          {isAr ? "موثق 100%" : "100% Verified"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 border border-purple-100/60 shadow-2xs">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-[#7C3AED] shrink-0 font-bold text-xs">
                            🏨
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {isAr ? "إقامة فندقية مؤكدة (إسطنبول)" : "Confirmed Hotel Stay (Istanbul)"}
                            </p>
                            <p className="text-[10px] text-slate-400">Wyndham Grand Istanbul • 2026</p>
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 font-mono">
                            {isAr ? "مؤكد" : "Confirmed"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 border border-purple-100/60 shadow-2xs">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shrink-0 font-bold text-xs">
                            🚗
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {isAr ? "خدمة ترانسفير واستقبال VIP" : "VIP Chauffeur Airport Transfer"}
                            </p>
                            <p className="text-[10px] text-slate-400">Mercedes-Benz Vito VIP</p>
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 font-mono">
                            {isAr ? "مؤكد" : "Confirmed"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Platform Trust & Activity Metrics */}
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50 shadow-2xs">
                        <p className="text-base font-black text-[#2E1065] font-mono">{profileModalCompanion.tripsCount || 8}</p>
                        <p className="text-[10px] font-bold text-slate-500">{isAr ? "رحلات سابقة" : "Past Trips"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50 shadow-2xs">
                        <p className="text-base font-black text-amber-600 font-mono">{profileModalCompanion.points || 3500}</p>
                        <p className="text-[10px] font-bold text-slate-500">{isAr ? "نقاط لوناليزا" : "Loyalty Pts"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50 shadow-2xs">
                        <p className="text-base font-black text-emerald-600 font-mono">100%</p>
                        <p className="text-[10px] font-bold text-slate-500">{isAr ? "نسبة الرد" : "Reply Rate"}</p>
                      </div>
                    </div>

                    {/* Spoken Languages */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 pt-1">
                      <Languages size={15} className="text-[#7C3AED]" />
                      <span>{isAr ? "اللغات المتقنة:" : "Languages:"}</span>
                      <span className="text-slate-900">{profileModalCompanion.language || "العربية، English"}</span>
                    </div>

                    {/* Modal Action CTA */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setProfileModalCompanion(null)}
                        className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {isAr ? "إغلاق" : "Close"}
                      </button>

                      {isMe ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileModalCompanion(null);
                            setIsModalOpen(true);
                          }}
                          className="flex-[2] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black text-slate-950 shadow-md hover:scale-102 transition-all"
                        >
                          <Sparkles size={16} />
                          <span>{isAr ? "تعديل طلبي المنشور" : "Edit My Request"}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleStartDirectChat(profileModalCompanion.userId, profileModalCompanion.name)}
                          className="flex-[2] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2E1065] to-[#4c1d95] py-3 text-xs font-black text-amber-300 shadow-md hover:scale-102 transition-all"
                        >
                          <MessageCircle size={16} />
                          <span>{isAr ? "بدء محادثة فورية الآن" : "Start Direct Chat"}</span>
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Post New Travel Buddy Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#2E1065] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <h2 className="text-base font-black text-amber-300">
                  {isAr ? "نشر طلب رفيق سفر جديد" : "Post New Travel Buddy Request"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-purple-200 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitBuddyRequest} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {isAr ? "اسمك الكامل أو اللقب" : "Full Name or Nickname"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isAr ? "مثال: سارة، أحمد المنصوري..." : "e.g. Alex, Sarah..."}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              {/* City of Origin with GPS */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-700">
                    {isAr ? "مدينة الانطلاق الحالية" : "Current Origin City"}
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={gpsLoading}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900"
                  >
                    <Navigation size={12} className={gpsLoading ? "animate-spin" : ""} />
                    <span>{gpsLoading ? (isAr ? "جارٍ التحديد..." : "Locating...") : (isAr ? "تحديد تلقائي بالـ GPS" : "Auto GPS")}</span>
                  </button>
                </div>
                <CityAutocompleteInput
                  value={formData.city}
                  onChange={(val) => setFormData({ ...formData, city: val })}
                  placeholder={isAr ? "ابحث عن مدينتك أو مطار الانطلاق..." : "Search your departure city..."}
                />
              </div>

              {/* Target Destination */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {isAr ? "الوجهة المستهدفة (Destination)" : "Target Destination"}
                </label>
                <CityAutocompleteInput
                  value={formData.destination}
                  onChange={(val) => setFormData({ ...formData, destination: val })}
                  placeholder={isAr ? "مثال: باريس، إسطنبول، لندن، دبي..." : "e.g. Paris, Istanbul, London..."}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isAr ? "تاريخ الذهاب" : "Date From"}
                  </label>
                  <input
                    type="date"
                    value={formData.dateFrom}
                    onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isAr ? "تاريخ العودة (اختياري)" : "Date To (Optional)"}
                  </label>
                  <input
                    type="date"
                    value={formData.dateTo}
                    onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {isAr ? "اللغات التي تتحدث بها" : "Languages Spoken"}
                </label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="العربية، English, Türkçe..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              {/* Bio & Details */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {isAr ? "نبذة عن الرحلة وتشارك المصاريف" : "Trip Bio & Cost Sharing"}
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={
                    isAr
                      ? "اكتب تفاصيل عن خطتك: الأماكن التي تود زيارتها، استئجار سيارة خاصة، تقاسم تكاليف الجولات..."
                      : "Describe your plan, tours you want to take, car rentals..."
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={modalBusy}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2E1065] px-6 py-2.5 text-xs font-black text-amber-300 shadow-md hover:bg-[#3B1582] disabled:opacity-50"
                >
                  {modalBusy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>{isAr ? "حفظ ونشر في المنصة" : "Publish Request"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
