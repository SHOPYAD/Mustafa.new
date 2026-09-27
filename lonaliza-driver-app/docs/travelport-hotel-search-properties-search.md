# Travelport Stays — بحث فنادق حسب الموقع (`POST …/hotel/search/properties/search`)

ملخص عملي لعملية **Hotel Search by Location** (إصدار الوثائق المذكور: **11.33.0**، أمان: **bearerAuth**). يكمّل ملف [`travelport-properties-response-propertiesresponse.md`](./travelport-properties-response-propertiesresponse.md) (شكل `PropertiesResponse`).

---

## 1. الملخص التنفيذي

| البند | القيمة |
|--------|--------|
| **HTTP** | `POST` |
| **المسار النسبي** | `/hotel/search/properties/search` |
| **المحتوى** | `application/json` — الجذر يحتوي كائن **`PropertiesQuerySearch`** (غالبًا ملفوفًا باسم الحقل كما في عيّنة الـ fetch). |
| **النتائج** | حتى **100** عقار في الصفحة؛ إن وُجد أكثر → **Search Pagination API** للصفحات التالية. |
| **تنسيق الرد** | نفس **`PropertiesResponse`** بغض النظر عن نوع البحث (إحداثيات، عنوان، مطار IATA، أو مدينة IATA). |

**Base URL:** في الأمثلة الرسمية يظهر أحيانًا  
`https://developer.travelport.com/_mock/apis/stays/hotel/search/properties/search`  
للمحاكاة فقط. للبيئة الحقيقية استخدم الـ base الذي يزودك به Travelport (مثل `api.pp.travelport.net` + بادئة المسار الصحيحة لـ Stays).

---

## 2. رؤوس الطلب (Headers)

| الرأس | ملاحظة |
|--------|--------|
| `Authorization` | `Bearer <JWT>` |
| `TraceId` | تتبع طلب/رد (hospitality). |
| `XAUTH_TRAVELPORT_ACCESSGROUP` | مجموعة الوصول. |
| `TVP-PCC-Core` | تمرير **PCC** بدل/إلى جانب Access Group (مثال وثائق: `DU7_1G`). |
| `TVP-Correlation-Id` | ربط عدة استدعاءات في نفس التدفق. |
| `Accept-Encoding` | **`gzip, deflate`** (مطلوب في الوثائق). |
| `Content-Type` | `application/json` |

---

## 3. جسم الطلب — `PropertiesQuerySearch`

### 3.1 حقول أساسية

| الحقل | إلزامي | ملاحظة |
|--------|--------|---------|
| `@type` | نعم | القيمة: **`PropertiesQuerySearch`**. |
| `CheckInDate` / `CheckOutDate` | نعم | **`YYYY-MM-DD`**. يجب أن يكون منطق الإقامة صحيحًا (عادة **خروج بعد دخول** بليلة واحدة على الأقل — راجع قواعد المزوّد). |
| `SearchBy` | نعم | أحد الأنواع: **`SearchByGeoLocation`**, **`SearchByAddress`**, **`SearchByAirport`**, **`SearchByCity`** + `@type` المطابق. |
| `RoomStayCandidate` | — | مصفوفة؛ داخلها **`GuestCounts`** مع **`GuestCount[]`** (كل عنصر: `count` 1–9، و`age` + `ageQualifyingCode` للأطفال مثل **`8`**، البالغون **`10`**). |
| `SortOrder` | — | `StarRating` أو `Proximity`. |
| `ImageSize` | — | `Large` \| `Medium` \| `Small` \| `Thumbnail` \| `ExtraLarge` — الوثائق تشير إلى أن **Thumbnail** لم يعد مدعومًا في سياق الجودة الحديثة للضيافة. |
| `ChainCodes` | — | حتى **6** رموز سلسلة (حرفان عادةً؛ قد تُوسَّع العلامات داخليًا). |
| `HotelName` | — | جزء من الاسم (≥ 3 أحرف)، غير حساس لحالة الأحرف؛ محارف مسموحة محددة في الوثائق. |
| `RequestedCurrency` | — | يفعّل **`CurrencyRateConversion`** في الرد لحساب التحويل خارج الـ API إن لزم. |
| `returnOnlyAvailablePropertiesInd` | — | `true` يقيّد بالعقارات ذات التوفر للتواريخ. |
| `returnAllImagesInd` | — | `true` = كل صور الحجم المطلوب؛ الافتراضي صورة واحدة مميزة. |
| `BrandCodes`, `PropertyAmenityCode`, `AggregatorList`, … | — | فلاتر/مزودون اختيارية حسب الحاجة. |

### 3.2 `SearchBy` ونصف القطر

- **`SearchRadius`**: للفنادق = نطاق حول الموقع؛ **`value`** كحد أقصى **25** ميلًا أو **40** كم حسب الوثائق؛ **`unitOfDistance`**: `Miles` \| `Kilometers` (الافتراضي يعتمد على الدولة: أمريكا/ميانمار/ليبيريا → أميال، غير ذلك → كيلومترات إن لم يُحدَّد).
- نوع **`SearchBy`** يحدد حقول إضافية (مطار IATA، مدينة، عنوان، إحداثيات) — راجع الـ OpenAPI الكامل لكل نوع.

### 3.3 `RateCandidates`

- `@type`: **`RateCandidates`**؛ **`RateCandidate`** مصفوفة؛ العناصر غالبًا **`RateCandidateDetail`**.
- يدعم حتى **8** رموز أسعار تفاوضية + فئات OTA، **`prePayRatesOnlyInd` / `postPayRatesOnlyInd` / `removeSpecialRatesInd`**, إلخ.
- للبحث الأولي يمكن تبسيط الطلب حسب سياسة المنتج (أحيانًا بدون تفاوض معقدة).

---

## 4. الرد `200` — `PropertiesResponse`

نفس الهيكل الموثّق في  
[`travelport-properties-response-propertiesresponse.md`](./travelport-properties-response-propertiesresponse.md):

- **`Properties.PropertyInfo[]`**: كل عنصر → `Property` (غالبًا `PropertyDetail`), `LowestAvailableRate`, `MaximumAvailableRate`, `availability`, `Distance`, `Identifier`, …
- **`Properties.totalProperties` / `propertiesPerPage` / `numberOfPages`**: ترقيم النتائج.
- **`Pagination`** على مستوى الاستجابة: `page`, `pageSize`, `totalPages`, `totalItems`.
- **`Result`**: `status`, **`Error[]`**, **`Warning[]`** — يجب قراءتها حتى لو HTTP = 200.
- **`Identifier` على `Properties`**: مهم لاحقًا للحجز/التصفح/التخزين المؤقت (ذاكرة العروض ~**30 دقيقة** حسب الوثائق).

---

## 5. الرد `400`

هيكل أخف يتضمن `transactionId`, `traceId`, `correlationId`, `reservationStatus`, `Result`, … — تعامل معه كفشل تحقق من الطلب أو بيانات ناقصة.

---

## 6. ربط `liotrip` (HotelsBookingDraft → طلب API)

| من التطبيق | إلى الحقل / المسار |
|------------|---------------------|
| وجهة (مطار/مدينة/إحداثيات/عنوان) | بناء كائن **`SearchBy`** المناسب + `@type`. |
| `checkIn` / `checkOut` (تقويم) | `CheckInDate` / `CheckOutDate` بصيغة `YYYY-MM-DD`. |
| وضع «مرن» | إما عدم استخدام هذا الـ endpoint للمرونة فقط، أو دمج مع تدفق Travelport إن وُجد مسار مطابق — **يُقرر من التوثيق**. |
| غرف / بالغين / أطفال | `RoomStayCandidate` + `GuestCount` (`ageQualifyingCode` للأطفال). |
| فلاتر الواجهة (نجوم، عملة، …) | `SortOrder`, `RequestedCurrency`, `ChainCodes`, `returnOnlyAvailablePropertiesInd`, … حسب التوفر في الـ API. |

---

## 7. ملاحظات على عيّنة الـ `fetch` المرفقة

1. **`CheckOutDate` = `CheckInDate`** في المثال — غالبًا **غير صالح** لإقامة ليلة؛ استخدم خروجًا بعد الدخول.
2. **`ChainCodes: ['strin']`** — خطأ مطبعي في المثال؛ استخدم رموز سلاسل حقيقية أو احذف المصفوفة إن لم تُستخدم.
3. **`BrandCodes`** في الوثائق **مصفوفة** مع مثال `"EM, EH"`؛ في الـ JSON كسلسلة واحدة قد لا يطابق المخطط — التزم بشكل الحقل في الـ OpenAPI الرسمي.
4. **`RateCandidates`** معقدة للبحث الأول — يمكن تقليل الحقول للتجربة ثم إضافة التفاوض لاحقًا.
5. لا تخزّن **Bearer** أو مجموعات الوصول في المستودع؛ استخدم BFF أو `--dart-define` / بيئة آمنة.

---

## 8. تدفق مقترح في التطبيق

1. المستخدم يضغط بحث بعد التحقق المحلي (`canSubmitHotelsSearch`).
2. الطبقة **`data`** تبني `PropertiesQuerySearch` من المسودة.
3. **`POST`** + الرؤوس + JWT (من خدمة آمنة).
4. تحليل **`PropertiesResponse`** → كيانات العرض + حفظ **`Identifier` / Pagination`** لطلب الصفحة التالية أو التوفر.
5. عرض **`Result.Warning`** للمستخدم عند الحاجة؛ **`Result.Error`** كرسالة خطأ.

---

*مُستخرج من وثائق Travelport Stays (Hotel Search by Location). حدّث المسارات والإصدارات من المصدر الرسمي عند التغيير.*
