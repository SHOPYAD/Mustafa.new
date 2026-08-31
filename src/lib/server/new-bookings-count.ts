import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

export async function countNewAdminBookings(): Promise<number> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return 0;
  try {
    const [enquiries, hotels] = await Promise.all([
      pb.collection("enquiry_bookings").getList(1, 1, {
        filter: 'status = "new"',
        fields: "id",
      }),
      pb.collection("hotel_bookings").getList(1, 1, {
        filter: 'status = "new"',
        fields: "id",
      }),
    ]);
    return (enquiries.totalItems || 0) + (hotels.totalItems || 0);
  } catch {
    return 0;
  }
}
