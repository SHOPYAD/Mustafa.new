# بطاقة نتيجة الرحلة — التواريخ، الشارات (Meta Chips)، السعر، والولاء

مرجع تقني لجزء **ملخص الرحلة** في قائمة بحث الطيران (`FlightCard`): التواريخ تحت المطارات، صف الشارات (أمتعة / توقف / fare options)، عمود السعر، وشارة الخصم الترويجية.

| آخر مراجعة     | الفرع                             | التطبيق            |
| -------------- | --------------------------------- | ------------------ |
| **2026-05-19** | `feat/tourism-platform-transform` | `booking-frontend` |

---

## 1. الملفات والتدفق

| طبقة         | المسار                                                                          |
| ------------ | ------------------------------------------------------------------------------- |
| المكوّن      | `src/components/pages/flight/flight-list/flight-card/FlightCard.tsx`            |
| الأنماط      | `src/components/pages/flight/flight-list/flight-card/FlightCard.module.css`     |
| التحويل      | `src/components/pages/flight/flight-list/useFlightResults.ts` → `adaptOffer()`  |
| القائمة      | `src/components/pages/flight/flight-list/flightList.tsx`                        |
| شارة الولاء  | `src/components/loyalty/LoyaltyResultCardBadge.tsx`                             |
| GraphQL ولاء | `src/graphql/queries/loyalty.ts` → `tourismLoyaltySurfaceOffers`                |
| خلفية العروض | `erxes/backend/plugins/tourism_api/src/services/tourismLoyaltySurfaceOffers.ts` |

```text
GraphQL searchFlights (tourism_api)
    → useFlightResults.adaptOffer(offer) → LegacyFlight
    → <FlightCard flight={...} />

GraphQL tourismLoyaltySurfaceOffers (عند التحميل)
    → useTourismLoyaltySurface → <LoyaltyResultCardBadge service="FLIGHT" />
```

---

## 2. تشريح البطاقة (تخطيط الواجهة)

على Liotrip التواريخ **تحت كل مطار** داخل `.routeRow` (وليس في صف منفصل كـ Trip.com). صف الشارات `.metaChipRow` مباشرة **أسفل** المسار. عمود السعر `.priceColumn` في العمود الأيمن (Bootstrap `col-lg-4`).

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ .cardHeader          [شعار] Egyptair MS-846 · Economy    [Provider badge]   │
├──────────────────────────────────────────────┬──────────────────────────────┤
│ .routeRow                                    │ .priceColumn                 │
│                                              │   From                       │
│  12:55          12H 10M          13:00       │   $ 341.02                   │
│  ALG            3 stops via CAI   IST       │   per traveller, taxes incl. │
│  Algiers                           Istanbul  │   [10% Off] [Points badge]   │
│  19 May 2026                       20 May 2026│   [Flight details ▼]        │
│                                              │   [Select →]                 │
│  .metaChipRow                                │                              │
│  [23 kg checked] [16h layover] [5 fare options]│                              │
└──────────────────────────────────────────────┴──────────────────────────────┘
```

```mermaid
flowchart TB
  subgraph API["tourism_api — offer"]
    O[offer]
    FV[fareVariants[]]
    SEG[outbound.segments[]]
  end
  subgraph Adapt["adaptOffer()"]
    DT[formatDate / formatRouteDateTime]
    BA[baggage من أرخص variant + segment fallback]
    LO[layoverMinutes = max بين segments]
    FO[buildFareOptionsFromApiVariants]
  end
  subgraph UI["FlightCard"]
    RD[.airportDate]
    CH[.metaChipRow]
    PC[.priceColumn + LoyaltyResultCardBadge]
  end
  O --> Adapt --> UI
```

---

## 3. التواريخ والأوقات

### 3.1 أين تُعرض؟

| العنصر             | class CSS                       | موضع DOM                 |
| ------------------ | ------------------------------- | ------------------------ |
| وقت المغادرة       | `.flightTime`                   | يسار `.routePoint`       |
| كود/مدينة المغادرة | `.airportCode` / `.airportCity` | تحت الوقت                |
| **تاريخ المغادرة** | `.airportDate`                  | تحت المدينة              |
| مدة + خط المسار    | `.routeMiddle`                  | الوسط                    |
| وقت الوصول         | `.flightTime`                   | يمين `.routePointEnd`    |
| **تاريخ الوصول**   | `.airportDate`                  | يمين (من `pickDatePart`) |

### 3.2 الحقول على `LegacyFlight`

| الحقل                  | المصدر في `adaptOffer()`                        | الاستخدام                                                 |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `departure`            | `formatTime(firstSeg.departure.dateTime)`       | `.flightTime` يسار — مثل `12:55`                          |
| `departureDate`        | `formatDate(firstSeg.departure.dateTime)`       | `.airportDate` يسار                                       |
| `arrival`              | `formatTime(lastSeg.arrival.dateTime)`          | `.flightTime` يمين                                        |
| `arrivalDisplayLine`   | `formatRouteDateTime(lastSeg.arrival.dateTime)` | يُفكّك بـ `pickDatePart` للتاريخ فقط                      |
| `departureDisplayLine` | نفس الدالة للمغادرة                             | محفوظ للتوسيع/تفاصيل؛ **لا يُستخدم في صف المسار المختصر** |

**قطاعات المرجع:** أول `outbound.segments[0]` للمغادرة، آخر segment في outbound للوصول.

### 3.3 دوال التنسيق (`useFlightResults.ts`)

**`formatDate(iso)`** — سطور ~165–173

- يستخرج `YYYY-MM-DD` من ISO.
- المخرجات: `{يوم} {شهر إنجليزي مختصر} {سنة}` — locale ثابت (إنجليزي).
- مثال: `2026-05-19T08:30:00Z` → **`19 May 2026`**.

**`formatTime(iso)`** — سطور ~175–180

- يستخرج `T{HH}:{mm}`.
- مثال: → **`08:30`** (24 ساعة، بدون AM/PM).

**`formatRouteDateTime(iso)`** — سطور ~434–440

- يجمع: `{formatDate} · {formatTime}`.
- مثال: **`20 May 2026 · 06:15`**.

**`pickDatePart(value)`** — `FlightCard.tsx` ~271–276

```ts
function pickDatePart(value?: string | null): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const parts = raw.split(" · ");
  return parts.length > 1 ? parts[0] : "";
}
```

- تاريخ الوصول على البطاقة = الجزء قبل `·` من `arrivalDisplayLine`.
- إن لم يوجد `·` → لا يُعرض تاريخ وصول (فارغ).

### 3.4 شكل التواريخ (CSS)

| خاصية        | قيمة `.airportDate`                |
| ------------ | ---------------------------------- |
| `font-size`  | `11px`                             |
| `color`      | `var(--liotrip-muted)` → `#64748b` |
| `margin-top` | `2px`                              |

| خاصية         | قيمة `.flightTime`               |
| ------------- | -------------------------------- |
| `font-size`   | `22px`                           |
| `font-weight` | `700`                            |
| `color`       | `var(--liotrip-ink)` → `#0f172a` |

### 3.5 شروط العرض

| العنصر          | يُعرض إذا                                          |
| --------------- | -------------------------------------------------- |
| تاريخ المغادرة  | `flight.departureDate` غير فارغ                    |
| تاريخ الوصول    | `pickDatePart(flight.arrivalDisplayLine)` غير فارغ |
| مدينة تحت الكود | `fromCity` / `toCity` موجودة ومختلفة عن كود المطار |

### 3.6 مثال — رحلة تعبر منتصف الليل

```text
firstSeg.departure.dateTime  = 2026-05-19T08:30:00Z
lastSeg.arrival.dateTime     = 2026-05-20T06:15:00Z

departure      → "08:30"        (أو حسب TZ العرض في المتصفح إن طُبّق لاحقاً)
departureDate  → "19 May 2026"
arrival        → "06:15"
arrivalDisplayLine → "20 May 2026 · 06:15"
pickDatePart   → "20 May 2026"
```

---

## 4. صف الشارات — Meta Chips (`.metaChipRow`)

### 4.1 الشكل العام (CSS)

| خاصية     | `.metaChipRow`                  | `.metaChip`                                      |
| --------- | ------------------------------- | ------------------------------------------------ |
| تخطيط     | `flex`, `flex-wrap`, `gap: 8px` | `inline-flex`, `align-items: center`, `gap: 6px` |
| هامش علوي | `margin: 14px 0 0`              | —                                                |
| خلفية     | —                               | `var(--liotrip-bg-soft)` → `#f8fafc`             |
| حد        | —                               | `1px solid var(--liotrip-border-soft)`           |
| نص        | —                               | `12px`, `font-weight: 500`, `#0f172a`            |
| زوايا     | —                               | **`border-radius: 999px`** (حبة pill)            |
| حشو       | —                               | `4px 10px`                                       |
| أيقونة    | —                               | Font Awesome `11px`, لون `#4c1d95`               |

**متغيرات العلامة في `.flightCard`:**

```text
--liotrip-primary:       #4c1d95
--liotrip-primary-soft:  #ede9fe
--liotrip-muted:         #64748b
--liotrip-bg-soft:       #f8fafc
--liotrip-border-soft:   #f1f5f9
```

### 4.2 أنواع الشارات — جدول مرجعي

| #   | النوع          | class(es)                       | أيقونة FA           | شرط الظهور                         | نص الواجهة                                |
| --- | -------------- | ------------------------------- | ------------------- | ---------------------------------- | ----------------------------------------- |
| 1   | Checked (موجب) | `.metaChip`                     | `fa-suitcase`       | `isMeaningfulBag(baggage.checked)` | `{checked} checked` — مثل `23 kg checked` |
| 2   | Checked (سلبي) | `.metaChip` + `.metaChipMuted`  | `fa-ban`            | غير meaningful                     | **`No checked bag`**                      |
| 3   | Cabin          | `.metaChip`                     | `fa-briefcase`      | `isMeaningfulBag(carry_on)` فقط    | `{carry_on} cabin`                        |
| 4   | Layover        | `.metaChip`                     | `fa-hourglass-half` | `layoverMinutes > 0`               | `formatLayover(minutes)`                  |
| 5   | Fare options   | `.metaChip` + `.metaChipAccent` | `fa-layer-group`    | `fare_options.length > 1`          | `{N} fare options`                        |

**`.metaChipMuted`:** خلفية `#ffffff`, نص وأيقونة `#64748b`.

**`.metaChipAccent`:** خلفية `#ede9fe`, حد `rgba(76,29,149,0.28)`, نص بنفسجي `#4c1d95` — للتمييز عن شارات الأمتعة.

### 4.3 `isMeaningfulBag(value)` — `FlightCard.tsx` ~41–47

تُعتبر «لا أمتعة» إذا كانت فارغة أو (بعد `trim` + `lowerCase`) ضمن:

```text
'', '0', '0 kg', '0kg', '0 pc', '0pc', 'n/a', 'na'
```

### 4.4 حساب الأمتعة — `adaptOffer()` (~699–725)

الملخص على البطاقة = **أرخص fare variant** في العرض، وليس الـ fare المختار عند الحجز.

```text
cheapestFareRow = fareVariants.find(isBestPrice) || fareVariants[0]
checked  ← parseSeeruBagText(cheapestFareRow.checkedBagDesc)
carry_on ← parseSeeruBagText(cheapestFareRow.cabinBagDesc)
```

**احتياطي Travelport** من `outbound.segments[].baggageAllowance`:

| allowance                  | نتيجة checked            |
| -------------------------- | ------------------------ |
| `checkedBags` + `weightKg` | `{pieces} x {weight} kg` |
| `weightKg` فقط             | `{weight} kg`            |
| `checkedBags` فقط          | `{pieces} pc`            |

افتراضي على الكائن: `checked: checkedBaggage || '0 kg'` — و`'0 kg'` → غير meaningful → «No checked bag».

### 4.5 `parseSeeruBagText(raw)` — ملخص

| مدخل المزوّد      | مخرج تقريبي                    |
| ----------------- | ------------------------------ |
| `8KG` / نص فيه kg | `8 kg`                         |
| `0PC` / pc        | `0 pc` → غالباً غير meaningful |
| `2PC23KG`         | `2 x 23 kg`                    |

### 4.6 Layover — `layoverMinutes` + `formatLayover()`

**الحساب** (`adaptOffer` ~731–741): لكل زوج segments متتاليين، الفرق بالدقائق بين وصول السابق ومغادرة التالي؛ يُخزَّن **الأقصى** في `layoverMinutes`.

**العرض** (`formatLayover` ~255–261):

| الدقائق        | النص              |
| -------------- | ----------------- |
| ساعات + دقائق  | `16h 30m layover` |
| ساعات فقط      | `16h layover`     |
| دقائق فقط      | `45m layover`     |
| 0 أو غير معرّف | لا chip           |

### 4.7 Fare options

**البناء:** `buildFareOptionsFromApiVariants(offer)` — ترتيب بالسعر، `dedupeKey`, Seeru بدون variants → خيار واحد `seeru-default`.

**الشارة:** تظهر فقط إذا `fareOptions.length > 1`. لا طلب API إضافي.

**بعد «Flight details»:** slider لكل fares؛ `sessionStorage['liotrip_flight_fare_key']` عند المتابعة للحجز.

---

## 5. عمود السعر وشارات الولاء (منفصلة عن Meta Chips)

### 5.1 السعر

| عنصر   | class                          | شكل                                       |
| ------ | ------------------------------ | ----------------------------------------- |
| تسمية  | `.priceCaption`                | `From` — 11px uppercase muted             |
| المبلغ | `.priceValue` / `.priceAmount` | **26px**, bold, لون **`#b8860b`** (ذهبي)  |
| عملة   | `.priceCurrency`               | 14px, نفس اللون الذهبي                    |
| تذييل  | `.priceFootnote`               | `per traveller, taxes incl.` — 11px muted |

`flight.price` = أقل سعر بين `fare_options` أو `pricing.total` — **سعر المزوّد قبل خصم الولاء**.

### 5.2 شارة «10% Off» (ولاء — ليست meta chip)

|           |                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| المكوّن   | `<LoyaltyResultCardBadge service="FLIGHT" />` — تحت السعر في `.priceColumn`                                   |
| الاستعلام | `tourismLoyaltySurfaceOffers(tourismService: "flight", displaySurface: "result_card_badge")`                  |
| النص      | `promoLabel` من API — كوبون نسبة: `` `${value}% off` ``                                                       |
| الشكل     | Bootstrap: `badge bg-success-subtle text-success-emphasis border border-success` (أخضر فاتح، ليس `.metaChip`) |
| الإعداد   | لوحة السياحة → Loyalty → Coupon/Score → **Display surfaces** → `result_card_badge`                            |
| ملاحظة    | **لا يخصم** السعر على البطاقة؛ الخصم عند الدفع (`quoteFlightDiscount` / checkout)                             |

---

## 6. جدول ربط كامل: API → LegacyFlight → UI

| مصدر GraphQL / API                          | حقل `LegacyFlight`                    | عنصر UI          | class                          |
| ------------------------------------------- | ------------------------------------- | ---------------- | ------------------------------ |
| `segments[0].departure.dateTime`            | `departure`                           | وقت يسار         | `.flightTime`                  |
| نفس الحقل                                   | `departureDate`                       | تاريخ يسار       | `.airportDate`                 |
| `segments[last].arrival.dateTime`           | `arrival`                             | وقت يمين         | `.flightTime`                  |
| نفس الحقل                                   | `arrivalDisplayLine` → `pickDatePart` | تاريخ يمين       | `.airportDate`                 |
| `outbound.durationMinutes`                  | `duration`                            | وسط المسار       | `.routeDuration`               |
| `stops` / segments                          | `stops`                               | وسط              | `.routeStops`                  |
| `fareVariants[].checkedBagDesc` (+ segment) | `baggage.checked`                     | chip 1           | `.metaChip` / `.metaChipMuted` |
| `fareVariants[].cabinBagDesc`               | `baggage.carry_on`                    | chip 2 (اختياري) | `.metaChip`                    |
| فجوات segments                              | `layoverMinutes`                      | chip 3 (اختياري) | `.metaChip`                    |
| `fareVariants[]` بعد dedupe                 | `fare_options.length`                 | chip 4 (اختياري) | `.metaChipAccent`              |
| `pricing` / min fare                        | `price`, `currency`                   | عمود السعر       | `.priceAmount`                 |
| `tourismLoyaltySurfaceOffers`               | — (query منفصل)                       | شارة خصم         | `LoyaltyResultCardBadge`       |

---

## 7. أمثلة حسابية

### 7.1 أمتعة + layover + fares (مثل لقطة ALG→IST)

```text
checkedBagDesc = "23KG"     → "23 kg checked"
layoverMinutes = 960        → "16h layover"
fareVariants بعد dedupe = 5 → "5 fare options" (metaChipAccent)
```

### 7.2 بدون أمتعة مسجلة

```text
checkedBagDesc = "0PC"  → isMeaningfulBag false → "No checked bag" (muted)
carry_on فارغ         → لا chip cabin
```

### 7.3 خيار fare واحد

```text
fare_options.length = 1  → لا تظهر شارة "N fare options"
```

---

## 8. حدود وسلوك (لا تكسر)

1. **ملخص الأمتعة ≠ fare المختار:** الشارات من أرخص variant؛ التفاصيل الكاملة بعد فتح Flight details / اختيار fare.
2. **لا chip سلبي للمقصورة** — فقط checked يظهر «No checked bag».
3. **لا «Included with this fare» في الكود الحالي** — النص ديناميكي `{weight} checked` أو سلبي ثابت. لتقليد Trip.com عدّل `FlightCard.tsx` فقط.
4. **Meta chips ≠ شارة الولاء** — صفوف وألوان مختلفة؛ مصدر بيانات مختلف.
5. **تغيير GraphQL:** حقول `FareVariant` جديدة → `buildFareOptionsFromApiVariants` ثم `FlightCard`؛ supergraph RULE 14.

---

## 9. تعديل سريع — أين تلمس الكود؟

| الهدف                   | الملف                                                     | ماذا                                                                  |
| ----------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| نص/شروط chips           | `FlightCard.tsx`                                          | `.metaChipRow` ~461–491                                               |
| شكل chips / تواريخ      | `FlightCard.module.css`                                   | `.metaChip*`, `.airportDate`, `.flightTime`                           |
| تنسيق التاريخ من API    | `useFlightResults.ts`                                     | `formatDate`, `formatTime`                                            |
| أمتعة / layover / fares | `useFlightResults.ts`                                     | `adaptOffer`, `parseSeeruBagText`, `buildFareOptionsFromApiVariants`  |
| شارة خصم ترويجي         | `LoyaltyResultCardBadge.tsx` + إعدادات tourism_ui Loyalty |
| نشر                     | RULE 15                                                   | `npm run build` → `pm2 restart liotrip-booking-frontend --update-env` |

---

## 10. مراجع ذات صلة

| الموضوع                       | الملف                                                               |
| ----------------------------- | ------------------------------------------------------------------- |
| عقد الحجز / fare key          | `docs/FLIGHT_BOOKING_CONTRACT.md`                                   |
| أسطح عرض الولاء               | `src/lib/loyalty-surfaces.ts` (`result_card_badge`)                 |
| بطاقة الفندق (نفس نمط الشارة) | `TripStyleHotelCard.tsx` + `LoyaltyResultCardBadge service="HOTEL"` |

---

_وثيقة مرجعية للمطورين والوكلاء — تُحدَّث مع تغيير `FlightCard` أو `adaptOffer`._
