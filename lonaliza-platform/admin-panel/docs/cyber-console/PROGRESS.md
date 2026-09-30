# Cyber Console — سجل التقدم

| المرحلة | الحالة | الأدلة |
|---|---|---|
| F0 وثائق/قواعد/مهارة/سكربت رندرة | منجز | `docs/cyber-console/*`, `.cursor/rules/cyber-console.mdc`, `.agents/skills/cyber-console/SKILL.md`, `scripts/studio-render.cjs`, `scripts/gen-capabilities-doc.cjs` |
| F1 أمن وتنظيف | منجز | مصادقة `agent-stream` و34 مسار admin كانت مفتوحة (بينها `swarm-deliberate` و`voice-tts` و`demo-seed` و`resale/marketing/*/send`)؛ حذف البيانات المختلقة من `mcp-swarm-gateway.ts` (أدوات بلا نظام حقيقي ترجع `unwired`)؛ حذف الذكريات المزروعة في `agent-episodic-memory.ts`؛ هامش افتراضي 20% في المدقق صار «غير مدقق»؛ `mcp-swarm-gateway.test.ts` |
| F2 الغلاف كامل الشاشة | منجز | `shell/StudioShell.tsx`, `lib/studio/camera.ts`, `windows/window-store.ts`, `shell/WindowChrome.tsx`, `lib/studio/tokens.ts`؛ لقطات 1672×941 و1920×1080 و1366×768 و2560×1440 بلا أشرطة فارغة |
| F3 المحرك الحي | منجز | `graph/maps.ts` (L0 أطلس، L1 مجال، L2 نظام)، `layout/radial.ts` (radial/flow/tree + حل التصادم)، `render/neural-renderer.ts` (طبقتان + نبضات arc-length + flyTo)؛ اختبار: كل الخرائط بلا تصادم نصوص |
| F4 الوكيل الحي | منجز | `agent/agent-store.ts` (8 حالات)، `render/agent-core.ts`، `shell/useAgentBridge.ts` (صوت + SSE موثق) |
| F5 الواجهة 01 | منجز (مع فروق موثقة) | عناوين المجالات مثبتة على مواضع المرجع (`regions/01.json → titleCenters`)؛ diff: `node scripts/studio-render.cjs --screen 01 --diff` |
| F6 القدرات | منجز | `capabilities/registry.ts` (13 قدرة)، `executor.server.ts` (zod، preview، approvalRef موقّع HMAC، idempotency، 409، `studio_audit_log`، SSE)، `agent-plan.ts` + `agent-router.server.ts` داخل `executeLangGraphDeliberation` |
| F7 الحجوزات | منجز | الواجهة 03 على الغلاف: 6 أنظمة حقيقية؛ TableWindow/RecordWindow على `hotel_bookings` و`enquiry_bookings` و`customer_reviews`؛ اعتماد/رفض الإلغاء وحسم التعديل وحالة الطلب والإشراف على التقييمات عبر المعاينة |
| F8 التعميم | منجز | 03..16 و01 و17 و18 و19 على نفس الغلاف؛ flow للمرجعين 04 و12، وtree للمرجعين 05 و06؛ 02 و20 تبقيان على مشهديهما الحاليين |

## جولة الإكمال (2026-09-29)
- الواجهة 02: سلسلة تراكمية حية (أطلس مصغر → مجال → نظام → كيان → حقول من مخطط PocketBase)، `buildExpansionMap` + `layoutCumulative`.
- الواجهة 20: المجسم ثلاثي الأبعاد داخل الغلاف، وقدرات الحضور الأربع مربوطة بأنظمة حقيقية، `buildPresenceMap` + `layoutPresence`.
- الواجهة 04 و12: بطاقات مستطيلة في تخطيط التدفق (`placeCard`).
- زمن الإطار: عمل الرسام ≈ 0.5–1.3ms، والفاصل 16.5ms (60fps) عند 1920×1080 بعد إزالة `backdrop-filter` من النوافذ؛ قياس دائم: `studio-render.cjs --perf`.
- موجّه الوكيل: قواعد للتنقل والبحث وفتح السجلات وتغيير الحالة لأي مجموعة، ومخطط لغوي احتياطي يختار من السجل فقط وتتحقق zod من مدخلاته (`agent-plan.ts`, `agent-router.server.ts`).

## فروق معروفة عن المراجع
- الواجهة 01: فرق البكسلات الخام 27.2/255، وفرق التكوين (بعد تنعيم 10px) 12.8. للمقارنة: إزاحة المرجع عن نفسه 3 بكسل تعطي 16.6، أي أن الخام يقيس مسار الشعيرات المرسومة يدويًا لا التكوين.
- المجسم في الواجهة 20 يعتمد ملفات النموذج المخدومة من Next؛ لا يظهر في سكربت الرندرة (يعرض بديلًا ضوئيًا).

NEXT_ACTION: مراجعة المدير للواجهات 02 و20 على الموقع الحي.
