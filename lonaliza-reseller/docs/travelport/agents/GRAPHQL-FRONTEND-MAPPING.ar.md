# ربط وثائق Travelport Air v11 ↔ GraphQL (tourism_api) ↔ واجهات booking-frontend

## مبدأ الأمان (قبل أي توسيع للواجهة)

- كل عملية جديدة على **GraphQL** تمر عبر: `assertModuleEnabled` + تسجيل دخول/نطاق حجز (`bookingViewerScope` حيث ينطبق).
- **لا** تعريض مسارات `documents/*`, `queue/*`, `exchangesearch/*` للعميل النهائي قبل مراجعة صلاحيات دور (Admin vs Portal).
- التحقق من المدخلات على الخادم (مثال بدء التنفيذ: `travelportInputGuards.ts` لـ PNR و UUID الـ workbench).

## GraphQL الحالي (ملخص من `air.graphql`)

| نوع | اسم الحقل | غرض تقريبي |
|-----|------------|-------------|
| Query | searchFlights | بحث كتالوج |
| Query | flightOfferById | كاش العرض |
| Query | flightSeatMap | خريطة مقعد ما بعد البحث |
| Query | flightBaggageQuoteForOffer | أمتعة مدفوعة عند الدفع |
| Query | flightAncillaryCatalogForOffer | كتالوج ancillaries |
| Query | flightBooking / myFlightBookings | حجوزات |
| Query | flightPostBookingAncillaryCatalog / flightSeatMapForBooking / … | ما بعد التذكرة |
| Mutation | createFlightBooking | مسار الحجز الرئيسي |
| Mutation | cancelFlightBooking | إلغاء |
| Mutation | commitFlightBaggagePurchase / commitFlightSeatPurchase | فواتير لاحقة |
| Mutation | cancelFlightPostBookingAncillary | **معلّق** حتى canceloffer كامل |

## أين الفرونت (booking-frontend)

- استعلامات/طفرات: `booking-frontend/src/graphql/queries/flights.ts`, `mutations/flights.ts`, `queries/flightPostOps.ts`, `mutations/flightPostOps.ts`
- تدفق الحجز: `booking-frontend/src/components/pages/flight/flight-booking/**`
- لوحة المستخدم: `booking-frontend/src/components/pages/userDashboard/myBooking/flight/**`

## فجوات مقابل الجرد الكامل (`FULL-AIR-V11-LITERAL-INTEGRATION-INVENTORY.ar.md`)

كل صف في الجرد يحتاج واحدًا من:

1. **مغطى ضمنيًا** عبر مسار موجود (مثلاً workbench داخل `airBookingAdapter` دون تكرار المسار في الملفات).
2. **دالة خلفية جديدة** في `TravelportAirAdapter` / `TravelportAirBookingAdapter` + (إن لزم) **Query/Mutation** في `air.graphql` + resolver في `airResolver.ts` + استدعاء من `AirService`.
3. **واجهة عميل** في `booking-frontend` (أو لوحة وكيل) مع نفس قواعد الأمان أعلاه.

المرحلة التالية المقترحة (بدون تجاوز صلاحية المنتج): ربط **fare rules** و **AirPrice** و **buildnext/options** بـ GraphQL للقراءة فقط (خادم-إلى-خادم مع cache قصير)، ثم واجهات اختيارية في صفحة تفاصيل الرحلة.

