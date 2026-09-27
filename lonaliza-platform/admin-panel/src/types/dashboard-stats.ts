export type DashboardDayPoint = {
  date: string;
  count: number;
};

export type DashboardNamedCount = {
  key: string;
  count: number;
};

export type DashboardRecentBooking = {
  id: string;
  name: string;
  service: string;
  type: string;
  status: string;
  createdAt: string;
};

export type DashboardQuotaSnap = {
  provider: string;
  monthKey: string;
  liveCalls: number;
  success: number;
  failed: number;
  quota429: number;
  headerLimit: number | null;
  headerRemaining: number | null;
  headerReset: string | null;
  lastCallAt: string | null;
  changeKey: boolean;
};

export type DashboardCurrencyTotal = {
  currency: string;
  paid: number;
  refunded: number;
};

export type DashboardEconomicsRow = {
  key: string;
  costUsd: number;
  profitUsd: number;
  paidUsd: number;
  bookings: number;
};

export type DashboardMoneyDay = {
  date: string;
  cost: number;
  profit: number;
  paid: number;
};

export type DashboardAffiliateStats = {
  available: boolean;
  marketers: number;
  visits: number;
  conversions: number;
  earningsPaidUsd: number;
  earningsPendingUsd: number;
};

export type DashboardLoyaltyStats = {
  available: boolean;
  pointsIssued: number;
  pointsRedeemed: number;
  pointsUsd: number;
  walletBalance: number;
  pendingPoints: number;
  wallets: number;
};

export type DashboardCouponStats = {
  available: boolean;
  created: number;
  used: number;
  discountUsd: number;
  byService: DashboardNamedCount[];
};

export type DashboardEconomicsStats = {
  available: boolean;
  estimated: boolean;
  costUsd: number;
  profitUsd: number;
  paidUsd: number;
  hotelMarkupProfitUsd: number;
  flightMarkupProfitUsd: number;
  byService: DashboardEconomicsRow[];
  last14Days: DashboardMoneyDay[];
};

export type DashboardStats = {
  pocketbase: boolean;
  generatedAt: string;
  bookings: {
    total: number;
    enquiries: number;
    hotelBookings: number;
    byStatus: DashboardNamedCount[];
    byType: DashboardNamedCount[];
    last14Days: DashboardDayPoint[];
    recent: DashboardRecentBooking[];
  };
  customers: { total: number };
  payments: {
    records: number;
    paid: number;
    pending: number;
    refunded: number;
    other: number;
    totalsByCurrency: DashboardCurrencyTotal[];
    available: boolean;
  };
  services: {
    cars: { total: number; active: number };
    pages: { total: number };
    ownedHotels: number;
  };
  gemini: {
    date: string;
    freeCount: number;
    paidCount: number;
    freeLimit: number;
    paidLimit: number;
  };
  providers: {
    booking: DashboardQuotaSnap;
    travel_advisor: DashboardQuotaSnap;
    sky_scrapper: DashboardQuotaSnap;
  };
  traffic: {
    source: "admin_notifications.visit";
    available: boolean;
    sampled: number;
    total: number;
    uniqueSessions: number;
    uniqueIps: number;
    topPages: DashboardNamedCount[];
    last14Days: DashboardDayPoint[];
    countriesAvailable: boolean;
    devicesAvailable: boolean;
    devices: DashboardNamedCount[];
    countries: DashboardNamedCount[];
  };
  affiliate: DashboardAffiliateStats;
  loyalty: DashboardLoyaltyStats;
  coupons: DashboardCouponStats;
  economics: DashboardEconomicsStats;
  automation?: {
    swarmAgents: number;
    activeTasks: number;
    totalTriggers: number;
    savedHours: number;
    successRate: number;
    aiConversations: number;
    aiPrograms: number;
  };
  ads?: {
    totalSpendUsd: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    roas: number;
  };
  social?: {
    publishedPosts: number;
    scheduledPosts: number;
    channelsCount: number;
    totalReach: number;
    engagementRate: number;
  };
  community?: {
    reviewsCount: number;
    avgRating: number;
    articlesCount: number;
    leadsCount: number;
  };
  b2b?: {
    companiesCount: number;
    ordersCount: number;
    licensesCount: number;
    totalDepositsUsd: number;
    totalWholesaleUsd: number;
  };
  comms?: {
    whatsappActive: boolean;
    emailTemplatesCount: number;
    messagesSent: number;
    avgResponseSeconds: number;
  };
  finance?: {
    workingCapitalUsd: number;
    capitalTurnover: number;
    markupAverages: Record<string, number>;
  };
};
