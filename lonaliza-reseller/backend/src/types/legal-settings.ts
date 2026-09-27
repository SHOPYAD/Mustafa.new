export type LegalCompanyIdentity = {
  companyNameAr: string;
  companyNameEn: string;
  companyNameTr: string;
  companyNameFr: string;
  brandName: string;
  officialAddressAr: string;
  officialAddressEn: string;
  officialAddressTr: string;
  officialAddressFr: string;
  officialEmail: string;
  officialPhone: string;
  dpoEmail: string;
  dpoHotline: string;
  tursabLicenseNumber: string;
  taxNumber: string;
  chamberOfCommerce: string;
  jurisdictionCityAr: string;
  jurisdictionCityEn: string;
  jurisdictionCityTr: string;
  jurisdictionCityFr: string;
  lastUpdated: string;
  policyVersion: string;
};

export type LegalDocTarget = "terms" | "privacy" | "gdpr";

export type LegalCustomClause = {
  id: string;
  targetDoc: LegalDocTarget;
  sectionKey: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  titleFr: string;
  contentAr: string;
  contentEn: string;
  contentTr: string;
  contentFr: string;
  badge?: string;
  order: number;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type GdprRetentionPolicy = {
  retentionPeriodDays: number; // e.g. 30 days
  allowImmediatePurge: boolean;
  autoPurgeAfterDays: boolean;
  notifyDpoOnRequest: boolean;
  retentionNoticeAr: string;
  retentionNoticeEn: string;
  retentionNoticeTr: string;
  retentionNoticeFr: string;
};

export type DeletionRequestStatus =
  | "pending_purge"
  | "retained"
  | "purged"
  | "restored";

export type AccountDeletionRequest = {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  reason: string;
  requestedAt: string;
  retentionExpiresAt: string;
  status: DeletionRequestStatus;
  adminNotes?: string;
  purgedAt?: string;
  retentionDaysSet?: number;
};

export type LegalSettingsPayload = {
  identity: LegalCompanyIdentity;
  clauses: LegalCustomClause[];
  retention: GdprRetentionPolicy;
  updatedAt: string;
};
