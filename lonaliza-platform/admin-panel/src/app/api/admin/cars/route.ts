import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  createInternalCar,
  deleteInternalCar,
  listInternalCars,
  resetInternalCars,
  updateInternalCar,
} from "@/lib/server/cars-store";
import type { RentalCarInput } from "@/types/car";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const cars = await listInternalCars();
  return NextResponse.json({ ok: true, cars });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as RentalCarInput;
    const result = await createInternalCar(body);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, car: result.car });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Create failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as RentalCarInput & { id?: string };
    if (!body.id) {
      return NextResponse.json(
        { ok: false, error: "id required" },
        { status: 400 }
      );
    }
    const result = await updateInternalCar(body.id, body);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, car: result.car });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id") || "";
    if (!id) {
      const body = (await req.json().catch(() => ({}))) as { id?: string };
      id = body.id || "";
    }
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "id required" },
        { status: 400 }
      );
    }
    const result = await deleteInternalCar(id);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { action?: string };
    if (body.action !== "reset") {
      return NextResponse.json(
        { ok: false, error: "Unknown action" },
        { status: 400 }
      );
    }
    const cars = await resetInternalCars();
    return NextResponse.json({ ok: true, cars });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Reset failed" },
      { status: 500 }
    );
  }
}
