/**
 * Country reference table used by the payment-gateway catalog.
 *
 * Scoped to the countries that any of our integrated gateways supports
 * (Turkey, MENA, GCC, Africa, CIS, LatAm, Asia, plus the major Western markets).
 *
 * Add a country here BEFORE marking it as supported in any adapter.
 */

export type Region =
  | 'Europe'
  | 'MENA'
  | 'GCC'
  | 'Africa'
  | 'CIS'
  | 'Asia'
  | 'SouthEastAsia'
  | 'LatinAmerica'
  | 'NorthAmerica'
  | 'Oceania'
  | 'Global';

export interface CountryInfo {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  /** Localised English name. */
  name: string;
  /** Default ISO 4217 currency for the country. */
  currency: string;
  region: Region;
  /** International dial prefix (no leading +). Useful for phone validators. */
  dialCode?: string;
  /** Emoji flag for UI rendering. */
  flag?: string;
}

const c = (
  code: string,
  name: string,
  currency: string,
  region: Region,
  dialCode?: string,
  flag?: string,
): CountryInfo => ({ code, name, currency, region, dialCode, flag });

export const COUNTRIES: readonly CountryInfo[] = Object.freeze([
  // MENA / GCC
  c('AE', 'United Arab Emirates', 'AED', 'GCC', '971', '🇦🇪'),
  c('SA', 'Saudi Arabia', 'SAR', 'GCC', '966', '🇸🇦'),
  c('KW', 'Kuwait', 'KWD', 'GCC', '965', '🇰🇼'),
  c('QA', 'Qatar', 'QAR', 'GCC', '974', '🇶🇦'),
  c('BH', 'Bahrain', 'BHD', 'GCC', '973', '🇧🇭'),
  c('OM', 'Oman', 'OMR', 'GCC', '968', '🇴🇲'),
  c('EG', 'Egypt', 'EGP', 'MENA', '20', '🇪🇬'),
  c('JO', 'Jordan', 'JOD', 'MENA', '962', '🇯🇴'),
  c('LB', 'Lebanon', 'LBP', 'MENA', '961', '🇱🇧'),
  c('IQ', 'Iraq', 'IQD', 'MENA', '964', '🇮🇶'),
  c('PS', 'Palestine', 'ILS', 'MENA', '970', '🇵🇸'),
  c('YE', 'Yemen', 'YER', 'MENA', '967', '🇾🇪'),
  c('SY', 'Syria', 'SYP', 'MENA', '963', '🇸🇾'),
  c('LY', 'Libya', 'LYD', 'MENA', '218', '🇱🇾'),
  c('SD', 'Sudan', 'SDG', 'MENA', '249', '🇸🇩'),
  c('TN', 'Tunisia', 'TND', 'MENA', '216', '🇹🇳'),
  c('DZ', 'Algeria', 'DZD', 'MENA', '213', '🇩🇿'),
  c('MA', 'Morocco', 'MAD', 'MENA', '212', '🇲🇦'),
  c('IL', 'Israel', 'ILS', 'MENA', '972', '🇮🇱'),

  // Turkey
  c('TR', 'Türkiye', 'TRY', 'Europe', '90', '🇹🇷'),

  // Africa (sub-Saharan)
  c('NG', 'Nigeria', 'NGN', 'Africa', '234', '🇳🇬'),
  c('KE', 'Kenya', 'KES', 'Africa', '254', '🇰🇪'),
  c('GH', 'Ghana', 'GHS', 'Africa', '233', '🇬🇭'),
  c('ZA', 'South Africa', 'ZAR', 'Africa', '27', '🇿🇦'),
  c('CI', "Côte d'Ivoire", 'XOF', 'Africa', '225', '🇨🇮'),
  c('SN', 'Senegal', 'XOF', 'Africa', '221', '🇸🇳'),
  c('CM', 'Cameroon', 'XAF', 'Africa', '237', '🇨🇲'),
  c('BJ', 'Benin', 'XOF', 'Africa', '229', '🇧🇯'),
  c('TG', 'Togo', 'XOF', 'Africa', '228', '🇹🇬'),
  c('BF', 'Burkina Faso', 'XOF', 'Africa', '226', '🇧🇫'),
  c('NE', 'Niger', 'XOF', 'Africa', '227', '🇳🇪'),

  // CIS / Eastern Europe
  c('RU', 'Russia', 'RUB', 'CIS', '7', '🇷🇺'),
  c('UA', 'Ukraine', 'UAH', 'CIS', '380', '🇺🇦'),
  c('BY', 'Belarus', 'BYN', 'CIS', '375', '🇧🇾'),
  c('KZ', 'Kazakhstan', 'KZT', 'CIS', '7', '🇰🇿'),
  c('UZ', 'Uzbekistan', 'UZS', 'CIS', '998', '🇺🇿'),
  c('KG', 'Kyrgyzstan', 'KGS', 'CIS', '996', '🇰🇬'),
  c('TJ', 'Tajikistan', 'TJS', 'CIS', '992', '🇹🇯'),
  c('AZ', 'Azerbaijan', 'AZN', 'CIS', '994', '🇦🇿'),
  c('AM', 'Armenia', 'AMD', 'CIS', '374', '🇦🇲'),
  c('GE', 'Georgia', 'GEL', 'CIS', '995', '🇬🇪'),
  c('MD', 'Moldova', 'MDL', 'CIS', '373', '🇲🇩'),

  // Asia
  c('IR', 'Iran', 'IRR', 'Asia', '98', '🇮🇷'),
  c('PK', 'Pakistan', 'PKR', 'Asia', '92', '🇵🇰'),
  c('AF', 'Afghanistan', 'AFN', 'Asia', '93', '🇦🇫'),

  // South-East Asia
  c('ID', 'Indonesia', 'IDR', 'SouthEastAsia', '62', '🇮🇩'),
  c('MY', 'Malaysia', 'MYR', 'SouthEastAsia', '60', '🇲🇾'),
  c('PH', 'Philippines', 'PHP', 'SouthEastAsia', '63', '🇵🇭'),
  c('TH', 'Thailand', 'THB', 'SouthEastAsia', '66', '🇹🇭'),
  c('VN', 'Vietnam', 'VND', 'SouthEastAsia', '84', '🇻🇳'),
  c('SG', 'Singapore', 'SGD', 'SouthEastAsia', '65', '🇸🇬'),
  c('HK', 'Hong Kong', 'HKD', 'Asia', '852', '🇭🇰'),
  c('JP', 'Japan', 'JPY', 'Asia', '81', '🇯🇵'),
  c('KR', 'South Korea', 'KRW', 'Asia', '82', '🇰🇷'),
  c('CN', 'China', 'CNY', 'Asia', '86', '🇨🇳'),
  c('TW', 'Taiwan', 'TWD', 'Asia', '886', '🇹🇼'),

  // Europe (Western & Central)
  c('GB', 'United Kingdom', 'GBP', 'Europe', '44', '🇬🇧'),
  c('IE', 'Ireland', 'EUR', 'Europe', '353', '🇮🇪'),
  c('DE', 'Germany', 'EUR', 'Europe', '49', '🇩🇪'),
  c('FR', 'France', 'EUR', 'Europe', '33', '🇫🇷'),
  c('ES', 'Spain', 'EUR', 'Europe', '34', '🇪🇸'),
  c('IT', 'Italy', 'EUR', 'Europe', '39', '🇮🇹'),
  c('NL', 'Netherlands', 'EUR', 'Europe', '31', '🇳🇱'),
  c('BE', 'Belgium', 'EUR', 'Europe', '32', '🇧🇪'),
  c('PT', 'Portugal', 'EUR', 'Europe', '351', '🇵🇹'),
  c('AT', 'Austria', 'EUR', 'Europe', '43', '🇦🇹'),
  c('GR', 'Greece', 'EUR', 'Europe', '30', '🇬🇷'),
  c('PL', 'Poland', 'PLN', 'Europe', '48', '🇵🇱'),
  c('CH', 'Switzerland', 'CHF', 'Europe', '41', '🇨🇭'),
  c('SE', 'Sweden', 'SEK', 'Europe', '46', '🇸🇪'),
  c('NO', 'Norway', 'NOK', 'Europe', '47', '🇳🇴'),
  c('DK', 'Denmark', 'DKK', 'Europe', '45', '🇩🇰'),
  c('FI', 'Finland', 'EUR', 'Europe', '358', '🇫🇮'),
  c('CZ', 'Czechia', 'CZK', 'Europe', '420', '🇨🇿'),
  c('RO', 'Romania', 'RON', 'Europe', '40', '🇷🇴'),
  c('HU', 'Hungary', 'HUF', 'Europe', '36', '🇭🇺'),

  // North America
  c('US', 'United States', 'USD', 'NorthAmerica', '1', '🇺🇸'),
  c('CA', 'Canada', 'CAD', 'NorthAmerica', '1', '🇨🇦'),
  c('MX', 'Mexico', 'MXN', 'NorthAmerica', '52', '🇲🇽'),

  // Latin America
  c('BR', 'Brazil', 'BRL', 'LatinAmerica', '55', '🇧🇷'),
  c('AR', 'Argentina', 'ARS', 'LatinAmerica', '54', '🇦🇷'),
  c('CL', 'Chile', 'CLP', 'LatinAmerica', '56', '🇨🇱'),
  c('CO', 'Colombia', 'COP', 'LatinAmerica', '57', '🇨🇴'),
  c('PE', 'Peru', 'PEN', 'LatinAmerica', '51', '🇵🇪'),
  c('UY', 'Uruguay', 'UYU', 'LatinAmerica', '598', '🇺🇾'),
  c('EC', 'Ecuador', 'USD', 'LatinAmerica', '593', '🇪🇨'),

  // Oceania
  c('AU', 'Australia', 'AUD', 'Oceania', '61', '🇦🇺'),
  c('NZ', 'New Zealand', 'NZD', 'Oceania', '64', '🇳🇿'),
]);

const COUNTRY_BY_CODE: ReadonlyMap<string, CountryInfo> = new Map(
  COUNTRIES.map((c0) => [c0.code, c0]),
);

export function getCountry(code: string): CountryInfo | undefined {
  return COUNTRY_BY_CODE.get(code.toUpperCase());
}

export function getCountriesByRegion(region: Region): CountryInfo[] {
  return COUNTRIES.filter((c0) => c0.region === region);
}

export function getCountryName(code: string): string {
  return getCountry(code)?.name ?? code;
}

export function isKnownCountry(code: string): boolean {
  return COUNTRY_BY_CODE.has(code.toUpperCase());
}

/** Convenience grouping for the catalog UI (region → countries). */
export function getCountriesGroupedByRegion(): Record<Region, CountryInfo[]> {
  const out = {} as Record<Region, CountryInfo[]>;
  for (const country of COUNTRIES) {
    if (!out[country.region]) out[country.region] = [];
    out[country.region].push(country);
  }
  return out;
}
