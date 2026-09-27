import { NextResponse } from "next/server";
import { resolveOfficialInvoice } from "@/lib/server/invoice-resolver";
import { sendWhatsAppMessage } from "@/lib/automation/channels/whatsapp";
import { sendMail } from "@/lib/server/email/send";
import { getRequestCustomer } from "@/lib/pocketbase/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      bookingId?: string;
      channel?: "whatsapp" | "email" | "both";
      targetEmail?: string;
      targetPhone?: string;
      lang?: string;
    };

    const bookingId = body.bookingId;
    if (!bookingId) {
      return NextResponse.json({ ok: false, error: "booking_id_required" }, { status: 400 });
    }

    const invoice = await resolveOfficialInvoice(bookingId);
    if (!invoice) {
      return NextResponse.json({ ok: false, error: "invoice_not_found" }, { status: 404 });
    }

    const channel = body.channel || "both";
    const userSession = await getRequestCustomer(req).catch(() => null);

    const targetEmail = body.targetEmail || userSession?.email || invoice.customer.email || "elhayatferdos@gmail.com";
    const targetPhone = body.targetPhone || invoice.customer.phone || "+905015709201";

    const results: {
      whatsapp?: { ok: boolean; error?: string };
      email?: { ok: boolean; error?: string };
    } = {};

    // 1. Send via WhatsApp
    if (channel === "whatsapp" || channel === "both") {
      const waText = [
        `🧾 *فاتورة رسمية معتمدة وموثقة - لوناليزا للسياحة والسفر*`,
        ``,
        `مرحباً بك *${invoice.customer.name}*،`,
        `تم إصدار وتوثيق فاتورة حجزك الرسمية رقم: *${invoice.invoiceNumber}* بنجاح.`,
        ``,
        `✈️ *الخدمة:* ${invoice.bookingDetails.title}`,
        `🎫 *رمز الحجز (PNR):* ${invoice.bookingDetails.pnr}`,
        `💰 *المبلغ الإجمالي المسدد:* $${invoice.pricing.netTotal.toFixed(2)} ${invoice.pricing.currency}`,
        `💳 *وسيلة الدفع:* ${invoice.bookingDetails.paymentMethod}`,
        `📅 *تاريخ الإصدار:* ${invoice.issuedAt.slice(0, 10)}`,
        ``,
        `🔒 *رابط الفاتورة الموثقة وكود التحقق الرقمي (QR Code):*`,
        `${invoice.verifyUrl}`,
        ``,
        `_تعتبر هذه الفاتورة وثيقة مالية رسمية صادرة إلكترونياً وتخضع للوائح TÜRSAB و IATA._`,
        `شكراً لاختيارك شركة لوناليزا للسياحة والسفر! 🌍✈️`,
      ].join("\n");

      try {
        const waRes = await sendWhatsAppMessage({
          to: targetPhone,
          body: waText,
          kind: "transactional",
        });
        results.whatsapp = { ok: waRes.ok, error: waRes.error };
      } catch (err: any) {
        results.whatsapp = { ok: false, error: err?.message || "whatsapp_send_failed" };
      }
    }

    const lang = body.lang || "ar";

    // 2. Send via Email (with Attached Official PDF Document)
    if (channel === "email" || channel === "both") {
      let pdfBuffer: Buffer | null = null;
      try {
        const { generateOfficialInvoicePdfBuffer } = await import("@/lib/server/invoice-pdf-service");
        pdfBuffer = await generateOfficialInvoicePdfBuffer(invoice, lang);
      } catch (pdfErr) {
        console.error("[send-invoice-pdf-error]", pdfErr);
      }

      const emailSubject = `فاتورة حجزك الرسمية رقم ${invoice.invoiceNumber} - لوناليزا للسياحة والسفر`;
      const emailHtml = `
        <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #18082e 0%, #290e48 100%); padding: 30px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #f59e0b;">LONALIZA TRAVEL</h1>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #e2e8f0;">شركة لوناليزا للسياحة والسفر المحدودة</p>
              <div style="display: inline-block; margin-top: 15px; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: bold; color: #fcd34d;">
                فاتورة ضريبية رسمية معتمدة وموثقة رقمياً
              </div>
            </div>

            <div style="padding: 24px 30px;">
              <p style="font-size: 15px; margin-top: 0;">عزيزي العميل <strong>${invoice.customer.name}</strong>،</p>
              <p style="font-size: 13px; color: #475569;">
                يسعدنا إبلاغك بأنه تم تأكيد حجزك وإصدار الفاتورة الرسمية المعتمدة وتوثيقها عبر الرمز الرقمي المشفر.
                <strong>تم إرفاق نسخة الفاتورة الرسمية كاملة كملف PDF مع هذه الرسالة للتحميل المباشر.</strong>
              </p>

              <div style="background: #f1f5f9; border-radius: 14px; padding: 18px; margin: 20px 0;">
                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">رقم الفاتورة:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: left; font-family: monospace; color: #18082e;">${invoice.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">رمز الحجز (PNR):</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: left; font-family: monospace; color: #92400e;">${invoice.bookingDetails.pnr}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">الخدمة المحجوزة:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: left;">${invoice.bookingDetails.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">تاريخ المعاملة:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: left; font-family: monospace;">${invoice.issuedAt.slice(0, 10)}</td>
                  </tr>
                  <tr style="border-top: 1px solid #cbd5e1;">
                    <td style="padding: 10px 0 6px 0; font-weight: bold; color: #0f172a;">المبلغ الكلي المدفوع:</td>
                    <td style="padding: 10px 0 6px 0; font-weight: bold; text-align: left; font-size: 16px; color: #18082e;">$${invoice.pricing.netTotal.toFixed(2)} ${invoice.pricing.currency}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <a href="${invoice.verifyUrl}" style="background: #18082e; color: #f59e0b; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(24,8,46,0.3);">
                  عرض الفاتورة الرسمية الموثقة عبر الإنترنت
                </a>
              </div>

              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                يمكن مسح كود الـ QR الموجود في الفاتورة بواسطة كاميرا الهاتف الذكي للتحقق الفوري من صحة الوثيقة في أي وقت ودون الحاجة لتسجيل الدخول.
              </p>
            </div>
          </div>
        </div>
      `;

      try {
        const mailAttachments = pdfBuffer
          ? [
              {
                filename: `Invoice-${invoice.invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
                contentDisposition: "attachment" as const,
              },
            ]
          : undefined;

        const mailRes = await sendMail({
          to: targetEmail,
          subject: emailSubject,
          html: emailHtml,
          attachments: mailAttachments,
        });
        results.email = { ok: mailRes.ok, error: "error" in mailRes ? mailRes.error : undefined };
      } catch (err: any) {
        results.email = { ok: false, error: err?.message || "email_send_failed" };
      }
    }

    return NextResponse.json({
      ok: true,
      invoiceNumber: invoice.invoiceNumber,
      verifyUrl: invoice.verifyUrl,
      results,
      recipient: {
        name: invoice.customer.name,
        email: targetEmail,
        phone: targetPhone,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "internal_error" }, { status: 500 });
  }
}
