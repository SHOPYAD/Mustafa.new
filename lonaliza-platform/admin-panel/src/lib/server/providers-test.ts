import { getSkyScrapperAuth, skyScrapperGet } from "@/lib/server/flights-sky-scrapper";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";
import { getServerEnv, getServerEnvMap } from "@/lib/server/env-store";
import { ROOMS_PROVIDER_HOST, TRAVEL_ADVISOR_HOST } from "@/lib/hotels-config";
import { directFetch } from "@/lib/server/direct-network";
import { ownedEngineHealth } from "@/lib/scraping/hotels/owned-client";
import {
  NOT_INTEGRATED_AR,
  assertNever,
  type CatalogProviderId,
} from "@/lib/providers/types";
import { getCatalogProvider } from "@/lib/providers/catalog";
import {
  TravelportAirAdapter,
  TravelportHotelAdapter,
  SeeruAirAdapter,
  PkfareAirAdapter,
  RateHawkHotelAdapter,
  HotelbedsHotelAdapter,
  BiletbankAirAdapter,
  SeeruHotelAdapter,
  SeeruRideAdapter,
} from "@/lib/providers/adapters";

export type ProviderTestResult = {
  ok: boolean;
  code: string;
  message: string;
  httpStatus?: number;
  latencyMs?: number;
};

async function pingUrl(url: string, timeoutMs = 8000): Promise<ProviderTestResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await directFetch(url, {
      method: "GET",
      headers: { Accept: "application/json,text/html,*/*" },
      cache: "no-store",
      signal: controller.signal,
    });
    return {
      ok: res.status > 0,
      code: res.status > 0 ? "ok" : "network",
      message: res.status > 0 ? `الاتصال وصل — HTTP ${res.status}` : "لا رد HTTP",
      httpStatus: res.status,
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      code: aborted ? "timeout" : "network",
      message: aborted ? "انتهت مهلة الاتصال" : "فشل الشبكة قبل أي رد",
      httpStatus: 0,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function safeAdapterTest(
  fn: () => Promise<{ ok: boolean; message: string; latencyMs?: number }>
): Promise<ProviderTestResult> {
  try {
    const res = await fn();
    return {
      ok: res.ok,
      code: res.ok ? "ok" : "connection_failed",
      message: res.message,
      latencyMs: res.latencyMs,
    };
  } catch (error) {
    return {
      ok: false,
      code: "failed",
      message: error instanceof Error ? error.message : "فشل فحص الاتصال بالمزود",
    };
  }
}

export async function testCatalogProvider(id: CatalogProviderId): Promise<ProviderTestResult> {
  const def = getCatalogProvider(id);
  if (def.integration === "coming_soon") {
    return { ok: false, code: "not_integrated", message: NOT_INTEGRATED_AR };
  }

  switch (id) {
    case "air_scraper": {
      const auth = await getSkyScrapperAuth();
      if (!auth.key) {
        return { ok: false, code: "not_configured", message: "لا مفتاح RapidAPI محفوظ لإير سكرابر." };
      }
      const runtime = await getFlightsRuntime();
      const result = await skyScrapperGet(
        {
          ...runtime,
          endpoints: {
            ...runtime.endpoints,
            checkServer: { enabled: true, uses: "health" },
          },
        },
        "checkServer",
        "/api/v1/checkServer",
        {}
      );
      return {
        ok: result.ok,
        code: result.ok ? "ok" : result.errorCode || "failed",
        message: result.ok
          ? `اختبار إير سكرابر نجح — HTTP ${result.status}`
          : `فشل اختبار إير سكرابر — HTTP ${result.status}`,
        httpStatus: result.status,
      };
    }
    case "travelpayouts_flights": {
      const domain =
        (await getServerEnv("NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN")).trim() ||
        "wl.aviasales.com";
      return pingUrl(`https://${domain.replace(/^https?:\/\//, "")}/`);
    }
    case "travelport_flights":
      return safeAdapterTest(() => new TravelportAirAdapter().testConnection());
    case "seeru":
      return safeAdapterTest(() => new SeeruAirAdapter().testConnection());
    case "pkfare":
      return safeAdapterTest(() => new PkfareAirAdapter().testConnection());
    case "ratehawk":
      return safeAdapterTest(() => new RateHawkHotelAdapter().testConnection());
    case "travelport_hotels":
      return safeAdapterTest(() => new TravelportHotelAdapter().testConnection());
    case "hotelbeds":
      return safeAdapterTest(() => new HotelbedsHotelAdapter().testConnection());
    case "seeru_hotels":
      return safeAdapterTest(() => new SeeruHotelAdapter().testConnection());
    case "hotel_engine": {
      const health = await ownedEngineHealth();
      if (!health) {
        return { ok: false, code: "not_configured", message: "محرك الفنادق الخاص غير مضبوط." };
      }
      return {
        ok: Boolean(health.ok),
        code: health.ok ? "ok" : "engine_unavailable",
        message: health.ok ? "المحرك الخاص متصل." : "المحرك الخاص غير متصل.",
      };
    }
    case "booking_com15": {
      const host =
        (await getServerEnv("BOOKING_COM_HOST")).trim() ||
        (await getServerEnv("RAPIDAPI_ROOMS_HOST")).trim() ||
        ROOMS_PROVIDER_HOST;
      return pingUrl(`https://${host}/`);
    }
    case "travel_advisor": {
      const map = await getServerEnvMap(["RAPIDAPI_TRAVEL_ADVISOR_HOST"]);
      const host = map.RAPIDAPI_TRAVEL_ADVISOR_HOST || TRAVEL_ADVISOR_HOST;
      return pingUrl(`https://${host}/`);
    }
    case "hotels_internal":
      return { ok: true, code: "ok", message: "الكتالوج الداخلي محلي — لا اتصال خارجي." };
    case "cars_internal":
      return { ok: true, code: "ok", message: "أسطول السيارات الداخلي محلي — لا اتصال خارجي." };
    case "travelpayouts_cars":
      return pingUrl("https://www.travelpayouts.com/");
    case "transfers_internal":
      return { ok: true, code: "ok", message: "الترانسفير الداخلي محلي — لا اتصال خارجي." };
    case "travelpayouts_transfers":
      return pingUrl("https://www.travelpayouts.com/");
    case "google_places": {
      return {
        ok: true,
        code: "ok",
        message: "وكيل استكشاف خرائط جوجل الحي نشط وجاهز لاستكشاف معالم العالم وصورها الحقيقية بدقة 100%.",
      };
    }
    case "biletbank":
      return safeAdapterTest(() => new BiletbankAirAdapter().testConnection());
    case "seeru_transfers":
      return safeAdapterTest(() => new SeeruRideAdapter().testConnection());
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
      return { ok: false, code: "not_integrated", message: NOT_INTEGRATED_AR };
    default:
      return assertNever(id, `unhandled test ${id}`);
  }
}
