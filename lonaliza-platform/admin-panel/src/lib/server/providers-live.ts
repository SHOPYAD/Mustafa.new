/**
 * Live provider snapshots + saves — reuse existing env / runtime stores.
 * Coming-soon ids are handled by providers-registry-store.
 */

import {
  CARS_CONFIG_ENV_KEYS,
  CARS_TP_DEFAULTS,
  isCarsTravelpayoutsReady,
} from "@/lib/cars-config";
import {
  FLIGHTS_ADMIN_ENV_KEYS,
  SKY_SCRAPPER_HOST,
  isTravelpayoutsReady,
  sanitizeFlightsRuntime,
  type FlightEngineProvider,
} from "@/lib/flights-config";
import {
  HOTELS_CONFIG_ENV_KEYS,
  ROOMS_PROVIDER_HOST,
  TRAVEL_ADVISOR_HOST,
  type HotelProvider,
} from "@/lib/hotels-config";
import { sanitizeHotelsRuntime } from "@/lib/hotels-runtime";
import { getCatalogProvider } from "@/lib/providers/catalog";
import {
  assertNever,
  type CatalogProviderId,
  type ProviderClientState,
} from "@/lib/providers/types";
import {
  TRANSFERS_CONFIG_ENV_KEYS,
  TRANSFERS_TP_DEFAULT_HEADER,
  TRANSFERS_TP_DEFAULT_SCRIPT,
  TRANSFERS_TP_DEFAULTS,
  isTransfersTravelpayoutsReady,
  serializeTransfersTpFlags,
  parseTransfersTpFlags,
} from "@/lib/transfers-config";
import {
  getServerEnv,
  getServerEnvMap,
  isMaskedPlaceholder,
  maskSecret,
  saveServerEnv,
} from "@/lib/server/env-store";
import { getFlightsRuntime, saveFlightsRuntime } from "@/lib/server/flights-runtime-store";
import { getHotelsRuntime, saveHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import {
  getProviderMode,
  getProviderRuntime,
  saveProviderRuntime,
} from "@/lib/server/providers-registry-store";
import { ownedEngineHealth } from "@/lib/scraping/hotels/owned-client";

function maskFields(fields: Record<string, string>, secretKeys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = secretKeys.includes(key) ? maskSecret(value) : value;
  }
  return out;
}

function applyIncoming(
  current: Record<string, string>,
  incoming: Record<string, string> | undefined,
  map: Record<string, string>
): Record<string, string> {
  if (!incoming) return {};
  const patch: Record<string, string> = {};
  for (const [fieldKey, envKey] of Object.entries(map)) {
    if (!(fieldKey in incoming)) continue;
    const raw = String(incoming[fieldKey] ?? "");
    if (isMaskedPlaceholder(raw)) continue;
    patch[envKey] = raw.trim();
  }
  void current;
  return patch;
}

export function isLiveProviderId(id: CatalogProviderId): boolean {
  return getCatalogProvider(id).integration === "live";
}

export async function getLiveProviderState(id: CatalogProviderId): Promise<ProviderClientState> {
  const def = getCatalogProvider(id);
  if (def.integration !== "live") {
    throw new Error(`${id} is not a live provider`);
  }
  const mode = await getProviderMode(id);

  switch (id) {
    case "air_scraper": {
      const map = await getServerEnvMap(FLIGHTS_ADMIN_ENV_KEYS);
      const runtime = await getFlightsRuntime();
      const apiKey = map.SKY_SCRAPPER_RAPIDAPI_KEY || "";
      const enabled = runtime.providers.includes("live");
      const ready = Boolean(apiKey);
      return {
        id,
        enabled,
        ready,
        connected: enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(
          { host: map.SKY_SCRAPPER_HOST || SKY_SCRAPPER_HOST, apiKey },
          ["apiKey"]
        ),
      };
    }
    case "travelpayouts_flights": {
      const map = await getServerEnvMap(FLIGHTS_ADMIN_ENV_KEYS);
      const runtime = await getFlightsRuntime();
      const tp = {
        marker: map.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || "",
        trs: map.NEXT_PUBLIC_TRAVELPAYOUTS_TRS || "",
        domain: map.NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN || "lonaliza.com",
        widgetDomain: map.NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN || "wl.aviasales.com",
        locale: map.NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE || "ar",
        currency: map.NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY || "usd",
        linkColor: map.NEXT_PUBLIC_TRAVELPAYOUTS_LINK_COLOR || "#f59e0b",
        embedScript: map.NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT || "",
        cookiePolicyScript: map.NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT || "",
      };
      const enabled = runtime.providers.includes("travelpayouts");
      const ready = isTravelpayoutsReady(tp);
      return {
        id,
        enabled,
        ready,
        connected: enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(
          {
            marker: tp.marker,
            trs: tp.trs,
            domain: tp.domain,
            widgetDomain: tp.widgetDomain,
            locale: tp.locale,
            currency: tp.currency,
            linkColor: tp.linkColor,
            embedScript: tp.embedScript,
            cookieScript: tp.cookiePolicyScript,
          },
          ["marker", "trs"]
        ),
      };
    }
    case "hotel_engine": {
      const map = await getServerEnvMap(HOTELS_CONFIG_ENV_KEYS);
      const runtime = await getHotelsRuntime();
      const token = map.HOTEL_ENGINE_TOKEN || "";
      const health = await ownedEngineHealth();
      const enabled = runtime.providers.includes("owned");
      const ready = Boolean(token);
      return {
        id,
        enabled,
        ready,
        connected: enabled && ready && Boolean(health?.ok),
        mode,
        integration: "live",
        fields: maskFields(
          {
            endpoint: map.HOTEL_ENGINE_URL || "http://127.0.0.1:3051",
            apiToken: token,
          },
          ["apiToken"]
        ),
      };
    }
    case "booking_com15": {
      const map = await getServerEnvMap(HOTELS_CONFIG_ENV_KEYS);
      const runtime = await getHotelsRuntime();
      const apiKey = map.BOOKING_COM_RAPIDAPI_KEY || map.RAPIDAPI_ROOMS_KEY || "";
      const enabled = runtime.providers.includes("booking");
      const ready = Boolean(apiKey);
      return {
        id,
        enabled,
        ready,
        connected: enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(
          {
            host: map.BOOKING_COM_HOST || map.RAPIDAPI_ROOMS_HOST || ROOMS_PROVIDER_HOST,
            apiKey,
          },
          ["apiKey"]
        ),
      };
    }
    case "travel_advisor": {
      const map = await getServerEnvMap(HOTELS_CONFIG_ENV_KEYS);
      const runtime = await getHotelsRuntime();
      const apiKey = map.RAPIDAPI_KEY || "";
      const enabled = runtime.providers.includes("travel_advisor");
      const ready = Boolean(apiKey);
      return {
        id,
        enabled,
        ready,
        connected: enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(
          {
            host: map.RAPIDAPI_TRAVEL_ADVISOR_HOST || TRAVEL_ADVISOR_HOST,
            apiKey,
          },
          ["apiKey"]
        ),
      };
    }
    case "hotels_internal": {
      const runtime = await getHotelsRuntime();
      const enabled = runtime.providers.includes("internal");
      return {
        id,
        enabled,
        ready: true,
        connected: enabled,
        mode,
        integration: "live",
        fields: {},
      };
    }
    case "cars_internal": {
      const map = await getServerEnvMap(CARS_CONFIG_ENV_KEYS);
      const enabled = (map.NEXT_PUBLIC_CARS_PROVIDER || "travelpayouts") === "internal";
      return { id, enabled, ready: true, connected: enabled, mode, integration: "live", fields: {} };
    }
    case "travelpayouts_cars": {
      const map = await getServerEnvMap(CARS_CONFIG_ENV_KEYS);
      const tp = {
        marker: map.NEXT_PUBLIC_CARS_TP_MARKER || CARS_TP_DEFAULTS.marker,
        trs: map.NEXT_PUBLIC_CARS_TP_TRS || CARS_TP_DEFAULTS.trs,
        locale: map.NEXT_PUBLIC_CARS_TP_LOCALE || CARS_TP_DEFAULTS.locale,
        country: map.NEXT_PUBLIC_CARS_TP_COUNTRY || CARS_TP_DEFAULTS.country,
        city: map.NEXT_PUBLIC_CARS_TP_CITY || CARS_TP_DEFAULTS.city,
        campaignId: map.NEXT_PUBLIC_CARS_TP_CAMPAIGN_ID || CARS_TP_DEFAULTS.campaignId,
        promoId: map.NEXT_PUBLIC_CARS_TP_PROMO_ID || CARS_TP_DEFAULTS.promoId,
        embedScript: map.NEXT_PUBLIC_CARS_TP_SCRIPT || "",
      };
      const enabled = (map.NEXT_PUBLIC_CARS_PROVIDER || "travelpayouts") === "travelpayouts";
      const ready = isCarsTravelpayoutsReady(tp);
      return {
        id,
        enabled,
        ready,
        connected: enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(
          {
            marker: tp.marker,
            trs: tp.trs,
            locale: tp.locale,
            country: tp.country,
            city: tp.city,
            campaignId: tp.campaignId,
            promoId: tp.promoId,
            embedScript: tp.embedScript,
          },
          ["marker", "trs"]
        ),
      };
    }
    case "transfers_internal": {
      const map = await getServerEnvMap(TRANSFERS_CONFIG_ENV_KEYS);
      const enabled = (map.NEXT_PUBLIC_TRANSFERS_PROVIDER || "internal") === "internal";
      return { id, enabled, ready: true, connected: enabled, mode, integration: "live", fields: {} };
    }
    case "travelpayouts_transfers": {
      const map = await getServerEnvMap(TRANSFERS_CONFIG_ENV_KEYS);
      const tp = {
        marker: map.NEXT_PUBLIC_TRANSFERS_TP_MARKER || TRANSFERS_TP_DEFAULTS.marker,
        trs: map.NEXT_PUBLIC_TRANSFERS_TP_TRS || TRANSFERS_TP_DEFAULTS.trs,
        locale: map.NEXT_PUBLIC_TRANSFERS_TP_LOCALE || TRANSFERS_TP_DEFAULTS.locale,
        currency: map.NEXT_PUBLIC_TRANSFERS_TP_CURRENCY || TRANSFERS_TP_DEFAULTS.currency,
        campaignId: map.NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID || TRANSFERS_TP_DEFAULTS.campaignId,
        promoId: map.NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID || TRANSFERS_TP_DEFAULTS.promoId,
        colorScheme: map.NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME || TRANSFERS_TP_DEFAULTS.colorScheme,
        header: map.NEXT_PUBLIC_TRANSFERS_TP_HEADER || TRANSFERS_TP_DEFAULT_HEADER,
        flags: parseTransfersTpFlags(map.NEXT_PUBLIC_TRANSFERS_TP_FLAGS),
        embedScript: map.NEXT_PUBLIC_TRANSFERS_TP_SCRIPT || TRANSFERS_TP_DEFAULT_SCRIPT,
      };
      const enabled = (map.NEXT_PUBLIC_TRANSFERS_PROVIDER || "internal") === "travelpayouts";
      const ready = isTransfersTravelpayoutsReady(tp);
      return {
        id,
        enabled,
        ready,
        connected: enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(
          {
            marker: tp.marker,
            trs: tp.trs,
            locale: tp.locale,
            currency: tp.currency,
            campaignId: tp.campaignId,
            promoId: tp.promoId,
            colorScheme: tp.colorScheme,
            header: tp.header,
            flags: serializeTransfersTpFlags(tp.flags),
            embedScript: tp.embedScript,
          },
          ["marker", "trs"]
        ),
      };
    }
    case "pkfare": {
      const runtime = await getProviderRuntime("pkfare");
      const fields = runtime.fields || {};
      const ready = Boolean(fields.partnerId?.trim() && fields.partnerKey?.trim());
      return {
        id,
        enabled: runtime.enabled,
        ready,
        connected: runtime.enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["partnerKey"]),
      };
    }
    case "seeru": {
      const runtime = await getProviderRuntime("seeru");
      const fields = runtime.fields || {};
      const token = (fields.apiKey || fields.jwtToken || "").trim();
      const ready = Boolean(token && (fields.refreshKey || "").trim());
      return {
        id,
        enabled: runtime.enabled,
        ready,
        connected: runtime.enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["apiKey", "refreshKey", "jwtToken", "password"]),
      };
    }
    case "travelport_flights": {
      const runtime = await getProviderRuntime("travelport_flights");
      const fields = runtime.fields || {};
      const ready = Boolean(fields.username?.trim() && fields.password?.trim() && fields.targetBranch?.trim());
      return {
        id,
        enabled: runtime.enabled,
        ready,
        connected: runtime.enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["password", "clientSecret"]),
      };
    }
    case "travelport_hotels": {
      const runtime = await getProviderRuntime("travelport_hotels");
      const fields = runtime.fields || {};
      const ready = Boolean(fields.username?.trim() && fields.password?.trim() && fields.targetBranch?.trim());
      return {
        id,
        enabled: runtime.enabled,
        ready,
        connected: runtime.enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["password", "clientSecret"]),
      };
    }
    case "ratehawk": {
      const runtime = await getProviderRuntime("ratehawk");
      const fields = runtime.fields || {};
      const ready = Boolean(fields.keyId?.trim() && fields.apiKey?.trim());
      return {
        id,
        enabled: runtime.enabled,
        ready,
        connected: runtime.enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["apiKey"]),
      };
    }
    case "hotelbeds": {
      const runtime = await getProviderRuntime("hotelbeds");
      const fields = runtime.fields || {};
      const ready = Boolean(fields.apiKey?.trim() && fields.apiSecret?.trim());
      return {
        id,
        enabled: runtime.enabled,
        ready,
        connected: runtime.enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["apiSecret"]),
      };
    }
    case "biletbank": {
      const runtime = await getProviderRuntime("biletbank");
      const fields = runtime.fields || {};
      const ready = Boolean(fields.clientKey?.trim() || (fields.username?.trim() && fields.password?.trim()));
      return {
        id,
        enabled: runtime.enabled,
        ready,
        connected: runtime.enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["clientKey", "password"]),
      };
    }
    case "seeru_hotels": {
      const runtime = await getProviderRuntime("seeru_hotels");
      const fields = runtime.fields || {};
      const ready = Boolean(fields.jwtToken?.trim());
      return {
        id,
        enabled: runtime.enabled,
        ready,
        connected: runtime.enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["jwtToken", "webhookSecret"]),
      };
    }
    case "seeru_transfers": {
      const runtime = await getProviderRuntime("seeru_transfers");
      const fields = runtime.fields || {};
      const ready = Boolean(fields.jwtToken?.trim());
      return {
        id,
        enabled: runtime.enabled,
        ready,
        connected: runtime.enabled && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["jwtToken"]),
      };
    }
    case "google_places": {
      const runtime = await getProviderRuntime("google_places");
      const envKey = (await getServerEnv("GOOGLE_PLACES_API_KEY")).trim();
      const fields = {
        apiKey: runtime.fields?.apiKey || envKey || "",
      };
      const ready = true;
      return {
        id,
        enabled: runtime.enabled ?? true,
        ready,
        connected: (runtime.enabled ?? true) && ready,
        mode,
        integration: "live",
        fields: maskFields(fields, ["apiKey"]),
      };
    }
    case "amadeus_flights":
    case "iati":
    case "biletdukkani":
    case "turna_flights":
    case "tbo_flights":
    case "amadeus_hotels":
    case "tbo_hotels":
    case "amadeus_cars":
    case "travelport_cars":
    case "tbo_cars":
    case "cartrawler":
    case "rentalcars":
    case "sunnycars":
    case "amadeus_transfers":
    case "travelport_transfers":
    case "tbo_transfers":
    case "mozio":
    case "kiwitaxi":
    case "jayride":
    case "gettransfer":
    case "iway":
      throw new Error(`${id} is coming soon`);
    default:
      return assertNever(id, `unhandled live provider ${id}`);
  }
}

export async function saveLiveProvider(
  id: CatalogProviderId,
  patch: { enabled?: boolean; fields?: Record<string, string> }
): Promise<ProviderClientState> {
  switch (id) {
    case "air_scraper": {
      const map = await getServerEnvMap(["SKY_SCRAPPER_RAPIDAPI_KEY", "SKY_SCRAPPER_HOST"]);
      const envPatch = applyIncoming(map, patch.fields, {
        host: "SKY_SCRAPPER_HOST",
        apiKey: "SKY_SCRAPPER_RAPIDAPI_KEY",
      });
      if (Object.keys(envPatch).length) await saveServerEnv(envPatch);
      if (typeof patch.enabled === "boolean") {
        if (patch.enabled) {
          const current = await getServerEnvMap(["SKY_SCRAPPER_RAPIDAPI_KEY"]);
          if (!(envPatch.SKY_SCRAPPER_RAPIDAPI_KEY || current.SKY_SCRAPPER_RAPIDAPI_KEY)) {
            throw new Error("أدخل مفتاح RapidAPI ثم احفظ قبل تفعيل إير سكرابر");
          }
        }
        const runtime = await getFlightsRuntime();
        const next: FlightEngineProvider[] = runtime.providers.filter((item) => item !== "live");
        if (patch.enabled) next.unshift("live");
        await saveFlightsRuntime(
          sanitizeFlightsRuntime(
            {
              ...runtime,
              mode: next.length > 1 ? "dual" : "single",
              providers: next.length ? next : ["travelpayouts"],
            },
            next.includes("travelpayouts") && !next.includes("live") ? "travelpayouts" : "live"
          )
        );
      }
      return getLiveProviderState(id);
    }
    case "travelpayouts_flights": {
      const map = await getServerEnvMap(FLIGHTS_ADMIN_ENV_KEYS);
      const envPatch = applyIncoming(map, patch.fields, {
        marker: "NEXT_PUBLIC_TRAVELPAYOUTS_MARKER",
        trs: "NEXT_PUBLIC_TRAVELPAYOUTS_TRS",
        domain: "NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN",
        widgetDomain: "NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN",
        locale: "NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE",
        currency: "NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY",
        linkColor: "NEXT_PUBLIC_TRAVELPAYOUTS_LINK_COLOR",
        embedScript: "NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT",
        cookieScript: "NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT",
      });
      if (Object.keys(envPatch).length) await saveServerEnv(envPatch);
      if (typeof patch.enabled === "boolean") {
        const runtime = await getFlightsRuntime();
        const next: FlightEngineProvider[] = runtime.providers.filter(
          (item) => item !== "travelpayouts"
        );
        if (patch.enabled) next.push("travelpayouts");
        await saveFlightsRuntime(
          sanitizeFlightsRuntime(
            {
              ...runtime,
              mode: next.length > 1 ? "dual" : "single",
              providers: next.length ? next : ["live"],
            },
            next.includes("live") ? "live" : "travelpayouts"
          )
        );
      }
      return getLiveProviderState(id);
    }
    case "hotel_engine": {
      const map = await getServerEnvMap(HOTELS_CONFIG_ENV_KEYS);
      const envPatch = applyIncoming(map, patch.fields, {
        endpoint: "HOTEL_ENGINE_URL",
        apiToken: "HOTEL_ENGINE_TOKEN",
      });
      if (Object.keys(envPatch).length) await saveServerEnv(envPatch);
      if (typeof patch.enabled === "boolean") {
        const runtime = await getHotelsRuntime();
        if (patch.enabled) {
          await saveHotelsRuntime(
            sanitizeHotelsRuntime({ ...runtime, mode: "single", providers: ["owned"] }, "owned")
          );
          await saveServerEnv({ NEXT_PUBLIC_HOTELS_PROVIDER: "owned" });
        } else if (runtime.providers.includes("owned")) {
          const fallback = runtime.providers.find((item) => item !== "owned") || "booking";
          await saveHotelsRuntime(
            sanitizeHotelsRuntime({ ...runtime, mode: "single", providers: [fallback] }, fallback)
          );
          await saveServerEnv({ NEXT_PUBLIC_HOTELS_PROVIDER: fallback });
        }
      }
      return getLiveProviderState(id);
    }
    case "booking_com15": {
      const map = await getServerEnvMap(HOTELS_CONFIG_ENV_KEYS);
      const envPatch = applyIncoming(map, patch.fields, {
        host: "BOOKING_COM_HOST",
        apiKey: "BOOKING_COM_RAPIDAPI_KEY",
      });
      if (Object.keys(envPatch).length) {
        await saveServerEnv({
          ...envPatch,
          NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER: "booking_com15",
        });
      }
      if (typeof patch.enabled === "boolean") {
        const runtime = await getHotelsRuntime();
        let providers: HotelProvider[] = runtime.providers.filter(
          (item) => item === "booking" || item === "travel_advisor"
        );
        providers = providers.filter((item) => item !== "booking");
        if (patch.enabled) providers = ["booking", ...providers];
        if (providers.length === 0) providers = patch.enabled ? ["booking"] : ["internal"];
        await saveHotelsRuntime(
          sanitizeHotelsRuntime(
            {
              ...runtime,
              mode: providers.length > 1 ? "dual" : "single",
              providers,
            },
            providers[0] || "booking"
          )
        );
        await saveServerEnv({ NEXT_PUBLIC_HOTELS_PROVIDER: providers[0] || "booking" });
      }
      return getLiveProviderState(id);
    }
    case "travel_advisor": {
      const map = await getServerEnvMap(HOTELS_CONFIG_ENV_KEYS);
      const envPatch = applyIncoming(map, patch.fields, {
        host: "RAPIDAPI_TRAVEL_ADVISOR_HOST",
        apiKey: "RAPIDAPI_KEY",
      });
      if (Object.keys(envPatch).length) await saveServerEnv(envPatch);
      if (typeof patch.enabled === "boolean") {
        const runtime = await getHotelsRuntime();
        let providers: HotelProvider[] = runtime.providers.filter(
          (item) => item === "booking" || item === "travel_advisor"
        );
        providers = providers.filter((item) => item !== "travel_advisor");
        if (patch.enabled) providers = [...providers, "travel_advisor"];
        if (providers.length === 0) providers = patch.enabled ? ["travel_advisor"] : ["internal"];
        await saveHotelsRuntime(
          sanitizeHotelsRuntime(
            {
              ...runtime,
              mode: providers.length > 1 ? "dual" : "single",
              providers,
            },
            providers[0] || "travel_advisor"
          )
        );
        await saveServerEnv({ NEXT_PUBLIC_HOTELS_PROVIDER: providers[0] || "travel_advisor" });
      }
      return getLiveProviderState(id);
    }
    case "hotels_internal": {
      if (patch.enabled === true) {
        const runtime = await getHotelsRuntime();
        await saveHotelsRuntime(
          sanitizeHotelsRuntime({ ...runtime, mode: "single", providers: ["internal"] }, "internal")
        );
        await saveServerEnv({ NEXT_PUBLIC_HOTELS_PROVIDER: "internal" });
      } else if (patch.enabled === false) {
        const runtime = await getHotelsRuntime();
        if (runtime.providers.includes("internal")) {
          await saveHotelsRuntime(
            sanitizeHotelsRuntime({ ...runtime, mode: "single", providers: ["booking"] }, "booking")
          );
          await saveServerEnv({ NEXT_PUBLIC_HOTELS_PROVIDER: "booking" });
        }
      }
      return getLiveProviderState(id);
    }
    case "cars_internal": {
      if (typeof patch.enabled === "boolean") {
        await saveServerEnv({
          NEXT_PUBLIC_CARS_PROVIDER: patch.enabled ? "internal" : "travelpayouts",
        });
      }
      return getLiveProviderState(id);
    }
    case "travelpayouts_cars": {
      const map = await getServerEnvMap(CARS_CONFIG_ENV_KEYS);
      const envPatch = applyIncoming(map, patch.fields, {
        marker: "NEXT_PUBLIC_CARS_TP_MARKER",
        trs: "NEXT_PUBLIC_CARS_TP_TRS",
        locale: "NEXT_PUBLIC_CARS_TP_LOCALE",
        country: "NEXT_PUBLIC_CARS_TP_COUNTRY",
        city: "NEXT_PUBLIC_CARS_TP_CITY",
        campaignId: "NEXT_PUBLIC_CARS_TP_CAMPAIGN_ID",
        promoId: "NEXT_PUBLIC_CARS_TP_PROMO_ID",
        embedScript: "NEXT_PUBLIC_CARS_TP_SCRIPT",
      });
      if (typeof patch.enabled === "boolean") {
        envPatch.NEXT_PUBLIC_CARS_PROVIDER = patch.enabled ? "travelpayouts" : "internal";
      }
      if (Object.keys(envPatch).length) await saveServerEnv(envPatch);
      return getLiveProviderState(id);
    }
    case "transfers_internal": {
      if (typeof patch.enabled === "boolean") {
        await saveServerEnv({
          NEXT_PUBLIC_TRANSFERS_PROVIDER: patch.enabled ? "internal" : "travelpayouts",
        });
      }
      return getLiveProviderState(id);
    }
    case "travelpayouts_transfers": {
      const map = await getServerEnvMap(TRANSFERS_CONFIG_ENV_KEYS);
      const envPatch = applyIncoming(map, patch.fields, {
        marker: "NEXT_PUBLIC_TRANSFERS_TP_MARKER",
        trs: "NEXT_PUBLIC_TRANSFERS_TP_TRS",
        locale: "NEXT_PUBLIC_TRANSFERS_TP_LOCALE",
        currency: "NEXT_PUBLIC_TRANSFERS_TP_CURRENCY",
        campaignId: "NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID",
        promoId: "NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID",
        colorScheme: "NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME",
        header: "NEXT_PUBLIC_TRANSFERS_TP_HEADER",
        flags: "NEXT_PUBLIC_TRANSFERS_TP_FLAGS",
        embedScript: "NEXT_PUBLIC_TRANSFERS_TP_SCRIPT",
      });
      if (typeof patch.enabled === "boolean") {
        envPatch.NEXT_PUBLIC_TRANSFERS_PROVIDER = patch.enabled ? "travelpayouts" : "internal";
      }
      if (Object.keys(envPatch).length) await saveServerEnv(envPatch);
      return getLiveProviderState(id);
    }
    case "pkfare":
    case "seeru":
    case "seeru_hotels":
    case "seeru_transfers":
    case "travelport_flights":
    case "travelport_hotels":
    case "ratehawk":
    case "hotelbeds": {
      const current = await getProviderRuntime(id);
      const cleanFields: Record<string, string> = { ...(current.fields || {}) };
      if (patch.fields) {
        for (const [k, v] of Object.entries(patch.fields)) {
          if (v !== undefined) {
            if (isMaskedPlaceholder(v)) {
              continue;
            }
            cleanFields[k] = v;
          }
        }
      }
      if (cleanFields.apiKey) {
        cleanFields.jwtToken = cleanFields.apiKey;
      }
      await saveProviderRuntime(id, {
        enabled: patch.enabled,
        fields: cleanFields,
      });
      return getLiveProviderState(id);
    }
    case "biletbank": {
      const current = await getProviderRuntime("biletbank");
      const cleanFields: Record<string, string> = { ...current.fields };
      if (patch.fields) {
        for (const [k, v] of Object.entries(patch.fields)) {
          if (v && !v.includes("••")) {
            cleanFields[k] = v;
          }
        }
      }
      await saveProviderRuntime("biletbank", {
        enabled: patch.enabled,
        fields: cleanFields,
      });
      return getLiveProviderState("biletbank");
    }
    case "google_places": {
      const current = await getProviderRuntime("google_places");
      const cleanFields: Record<string, string> = { ...current.fields };
      if (patch.fields) {
        for (const [k, v] of Object.entries(patch.fields)) {
          if (v && !v.includes("••")) {
            cleanFields[k] = v;
          }
        }
      }
      if (cleanFields.apiKey) {
        await saveServerEnv("GOOGLE_PLACES_API_KEY", cleanFields.apiKey);
      }
      await saveProviderRuntime("google_places", {
        enabled: patch.enabled !== undefined ? patch.enabled : (current.enabled ?? true),
        fields: cleanFields,
      });
      return getLiveProviderState("google_places");
    }
    case "amadeus_flights":
    case "iati":
    case "biletdukkani":
    case "turna_flights":
    case "tbo_flights":
    case "amadeus_hotels":
    case "tbo_hotels":
    case "amadeus_cars":
    case "travelport_cars":
    case "tbo_cars":
    case "cartrawler":
    case "rentalcars":
    case "sunnycars":
    case "amadeus_transfers":
    case "travelport_transfers":
    case "tbo_transfers":
    case "mozio":
    case "kiwitaxi":
    case "jayride":
    case "gettransfer":
    case "iway":
      throw new Error(`${id} is coming soon`);
    default:
      return assertNever(id, `unhandled save ${id}`);
  }
}
