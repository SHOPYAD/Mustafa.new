export type ScraperJobStatus = "pending" | "working" | "ok" | "failed" | "cancelled";

export type ScraperJob = {
  id: string;
  name: string;
  keywords: string[];
  city: string;
  country: string;
  lat: string;
  lon: string;
  depth: number;
  emailEnabled: boolean;
  socialsEnabled: boolean;
  radius: number;
  status: ScraperJobStatus;
  progressPercent?: number;
  totalFound: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export type OutreachStatus =
  | "new"
  | "contacted_whatsapp"
  | "contacted_email"
  | "qualified"
  | "meeting_booked"
  | "unresponsive"
  | "converted"
  | "archived";

export type ScrapedBusinessLead = {
  id: string;
  jobId: string;
  title: string;
  category: string;
  address: string;
  completeAddress?: string;
  city: string;
  country: string;
  phone: string;
  whatsappPhone: string; // E.164 clean digits format
  hasWhatsapp: boolean;
  email: string;
  emailsList: string[];
  website: string;
  reviewRating: number;
  reviewCount: number;
  placeId: string;
  cid?: string;
  latitude?: string;
  longitude?: string;
  thumbnail?: string;
  images?: string[];
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  outreachStatus: OutreachStatus;
  lastContactedAt?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateScraperJobInput = {
  keywords: string[];
  city: string;
  country?: string;
  lat?: string;
  lon?: string;
  depth?: number;
  email?: boolean;
  socials?: boolean;
  radius?: number;
  maxTimeSeconds?: number;
  proxies?: string[];
};

export type B2BMarketingTemplate = {
  id: string;
  channel: "whatsapp" | "email";
  category: "whitelabel" | "hotel_engine" | "flight_engine" | "ai_agents" | "demo_invitation" | "followup" | "custom";
  title: string;
  subject?: string; // For emails
  body: string;
  htmlBody?: string; // For rich emails
  variables: string[]; // e.g. ["company_name", "city", "demo_url", "sales_name"]
  isAiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type B2BCampaignStatus = "draft" | "queued" | "sending" | "completed" | "paused" | "failed";

export type B2BCampaign = {
  id: string;
  title: string;
  channel: "whatsapp" | "email";
  templateId: string;
  targetLeadIds: string[];
  status: B2BCampaignStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  logs: {
    leadId: string;
    target: string;
    status: "sent" | "failed";
    timestamp: string;
    error?: string;
  }[];
  jitterMinSeconds: number;
  jitterMaxSeconds: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type LeadsFilterOptions = {
  search?: string;
  country?: string;
  city?: string;
  category?: string;
  minRating?: number;
  hasPhone?: boolean;
  hasWhatsapp?: boolean;
  hasEmail?: boolean;
  hasWebsite?: boolean;
  hasSocials?: boolean;
  outreachStatus?: OutreachStatus;
  jobId?: string;
  limit?: number;
  offset?: number;
};
