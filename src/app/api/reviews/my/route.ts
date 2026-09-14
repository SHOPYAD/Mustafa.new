import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { getCustomerReviews } from "@/lib/server/customer-reviews-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const customer = await getRequestCustomer(req);
    if (!customer?.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const reviews = await getCustomerReviews(customer.id);
    return NextResponse.json({
      ok: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching customer reviews:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}
