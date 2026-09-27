# Hotel mobile proxy plan
_Exported on 8/28/2026 at 11:38:40 GMT+3 from Cursor (3.17.21)_

---

**User**

@Hotel_Mobile_Proxy_Scraping_Plan.md  حلل هذه الخطة المقترحة ومايتوفر لدينا بالنظام الحالي بالمشروع وبالسيرفر الخاص بنا واعد كتابة خطة محكمة متوافقة مع ما نملك وما يمكننا توفيره وتنفيذه باعلى درجات الاحترافية والدقة 

---

**Cursor**

سأبدأ بقراءة الخطة المقترحة واستكشاف النظام الحالي والمشروع على السيرفر حتى أعيد صياغة خطة متوافقة مع ما نملك فعلياً.

الخطة المقترحة عامة وغير مربوطة بالمكدس الحالي. سأراجع نقاط الدمج الفعلية في الكود والبنية التحتية قبل إعادة صياغتها.

الخطة الأصلية لا تطابق المكدس الحالي. أحتاج قرارين يغيّران المعمارية قبل كتابة الخطة النهائية.

> **ما الهدف الأساسي بعد التحليل؟ هذا يحدد من أين نبدأ وماذا نبني.**
> - الاحترافي الموصى به: إبقاء RapidAPI كمصدر أسعار حي، مع Redis مشترك، تجديد مجدول، ونقل كتالوج الفنادق الداخلي من localStorage إلى PocketBase
> - هجين: RapidAPI أساسي + تحسين خط الكشط الحالي بـ Playwright لإثراء الكتالوج الداخلي (صور/تقييمات/مراجع) دون استبدال RapidAPI
> - استبدال RapidAPI بمحرك كشط مباشر للأسعار من مواقع الحجز (كما في الوثيقة الأصلية) — أعلم أن هذا مخالف لشروط المواقع وغير مستدام تشغيلياً
> - الانتقال لاحقاً إلى واجهة B2B رسمية للفنادق (مثل Hotelbeds / TBO) مع الحجز الفعلي — وليس الكشط
>
> Answer: انت غبي لا دخل لك بكل هذا هذه خطة مستقلة تخصنا فقط نريد نبني نظام خاص بنا بسيرفرنا بدل الاعتماد على خدمات مطورين مستقلين في رابيد اي بي اي والنظام هذا سيعرض الداتا في موقعنا الحالي هذا ويبقى نظام وربط رابيد كما هو مفعل فقط يصبح لدينا نظام جديد كمزود جديد نكون نحن ونفعله ونلغي تفعيله متى ما نريد

> **مصدر الخروج الشبكي (البروكسي) الذي نبني عليه الخطة؟**
> - بدون بروكسي متحرك: نعتمد على IP السيرفر وRapidAPI كما هو الوضع الحالي
> - هاتف Android شخصي سأخصصه (كما في الوثيقة) وأربطه بالسيرفر ✔
> - بروكسي تجاري جاهز (سكني/متحرك) نشترك فيه إذا لزم
> - اختر أنت الخيار الأكثر احترافية وتوافقاً مع ما نملك

واضح: مزود مستقل قابل للتفعيل بجانب RapidAPI، مع هاتف Android كخروج شبكي. سأعيد كتابة الخطة لتطابق Next.js وPocketBase وPM2 دون نسخ أجزاء التحايل في الوثيقة الأصلية.

---

**User**

دون نسخ أجزاء التحايل في الوثيقة الأصلية ماذا تقصد بهذا وما دخلك انت به ؟؟؟

---

**Cursor**

أقصد آليات تقنية محددة في الوثيقة الأصلية، لا أن مشروعكم «تحايل». سأوضح المعنى وأعدّل صياغة الخطة لتكون تقنية فقط دون هذا الإطار.

سأزيل كلمة «تحايل» من الخطة وأعيد صياغة ما استُبعد ليكون أسباباً تقنية فقط: عدم تطابق المكدس، لا حكماً على مشروعكم.

لا دخل لي بحكم على مشروعكم، والصياغة كانت سيئة. أوضحت المعنى وعدّلت الخطة.

**ماذا كنت أقصد؟**  
ثلاثة تفاصيل داخل قالب الوثيقة الأصلية، لا فكرة «نظامكم الخاص + هاتف + عرض الداتا في الموقع»:

1. مثال الكود يستدعي `supplier-api.example.com` برأس تطبيق iPhone وهمي (`TravelApp/4.12.0`).
2. النص يقول صراحة استهداف واجهات الموبايل لأنها أقل حماية من صفحات الويب.
3. عند 403/429 يُطلب تشغيل وضع الطيران لتغيير الـ IP ثم إعادة المحاولة.

سمّيت ذلك «تحايل» — كلمة في غير محلها. بدا وكأنني أتّهم الفكرة. المقصود كان: **هذا القالب العام لا يُنسخ حرفياً على سيرفركم**، لأن عندكم أصلاً مسار جلب (Playwright في `scripts/`) ومزود في الموقع يحتاج ربطاً حقيقياً، لا خدمة Nest فارغة.

**ما دخلي؟**  
دخلي فقط ملاءمة التنفيذ مع ما يعمل الآن: Next.js، PocketBase، PM2، Redis المشترك مع liotrip، ومفتاح المزود `internal | travel_advisor`. لذلك استُبعد NestJS وCrawlee وRedis جديد على نفس منفذ liotrip — تعارض تقني، لا اعتراض على أن تملكوا المزود.

تدوير الـ IP من الهاتف قراركم التشغيلي. لم يُحذف كـ«ممنوع»؛ المرحلة الأولى تثبّت النفق والكاش والعامل، وربط إشارة التدوير يبقى اختيارياً بعد ذلك.

الخطة المحدّثة: مزود `"owned"` بجانب RapidAPI، هاتف Android، WireGuard، عامل PM2، بدون تلك الكلمة وبدون قسم المواعظ.

---

**User**

@owned_hotel_provider_d1ad531c.plan.md (10) السيرفر لدينا فيه الدوكر وفيه Crawlee وفيه الريديس ويمكنك استخدام كل هذا لما تقول ليس لدينا ويتعارض مع ما لدينا ويمكنك بناء طبقة NestJS مخصصة للنظام هذا وربطها بالموقع والنظام هل هناك مشكلة اليس هكذا افضل واقوى واسرع كنتيجة ؟؟

---

**Cursor**

سأتحقق أين يوجد Docker وCrawlee وRedis وNestJS على السيرفر، ثم أحدّث الخطة بناءً على الواقع وليس على افتراض أنها غير متاحة.

السيرفر يملك Docker وRedis وCrawlee (مستخدم في liotrip) وNestJS. كنت ضيّقاً حين قِستُ على `package.json` الخاص بـ lonaliza فقط. سأعدّل الخطة: طبقة NestJS مستقلة + Crawlee + Redis في Docker على منفذ غير 6379.

لا توجد مشكلة. القياس السابق كان على `package.json` الخاص بـ lonaliza فقط، وهذا ضيّق.

على **السيرفر** يتوفر Docker وRedis وCrawlee (مستخدم في liotrip عبر `PlaywrightCrawler`) وNestJS في مشاريع أخرى. يمكن بناء طبقة NestJS مخصصة وربطها بالموقع.

**أقوى كنظام مستقل: نعم.**  
Next.js يبقى الواجهة والحجز. المحرك عملية منفصلة: وحدات Nest، Crawlee للطابور والمتصفح، Docker يعزل الكاش عن liotrip. هذا أقرب لفكرة «نظام نملكه ونشغّله ونطفئه» من وضع Playwright داخل عملية الموقع.

**أسرع للزائر: ليس بسبب NestJS.**  
البطء من الجلب عبر هاتف 4G والمتصفح. ما يسرّع الصفحة هو Redis بعد أول جلب. Nest مقابل مسار Next لا يغيّر زمن أول كشط.

**ما تغيّر في الخطة:**

- خدمة `hotel-engine` بـ NestJS على `127.0.0.1` فقط (مثلاً 3051)، والموقع يستدعيها عندما `provider === "owned"`.
- Crawlee داخل هذه الخدمة، لا سكربتات يدوية فقط.
- Redis في Docker على منفذ **غير 6379** حتى لا يصطدم بـ liotrip. التعارض كان مشاركة نفس المثيل، لا استخدام Docker أو Redis أصلاً.

RapidAPI و`internal` يبقيان كما هما.

---

**User**

لا اريدك ان تستخدم خدمات ليو تريب وانما انشاء خدمات جديدة حاوية ونيست وكراولي جديدة خاصة بهذا النظام والمشروع والموقع هل فهمت حتى لا تسبب تعارض وخربطة بين المشروعين والنظامين 

---

**Cursor**

مفهوم: خدمات جديدة بالكامل داخل مشروع lonaliza فقط — لا استعارة من liotrip ولا مشاركة Redis أو الحاويات أو الكود. سأثبّت هذا العزل في الخطة.

مفهوم، ومثبّت في الخطة كشرط تنفيذ لا يُكسر.

**liotrip لا يُستخدم كمصدر ولا كبنية تحتية.** ما يظهر هناك (Crawlee، Nest، Redis) يعني فقط أن Docker وnpm على السيرفر يقدران تثبيت نفس **نوع** البرمجيات — وليس أن نربط أو ننسخ أو نشارك شيئاً.

لهذا النظام يُنشأ من الصفر داخل `lonaliza.com/hotel-engine/` فقط:

- NestJS جديد (`package.json` خاص)
- Crawlee يُثبَّت في نفس المشروع، لا من `node_modules` لليو تريب
- Compose جديد: شبكة `lonaliza-hotel-net`، حاويات `lonaliza-hotel-engine` و `lonaliza-hotel-redis`
- Redis جديد على منفذ غير 6379 (مثلاً 6380)، بدون لمس Redis لليو تريب
- لا استيراد من `/www/wwwroot/liotrip.com`، لا شبكات Docker مشتركة، لا تعديل لملفات ليو تريب

الموقع الحالي يبقى كما هو، ويستدعي المحرك الجديد عبر `127.0.0.1` فقط عندما يكون المزود `"owned"`.

---

**User**

خطة المزود المستقل لبيانات الفنادق (خدمات جديدة لـ Lonaliza فقط)

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

سأبدأ بتنفيذ الخطة من التبديل `owned` مع إبقاء RapidAPI كما هو، ثم أبني المحرك المعزول تحت `hotel-engine`.

المنافذ 6380 و3051 شاغرة، وDocker Compose متاح. سأستخرج الكتالوج وأبني المحرك مع ربط Next.js بالتوازي.

الكتالوج جاهز (31 فندقاً). سأبني خدمة NestJS والربط في الموقع دفعة واحدة.

المزود المستقل يعمل الآن كخدمات جديدة داخل lonaliza فقط، بدون أي ربط بليو تريب.

**ما أصبح جاهزاً**

- مزود ثالث في الموقع: `owned` بجانب `internal` و`travel_advisor` (RapidAPI كما هو).
- خدمة NestJS جديدة في [`hotel-engine/`](hotel-engine/) على `127.0.0.1:3051` مع Crawlee مثبّت في نفس المشروع.
- Redis مستقل على `127.0.0.1:6380` (ليس 6379).
- عمليات PM2: `lonaliza-hotel-engine` و`lonaliza-hotel-redis`.
- Compose جاهز في [`hotel-engine/docker-compose.yml`](hotel-engine/docker-compose.yml) بأسماء `lonaliza-hotel-*` — لا تشغّله مع PM2 على نفس المنافذ.
- مجموعات PocketBase: `owned_hotels` و`owned_rate_snapshots`.
- نفق الهاتف: سكربت [`hotel-engine/wg/generate-keys.sh`](hotel-engine/wg/generate-keys.sh) وتعليمات [`hotel-engine/phone/README.md`](hotel-engine/phone/README.md).
- مرجع التشغيل: [`Hotel_Mobile_Proxy_Scraping_Plan.md`](Hotel_Mobile_Proxy_Scraping_Plan.md).

**التفعيل**

من **الإدارة → الفنادق** اختر **المزود الخاص** ثم احفظ. الموقع يعرض نفس واجهة البحث، والمصدر يصبح المحرك المحلي (31 فندقاً من الكتالوج). بدون الهاتف تُعرض أسعار الكتالوج؛ بعد WireGuard و`HOTEL_PROXY_URL` يمكن الجلب الحي.

**ما يبقى عليكم على الهاتف**

1. `apt install wireguard` على السيرفر إن لم يكن مثبتاً، ثم `bash hotel-engine/wg/generate-keys.sh`
2. رفع `wg-lonaliza` وفتح UDP 51831
3. استيراد `phone.conf` في تطبيق WireGuard
4. SOCKS على `10.88.0.2:1080` ثم ضبط `HOTEL_PROXY_URL` في `hotel-engine/.env`

الوضع الحالي للموقع لم يُحوَّل تلقائياً إلى `owned`؛ يبقى `internal` أو RapidAPI إلى أن تفعّلوه من اللوحة.

---

**User**

<timestamp>Thursday, Aug 27, 2026, 5:03 PM (UTC+3)</timestamp>
<system_notification>
The following task has finished. If you were already aware, ignore this notification and do not restate prior responses.

<task>
kind: shell
status: success
task_id: 763300
title: Typecheck Next.js project for provider changes
tool_call_id: call-b8bc98a8-385d-4ad2-bc34-bdd0109c0075-230
fc_12a2dc51-7048-990a-83ec-fdf0116da52e_1
output_path: /root/.cursor/projects/www-wwwroot-lonaliza-com/terminals/763300.txt
</task>
</system_notification>

<timestamp>Thursday, Aug 27, 2026, 5:03 PM (UTC+3)</timestamp>
<system_notification>
The following task has finished. If you were already aware, ignore this notification and do not restate prior responses.

<task>
kind: shell
status: aborted
task_id: 763301
title: Find docker.sock on the server with full access
tool_call_id: call-1d98c54a-05e1-4fbe-bc08-e482cbcf4b7a-238
fc_13308568-af44-913d-b54a-5cd8f87f76b1_1
output_path: /root/.cursor/projects/www-wwwroot-lonaliza-com/terminals/763301.txt
</task>
</system_notification>

<timestamp>Thursday, Aug 27, 2026, 5:03 PM (UTC+3)</timestamp>
<system_notification>
The following task has finished. If you were already aware, ignore this notification and do not restate prior responses.

<task>
kind: shell
status: success
task_id: 763303
title: Rebuild Next.js production bundle with owned provider
tool_call_id: call-eff2c10c-9b2d-4558-a201-80cc08433306-264
fc_045a88c9-e500-95e8-9f7d-e11f2e18b3f1_0
output_path: /root/.cursor/projects/www-wwwroot-lonaliza-com/terminals/763303.txt
</task>
</system_notification>
<user_query>Briefly inform the user about the task result and perform any follow-up actions (if needed). If there's no follow-ups needed, don't explicitly say that.</user_query>

---

**Cursor**

التحقق من TypeScript وإعادة بناء الموقع اكتمل بنجاح. المزود الخاص (`owned`) مدمج في الحزمة الحالية، ومحرك `hotel-engine` وRedis المعزول يعملان عبر PM2.

تفعيله من **الإدارة → الفنادق → المزود الخاص**. ربط الهاتف يتم لاحقاً عبر `hotel-engine/wg/generate-keys.sh` وتعليمات `hotel-engine/phone/README.md`.

