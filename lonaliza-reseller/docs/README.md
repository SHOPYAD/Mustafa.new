# Documentation & MCP Specification Servers Index

Lonaliza platform documentation and Enterprise MCP (Model Context Protocol) specification bridges for AI agents and development teams.

---

## 🚀 خوادم مواصفات ونقاط نهاية الموردين (MCP Specification Servers)

تتضمن هذه الحزمة خادمي MCP معتمدين يوفران لكافة الوكلاء البرمجيين (Cursor, Windsurf, Claude Code, Antigravity) المواصفات البرمجية الدقيقة لجميع نقاط نهاية الموردين (Schemas, Headers, URLs, Validation Rules, Mock Payloads, TypeScript Scaffolding):

### 1. `travel-multi-provider-spec-mcp`
- **المسار:** `/www/wwwroot/lonaliza.com/docs/travel-providers-spec-mcp/travel-providers-spec-mcp`
- **التشغيل:** `node dist/index.js`
- **الموردون المدعومون (63 نقطة نهاية معتمدة):**
  1. **Travelport (Travelport+):**
     - **Air JSON APIs v11:** `POST /11/air/search/searchcomplete`, `POST /11/air/price/price`, `POST /11/air/book/airreservation`, `POST /11/air/ticket/ticket`, `POST /11/air/cancel/cancel`, `POST /11/air/seats/seatmaps`, `POST /11/air/ancillary/catalog`.
     - **Hotel Universal JSON v12:** `POST /12/hotel/search/searchcomplete` (جلب صور CDN الحقيقية من Leonardo وIcePortal وأسعار ورموز الغرف الحقيقية من الـ GDS).
     - **Hotel Stays v11:** `POST /stays/search/hotels`, `POST /stays/rates`, `POST /stays/bookings`, `POST /stays/bookings/{id}/cancel`.
  2. **PKFARE (Flights & Hotels API):**
     - **Air Endpoints:** `POST /json/shoppingV10`, `POST /json/shoppingV8`, `POST /json/precisePricing_V12`, `POST /json/penaltyV4`, `POST /json/preciseBooking_V8`, `POST /json/orderPricingV6`, `POST /json/ticketing`, `POST /json/requestTicketing`, `POST /json/orderDetail/V14`, `POST /json/cancel`, `POST /json/refundPricing/generate`, `POST /json/refund-api/refundRequest`, `POST /json/refund-api/checkRefund`, `POST /json/voiding/v2`, `POST /json/change/reshop`, `POST /json/ancillaryPricingV6`. اختبار الاتصال يتم عبر Shopping V10 — لا يوجد `/balance` في واجهة المشتري.
  3. **Seeru (Seeru Travel B2B API v1.0.0):**
     - **Seeru Flights (12 نقطة نهاية):** `GET /v1/flights/search/...`, `GET /v1/flights/result/{id}`, `POST /v1/flights/booking/fare`, `POST /v1/flights/booking/save`, `POST /v1/flights/order/issue`, `POST /v1/flights/order/cancel`.
     - **Seeru Hotels (9 نقاط نهاية):** `POST /v1/hotels/search`, `GET /v1/hotels/result/{id}`, `POST /v1/hotels/rooms`, `POST /v1/hotels/fare`, `POST /v1/hotels/booking`, `POST /v1/hotels/order/issue`, `GET /v1/hotels/voucher`, `POST /v1/hotels/cancel`.
     - **Seeru Rides/Transfers:** `POST /v1/ride/search`, `POST /v1/ride/book`.
  4. **Hotelbeds (APItude API):**
     - `POST /hotel-api/1.0/hotels`, `POST /hotel-api/1.0/checkrates`, `POST /hotel-api/1.0/bookings`, `DELETE /hotel-api/1.0/bookings/{id}`.
  5. **BiletBank (Technoly İstanbul BBOST API):**
     - `POST /api/flight/search`, `POST /api/flight/price`, `POST /api/flight/book`, `POST /api/flight/ticket`.
  6. **Paraşüt (Paraşüt API v4 - E-Fatura & E-Arşiv):**
     - `POST /oauth/token`, `GET/POST /v4/{company_id}/contacts`, `POST /v4/{company_id}/sales_invoices`, `POST /v4/{company_id}/e_archives`, `GET /v4/{company_id}/e_archives/{id}/pdf`.
  7. **SkyScrapper (apiheya RapidAPI):**
     - `GET /api/v2/flights/searchFlights`, `GET /api/v1/flights/searchAirport`, `GET /api/v1/flights/getPriceCalendar`, `GET /api/v1/checkServer`.

### 2. `etg-spec-docs-mcp` (RateHawk / Emerging Travel Group)
- **المسار:** `/www/wwwroot/lonaliza.com/docs/etg-spec-docs-mcp/etg-spec-docs-mcp`
- **التشغيل:** `node dist/index.js`
- **النقاط المدعومة (10 نقاط نهاية):**
  1. `search_by_region`: `POST /api/b2b/v3/search/serp/region/`
  2. `search_by_hotels`: `POST /api/b2b/v3/search/serp/hotels/`
  3. `multicomplete`: `POST /api/b2b/v3/search/multicomplete/`
  4. `retrieve_hotelpage`: `POST /api/b2b/v3/search/hp/`
  5. `prebook_rate`: `POST /api/b2b/v3/hotel/prebook/`
  6. `create_booking_form`: `POST /api/b2b/v3/hotel/order/booking/form/`
  7. `start_booking_finish`: `POST /api/b2b/v3/hotel/order/booking/finish/`
  8. `check_booking_status`: `POST /api/b2b/v3/hotel/order/booking/finish/status/`
  9. `order_info`: `POST /api/b2b/v3/hotel/order/info/`
  10. `cancel_order`: `POST /api/b2b/v3/hotel/order/cancel/`

---

## 🛠️ كيفية تفعيل خوادم MCP في المحررات والوكلاء (Agent Configuration)

أضف الإعدادات التالية إلى ملف إعدادات الـ MCP (مثل `~/.cursor/mcp.json` أو في إعدادات العميل):

```json
{
  "mcpServers": {
    "travel-providers": {
      "command": "node",
      "args": [
        "/www/wwwroot/lonaliza.com/docs/travel-providers-spec-mcp/travel-providers-spec-mcp/dist/index.js"
      ]
    },
    "etg-docs": {
      "command": "node",
      "args": [
        "/www/wwwroot/lonaliza.com/docs/etg-spec-docs-mcp/etg-spec-docs-mcp/dist/index.js"
      ]
    }
  }
}
```

---

## 📂 فهرس وثائق الموردين (Provider Documentation Map)

| المجلد / الملف | الوصف ومحتوى الوثيقة |
| --- | --- |
| [`pkfare_api_docs/`](pkfare_api_docs/) | التوثيق الكامل لواجهات PKFARE للطيران (Shopping, Pricing, Booking, Refund, Void) |
| [`travelport/`](travelport/) | أدلة Travelport JSON APIs Air v11 وUniversal Hotel API v12 وDevKit |
| [`Seeru_Hotels_v1.0.0_Integration_Guide.md`](Seeru_Hotels_v1.0.0_Integration_Guide.md) | دليل التكامل الشامل لفنادق Seeru (البحث، الغرف، فحص السعر، الحجز، الإلغاء) |
| [`Seeru_Hotels_v1.0.0_LIVE_Production_Guide.md`](Seeru_Hotels_v1.0.0_LIVE_Production_Guide.md) | دليل النشر المباشر لفنادق Seeru في بيئة الإنتاج |
| [`Seeru_Ride_v1.0.0_Integration_Guide.md`](Seeru_Ride_v1.0.0_Integration_Guide.md) | دليل تكامل خدمة التوصيل والنقل الخاص من Seeru |
| [`flights/Sky_Scrapper_Flight_Endpoints.md`](flights/Sky_Scrapper_Flight_Endpoints.md) | وثيقة نقاط نهاية سكرابر جوجل فلايتس وسكاي سكانر عبر RapidAPI |
| [`التوثيق البرمجي الحي المباشر لمنصة باراشوت Paraşüt API v4 - سبتمبر 2026.md`](التوثيق%20البرمجي%20الحي%20المباشر%20لمنصة%20باراشوت%20Paraşüt%20API%20v4%20-%20%D8%B3%D8%A8%D8%AA%D9%85%D8%A8%D8%B1%202026.md) | الدليل الحي المباشر لمنظومة الفوترة الإلكترونية باراشوت Paraşüt API v4 |
| [`RESELLER-PLAN.MD`](RESELLER-PLAN.MD) | خطة معمارية نظام إعادة البيع والوكلاء الفرعيين (B2B Reseller) |
| [`hotels/hotels-plan.md`](hotels/hotels-plan.md) | خطة معمارية محرك الفنادق |
