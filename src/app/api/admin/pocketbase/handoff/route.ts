import { NextRequest, NextResponse } from "next/server";
import {
  consumeHandoff,
  handoffHtmlPage,
  publicAdminUiUrl,
  superuserCookieHeader,
} from "@/lib/pocketbase/handoff-store";

export const runtime = "nodejs";

function loginRedirect(): NextResponse {
  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: publicAdminUiUrl("/login"),
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function GET(req: NextRequest) {
  const nonce = req.nextUrl.searchParams.get("t") || "";
  const wantsJson =
    req.nextUrl.searchParams.get("format") === "json" ||
    (req.headers.get("accept") || "").includes("application/json");

  if (!wantsJson) {
    return new NextResponse(handoffHtmlPage(), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  const payload = await consumeHandoff(nonce);
  if (!payload) {
    if ((req.headers.get("accept") || "").includes("application/json")) {
      return NextResponse.json(
        { ok: false, error: "handoff expired" },
        { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }
    return loginRedirect();
  }

  const res = NextResponse.json(
    { ok: true, token: payload.token, record: payload.record },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
  res.headers.append(
    "Set-Cookie",
    superuserCookieHeader(payload.token, payload.record, { secure: true })
  );
  return res;
}
