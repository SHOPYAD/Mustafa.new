export type MetaObject = {
  id?: string;
  update?: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
  getInsights?: (
    fields: string[],
    params: Record<string, unknown>
  ) => Promise<Array<Record<string, unknown>>>;
};

export type MetaAdAccount = {
  createCampaign: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
  createAdSet: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
  createAdCreative: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
  createAd: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
  getInsights?: (
    fields: string[],
    params: Record<string, unknown>
  ) => Promise<Array<Record<string, unknown>>>;
};

export type MetaSdk = {
  FacebookAdsApi: { init: (token: string) => unknown };
  AdAccount: new (id: string) => MetaAdAccount;
  Campaign: new (id: string) => MetaObject;
  AdSet: new (id: string) => MetaObject;
  Ad: new (id: string) => MetaObject;
};

export async function loadMetaSdk(): Promise<MetaSdk> {
  const mod = (await import("facebook-nodejs-business-sdk")) as MetaSdk & {
    default?: MetaSdk;
  };
  return mod.default ?? mod;
}

export function metaActId(adAccountId: string): string {
  const id = String(adAccountId || "").replace(/^act_/i, "").trim();
  return `act_${id}`;
}
