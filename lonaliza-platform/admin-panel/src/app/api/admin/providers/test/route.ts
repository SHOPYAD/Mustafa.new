import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  COMING_SOON_LOCKED_AR,
  isCatalogProviderId,
} from "@/lib/providers/types";
import { getCatalogProvider } from "@/lib/providers/catalog";
import { testCatalogProvider } from "@/lib/server/providers-test";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { id?: string };
    if (!body.id || !isCatalogProviderId(body.id)) {
      return NextResponse.json({ ok: false, error: "مزود غير معروف" }, { status: 400 });
    }
    const def = getCatalogProvider(body.id);
    if (def.integration === "coming_soon") {
      return NextResponse.json(
        {
          ok: false,
          error: COMING_SOON_LOCKED_AR,
          result: { ok: false, code: "coming_soon_locked", message: COMING_SOON_LOCKED_AR },
        },
        { status: 403 }
      );
    }
    const result = await testCatalogProvider(body.id);
    return NextResponse.json({ ok: result.ok, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "فشل الاختبار" },
      { status: 500 }
    );
  }
}
