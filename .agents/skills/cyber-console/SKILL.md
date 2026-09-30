---
name: cyber-console
description: خطوات بناء وتوسيع الاستوديو السيبراني (لوحة الإدارة البديلة) في لوناليزا — إضافة مجال، نظام، قدرة للوكيل، نافذة، والتحقق البصري. استخدمها لأي عمل في src/lib/studio أو hud/studio/shell أو api/admin/studio.
---

# Cyber Console Skill

المرجع الحاكم: `lonaliza-platform/admin-panel/docs/cyber-console/ARCHITECTURE.md` والقاعدة `.cursor/rules/cyber-console.mdc`.
كل المسارات أدناه نسبية إلى `lonaliza-platform/admin-panel/`.

## 1. إضافة نظام/قسم إلى خريطة
1. تحقق أن القسم موجود: صفحة `src/app/admin/<x>/page.tsx`، ومجموعته في PocketBase أو مساره `src/app/api/admin/<x>/route.ts`.
2. أضف المحور في `src/lib/neural-studio/domain-systems.ts` (id ثابت، label من `admin-nav.ts`، items حقيقية فقط).
3. `npx vitest run src/lib/neural-studio/domain-systems.test.ts` — يفشل إن كان أي مرجع غير موجود أو النص يتصادم.
4. الخرائط L1/L2 تُولَّد تلقائيًا في `src/lib/studio/graph/domain-map.ts`؛ لا تعدل مكوّنات الواجهة.

## 2. إضافة قدرة للوكيل
1. عرّفها في `src/lib/studio/capabilities/registry.ts`:
   ```ts
   { id: "bookings.enquiry.set_status", domainId: "bookings", nodeId: "crm...", kind: "command", risk: "medium",
     target: { collection: "enquiry_bookings" }, input: z.object({ id: z.string(), status: z.enum([...]) }),
     titleAr: "تغيير حالة طلب" }
   ```
2. نفّذها في `src/lib/studio/capabilities/executor.server.ts` داخل `switch(cap.id)`: `preview` (قراءة فقط) ثم `apply`.
3. استعمل دوال الخادم الموجودة (مثل `approveCancel` في `lib/server/hotel-cancellations.ts`) بدل إعادة كتابة المنطق.
4. أضف اختبارًا في `src/lib/studio/capabilities/registry.test.ts` (الهدف موجود، risk مناسب).
5. شغّل `node scripts/gen-capabilities-doc.cjs` لتحديث `docs/cyber-console/CAPABILITIES.md`.

## 3. إضافة نافذة
- استخدم `WindowChrome` (`shell/windows/WindowChrome.tsx`) و `tokens`؛ سجّل النوع في `lib/studio/windows/window-store.ts` (`WindowKind`) وفي `shell/windows/WindowHost.tsx`.
- الجداول: `TableWindow` مع `{ collection }` أو `{ route }` — لا جداول مخصصة لكل قسم.

## 4. التحقق البصري (إلزامي قبل أي ادعاء)
```bash
cd lonaliza-platform/admin-panel
node scripts/studio-render.cjs --screen 01 --size 1672x941 --out /tmp/s01.png --diff
node scripts/studio-render.cjs --screen 01 --size 1920x1080 --out /tmp/s01-1080.png
```
- الملف يبني bundle بـ esbuild ويشغّل Playwright مع بيانات حية من PocketBase (للقراءة فقط).
- افتح الصور بنفسك. اكتب الفروق في `PROGRESS.md`.

## 5. النشر
```bash
npx vitest run src/lib/studio src/lib/neural-studio && npx tsc --noEmit -p .
./scripts/deploy-admin.sh   # بناء معزول ثم تبديل ذري إلى .next-live ثم إعادة تشغيل
```

## 6. تحكم الوكيل وتفويض الوكلاء
- أي إجراء في أي قسم: قدرة `admin.route.call` (نفس مسارات اللوحة العادية، GET منخفض، إعدادات متوسط، غيرها عالٍ).
- التفويض المتوازي: `POST /api/admin/studio/agents/delegate` ← `lib/studio/agents/task-board.server.ts`؛ الحالة الحية: `GET /api/admin/studio/agents` وأحداث SSE بمصدر `agent_task`.
- الصفحات الحقيقية داخل النوافذ: أضف `?studio=1` (تخطيط `app/admin/layout.tsx` يعرضها بلا إطار اللوحة وبثيم الاستوديو).
