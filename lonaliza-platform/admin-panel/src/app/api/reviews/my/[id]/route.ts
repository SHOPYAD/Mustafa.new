import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { deleteCustomerReview } from "@/lib/server/customer-reviews-store";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await getRequestCustomer(req);
    if (!customer?.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Review ID required" },
        { status: 400 }
      );
    }

    const res = await deleteCustomerReview(customer.id, id);
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: res.error || "Failed to delete review" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
