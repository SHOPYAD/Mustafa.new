declare module "facebook-nodejs-business-sdk" {
  const sdk: {
    FacebookAdsApi: { init: (token: string) => unknown };
    AdAccount: new (id: string) => {
      createCampaign: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
      createAdSet: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
      createAdCreative: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
      createAd: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
      getInsights?: (
        fields: string[],
        params: Record<string, unknown>
      ) => Promise<Array<Record<string, unknown>>>;
    };
    Campaign: new (id: string) => {
      update?: (fields: string[], params: Record<string, unknown>) => Promise<{ id?: string }>;
      getInsights?: (
        fields: string[],
        params: Record<string, unknown>
      ) => Promise<Array<Record<string, unknown>>>;
    };
    AdSet: new (id: string) => unknown;
    Ad: new (id: string) => unknown;
  };
  export = sdk;
}
