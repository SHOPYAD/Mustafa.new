import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  return NextResponse.json({ ok: true, user });
}
