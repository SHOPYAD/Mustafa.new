import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { buildBookingPdfBuffer } from "@/lib/pdf/booking-pdf";
import {
  authorizeHotelBookingConfirm,
  toHotelBookingConfirmView,
} from "@/lib/server/hotel-booking-confirm";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const confirm = req.nextUrl.searchParams.get("confirm") || "";
  const user = await getRequestCustomer(req);
  const booking = await authorizeHotelBookingConfirm({
    bookingId: id,
    confirm,
    userId: user?.id,
  });
  if (!booking) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const view = toHotelBookingConfirmView(booking);
  const buffer = await buildBookingPdfBuffer(view);
  const filename = `alrayyan-${view.service}-${booking.id}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
