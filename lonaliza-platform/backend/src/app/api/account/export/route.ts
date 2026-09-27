import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  const pb = await tryCreateAdminPocketBase();
  let customerData: Record<string, unknown> = {
    userId: user.id,
    name: user.name,
    email: user.email,
    exportDate: new Date().toISOString(),
    gdprNotice: "Exported in accordance with EU General Data Protection Regulation (GDPR) Article 20 (Right to data portability).",
  };

  if (pb) {
    try {
      const cust = await pb.collection("customers").getFirstListItem(`user = "${user.id}"`);
      customerData.phone = cust.phone;
      customerData.notes = cust.notes;
    } catch {
      /* ignore */
    }

    try {
      const bookings = await pb.collection("hotel_bookings").getFullList({
        filter: `user = "${user.id}"`,
      });
      customerData.hotelBookings = bookings;
    } catch {
      /* ignore */
    }

    try {
      const enquiries = await pb.collection("enquiry_bookings").getFullList({
        filter: `user = "${user.id}"`,
      });
      customerData.enquiryBookings = enquiries;
    } catch {
      /* ignore */
    }
  }

  return new NextResponse(JSON.stringify(customerData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="lonaliza_data_export_${user.id.slice(0, 8)}.json"`,
    },
  });
}
