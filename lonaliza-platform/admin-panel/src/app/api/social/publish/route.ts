import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { publishToConnectedAccounts } from "@/lib/social/publish";
import {
  SOCIAL_PLATFORMS,
  type PublishToConnectedAccountsInput,
  type SocialPlatform,
} from "@/lib/social/types";

export const runtime = "nodejs";

function isPlatform(value: unknown): value is SocialPlatform {
  return (
    typeof value === "string" &&
    (SOCIAL_PLATFORMS as readonly string[]).includes(value)
  );
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  let body: Partial<PublishToConnectedAccountsInput> = {};
  try {
    body = (await req.json()) as Partial<PublishToConnectedAccountsInput>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const platforms = Array.isArray(body.platforms)
    ? body.platforms.filter(isPlatform)
    : [];
  const mediaUrls = Array.isArray(body.mediaUrls)
    ? body.mediaUrls.filter((item): item is string => typeof item === "string")
    : [];

  const result = await publishToConnectedAccounts({
    approved: body.approved === true,
    platforms,
    mediaUrls,
    caption: typeof body.caption === "string" ? body.caption : "",
    title: typeof body.title === "string" ? body.title : undefined,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
