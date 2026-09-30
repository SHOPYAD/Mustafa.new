# Cyber Console — سجل القدرات

مولَّد تلقائيًا: `node scripts/gen-capabilities-doc.cjs`. لا تعدله يدويًا.

كل قدرة تُنفذ عبر `POST /api/admin/studio/capabilities/execute` (المنفذ: `src/lib/studio/capabilities/executor.server.ts`).

- `query`: قراءة فورية بلا أثر.
- `command`: معاينة (`dryRun`) ثم تنفيذ بـ `idempotencyKey`؛ `high` يتطلب `approvalRef` موقّعًا يصدر للمدير فقط.
- الكتابة على مجموعة حساسة ترفع الخطورة إلى `high` تلقائيًا.
- كل تنفيذ يُسجَّل في `studio_audit_log` ويُبث على `agent-stream`.
- الاختبار: `src/lib/studio/studio-core.test.ts`.

| المعرّف | العنوان | المجال | العقدة | النوع | الخطورة | الهدف | الدليل |
|---|---|---|---|---|---|---|---|
| `records.list` | عرض سجلات مجموعة | platform | `agent.supervisor` | query | low | `pb.getList` | `api/admin/studio/records` |
| `records.get` | قراءة سجل | platform | `agent.supervisor` | query | low | `pb.getOne` | `api/admin/studio/records` |
| `records.update` | تعديل سجل | platform | `agent.supervisor` | command | medium | `pb.update` | `lib/studio/capabilities/executor.server.ts` |
| `records.create` | إنشاء سجل | platform | `agent.supervisor` | command | medium | `pb.create` | `lib/studio/capabilities/executor.server.ts` |
| `records.delete` | حذف سجل | platform | `agent.supervisor` | command | high | `pb.delete` | `lib/studio/capabilities/executor.server.ts` |
| `bookings.cancellation.list` | طلبات الإلغاء المعلقة | bookings | `bookings.cancellations` | query | low | `/api/admin/cancellations` `listPendingCancellations` | `lib/server/hotel-cancellations.ts` |
| `bookings.cancellation.approve` | اعتماد إلغاء واسترداد | bookings | `bookings.cancellations` | command | high | `hotel_bookings` `approveCancel` | `lib/server/hotel-cancellations.ts#approveCancel` |
| `bookings.cancellation.reject` | رفض طلب إلغاء | bookings | `bookings.cancellations` | command | medium | `hotel_bookings` `rejectCancel` | `lib/server/hotel-cancellations.ts#rejectCancel` |
| `bookings.change.resolve` | حسم طلب تعديل حجز | bookings | `bookings.cancellations` | command | medium | `hotel_bookings` `resolveChangeRequest` | `lib/server/hotel-cancellations.ts#resolveChangeRequest` |
| `bookings.enquiry.set_status` | تغيير حالة طلب حجز | bookings | `bookings.enquiries` | command | medium | `enquiry_bookings` | `pocketbase:enquiry_bookings.status` |
| `reviews.moderate` | إشراف على تقييم | bookings | `bookings.reviews` | command | medium | `customer_reviews` `moderateReviewAdmin` | `lib/server/customer-reviews-store.ts#moderateReviewAdmin` |
| `studio.navigate` | عرض خريطة | platform | `agent.supervisor` | query | low | `client.flyTo` | `lib/studio/graph/maps.ts` |
| `studio.open_table` | فتح جدول | platform | `agent.supervisor` | query | low | `client.openTable` | `shell/windows/TableWindow.tsx` |
| `studio.open_record` | فتح سجل | platform | `agent.supervisor` | query | low | `client.openRecord` | `shell/windows/RecordWindow` |
