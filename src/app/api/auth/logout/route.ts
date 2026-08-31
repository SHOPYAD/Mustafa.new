import { NextResponse } from "next/server";
import { clearPbAuthCookieHeader } from "@/lib/pocketbase/auth";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { ok: true },
    { headers: { "Set-Cookie": clearPbAuthCookieHeader() } }
  );
}
