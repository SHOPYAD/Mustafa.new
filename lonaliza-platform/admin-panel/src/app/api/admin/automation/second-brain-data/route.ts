import { NextResponse } from "next/server";
import { getQdrantClient, SWARM_COLLECTIONS } from "@/lib/swarm/qdrant-vector-store";

export const dynamic = "force-dynamic";

export interface BrainSector {
  id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  collection: string;
  pointsCount: number;
}

export interface BrainNode {
  id: string;
  sectorId: string;
  label: string;
  summary: string;
  score?: number;
  collection: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface BrainLink {
  source: string;
  target: string;
  strength: number;
}

export async function GET() {
  try {
    const qdrant = getQdrantClient();

    const sectors: BrainSector[] = [
      {
        id: "trabzon",
        nameAr: "قطاع الشمال وطرابزون",
        nameEn: "Trabzon & Black Sea",
        color: "#10b981",
        collection: SWARM_COLLECTIONS.MARKET_CATALOG,
        pointsCount: 42,
      },
      {
        id: "istanbul",
        nameAr: "قطاع إسطنبول الفاخرة",
        nameEn: "Istanbul VIP Luxury",
        color: "#f59e0b",
        collection: SWARM_COLLECTIONS.MARKET_CATALOG,
        pointsCount: 38,
      },
      {
        id: "flights",
        nameAr: "قطاع الطيران والفنادق",
        nameEn: "Global GDS Flights",
        color: "#38bdf8",
        collection: SWARM_COLLECTIONS.MARKET_CATALOG,
        pointsCount: 65,
      },
      {
        id: "b2b",
        nameAr: "شبكة الموزعين B2B",
        nameEn: "Reseller Wholesales",
        color: "#8b5cf6",
        collection: SWARM_COLLECTIONS.DELIBERATIONS,
        pointsCount: 29,
      },
      {
        id: "design",
        nameAr: "المحرر البصري والتجربة",
        nameEn: "Visual Editor Experience",
        color: "#ec4899",
        collection: SWARM_COLLECTIONS.DESIGN_PATCHES,
        pointsCount: 54,
      },
      {
        id: "security",
        nameAr: "الحوكمة والأمان المالي",
        nameEn: "Governance & Security",
        color: "#ef4444",
        collection: SWARM_COLLECTIONS.CUSTOMER_CONVERSATIONS,
        pointsCount: 31,
      },
    ];

    // Seed Grounded Vector Nodes for visual inspection in Second Brain
    const nodes: BrainNode[] = [
      {
        id: "mem-tb-01",
        sectorId: "trabzon",
        label: "باقة طرابزون وأكواخ أوزنجول العائلية",
        summary: "باقة 7 أيام تشمل سيارة فيتو وسائق خاص وزيارة حيدر نبي ومرتفعات آيدر",
        score: 0.94,
        collection: SWARM_COLLECTIONS.MARKET_CATALOG,
        payload: {
          priceUSD: 1450,
          vehicle: "Mercedes Vito 2024",
          occupancyRate: "92%",
          partner: "Black Sea Fleet",
        },
        timestamp: "2026-09-25T14:30:00Z",
      },
      {
        id: "mem-tb-02",
        sectorId: "trabzon",
        label: "حجوزات أكواخ ريزا المطلة على الشلال",
        summary: "تأكيد إشغال 12 كوخاً فاخراً مع إفطار ريفي مجاني ومواقف خاصة",
        score: 0.89,
        collection: SWARM_COLLECTIONS.MARKET_CATALOG,
        payload: {
          location: "Rize Firtina Valley",
          pricePerNight: 180,
          currency: "USD",
        },
        timestamp: "2026-09-25T11:15:00Z",
      },
      {
        id: "mem-ist-01",
        sectorId: "istanbul",
        label: "جولة يخت البوسفور الخاصة VIP",
        summary: "إبحار مسائي 3 ساعات مع عشاء تركي فاخر وإطلالة جسر البوسفور",
        score: 0.92,
        collection: SWARM_COLLECTIONS.MARKET_CATALOG,
        payload: {
          yachtModel: "Azimut 55ft",
          priceUSD: 650,
          catering: "Deluxe Ottoman Dinner",
        },
        timestamp: "2026-09-25T16:00:00Z",
      },
      {
        id: "mem-fl-01",
        sectorId: "flights",
        label: "ربط بوابة Pegasus GDS المباشرة",
        summary: "تحديث أسعار تذاكر الطيران للرياض وجدة والدوحة بخصم 12%",
        score: 0.88,
        collection: SWARM_COLLECTIONS.MARKET_CATALOG,
        payload: {
          apiProvider: "Pegasus Direct API",
          dailySyncCount: 1420,
          latencyMs: 145,
        },
        timestamp: "2026-09-25T15:20:00Z",
      },
      {
        id: "mem-b2b-01",
        sectorId: "b2b",
        label: "اتفاقية وكالة المسافر الخليجي B2B",
        summary: "عقد توريد سنوي لحجوزات فنادق طرابزون وإسطنبول بهامش ربح 8%",
        score: 0.96,
        collection: SWARM_COLLECTIONS.DELIBERATIONS,
        payload: {
          agencyName: "Al-Mosafer Gulf Tours",
          creditLimitUSD: 50000,
          approvedBy: "reseller_network_director",
        },
        timestamp: "2026-09-25T13:45:00Z",
      },
      {
        id: "mem-des-01",
        sectorId: "design",
        label: "رقعة الهيرو الصيفية ثلاثية الأبعاد",
        summary: "تصميم قسم الهيرو الجديد بنظام Glassmorphism وتجاوب كامل مع الجوال",
        score: 0.91,
        collection: SWARM_COLLECTIONS.DESIGN_PATCHES,
        payload: {
          component: "StorefrontHeroSection.tsx",
          contrastRatio: "14.2:1",
          designerAgent: "ui_ux_architect",
        },
        timestamp: "2026-09-25T12:10:00Z",
      },
      {
        id: "mem-sec-01",
        sectorId: "security",
        label: "تدقيق المعاملات المصرفية Iyzico و Stripe",
        summary: "فحص صفر محاولات احتيال ومطابقة 100% لإيصالات الدفع الإلكتروني",
        score: 0.99,
        collection: SWARM_COLLECTIONS.CUSTOMER_CONVERSATIONS,
        payload: {
          gatewayStatus: "Protected 3D-Secure v2",
          fraudAttempts: 0,
          verifiedTotalUSD: 34500,
          auditor: "chief_security_auditor",
        },
        timestamp: "2026-09-25T17:00:00Z",
      },
    ];

    // Generate semantic connections
    const links: BrainLink[] = [
      { source: "core", target: "trabzon", strength: 1.0 },
      { source: "core", target: "istanbul", strength: 1.0 },
      { source: "core", target: "flights", strength: 1.0 },
      { source: "core", target: "b2b", strength: 1.0 },
      { source: "core", target: "design", strength: 1.0 },
      { source: "core", target: "security", strength: 1.0 },
      { source: "trabzon", target: "mem-tb-01", strength: 0.8 },
      { source: "trabzon", target: "mem-tb-02", strength: 0.8 },
      { source: "istanbul", target: "mem-ist-01", strength: 0.8 },
      { source: "flights", target: "mem-fl-01", strength: 0.8 },
      { source: "b2b", target: "mem-b2b-01", strength: 0.8 },
      { source: "design", target: "mem-des-01", strength: 0.8 },
      { source: "security", target: "mem-sec-01", strength: 0.8 },
    ];

    return NextResponse.json({
      success: true,
      core: {
        id: "core",
        name: "النواة السيادية للوناليزا",
        version: "Lonaliza Sovereign AI v3.8",
        qdrantEndpoint: "http://127.0.0.1:6333",
        collectionsCount: 4,
        totalPoints: 259,
      },
      sectors,
      nodes,
      links,
    });
  } catch (error) {
    console.error("[SecondBrainData] Error fetching vector topology:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
