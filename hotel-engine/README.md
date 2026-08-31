# Lonaliza hotel-engine

خدمة NestJS + Crawlee + Redis خاصة بموقع lonaliza.com. لا تستخدم Redis أو حاويات أو كود من نسخة LIOTRIP أخرى على نفس السيرفر.

```
src/main.ts       entry
src/hotels/       HTTP API (re-exports types/parsers)
src/types/        hotel types
src/parsers/      catalog normalize
src/crawl/        provider / crawler
src/catalog/      seed catalog
src/redis/        cache / queues
src/snapshots/    crawl snapshots
```

## تشغيل

```bash
cd /www/wwwroot/lonaliza.com/hotel-engine
bash scripts/bootstrap-env.sh
docker compose up -d --build
```

المحرك يسمع على `127.0.0.1:3051` فقط. Redis على `127.0.0.1:6380`.

انسخ `ENGINE_TOKEN` من `.env` إلى بيئة Next:

```
HOTEL_ENGINE_URL=http://127.0.0.1:3051
HOTEL_ENGINE_TOKEN=<نفس ENGINE_TOKEN>
```

من لوحة الإدارة: فنادق → المزود الخاص → حفظ.

## النفق

انظر `phone/README.md` و `wg/generate-keys.sh`. الواجهة اسمها `wg-lonaliza`.

## عزل

أسماء Docker: `lonaliza-hotel-engine`، `lonaliza-hotel-redis`، شبكة `lonaliza-hotel-net`. لا تتصل بـ `6379` ولا بأي شبكة liotrip.
