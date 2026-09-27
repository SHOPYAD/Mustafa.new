import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import {
  listConversations,
  upsertConversation,
} from "@/lib/conversations/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const items = await listConversations(user.id);
  return NextResponse.json({ ok: true, conversations: items });
}

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const saved = await upsertConversation({
      userId: user.id,
      id: body.id ? String(body.id) : undefined,
      title: body.title ? String(body.title) : undefined,
      messages: body.messages,
    });
    return NextResponse.json({ ok: true, conversation: saved });
  } catch (e) {
    const message = e instanceof Error ? e.message : "save_failed";
    const status = message === "forbidden" ? 403 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
