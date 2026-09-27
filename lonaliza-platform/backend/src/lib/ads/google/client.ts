import { GoogleAdsApi, type Customer } from "google-ads-api";
import type { AdsCredentials } from "../types";
import { googleAdsReady } from "../config";

export type GoogleAdsHandle = {
  api: GoogleAdsApi;
  customer: Customer;
  customerId: string;
};

export function createGoogleAdsHandle(creds: AdsCredentials): GoogleAdsHandle | null {
  if (!googleAdsReady(creds)) return null;
  const api = new GoogleAdsApi({
    client_id: creds.googleClientId,
    client_secret: creds.googleClientSecret,
    developer_token: creds.googleDeveloperToken,
  });
  const customer = api.Customer({
    customer_id: creds.googleCustomerId,
    refresh_token: creds.googleRefreshToken,
    login_customer_id: creds.googleLoginCustomerId || undefined,
  });
  return { api, customer, customerId: creds.googleCustomerId };
}

export async function listGoogleCustomers(creds: AdsCredentials): Promise<string[]> {
  if (!creds.googleClientId || !creds.googleClientSecret || !creds.googleDeveloperToken) {
    return [];
  }
  if (!creds.googleRefreshToken) return [];
  const api = new GoogleAdsApi({
    client_id: creds.googleClientId,
    client_secret: creds.googleClientSecret,
    developer_token: creds.googleDeveloperToken,
  });
  const res = await api.listAccessibleCustomers(creds.googleRefreshToken);
  return (res.resource_names || []).map((name) => name.replace("customers/", ""));
}
