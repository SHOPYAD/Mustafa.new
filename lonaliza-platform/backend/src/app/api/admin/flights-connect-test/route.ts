import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";
import { getSkyScrapperAuth, skyScrapperGet } from "@/lib/server/flights-sky-scrapper";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const auth = await getSkyScrapperAuth();
  if (!auth.key) {
    return NextResponse.json({
      ok: false,
      httpStatus: 0,
      host: auth.host,
      errorCode: "not_configured",
    });
  }

  const flightsRuntime = await getFlightsRuntime();
  const result = await skyScrapperGet(
    {
      ...flightsRuntime,
      endpoints: {
        ...flightsRuntime.endpoints,
        checkServer: { enabled: true, uses: "health" },
      },
    },
    "checkServer",
    "/api/v1/checkServer",
    {}
  );

  return NextResponse.json({
    ok: result.ok,
    httpStatus: result.status,
    host: auth.host,
    path: result.path,
    errorCode: result.ok ? undefined : result.errorCode,
  });
}
