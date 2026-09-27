import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getBranding,
  mergeBrandingPatch,
  saveBranding,
} from "@/lib/server/branding-store";
import { ttlDelete } from "@/lib/server/ttl-cache";
import type { BrandingContent, BrandingPatch } from "@/types/branding";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const branding = await getBranding();
  return NextResponse.json({ ok: true, branding });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as BrandingContent & {
      merge?: boolean;
      patch?: BrandingPatch;
    };
    const merge = body.merge === true;
    const payload = (body.patch || body) as BrandingPatch;
    const branding = await saveBranding(payload, { merge });
    ttlDelete("public-branding");
    ttlDelete("public-theme");
    return NextResponse.json({ ok: true, branding });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { patch?: BrandingPatch; merge?: boolean };
    const current = await getBranding();
    if (!body.patch || typeof body.patch !== "object") {
      return NextResponse.json(
        { ok: false, error: "patch required" },
        { status: 400 }
      );
    }
    const preview = mergeBrandingPatch(current, body.patch);
    if (body.merge === false) {
      return NextResponse.json({ ok: true, branding: preview, preview: true });
    }
    const branding = await saveBranding(body.patch, { merge: true });
    ttlDelete("public-branding");
    ttlDelete("public-theme");
    return NextResponse.json({ ok: true, branding });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Merge failed" },
      { status: 500 }
    );
  }
}
