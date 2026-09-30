import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { searchPexels, searchUnsplash } from "@/lib/server/media-search";

export type TravelMediaItem = {
  id: string;
  title: string;
  titleAr: string;
  url: string;
  thumbnail: string;
  category: string;
  source: "unsplash" | "pexels" | "graphic_animation" | "lonaliza_vault";
  aspectRatio?: "vertical" | "landscape" | "square";
  badge?: string;
};

// Rich curated luxury travel library (always available as instant VIP collection)
const CURATED_MEDIA: TravelMediaItem[] = [
  {
    id: "cap-1",
    title: "Cappadocia Sunrise Balloons Over Valleys",
    titleAr: "شروق كابادوكيا ومناطيد الوادي الساحر",
    url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=75&auto=format&fit=crop",
    category: "cappadocia",
    source: "unsplash",
    aspectRatio: "vertical",
    badge: "الأكثر طلباً",
  },
  {
    id: "cap-2",
    title: "Cave Suites & Goreme Panoramic View",
    titleAr: "أجنحة الكهوف الفاخرة وإطلالة جوريمي",
    url: "https://images.unsplash.com/photo-1609137144822-0d199a0cb9aa?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1609137144822-0d199a0cb9aa?w=400&q=75&auto=format&fit=crop",
    category: "cappadocia",
    source: "unsplash",
    aspectRatio: "vertical",
  },
  {
    id: "ist-1",
    title: "Bosphorus Sunset & Historic Mansions",
    titleAr: "غروب مضيق البوسفور ويخوت إسطنبول الفارهة",
    url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&q=75&auto=format&fit=crop",
    category: "istanbul",
    source: "unsplash",
    aspectRatio: "vertical",
    badge: "VIP",
  },
  {
    id: "ist-2",
    title: "Galata Tower & Golden Horn Dusk",
    titleAr: "برج غلاطة وأضواء القرن الذهبي عند الغسق",
    url: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=400&q=75&auto=format&fit=crop",
    category: "istanbul",
    source: "unsplash",
    aspectRatio: "vertical",
  },
  {
    id: "fly-1",
    title: "Private Jet First-Class Luxury Cabin",
    titleAr: "مقصورة الطيران الخاص والدرجة الأولى VIP",
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=75&auto=format&fit=crop",
    category: "flights",
    source: "unsplash",
    aspectRatio: "vertical",
    badge: "First Class",
  },
  {
    id: "fly-2",
    title: "Aircraft Wing Above the Sunset Clouds",
    titleAr: "جناح الطائرة فوق سحاب الغروب الذهبي",
    url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=400&q=75&auto=format&fit=crop",
    category: "flights",
    source: "unsplash",
    aspectRatio: "vertical",
  },
  {
    id: "hot-1",
    title: "Infinity Pool Overlooking Ocean & Cliffs",
    titleAr: "مسبح إنفينيتي بمنتجع بودروم الفاخر",
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=75&auto=format&fit=crop",
    category: "hotels",
    source: "unsplash",
    aspectRatio: "vertical",
    badge: "5 نجوم",
  },
  {
    id: "hot-2",
    title: "Presidential Luxury Suite with City View",
    titleAr: "جناح رئاسي فاخر بإطلالة بانورامية كاملة",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=75&auto=format&fit=crop",
    category: "hotels",
    source: "unsplash",
    aspectRatio: "vertical",
  },
  {
    id: "wal-1",
    title: "Smart Premium Travel Wallet & Cashback",
    titleAr: "محفظة الاسترداد النقدي وكاش باك السفر الفوري",
    url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=75&auto=format&fit=crop",
    category: "wallet",
    source: "unsplash",
    aspectRatio: "vertical",
    badge: "كاش باك",
  },
  {
    id: "ai-1",
    title: "Future of AI Travel Concierge Assistant",
    titleAr: "مستشار الذكاء الاصطناعي لتخطيط الرحلات الفاخرة",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=75&auto=format&fit=crop",
    category: "ai",
    source: "unsplash",
    aspectRatio: "vertical",
    badge: "Gemini AI",
  },
  {
    id: "sea-1",
    title: "Turquoise Waters of Mediterranean Antalya",
    titleAr: "المياه الفيروزية وشواطئ أنطاليا الساحرة",
    url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=75&auto=format&fit=crop",
    category: "beaches",
    source: "pexels",
    aspectRatio: "vertical",
  },
  {
    id: "car-1",
    title: "VIP Chauffeured Mercedes Maybach Fleet",
    titleAr: "أسطول سيارات مرسيدس مايباخ مع سائق VIP",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=75&auto=format&fit=crop",
    category: "cars",
    source: "unsplash",
    aspectRatio: "vertical",
    badge: "Chauffeur",
  },
];

const CATEGORY_SEARCH_TERMS: Record<string, string> = {
  all: "luxury travel turkey",
  cappadocia: "cappadocia hot air balloons goreme turkey",
  istanbul: "istanbul bosphorus galata luxury travel",
  flights: "luxury airplane private jet first class flight",
  hotels: "luxury 5 star resort hotel suite",
  wallet: "travel credit card cash money wallet",
  cars: "luxury mercedes chauffeur limousine vip car",
  beaches: "antalya bodrum turquoise beach resort",
  ai: "artificial intelligence modern luxury travel future",
};

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category") || "all";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    // Filter curated list first
    let curatedFiltered = [...CURATED_MEDIA];
    if (category && category !== "all") {
      curatedFiltered = curatedFiltered.filter((item) => item.category === category);
    }
    if (query) {
      const qLower = query.toLowerCase();
      curatedFiltered = curatedFiltered.filter(
        (item) =>
          item.title.toLowerCase().includes(qLower) ||
          item.titleAr.includes(query) ||
          item.category.includes(qLower)
      );
    }

    // Determine query to send to Pexels and Unsplash
    let liveQuery = query;
    if (!liveQuery) {
      liveQuery = CATEGORY_SEARCH_TERMS[category] || "luxury travel turkey";
    }

    // Call Pexels and Unsplash live concurrently
    const [pexelsRes, unsplashRes] = await Promise.allSettled([
      searchPexels({ query: liveQuery, page, perPage: 12 }),
      searchUnsplash({ query: liveQuery, page, perPage: 12 }),
    ]);

    const liveItems: TravelMediaItem[] = [];

    if (pexelsRes.status === "fulfilled" && pexelsRes.value?.items) {
      for (const item of pexelsRes.value.items) {
        liveItems.push({
          id: `pex-${item.id}`,
          title: item.authorName ? `Photo by ${item.authorName} on Pexels` : "Pexels Luxury Media",
          titleAr: item.authorName ? `عدسة المصور ${item.authorName} عبر Pexels` : "صورة سياحية عالية الدقة (Pexels)",
          url: item.fullUrl,
          thumbnail: item.thumbUrl || item.previewUrl || item.fullUrl,
          category: category !== "all" ? category : "travel",
          source: "pexels",
          aspectRatio: "vertical",
          badge: "Pexels HD",
        });
      }
    }

    if (unsplashRes.status === "fulfilled" && unsplashRes.value?.items) {
      for (const item of unsplashRes.value.items) {
        liveItems.push({
          id: `uns-${item.id}`,
          title: item.authorName ? `Photo by ${item.authorName} on Unsplash` : "Unsplash Luxury Media",
          titleAr: item.authorName ? `عدسة المصور ${item.authorName} عبر Unsplash` : "صورة سياحية عالية الدقة (Unsplash)",
          url: item.fullUrl,
          thumbnail: item.thumbUrl || item.previewUrl || item.fullUrl,
          category: category !== "all" ? category : "travel",
          source: "unsplash",
          aspectRatio: "vertical",
          badge: "Unsplash 4K",
        });
      }
    }

    // Interleave Pexels & Unsplash results
    const combinedLive: TravelMediaItem[] = [];
    const pexelsOnly = liveItems.filter((i) => i.source === "pexels");
    const unsplashOnly = liveItems.filter((i) => i.source === "unsplash");
    const maxLen = Math.max(pexelsOnly.length, unsplashOnly.length);
    for (let i = 0; i < maxLen; i++) {
      if (unsplashOnly[i]) combinedLive.push(unsplashOnly[i]);
      if (pexelsOnly[i]) combinedLive.push(pexelsOnly[i]);
    }

    // Combine: Curated VIP items first, followed by live API search results
    const allResults = [...curatedFiltered, ...combinedLive];

    return NextResponse.json({
      ok: true,
      count: allResults.length,
      categories: [
        { id: "all", nameAr: "الكل" },
        { id: "cappadocia", nameAr: "كابادوكيا والمناطيد" },
        { id: "istanbul", nameAr: "إسطنبول والبوسفور" },
        { id: "flights", nameAr: "الطيران والدرجة الأولى" },
        { id: "hotels", nameAr: "الفنادق والمنتجعات" },
        { id: "wallet", nameAr: "المحفظة والكاش باك" },
        { id: "cars", nameAr: "السيارات الفاخرة VIP" },
        { id: "beaches", nameAr: "الشواطئ والبحار" },
        { id: "ai", nameAr: "الذكاء الاصطناعي" },
      ],
      media: allResults,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
