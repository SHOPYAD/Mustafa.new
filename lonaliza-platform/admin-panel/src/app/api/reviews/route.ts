import { NextRequest, NextResponse } from "next/server";
import {
  getServiceCustomerReviews,
  type ServiceType,
} from "@/lib/server/customer-reviews-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const serviceType = (req.nextUrl.searchParams.get("serviceType") || "hotel").toLowerCase() as ServiceType;
  const serviceId = req.nextUrl.searchParams.get("serviceId") || "";

  if (!["hotel", "transfer", "car", "tour"].includes(serviceType)) {
    return NextResponse.json(
      { ok: false, error: "Invalid service type" },
      { status: 400 }
    );
  }

  try {
    const data = await getServiceCustomerReviews(serviceType, serviceId);
    return NextResponse.json({
      ok: true,
      reviews: data.reviews,
      stats: data.stats,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
