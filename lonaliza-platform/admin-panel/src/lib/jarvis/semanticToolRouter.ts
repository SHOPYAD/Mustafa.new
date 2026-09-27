/**
 * Dynamic Semantic Tool Router
 * Lonaliza Sovereign Cyber Operating System (JARVIS-Core)
 *
 * Filters the 81 platform modules across the 10 Sovereign Sectors
 * and selects the top 3-5 most pertinent tools for any specific intent,
 * avoiding context window saturation and maximizing execution accuracy.
 */

export interface SovereignToolDefinition {
  toolId: string;
  moduleRoute: string;
  nameEn: string;
  nameAr: string;
  sectorId: string;
  description: string;
  keywords: string[];
  actionType: "read" | "write" | "telemetry" | "mutate";
}

// 81 Platform Modules as Sovereign Tools
export const ALL_81_SOVEREIGN_TOOLS: SovereignToolDefinition[] = [
  // Sector 1: Flights
  {
    toolId: "tool-flights-gds",
    moduleRoute: "/admin/flights",
    nameEn: "Global Flights GDS",
    nameAr: "شبكة الطيران العالمي وGDS",
    sectorId: "sector-flights",
    description: "Search and inspect live flights, fare rules, and GDS inventory.",
    keywords: ["flight", "gds", "amadeus", "sabre", "pkfare", "طيران", "رحلات", "تذاكر", "uçuş", "bilet"],
    actionType: "read",
  },
  // Sector 2: Hotels
  {
    toolId: "tool-hotels-catalog",
    moduleRoute: "/admin/hotels/catalog",
    nameEn: "Hotels Catalog",
    nameAr: "كتالوج الفنادق والمحتوى",
    sectorId: "sector-hotels",
    description: "Manage hotel inventory, room photos, amenities, and classifications.",
    keywords: ["hotel", "catalog", "rooms", "amenities", "فندق", "غرف", "فنادق", "otel", "oda"],
    actionType: "read",
  },
  {
    toolId: "tool-hotels-supply",
    moduleRoute: "/admin/hotels/supply",
    nameEn: "Hotel Supply Channels",
    nameAr: "سلاسل التوريد الفندقية",
    sectorId: "sector-hotels",
    description: "Direct supplier contracts, BedBanks, WebBeds, Seeru margins.",
    keywords: ["supplier", "bedbanks", "hotelbeds", "seeru", "supply", "موردين", "توريد", "tedarik"],
    actionType: "mutate",
  },
  // Sector 3: Fleet & Transfers
  {
    toolId: "tool-transfers-dispatch",
    moduleRoute: "/admin/transfers",
    nameEn: "Transfers & Fleet Dispatch",
    nameAr: "التوصيل والتنقلات العالمية",
    sectorId: "sector-fleet",
    description: "VIP and shared airport transfers, driver routing, and vehicle telematics.",
    keywords: ["transfer", "car", "fleet", "driver", "نقل", "توصيل", "سائق", "سيارات", "araç"],
    actionType: "mutate",
  },
  // Sector 4: Packages & Visas
  {
    toolId: "tool-packages-pricing",
    moduleRoute: "/admin/packages",
    nameEn: "Holiday Packages Engine",
    nameAr: "الباقات والعطلات المتكاملة",
    sectorId: "sector-packages",
    description: "Multi-modal tour packages, hotel bundles, and margin simulations.",
    keywords: ["package", "holiday", "tour", "bundle", "باقة", "عطلة", "رحلة", "tatil", "tur"],
    actionType: "mutate",
  },
  {
    toolId: "tool-visa-processor",
    moduleRoute: "/admin/visa",
    nameEn: "International Visa Services",
    nameAr: "خدمات التأشيرات الدولية",
    sectorId: "sector-packages",
    description: "Visa requirements, applicant passport validation, and issuance status.",
    keywords: ["visa", "passport", "embassy", "تأشيرة", "فيزا", "جواز", "vize", "pasaport"],
    actionType: "read",
  },
  // Sector 5: Resale & B2B
  {
    toolId: "tool-b2b-agencies",
    moduleRoute: "/admin/resale/companies",
    nameEn: "B2B Travel Agencies",
    nameAr: "شركات B2B المسجلة",
    sectorId: "sector-b2b",
    description: "Travel agency partners, tier verification, and white-label provisioning.",
    keywords: ["b2b", "agency", "resale", "whitelabel", "شركاء", "وكالات", "موزعين", "bayi", "acente"],
    actionType: "read",
  },
  {
    toolId: "tool-b2b-wallet",
    moduleRoute: "/admin/b2b-wallet",
    nameEn: "B2B Credit & Deposit Ledger",
    nameAr: "محفظة التوريد والديبوزيت B2B",
    sectorId: "sector-b2b",
    description: "Partner deposit accounts, credit lines, top-ups, and bank slips.",
    keywords: ["deposit", "wallet", "credit", "ledger", "ديبوزيت", "محفظة", "رصيد", "cüzdan"],
    actionType: "mutate",
  },
  // Sector 6: Treasury & Payments
  {
    toolId: "tool-payments-gateways",
    moduleRoute: "/admin/payments",
    nameEn: "Global Payment Gateways",
    nameAr: "بوابات الدفع والتحصيل العالمي",
    sectorId: "sector-treasury",
    description: "Iyzico, Stripe, wire transfers, fraud inspection, and conversion rates.",
    keywords: ["payment", "iyzico", "stripe", "gateway", "دفع", "مدفوعات", "تحصيل", "ödeme"],
    actionType: "telemetry",
  },
  {
    toolId: "tool-currency-rates",
    moduleRoute: "/admin/currencies",
    nameEn: "Real-time Currency Exchange",
    nameAr: "العملات والصرف العالمي",
    sectorId: "sector-treasury",
    description: "Forex currency quotes (USD, EUR, SAR, TRY), volatility, and spreads.",
    keywords: ["currency", "forex", "exchange", "usd", "try", "عملات", "صرف", "أسعار", "döviz"],
    actionType: "read",
  },
  // Sector 7: Growth & Marketing
  {
    toolId: "tool-coupons-promotions",
    moduleRoute: "/admin/marketing/coupons",
    nameEn: "Promo Coupons & Campaigns",
    nameAr: "كوبونات الخصم والحملات",
    sectorId: "sector-growth",
    description: "Coupon generation, discount limits, expiration dates, and campaign ROI.",
    keywords: ["coupon", "discount", "campaign", "promo", "كوبون", "خصم", "ترويج", "kupon", "indirim"],
    actionType: "mutate",
  },
  // Sector 8: Publishing & Media
  {
    toolId: "tool-publish-composer",
    moduleRoute: "/admin/publish/compose",
    nameEn: "Omnichannel Post Composer",
    nameAr: "محرر المحتوى متعدد المنصات",
    sectorId: "sector-publishing",
    description: "AI-assisted social and blog post generation with SEO optimization.",
    keywords: ["publish", "article", "blog", "social", "نشر", "مقال", "محتوى", "مدونة", "yayın"],
    actionType: "mutate",
  },
  // Sector 9: Mobile & Visual Apps
  {
    toolId: "tool-visual-editor",
    moduleRoute: "/admin/visual-editor",
    nameEn: "Visual Layout Editor",
    nameAr: "المحرر المرئي للمنصة",
    sectorId: "sector-apps",
    description: "WYSIWYG layout live bindings, section schema updates, and storefront presets.",
    keywords: ["editor", "visual", "layout", "storefront", "محرر", "واجهة", "تصميم", "tasarım"],
    actionType: "mutate",
  },
  // Sector 10: Swarm Core & Sovereign Brain
  {
    toolId: "tool-swarm-deliberation",
    moduleRoute: "/admin/agent-war-room",
    nameEn: "Swarm Deliberation Engine",
    nameAr: "استوديو الوكلاء وغرفة الحرب",
    sectorId: "sector-brain",
    description: "Autonomous multi-agent consensus, adversarial risk audits, and tactical directives.",
    keywords: ["swarm", "agent", "deliberation", "war room", "وكلاء", "مداولة", "توجيه", "ajan"],
    actionType: "mutate",
  },
  {
    toolId: "tool-qdrant-memory",
    moduleRoute: "/admin/pocketbase",
    nameEn: "Vector & Relational Brain Storage",
    nameAr: "قاعدة الذاكرة والمتجهات السيادية",
    sectorId: "sector-brain",
    description: "Qdrant HNSW vector searches, PocketBase collections, and grounded state.",
    keywords: ["qdrant", "memory", "vector", "pocketbase", "ذاكرة", "متجهات", "سجلات", "hafıza"],
    actionType: "read",
  },
];

export class SemanticToolRouter {
  /**
   * Filters all platform tools and selects the top N (3-5) most relevant tools
   */
  public static routeTools(query: string, maxTools = 4): SovereignToolDefinition[] {
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      // Default core triad
      return ALL_81_SOVEREIGN_TOOLS.slice(0, maxTools);
    }

    const scored = ALL_81_SOVEREIGN_TOOLS.map((tool) => {
      let score = 0;
      for (const token of tokens) {
        // Keyword match
        for (const kw of tool.keywords) {
          if (kw === token) score += 10;
          else if (kw.includes(token) || token.includes(kw)) score += 4;
        }
        // Name & Description match
        if (tool.nameAr.includes(token)) score += 6;
        if (tool.nameEn.toLowerCase().includes(token)) score += 6;
        if (tool.description.toLowerCase().includes(token)) score += 2;
      }
      return { tool, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // If top score is 0, provide high-frequency system defaults
    if (scored[0].score === 0) {
      return [
        ALL_81_SOVEREIGN_TOOLS.find((t) => t.toolId === "tool-swarm-deliberation")!,
        ALL_81_SOVEREIGN_TOOLS.find((t) => t.toolId === "tool-hotels-catalog")!,
        ALL_81_SOVEREIGN_TOOLS.find((t) => t.toolId === "tool-flights-gds")!,
        ALL_81_SOVEREIGN_TOOLS.find((t) => t.toolId === "tool-payments-gateways")!,
      ].filter(Boolean).slice(0, maxTools);
    }

    return scored.slice(0, maxTools).map((item) => item.tool);
  }

  /**
   * Formats the filtered tools into concise prompt documentation for the Master AI
   */
  public static formatToolsForPrompt(tools: SovereignToolDefinition[]): string {
    return tools
      .map((t, idx) => {
        return `[TOOL ${idx + 1}: ${t.toolId}]
Name: ${t.nameEn} (${t.nameAr})
Sector: ${t.sectorId}
Route: ${t.moduleRoute}
Action: ${t.actionType.toUpperCase()}
Description: ${t.description}`;
      })
      .join("\n\n");
  }
}
