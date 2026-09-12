import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { ROOMS_PROVIDER_HOST } from "@/lib/hotels-config";
import { getServerEnv } from "@/lib/server/env-store";
import { directFetch, proxyEnvPresent } from "@/lib/server/direct-network";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const host =
    (await getServerEnv("BOOKING_COM_HOST")).trim() ||
    (await getServerEnv("RAPIDAPI_ROOMS_HOST")).trim() ||
    ROOMS_PROVIDER_HOST;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await directFetch(`https://${host}/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-rapidapi-host": host,
      },
      cache: "no-store",
      signal: controller.signal,
    });
    return NextResponse.json({
      ok: res.status > 0,
      httpStatus: res.status,
      host,
      proxyEnvPresent: proxyEnvPresent(),
      note:
        res.status > 0
          ? "الاتصال يصل إلى RapidAPI مباشرة دون بروكسي محلي."
          : "لا يوجد رد HTTP — فشل شبكة أو مهلة.",
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return NextResponse.json({
      ok: false,
      httpStatus: 0,
      host,
      proxyEnvPresent: proxyEnvPresent(),
      note: aborted
        ? "انتهت مهلة الاتصال (HTTP 0 = timeout)."
        : "فشل الشبكة قبل أي رد من RapidAPI (HTTP 0). الجلب يمر الآن بدون بروكسي محلي.",
    });
  } finally {
    clearTimeout(timer);
  }
}
