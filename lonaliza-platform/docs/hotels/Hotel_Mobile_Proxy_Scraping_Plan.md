# مواصفات تشغيل المزود المستقل لبيانات الفنادق (Lonaliza)

هذا الملف هو مرجع التشغيل الفعلي بعد التنفيذ. النظام ملك lonaliza.com فقط: لا يستخدم خدمات أو كود أو Redis أو حاويات liotrip.

## ماذا يعمل الآن

ثلاثة مزودات في الموقع، تُختار من **الإدارة → الفنادق**:

| القيمة | المصدر |
|---|---|
| `internal` | كتالوج الموقع الثابت |
| `travel_advisor` | RapidAPI كما كان (لم يُحذف) |
| `owned` | محرك NestJS المحلي `hotel-engine` |

الواجهة العامة للزائر عند `owned` هي نفس واجهة Travel Advisor (`/hotels` و`/hotels/ta-…`) لكن البيانات تأتي من `http://127.0.0.1:3051`.

## مكونات معزولة

المجلد: [`hotel-engine/`](hotel-engine/)

| حاوية / عملية | منفذ | ملاحظة |
|---|---|---|
| `lonaliza-hotel-redis` | `127.0.0.1:6380` | ليس 6379 |
| `lonaliza-hotel-engine` | `127.0.0.1:3051` | NestJS + Crawlee، `network_mode: host` للوصول إلى WireGuard |
| شبكة Docker | `lonaliza-hotel-net` | خاصة بهذا النظام |
| واجهة النفق | `wg-lonaliza` | `10.88.0.1` سيرفر / `10.88.0.2` هاتف |

التوكن المشترك: `ENGINE_TOKEN` في `hotel-engine/.env` = `HOTEL_ENGINE_TOKEN` في بيئة Next.

## تشغيل الحالي على هذا السيرفر

Docker Compose موجود في `hotel-engine/docker-compose.yml` (أسماء `lonaliza-hotel-*`، Redis 6380). إن لم تُرفع الحاويات، يعمل نفس العزل عبر PM2:

- `lonaliza-hotel-redis` — `redis-server hotel-engine/redis.conf` على `127.0.0.1:6380`
- `lonaliza-hotel-engine` — NestJS على `127.0.0.1:3051`

لا تشغّل Compose وPM2 معاً على نفس المنفذين.

```bash
cd /www/wwwroot/lonaliza.com/hotel-engine
bash scripts/bootstrap-env.sh
# خيار أ: docker compose up -d --build
# خيار ب (الحالي):
cd /www/wwwroot/lonaliza.com && pm2 startOrReload ecosystem.config.cjs --update-env
```

تحديث الكتالوج من `src/data/hotels.ts`:

```bash
node hotel-engine/scripts/sync-catalog.mjs
```

نفق الهاتف:

```bash
bash hotel-engine/wg/generate-keys.sh
# ثم wg-quick up على السيرفر، واستيراد phone.conf في تطبيق WireGuard
```

تعليمات الهاتف: [`hotel-engine/phone/README.md`](hotel-engine/phone/README.md)

## كاش

بادئة Redis: `lonaliza:hotels:` على المثيل 6380 فقط.

- بحث: 9 دقائق
- تفاصيل: 10 دقائق
- غرف: 15 دقائق

إن فشل الجلب الحي عبر النفق، يُرجع الكتالوج المحلي (31 فندقاً) حتى يبقى الموقع يعمل قبل توصيل الهاتف.

## PocketBase

هجرات:

- `owned_hotels`
- `owned_rate_snapshots`

لقطات الأسعار اختيارية (إن وُجدت بيانات المشرف في `hotel-engine/.env`).

## إطفاء المزود

من لوحة الإدارة أعد الاختيار إلى `internal` أو `travel_advisor` ثم احفظ. المحرك يمكن إيقافه بـ `docker compose down` داخل `hotel-engine/` دون المساس بـ liotrip أو RapidAPI.
