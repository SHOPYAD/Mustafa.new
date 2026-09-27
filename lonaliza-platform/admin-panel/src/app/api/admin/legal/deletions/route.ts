import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getDeletionRequests,
  purgeAccountPermanently,
  bulkPurgeAccounts,
  setRetentionPeriod,
  restoreAccount,
} from "@/lib/server/deletion-requests-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const requests = await getDeletionRequests();
    return NextResponse.json({ ok: true, requests });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "فشل تحميل طلبات الحذف" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, requestId, requestIds, days, adminNotes } = body;

    switch (action) {
      case "purge": {
        if (!requestId) {
          return NextResponse.json(
            { ok: false, error: "معرف الطلب مطلوب للحذف النهائي" },
            { status: 400 }
          );
        }
        const result = await purgeAccountPermanently(requestId);
        if (!result.ok) {
          return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
        }
        const updatedRequests = await getDeletionRequests();
        return NextResponse.json({
          ok: true,
          message: result.message,
          requests: updatedRequests,
        });
      }

      case "bulk_purge": {
        if (!Array.isArray(requestIds) || requestIds.length === 0) {
          return NextResponse.json(
            { ok: false, error: "يجب اختيار عميل واحد على الأقل للحذف الجماعي" },
            { status: 400 }
          );
        }
        const bulkResult = await bulkPurgeAccounts(requestIds);
        const updatedRequests = await getDeletionRequests();
        return NextResponse.json({
          ok: true,
          message: `تم حذف ${bulkResult.purgedCount} حساب نهائياً من المنصة.`,
          purgedCount: bulkResult.purgedCount,
          requests: updatedRequests,
        });
      }

      case "set_retention": {
        if (!requestId || typeof days !== "number" || days < 0) {
          return NextResponse.json(
            { ok: false, error: "معرف الطلب وعدد الأيام مطلوبان بشكل صحيح" },
            { status: 400 }
          );
        }
        const updated = await setRetentionPeriod(requestId, days, adminNotes);
        if (!updated) {
          return NextResponse.json(
            { ok: false, error: "لم يتم العثور على الطلب لتعديل مدة الحفظ" },
            { status: 404 }
          );
        }
        const updatedRequests = await getDeletionRequests();
        return NextResponse.json({
          ok: true,
          message: `تم تعديل فترة الإبقاء القانونية إلى ${days} يوماً بنجاح.`,
          request: updated,
          requests: updatedRequests,
        });
      }

      case "restore": {
        if (!requestId) {
          return NextResponse.json(
            { ok: false, error: "معرف الطلب مطلوب لاستعادة الحساب" },
            { status: 400 }
          );
        }
        const restored = await restoreAccount(requestId);
        if (!restored) {
          return NextResponse.json(
            { ok: false, error: "لم يتم العثور على الطلب لاستعادته" },
            { status: 404 }
          );
        }
        const updatedRequests = await getDeletionRequests();
        return NextResponse.json({
          ok: true,
          message: "تم إلغاء طلب الحذف واستعادة الحساب بنجاح.",
          request: restored,
          requests: updatedRequests,
        });
      }

      default:
        return NextResponse.json(
          { ok: false, error: `إجراء غير معروف: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}
