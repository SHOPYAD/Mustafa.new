import { NextResponse } from "next/server";
import { getNostrSocialSettings } from "@/lib/server/nostr-social-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await getNostrSocialSettings();

    // Filter to active relays and public media servers
    const activeRelayConfigs = settings.relays.filter((r) => r.active);
    const activeRelayUrls = activeRelayConfigs.map((r) => r.url);
    const activeMediaServers = settings.mediaServers.filter((m) => m.active);

    return NextResponse.json({
      ok: true,
      relays: activeRelayConfigs,
      relayUrls: activeRelayUrls,
      relayConfigs: activeRelayConfigs,
      mediaServers: activeMediaServers,
      defaultMediaServer: activeMediaServers.find((m) => m.isDefault)?.url || "https://nostr.build",
      categories: settings.categories.sort((a, b) => (a.order || 0) - (b.order || 0)),
      destinations: settings.destinations,
      pointsConfig: {
        enabled: settings.pointsConfig.enabled,
        pointsPerPost: settings.pointsConfig.pointsPerPost,
        pointsPerPhotoPost: settings.pointsConfig.pointsPerPhotoPost,
        pointsPerReel: settings.pointsConfig.pointsPerReel,
        pointsPerComment: settings.pointsConfig.pointsPerComment,
        pointsPerLike: settings.pointsConfig.pointsPerLike,
        pointsPerUsd: settings.pointsConfig.pointsPerUsd,
      },
      tiers: settings.tiers.sort((a, b) => (a.level || 0) - (b.level || 0)),
      moderation: {
        hiddenEventIds: settings.moderation.hiddenEventIds,
        mutedPubkeys: settings.moderation.mutedPubkeys,
        verifiedPubkeys: [
          ...(settings.moderation.verifiedPubkeys || []),
          ...(settings.moderation.partnerPubkeys || []),
        ],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
