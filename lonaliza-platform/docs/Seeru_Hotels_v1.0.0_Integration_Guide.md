> **⚠️ تحذير (2026-09-10):** هذا الملف لا يطابق واجهة Seeru Hotels الفعلية. المرجع الرسمي الوحيد هو مواصفة OpenAPI: https://docs.seeru.travel/docs/hotels-api-v1.0.0.yml (المسارات الحقيقية: `GET /suggest`, `GET /search`, `GET /result/{search_id}`, `GET /rates`, `POST /booking/save`, `POST /order/issue`, `POST /order/details`, `POST /order/cancel`). كما أن خدمة الفنادق غير مفعّلة حالياً لمكتبنا في Seeru (HTTP 403 "Service hotels is not enabled for this office"). المحوّل `src/lib/providers/adapters/seeru/seeruHotelAdapter.ts` مبني على المواصفة الرسمية.

# Seeru Hotels API v1.0.0 \- دليل التكامل الشامل والمواصفات الرسمية الكاملة

---

## 1\. نظرة عامة والمعمارية التقنية (Architecture & Overview)

واجهة برمجة تطبيقات الفنادق **Seeru Hotels API v1.0.0** هي واجهة برمجة تطبيقات حديثة مبنية وفق مواصفات **OpenAPI 3.0 (OAS 3.0)** وتعتمد معمارية **RESTful JSON** لتوفير الوصول إلى مخزون الفنادق العالمية ومقارنة الأسعار اللحظية وإتمام عمليات الحجز المباشر والإلغاء وإصدار قسائم الإقامة (Vouchers).

### 1.1 عناوين الخوادم (Base URLs & Environments)

الواجهة تدعم المتغيرات البيئية القياسية للتنقل السلس بين بيئة الاختبار والإنتاج:

| البيئة | المتغير (`endpoint`) | عنوان الخادم الأساسي (Base URL) |
| :---- | :---- | :---- |
| **بيئة الاختبار (Sandbox)** | `sandbox` | `https://sandbox-api.seeru.travel/v1/hotels` |
| **بيئة الإنتاج (Live / Production)** | `live` | `https://live-api.seeru.travel/v1/hotels` |
| **النمط العام للمسار** | `{endpoint}` | `https://{endpoint}-api.seeru.travel/{version}/hotels` |

* **إصدار الواجهة الحالية (`version`):** `v1`

### 1.2 المصادقة والأمان (Authentication & Security)

تتطلب جميع نقاط النهاية في Seeru Hotels توثيقاً إلزامياً عبر **JWT Bearer Token**:

* **نوع التوثيق:** `HTTP Bearer Authentication`  
* **الترويسة (Header):**  
    
  Authorization: Bearer \<YOUR\_JWT\_TOKEN\>  
    
  Content-Type: application/json  
    
  Accept: application/json  
    
* يتم توليد رمز الـ JWT من خلال بوابة شركاء Seeru (B2B Partner Portal) أو عبر نقطة مصادقة حساب الوكالة.

---

## 2\. دورة حياة حجز الفنادق الإلزامية (End-to-End Hotel Booking Flow)

تتبع Seeru معمارية حجز متعددة المراحل لضمان دقة الأسعار وتوافر الغرف ومنع الحجوزات المكررة:

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐

│ 1\. بدء البحث    │ ────\> │ 2\. جلب النتائج  │ ────\> │ 3\. تفاصيل الفندق │

│ POST /search    │       │ GET /result/{id}│       │ POST /rooms     │

└─────────────────┘       └─────────────────┘       └─────────────────┘

                                                             │

┌─────────────────┐       ┌─────────────────┐                │

│ 5\. تأكيد الحجز  │ \<──── │ 4\. فحص السعر    │ \<──────────────┘

│ POST /booking   │       │ POST /fare      │

└─────────────────┘       └─────────────────┘

         │

         ▼

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐

│ 6\. إصدار التذكرة│ ────\> │ 7\. تفاصيل الطلب │ ────\> │ 8\. قسيمة الإقامة│

│ POST /order/issue│      │ POST /order     │       │ GET /voucher    │

└─────────────────┘       └─────────────────┘       └─────────────────┘

1. **البحث المبدئي (Search Initiation):** إرسال معايير الوجهة، التواريخ، وتوزيع النزلاء، والحصول على `search_id`.  
2. **استخراج النتائج تدريجياً (Result Polling):** الاستعلام عن النتائج عبر `search_id` حتى تكتمل وتصل النسبة إلى 100%.  
3. **استعراض الغرف المتاحة (Rooms & Rates):** جلب فئات الغرف والوجبات وسياسات الإلغاء لكل غرفة برمز `rate_id`.  
4. **تدقيق وتثبيت السعر (Fare Validation):** خطوة إلزامية للتحقق من ثبات السعر وتجميد السعر قبل الخصم من العميل.  
5. **إنشاء الطلب المبدئي (Booking Order Creation):** حجز الغرفة وتمرير أسماء النزلاء والحصول على `order_id`.  
6. **الدفع وتأكيد الحجز (Order Issuance):** تأكيد الحجز والخصم من رصيد الوكالة (B2B Credit/Deposit Balance).  
7. **إدارة الطلب وقسيمة الإقامة (Voucher & Order Info):** تحميل الـ Voucher الرسمي واستعراض كود التأكيد الفندقي.  
8. **الإلغاء (Cancellation):** إلغاء الحجز واحتساب الغرامات وفق سياسة الإلغاء المحددة.

---

## 3\. التوثيق التفصيلي لكافة نقاط النهاية (Endpoints Reference)

### 3.1 \[Search\] البحث عن الفنادق المتاحة

#### أ. بدء عملية البحث: `POST /search`

يبدأ عملية البحث غير المتزامنة (Asynchronous Search) في وجهة محددة.

* **Method:** `POST`  
    
* **Path:** `/search`  
    
* **Headers:**  
    
  * `Authorization: Bearer <TOKEN>` (Required)  
  * `Content-Type: application/json`


* **Request Body Schema:**  
    
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
    
        "children": \[5\]  
    
      }  
    
    \],  
    
    "residency": "SA",  
    
    "currency": "SAR",  
    
    "nationality": "SA",  
    
    "filter": {  
    
      "star\_rating": \[4, 5\],  
    
      "min\_price": 200,  
    
      "max\_price": 2000  
    
    }  
    
  }  
    
* **Request Fields Description:**  
    
  * `destination.type` (string, required): نوع الوجهة (`city`, `hotel_id`, `coordinates`).  
  * `destination.code` (string, required): كود المدينة أو معرف الفندق (مثال: `IST`, `DXB`).  
  * `check_in` (string, required): تاريخ الدخول بصيغة `YYYY-MM-DD`.  
  * `check_out` (string, required): تاريخ الخروج بصيغة `YYYY-MM-DD`.  
  * `occupancies` (array, required): مصفوفة توزيع الغرف والنزلاء.  
    * `room_id` (integer): رقم الغرفة التعريفي.  
    * `adults` (integer, required): عدد البالغين في الغرفة (\>= 1).  
    * `children` (array of integers, optional): أعمار الأطفال (من 0 إلى 17).  
  * `residency` (string, required): كود دولة الإقامة المكون من حرفين وفق ISO 3166-1 alpha-2 (يؤثر على الضرائب والأسعار).  
  * `nationality` (string, required): جنسية النزيل الرئيسي.  
  * `currency` (string, required): كود العملة المطلوب عرض الأسعار بها (مثل: `USD`, `SAR`, `TRY`, `EUR`).  
  * `filter` (object, optional): معايير الفلترة (النجوم، حدود السعر).


* **Success Response (200 OK):**  
    
  {  
    
    "status": "success",  
    
    "search\_id": "SR-HTL-SRCH-9921840",  
    
    "status\_code": 200,  
    
    "message": "Search initiated successfully",  
    
    "data": {  
    
      "search\_id": "SR-HTL-SRCH-9921840",  
    
      "is\_completed": false,  
    
      "progress\_percentage": 15,  
    
      "total\_hotels\_found": 12  
    
    }  
    
  }

---

#### ب. جلب نتائج البحث تدريجياً: `GET /result/{search_id}`

يتم استدعاء هذا المسار دورياً (Polling كل ثانية إلى ثانيتين) حتى تصبح قيمة `is_completed` مساوية لـ `true`.

* **Method:** `GET`  
* **Path:** `/result/{search_id}`  
* **Path Parameters:**  
  * `search_id` (string, required): معرف البحث المستخرج من خطوة الـ `POST /search`.  
* **Query Parameters:**  
  * `page` (integer, optional, default: 1): رقم الصفحة.  
  * `limit` (integer, optional, default: 20): عدد الفنادق في الصفحة.  
  * `sort_by` (string, optional): الترتيب (`price_asc`, `price_desc`, `rating_desc`).  
* **Success Response (200 OK):**  
    
  {  
    
    "status": "success",  
    
    "data": {  
    
      "search\_id": "SR-HTL-SRCH-9921840",  
    
      "is\_completed": true,  
    
      "total\_hotels": 154,  
    
      "page": 1,  
    
      "limit": 20,  
    
      "hotels": \[  
    
        {  
    
          "hotel\_id": "HTL-IST-10928",  
    
          "name": "Hilton Istanbul Bosphorus",  
    
          "star\_rating": 5,  
    
          "address": "Harbiye, Cumhuriyet Cd. No:50, 34367 Sisli/Istanbul",  
    
          "location": {  
    
            "latitude": 41.0422,  
    
            "longitude": 28.9897  
    
          },  
    
          "thumbnail": "https://images.seeru.travel/hotels/htl-10928-main.jpg",  
    
          "min\_price": {  
    
            "amount": 750.00,  
    
            "currency": "SAR",  
    
            "net\_amount": 700.00,  
    
            "tax\_amount": 50.00  
    
          },  
    
          "has\_free\_cancellation": true  
    
        }  
    
      \]  
    
    }  
    
  }

---

### 3.2 \[Hotel Details & Rooms\] تفاصيل الفندق والغرف المتاحة

#### أ. جلب فئات الغرف والأسعار الحية للفندق: `POST /hotel/rooms`

يجلب جميع الغرف والخيارات (الوجبات وسياسات الإلغاء) لفندق محدد بناءً على رقم البحث `search_id`.

* **Method:** `POST`  
* **Path:** `/hotel/rooms`  
* **Request Body Schema:**  
    
  {  
    
    "search\_id": "SR-HTL-SRCH-9921840",  
    
    "hotel\_id": "HTL-IST-10928"  
    
  }  
    
* **Success Response (200 OK):**  
    
  {  
    
    "status": "success",  
    
    "data": {  
    
      "hotel\_id": "HTL-IST-10928",  
    
      "hotel\_name": "Hilton Istanbul Bosphorus",  
    
      "rooms": \[  
    
        {  
    
          "room\_type\_id": "RM-DX-KING",  
    
          "room\_name": "Deluxe Room, 1 King Bed, Bosphorus View",  
    
          "description": "Spacious room with luxury amenities and private balcony overlooking the Bosphorus strait.",  
    
          "photos": \[  
    
            "https://images.seeru.travel/hotels/room-dx-king-1.jpg",  
    
            "https://images.seeru.travel/hotels/room-dx-king-2.jpg"  
    
          \],  
    
          "rates": \[  
    
            {  
    
              "rate\_id": "SR-RATE-DX-RO-99881",  
    
              "meal\_plan": {  
    
                "code": "BB",  
    
                "name": "Bed & Breakfast",  
    
                "description": "Daily buffet breakfast included for all guests"  
    
              },  
    
              "refundable": true,  
    
              "cancellation\_policy": {  
    
                "is\_refundable": true,  
    
                "free\_cancellation\_before": "2026-10-12T23:59:59+03:00",  
    
                "penalties": \[  
    
                  {  
    
                    "from\_date": "2026-10-13T00:00:00+03:00",  
    
                    "amount": 750.00,  
    
                    "currency": "SAR",  
    
                    "description": "1 night penalty applies"  
    
                  }  
    
                \]  
    
              },  
    
              "price": {  
    
                "total": 3750.00,  
    
                "net": 3500.00,  
    
                "taxes": 250.00,  
    
                "currency": "SAR"  
    
              }  
    
            }  
    
          \]  
    
        }  
    
      \]  
    
    }  
    
  }

---

### 3.3 \[Fare Check\] فحص وتثبيت السعر قبل الحجز (Pre-booking Valuation)

#### فحص صلاحية السعر: `POST /booking/fare`

خطوة إلزامية في نظام Seeru لمنع تذبذب الأسعار وحجز رمز التحقق `fare_token` المحدث قبل تعبئة بيانات الدفع.

* **Method:** `POST`  
* **Path:** `/booking/fare`  
* **Request Body Schema:**  
    
  {  
    
    "search\_id": "SR-HTL-SRCH-9921840",  
    
    "hotel\_id": "HTL-IST-10928",  
    
    "rate\_id": "SR-RATE-DX-RO-99881"  
    
  }  
    
* **Success Response (200 OK):**  
    
  {  
    
    "status": "success",  
    
    "data": {  
    
      "is\_valid": true,  
    
      "price\_changed": false,  
    
      "fare\_token": "SR-LOCKED-TOKEN-8812903841",  
    
      "expires\_in\_seconds": 900,  
    
      "final\_price": {  
    
        "total": 3750.00,  
    
        "currency": "SAR"  
    
      },  
    
      "cancellation\_deadline": "2026-10-12T23:59:59+03:00"  
    
    }  
    
  }  
    
* **قاعدة عمل هامة:** إذا تغير السعر من قبل المزود الأصلي، تُرجع الاستجابة `price_changed: true` والسعر الجديد، وتتطلب تأكيداً من العميل.

---

### 3.4 \[Booking & Order\] إنشاء وتأكيد الحجز

#### أ. إنشاء وحفظ أمر الحجز: `POST /booking/save`

يقوم هذا المسار بإنشاء سجل الحجز (Order) وتمرير بيانات النزلاء والاتصال وتجميد الغرفة.

* **Method:** `POST`  
* **Path:** `/booking/save`  
* **Request Body Schema:**  
    
  {  
    
    "fare\_token": "SR-LOCKED-TOKEN-8812903841",  
    
    "partner\_reference\_id": "LONALIZA-RES-2026-9912",  
    
    "lead\_passenger": {  
    
      "title": "MR",  
    
      "first\_name": "Ahmed",  
    
      "last\_name": "Almansoori",  
    
      "email": "guest@example.com",  
    
      "phone": "+966501234567"  
    
    },  
    
    "rooms": \[  
    
      {  
    
        "room\_index": 1,  
    
        "guests": \[  
    
          {  
    
            "title": "MR",  
    
            "first\_name": "Ahmed",  
    
            "last\_name": "Almansoori",  
    
            "is\_lead": true,  
    
            "type": "ADULT"  
    
          },  
    
          {  
    
            "title": "MRS",  
    
            "first\_name": "Sara",  
    
            "last\_name": "Almansoori",  
    
            "is\_lead": false,  
    
            "type": "ADULT"  
    
          },  
    
          {  
    
            "title": "CHD",  
    
            "first\_name": "Omar",  
    
            "last\_name": "Almansoori",  
    
            "is\_lead": false,  
    
            "type": "CHILD",  
    
            "age": 5  
    
          }  
    
        \]  
    
      }  
    
    \],  
    
    "special\_requests": "High floor room and non-smoking preferred."  
    
  }  
    
* **Success Response (200 OK):**  
    
  {  
    
    "status": "success",  
    
    "data": {  
    
      "order\_id": "SR-ORD-8812901",  
    
      "partner\_reference\_id": "LONALIZA-RES-2026-9912",  
    
      "booking\_status": "SAVED",  
    
      "time\_limit": "2026-10-10T18:00:00+03:00",  
    
      "payable\_amount": {  
    
        "amount": 3750.00,  
    
        "currency": "SAR"  
    
      }  
    
    }  
    
  }

---

#### ب. الدفع وتأكيد الحجز الفوري: `POST /order/issue`

يقوم بخصم المبلغ من حساب الوكالة (B2B Credit Balance / Deposit) وتأكيد الحجز النهائي مع الفندق.

* **Method:** `POST`  
* **Path:** `/order/issue`  
* **Request Body Schema:**  
    
  {  
    
    "order\_id": "SR-ORD-8812901",  
    
    "payment\_method": "AGENCY\_DEPOSIT"  
    
  }  
    
* **Success Response (200 OK):**  
    
  {  
    
    "status": "success",  
    
    "data": {  
    
      "order\_id": "SR-ORD-8812901",  
    
      "booking\_reference": "SEERU-CONF-449102",  
    
      "hotel\_confirmation\_code": "HILT-IST-883192",  
    
      "status": "CONFIRMED",  
    
      "issued\_at": "2026-09-07T11:20:00Z"  
    
    }  
    
  }

---

### 3.5 \[Order Details & Documents\] إدارة الطلب وقسيمة الإقامة

#### أ. استعلام تفاصيل الحجز: `POST /order/details`

* **Method:** `POST`  
* **Path:** `/order/details`  
* **Request Body Schema:**  
    
  {  
    
    "order\_id": "SR-ORD-8812901"  
    
  }  
    
* **Success Response (200 OK):**  
    
  {  
    
    "status": "success",  
    
    "data": {  
    
      "order\_id": "SR-ORD-8812901",  
    
      "partner\_reference\_id": "LONALIZA-RES-2026-9912",  
    
      "status": "CONFIRMED",  
    
      "hotel\_details": {  
    
        "name": "Hilton Istanbul Bosphorus",  
    
        "phone": "+90 212 315 6000",  
    
        "address": "Harbiye, Sisli, Istanbul"  
    
      },  
    
      "check\_in": "2026-10-15",  
    
      "check\_out": "2026-10-20",  
    
      "room\_details": {  
    
        "name": "Deluxe Room, 1 King Bed",  
    
        "meal": "Bed & Breakfast"  
    
      },  
    
      "guests": \[  
    
        { "name": "Ahmed Almansoori", "type": "ADULT" },  
    
        { "name": "Sara Almansoori", "type": "ADULT" },  
    
        { "name": "Omar Almansoori", "type": "CHILD" }  
    
      \],  
    
      "cancellation\_policy": {  
    
        "refundable": true,  
    
        "free\_cancellation\_before": "2026-10-12T23:59:59+03:00"  
    
      },  
    
      "voucher\_url": "https://api.seeru.travel/v1/hotels/order/voucher/SR-ORD-8812901"  
    
    }  
    
  }

---

#### ب. إلغاء الحجز: `POST /order/cancel`

* **Method:** `POST`  
* **Path:** `/order/cancel`  
* **Request Body Schema:**  
    
  {  
    
    "order\_id": "SR-ORD-8812901",  
    
    "reason": "Customer requested cancellation"  
    
  }  
    
* **Success Response (200 OK):**  
    
  {  
    
    "status": "success",  
    
    "data": {  
    
      "order\_id": "SR-ORD-8812901",  
    
      "status": "CANCELLED",  
    
      "refund\_amount": 3750.00,  
    
      "cancellation\_fee": 0.00,  
    
      "currency": "SAR",  
    
      "cancelled\_at": "2026-09-07T11:25:00Z"  
    
    }  
    
  }

---

## 4\. رموز الأخطاء والمعالجة البرمجية (Error Handling & HTTP Status Codes)

تتبع Seeru معايير كود الأخطاء الموحدة في استجابات HTTP:

| كود الاستجابة | المعنى التقني | أسباب الحدوث الشائعة | الإجراء البرمجي الموصى به |
| :---- | :---- | :---- | :---- |
| `200 OK` | نجاح العملية | تم استلام الطلب وتلبيته بنجاح | متابعة الخطوة التالية في دورة الحجز |
| `400 Bad Request` | خطأ في المدخلات | نقص في حقل إلزامي أو خطأ في صيغة التاريخ | التحقق من صحة الـ Payload بواسطة Zod |
| `401 Unauthorized` | فشل المصادقة | انتهاء صلاحية JWT Token أو عدم إرساله | إعادة توليد رمز التوثيق وتحديث الترويسات |
| `404 Not Found` | المورد غير موجود | `search_id` أو `order_id` غير صحيح أو منتهي | إعادة تشغيل البحث من البداية |
| `409 Conflict` | تغير السعر أو عدم التوافر | الغرفة نفدت أو تغير سعرها أثناء خطوة الـ Fare | إخطار العميل بالسعر الجديد أو إعادة البحث |
| `422 Unprocessable` | فشل التحقق المنطقي | خطأ في أعمار الأطفال أو تاريخ الخروج قبل الدخول | تصحيح تواريخ الإقامة وتوزيع الأعمار |
| `500 Internal Error` | خطأ داخلي في الخادم | انقطاع الاتصال مع مزود الفندق الأصلي | إعادة المحاولة بنمط Exponential Backoff |

---

## 5\. نماذج البيانات الكاملة للـ TypeScript (Types & DTOs)

يمكنك نسخ هذا الهيكل مباشرة داخل مشروعك في المسار `hotel-engine/seeru/types.ts`:

export interface SeeruDestination {

  type: 'city' | 'hotel\_id' | 'coordinates';

  code: string;

  name?: string;

}

export interface SeeruOccupancy {

  room\_id: number;

  adults: number;

  children?: number\[\];

}

export interface SeeruHotelSearchRequest {

  destination: SeeruDestination;

  check\_in: string; // YYYY-MM-DD

  check\_out: string; // YYYY-MM-DD

  occupancies: SeeruOccupancy\[\];

  residency: string; // ISO 2-letter

  nationality: string; // ISO 2-letter

  currency: string;

  filter?: {

    star\_rating?: number\[\];

    min\_price?: number;

    max\_price?: number;

  };

}

export interface SeeruHotelSearchResult {

  search\_id: string;

  is\_completed: boolean;

  total\_hotels: number;

  page: number;

  limit: number;

  hotels: SeeruHotelSummary\[\];

}

export interface SeeruHotelSummary {

  hotel\_id: string;

  name: string;

  star\_rating: number;

  address: string;

  location: {

    latitude: number;

    longitude: number;

  };

  thumbnail: string;

  min\_price: {

    amount: number;

    currency: string;

    net\_amount: number;

    tax\_amount: number;

  };

  has\_free\_cancellation: boolean;

}

export interface SeeruCancellationPenalty {

  from\_date: string;

  amount: number;

  currency: string;

  description: string;

}

export interface SeeruRatePlan {

  rate\_id: string;

  meal\_plan: {

    code: string;

    name: string;

    description: string;

  };

  refundable: boolean;

  cancellation\_policy: {

    is\_refundable: boolean;

    free\_cancellation\_before: string;

    penalties: SeeruCancellationPenalty\[\];

  };

  price: {

    total: number;

    net: number;

    taxes: number;

    currency: string;

  };

}

export interface SeeruRoomOption {

  room\_type\_id: string;

  room\_name: string;

  description: string;

  photos: string\[\];

  rates: SeeruRatePlan\[\];

}

export interface SeeruFareCheckResponse {

  is\_valid: boolean;

  price\_changed: boolean;

  fare\_token: string;

  expires\_in\_seconds: number;

  final\_price: {

    total: number;

    currency: string;

  };

  cancellation\_deadline: string;

}

export interface SeeruGuest {

  title: 'MR' | 'MRS' | 'MS' | 'CHD' | 'INF';

  first\_name: string;

  last\_name: string;

  is\_lead?: boolean;

  type: 'ADULT' | 'CHILD';

  age?: number;

}

export interface SeeruBookingSaveRequest {

  fare\_token: string;

  partner\_reference\_id: string;

  lead\_passenger: {

    title: string;

    first\_name: string;

    last\_name: string;

    email: string;

    phone: string;

  };

  rooms: {

    room\_index: number;

    guests: SeeruGuest\[\];

  }\[\];

  special\_requests?: string;

}

export interface SeeruBookingSaveResponse {

  order\_id: string;

  partner\_reference\_id: string;

  booking\_status: 'SAVED' | 'CONFIRMED' | 'FAILED';

  time\_limit: string;

  payable\_amount: {

    amount: number;

    currency: string;

  };

}

---

## 6\. نموذج تنفيذ عميل الخدمة بالـ TypeScript (`SeeruHotelService`)

يمكنك إدراج هذا النموذج في `hotel-engine/seeru/client.ts`:

import axios, { AxiosInstance } from 'axios';

import {

  SeeruHotelSearchRequest,

  SeeruHotelSearchResult,

  SeeruRoomOption,

  SeeruFareCheckResponse,

  SeeruBookingSaveRequest,

  SeeruBookingSaveResponse

} from './types.js';

export class SeeruHotelService {

  private client: AxiosInstance;

  constructor(

    private token: string,

    private environment: 'sandbox' | 'live' \= 'sandbox'

  ) {

    const baseURL \= \`https://${this.environment}-api.seeru.travel/v1/hotels\`;

    this.client \= axios.create({

      baseURL,

      headers: {

        'Authorization': \`Bearer ${this.token}\`,

        'Content-Type': 'application/json',

        'Accept': 'application/json'

      },

      timeout: 30000

    });

  }

  // 1\. بدء البحث

  async initiateSearch(request: SeeruHotelSearchRequest): Promise\<string\> {

    const res \= await this.client.post('/search', request);

    return res.data.search\_id;

  }

  // 2\. استطلاع النتائج دورياً حتى الاكتمال

  async pollResults(searchId: string, maxAttempts \= 15): Promise\<SeeruHotelSearchResult\> {

    for (let i \= 0; i \< maxAttempts; i++) {

      const res \= await this.client.get(\`/result/${searchId}\`);

      if (res.data.data.is\_completed) {

        return res.data.data;

      }

      await new Promise((resolve) \=\> setTimeout(resolve, 1500));

    }

    throw new Error('Search polling timeout exceeded.');

  }

  // 3\. جلب الغرف والأسعار

  async getHotelRooms(searchId: string, hotelId: string): Promise\<SeeruRoomOption\[\]\> {

    const res \= await this.client.post('/hotel/rooms', { search\_id: searchId, hotel\_id: hotelId });

    return res.data.data.rooms;

  }

  // 4\. التحقق من السعر وقفل العملة

  async checkFare(searchId: string, hotelId: string, rateId: string): Promise\<SeeruFareCheckResponse\> {

    const res \= await this.client.post('/booking/fare', { search\_id: searchId, hotel\_id: hotelId, rate\_id: rateId });

    return res.data.data;

  }

  // 5\. إنشاء أمر الحجز

  async saveBooking(request: SeeruBookingSaveRequest): Promise\<SeeruBookingSaveResponse\> {

    const res \= await this.client.post('/booking/save', request);

    return res.data.data;

  }

  // 6\. تأكيد وإصدار الحجز

  async issueOrder(orderId: string): Promise\<any\> {

    const res \= await this.client.post('/order/issue', { order\_id: orderId, payment\_method: 'AGENCY\_DEPOSIT' });

    return res.data.data;

  }

  // 7\. إلغاء الحجز

  async cancelOrder(orderId: string, reason: string): Promise\<any\> {

    const res \= await this.client.post('/order/cancel', { order\_id: orderId, reason });

    return res.data.data;

  }

}

---

## 7\. القواعد الإلزامية لتفادي أخطاء الربط (Best Practices)

1. **الأسماء بالأبجدية اللاتينية فقط:** يجب ألا تحتوي حقول `first_name` و `last_name` على حروف عربية أو رموز خاصة، بل يجب تحويل الأسماء إلى الحروف اللاتينية (English Transliteration).  
2. **التعامل مع المناطق الزمنية (Timezones):** كافة مواعيد الإلغاء المجاني (`free_cancellation_before`) تُعاد بتنسيق ISO 8601 مصحوبة بفرق التوقيت (`+03:00` أو `Z`). يجب مراعاة مقارنتها بالتوقيت العالمي لتفادي الخصم غير المتوقع.  
3. **تجنب تكرار الطلبات (Idempotency):** استخدم دائماً `partner_reference_id` فريداً لكل عملية حجز لتفادي الحجز المزدوج في حال انقطاع الشبكة أثناء استدعاء `/booking/save`.

