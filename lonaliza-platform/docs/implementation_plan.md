# نظام إعادة بيع LIOTRIP — خطة التنفيذ المحكمة

## وصف المشروع

تحويل `lonaliza.com` من موقع سياحي واحد إلى **منصة أصل (Origin)** تتيح بيع نسخ مرخّصة من النظام لشركات السياحة الأخرى. الموقع الحالي يصبح واجهة البيع + الديمو، مع لوحة شركات مستقلة ونظام ترخيص مشفّر.

## تحليل الوضع الحالي

| العنصر | الحالة |
|--------|--------|
| الإطار | Next.js 16.1.4 + PocketBase 0.30 + iyzico |
| البنية | نسخة واحدة بلا مستأجرين أو أدوار |
| التوجيه | `(site)/*` للموقع العام + `/admin/*` للوحة |
| الأدمن | صلاحية واحدة بدون DEPLOYMENT_ROLE |
| كشط الفنادق | `hotel-engine/` + `src/lib/scraping/` + مزود `owned` |
| الترجمة | ar/en/tr + لغات مخصصة عبر `translations-store.ts` |
| الدفع | iyzico + واتساب بنكي |
| الثوابت | مشفرة في `src/lib/pocketbase/constants.ts` |

---

## المراحل السبع للتنفيذ

> [!IMPORTANT]
> كل مرحلة مستقلة وتُختبر قبل الانتقال للتالية. لا يُكسر الموقع الحي في أي مرحلة.

---

### المرحلة 1: البنية التحتية — `DEPLOYMENT_ROLE` + مجموعات PocketBase

#### [MODIFY] [env-store.ts](file:///www/wwwroot/lonaliza.com/src/lib/server/env-store.ts)
- إضافة `DEPLOYMENT_ROLE` إلى `MANAGED_ENV_KEYS`
- إضافة مفاتيح الترخيص: `LICENSE_KEY`, `LICENSE_ORIGIN`, `LICENSE_SIGNING_KEY`
- دالة جديدة `getDeploymentRole(): "origin" | "client"` تقرأ من `process.env` أو المخزن

#### [NEW] [deployment-role.ts](file:///www/wwwroot/lonaliza.com/src/lib/server/deployment-role.ts)
- `isOrigin()` / `isClient()` — وظائف مساعدة سريعة
- `assertOriginOnly()` — يرمي خطأ 403 إن لم تكن origin
- تُستخدم كحارس في middleware والمسارات

#### [NEW] مجموعات PocketBase — 10 هجرات جديدة:
```
pocketbase/pb_migrations/
├── 1788100100_created_reseller_settings.js
├── 1788100101_created_reseller_companies.js
├── 1788100102_created_reseller_orders.js
├── 1788100103_created_reseller_licenses.js
├── 1788100104_created_reseller_subscriptions.js
├── 1788100105_created_reseller_stage_templates.js
├── 1788100106_created_reseller_progress.js
├── 1788100107_created_reseller_servers.js
├── 1788100108_created_reseller_heartbeats.js
├── 1788100109_created_reseller_domain_events.js
```

**المجموعات بالتفصيل:**

| المجموعة | الحقول الرئيسية |
|----------|----------------|
| `reseller_settings` | lifetimePrice, updatePrice, contaboSpecs, deliveryHours, supportWhatsapp, features (JSON) |
| `reseller_companies` | googleId, email, companyName, logo, requestedDomain, status |
| `reseller_orders` | company (rel), amount, currency, method (iyzico/whatsapp), iyzicoToken, status |
| `reseller_licenses` | company (rel), licenseKey (unique), status (issued→bound), boundDomain, firstActivation |
| `reseller_subscriptions` | company (rel), type (update), status (active/paused/cancelled), nextBilling |
| `reseller_stage_templates` | title (JSON i18n), order, isDefault |
| `reseller_progress` | company (rel), stage (rel), status (pending/done), notes |
| `reseller_servers` | company (rel), ipAddress, aapanelNotes, createdBy |
| `reseller_heartbeats` | company (rel), domain, version, lastPing, online |
| `reseller_domain_events` | company (rel), domain, eventType (dns_check/bind_success/bind_fail), details |

#### [MODIFY] [admin-nav.ts](file:///www/wwwroot/lonaliza.com/src/components/admin/admin-nav.ts)
- إضافة `NavGroupId` جديد: `"resale"`
- مجموعة `resale` تحتوي: الإعدادات، الشركات، التراخيص، التحديثات، المراحل
- تُخفى عندما `DEPLOYMENT_ROLE=client`

#### [MODIFY] [.env.local](file:///www/wwwroot/lonaliza.com/.env.local)
- إضافة `DEPLOYMENT_ROLE=origin`

---

### المرحلة 2: نقل الموقع السياحي إلى `/demo` + صفحة الهبوط

#### [MODIFY] بنية المجلدات:
```
src/app/
├── (site)/          → يُنقل المحتوى إلى demo/
├── demo/            ← [NEW] مجلد الديمو (نسخة من (site))
│   ├── layout.tsx   ← نسخة من (site)/layout.tsx
│   ├── page.tsx     ← صفحة الحجوزات الرئيسية
│   ├── hotels/
│   ├── flights/
│   ├── ...
├── (site)/
│   ├── page.tsx     ← [MODIFY] صفحة الهبوط الجديدة (LIOTRIP)
│   ├── layout.tsx   ← [MODIFY] layout جديد لصفحة الهبوط
```

#### [MODIFY] [next.config.ts](file:///www/wwwroot/lonaliza.com/next.config.ts)
- إضافة 301 redirects من المسارات القديمة (`/hotels` → `/demo/hotels` إلخ)
- فقط عندما `DEPLOYMENT_ROLE=origin`

#### [MODIFY] [middleware.ts](file:///www/wwwroot/lonaliza.com/src/middleware.ts)
- دعم `/partners` كمسار محمي بجوجل OAuth
- دعم `/demo` يمر بدون تغيير

#### [NEW] صفحة الهبوط — مكونات جديدة:
```
src/components/landing/
├── LandingHero.tsx           ← Hero تفاعلي — LIOTRIP
├── TrustBanner.tsx           ← شريط الثقة (12-24 ساعة، Contabo، SSL)
├── FeaturesGrid.tsx          ← شبكة الميزات المستخرجة من النظام
├── HowItWorks.tsx            ← خطوات: تسجيل → شراء → تجهيز → إطلاق
├── LiveDemoSection.tsx       ← رابط /demo
├── PricingSection.tsx        ← التسعير (مدى الحياة + 50$/شهر)
├── ServerSpecsSection.tsx    ← مواصفات Contabo
├── FAQSection.tsx            ← أسئلة شائعة + CTA
├── LandingNavbar.tsx         ← شريط التنقل
├── LandingFooter.tsx         ← ذيل الصفحة
```

> [!NOTE]
> صفحة الهبوط تُبنى بتصميم 21st.dev حصراً — مكونات تفاعلية عصرية بتدرجات لونية حديثة وanimations. ستُنفذ بعناية فائقة.

#### ترجمة الهبوط:
- مفاتيح i18n جديدة `landing.*` في `types.ts` وملفات القواميس
- تظهر تلقائياً بأي لغة مُضافة من `/admin/translations`

---

### المرحلة 3: لوحة الشركات `/partners`

#### [NEW] مسار `/partners`:
```
src/app/partners/
├── layout.tsx               ← layout مستقل بتصميم خاص
├── page.tsx                 ← تسجيل/دخول جوجل
├── dashboard/
│   ├── page.tsx             ← لوحة الشركة الرئيسية
│   ├── api-key/page.tsx     ← عرض مفتاح الترخيص
│   ├── progress/page.tsx    ← خط التقدم التفاعلي
│   ├── domain/page.tsx      ← ربط الدومين + اختبار الاتصال
│   ├── subscription/page.tsx ← إدارة اشتراك التحديث
```

#### [NEW] API endpoints للشركات:
```
src/app/api/partners/
├── auth/google/route.ts        ← OAuth جوجل مستقل
├── auth/google/callback/route.ts
├── checkout/route.ts           ← شراء الباقة عبر iyzico
├── checkout/callback/route.ts
├── domain/submit/route.ts      ← إرسال الدومين
├── domain/test/route.ts        ← اختبار DNS
├── subscription/route.ts       ← إدارة اشتراك التحديث
```

#### اختبار الربط (DNS Test):
- حل DNS للدومين من سيرفر الأصل
- مقارنة A record بـ IP المخزّن في `reseller_servers`
- طلب HTTP تحدي للتأكد من وصول الموقع
- رسائل خطأ دقيقة: لا A record، IP مختلف، لا شهادة، مهلة
- النجاح → يربط الترخيص بالدومين + إشعار للسوبر أدمن

#### زر الدعم:
- يظهر **فقط عند فشل** اختبار الاتصال
- رابط واتساب مباشر من `reseller_settings.supportWhatsapp`

---

### المرحلة 4: بروتوكول الترخيص

#### [NEW] API الترخيص على الأصل:
```
src/app/api/license/
├── activate/route.ts       ← تفعيل أول مرة (يربط المفتاح بالدومين)
├── heartbeat/route.ts      ← استقبال نبضات من نسخ العملاء
├── check/route.ts          ← فحص حالة الترخيص
```

#### [NEW] عميل الترخيص (لنسخة العميل):
```
src/lib/license/
├── client.ts               ← منطق النبضة + التفعيل
├── guard.ts                ← fail-closed — التطبيق لا يقلع بدون ترخيص
├── crypto.ts               ← توقيع + تشفير الحمولة (HMAC-SHA256)
```

**القواعد:**
1. `LICENSE_KEY` + `LICENSE_ORIGIN` في `.env.local` لنسخة العميل
2. عند الإقلاع: `POST /api/license/activate` مرة واحدة
3. كل N دقائق: `POST /api/license/heartbeat` بحمولة موقّعة
4. أول تفعيل ناجح **يغلق المفتاح** على الدومين المسجّل
5. أي دومين آخر → رفض → صفحة قفل
6. حذف/تعطيل وحدة الترخيص → التطبيق لا يقلع (**fail-closed**)

#### [NEW] صفحة القفل:
```
src/app/license-invalid/page.tsx   ← تظهر عند فشل الترخيص
```

#### [MODIFY] [middleware.ts](file:///www/wwwroot/lonaliza.com/src/middleware.ts)
- عند `DEPLOYMENT_ROLE=client`: فحص الترخيص عند الإقلاع
- إعادة توجيه لصفحة القفل إن فشل

#### [NEW] قسم الترخيص في أدمن العميل:
```
src/app/admin/license/page.tsx    ← إدخال المفتاح / عرض حالة الربط
```

> [!IMPORTANT]
> **لن يُنفَّذ** كود يحذف ملفات عن بُعد. القفل + ربط الدومين + إلغاء الترخيص يحقق نفس الهدف بطريقة قانونية آمنة.

---

### المرحلة 5: سكربت الاستنساخ والتهجير

#### [NEW] [provision-client-instance.mjs](file:///www/wwwroot/lonaliza.com/scripts/provision-client-instance.mjs)

**ما يُستثنى:**
- `hotel-engine/` بالكامل
- `src/lib/scraping/` و `scripts/hotel-scraper/` و `src/data/scraping/`
- مزود `owned` من `HotelsProviderPanel.tsx`
- هجرات `owned_hotels` و `owned_rate_snapshots`
- أسرار الكشط: `HOTEL_ENGINE_*`, `HOTEL_PROXY_URL`
- صفحات `/` الهبوط + `/partners` + `/admin/resale` + مجموعات `reseller_*`

**ما يُنقل بالكامل:**
- تكامل الفنادق الخارجي (Travel Advisor + Booking.com15 + RapidAPI)
- تكامل الطيران (Sky Scrapper + Travelpayouts)
- الترانسفير والسيارات
- iyzico، جيميني، البريد، الأتمتة، الولاء، العمولة

**بذرة الديمو:**
- حجوزات الريان موسومة `is_demo_seed: true`
- المقالات + الخدمات (باقات، جولات، فنادق، سيارات...)
- القالب البصري + الثيم كقاعدة
- شريط تنبيه للحذف الجماعي

**ما يُنشأ على سيرفر العميل:**
- شجرة مشروع نظيفة + `DEPLOYMENT_ROLE=client`
- PocketBase بنفس الجداول + بذرة ديمو موسومة
- قوالب nginx: الدومين، `pocketbase.{domain}`
- تعليمات `mail.{domain}` لـ SMTP
- مفتاح الترخيص مضمّن

#### [NEW] [demo-seed.ts](file:///www/wwwroot/lonaliza.com/src/lib/server/demo-seed.ts)
- وسم السجلات الحالية بـ `is_demo_seed`
- الحذف الجماعي في أدمن العميل

#### [NEW] شريط المحتوى التجريبي:
```
src/components/admin/DemoSeedBanner.tsx  ← شريط تنبيه + حذف جماعي
```

---

### المرحلة 6: اشتراك التحديثات الليلية

#### [NEW] نظام التحديث:
```
src/app/api/updates/
├── publish/route.ts          ← السوبر أدمن ينشر إصدار
├── package/[version]/route.ts ← نسخة العميل تسحب الحزمة
├── check/route.ts            ← فحص توفر تحديث
```

#### [NEW] قسم التحديث في أدمن العميل:
```
src/app/admin/updates/page.tsx  ← مقفل إن لم يشترك
```

**السلوك:**
- السوبر أدمن يرفع إصداراً ويحدد نافذة ليلية
- المشتركون النشطون فقط يستلمون
- نسخة العميل **تسحب** الحزمة الموقّعة وتتحقق من التوقيع
- غير المشترك: لا سحب + قسم مقفل

#### [NEW] قسم التحديثات في لوحة السوبر أدمن:
```
src/app/admin/resale/updates/page.tsx
```

---

### المرحلة 7: الجولة التعليمية التفاعلية

#### [NEW] نظام الجولة:
```
src/components/admin/tour/
├── AdminProductTour.tsx       ← المكون الرئيسي
├── TourOverlay.tsx            ← التعتيم + النافذة
├── TourSpotlight.tsx          ← السهم/السبوتلايت
├── TourProgress.tsx           ← شريط التقدم
├── tour-steps.ts              ← خطوات الجولة (i18n)
├── use-tour.ts                ← hook إدارة الحالة
```

#### [MODIFY] [admin/layout.tsx](file:///www/wwwroot/lonaliza.com/src/app/admin/layout.tsx)
- إضافة زر الجولة في الهيدر بجانب اللغة والإشعارات
- دمج `AdminProductTour` في layout

#### خطوات الجولة:
1. نظرة عامة → 2. الحجوزات → 3. العملاء → 4. الخدمات (فنادق، طيران، باقات...) → 5. المحتوى (محرر، صفحات، مدونة + حذف بذرة الديمو) → 6. التسويق → 7. النظام → 8. الإعدادات → 9. الترخيص (عميل فقط) → 10. إعادة البيع (سوبر أدمن فقط)

- مفاتيح `adminTour.*` في i18n
- نسخة العميل لا تتضمن خطوات الكشط ولا إعادة البيع

---

## لوحة السوبر أدمن — `/admin/resale`

```
src/app/admin/resale/
├── page.tsx                    ← نظرة عامة
├── settings/page.tsx           ← الإعدادات (سعر، ميزات، Contabo)
├── companies/page.tsx          ← الشركات والطلبات
├── companies/[id]/page.tsx     ← تفاصيل شركة
├── delivery/page.tsx           ← خط التسليم والمراحل
├── licenses/page.tsx           ← التراخيص
├── updates/page.tsx            ← التحديثات الليلية
```

---

## خطة الأمان (Security)

- بروتوكول الترخيص: HMAC-SHA256 للتوقيع + TLS للنقل
- OAuth جوجل: redirect URI مستقل لـ `/partners`
- مفاتيح الترخيص: `crypto.randomBytes(32)` — لا تُخزّن plaintext
- API endpoints: تحقق من الهوية + rate limiting
- `DEPLOYMENT_ROLE`: يُفحص server-side فقط
- نبضة الترخيص: server-to-server فقط (لا تظهر في المتصفح)
- fail-closed: حذف/تعطيل ملف الترخيص → التطبيق لا يقلع

---

## خطة التحقق

### اختبارات آلية
```bash
npm run test           # اختبارات vitest الحالية يجب أن تمر
npm run build          # البناء يجب أن ينجح
npm run lint           # لا أخطاء جديدة
```

### تحقق يدوي
- تأكيد أن `/demo/hotels`, `/demo/flights` تعمل
- تأكيد أن `/` تعرض صفحة الهبوط الجديدة
- تأكيد أن `/partners` تعمل مع جوجل OAuth
- تأكيد أن `/admin/resale` تظهر فقط عند `DEPLOYMENT_ROLE=origin`
- تأكيد أن الجولة التعليمية تعمل في لوحة الأدمن
- اختبار DNS test endpoint

---

## ما لن يُؤتمت في هذه المرحلة

- شراء Contabo من API
- تثبيت aaPanel عن بُعد بالكامل
- حذف ملفات عن بُعد على سيرفرات العملاء
- Stripe أو بوابات غير iyzico/واتساب

---

## Open Questions

> [!IMPORTANT]
> **سعر الباقة مدى الحياة:** ما هو السعر الأولي الذي تريد وضعه كافتراضي في `reseller_settings`؟ (يمكن تغييره لاحقاً من اللوحة)

> [!IMPORTANT]
> **مواصفات Contabo:** هل تريد نص محدد لمواصفات السيرفر (RAM, CPU, Storage) يظهر في صفحة الهبوط، أم تفضل تركه فارغاً لتعبئته من اللوحة لاحقاً؟

> [!IMPORTANT]
> **رقم واتساب الدعم:** هل نستخدم نفس رقم الموقع الحالي أم رقم مختلف؟

---

## ترتيب البدء

أبدأ فوراً بـ **المرحلة 1** (DEPLOYMENT_ROLE + مجموعات PocketBase + قسم إعادة البيع في admin-nav) لأنها الأساس الذي تبنى عليه كل المراحل الأخرى — وهي الأقل خطراً على الموقع الحي.
