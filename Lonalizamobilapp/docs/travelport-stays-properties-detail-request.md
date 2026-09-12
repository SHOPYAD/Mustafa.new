# Travelport Stays — طلب تفاصيل عقار (Mock API)

ملخص تحليلي لعيّنة استدعاء **GET** من وثائق/محاكي Travelport لمسار **hotel search / properties detail**.

---

## 1. الهدف الوظيفي

- جلب **تفاصيل عقار فندقي** (أو مورد ضمن سلسلة) بعد تحديد:
  - **`chainCode`**: رمز السلسلة (مثال: `HL`).
  - **`propertyCode`**: معرّف العقار لدى المزوّد (في المثال نص placeholder `string`).
  - **`ImageSize`**: حجم صور العرض (مثال: `Small`).

الاستخدام النموذجي: شاشة تفاصيل الفندق، معرض صور، أو خطوة بعد نتائج بحث أولية.

---

## 2. العنوان الكامل (URL)

| جزء | قيمة |
|-----|------|
| **Scheme** | `https` |
| **Host** | `developer.travelport.com` |
| **Path** | `/_mock/apis/stays/hotel/search/propertiesdetail` |
| **Query** | مُنشأ عبر `URLSearchParams` |

**ملاحظة مهمة:** المسار يحتوي على **`_mock/apis`** — هذا يشير إلى **بيئة محاكاة/تجربة** مرتبطة بوابة المطورين، وليس بالضرورة نفس نطاق **pre-production** (`api.pp.travelport.net`) الذي يُستخدم مع TripServices في مشاريع أخرى. عند الدمج الحقيقي راجع التوثيق الرسمي لعنوان الـ base الصحيح لبيئتك.

**سلسلة الاستعلام (Query string):**

```
chainCode=HL&propertyCode=string&ImageSize=Small
```

- أسماء المعلمات **حسّاسة لحالة الأحرف** في بعض الأنظمة؛ التزم بالتوثيق الرسمي (`ImageSize` بحرف I كبير كما في المثال).

---

## 3. طريقة HTTP والرأس (Headers)

| Header | الدور |
|--------|--------|
| **`Authorization`** | `Bearer <JWT>` — رمز الوصول بعد تسجيل الدخول / OAuth؛ لا يُخزَّن في المستودع. |
| **`XAUTH_TRAVELPORT_ACCESSGROUP`** | معرّف مجموعة الوصول (UUID) لربط الطلب بحساب/صلاحيات Travelport. |
| **`TVP-PCC-Core`** | سياق **PCC** (وأحيانًا لاحقة مثل `_1G` تشير إلى سياق GDS/قناة). يوجّه الطلب لنقطة البيع/الفرع الصحيح. |
| **`TVP-Correlation-Id`** | UUID لربط الطلب بسجلات الدعم والتتبع بين خدمات متعددة. |
| **`TraceId`** | معرّف تتبع إضافي (يمكن أن يطابق أو يكمّل Correlation). |
| **`Accept-Encoding`** | `gzip, deflate` — ضغط الاستجابة؛ معظم عملاء HTTP يدعمون فك الضغط تلقائيًا. |

لا يُرسل **جسم** (body) لأن الطلب **GET**.

---

## 4. الاستجابة في المثال

```js
const data = await resp.text();
```

- القراءة كـ **نص** تعني أن العميل لا يفترض JSON بالضرورة؛ الاستجابة قد تكون **JSON** أو **XML** حسب الـ API الفعلي.
- في الإنتاج: استخدم **`response.headers['content-type']`** ثم `json()` أو مفكك XML حسب النوع.
- تعامل مع **رمز الحالة** (`resp.ok` / `status`) وأخطاء **401/403/404** قبل تحليل الجسم.

---

## 5. تطبيق Flutter / `liotrip` (اقتراح تقني مختصر)

1. **لا تضع** الـ JWT ولا الـ Access Group الحقيقية في الكود؛ استخدم `--dart-define`، أو متغيرات بيئة، أو **BFF** يضيف الرؤوس ويعيد payload مبسّطًا.
2. طبقة **`data`**: دالة واحدة مثل `getPropertyDetail({ chainCode, propertyCode, imageSize })` تبني الـ query وتضيف الرؤوس من مصدر آمن.
3. **Mapper** من نموذج الاستجابة إلى كيانات `domain` (مثلاً تفاصيل فندق + قائمة صور).
4. اختبار الوحدة باستخدام **mock HTTP** (مثل `http_mock_adapter`) مع نفس الـ path/query دون شبكة حقيقية عند الحاجة.

---

## 6. علاقة المعاملات ببعضها

```text
chainCode + propertyCode  →  يحددان العقار ضمن كتالوج السلسلة
ImageSize                 →  يحدد جودة/أبعاد صور العرض في الاستجابة
Headers (PCC, AccessGroup, Bearer)  →  تفويض وتوجيه وحساب
```

---

## 7. checklist قبل الربط الفعلي

- [ ] تأكيد **Base URL** لبيئة **Sandbox / PP / Prod** وليس الاعتماد على `_mock` في التطبيق النهائي إن لم يكن مقصودًا.
- [ ] تأكيد **تنسيق الاستجابة** (JSON vs XML) وحقل **`propertyCode`** الحقيقي من نتيجة بحث سابقة.
- [ ] سياسة **انتهاء JWT** وتحديثه (refresh أو إعادة طلب token).
- [ ] تسجيل **`TVP-Correlation-Id`** و **`TraceId`** عند الأخطاء لتسهيل الدعم.

---

*مُنشأ كملخص تحليلي لعيّنة كود؛ القيم في المثال الأصلي تجريبية. راجع [Travelport Developer](https://developer.travelport.com) للمواصفات المحدثة.*
