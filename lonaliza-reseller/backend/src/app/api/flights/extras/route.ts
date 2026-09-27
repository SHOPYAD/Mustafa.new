import { NextRequest } from "next/server";
import { listActiveAgencyExtras } from "@/lib/server/agency-extras-store";
import { flightsJson } from "@/lib/server/flights-http";
import { isAgencyExtraService } from "@/types/agency-extra";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("service") || "flights";
  const service = isAgencyExtraService(raw) ? raw : "flights";
  const extras = await listActiveAgencyExtras(service);
  return flightsJson({ ok: true, extras });
}
