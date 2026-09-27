import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { listUserAiPrograms } from "@/lib/ai-programs-pb";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const programs = await listUserAiPrograms(user.id);
  return NextResponse.json({ ok: true, programs });
}
