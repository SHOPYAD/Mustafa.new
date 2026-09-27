/**
 * Three-Branch Knowledge Graph & Warm Profile Engine
 * Lonaliza Sovereign Cyber Operating System (JARVIS-Core)
 *
 * Implements the 3-Branch Sovereign Graph:
 * 1. [USER BRANCH]: Executive identity, preferences, language, security clearance
 * 2. [DIRECTIVES BRANCH]: Active strategic rules, swarm constraints, approval thresholds
 * 3. [WORLD BRANCH]: Grounded platform KPIs, Redis queues, exchange rates, live provider health
 */

export interface UserBranchNode {
  operatorId: string;
  role: "SUPER_ADMIN" | "OPERATIONS_DIRECTOR" | "FINANCIAL_OFFICER";
  preferredLocale: "ar" | "tr" | "en" | "fr";
  voiceResponseSpeed: number; // 0.8 to 1.3
  securityClearance: "LEVEL_5_SOVEREIGN";
}

export interface DirectivesBranchNode {
  activeDirectiveCount: number;
  criticalRules: string[];
  autoExecuteBelowUsd: number;
  adversarialCriticEnabled: boolean;
}

export interface WorldBranchNode {
  platformStatus: "OPTIMAL" | "DEGRADED" | "CRITICAL";
  activeCurrencies: Record<string, number>;
  liveKpiSummary: {
    activeHotels: number;
    activeFlights: number;
    dailyVolumeUsd: number;
    openTickets: number;
  };
  connectedProviders: string[];
}

export interface WarmProfilePayload {
  timestamp: string;
  userBranch: UserBranchNode;
  directivesBranch: DirectivesBranchNode;
  worldBranch: WorldBranchNode;
  synthesizedPromptContext: string;
}

export class ThreeBranchGraph {
  private static userBranchState: UserBranchNode = {
    operatorId: "USR_SOVEREIGN_MASTER_01",
    role: "SUPER_ADMIN",
    preferredLocale: "ar",
    voiceResponseSpeed: 1.05,
    securityClearance: "LEVEL_5_SOVEREIGN",
  };

  private static directivesBranchState: DirectivesBranchNode = {
    activeDirectiveCount: 3,
    criticalRules: [
      "Zero cartoon emojis in all customer and admin touchpoints.",
      "Never execute booking mutations over $500 without explicit executive confirmation.",
      "Enforce BedBanks and Seeru live price parity across hotel inventory.",
    ],
    autoExecuteBelowUsd: 250,
    adversarialCriticEnabled: true,
  };

  private static worldBranchState: WorldBranchNode = {
    platformStatus: "OPTIMAL",
    activeCurrencies: {
      USD: 1.0,
      EUR: 0.92,
      SAR: 3.75,
      TRY: 34.2,
    },
    liveKpiSummary: {
      activeHotels: 4120,
      activeFlights: 680,
      dailyVolumeUsd: 142850,
      openTickets: 4,
    },
    connectedProviders: ["Amadeus GDS", "PKFare", "BedBanks", "Hotelbeds", "Seeru", "Iyzico", "Stripe"],
  };

  /**
   * Updates executive preferences in the User Branch
   */
  public static updateUserBranch(patch: Partial<UserBranchNode>): void {
    this.userBranchState = { ...this.userBranchState, ...patch };
  }

  /**
   * Updates active directives in the Directives Branch
   */
  public static updateDirectivesBranch(patch: Partial<DirectivesBranchNode>): void {
    this.directivesBranchState = { ...this.directivesBranchState, ...patch };
  }

  /**
   * Updates live grounded metrics in the World Branch
   */
  public static updateWorldBranch(patch: Partial<WorldBranchNode>): void {
    this.worldBranchState = { ...this.worldBranchState, ...patch };
  }

  /**
   * Generates a zero-latency synthesized Warm Profile for Master AI prompt injection
   */
  public static getWarmProfile(locale = "ar"): WarmProfilePayload {
    const user = this.userBranchState;
    const directives = this.directivesBranchState;
    const world = this.worldBranchState;

    const isArabic = locale === "ar";
    const isTurkish = locale === "tr";

    let contextText = "";

    if (isArabic) {
      contextText = `[الملف المعرفي الدافئ ثلاثي الفروع - SOVEREIGN THREE-BRANCH PROFILE]
• فرع المشغل: الهوية ${user.operatorId} | الدور: ${user.role} | الصلاحية: ${user.securityClearance}
• فرع التوجيهات: ${directives.activeDirectiveCount} توجيهات نشطة | القواعد الصارمة: ${directives.criticalRules.join(" | ")}
• فرع العالم الحي: حالة المنصة: ${world.platformStatus} | الفنادق النشطة: ${world.liveKpiSummary.activeHotels} | الطيران: ${world.liveKpiSummary.activeFlights} | حجم التداول اليومي: $${world.liveKpiSummary.dailyVolumeUsd.toLocaleString()} | المزودون: ${world.connectedProviders.slice(0, 4).join(", ")}`;
    } else if (isTurkish) {
      contextText = `[ÜÇ KOLLU EGEMEN BİLGİ PROFİLİ - SOVEREIGN THREE-BRANCH PROFILE]
• Kullanıcı Kolu: ${user.operatorId} | Rol: ${user.role} | Güvenlik Düzeyi: ${user.securityClearance}
• Yönergeler Kolu: ${directives.activeDirectiveCount} aktif yönerge | Kurallar: ${directives.criticalRules.join(" | ")}
• Canlı Dünya Kolu: Platform Durumu: ${world.platformStatus} | Aktif Oteller: ${world.liveKpiSummary.activeHotels} | Aktif Uçuşlar: ${world.liveKpiSummary.activeFlights} | Günlük Hacim: $${world.liveKpiSummary.dailyVolumeUsd.toLocaleString()}`;
    } else {
      contextText = `[SOVEREIGN THREE-BRANCH WARM PROFILE]
• USER BRANCH: Operator ${user.operatorId} | Role: ${user.role} | Clearance: ${user.securityClearance}
• DIRECTIVES BRANCH: ${directives.activeDirectiveCount} active directives | Critical constraints: ${directives.criticalRules.join(" | ")}
• WORLD BRANCH: Platform: ${world.platformStatus} | Active Hotels: ${world.liveKpiSummary.activeHotels} | Flights: ${world.liveKpiSummary.activeFlights} | Daily GMV: $${world.liveKpiSummary.dailyVolumeUsd.toLocaleString()} | Providers: ${world.connectedProviders.slice(0, 4).join(", ")}`;
    }

    return {
      timestamp: new Date().toISOString(),
      userBranch: user,
      directivesBranch: directives,
      worldBranch: world,
      synthesizedPromptContext: contextText,
    };
  }

  /**
   * Persists knowledge points to Qdrant vector memory asynchronously
   */
  public static async persistToQdrant(text: string, branch: "user" | "directives" | "world"): Promise<boolean> {
    if (typeof window !== "undefined") {
      try {
        await fetch("/api/admin/automation/second-brain-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch, content: text }),
        });
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }
}
