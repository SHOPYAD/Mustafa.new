# مراحل تكامل Travelport Air v11 (Backend + Frontend)

**المصادر الرسمية (مرجعية):**

- جدول المسارات: `AirEndpointsList11.html` (دليل Travelport+ JSON Air v11).
- المصفوفة المحلية: `docs/travelport/agents/endpoint-matrix.v1.yaml` + `docs/travelport/agents/travelport-air-v11-endpoints.manifest.json`.
- Swagger محلي (هياكل الطلب/الرد): `docs/GDS_ExchangeAPIs_DevKit_23.11.18.21.17/Swagger/` — مثال Payment Offer: `Payment-11.10.1-resolved.json` (يحتوي قاعدة `…/11/air/paymentoffer`).

**ملاحظة على `endpoint-matrix.v1.yaml`:** بعض الصفوف تُعلَم `MISSING` لأن سكربت المسح يبحث عن **سلسلة مسار ثابتة** داخل المستودع، بينما المسارات تُركَّب داخل دوال (مثل `airBookingAdapter.ts`). راجع الدالة الفعلية قبل اعتبار المسار غير مطبّق.

---

## سياسة المنتج (قرار الملكية)

| الفئة | ماذا تستخدم |
|--------|-------------|
| **المستأجر / وكالة السفر** | التكامل **الجاهز** عبر المنصة فقط: بحث، حجز، دفع، إدارة حجز العميل (أمتعة/مقاعد/إضافات/تعديلات عند تفعيل القدرات)، **بدون** JSON خام أو مسارات GDS منخفضة المستوى. |
| **المنصة (المدير العام / التشغيل / الدعم الفني)** | إكمال وصيانة **جميع** مراحل الربط مع Travelport حسب الوثائق، بما فيها المراحل التي لا تُعرض للمستأجر (اختبار، أدوات داخلية، Postman/GraphQL بصلاحيات إدارية عند الحاجة). |

---

## مبدأ التنفيذ التقني

كل مرحلة تمر عادةً بـ: **adapter في `tourism_api`** → **AirService** → **GraphQL** (مع `assertModuleEnabled` + ربط الحجز/الـ PNR) → **`booking-frontend`** فقط عندما تكون التجربة آمنة للعميل النهائي.

مسارات **NON_AIR_BASE** (بدون بادئة `11/air/`) تتطلّب التحقق من قاعدة الـ URL وصلاحيات الـ PCC في الوثائق قبل الربط.

**إنتاج (RULE 14):** أي حقل أو عملية GraphQL جديدة في subgraph → إعادة تكوين الـ supergraph + إعادة تشغيل الـ gateway بالترتيب الصحيح.

إعادة توليد المصفوفة: `node scripts/travelport/build-travelport-endpoint-matrix.mjs`

---

## المرحلة 1 — إيصالات، تذاكر، EMD (قراءة) — **مكتملة**

| المسار (مختصر) | الدور |
|-----------------|--------|
| `GET …/receipt/reservations/{Locator}/receipts` | قائمة إيصالات مرتبطة بالـ PNR |
| `POST …/ticket/tickets/getbylocator` | تذاكر حسب المُحدّد + أرقام تذاكر اختيارية |
| `GET …/ticket/tickets/{ticketID}` | تذكرة بالمعرّف |
| `GET …/emds/{EMDNumber}` | EMD بالرقم |

**تنفيذ الخلفية:** `airBookingAdapter.ts` (`getReceiptsByLocator`, `postTicketsGetByLocator`, `getTicketById`, `getEmdByNumber`) ← `airService.ts` ← `airResolver.ts` (استعلامات `flightTravelport*`).

**واجهة العميل:** `booking-frontend` — عرض منظم بالإنجليزية عبر `travelportCustomerPanelModel.ts` + `FlightBookingManagePage.tsx` (**بدون** JSON خام للعميل).

---

## المرحلة 2 — كتابة: إيصال workbench، إيصالات PNR، تحديث حالة تذكرة، PUT EMD — **مكتملة خلفياً؛ للمنصة فقط في الواجهة**

| المسار |
|--------|
| `POST …/receipt/reservation/{workbenchID}/receipts?OfferIdentifier={OfferID}` |
| `POST …/receipt/reservations/{LocatorCode}/receipts` |
| `PUT …/ticket/tickets/updatestatus/{ticketID}` |
| `PUT …/emds/{EMDNumber}` |

**GraphQL (موجود):**  
`flightTravelportPostReceiptWorkbenchForBooking`, `flightTravelportPostReceiptsByLocatorForBooking`, `flightTravelportPutTicketStatusForBooking`, `flightTravelportPutEmdForBooking` — الجسم: `TravelportJsonBodyInput.payloadJson`.  
إن وُجد `providerDetails.openWorkbenchId` على الحجز، يجب أن يطابق `workbenchId` في مسار الإيصال على الـ workbench (يُفرَض في `AirService.assertTravelportOpenWorkbenchMatchesBooking`).

**الواجهة:** لا تُعرض للمستأجر؛ الاستدعاء من **أدوات المنصة** (GraphQL للمدير، سكربتات اختبار، إلخ) حسب سياسة الملكية أعلاه.

---

## المرحلة 3 — Payment Offer (مدفوعات تذكير NDC / مسار الدفع على الـ workbench) — **غير مربوطة بعد**

| المسار (من المانفيست) |
|------------------------|
| `POST 11/air/paymentoffer/reservationworkbench/{workbenchID}/payments` |
| `POST 11/air/paymentoffer/reservationworkbench/{workbenchID}/payments/{paymentID}` |

**المرجع:** `Payment-11.10.1-resolved.json` + أمثلة Postman في `docs/GDS_ExchangeAPIs_DevKit_23.11.18.21.17/PostmanSuite/`.

**الخطوة التالية:** إضافة دوال في `airBookingAdapter.ts` (أو وحدة فرعية مخصصة) تستدعي `makeRequest` بنفس نمط `formofpayment`/`postBooking`، ثم طبقة `AirService` + **استعلام/طفرة GraphQL بحصرية منصة** (أو استهلاك داخلي من مسار التذكير الحالي إن وُجد)، مع اختبار sandbox على `api.pp.travelport.com`.

---

## المرحلة 4 — Travel Agency على workbench (بيانات الوكالة على الجلسة) — **غير مربوطة بعد**

مجموعة مسارات `…/ticket/travelagency/reservationworkbench/{workbenchID}/travelagency…` (إنشاء وكالة، إيميل، هاتف، عنوان، رمز شركة، تحديثات/حذف).

**الخطوة التالية:** قراءة فصل Travel Agency في دليل الحجز الرسمي؛ تنفيذ adapter + حراسة مدخلات؛ عدم تعريضها لبوابة المستأجر — استخدام داخلي أو إعدادات وكالة على مستوى المنصة فقط.

---

## المرحلة 5 — إلغاء عناصر، أهلية تغيير التذكرة، بحث التبديل — **جزئي / غير مكتمل**

| المسار | الحالة في المستودع |
|--------|-------------------|
| `POST 11/book/reservationworkbench/{workbenchID}/reservations/cancelitems` | غير موصول (NON_AIR_BASE) |
| `POST 11/eligibility/ticketchangeeligibilities` | غير موصول |
| `POST 11/exchangesearch/catalogofferingsairchange` | الثابت `TP_EXCHANGE_SEARCH_CATALOG` في `travelportNonAirEndpoints.ts` **فقط** — لا يوجد استدعاء فعلي مؤكد في `tourism_api` حتى الآن |

**الخطوة التالية:** ربط إلغاء/تبديل الطيران الحالي في المنصة بهذه المسارات حيث ينطبق سجل Travelport (GDS vs NDC) وفق `flightBookingCapabilities` و`FLIGHT_POST_OPS_DOC_MATRIX.md`.

---

## المرحلة 6 — `POST 11/air/search/airAvailability` — **غير مربوطة بعد**

مخصصة لإعادة التحقق من التوفر بنمط الوثائق (مختلفة عن مسار الكتالوج الحالي للبحث إن وُجد).

**الخطوة التالية:** تحديد أين يستبدل أو يكمّل مسار `availability` الحالي في `airAdapter.ts` / المتابعات؛ مواءمة الحمولة مع Swagger الرسمي؛ اختبار مقابل `catalogproductofferings` لتجنب ازدواجية منطقية.

---

## المرحلة 7 — documents + queue — **ثوابت فقط / تتطلب صلاحيات إدارية**

| المسار | الملف |
|--------|--------|
| `POST 11/documents/void`, `POST 11/documents/history`, `GET 11/documents/documentlist/{Locator}` | `travelportNonAirEndpoints.ts` |
| `POST 11/queue/queue`, `…/list`, `…/remove` | نفس الملف |

**الحالة:** تعريف المسارات موجود؛ **لا** يوجد تدفق منتج مكتمل عبر `AirService`/GraphQL للمستأجر — وهذا مقصود لأنها عمليات حساسة (void، طوابير GDS).

**الخطوة التالية:** إن لزم للمنصة: طبقة خدمة داخلية + **صلاحية super-admin** + تدقيق تدقيق؛ عدم فتحها لـ tenant عادي.

---

## ترتيب مقترح للتنفيذ (للفريق التقني للمنصة)

1. **المرحلة 3** إن كان مسار التذكير/NDC يحتاج Payment Offer في الإنتاج الفعلي.  
2. **المرحلة 5** (`cancelitems` + `eligibility` + ربط `exchangesearch`) لأنها تقاطع إلغاء وتغيير الحجز.  
3. **المرحلة 6** عند الحاجة لتوحيد “إعادة فحص التوفر” مع الوثائق.  
4. **المرحلة 4** عند تفعيل سيناريوهات وكالة متقدمة على الـ workbench.  
5. **المرحلة 7** حسب احتياج التشغيل (void / queue) مع حوكمة صارمة.

بهذا يبقى التزامك: **أنت تكمل التكامل حتى النهاية حسب الوثائق**؛ والمستأجرون يبقون على **المنتج الجاهز** دون مسارات خطرة أو JSON خام.
