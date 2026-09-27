import { NextResponse } from "next/server";
import { getBuddy } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ userId: string }> }) {
  const { userId } = await ctx.params;
  const profile = await getBuddy(userId);
  if (!profile) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    profile: {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      city: profile.city || "",
      destination: profile.destination || "",
      bio: profile.bio || "",
      language: profile.language || "",
      avatarUrl: profile.avatarUrl || "",
      nostrPubkey: profile.nostrPubkey || "",
      dateFrom: profile.dateFrom,
      dateTo: profile.dateTo,
    },
  });
}
