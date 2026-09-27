import { getCountry } from './core/countries';
import { GatewayRegistry, type GatewayMeta } from './core/GatewayRegistry';
import type { GatewayConfigField, GatewayType } from './core/types';

/**
 * Public catalog of payment gateways.
 *
 * Combines:
 *   - Runtime data from `GatewayRegistry` (kind, supported countries/currencies, configFields)
 *   - Static "marketing" metadata declared here (logo, brand colour, descriptions)
 */

export interface MarketingMeta {
  /** Public-facing label shown on the card. May differ from `displayName`. */
  brandLabel?: string;
  /** Short single-sentence pitch shown in the catalogue. */
  description?: string;
  /** Path under `/static/payment-gateways/` (PNG or SVG). */
  logoPath?: string;
  /** Hex colour for card accents / brand background. */
  brandColor?: string;
  /** Provider's marketing site. */
  websiteUrl?: string;
  /** Link to the integration docs (used by the "Help" button on the card). */
  docsUrl?: string;
  /** Optional badges shown on the card: 'recommended', 'new', 'popular'. */
  badges?: ReadonlyArray<'recommended' | 'new' | 'popular' | 'beta'>;
  /** Whether the gateway can settle into another tenant's bank account (Stripe Connect-like). */
  supportsConnectedAccounts?: boolean;
  /** Whether this gateway can be used to charge tenants for SaaS subscriptions. */
  platformBillingEligible?: boolean;
}

const MARKETING: Record<string, MarketingMeta> = {};

/** Adapters can self-register marketing metadata (e.g. inside their module file). */
export function registerMarketing(kind: string, meta: MarketingMeta): void {
  MARKETING[kind] = { ...(MARKETING[kind] || {}), ...meta };
}

export interface CatalogEntry {
  kind: string;
  displayName: string;
  type: GatewayType;
  supportedCountries: readonly string[];
  /** Same as supportedCountries but resolved to `{ code, name, flag }` for UI. */
  supportedCountriesResolved: Array<{ code: string; name: string; flag?: string }>;
  supportedCurrencies: readonly string[];
  configFields: readonly GatewayConfigField[];
  marketing: MarketingMeta;
  region?: { id: string; nameAr: string; nameEn: string; icon: string };
}

export const GATEWAY_REGIONS: Record<string, { id: string; nameAr: string; nameEn: string; icon: string }> = {
  // Turkey
  iyzico: { id: "turkey", nameAr: "تركيا", nameEn: "Turkey", icon: "🇹🇷" },
  paytr: { id: "turkey", nameAr: "تركيا", nameEn: "Turkey", icon: "🇹🇷" },
  shopier: { id: "turkey", nameAr: "تركيا", nameEn: "Turkey", icon: "🇹🇷" },
  paynkolay: { id: "turkey", nameAr: "تركيا", nameEn: "Turkey", icon: "🇹🇷" },
  paywant: { id: "turkey", nameAr: "تركيا", nameEn: "Turkey", icon: "🇹🇷" },
  paynettr: { id: "turkey", nameAr: "تركيا", nameEn: "Turkey", icon: "🇹🇷" },
  
  // MENA
  moyasar: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇸🇦" },
  paytabs: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇸🇦" },
  tamara: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇸🇦" },
  tabby: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇦🇪" },
  paymob: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇪🇬" },
  urway: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇸🇦" },
  noonpayments: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇦🇪" },
  yallapay: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇦🇪" },
  epoint: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇦🇿" },
  payriff: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇦🇿" },
  cardcom: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇮🇱" },
  youcanpay: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇲🇦" },
  konnect: { id: "mena", nameAr: "الشرق الأوسط", nameEn: "MENA", icon: "🇹🇳" },

  // Global
  stripe: { id: "global", nameAr: "عالمية", nameEn: "Global", icon: "🌍" },
  paypal: { id: "global", nameAr: "عالمية", nameEn: "Global", icon: "🌍" },
  checkout: { id: "global", nameAr: "عالمية", nameEn: "Global", icon: "🌍" },
  amazonPay: { id: "global", nameAr: "عالمية", nameEn: "Global", icon: "🌍" },
  payoneer: { id: "global", nameAr: "عالمية", nameEn: "Global", icon: "🌍" },
  twocheckout: { id: "global", nameAr: "عالمية", nameEn: "Global", icon: "🌍" },
  paymentwall: { id: "global", nameAr: "عالمية", nameEn: "Global", icon: "🌍" },
  payssion: { id: "global", nameAr: "عالمية", nameEn: "Global", icon: "🌍" },

  // Asia
  midtrans: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇮🇩" },
  xendit: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🌏" },
  toyyibpay: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇲🇾" },
  tripay: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇮🇩" },
  doku: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇮🇩" },
  billplz: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇲🇾" },
  senangpay: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇲🇾" },
  paymaya: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇵🇭" },
  omise: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇹🇭" },
  payme_vn: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇻🇳" },
  "payme-vn": { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇻🇳" },
  zarinpal: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇮🇷" },
  paycom: { id: "asia", nameAr: "آسيا", nameEn: "Asia", icon: "🇺🇿" },

  // Crypto
  cryptomus: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  nowpayments: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  coinpayments: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  coingate: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  bitpay: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  coinbase_commerce: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  "coinbase-commerce": { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  plisio: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  anypay: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  perfectmoney: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },
  volet: { id: "crypto", nameAr: "عملات رقمية", nameEn: "Crypto", icon: "🪙" },

  // CIS
  yookassa: { id: "cis", nameAr: "رابطة CIS وروسيا", nameEn: "CIS & Russia", icon: "🇷🇺" },
  freekassa: { id: "cis", nameAr: "رابطة CIS وروسيا", nameEn: "CIS & Russia", icon: "🇷🇺" },
  unitpay: { id: "cis", nameAr: "رابطة CIS وروسيا", nameEn: "CIS & Russia", icon: "🇷🇺" },
  payeer: { id: "cis", nameAr: "رابطة CIS وروسيا", nameEn: "CIS & Russia", icon: "🇷🇺" },

  // Africa
  fedapay: { id: "africa", nameAr: "أفريقيا", nameEn: "Africa", icon: "🌍" },
  payspace: { id: "africa", nameAr: "أفريقيا", nameEn: "Africa", icon: "🇿🇦" },
  primepayments: { id: "africa", nameAr: "أفريقيا", nameEn: "Africa", icon: "🌍" },

  // LATAM
  payu_latam: { id: "latam", nameAr: "أمريكا اللاتينية", nameEn: "Latin America", icon: "🌎" },
  "payu-latam": { id: "latam", nameAr: "أمريكا اللاتينية", nameEn: "Latin America", icon: "🌎" },
};

export interface CatalogFilter {
  /** ISO 3166-1 alpha-2 country code. Returns gateways serving that country. */
  country?: string;
  type?: GatewayType;
  /** Restrict to gateways the tenant's plan grants. */
  allowedKinds?: readonly string[];
}

function entryForMeta(meta: GatewayMeta): CatalogEntry {
  const marketing = MARKETING[meta.kind] || {};
  const supportedCountriesResolved = meta.supportedCountries.includes('*')
    ? [{ code: '*', name: 'Global', flag: '🌍' }]
    : meta.supportedCountries.map((code) => {
        const c = getCountry(code);
        return c
          ? { code: c.code, name: c.name, flag: c.flag }
          : { code, name: code };
      });
  return {
    kind: meta.kind,
    displayName: meta.displayName,
    type: meta.type,
    supportedCountries: meta.supportedCountries,
    supportedCountriesResolved,
    supportedCurrencies: meta.supportedCurrencies,
    configFields: meta.configFields,
    marketing,
    region: GATEWAY_REGIONS[meta.kind] || { id: "other", nameAr: "أخرى", nameEn: "Other", icon: "🌐" },
  };
}

/**
 * Return the full catalog, optionally filtered.
 *
 * Filter precedence: allowedKinds > country/type.
 */
export function getCatalog(filter: CatalogFilter = {}): CatalogEntry[] {
  let entries = GatewayRegistry.list();

  if (filter.allowedKinds && filter.allowedKinds.length > 0) {
    const allowed = new Set(filter.allowedKinds);
    entries = entries.filter((m) => allowed.has(m.kind));
  }

  if (filter.type) {
    entries = entries.filter((m) => m.type === filter.type);
  }

  if (filter.country) {
    const code = filter.country.toUpperCase();
    entries = entries.filter(
      (m) => m.supportedCountries.includes('*') || m.supportedCountries.includes(code),
    );
  }

  return entries.map(entryForMeta);
}

export function getCatalogEntry(kind: string): CatalogEntry | undefined {
  const meta = GatewayRegistry.list().find((m) => m.kind === kind);
  return meta ? entryForMeta(meta) : undefined;
}

/** Catalog restricted to gateways suitable for billing tenants (platform-side). */
export function getPlatformBillingCatalog(): CatalogEntry[] {
  return getCatalog().filter((e) => e.marketing.platformBillingEligible === true);
}
