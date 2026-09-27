# الدليل المعماري والهندسي الشامل لنظام بوابات الدفع المتعددة وإصلاح لوحة التحكم
# Comprehensive Engineering Blueprint: Multi-Gateway Architecture, Multi-Tenant Engine & Admin Panel Instant-Save Fix

- **المشروع المستهدف**: منصة لوناليزا للسياحة والسفر (`lonaliza-platform`)
- **المشروع المصدر للتكاملات**: نظام الدفع في ليوتريب (`/www/wwwroot/liotrip.com/erxes/backend/plugins/payment_api/src/gateways`)
- **تاريخ التحديث**: سبتمبر 2026
- **المستوى التقني**: مواصفات معمارية وهندسية تفصيلية كاملة (Production Engineering Specification)

---

## فهرس المحتويات
1. [الرؤية المعمارية والأهداف الفنية](#1-الرؤية-المعمارية-والأهداف-الفنية)
2. [المواصفات الفنية التفصيلية لكل بوابة دفع (48+ بوابة مع التشفير ونقاط النهاية 2026)](#2-المواصفات-الفنية-التفصيلية-لكل-بوابة-دفع)
   - 2.1 [بوابات تركيا (Turkey)](#21-بوابات-تركيا-turkey)
   - 2.2 [بوابات الشرق الأوسط وشمال أفريقيا (MENA)](#22-بوابات-الشرق-الأوسط-وشمال-أفريقيا-mena)
   - 2.3 [بوابات عالمية (Global)](#23-بوابات-عالمية-global)
   - 2.4 [بوابات آسيا والمحيط الهادئ (Asia-Pacific)](#24-بوابات-آسيا-والمحيط-الهادئ-asia-pacific)
   - 2.5 [بوابات العملات الرقمية والمشفرة (Crypto)](#25-بوابات-العملات-الرقمية-والمشفرة-crypto)
   - 2.6 [بوابات رابطة الدول المستقلة وروسيا (CIS)](#26-بوابات-رابطة-الدول-المستقلة-وروسيا-cis)
   - 2.7 [بوابات أفريقيا (Africa)](#27-بوابات-أفريقيا-africa)
   - 2.8 [بوابات أمريكا اللاتينية (LATAM)](#28-بوابات-أمريكا-اللاتينية-latam)
3. [معمارية تعدد المستأجرين والشركات (Multi-Tenancy & Tenant Resolver)](#3-معمارية-تعدد-المستأجرين-والشركات)
4. [التشخيص الجذري والحل الهندسي لمشكلة الحفظ والريفريش في كامل لوحة التحكم](#4-التشخيص-الجذري-والحل-الهندسي-لمشكلة-الحفظ-والريفريش)
5. [تصميم وهندسة واجهة إدارة الدفع المتقدمة (`/admin/payments`)](#5-تصميم-وهندسة-واجهة-إدارة-الدفع-المتقدمة)
6. [نظام حماية المفاتيح والتشفير الأمني والـ Webhooks](#6-نظام-حماية-المفاتيح-والتشفير-الأمني-والـ-webhooks)
7. [تنقية الاعتماديات والمكتبات الخارجية (Dependency Cleansing)](#7-تنقية-الاعتماديات-والمكتبات-الخارجية)
8. [خطة التنفيذ المرحلية خطوة بخطوة وجدول التحقق البرمجي](#8-خطة-التنفيذ-المرحلية-خطوة-بخطوة)

---

## 1. الرؤية المعمارية والأهداف الفنية

تهدف هذه البنية المعمارية إلى تحويل منصة لوناليزا من نظام دفع أحادي محصور ببوابة واحدة إلى **محرك دفع عالمي متعدد الأقاليم ومتعدد الشركات (Enterprise Multi-Tenant, Multi-Gateway Payment Engine)**:

```
[ العميل / متجر الشركة ] ──(طلب دفع حجز)──> [ Tenant Payment Resolver ]
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
           [ شركة لديها بوابة خاصة ومفعلة ]                                  [ المنصة المركزية أو شركة بدون بوابة ]
                       │                                                             │
                       ▼                                                             ▼
         [ استدعاء بوابة الشركة المخصصة ]                                    [ البوابة الافتراضية للنظام: Iyzipay ]
         (مثال: Stripe, Tamara, PayTR...)                                            │
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      ▼
                                       [ Unified BaseGateway Core Engine ]
                                  (التأكد من العملة، الدولة، Zod Validation)
                                                      │
                                                      ▼
                                    [ AES-256-GCM Secrets Decryption ]
                                                      │
                                                      ▼
                                  [ Execution / 3DS Redirect / Webhook ]
```

### الأهداف الأساسية:
1. **تثبيت بوابة إيزيكو (Iyzipay) كبوابة افتراضية للمنصة المركزية**:
   - تظل إيزيكو هي الخيار التلقائي لأي عملية دفع تتم على المنصة الرئيسية أو لأي شركة موزع لم تقم بتهيئة وتفعيل بوابة خاصة بها.
2. **حرية اختيار البوابة لكل شركة موزع (Tenant Freedom)**:
   - كل شركة أو وكالة شريكة (Whitelabel Reseller) تستطيع الذهاب إلى قسم بوابات الدفع الخاص بها، وإدخال مفاتيحها السرية لأي بوابة من بين الـ 48+ بوابة التي تمتلك معها اتفاقية تاجر، وتفعيلها.
   - بمجرد تفعيل بوابة الشركة، يتم توجيه كافة عمليات حجز الطيران، الفنادق، الترانسفير، الجولات السياحية على متجر تلك الشركة إلى بوابتها الخاصة مباشرة.
3. **تحديث كافة نقاط النهاية والتكاملات لعام 2026**:
   - استخدام أحدث بروتوكولات REST APIs و Webhooks والتواقيع الرقمية التشفيرية (HMAC-SHA256, RSA-SHA256, MD5/SHA512).
4. **توفير واجهة إدارة متقدمة ومبهرة (`/admin/payments`)**:
   - فلترة حسب الأقاليم والقارات، شعارات رسمية أصلية، اختبار اتصال حي، وحفظ فوري لحظي.
5. **إنهاء مشكلة الريفريش وفقدان المفاتيح نهائياً عبر كامل لوحة التحكم**:
   - عزل الإعدادات عن ملف `.env.local` وإصلاح سلوك أزرار الحفظ في كل الصفحات.

---

## 2. المواصفات الفنية التفصيلية لكل بوابة دفع

توضح الجداول والأقسام التالية التفاصيل الهندسية الدقيقة لكل بوابة من الـ 48+ بوابة:

### 2.1 بوابات تركيا (Turkey)

#### 1. بوابة إيزيكو (Iyzipay) - البوابة الافتراضية للنظام
- **الكود البرمجي (`kind`)**: `iyzico`
- **نوع الدفع**: بطاقات ائتمان وخصم + تقسيط البنوك التركية (Taksit) + 3DSecure + إيداع.
- **الدول والعملات**: تركيا والعالم (TRY, USD, EUR, GBP, SAR, AED).
- **نقاط النهاية 2026**:
  - Live: `https://api.iyzipay.com`
  - Sandbox: `https://sandbox-api.iyzipay.com`
- **حقول الإعدادات (`configFields`)**:
  - `apiKey` (text, required): مفتاح الـ API.
  - `secretKey` (password, required, secret): المفتاح السري.
  - `baseUrl` (url, optional): عنوان API مخصص أو تركه فارغاً للافتراضي.
  - `mode` (select: `production` | `sandbox`).
- **خوارزمية المصادقة والتوقيع**:
  - PKI Authorization: `IYZWS <apiKey>:<base64(sha1(apiKey + randomString + secretKey + requestBody))>`
- **فحص الاتصال الحي (`testConnection`)**:
  - طلب فحص تجريبي عبر `POST /payment/bin/check` أو فحص التوثيق المالي.
- **استقبال الـ Webhook**:
  - التحقق من توقيع `x-iyzi-signature` عبر SHA1/SHA256 للمحتوى الخام.
- **ملف الشعار**: `iyzico.svg`

#### 2. بوابة PayTR
- **الكود البرمجي (`kind`)**: `paytr`
- **نوع الدفع**: iFrame API / Direct Virtual POS مع دعم التقسيط الكامل 2-12 شهر.
- **الدول والعملات**: تركيا، USD، EUR، TRY، GBP.
- **نقاط النهاية 2026**:
  - Token API: `https://www.paytr.com/odeme/api/get-token`
  - iFrame Hosted: `https://www.paytr.com/odeme/guvenli/{token}`
  - Refund API: `https://www.paytr.com/odeme/iade`
- **حقول الإعدادات (`configFields`)**:
  - `merchantId` (text, required): معرف المتجر في PayTR.
  - `merchantKey` (password, required, secret): مفتاح المتجر للتشفير.
  - `merchantSalt` (password, required, secret): الملح السري لـ HMAC.
  - `maxInstallment` (number, optional): الحد الأقصى للأقساط (0-12).
- **خوارزمية التوقيع (HMAC-SHA256)**:
  - Token Hash: `base64(hmacSha256(merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode, merchant_key + merchant_salt))`
  - Webhook Return Hash: `base64(hmacSha256(merchant_oid + merchant_salt + status + total_amount, merchant_key))`
  - الرد الإلزامي عند نجاح الويب هوك: إرجاع النص الصريح `"OK"` بحالة HTTP 200 لمنع إعادة الإرسال.
- **ملف الشعار**: `paytr.svg`

#### 3. بوابة Shopier
- **الكود البرمجي (`kind`)**: `shopier`
- **نوع الدفع**: Hosted Payment Form مع حماية 3DSecure مدمجة.
- **نقاط النهاية 2026**: `https://api.shopier.com/v1/payments`
- **حقول الإعدادات**: `apiKey`, `apiSecret`, `modulVersion: "lonaliza-2.0"`.
- **التوقيع**: `base64(hmacSha256(random_nr + order_id + total_amount + currency, apiSecret))`
- **ملف الشعار**: `shopier.svg`

#### 4. بوابة Paynkolay (N Kolay - Aktif Bank)
- **الكود البرمجي (`kind`)**: `paynkolay`
- **نقاط النهاية 2026**: `https://pos.nkolayislem.com.tr/Payment`
- **حقول الإعدادات**: `merchantId`, `secretKey`, `terminalNo`.
- **التوقيع**: `SHA-512(merchantId + orderId + amount + secretKey)`
- **ملف الشعار**: `paynkolay.png`

#### 5. بوابة Paywant
- **الكود البرمجي (`kind`)**: `paywant`
- **نقاط النهاية 2026**: `https://api.paywant.com/v2/payment`
- **حقول الإعدادات**: `apiKey`, `apiSecret`.
- **التوقيع**: `createHash('sha256').update(apiKey + apiSecret + orderId).digest('hex')`
- **ملف الشعار**: `paywant.png`

#### 6. بوابة Paynet (Paynettr)
- **الكود البرمجي (`kind`)**: `paynettr`
- **نقاط النهاية 2026**: `https://api.paynet.com.tr/v2/transaction/create`
- **حقول الإعدادات**: `publishableKey`, `secretKey`.
- **المصادقة**: `Authorization: Bearer <secretKey>`
- **ملف الشعار**: `paynettr.png`

---

### 2.2 بوابات الشرق الأوسط وشمال أفريقيا (MENA)

#### 7. بوابة ميسر (Moyasar) - السعودية
- **الكود البرمجي (`kind`)**: `moyasar`
- **نوع الدفع**: مدى (Mada), Apple Pay, Visa, Mastercard, STC Pay عبر Invoices API.
- **الدول والعملات**: المملكة العربية السعودية (SAR, USD, EUR, AED).
- **نقاط النهاية 2026**:
  - Invoices: `https://api.moyasar.com/v1/invoices`
  - Payments: `https://api.moyasar.com/v1/payments`
  - Refunds: `https://api.moyasar.com/v1/payments/{id}/refund`
- **حقول الإعدادات**:
  - `secretKey` (password, required, secret): يبدأ بـ `sk_live_` أو `sk_test_`.
  - `publishableKey` (text, optional): يبدأ بـ `pk_live_` أو `pk_test_`.
  - `webhookSecret` (password, optional, secret).
- **المصادقة والتحقق**:
  - Basic Authentication: `Authorization: Basic base64(<secretKey>:)`
  - الويب هوك: مقارنة `Authorization: Basic base64(<webhookSecret>:)` باستخدام `safeCompare`.
- **الوحدات المالية**: وحدات فرعية بالهللات (10.50 SAR = 1050).
- **ملف الشعار**: `moyasar.svg`

#### 8. بوابة بي تابس (PayTabs) - الخليج ومصر
- **الكود البرمجي (`kind`)**: `paytabs`
- **نوع الدفع**: بطاقات دولية، مدى، عمان نت، أبل باي، كروت ميزة.
- **الدول والعملات**: السعودية، الإمارات، مصر، الأردن، عمان (SAR, AED, EGP, USD, JOD, OMR).
- **نقاط النهاية 2026**:
  - Request: `https://secure.paytabs.sa/payment/request` (أو الإقليمي `secure.paytabs.com`)
  - Query: `https://secure.paytabs.sa/payment/query`
- **حقول الإعدادات**: `profileId`, `serverKey`, `clientKey`, `region` (`SA`, `AE`, `EGY`, `GLOBAL`).
- **التوقيع الرقمي**:
  - Header: `Signature: <hmacSha256(payload, serverKey)>`
- **ملف الشعار**: `paytabs.svg`

#### 9. بوابة تمارا (Tamara) - اشتري الآن وادفع لاحقاً (BNPL)
- **الكود البرمجي (`kind`)**: `tamara`
- **نوع الدفع**: تقسيط 3 أو 4 دفعات بدون فوائد للعملاء.
- **الدول والعملات**: السعودية (SAR)، الإمارات (AED)، الكويت (KWD).
- **نقاط النهاية 2026**:
  - Production: `https://api.tamara.co/checkout`
  - Sandbox: `https://api-sandbox.tamara.co/checkout`
  - Refund: `https://api.tamara.co/payments/simplified-refund/{order_id}`
- **حقول الإعدادات**:
  - `apiToken` (password, required, secret).
  - `notificationToken` (password, required, secret).
  - `publicKey` (text, optional).
- **المصادقة**: `Authorization: Bearer <apiToken>`
- **فحص الاتصال**: طلب تجريبي على `/orders/check-eligibility`.
- **ملف الشعار**: `tamara.svg`

#### 10. بوابة تابي (Tabby) - تقسيط 4 دفعات (BNPL)
- **الكود البرمجي (`kind`)**: `tabby`
- **نوع الدفع**: تقسيط المشتريات على 4 أقساط شهرية.
- **الدول والعملات**: الإمارات (AED)، السعودية (SAR)، الكويت (KWD)، البحرين (BHD).
- **نقاط النهاية 2026**:
  - KSA API: `https://api.tabby.sa/api/v2/checkout`
  - Global MENA: `https://api.tabby.ai/api/v2/checkout`
- **حقول الإعدادات**: `secretKey`, `publicKey`, `merchantCode`.
- **المصادقة**: `Authorization: Bearer <secretKey>`
- **ملف الشعار**: `tabby.svg`

#### 11. بوابة باي موب (Paymob) - مصر والشرق الأوسط
- **الكود البرمجي (`kind`)**: `paymob`
- **نوع الدفع**: بطاقات بنكية، محافظ الهاتف المحمول (فودافون كاش، أورنج، اتصالات)، فاليو (ValU)، أمان، فوري.
- **نقاط النهاية 2026**:
  - Authentication: `https://accept.paymob.com/api/auth/tokens`
  - Order: `https://accept.paymob.com/api/ecommerce/orders`
  - Payment Key: `https://accept.paymob.com/api/acceptance/payment_keys`
- **حقول الإعدادات**: `apiKey`, `integrationIdCard`, `integrationIdWallet`, `iframeId`, `hmacSecret`.
- **حساب توقيع الويب هوك (HMAC-SHA512)**:
  - ترتيب الحقول المحددة أبجدياً حسب معايير Paymob وتشفيرها بواسطة `hmacSecret`.
- **ملف الشعار**: `paymob.svg`

#### 12. بوابة يورواي (Urway) - السعودية
- **الكود البرمجي (`kind`)**: `urway`
- **نقاط النهاية 2026**: `https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/serviceRequest`
- **حقول الإعدادات**: `terminalId`, `password`, `merchantKey`.
- **التوقيع**: `SHA-256(trackId + terminalId + password + merchantKey + amount + currency)`
- **ملف الشعار**: `urway.svg`

#### 13. بوابة نون بايمنتس (Noon Payments)
- **الكود البرمجي (`kind`)**: `noonpayments`
- **نقاط النهاية 2026**: `https://api.noonpayments.com/payment/v1/order`
- **حقول الإعدادات**: `authKey`, `keyId`, `businessId`.
- **التوقيع**: HMAC توقيع لرأس الطلب بواسطة `authKey`.
- **ملف الشعار**: `noonpayments.png`

#### 14. بوابة يوكان باي (YouCanPay) - المغرب
- **الكود البرمجي (`kind`)**: `youcanpay`
- **نقاط النهاية 2026**: `https://youcanpay.com/sandbox/api/tokenize` / `https://youcanpay.com/api/tokenize`
- **حقول الإعدادات**: `privateKey`, `publicKey`.
- **ملف الشعار**: `youcanpay.svg` (أو `youcanpay.png`)

#### 15. بوابة كونكت (Konnect) - تونس
- **الكود البرمجي (`kind`)**: `konnect`
- **نقاط النهاية 2026**: `https://api.konnect.network/api/v2/payments/init-payment`
- **حقول الإعدادات**: `apiKey`, `walletId`.
- **ملف الشعار**: `konnect.png`

#### 16. بوابة يلا باي (YallaPay) - الإمارات والبحرين
- **الكود البرمجي (`kind`)**: `yallapay`
- **نقاط النهاية 2026**: `https://api.yallapay.com/v1/checkouts`
- **حقول الإعدادات**: `apiKey`, `secretKey`.
- **ملف الشعار**: `yallapay.png`

#### 17. بوابة إي بوينت (Epoint) - أذربيجان والقوقاز
- **الكود البرمجي (`kind`)**: `epoint`
- **نقاط النهاية 2026**: `https://epoint.az/api/1/request`
- **حقول الإعدادات**: `publicKey`, `privateKey`.
- **التوقيع**: `base64(sha1(privateKey + data + privateKey))`
- **ملف الشعار**: `epoint.png`

#### 18. بوابة باي ريف (Payriff) - أذربيجان
- **الكود البرمجي (`kind`)**: `payriff`
- **نقاط النهاية 2026**: `https://api.payriff.com/api/v2/createOrder`
- **حقول الإعدادات**: `merchantId`, `secretKey`.
- **ملف الشعار**: `payriff.png`

#### 19. بوابة كاردكوم (Cardcom)
- **الكود البرمجي (`kind`)**: `cardcom`
- **نقاط النهاية 2026**: `https://secure.cardcom.solutions/api/v11/LowProfile/Create`
- **حقول الإعدادات**: `terminalNumber`, `apiName`.
- **ملف الشعار**: `cardcom.png`

---

### 2.3 بوابات عالمية (Global)

#### 20. بوابة سترايب (Stripe)
- **الكود البرمجي (`kind`)**: `stripe`
- **نوع الدفع**: PaymentIntents API, Checkout Sessions, Elements, 3DS2, SEPA, Klarna, Afterpay, WeChat Pay, Alipay.
- **الدول والعملات**: تغطية عالمية كاملة (*, 135+ عملة).
- **نقاط النهاية 2026**:
  - `https://api.stripe.com/v1/payment_intents`
  - `https://api.stripe.com/v1/refunds`
- **حقول الإعدادات**:
  - `secretKey` (password, required, secret): يبدأ بـ `sk_live_` أو `sk_test_`.
  - `publishableKey` (text, optional): يبدأ بـ `pk_live_` أو `pk_test_`.
  - `webhookSecret` (password, optional, secret): يبدأ بـ `whsec_`.
- **المصادقة**: `Authorization: Bearer <secretKey>`
- **فحص الاتصال**: طلب تجريبي على `GET /v1/balance`.
- **التحقق من الويب هوك**:
  - فحص توقيع `Stripe-Signature` متضمناً `t=<timestamp>,v1=<signature>` بواسطة HMAC-SHA256 مع مقارنة متزامنة لمنع هجمات الإعادة والتوقيت.
- **ملف الشعار**: `stripe.svg`

#### 21. بوابة باي بال (PayPal)
- **الكود البرمجي (`kind`)**: `paypal`
- **نوع الدفع**: Orders v2 Hosted Flow, PayPal Wallet, Venmo, Pay in 4, Credit Cards.
- **نقاط النهاية 2026**:
  - Live: `https://api-m.paypal.com/v2/checkout/orders`
  - Sandbox: `https://api-m.sandbox.paypal.com/v2/checkout/orders`
  - OAuth Token: `https://api-m.paypal.com/v1/oauth2/token`
- **حقول الإعدادات**: `clientId`, `clientSecret`, `mode` (`live` | `sandbox`), `webhookId`.
- **المصادقة والتخزين المؤقت**:
  - استخراج رمز الوصول (OAuth 2.0 Access Token) وتخزينه في الذاكرة المؤقتة / Redis لمدة تنتهي قبل دقيقة من انتهاء صلاحيته الفعلية.
- **فحص الاتصال**: طلب OAuth Token ناجح بنتيجة 200.
- **التحقق من الويب هوك**: استدعاء `POST /v1/notifications/verify-webhook-signature`.
- **ملف الشعار**: `paypal.svg`

#### 22. بوابة تشيك أوت (Checkout.com)
- **الكود البرمجي (`kind`)**: `checkout`
- **نوع الدفع**: Unified Payments API (NAS v2).
- **نقاط النهاية 2026**:
  - Live: `https://api.checkout.com/payments`
  - Sandbox: `https://api.sandbox.checkout.com/payments`
- **حقول الإعدادات**: `secretKey`, `publicKey`, `processingChannelId`.
- **المصادقة**: `Authorization: Bearer <secretKey>`
- **التحقق من الويب هوك**: توقيع `Cko-Signature` عبر HMAC-SHA256.
- **ملف الشعار**: `checkout.svg`

#### 23. بوابة أمازون باي (Amazon Pay)
- **الكود البرمجي (`kind`)**: `amazonPay`
- **نقاط النهاية 2026**: `https://pay-api.amazon.com/v2/checkoutSessions`
- **حقول الإعدادات**: `merchantId`, `storeId`, `publicKeyId`, `privateKeyPem`.
- **المصادقة**: توقيع تشفيري RSA-SHA256 لكل طلب عبر المفتاح الخاص.
- **ملف الشعار**: `amazon-pay.svg`

#### 24. بوابة بايونير (Payoneer Checkout)
- **الكود البرمجي (`kind`)**: `payoneer`
- **نقاط النهاية 2026**: `https://api.live.checkout.payoneer.com/api/lists`
- **حقول الإعدادات**: `merchantCode`, `apiUsername`, `apiPassword`.
- **ملف الشعار**: `payoneer.svg`

#### 25. بوابة تو تشيك أوت (2Checkout / Verifone)
- **الكود البرمجي (`kind`)**: `twocheckout`
- **نقاط النهاية 2026**: `https://secure.2checkout.com/checkout/buy`
- **حقول الإعدادات**: `merchantCode`, `secretKey`, `secretWord`.
- **التوقيع**: حساب MD5/HMAC لخصائص الشراء وإشعارات INS.
- **ملف الشعار**: `2checkout.svg`

#### 26. بوابة بايمنت وول (Paymentwall)
- **الكود البرمجي (`kind`)**: `paymentwall`
- **نقاط النهاية 2026**: `https://api.paymentwall.com/api`
- **حقول الإعدادات**: `projectKey`, `secretKey`.
- **ملف الشعار**: `paymentwall.svg`

#### 27. بوابة بايشن (Payssion)
- **الكود البرمجي (`kind`)**: `payssion`
- **نقاط النهاية 2026**: `https://www.payssion.com/api/v2/payment/create`
- **حقول الإعدادات**: `apiKey`, `secretKey`.
- **التوقيع**: `MD5(apiKey + secretKey + trackId + amount + currency)`
- **ملف الشعار**: `payssion.svg`

---

### 2.4 بوابات آسيا والمحيط الهادئ (Asia-Pacific)

#### 28. بوابة ميدترانس (Midtrans) - إندونيسيا
- **الكود البرمجي (`kind`)**: `midtrans`
- **نوع الدفع**: Snap iFrame / QRIS / GoPay / ShopeePay / Mandiri.
- **نقاط النهاية 2026**: `https://app.midtrans.com/snap/v1/transactions`
- **حقول الإعدادات**: `serverKey`, `clientKey`.
- **المصادقة**: `Authorization: Basic base64(<serverKey>:)`
- **ملف الشعار**: `midtrans.png`

#### 29. بوابة زينديت (Xendit) - جنوب شرق آسيا
- **الكود البرمجي (`kind`)**: `xendit`
- **نوع الدفع**: Invoices, Virtual Accounts, eWallets, Cards.
- **الدول**: إندونيسيا، الفلبين، فيتنام، ماليزيا.
- **نقاط النهاية 2026**: `https://api.xendit.co/v2/invoices`
- **حقول الإعدادات**: `secretKey`, `webhookVerificationToken`.
- **المصادقة**: `Authorization: Basic base64(<secretKey>:)`
- **ملف الشعار**: `xendit.png`

#### 30. بوابة طيب باي (ToyyibPay) - ماليزيا
- **الكود البرمجي (`kind`)**: `toyyibpay`
- **نقاط النهاية 2026**: `https://toyyibpay.com/index.php/api/createBill`
- **حقول الإعدادات**: `userSecretKey`, `categoryCode`.
- **ملف الشعار**: `toyyibpay.png`

#### 31. بوابة تري باي (TriPay) - إندونيسيا
- **الكود البرمجي (`kind`)**: `tripay`
- **نقاط النهاية 2026**: `https://tripay.co.id/api/transaction/create`
- **حقول الإعدادات**: `apiKey`, `privateKey`, `merchantCode`.
- **التوقيع**: `HMAC-SHA256(merchantCode + orderId + amount, privateKey)`
- **ملف الشعار**: `tripay.png`

#### 32. بوابة دوكو (DOKU) - إندونيسيا
- **الكود البرمجي (`kind`)**: `doku`
- **نقاط النهاية 2026**: `https://api.doku.com/checkout/v1/payment`
- **حقول الإعدادات**: `clientId`, `sharedKey`.
- **ملف الشعار**: `doku.png`

#### 33. بوابة بيل بلز (Billplz) - ماليزيا
- **الكود البرمجي (`kind`)**: `billplz`
- **نقاط النهاية 2026**: `https://www.billplz.com/api/v3/bills`
- **حقول الإعدادات**: `apiSecretKey`, `collectionId`, `xSignatureKey`.
- **ملف الشعار**: `billplz.png`

#### 34. بوابة سنانغ باي (SenangPay) - ماليزيا
- **الكود البرمجي (`kind`)**: `senangpay`
- **نقاط النهاية 2026**: `https://app.senangpay.my/payment/{merchantId}`
- **حقول الإعدادات**: `merchantId`, `secretKey`.
- **التوقيع**: `SHA256(secretKey + detail + amount + orderId)`
- **ملف الشعار**: `senangpay.png`

#### 35. بوابة مايا (PayMaya) - الفلبين
- **الكود البرمجي (`kind`)**: `paymaya`
- **نقاط النهاية 2026**: `https://pg.paymaya.com/checkout/v1/checkouts`
- **حقول الإعدادات**: `publicKey`, `secretKey`.
- **ملف الشعار**: `paymaya.png`

#### 36. بوابة أوميز (Omise / Opn) - تايلاند واليابان
- **الكود البرمجي (`kind`)**: `omise`
- **نقاط النهاية 2026**: `https://api.omise.co/charges`
- **حقول الإعدادات**: `publicKey`, `secretKey`.
- **ملف الشعار**: `omise.png`

#### 37. بوابة باي مي (PayMe) - فيتنام
- **الكود البرمجي (`kind`)**: `payme-vn`
- **نقاط النهاية 2026**: `https://public.payme.vn`
- **حقول الإعدادات**: `appId`, `secretKey`, `privateKeyPem`.
- **ملف الشعار**: `payme-vn.png`

#### 38. بوابة زرين بال (Zarinpal) - إيران
- **الكود البرمجي (`kind`)**: `zarinpal`
- **نقاط النهاية 2026**: `https://api.zarinpal.com/pg/v4/payment/request.json`
- **حقول الإعدادات**: `merchantId`.
- **ملف الشعار**: `zarinpal.png`

#### 39. بوابة باي كوم (Paycom / Payme) - أوزبكستان
- **الكود البرمجي (`kind`)**: `paycom`
- **نقاط النهاية 2026**: `https://checkout.paycom.uz`
- **حقول الإعدادات**: `merchantId`, `secretKey`.
- **ملف الشعار**: `paycom.png`

---

### 2.5 بوابات العملات الرقمية والمشفرة (Crypto)

#### 40. بوابة كريبتوموس (Cryptomus)
- **الكود البرمجي (`kind`)**: `cryptomus`
- **نوع الدفع**: فواتير كريبتو متعددة (USDT TRC20/ERC20, BTC, ETH, TON, BNB, 50+ عملة مشفرة).
- **نقاط النهاية 2026**:
  - Create Invoice: `https://api.cryptomus.com/v1/payment`
  - Refund: `https://api.cryptomus.com/v1/payment/refund`
  - Test / Balance: `https://api.cryptomus.com/v1/balance`
- **حقول الإعدادات**:
  - `merchantId` (text, required): UUID الخاص بحساب التاجر.
  - `apiKey` (password, required, secret): مفتاح الدفع.
  - `webhookSecret` (password, required, secret): مفتاح توقيع الإشعارات.
- **خوارزمية التوقيع**:
  - التوقيع: `createHash('md5').update(Buffer.from(body).toString('base64') + apiKey).digest('hex')`
  - الرأس المرسل: `sign: <calculatedHash>`
- **فحص الاتصال**: استعلام فوري على `POST /v1/balance`.
- **ملف الشعار**: `cryptomus.png`

#### 41. بوابة ناو بايمنتس (NOWPayments)
- **الكود البرمجي (`kind`)**: `nowpayments`
- **نوع الدفع**: دفع بالكريبتو بدون حفظ الأموال (Non-custodial Gateway - أكثر من 150 عملة).
- **نقاط النهاية 2026**: `https://api.nowpayments.io/v1/invoice`
- **حقول الإعدادات**: `apiKey`, `ipnSecret`.
- **التوقيع**: `createHmac('sha512', ipnSecret).update(JSON.stringify(sortedPayload)).digest('hex')`
- **فحص الاتصال**: استعلام `GET /v1/status` المباشر.
- **ملف الشعار**: `nowpayments.png`

#### 42. بوابة كوين بايمنتس (CoinPayments)
- **الكود البرمجي (`kind`)**: `coinpayments`
- **نقاط النهاية 2026**: `https://www.coinpayments.net/api.php`
- **حقول الإعدادات**: `merchantId`, `publicKey`, `privateKey`, `ipnSecret`.
- **التوقيع**: `createHmac('sha512', privateKey).update(postString).digest('hex')`
- **ملف الشعار**: `coinpayments.png`

#### 43. بوابة كوين جيت (CoinGate)
- **الكود البرمجي (`kind`)**: `coingate`
- **نقاط النهاية 2026**: `https://api.coingate.com/v2/orders`
- **حقول الإعدادات**: `apiToken`.
- **المصادقة**: `Authorization: Bearer <apiToken>`
- **ملف الشعار**: `coingate.png`

#### 44. بوابة بيت باي (BitPay)
- **الكود البرمجي (`kind`)**: `bitpay`
- **نقاط النهاية 2026**: `https://bitpay.com/invoices`
- **حقول الإعدادات**: `token`, `mode` (`live` | `test`).
- **ملف الشعار**: `bitpay.png`

#### 45. بوابة كوين بيز (Coinbase Commerce)
- **الكود البرمجي (`kind`)**: `coinbase-commerce`
- **نقاط النهاية 2026**: `https://api.commerce.coinbase.com/charges`
- **حقول الإعدادات**: `apiKey`, `webhookSharedSecret`.
- **المصادقة**: `X-CC-Api-Key: <apiKey>` مع إصدار `X-CC-Version: 2018-03-22`
- **التوقيع**: `createHmac('sha256', webhookSharedSecret).update(rawBody).digest('hex')`
- **ملف الشعار**: `coinbase-commerce.png`

#### 46. بوابة بليسيو (Plisio)
- **الكود البرمجي (`kind`)**: `plisio`
- **نقاط النهاية 2026**: `https://plisio.net/api/v1/invoices/new`
- **حقول الإعدادات**: `secretKey`.
- **ملف الشعار**: `plisio.png`

#### 47. بوابة إني باي (AnyPay)
- **الكود البرمجي (`kind`)**: `anypay`
- **نقاط النهاية 2026**: `https://api.anypayx.com/invoices`
- **حقول الإعدادات**: `apiKey`.
- **ملف الشعار**: `anypay.png` (أو متوافق)

#### 48. بوابة بيرفكت موني (PerfectMoney)
- **الكود البرمجي (`kind`)**: `perfectmoney`
- **نوع الدفع**: محافظ إلكترونية، قسائم e-Voucher.
- **نقاط النهاية 2026**: `https://perfectmoney.com/api/step1.asp`
- **حقول الإعدادات**: `payeeAccount`, `passphrase`, `alternatePassphrase`.
- **التوقيع**: `MD5(orderId + payeeAccount + amount + currency + md5(alternatePassphrase))`
- **ملف الشعار**: `perfectmoney.png`

#### 49. بوابة فوليت (Volet / AdvCash)
- **الكود البرمجي (`kind`)**: `volet`
- **نقاط النهاية 2026**: `https://wallet.volet.com/sci/`
- **حقول الإعدادات**: `accountEmail`, `apiName`, `apiSecret`.
- **التوقيع**: `SHA256(accountEmail + orderId + amount + currency + apiSecret)`
- **ملف الشعار**: `volet.png`

---

### 2.6 بوابات رابطة الدول المستقلة وروسيا (CIS)

#### 50. بوابة يوكاسا (YooKassa) - روسيا ورابطة CIS
- **الكود البرمجي (`kind`)**: `yookassa`
- **نقاط النهاية 2026**: `https://api.yookassa.ru/v3/payments`
- **حقول الإعدادات**: `shopId`, `secretKey`.
- **المصادقة ومفتاح التكرار**:
  - Basic Auth: `base64(shopId:secretKey)`
  - الرأس الإلزامي: `Idempotence-Key: <unique-uuid>`
- **ملف الشعار**: `yookassa.png`

#### 51. بوابة فري كاسا (FreeKassa)
- **الكود البرمجي (`kind`)**: `freekassa`
- **نقاط النهاية 2026**: `https://api.freekassa.ru/v1/orders/create`
- **حقول الإعدادات**: `merchantId`, `secretWord1`, `secretWord2`.
- **التوقيع**: `MD5(merchantId:amount:secretWord1:currency:orderId)`
- **ملف الشعار**: `freekassa.png`

#### 52. بوابة يونيت باي (UnitPay)
- **الكود البرمجي (`kind`)**: `unitpay`
- **نقاط النهاية 2026**: `https://unitpay.ru/api`
- **حقول الإعدادات**: `publicKey`, `secretKey`.
- **التوقيع**: SHA-256 Signature.
- **ملف الشعار**: `unitpay.png`

#### 53. بوابة بايير (Payeer)
- **الكود البرمجي (`kind`)**: `payeer`
- **نقاط النهاية 2026**: `https://payeer.com/merchant/`
- **حقول الإعدادات**: `merchantId`, `secretKey`.
- **التوقيع**: `SHA256(merchantId:orderId:amount:currency:desc:secretKey)`
- **ملف الشعار**: `payeer.png`

---

### 2.7 بوابات أفريقيا (Africa)

#### 54. بوابة فيدا باي (FedaPay) - غرب أفريقيا
- **الكود البرمجي (`kind`)**: `fedapay`
- **الدول**: بنين، توغو، ساحل العاج، السنغال (XOF, XAF).
- **نقاط النهاية 2026**: `https://api.fedapay.com/v1/transactions`
- **حقول الإعدادات**: `secretKey`, `mode` (`live` | `sandbox`).
- **ملف الشعار**: `fedapay.png`

#### 55. بوابة باي سبيس (PaySpace) - جنوب أفريقيا
- **الكود البرمجي (`kind`)**: `payspace`
- **نقاط النهاية 2026**: `https://api.payspace.com/v1/checkout`
- **حقول الإعدادات**: `apiKey`, `apiSecret`.
- **ملف الشعار**: `payspace.png`

#### 56. بوابة برايم بايمنتس (PrimePayments)
- **الكود البرمجي (`kind`)**: `primepayments`
- **نقاط النهاية 2026**: `https://primepayments.com/api/v1/invoice`
- **حقول الإعدادات**: `projectId`, `secretKey`.
- **ملف الشعار**: `primepayments.png`

---

### 2.8 بوابات أمريكا اللاتينية (LATAM)

#### 57. بوابة باي يو لاتام (PayU Latam)
- **الكود البرمجي (`kind`)**: `payu-latam`
- **الدول والعملات**: البرازيل، المكسيك، كولومبيا، الأرجنتين، تشيلي، بيرو (BRL, MXN, COP, ARS, CLP, PEN, USD).
- **نقاط النهاية 2026**: `https://api.payulatam.com/payments-api/4.0/service.cgi`
- **حقول الإعدادات**: `merchantId`, `accountId`, `apiKey`, `apiLogin`.
- **التوقيع**: `MD5(apiKey ~ merchantId ~ referenceCode ~ amount ~ currency)`
- **ملف الشعار**: `payu-latam.png`

---

## 3. معمارية تعدد المستأجرين والشركات (Multi-Tenancy & Tenant Resolver)

### 3.1 نموذج التخزين المشفر للهيكل المزدوج (Dual-Tier Configuration Storage)
يتم حفظ الإعدادات في ملف بيانات مهيكل محمي بمسار:
`/www/wwwroot/lonaliza.com/lonaliza-platform/database/data/payment-gateways.json`

```typescript
export interface TenantGatewayConfig {
  tenantId: string; // "platform" للإعدادات العامة، أو معرف الشركة مثل "cmp_abc123" أو subdomain
  activeGateway: string; // كود البوابة المفضلة (افتراضياً: "iyzico")
  gateways: Record<
    string, // مثل "iyzico", "stripe", "tamara", "paytr"
    {
      enabled: boolean;
      testMode: boolean;
      encryptedCredentials: Record<string, string>; // مشفرة بـ AES-256-GCM
      updatedAt: string;
    }
  >;
}
```

### 3.2 محرك حسم البوابة أثناء إنشاء الحجز (Tenant Gateway Resolver)
عندما يقوم عميل بالدخول إلى شاشة دفع حجز (طيران، فندق، ترانسفير، جولة، محفظة):
1. يستخرج النظام معرف الشركة أو المستأجر من خلال:
   - النطاق المخصص للشركة (Custom Domain المسجل في `ResellerCompany`).
   - النطاق الفرعي (Subdomain).
   - المعرف المرسل في رأس الطلب `x-tenant-id` أو في بيانات الحجز.
2. إذا تم تحديد شركة موزع:
   - يتم قراءة تكوين تلك الشركة من `payment-gateways.json`.
   - إذا كانت الشركة قد فعّلت بوابة محددة (مثل `tamara` أو `stripe` أو `paytr`):
     - يتم فحص جاهزية وتكوين تلك البوابة.
     - إذا كانت جاهزة والعملة مدعومة: **تُستخدم فوراً كبوابة دفع للحجز**.
3. في حال عدم وجود بوابة خاصة مفعّلة للشركة، أو كانت العملية تابعة للمنصة المركزية:
   - **يرجع النظام تلقائياً وبشكل صلب ومضمون 100% إلى بوابة إيزيكو (Iyzipay)** كالبوابة الافتراضية الرسمية.

---

## 4. التشخيص الجذري والحل الهندسي لمشكلة الحفظ والريفريش

### 4.1 التحليل الجنائي لأسباب المشكلة (Detailed Forensic Diagnosis)

#### العيب الأول: سلوك النماذج التقليدية وانعدام `type="button"`
- في مواصفات W3C للغة HTML، إذا لم يُكتب داخل عنصر `<button>` السمة الصريحة `type="button"`، فإن المتصفح يجعله تلقائياً `type="submit"`.
- في شاشات مثل `admin/resale/whitelabel/page.tsx` و `admin/resale/settings/page.tsx`:
  - السطر 296 في `whitelabel/page.tsx`:
    ```tsx
    <button onClick={handleSave} disabled={saving} className="...">
    ```
    كان الزر مجرداً من `type="button"`.
  - معالج `handleSave` في السطر 183 كان يعرف الدالة كـ: `handleSave(e: React.FormEvent)`.
  - عند النقر، استلمت الدالة `MouseEvent` وليس `FormEvent`، مما جعل محاولة `e.preventDefault()` تفشل، مما دفع المتصفح لتنفيذ إرسال فورم تقليدي (Form Submission) أعاد تحميل الصفحة بالكامل!
  - هذا الريفريش القسري أدى إلى إلغاء طلب الـ `fetch` غير المتزامن (Abort Controller Signal) في الخلفية قبل أن يكتمل على الخادم، مما جعل المستخدم يتفاجأ بعدم حفظ البيانات!

#### العيب الثاني: كتابة `.env.local` وإعادة تشغيل عمال خادم Next.js
- دالة `saveServerEnv` في `admin-panel/src/lib/server/env-store.ts` كانت تستدعي السطر 373:
  ```ts
  await mergeEnvLocalFile(envLocalPatch);
  ```
- هذا السطر كان يقوم بإعادة كتابة وتعديل ملف `.env.local` في مسار المشروع مع كل عملية حفظ!
- رصد Next.js لملف `.env.local` يؤدي إلى إعادة تشغيل تلقائية فورية للـ Process داخل Node.js و PM2 (حيث تم تسجيل 115 إعادة تشغيل لعملية `lonaliza-admin-backend`!).
- إعادة تشغيل الخادم أثناء وجود المتصفح على الصفحة تتسبب في تغيير أرقام الـ Chunks المبنية، مما يرمي خطأ `ChunkLoadError` في المتصفح، والذي يُفعّل تلقائياً الكود المسجل في `admin/layout.tsx` بالسطر 67:
  ```ts
  if (msg.includes("ChunkLoadError") || msg.includes("Failed to load chunk")) {
    window.location.reload();
  }
  ```
  فيعاد تحميل الصفحة مجدداً ويفقد المستخدم كل البيانات!

#### العيب الثالث: إسقاط المفاتيح غير المدرجة في القائمة البيضاء
- دالة `saveServerEnv` تفحص المفاتيح بمصفوفة `MANAGED_ENV_KEYS`. أي مفتاح جديد لم يكن مسجلاً في تلك المصفوفة كان يتم إسقاطه وحذفه بصمت ولا يُكتب على الإطلاق.

### 4.2 خطة الإصلاح الجذري الشاملة (Universal Panel-Wide Fix)
1. **عزل كامل لإعدادات بوابات الدفع والصفحات والموزعين عن `.env.local`**:
   - إيقاف تعديل `.env.local` نهائياً عند حفظ الإعدادات التشغيلية للمنصة والموزعين والبوابات.
   - الاعتماد على مخازن JSON المهيكلة المشفرة داخل مجلد البيانات الموحد `database/data/` (مثل `payment-gateways.json`, `custom-pages.json`, `whitelabel-settings.json`).
   - هذا التعديل يمنع إعادة تشغيل Next.js بنسبة 100% ويمنع تماماً أخطاء `ChunkLoadError`.
2. **إصلاح أزرار النماذج في كافة صفحات لوحة التحكم**:
   - تصحيح صريح لكافة عناصر `<button>` لتكون `type="button"`.
   - تعديل التوقيع البرمجي للدوال لتستقبل `(e?: React.SyntheticEvent) => { e?.preventDefault(); ... }`.
   - إلغاء وسم `<form>` التقليدي أو تحويله إلى حاوية `<div>` غير مسببة للأحداث التلقائية للمتصفح.
3. **تطبيق الحفظ المتفائل اللحظي مع إشعارات Sonner/Toasts**:
   - تحديث الحالة المحلية فوراً (Optimistic UI Update).
   - إظهار مؤشر دوران داخل الزر أثناء الاتصال.
   - تحول الزر فوراً إلى شارة نجاح خضراء "تم الحفظ بنجاح" مع علامة صح `Check` وإشعار Toast لطيف يختفي تلقائياً بعد 3 ثوانٍ دون أي وميض أو ريفريش في الشاشة.

---

## 5. تصميم وهندسة واجهة إدارة الدفع المتقدمة (`/admin/payments`)

### 5.1 الهيكل البصري والتنظيمي للصفحة
```
+----------------------------------------------------------------------------------------------------+
| 💳 إدارة بوابات الدفع المركزية وتعدد الشركات                          [ الافتراضي: إيزيكو (Iyzipay) ]|
| نطاق الإعدادات: [ 🏢 منصة لوناليزا المركزية ▼ ]                       البوابات المفعلة: 4 | الإجمالي: 48 |
+----------------------------------------------------------------------------------------------------+
| [الكل (48)] [🇹🇷 تركيا (6)] [🇸🇦 الشرق الأوسط (13)] [🌍 عالمية (8)] [🌏 آسيا (12)] [🪙 كريبتو (10)] ... |
| 🔍 بحث بالاسم، الدولة، العملة...                                      نوع الدفع: [ الكل ▼ ]        |
+----------------------------------------------------------------------------------------------------+
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+ |
|  | [شعار إيزيكو الرسمي]|   | [شعار سترايب الرسمي]|   | [شعار تمارا الرسمي]|   | [شعار ميسر الرسمي] | |
|  | ⭐ الافتراضي للنظام|   | 🟢 نشط ومفعل       |   | 🟢 نشط ومفعل       |   | ⚪ معطل            | |
|  | إيزيكو (Iyzipay)   |   | سترايب (Stripe)    |   | تمارا (Tamara BNPL)|   | ميسر (Moyasar)     | |
|  | 🇹🇷 TRY, USD, EUR   |   | 🌍 All Currencies  |   | 🇸🇦 SAR, AED, KWD   |   | 🇸🇦 SAR, USD, EUR   |
|  | [تفعيل/تعطيل: ON ] |   | [تفعيل/تعطيل: ON ] |   | [تفعيل/تعطيل: ON ] |   | [تفعيل/تعطيل: OFF] |
|  | [⚙️ الإعدادات]     |   | [⚙️ الإعدادات]     |   | [⚙️ الإعدادات]     |   | [⚙️ الإعدادات]     |
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+ |
+----------------------------------------------------------------------------------------------------+
```

### 5.2 مكونات النافذة المنبثقة للإعدادات واختبار الاتصال (`GatewayConfigModal`)
- **توليد الحقول الديناميكي**:
  - الحقول النصية، حقول كلمات المرور، القوائم المنسدلة.
  - الحقول السرية تُعرض كـ `••••••••` وتُفك شفرتها في الخادم فقط.
  - زر إظهار/إخفاء كلمة المرور (Eye / EyeOff).
- **صندوق روابط الويب هوك والعودة (Webhook & Callback Box)**:
  - رابط الـ Webhook: `https://lonaliza.com/api/payments/{gateway}/webhook`
  - زر نسخ الرابط بنقرة واحدة (1-Click Copy) مع تنبيه "تم النسخ".
- **زر اختبار الاتصال المباشر (Live Test Probe)**:
  - يُجري طلباً حياً فورياً على نقطة نهاية الاختبار للبوابة عبر الخادم.
  - يُظهر سرعة استجابة السيرفر بالمللي ثانية (مثال: `الاتصال سليم 100% · زمن الاستجابة 142ms`).
- **زر الحفظ الفوري (Instant Save)**:
  - ينفذ حفظاً غير متزامن فوري، مشفراً للمفاتيح بـ AES-256-GCM.
  - لا يُحدث أي ريفريش للصفحة إطلاقاً.

---

## 6. نظام حماية المفاتيح والتشفير الأمني والـ Webhooks

### 6.1 بروتوكول التشفير المعتمد (AES-256-GCM)
يتم تشفير كافة المفاتيح السرية في ملف الإعدادات بواسطة:
- **الخوارزمية**: `aes-256-gcm`
- **هيكل النص المشفر المعتمد**:
  `enc:v1:<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>`
- **حجم مفتاح التشفير**: 32 بايت مستمد من `PAYMENT_CONFIG_ENCRYPTION_KEY` مع fallback آمن وموثق لبيئات التطوير.
- **الحماية ضد هجمات التوقيت**:
  استخدام دالة المقارنة الآمنة:
  ```typescript
  import { timingSafeEqual } from "crypto";
  export function safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }
  ```

### 6.2 مسار معالجة الـ Webhooks الموحد
- الرابط: `POST /api/payments/[gateway]/webhook`
- الإجراءات:
  1. التحقق من توقيع المزود (HMAC-SHA256 / SHA512 / Signature Header).
  2. استخراج كود الحجز الداخلي `orderId`.
  3. فحص عدم تكرار المعالجة (Idempotency Guard).
  4. تحديث حالة الحجز في قاعدة بيانات PocketBase إلى `paid`.
  5. إرسال إشعارات البريد والواتساب التلقائية وإصدار الفاتورة الضريبية عبر Paraşüt.

---

## 7. تنقية الاعتماديات والمكتبات الخارجية (Dependency Cleansing)

أثناء الفحص الدقيق لمحولات `liotrip`، تم رصد اعتمادية محددة يجب تعديلها أثناء النقل:
1. **في بوابة PayPal (`paypal.gateway.ts`)**:
   - السطر 15 كان يستورد: `import { redis } from 'erxes-api-shared/utils';`
   - **التعديل الهندسي المعتمد في لوناليزا**:
     استبدال هذا الاستيراد بذاكرة تخزين مؤقتة مستقلة مبنية على `ioredis` الموجود مسبقاً في `package.json` للمنصة، أو استخدام ذاكرة Node.js الداخلية `MemoryCache` مع مؤقت صلاحية `expires_in - 60`.
2. **في بوابات Shopier و Tamara**:
   - استبدال تسميات المنصة القديمة `modul_version: 'erxes-1.0'` و `platform: 'erxes'` لتصبح `lonaliza-2.0` و `platform: 'lonaliza'`.

---

## 8. خطة التنفيذ المرحلية خطوة بخطوة

| المرحلة | المهام التفصيلية | الملفات المستهدفة | معايير النجاح والتحقق |
| :--- | :--- | :--- | :--- |
| **المرحلة 1** | **تأسيس المحرك ونقل الشعارات** | - نسخ جميع الشعارات (48+) إلى `admin-panel/public/payment-gateways/` و `storefront/public/payment-gateways/`.<br>- بناء `src/lib/gateways/core/` (`types.ts`, `errors.ts`, `validation.ts`, `crypto.ts`, `BaseGateway.ts`, `GatewayRegistry.ts`, `countries.ts`). | - توفر جميع ملفات الشعارات بدقة عالية.<br>- نجاح فحص TypeScript و تشفير/فك تشفير AES-256-GCM. |
| **المرحلة 2** | **دمج المحولات وتغليف إيزيكو** | - بناء `iyzico.gateway.ts` الافتراضي.<br>- نقل وتحديث بوابات تركيا (PayTR, Shopier..).<br>- نقل بوابات الشرق الأوسط (Moyasar, PayTabs, Tamara, Tabby..).<br>- نقل البوابات العالمية والكريبتو وآسيا وCIS وأفريقيا.<br>- تسجيلها في `catalog.ts` و `index.ts`. | - تسجيل 48+ بوابة بنجاح داخل الـ `GatewayRegistry`.<br>- خلو الملفات من أي استيرادات غير موجودة مثل `erxes`. |
| **المرحلة 3** | **بناء مخزن الإعدادات وتعدد الشركات** | - إنشاء `payment-gateways-store.ts`.<br>- دعم التخزين في `database/data/payment-gateways.json`.<br>- إنشاء مسارات الـ API الإدارية (`/api/admin/payments/catalog`, `/configs`, `/test`, `/toggle`). | - إمكانية جلب وحفظ إعدادات البوابات مع تشفيرها واختبار اتصالها بنجاح عبر API. |
| **المرحلة 4** | **إصلاح مشكلة الحفظ والريفريش** | - مراجعة وإصلاح أزرار الحفظ في `whitelabel/page.tsx`, `settings/page.tsx`, `pages/page.tsx`, `integrations/page.tsx`.<br>- عزل حفظ الإعدادات عن `.env.local`.<br>- إضافة الحفظ المتفائل اللحظي مع إشعارات النجاح. | - تجربة الحفظ في لوحة التحكم والتأكد من عدم حدوث أي ريفريش نهائياً وثبات المفاتيح. |
| **المرحلة 5** | **تطوير واجهة الدفع (`/admin/payments`)** | - بناء شريط الفلترة الإقليمي (تركيا، MENA، عالمي، آسيا، كريبتو..).<br>- شبكة بطاقات البوابات مع الشعارات والشارات.<br>- منتقي الشركات لتخصيص البوابات لكل موزع.<br>- بناء المودال التفاعلي مع زر اختبار الاتصال والحفظ الفوري. | - ظهور واجهة متطورة فائقة السرعة تتيح اختبار وحفظ البوابات بنقرة واحدة. |
| **المرحلة 6** | **ربط الحجوزات ونقاط الويب هوك** | - تعديل مسار بدء الدفع `/api/payments/init` لدعم التوجيه الذكي لبوابة الشركة.<br>- بناء مسارات الاستقبال `/api/payments/[gateway]/webhook` و `/callback`. | - إتمام دورة دفع كاملة واختبار الويب هوك وتحديث الحجز إلى `paid`. |
| **المرحلة 7** | **الاختبارات وبناء الإنتاج** | - إجراء فحص lint و build للمشروع.<br>- إعادة تشغيل التطبيق في PM2 ومراقبة السجلات لضمان صفر أخطاء. | - عمل النظام في الإنتاج بنسبة 100% وبدون أي انهيار أو إعادة تشغيل. |

---

**وثيقة معتمدة وموجهة للتنفيذ المباشر.**
