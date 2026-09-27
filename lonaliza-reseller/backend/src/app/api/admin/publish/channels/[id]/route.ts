import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { deleteChannel, getChannel, updateChannel } from "@/lib/publish/channels";
import { toPublicChannel } from "@/lib/publish/store";
import { updateChannelSchema } from "@/lib/publish/schemas";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const channel = await getChannel(id);
  if (!channel) {
    return NextResponse.json({ ok: false, error: "القناة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, channel: toPublicChannel(channel) });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const body = updateChannelSchema.parse(await req.json());
    const channel = await updateChannel(id, body);
    if (!channel) {
      return NextResponse.json({ ok: false, error: "القناة غير موجودة" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, channel });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر تحديث القناة" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const ok = await deleteChannel(id);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "القناة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
