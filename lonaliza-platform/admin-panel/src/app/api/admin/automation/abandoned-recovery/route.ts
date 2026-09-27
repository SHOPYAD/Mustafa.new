import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  findAbandonedBookings,
  sendAbandonedCartRecoveryMessage,
  type RecoveryCandidate,
} from "@/lib/automation/abandoned-recovery";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;

  try {
    const candidates = await findAbandonedBookings();
    return NextResponse.json({ ok: true, candidates });
  } catch (err) {
    console.error("[api/admin/automation/abandoned-recovery] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to find abandoned bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as { candidate: RecoveryCandidate };
    if (!body.candidate || !body.candidate.phone) {
      return NextResponse.json({ ok: false, error: "Invalid candidate data" }, { status: 400 });
    }

    const sent = await sendAbandonedCartRecoveryMessage(body.candidate);
    return NextResponse.json({ ok: sent });
  } catch (err) {
    console.error("[api/admin/automation/abandoned-recovery] POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to send recovery message" }, { status: 500 });
  }
}
