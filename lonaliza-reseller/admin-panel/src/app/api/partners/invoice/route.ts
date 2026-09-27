import { NextResponse } from "next/server";
import { getAuthenticatedPartnerCompany } from "@/lib/server/partner-session";
import { getCompanyLicense, getResellerSettings } from "@/lib/server/resale-store";
import { getCompanyWallet } from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const company = await getAuthenticatedPartnerCompany();
    if (!company) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || (company.planType === "ownership" ? "lifetime" : "whitelabel");
    const [license, settings, wallet] = await Promise.all([
      getCompanyLicense(company.id),
      getResellerSettings(),
      getCompanyWallet(company.id),
    ]);

    const invoiceNumber = `INV-${new Date().getFullYear()}-${company.id.slice(-6).toUpperCase()}`;
    const invoiceDate = new Date(company.created || Date.now()).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const itemName =
      type === "lifetime"
        ? "باقة الترخيص الدائم الكاملة لمنظومة لوناليزا السياحية (Lonaliza Enterprise License + Contabo Cloud VPS)"
        : company.planType === "whitelabel_paid"
        ? "اشتراك منظومة الوايت ليبل السياحية الشاملة (Lonaliza Cloud White Label Suite)"
        : "باقة الوايت ليبل السحابية المجانية مع ديبوزيت B2B (Lonaliza Free White Label & B2B Redistribution)";

    const itemPrice =
      type === "lifetime"
        ? settings.lifetimePrice
        : company.planType === "whitelabel_paid"
        ? 199
        : 0;

    const depositAmount = wallet.availableBalance > 0 ? wallet.availableBalance : 2000;
    const totalAmount = itemPrice;

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>فاتورة ضريبية رسمية — ${invoiceNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 40px 20px;
    }
    .invoice-card {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);
      border: 1px solid #e2e8f0;
      padding: 45px 50px;
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 25px;
      margin-bottom: 30px;
    }
    .brand h1 {
      font-size: 26px;
      margin: 0 0 6px 0;
      color: #09090b;
      font-weight: 800;
    }
    .brand p {
      font-size: 13px;
      color: #64748b;
      margin: 2px 0;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 35px;
    }
    .box {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #edf2f7;
    }
    .box h3 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin: 0 0 12px 0;
    }
    .box p {
      margin: 5px 0;
      font-size: 14px;
      color: #1e293b;
    }
    .table-container {
      margin: 30px 0;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: right;
    }
    th {
      background: #f1f5f9;
      padding: 12px 16px;
      font-size: 13px;
      color: #475569;
      font-weight: 600;
      border-radius: 6px;
    }
    td {
      padding: 16px;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .totals {
      width: 320px;
      margin-right: auto;
      margin-left: 0;
      border-collapse: collapse;
    }
    .totals td {
      padding: 8px 12px;
      border: none;
    }
    .total-row td {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      border-top: 2px solid #e2e8f0;
      padding-top: 14px;
    }
    .footer {
      margin-top: 45px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .print-btn {
      position: absolute;
      top: 30px;
      left: 30px;
      background: #0f172a;
      color: #fff;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-card { box-shadow: none; border: none; padding: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <button class="print-btn" onclick="window.print()">
      🖨️ طباعة الفاتورة / حفظ كـ PDF
    </button>

    <div class="header">
      <div class="brand">
        <h1>فاتورة ضريبية رسمية (TAX INVOICE)</h1>
        <p><strong>الجهة المصدرة:</strong> شركة لوناليزا للسياحة والتجارة العامة المحدودة</p>
        <p>LONALIZA TURIZM VE TICARET ANONIM SIRKETI</p>
        <p>إسطنبول — الجمهورية التركية | الرقم الضريبي: 9810458124 (Vergi No)</p>
      </div>
      <div>
        <span class="badge">مدفوعة ومكتملة ✓</span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="box">
        <h3>بيانات الفاتورة</h3>
        <p><strong>رقم الفاتورة:</strong> ${invoiceNumber}</p>
        <p><strong>تاريخ الإصدار:</strong> ${invoiceDate}</p>
        <p><strong>العملة المعتمدة:</strong> دولار أمريكي (USD)</p>
        <p><strong>طريقة الدفع:</strong> بطاقة ائتمانية / تحويل مصرفي معتمد</p>
      </div>
      <div class="box">
        <h3>بيانات العميل / الشركة الشريكة</h3>
        <p><strong>اسم الشركة:</strong> ${company.companyName} ${company.companyNameAr ? `(${company.companyNameAr})` : ""}</p>
        <p><strong>البريد الإلكتروني:</strong> ${company.email}</p>
        <p><strong>السجل الضريبي (Tax ID):</strong> ${company.taxId || "مسجل لدى المنظومة"}</p>
        <p><strong>السجل التجاري (CR):</strong> ${company.commercialReg || "غير مدخل"}</p>
        <p><strong>العنوان المسجل:</strong> ${company.legalAddress || "تركيا / الشرق الأوسط"}</p>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>البيان والخدمة</th>
            <th>الكمية</th>
            <th>السعر الإفرادي</th>
            <th>المجموع الصافي</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>
              <strong>${itemName}</strong><br>
              <span style="font-size:12px;color:#64748b;">
                ${license ? `مفتاح الترخيص: ${license.licenseKey} | ` : ""}
                ${company.requestedDomain ? `النطاق المرخص: ${company.requestedDomain}` : "استضافة سحابية"}
              </span>
            </td>
            <td>1</td>
            <td>$${itemPrice.toLocaleString()}</td>
            <td>$${itemPrice.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <table class="totals">
      <tr>
        <td>المجموع الفرعي (Subtotal):</td>
        <td style="text-align:left;">$${itemPrice.toLocaleString()}</td>
      </tr>
      <tr>
        <td>ضريبة القيمة المضافة (KDV 0% - تصدير برمجيات):</td>
        <td style="text-align:left;">$0.00</td>
      </tr>
      <tr class="total-row">
        <td>الإجمالي الصافي النهائي (Total):</td>
        <td style="text-align:left;">$${totalAmount.toLocaleString()} USD</td>
      </tr>
    </table>

    <div class="footer">
      <div>
        <p>تعتبر هذه الفاتورة وثيقة مالية رسمية صادرة آلياً ومسجلة في منظومة لوناليزا B2B.</p>
        <p>لأي استفسار مالي أو تدقيق ضريبي: support@lonaliza.com</p>
      </div>
      <div style="text-align: left;">
        <p>رمز التحقق المشفر: <strong>${invoiceNumber}-${company.id.slice(0, 4)}</strong></p>
        <p>lonalliza.com/partners</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate invoice";
    return new Response(msg, { status: 500 });
  }
}
