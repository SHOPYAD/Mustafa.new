> **⚠️ تحذير (2026-09-10):** هذا الملف لا يطابق واجهة Seeru Hotels الفعلية. المرجع الرسمي الوحيد هو مواصفة OpenAPI: https://docs.seeru.travel/docs/hotels-api-v1.0.0.yml (المسارات الحقيقية: `GET /suggest`, `GET /search`, `GET /result/{search_id}`, `GET /rates`, `POST /booking/save`, `POST /order/issue`, `POST /order/details`, `POST /order/cancel`). كما أن خدمة الفنادق غير مفعّلة حالياً لمكتبنا في Seeru (HTTP 403 "Service hotels is not enabled for this office"). المحوّل `src/lib/providers/adapters/seeru/seeruHotelAdapter.ts` مبني على المواصفة الرسمية.

# Seeru Hotels API v1.0.0 \- دليل بيئة الإنتاج الحية (LIVE Production Specification)

---

## 1\. الإعدادات التشغيلية لبيئة الإنتاج الحية (Live Environment Configuration)

هذه الوثيقة مخصصة للتكامل الحقيقي المباشر (Production / Live) مع منصة **Seeru Hotels API v1.0.0**، وتتضمن الربط الفعلي مع الخوادم الحية، وحسابات الإيداع المالي الحقيقية، وإصدار قسائم الفنادق الرسمية المعترف بها لدى الفنادق العالمية.

### 1.1 عناوين الخوادم الحية (Production Base URLs)

| البيئة | المتغير (`endpoint`) | عنوان الخادم الأساسي (Production Base URL) | حالة التشغيل |
| :---- | :---- | :---- | :---- |
| **بيئة الإنتاج الحية (Live)** | `live` | `https://live-api.seeru.travel/v1/hotels` | متصل بالشبكة الحية للفنادق والموردين |
| **خادم الإشعارات والـ Webhooks** | \- | `https://lonaliza.com/api/webhooks/seeru/hotels` | لاستقبال تحديثات الحجوزات اللحظية |

* **رمز الإصدار (Version):** `v1`  
* **بروتوكول الأمان الإلزامي:** `TLS 1.3 / HTTPS Only`

---

### 1.2 التوثيق والمفاتيح الحية (Production Authentication & Headers)

في بيئة الإنتاج الحية، يتم إصدار رمز JWT المباشر من خلال لوحة تحكم الشركاء المعتمدة في Seeru بعد اجتياز فحص الاعتماد (Certification) والتحقق من الرصيد المالي:

Authorization: Bearer \<SEERU\_LIVE\_PRODUCTION\_JWT\>

Content-Type: application/json

Accept: application/json

X-Client-Platform: lonaliza-web-v1

X-Request-Id: \<UUID\_V4\_EACH\_REQUEST\>

> ⚠️ **تنبيه مالي حاسم:** أي استدعاء يتم إرساله إلى عنوان `live-api.seeru.travel` مع تمرير `POST /order/issue` يؤدي فوراً إلى **خصم مالي فعلي** من رصيد الوكالة في Seeru وتثبيت حجز غير قابل للإلغاء إذا كانت الغرفة تحمل شرط Non-refundable.

---

## 2\. دورة الحجز الحية والرقابة المالية (Production Booking Lifecycle & Financial Flow)

\[ العميل في الموقع \]

       │ 1\. اختيار الوجهة والتواريخ

       ▼

\[ POST https://live-api.seeru.travel/v1/hotels/search \]

       │ 2\. الحصول على search\_id حي

       ▼

\[ GET https://live-api.seeru.travel/v1/hotels/result/{search\_id} \]

       │ 3\. فحص أسعار الموردين الحية

       ▼

\[ POST https://live-api.seeru.travel/v1/hotels/hotel/rooms \]

       │ 4\. استعراض الغرف وسياسات الإلغاء بدقة الدقيقة

       ▼

\[ POST https://live-api.seeru.travel/v1/hotels/booking/fare \]

       │ 5\. تثبيت السعر وقفل العملة برمز fare\_token

       ▼

\[ فحص الرصيد الداخلي أو نجاح بوابة الدفع الحية \]

       │ 6\. إنشاء سجل الطلب محلياً

       ▼

\[ POST https://live-api.seeru.travel/v1/hotels/booking/save \]

       │ 7\. تجميد الغرفة لدى الفندق (الحالة: SAVED)

       ▼

\[ POST https://live-api.seeru.travel/v1/hotels/order/issue \]

       │ 8\. الخصم المالي وتوليد كود تأكيد الفندق (CONFIRMED)

       ▼

\[ إصدار قسيمة الفندق Voucher للعميل وإرسال الـ Webhook \]

---

## 3\. المواصفات الكاملة لنقاط النهاية الحية (Live Endpoints)

### 3.1 \[Live Search\] البحث اللحظي في المخزون العالمي

#### أ. بدء البحث الحي: `POST https://live-api.seeru.travel/v1/hotels/search`

* **الغرض:** الاستعلام المباشر من مئات الموردين العالميين وشبكات الفنادق المتصلة مع Seeru.  
* **Headers:**  
  * `Authorization: Bearer <SEERU_LIVE_JWT>`  
  * `Content-Type: application/json`  
  * `X-Request-Id: 7b8192a0-4491-4c92-9182-998811223344`  
* **Request Payload:**

{

  "destination": {

    "type": "city",

    "code": "IST",

    "name": "Istanbul"

  },

  "check\_in": "2026-10-15",

  "check\_out": "2026-10-20",

  "occupancies": \[

    {

      "room\_id": 1,

      "adults": 2,

      "children": \[\]

    }

  \],

  "residency": "SA",

  "nationality": "SA",

  "currency": "SAR",

  "filter": {

    "star\_rating": \[4, 5\],

    "min\_price": 300,

    "max\_price": 5000

  }

}

* **Live Response (200 OK):**

{

  "status": "success",

  "search\_id": "SR-LIVE-HTL-8829104",

  "status\_code": 200,

  "message": "Live search initiated",

  "data": {

    "search\_id": "SR-LIVE-HTL-8829104",

    "is\_completed": false,

    "progress\_percentage": 10,

    "total\_hotels\_found": 24

  }

}

---

#### ب. استطلاع نتائج البحث الحية: `GET https://live-api.seeru.travel/v1/hotels/result/{search_id}`

* **طريقة الاستدعاء:** Polling دوري كل 1.5 ثانية (بحد أقصى 20 محاولة).  
* **Live Response (200 OK \- عند الاكتمال):**

{

  "status": "success",

  "data": {

    "search\_id": "SR-LIVE-HTL-8829104",

    "is\_completed": true,

    "total\_hotels": 218,

    "page": 1,

    "limit": 25,

    "hotels": \[

      {

        "hotel\_id": "HTL-IST-0941",

        "name": "Swissotel The Bosphorus Istanbul",

        "star\_rating": 5,

        "address": "Visnezade Mah. Acisu Sok. No:19, 34357 Besiktas, Istanbul",

        "location": {

          "latitude": 41.0401,

          "longitude": 28.9984

        },

        "thumbnail": "https://cdn.seeru.travel/hotels/swissotel-ist-main.jpg",

        "min\_price": {

          "amount": 920.00,

          "currency": "SAR",

          "net\_amount": 850.00,

          "tax\_amount": 70.00

        },

        "has\_free\_cancellation": true

      }

    \]

  }

}

---

### 3.2 \[Live Rooms & Rates\] جلب الغرف وتفاصيل سياسات الإلغاء

#### جلب الغرف المتاحة حياً: `POST https://live-api.seeru.travel/v1/hotels/hotel/rooms`

* **Request Payload:**

{

  "search\_id": "SR-LIVE-HTL-8829104",

  "hotel\_id": "HTL-IST-0941"

}

* **Live Response (200 OK):**

{

  "status": "success",

  "data": {

    "hotel\_id": "HTL-IST-0941",

    "hotel\_name": "Swissotel The Bosphorus Istanbul",

    "rooms": \[

      {

        "room\_type\_id": "RM-SWISS-ADV-KING",

        "room\_name": "Advantage King Room, Garden View",

        "description": "38 sqm luxury room with marble bathroom, high-speed Wi-Fi, and Nespresso machine.",

        "photos": \[

          "https://cdn.seeru.travel/hotels/swiss-adv-king-1.jpg"

        \],

        "rates": \[

          {

            "rate\_id": "SR-RATE-LIVE-992101-DX",

            "meal\_plan": {

              "code": "BB",

              "name": "Bed & Breakfast",

              "description": "Buffet breakfast included at Sabrosa Restaurant"

            },

            "refundable": true,

            "cancellation\_policy": {

              "is\_refundable": true,

              "free\_cancellation\_before": "2026-10-12T23:59:59+03:00",

              "penalties": \[

                {

                  "from\_date": "2026-10-13T00:00:00+03:00",

                  "amount": 920.00,

                  "currency": "SAR",

                  "description": "Full reservation penalty applies after cancellation deadline."

                }

              \]

            },

            "price": {

              "total": 4600.00,

              "net": 4250.00,

              "taxes": 350.00,

              "currency": "SAR"

            }

          }

        \]

      }

    \]

  }

}

---

### 3.3 \[Live Fare Valuation\] التحقق من السعر وقفل الرمز المالي

#### تثبيت السعر: `POST https://live-api.seeru.travel/v1/hotels/booking/fare`

* **الوظيفة الحيوية في الإنتاج:** فحص الغرفة مباشرة في نظام الحجز المركزي للفندق للتأكد من عدم حجزها من قبل وكالة أخرى وقفل السعر برمز `fare_token` لمدة 15 دقيقة (900 ثانية).  
* **Request Payload:**

{

  "search\_id": "SR-LIVE-HTL-8829104",

  "hotel\_id": "HTL-IST-0941",

  "rate\_id": "SR-RATE-LIVE-992101-DX"

}

* **Live Response (200 OK):**

{

  "status": "success",

  "data": {

    "is\_valid": true,

    "price\_changed": false,

    "fare\_token": "SR-TOKEN-LIVE-LOCK-881920391204",

    "expires\_in\_seconds": 900,

    "final\_price": {

      "total": 4600.00,

      "currency": "SAR"

    },

    "cancellation\_deadline": "2026-10-12T23:59:59+03:00"

  }

}

---

### 3.4 \[Live Booking & Issuance\] إنشاء الحجز الحي والخصم المالي

#### أ. تجميد الحجز الحي: `POST https://live-api.seeru.travel/v1/hotels/booking/save`

* **Request Payload:**

{

  "fare\_token": "SR-TOKEN-LIVE-LOCK-881920391204",

  "partner\_reference\_id": "LONALIZA-LIVE-ORD-2026-001",

  "lead\_passenger": {

    "title": "MR",

    "first\_name": "Ferdos",

    "last\_name": "Alkan",

    "email": "booking@lonaliza.com",

    "phone": "+966551234567"

  },

  "rooms": \[

    {

      "room\_index": 1,

      "guests": \[

        {

          "title": "MR",

          "first\_name": "Ferdos",

          "last\_name": "Alkan",

          "is\_lead": true,

          "type": "ADULT"

        },

        {

          "title": "MRS",

          "first\_name": "Hanan",

          "last\_name": "Alkan",

          "is\_lead": false,

          "type": "ADULT"

        }

      \]

    }

  \],

  "special\_requests": "Late check-in anticipated around 21:00. Non-smoking room please."

}

* **Live Response (200 OK):**

{

  "status": "success",

  "data": {

    "order\_id": "SR-LIVE-ORD-9912048",

    "partner\_reference\_id": "LONALIZA-LIVE-ORD-2026-001",

    "booking\_status": "SAVED",

    "time\_limit": "2026-10-10T15:00:00+03:00",

    "payable\_amount": {

      "amount": 4600.00,

      "currency": "SAR"

    }

  }

}

---

#### ب. التأكيد الحاسم وإصدار القسيمة: `POST https://live-api.seeru.travel/v1/hotels/order/issue`

* **تنبيه:** هذا الاستدعاء يخصم من حساب الوكالة الإيداعي فوراً.  
* **Request Payload:**

{

  "order\_id": "SR-LIVE-ORD-9912048",

  "payment\_method": "AGENCY\_DEPOSIT"

}

* **Live Response (200 OK):**

{

  "status": "success",

  "data": {

    "order\_id": "SR-LIVE-ORD-9912048",

    "booking\_reference": "SEERU-LIVE-RES-441029",

    "hotel\_confirmation\_code": "SWISS-IST-8842109",

    "status": "CONFIRMED",

    "issued\_at": "2026-09-07T11:30:15Z"

  }

}

---

### 3.5 \[Live Details & Voucher\] استعلام تفاصيل الحجز وقسيمة الإقامة الحية

#### استرجاع تفاصيل الحجز: `POST https://live-api.seeru.travel/v1/hotels/order/details`

* **Request Payload:**

{

  "order\_id": "SR-LIVE-ORD-9912048"

}

* **Live Response (200 OK):**

{

  "status": "success",

  "data": {

    "order\_id": "SR-LIVE-ORD-9912048",

    "partner\_reference\_id": "LONALIZA-LIVE-ORD-2026-001",

    "status": "CONFIRMED",

    "hotel\_details": {

      "name": "Swissotel The Bosphorus Istanbul",

      "address": "Visnezade Mah. Acisu Sok. No:19, Besiktas, Istanbul",

      "phone": "+90 212 326 1100"

    },

    "check\_in": "2026-10-15",

    "check\_out": "2026-10-20",

    "room\_details": {

      "name": "Advantage King Room, Garden View",

      "meal": "Bed & Breakfast"

    },

    "guests": \[

      { "name": "Ferdos Alkan", "type": "ADULT" },

      { "name": "Hanan Alkan", "type": "ADULT" }

    \],

    "voucher\_url": "https://live-api.seeru.travel/v1/hotels/order/voucher/SR-LIVE-ORD-9912048.pdf",

    "cancellation\_policy": {

      "refundable": true,

      "free\_cancellation\_before": "2026-10-12T23:59:59+03:00"

    }

  }

}

---

## 4\. إعدادات بيئة العمل الحية (`.env.production`)

\# \==========================================

\# Seeru Hotels API \- LIVE Production Config

\# \==========================================

SEERU\_ENV="live"

SEERU\_HOTELS\_BASE\_URL="https://live-api.seeru.travel/v1/hotels"

SEERU\_LIVE\_JWT\_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

SEERU\_AGENCY\_CODE="LONALIZA\_PROD\_01"

\# إعدادات الحماية والمهلة الزمنية

SEERU\_TIMEOUT\_MS=35000

SEERU\_MAX\_SEARCH\_POLL\_RETRIES=20

SEERU\_POLL\_INTERVAL\_MS=1500

\# عنوان الـ Webhook الخاص بنظامك لاستقبال تحديثات الحجز

SEERU\_WEBHOOK\_URL="https://lonaliza.com/api/webhooks/seeru/hotels"

SEERU\_WEBHOOK\_SECRET="whsec\_live\_99881122334455667788"

---

## 5\. محول الإنتاج بالـ TypeScript مع معالجة الأخطاء المالية (`hotel-engine/seeru/live-client.ts`)

import axios, { AxiosInstance, AxiosError } from 'axios';

import crypto from 'crypto';

export interface SeeruLiveConfig {

  jwtToken: string;

  baseUrl?: string;

  timeoutMs?: number;

}

export class SeeruHotelsLiveClient {

  private client: AxiosInstance;

  constructor(private config: SeeruLiveConfig) {

    const baseURL \= config.baseUrl || 'https://live-api.seeru.travel/v1/hotels';

    this.client \= axios.create({

      baseURL,

      headers: {

        'Authorization': \`Bearer ${config.jwtToken}\`,

        'Content-Type': 'application/json',

        'Accept': 'application/json',

        'X-Client-Platform': 'lonaliza-engine-v1'

      },

      timeout: config.timeoutMs || 35000

    });

    // Interceptor لإضافة Request ID فريد لكل عملية لتسهيل التتبع والتدقيق المالي

    this.client.interceptors.request.use((req) \=\> {

      req.headers\['X-Request-Id'\] \= crypto.randomUUID();

      return req;

    });

  }

  // 1\. بدء البحث الحي

  async initiateLiveSearch(params: any): Promise\<string\> {

    try {

      const response \= await this.client.post('/search', params);

      return response.data.search\_id;

    } catch (err) {

      this.handleProductionError(err, 'initiateLiveSearch');

    }

  }

  // 2\. استطلاع النتائج دورياً حتى اكتمال المعالجة

  async pollLiveResults(searchId: string, maxRetries \= 20, intervalMs \= 1500): Promise\<any\> {

    for (let i \= 0; i \< maxRetries; i++) {

      try {

        const response \= await this.client.get(\`/result/${searchId}\`);

        if (response.data.data?.is\_completed) {

          return response.data.data;

        }

      } catch (err) {

        // إذا كان خطأ شبكة مؤقت في بيئة الإنتاج، نواصل المحاولة

        console.warn(\`\[Seeru Live Warning\] Transient poll error on attempt ${i \+ 1}:\`, err);

      }

      await new Promise((resolve) \=\> setTimeout(resolve, intervalMs));

    }

    throw new Error(\`\[Seeru Live Timeout\] Search ID ${searchId} timed out after ${maxRetries} polling cycles.\`);

  }

  // 3\. جلب غرف الفندق المختار

  async getLiveHotelRooms(searchId: string, hotelId: string): Promise\<any\> {

    try {

      const response \= await this.client.post('/hotel/rooms', {

        search\_id: searchId,

        hotel\_id: hotelId

      });

      return response.data.data.rooms;

    } catch (err) {

      this.handleProductionError(err, 'getLiveHotelRooms');

    }

  }

  // 4\. التحقق من السعر وقفل رمز الـ Fare

  async validateAndLockLiveFare(searchId: string, hotelId: string, rateId: string): Promise\<any\> {

    try {

      const response \= await this.client.post('/booking/fare', {

        search\_id: searchId,

        hotel\_id: hotelId,

        rate\_id: rateId

      });

      return response.data.data;

    } catch (err) {

      this.handleProductionError(err, 'validateAndLockLiveFare');

    }

  }

  // 5\. تجميد الحجز المبدئي (SAVED)

  async saveLiveReservation(bookingPayload: any): Promise\<any\> {

    try {

      const response \= await this.client.post('/booking/save', bookingPayload);

      return response.data.data;

    } catch (err) {

      this.handleProductionError(err, 'saveLiveReservation');

    }

  }

  // 6\. إصدار الحجز الحي والخصم الفعلي (CONFIRMED)

  async issueLiveOrder(orderId: string): Promise\<any\> {

    try {

      const response \= await this.client.post('/order/issue', {

        order\_id: orderId,

        payment\_method: 'AGENCY\_DEPOSIT'

      });

      return response.data.data;

    } catch (err) {

      this.handleProductionError(err, 'issueLiveOrder');

    }

  }

  // 7\. إلغاء الحجز الحي

  async cancelLiveOrder(orderId: string, reason: string): Promise\<any\> {

    try {

      const response \= await this.client.post('/order/cancel', {

        order\_id: orderId,

        reason

      });

      return response.data.data;

    } catch (err) {

      this.handleProductionError(err, 'cancelLiveOrder');

    }

  }

  // 8\. جلب قسيمة وتفاصيل الحجز

  async getLiveOrderDetails(orderId: string): Promise\<any\> {

    try {

      const response \= await this.client.post('/order/details', { order\_id: orderId });

      return response.data.data;

    } catch (err) {

      this.handleProductionError(err, 'getLiveOrderDetails');

    }

  }

  // معالجة مركزية للأخطاء في بيئة الإنتاج

  private handleProductionError(error: any, actionName: string): never {

    if (axios.isAxiosError(error)) {

      const status \= error.response?.status;

      const data \= error.response?.data;

      const errMessage \= data?.message || data?.error || error.message;

      // أخطاء الرصيد والمالية الشائعة في الإنتاج

      if (status \=== 402 || errMessage?.includes('INSUFFICIENT\_BALANCE')) {

        throw new Error(\`\[Seeru Live Financial Error\] Insufficient agency deposit balance for ${actionName}. Please top up your account.\`);

      }

      if (status \=== 409 || errMessage?.includes('PRICE\_CHANGED')) {

        throw new Error(\`\[Seeru Live Fare Drift\] Rate has expired or changed during ${actionName}. Re-quote required.\`);

      }

      throw new Error(\`\[Seeru Live Error\] ${actionName} failed (HTTP ${status}): ${JSON.stringify(data)}\`);

    }

    throw error;

  }

}

---

## 6\. إجراءات الأمان والتدقيق الإلزامية قبل الإطلاق الحي (Go-Live Checklist)

1. **التحقق من رصيد الحساب التجاري (Live Deposit Balance):** تأكد من شحن حساب وكالتكم في Seeru بمبلغ كافٍ قبل بدء استدعاء `/order/issue`.  
2. **عزل مفاتيح الإنتاج في `.env.production`:** عدم إدراج رمز `SEERU_LIVE_JWT_TOKEN` في مستودع الكود (Git).  
3. **توليد مرجع طلبات فريد (`partner_reference_id`):** استخدام صيغة مثل `LONALIZA-PROD-{TIMESTAMP}-{RANDOM}` لمنع الحجز المزدوج.  
4. **مطابقة أسماء النزلاء لجواز السفر:** استخدام أحرف لاتينية حصراً وبنفس ترتيب وثيقة السفر الرسمية.  
5. **تخزين قسيمة الإقامة (Voucher PDF):** بمجرد تأكيد الحجز، يجب تنزيل الـ Voucher PDF وتخزينه محلياً أو رفعه إلى سحابة التخزين لديكم لتسليمه للعميل حتى في حال تعطل الشبكة لاحقاً.

