import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import {
  submitCustomerReview,
  type ServiceType,
} from "@/lib/server/customer-reviews-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const customer = await getRequestCustomer(req);
    if (!customer?.id) {
      return NextResponse.json(
        { ok: false, error: "يجب تسجيل الدخول أولاً لإضافة تقييمك." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "بيانات غير صالحة." },
        { status: 400 }
      );
    }

    const serviceType = String(body.serviceType || "").toLowerCase() as ServiceType;
    if (!["hotel", "transfer", "car", "tour"].includes(serviceType)) {
      return NextResponse.json(
        { ok: false, error: "نوع الخدمة غير مدعوم للتقييم. (تقييمات الطيران غير متاحة)" },
        { status: 400 }
      );
    }

    const serviceId = String(body.serviceId || "").trim();
    if (!serviceId) {
      return NextResponse.json(
        { ok: false, error: "معرّف الخدمة مطلوب." },
        { status: 400 }
      );
    }

    const rating = Number(body.rating) || 5;
    const title = String(body.title || "").trim();
    const comment = String(body.comment || "").trim();

    if (!comment || comment.length < 5) {
      return NextResponse.json(
        { ok: false, error: "يرجى كتابة رأيك بالتفصيل (5 أحرف على الأقل)." },
        { status: 400 }
      );
    }

    const photos = Array.isArray(body.photos) ? body.photos : [];

    const result = await submitCustomerReview({
      userId: customer.id,
      userName: customer.name || "عميل لوناليزا",
      userAvatar: customer.avatarUrl,
      serviceType,
      serviceId,
      serviceName: body.serviceName ? String(body.serviceName) : undefined,
      bookingId: body.bookingId ? String(body.bookingId) : undefined,
      rating,
      title,
      comment,
      photos,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "تعذر إرسال التقييم." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      review: result.review,
      message:
        result.review?.status === "approved"
          ? "شكراً لك! تم اعتماد تقييمك ونشره بنجاح."
          : "شكراً لك! تم إرسال تقييمك وسيتم اعتماده خلال دقائق.",
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { ok: false, error: "حدث خطأ غير متوقع أثناء إرسال التقييم." },
      { status: 500 }
    );
  }
}
