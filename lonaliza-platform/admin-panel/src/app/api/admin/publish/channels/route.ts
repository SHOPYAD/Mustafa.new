import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { createChannel, listChannels } from "@/lib/publish/channels";
import { listProviderCatalog } from "@/lib/publish/registry";
import { createChannelSchema } from "@/lib/publish/schemas";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { channels, store } = await listChannels();
  return NextResponse.json({
    ok: true,
    channels,
    providers: listProviderCatalog(),
    store,
  });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = createChannelSchema.parse(await req.json());
    const channel = await createChannel(body);
    return NextResponse.json({ ok: true, channel });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "تعذّر إنشاء القناة",
      },
      { status: 400 }
    );
  }
}
