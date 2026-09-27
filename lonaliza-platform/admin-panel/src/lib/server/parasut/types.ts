export type ParasutEnvironment = "production" | "sandbox";

export interface ParasutConfig {
  enabled: boolean;
  companyId: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  environment: ParasutEnvironment;
  defaultProductId?: string;
  vatExemptionReasonCode?: string; // Default: "302"
  vatExemptionReason?: string; // Default: "3065 sayili KDVK 11/1-a ve 12/2 maddeleri uyarinca Hizmet Ihracati"
  note?: string; // Default: "Hizmet yurt disinda ifa edilmis ve yurt disinda yararlanilmistir. KDV kapsami disindadir."
}

export type MaskedParasutConfig = Omit<ParasutConfig, "clientSecret" | "password"> & {
  hasClientSecret: boolean;
  hasPassword: boolean;
  clientSecretMasked?: string;
};

export interface ParasutTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  created_at?: number;
}

export interface ParasutCustomerInput {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  district?: string;
  address?: string;
  taxNumber?: string;
  taxOffice?: string;
  isAbroad?: boolean;
}

export interface ParasutInvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // usually 0 for international tourism service export
  discountType?: "percentage" | "amount";
  discountValue?: number;
  productId?: string;
}

export interface ParasutCreateInvoiceInput {
  contactId: string;
  pnr: string;
  description: string;
  issueDate?: string;
  dueDate?: string;
  currency: string;
  exchangeRate?: number;
  isAbroad?: boolean;
  items: ParasutInvoiceItemInput[];
}

export interface ParasutInvoiceRecord {
  id: string; // our internal id or bookingId
  bookingId: string;
  salesInvoiceId: string;
  eArchiveId?: string;
  invoiceNo?: string; // e.g. "EAR2026000000142"
  ettn?: string; // UUID e.g. "a1b2c3d4-..."
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  serviceType: string;
  status: "draft" | "queued" | "signed" | "error";
  gibStatus?: string;
  issuedAt: string;
  pdfAvailable: boolean;
  pdfPath?: string;
  errorMessage?: string;
}
