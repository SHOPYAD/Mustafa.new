# التشغيل والاختبارات
## فتح الحزمة
افتح index.html للتجربةالمحلية و plan.html للخطةالمتكاملة. الصوروالخططتعملدونإنترنت.
للميكروفونوتجربة browser موحدة: Node مثبتثم npm start وافتح http://127.0.0.1:4173.
الميكروفونلايرسلولايسجل،و TTS صوتالمتصفحالمتاح؛ ليستجلسةوكيل Backend.

## إعادة الاختبارات
npm install
npx playwright install chromium
npm test
npm run verify:references
npm run visual:compare

package.json يثبتنسخالاختبار؛ أول npm install ينشئ lockfile لبيئتك. راجعالنسخوالـ registry المسموح فيالمؤسسة. لايوجد node_modules داخلال zip.
PLAYWRIGHT_EXECUTABLE_PATH اختياري لمسارمتصفحمتاح. إعادة snapshots بالضبطتحتاجنفسالمتصفحوالنظاموالخطوط؛الاختباراتالوظيفيةأقلالتزامًابذلك.

## ما الذي اختُبر هنا
tests/prototype.spec.cjs:20 مسارعرضوصورها،نافالمرجع،بحثوسيدبار،توسيع/طي،سحبالعقدوحفظها،النوافذ،حالاتالصوت،رفضالميكروفون،محاكاة،زوم،مقاسصغير،منعطلباتخارجية.
هذهلا تثبتالـ Backend ولاجودةالتطابقولاميكروفونحقيقيأوصوتمعينمتوفر. رفضالإذن محاكى.
evidence/playwright-results.json نتيجةالتشغيلالحقيقية و evidence/renders لقطات.
visual:compare يرجع exit2 إذااختلفتالبكسلات،وهذامتوقعلهذاالنموذج. لاتغير threshold ليمُر.

## توصيل اختبارات المشروع
املأ quality/target-routes.json بعدجردالمستودع:مسارفعلي و readySelector لكلواجهة.
TARGET_BASE_URL يستهدف localhost أو staging مأذون؛ ثم npm run test:target.
الاختبارالحالي target scaffolding يلتقط screens فقط؛ أضفاختباراتسيناريوهاتكلوثيقةولا تعتبره suite أعمالكاملة.
ACTUAL_DIR=evidence/target ثم npm run visual:compare لمقارنةالمشروع.
لايوجدتجاوزتلقائيلصفحات login أومفاتيحالأسرار؛ استخدم storageState منحساباختبارمأذون واحفظهخارجالحزمةولا ترفعه git.

## بوابة الإتمام
npm run gate:completion
يفشلالآنلأنالمهامالإنتاجية pending. لايقاسإتمامالمشروعمننجاحاختبارات prototype.
ملف production-acceptance.json يُنشأفقطعندمراجعةحقيقية،بـ screensAccepted:20 و criticalFailures:0 و reviewedBy هويةالمراجع؛أرفقروابطالأدلة.

