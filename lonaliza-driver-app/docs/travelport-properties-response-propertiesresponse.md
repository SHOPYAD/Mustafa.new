# Travelport Stays — شكل رد `PropertiesResponse` (تفاصيل عقارات)

ملخص لعيّنة **JSON** (مخطط / مثال من وثائق الـ API) لاستجابة بحث/تفاصيل عقارات. القيم مثل `"string"` و UUIDات عيّنة **للتوثيق فقط** وليست بيانات حقيقية.

> **ملاحظة:** النص الذي وصل مكرر مرتين (نفس الكائن مرتين متجاورتين)؛ في الاستجابة الفعلية يكون جسم واحد `{ "PropertiesResponse": { ... } }`.

---

## 1. الجذر

| المسار | المعنى |
|--------|--------|
| `PropertiesResponse` | غلاف الاستجابة الكامل لعملية Stays/Properties. |

---

## 2. `PropertiesResponse.Properties`

حاوية النتائج والصفحات على مستوى **قائمة العقارات**.

| الحقل | ملاحظة |
|--------|--------|
| `@type` | وصف نوع الكائن في نموذج Travelport (غالبًا للتمييز متعدد الأشكال). |
| `Identifier` | `{ value, authority }` — مثل `TVPT` لربط المورد. |
| `totalProperties` | إجمالي العقارات المطابقة (في المثال `0` بينما يوجد `PropertyInfo` — تناقض شائع في أمثلة المخطط). |
| `propertiesPerPage` / `numberOfPages` | ترقيم صفحات على مستوى الحاوية. |
| `PropertyInfo` | **مصفوفة** عناصر؛ كل عنصر يمثل عقارًا واحدًا في النتائج مع تفاصيل ولخص أسعار. |

---

## 3. `PropertyInfo` (عنصر واحد في القائمة)

| الحقل | استخدام في التطبيق |
|--------|---------------------|
| `id` | معرّف عنصر القائمة لدى المزوّد. |
| `Identifier` | UUID/معرّف TVPT للعنصر. |
| `availability` | مثل `Open` — لعرض شارة التوفر. |
| `Distance` | `{ value, unitOfDistance }` — بعد المسافة عن نقطة البحث (خرائط، ترتيب). |
| **`Property`** | نوع **`PropertyDetail`** — **لب التفاصيل** للشاشة. |
| `LowestAvailableRate` / `MaximumAvailableRate` | `{ value, code, minorUnit, ... }` — عرض السعر من–إلى أو شريط السعر. |
| `NextSteps` | روابط/إجراءات لاحقة (HATEOAS): `action`, `method`, `value` (URL). |
| `featuredPropertyInd` | تمييز عقار مميز في القائمة. |

---

## 4. `Property.PropertyDetail` (التفاصيل للبطاقة / صفحة الفندق)

### 4.1 تعريف العقار لدى الكتالوج

| الحقل | المعنى |
|--------|--------|
| `PropertyKey` | **`chainCode`** + **`propertyCode`** — يُعاد استخدامهما في طلبات أخرى (بحث، عرض غرف، حجز). |
| `name` | اسم الفندق للعرض. |
| `id` / `Identifier` | معرّفات داخلية إضافية. |

### 4.2 تقييم وموقع وصور

| الحقل | المعنى |
|--------|--------|
| `Rating[]` | `{ value, provider }` — مثل نجوم/تصنيف من مزود `NTM`. |
| `GeoLocation` | خط عرض/طول، ارتفاع، دقة الموقع، `mapURL` / `formatURL`. |
| `Image[]` | روابط أو معرفات صور + `imageSize`, `pictureOf`, أبعاد، تعليق. |

### 4.3 وصف وخدمات

| الحقل | المعنى |
|--------|--------|
| `Description[]` | فقرات وصف نصي. |
| `BusinessService[]` | خدمات أعمال قريبة/مدرجة. |
| `PropertyAmenity[]` | مرافق الفندق (`code`, `category`, `description`, …). |
| `GuestRoomInfo[]` | معلومات غرف/طوابق (في المثال نصوص توضيحية). |
| `AccessibilityFeature[]` | إمكانية وصول. |

### 4.4 عنوان واتصال

| الحقل | المعنى |
|--------|--------|
| `Address` | `@type: AddressDetail` — مدينة، ولاية، دولة، بريد، أسطر عنوان، إلخ. |
| `Telephone[]` | أرقام. |
| `Email` | كائن بريد مع نوع وخصوصيات تسويقية (قد لا يُعرض للمستخدم النهائي). |

### 4.5 سياسات وسياق إضافي

| الحقل | المعنى |
|--------|--------|
| `PetPolicy` | السماح بالحيوانات + وصف. |
| `Restaurant[]` / `Attraction[]` | مطاعم ومعالم مع مسافات. |
| `DrivingDirections` | نص + لغة. |
| `MeetingRooms` | عدد قاعات وتفاصيل. |
| `VirtualTour` | رابط جولة افتراضية. |
| `CheckInOutPolicy` | أوقات مثل `900` / `600` (غالبًا دقائق من منتصف الليل أو تنسيق خاص بالمزوّد — يُستخرج من التوثيق الرسمي). |

### 4.6 حقول تصنيف (انتبه للأخطاء المطبعية في المخطط)

- `classTypeCode`, **`segmentCatagoryCode`**, **`locationCatagoryCode`** — الأسماء في المثال تحوي **Catagory** بدل **Category**؛ في التطبيق استخدم المفاتيح **كما ترجعها الـ API** ثم طبّق alias في الـ mapper إن لزم.

---

## 5. مستوى الاستجابة: `Result`, الأخطاء، والتحذيرات

| المسار | المعنى |
|--------|--------|
| `PropertiesResponse.Result.status` | مثل `Complete`. |
| `Result.Error[]` | تفاصيل أخطاء منطقية حتى لو HTTP 200. |
| `Result.Warning[]` | تحذيرات (مثال: ولاء العميل). |

**ملاحظة جودة المثال:** داخل `Error` يظهر نص `"No flights found."` — هذا **قالب عام** من وثائق مشتركة؛ في **Stays/Hotel** يجب الاعتماد على **StatusCode** و **Message** الفعلية من الخادم وليس على نص المثال حرفيًا.

---

## 6. حقول تتبع وتنسيق الاستجابة

| الحقل | المعنى |
|--------|--------|
| `transactionId`, `traceId`, `correlationId` | للدعم والسجلات؛ اربطها بما أرسلته في الرؤوس. |
| `reservationStatus` | مثل `Success` — قد لا يعني اكتمال حجز؛ يقرأ مع `Result`. |
| `NextSteps` (على مستوى `PropertiesResponse`) | خطوات عامة بعد الاستجابة. |
| `ReferenceList[]` | في المثال `@type: ReferenceListFlight` — قد يكون إرثًا من نموذج مشترك؛ تحقق من الحقول الفعلية لـ Stays. |
| `CurrencyRateConversion[]` | تحويل عملات للعرض. |
| `Pagination` | `page`, `pageSize`, `totalPages`, `totalItems` — لمزامنة واجهة الترقيم مع الطلبات اللاحقة. |

---

## 7. اقتراح طبقة Domain في `liotrip` (بدون كود)

من هذا الـ JSON يمكن اشتقاق كيانات مبسّطة:

1. **`HotelPropertySummary`** — من `PropertyInfo`: الاسم، `PropertyKey`, المسافة، `LowestAvailableRate`, صورة رئيسية من أول `Image`, `availability`.
2. **`HotelPropertyDetail`** — امتداد + `Address`, `GeoLocation`, `Rating`, `Description`, `PropertyAmenity`, `CheckInOutPolicy`, `PetPolicy`, …
3. **`StaysSearchMeta`** — `Pagination`, `transactionId`/`traceId`, وقائمة `Warning` للعرض غير الحاجب.

الـ **Mapper** في `data` يقرأ `PropertiesResponse` كاملة ويملأ هذه الكيانات، مع معالجة:

- غياب `PropertyInfo` أو مصفوفة فارغة.
- `totalProperties == 0` مع وجود عناصر (تناقض مخطط).
- حقول `null` أو كائنات `Distance: {}` فارغة في المثال.

---

## 8. مرجع سريع للمسار داخل JSON

```text
PropertiesResponse
├── Properties
│   ├── PropertyInfo[]
│   │   ├── Property (PropertyDetail)
│   │   │   ├── PropertyKey → chainCode, propertyCode
│   │   │   ├── name, Rating[], GeoLocation, Image[], Address, ...
│   │   │   └── CheckInOutPolicy, PetPolicy, ...
│   │   ├── LowestAvailableRate, MaximumAvailableRate
│   │   └── NextSteps, featuredPropertyInd, ...
│   └── totalProperties, Pagination (جزئي)
├── Result → status, Error[], Warning[]
├── Pagination
├── CurrencyRateConversion[]
└── transactionId, traceId, correlationId, ...
```

---

*ملحق لـ `docs/travelport-stays-properties-detail-request.md` (طلب GET). حدّث من التوثيق الرسمي عند اختلاف الحقول بين البيئات.*
