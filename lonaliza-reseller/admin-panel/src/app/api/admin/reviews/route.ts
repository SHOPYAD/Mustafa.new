import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getAllReviewsAdmin,
  moderateReviewAdmin,
  getReviewsSettings,
  updateReviewsSettings,
  type ReviewStatus,
  type ServiceType,
} from "@/lib/server/customer-reviews-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const statusParam = req.nextUrl.searchParams.get("status") as ReviewStatus | null;
    const serviceTypeParam = req.nextUrl.searchParams.get("serviceType") as ServiceType | null;

    const [reviews, settings] = await Promise.all([
      getAllReviewsAdmin({
        status: statusParam || undefined,
        serviceType: serviceTypeParam || undefined,
      }),
      getReviewsSettings(),
    ]);

    // Calculate admin statistics
    const all = await getAllReviewsAdmin();
    const stats = {
      total: all.length,
      approved: all.filter((r) => r.status === "approved").length,
      pending: all.filter((r) => r.status === "pending").length,
      hidden: all.filter((r) => r.status === "hidden").length,
      averageRating:
        all.length > 0
          ? Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10
          : 5.0,
    };

    return NextResponse.json({
      ok: true,
      reviews,
      settings,
      stats,
    });
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load reviews data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const action = String(body.action || "");

    if (action === "toggle_auto_approve") {
      const autoApprove = Boolean(body.autoApprove);
      const updated = await updateReviewsSettings({ autoApprove });
      return NextResponse.json({ ok: true, settings: updated });
    }

    const reviewId = String(body.reviewId || "").trim();
    if (!reviewId) {
      return NextResponse.json({ ok: false, error: "reviewId required" }, { status: 400 });
    }

    if (!["approve", "hide", "delete"].includes(action)) {
      return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
    }

    const adminNotes = body.adminNotes ? String(body.adminNotes) : undefined;
    const res = await moderateReviewAdmin(
      reviewId,
      action as "approve" | "hide" | "delete",
      adminNotes
    );

    return NextResponse.json(res);
  } catch (error) {
    console.error("Admin reviews POST error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to execute review action" },
      { status: 500 }
    );
  }
}
