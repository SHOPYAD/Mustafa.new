import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import {
  customerToProfile,
  type CustomerRecord,
} from "@/lib/pocketbase/records";

export async function GET(request: Request) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const perPage = Math.min(100, Math.max(10, Number(searchParams.get("perPage") || 50) || 50));

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({
      customers: [],
      pocketbase: false,
      message: "PocketBase غير جاهز بعد.",
    });
  }

  try {
    const safeQ = q.replace(/"/g, "");
    const filter = q
      ? `name ~ "${safeQ}" || email ~ "${safeQ}" || phone ~ "${safeQ}"`
      : "";
    const rows = await pb.collection("customers").getList<CustomerRecord>(page, perPage, {
      sort: "-id",
      ...(filter ? { filter } : {}),
    });
    return NextResponse.json({
      customers: rows.items.map(customerToProfile),
      pocketbase: true,
      page: rows.page,
      perPage: rows.perPage,
      totalItems: rows.totalItems,
    });
  } catch (e) {
    return NextResponse.json(
      {
        customers: [],
        pocketbase: true,
        error: e instanceof Error ? e.message : "PocketBase query failed",
      },
      { status: 500 }
    );
  }
}
