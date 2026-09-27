import { NextResponse } from "next/server";
import { getUiIcons } from "@/lib/server/ui-icons-persist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const icons = await getUiIcons();
  return NextResponse.json(
    { ok: true, icons },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
