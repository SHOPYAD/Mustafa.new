import { NextRequest, NextResponse } from "next/server";
import { recordEmailUnsubscribe } from "@/lib/automation/optin-store";

export const runtime = "nodejs";

function unsubscribeResponse() {
  return NextResponse.json({
    ok: true,
    message: "Unsubscribe request received.",
  });
}

async function remember(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "";
  if (email) await recordEmailUnsubscribe(email);
}

export async function GET(req: NextRequest) {
  await remember(req);
  return unsubscribeResponse();
}

export async function POST(req: NextRequest) {
  await remember(req);
  try {
    const body = (await req.json()) as { email?: string };
    if (body.email) await recordEmailUnsubscribe(body.email);
  } catch {
    /* query param is enough */
  }
  return unsubscribeResponse();
}
