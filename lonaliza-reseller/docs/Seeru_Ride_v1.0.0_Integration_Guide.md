# Seeru Ride API v1.0.0 \- دليل التكامل والمواصفات الرسمية المستخرجة مباشرة من Swagger UI

> **المصدر الرسمي:** [Seeru API Docs \- Seeru Ride v1.0.0](https://docs.seeru.travel/?urls.primaryName=Seeru+Ride+v1.0.0)  
> **ملف المواصفات الأصلي:** `docs/ride-api-v1.0.0.yml` (OAS 3.0)

---

## 1\. المعمارية وخوادم التشغيل (Server URLs & Environments)

تعتمد الواجهة نمط **OpenAPI 3.0** وخوادم قابلة للتبديل بين الساندبوكس والإنتاج عبر متغيرات القالب (Template Variables):

* **قالب رابط الخادم (Server URL Template):** `https://{endpoint}-api.seeru.travel/{version}/ride`  
* **المتغيرات (Variables):**  
  * `endpoint`: `sandbox` (بيئة الاختبار) أو `live` (بيئة الإنتاج الحية)  
  * `version`: `v1`

### 1.1 الروابط المباشرة لكل بيئة:

| البيئة | المتغير (`endpoint`) | الرابط المباشر للـ Base URL | الوظيفة التشغيلية |
| :---- | :---- | :---- | :---- |
| **بيئة الاختبار (Sandbox)** | `sandbox` | `https://sandbox-api.seeru.travel/v1/ride` | اختبار تدفق البحث وحجز أوامر النقل برصيد وهمي |
| **بيئة الإنتاج الحية (Live)** | `live` | `https://live-api.seeru.travel/v1/ride` | الخصم الحقيقي وتعيين سائق ومركبة فعلية مرخصة |

---

### 1.2 الفروقات الجوهرية بين الساندبوكس والإنتاج الحي (Sandbox vs Live)

| وجه المقارنة | بيئة الاختبار (Sandbox) | بيئة الإنتاج الحية (LIVE Production) |
| :---- | :---- | :---- |
| **رابط الـ Base URL** | `https://sandbox-api.seeru.travel/v1/ride` | `https://live-api.seeru.travel/v1/ride` |
| **المصادقة (Auth Token)** | رمز JWT تجريبي صادر لحساب الاختبار | رمز JWT إنتاج معتمد مرتبط بحساب الوكالة الحقيقي |
| **الخصم المالي والتنفيذ** | محاكاة رصيد افتراضي دون أي التزام | **خصم مالي فعلي وفوري** عند استدعاء `/order/issue` من رصيد الوكالة |
| **تعيين السائق والمركبة** | بيانات سائق افتراضية فورية | تعيين سائق حقيقي مرخص مع تتبع حي للسيارة ولوحة المركبة |
| **تتبع الطيران اللحظي** | محاكاة ثابتة | **ربط تلقائي مع أنظمة رادارات الطيران** لتعديل موعد وصول السائق في حال تأخر الرحلة |
| **الإلغاء والغرامات** | بدون غرامات إلغاء | تطبيق الشروط والغرامات المالية بعد انتهاء مهلة الإلغاء المجاني |

---

### 1.3 المصادقة والترويسات الإلزامية (Authentication & Headers)

Authorization: Bearer \<SEERU\_JWT\_TOKEN\>

Content-Type: application/json

Accept: application/json

---

## 2\. الفهرس الشامل لنقاط النهاية الرسمية (Complete Endpoints Catalog)

تنقسم واجهة Seeru Ride رسمياً إلى مجموعتين أساسيتين:

1. **مجموعة البحث (`Search`):** اقتراح الأماكن والبحث عن عروض النقل المسعرة.  
2. **مجموعة الأوامر والحجز (`Order`):** إنشاء، تأكيد، جلب، وإلغاء أوامر النقل.

| المجموعة | النوع (Method) | المسار (Path) | الوظيفة (Summary & Description) |
| :---- | :---- | :---- | :---- |
| **Search** | `GET` | `/location` | الإكمال التلقائي واقتراح نقاط الانطلاق والوصول (Autocomplete) |
| **Search** | `GET` | `/search` | البحث عن عروض وأسعار رحلات النقل المتاحة (Priced ride offers) |
| **Order** | `POST` | `/booking/save` | إنشاء وتجميد أمر النقل المبدئي دون خصم (Quote \+ Hold) |
| **Order** | `POST` | `/order/issue` | تأكيد الحجز والخصم المالي وإصدار أمر النقل (Charge \+ Book) |
| **Order** | `POST` | `/order/details` | استعلام تفاصيل الحجز، السائق، وقسيمة التوصيل (Order Details) |
| **Order** | `POST` | `/order/cancel` | إلغاء أمر النقل واحتساب الاسترجاع (Cancel Order) |

---

## 3\. التوثيق التفصيلي لنقاط النهاية بالمدخلات والمخرجات

---

### 3.1 \[Search\] البحث واقتراح الأماكن

#### 1\. الإكمال التلقائي للمواقع: `GET /location`

* **المسار في الساندبوكس:** `https://sandbox-api.seeru.travel/v1/ride/location`  
* **المسار في الإنتاج الحي:** `https://live-api.seeru.travel/v1/ride/location`  
* **معاملات الاستعلام (Query Parameters):**  
  * `q` *(string, مطلوب)*: نص البحث عن المطار أو العنوان (مثال: `DXB` أو `Istanbul`).  
  * `country` *(string, اختياري)*: كود الدولة المكون من حرفين (مثال: `TR`, `AE`, `SA`).  
  * `lang` *(string, اختياري)*: لغة النتائج (`en`, `ar`).  
* **استجابة النجاح (200 OK):** مصفوفة من كائنات `RideLocation`:

\[

  {

    "place\_id": "loc\_airport\_ist\_01",

    "label": "Istanbul Airport (IST), Tayakadin, Istanbul, Turkey",

    "type": "airport",

    "lat": 41.2753,

    "lng": 28.7519,

    "source": "google"

  },

  {

    "place\_id": "loc\_hotel\_swiss\_02",

    "label": "Swissotel The Bosphorus, Besiktas, Istanbul",

    "type": "address",

    "lat": 41.0401,

    "lng": 28.9984,

    "source": "google"

  }

\]

---

#### 2\. البحث عن أسعار وعروض النقل: `GET /search`

* **المسار في الساندبوكس:** `https://sandbox-api.seeru.travel/v1/ride/search`  
* **المسار في الإنتاج الحي:** `https://live-api.seeru.travel/v1/ride/search`  
* **معاملات الاستعلام (Query Parameters):**  
  * `from_place_id` *(string, مطلوب)*: معرف نقطة الانطلاق المستخرج من `/location`.  
  * `to_place_id` *(string, مطلوب في نمط transfer)*: معرف نقطة الوصول.  
  * `date` *(string, مطلوب)*: تاريخ الرحلة بصيغة `YYYY-MM-DD` (مثال: `2026-10-15`).  
  * `time` *(string, مطلوب)*: توقيت الانطلاق بصيغة `HH:mm` (مثال: `14:30`).  
  * `mode` *(string, مطلوب)*: نمط الخدمة (`transfer` للتوصيل، أو `hourly` للتأجير بالساعة).  
  * `hours` *(integer, اختياري)*: عدد الساعات المطلوبة (في حال كان `mode=hourly`).  
  * `pax` *(integer, اختياري)*: إجمالي عدد الركاب.  
  * `luggage` *(integer, اختياري)*: عدد الحقائب.  
  * `currency` *(string, اختياري)*: كود العملة المطلوبة (مثال: `USD`, `SAR`, `EUR`).  
* **استجابة النجاح (200 OK):**

{

  "search\_id": "SR-RIDE-SRCH-992140",

  "currency": "SAR",

  "offers": \[

    {

      "offer\_id": "OFFER-SEDAN-881290",

      "car\_class": {

        "title": "Standard Sedan",

        "capacity": 3,

        "luggage": 3,

        "image": "https://cdn.seeru.travel/rides/cars/sedan-passat.png"

      },

      "price": 280.00,

      "supplier": "Seeru Local Transfer Network",

      "route": {

        "distance\_km": 42.5,

        "estimated\_minutes": 45

      }

    },

    {

      "offer\_id": "OFFER-VCLASS-VIP-991204",

      "car\_class": {

        "title": "Minivan VIP",

        "capacity": 6,

        "luggage": 6,

        "image": "https://cdn.seeru.travel/rides/cars/vclass-vip.png"

      },

      "price": 450.00,

      "supplier": "Seeru Premium Chauffeur",

      "route": {

        "distance\_km": 42.5,

        "estimated\_minutes": 45

      }

    }

  \]

}

---

### 3.2 \[Order\] إدارة الحجز والأوامر

#### 3\. إنشاء وتجميد أمر النقل المبدئي: `POST /booking/save`

* **المسار في الساندبوكس:** `https://sandbox-api.seeru.travel/v1/ride/booking/save`  
* **المسار في الإنتاج الحي:** `https://live-api.seeru.travel/v1/ride/booking/save`  
* **الوظيفة:** حفظ تفاصيل الطلب وتجميد السعر دون خصم مالي (Quote \+ Hold).  
* **Request Body (`application/json`):**

{

  "offer\_id": "OFFER-VCLASS-VIP-991204",

  "passenger": {

    "first\_name": "Ferdos",

    "last\_name": "Alkan",

    "email": "booking@lonaliza.com",

    "phone": "+966551234567"

  },

  "flight\_number": "TK1821",

  "comments": "Meet at International Arrivals with sign board: Mr. Ferdos Alkan",

  "extras": \[\],

  "route": {

    "from": "loc\_airport\_ist\_01",

    "to": "loc\_hotel\_swiss\_02",

    "date": "2026-10-15",

    "time": "14:30"

  }

}

* **استجابة النجاح (200 OK):**

{

  "status": "success",

  "message": "Order saved and quote held successfully",

  "order\_id": "SR-RIDE-ORD-7749102",

  "final\_price": 450.00,

  "currency": "SAR",

  "mode": "transfer",

  "car\_class": {

    "title": "Minivan VIP",

    "capacity": 6,

    "luggage": 6,

    "image": "https://cdn.seeru.travel/rides/cars/vclass-vip.png"

  }

}

---

#### 4\. تأكيد الحجز والخصم الفعلي: `POST /order/issue`

* **المسار في الساندبوكس:** `https://sandbox-api.seeru.travel/v1/ride/order/issue`  
* **المسار في الإنتاج الحي:** `https://live-api.seeru.travel/v1/ride/order/issue`  
* **الوظيفة:** تأكيد الحجز وخصم التكلفة الفعلية من رصيد حساب الوكالة (Charge \+ Book).  
* **Request Body:**

{

  "order\_id": "SR-RIDE-ORD-7749102"

}

* **استجابة النجاح (200 OK):**

{

  "status": "success",

  "order\_id": "SR-RIDE-ORD-7749102",

  "booking\_reference": "SEERU-RIDE-CONF-881290",

  "status": "CONFIRMED",

  "issued\_at": "2026-09-07T11:55:00Z"

}

---

#### 5\. استعلام تفاصيل الحجز وتتبع السائق: `POST /order/details`

* **المسار في الساندبوكس:** `https://sandbox-api.seeru.travel/v1/ride/order/details`  
* **المسار في الإنتاج الحي:** `https://live-api.seeru.travel/v1/ride/order/details`  
* **Request Body:**

{

  "order\_id": "SR-RIDE-ORD-7749102"

}

* **استجابة النجاح (200 OK):**

{

  "status": "success",

  "order\_id": "SR-RIDE-ORD-7749102",

  "booking\_reference": "SEERU-RIDE-CONF-881290",

  "status": "CONFIRMED",

  "driver\_details": {

    "assigned": true,

    "driver\_name": "Mehmet Yilmaz",

    "phone": "+90 532 999 8877",

    "vehicle\_plate": "34 VIP 1905",

    "vehicle\_model": "Mercedes-Benz V-Class Black"

  },

  "voucher\_url": "https://live-api.seeru.travel/v1/ride/voucher/SR-RIDE-ORD-7749102.pdf"

}

---

#### 6\. إلغاء أمر النقل: `POST /order/cancel`

* **المسار في الساندبوكس:** `https://sandbox-api.seeru.travel/v1/ride/order/cancel`  
* **المسار في الإنتاج الحي:** `https://live-api.seeru.travel/v1/ride/order/cancel`  
* **Request Body:**

{

  "order\_id": "SR-RIDE-ORD-7749102",

  "reason": "Flight rescheduled"

}

* **استجابة النجاح (200 OK):**

{

  "status": "success",

  "order\_id": "SR-RIDE-ORD-7749102",

  "status": "CANCELLED",

  "refund\_amount": 450.00,

  "currency": "SAR"

}

---

## 4\. نماذج ومخططات البيانات الأساسية (Data Models & Schemas)

1. **`RideLocation`:**  
   * `place_id` (string): المعرف الفريد للنقطة الجغرافية.  
   * `label` (string): الاسم الكامل للنقطة أو العنوان.  
   * `type` (string): نوع الموقع (`airport`, `address`, `hub`).  
   * `lat` / `lng` (number): الإحداثيات الجغرافية.  
   * `source` (string): مصدر البيانات.  
2. **`RideOffer`:**  
   * `offer_id` (string): معرف العرض المسعر.  
   * `car_class` (`CarClass`): فئة ومواصفات المركبة.  
   * `price` (number): السعر الإجمالي.  
   * `supplier` (string): اسم مشغل النقل.  
   * `route` (object): المسافة بالكيلومتر والوقت المقدر.  
3. **`CarClass`:**  
   * `title` (string): اسم فئة السيارة (مثل `Standard Sedan`, `Minivan VIP`).  
   * `capacity` (integer): السعة القصوى للركاب.  
   * `luggage` (integer): السعة القصوى للحقائب.  
   * `image` (string): رابط صورة المركبة.  
4. **`RideExtra`:**  
   * `id`, `title`, `price`: الخدمات الإضافية المتاحة ككراسي الأطفال أو المساعدة الخاصة.

---

## 5\. تطبيق عميل النقل بالـ TypeScript لبيئتي الساندبوكس والإنتاج

import axios, { AxiosInstance } from 'axios';

export interface SeeruRideConfig {

  jwtToken: string;

  environment: 'sandbox' | 'live';

}

export class SeeruRideClient {

  private client: AxiosInstance;

  constructor(private config: SeeruRideConfig) {

    const baseURL \= config.environment \=== 'live'

      ? 'https://live-api.seeru.travel/v1/ride'

      : 'https://sandbox-api.seeru.travel/v1/ride';

    this.client \= axios.create({

      baseURL,

      headers: {

        'Authorization': \`Bearer ${config.jwtToken}\`,

        'Content-Type': 'application/json',

        'Accept': 'application/json'

      },

      timeout: 30000

    });

  }

  // 1\. الإكمال التلقائي للأماكن

  async suggestLocations(query: string, country?: string, lang \= 'en') {

    const res \= await this.client.get('/location', { params: { q: query, country, lang } });

    return res.data;

  }

  // 2\. البحث عن عروض النقل والأسعار

  async searchOffers(params: {

    from\_place\_id: string;

    to\_place\_id?: string;

    date: string; // YYYY-MM-DD

    time: string; // HH:mm

    mode: 'transfer' | 'hourly';

    hours?: number;

    pax?: number;

    luggage?: number;

    currency?: string;

  }) {

    const res \= await this.client.get('/search', { params });

    return res.data;

  }

  // 3\. تجميد وإنشاء أمر النقل المبدئي (Quote \+ Hold)

  async saveBooking(payload: {

    offer\_id: string;

    passenger: { first\_name: string; last\_name: string; email: string; phone: string };

    flight\_number?: string;

    comments?: string;

    extras?: any\[\];

    route: { from: string; to: string; date: string; time: string };

  }) {

    const res \= await this.client.post('/booking/save', payload);

    return res.data;

  }

  // 4\. تأكيد الحجز وإصدار التذكرة والخصم الفعلي (Charge \+ Book)

  async issueOrder(orderId: string) {

    const res \= await this.client.post('/order/issue', { order\_id: orderId });

    return res.data;

  }

  // 5\. استعلام تفاصيل الحجز وقسيمة النقل

  async getOrderDetails(orderId: string) {

    const res \= await this.client.post('/order/details', { order\_id: orderId });

    return res.data;

  }

  // 6\. إلغاء الحجز

  async cancelOrder(orderId: string, reason?: string) {

    const res \= await this.client.post('/order/cancel', { order\_id: orderId, reason });

    return res.data;

  }

}  
