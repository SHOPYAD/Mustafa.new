import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Isolated liveness probe for the Flutter WebView shell retry button.
 * Keep this route dependency-free so other agents can change product APIs safely.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, service: "lonaliza-shell", ts: Date.now() },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { "cache-control": "no-store" },
  });
}
