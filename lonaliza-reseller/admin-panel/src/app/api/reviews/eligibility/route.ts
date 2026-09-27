import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import {
  verifyCustomerEligibility,
  type ServiceType,
} from "@/lib/server/customer-reviews-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const customer = await getRequestCustomer(req);
    if (!customer?.id) {
      return NextResponse.json({
        ok: true,
        loggedIn: false,
        eligible: false,
        reason: "login_required",
      });
    }

    const serviceType = (req.nextUrl.searchParams.get("serviceType") || "hotel").toLowerCase() as ServiceType;
    const serviceId = req.nextUrl.searchParams.get("serviceId") || "";

    const check = await verifyCustomerEligibility(customer.id, serviceType, serviceId);
    return NextResponse.json({
      ok: true,
      loggedIn: true,
      eligible: check.eligible,
      bookingId: check.bookingId,
      serviceName: check.serviceName,
      reason: check.reason,
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to check eligibility" },
      { status: 500 }
    );
  }
}
