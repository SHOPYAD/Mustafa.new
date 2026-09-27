export type SiteCurrency = {
  code: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  nameTr: string;
  flag: string;
  enabled: boolean;
};

export type CurrenciesSettings = {
  defaultCode: string;
  liveFxEnabled: boolean;
  currencies: SiteCurrency[];
};

export type PublicFxCurrency = SiteCurrency & {
  rate: number;
};

export type PublicFxPayload = {
  ok: boolean;
  base: string;
  defaultCode: string;
  liveFxEnabled: boolean;
  currencies: PublicFxCurrency[];
  source: string;
  at: string;
  stale: boolean;
  error?: string;
};

export type AdminFxStatus = {
  liveFxEnabled: boolean;
  source: string;
  at: string;
  stale: boolean;
  error?: string;
  rates: Record<string, number>;
  missingRates: string[];
};
