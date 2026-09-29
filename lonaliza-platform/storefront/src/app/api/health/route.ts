export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    service: "lonaliza-storefront",
    time: new Date().toISOString(),
  });
}
