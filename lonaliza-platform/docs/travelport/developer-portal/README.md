# Travelport Developer Portal — mirrors (Stays)

نسخة محلية من وثائق TripServices **Stays** (بحث الفنادق) لتتم مراجعتها دون الاعتماد على المتصفح فقط. آخر مزامنة للمحتوى النصي: **2026-04-30**.

## المصادر الرسمية على الويب

| المورد | الرابط |
|--------|--------|
| بوابة Stays | https://developer.travelport.com/apis/stays/ |
| قسم Search & Details | https://developer.travelport.com/apis/stays/search-and-details |
| حزمة OpenAPI الرسمية (11.33) | https://developer.travelport.com/_bundle/apis/stays/@11.33/index.yaml |

## ما تم حفظه في هذا المجلد

| ملف | الوصف |
|-----|--------|
| `stays-openapi-11.33-index.yaml` | ملف OpenAPI المجمّع الرسمي (~12k سطر). المرجع الأدق للـ schemas والمسارات. |
| `rating-and-sort-reference.md` | ملخص مختصر: **SortOrder** مقابل **Rating** في الاستجابة (من نفس الـ YAML). |
| `search-and-details/*.md` | صفحات الـ API المنشورة كـ Markdown من البوابة (مسارات `.md` على الخادم)، مع ترويسة YAML في كل ملف (`source_url`, `api_version`). |

### ملفات Search & Details (مرآة Markdown)

| الملف المحلي | نقطة النهاية |
|--------------|---------------|
| `search-and-details/get-hotel-search-propertiesdetail.md` | `GET /hotel/search/propertiesdetail` |
| `search-and-details/post-hotel-search-properties-search.md` | `POST /hotel/search/properties/search` |
| `search-and-details/post-hotel-search-properties-by-id.md` | `POST /hotel/search/properties` |
| `search-and-details/get-hotel-search-properties-pagination.md` | `GET /hotel/search/properties/{identifier}` |

الروابط الأصلية لكل ملف موجودة في الحقل `source_url` داخل الملف.

## ما لم يُحفظ كـ Markdown

صفحات الفهرس العامة للبوابة (`/apis/stays/`، `/search-and-details` بدون لاحقة `.md`) تُعرض كتطبيق ويب (HTML/SPA) وليست نفس تنسيق صفحات الـ `.md`. للفهرس والتنقل استخدم الروابط أعلاه أو افتح `stays-openapi-11.33-index.yaml`.

## تحديث المرآة لاحقاً

```bash
curl -fsSL -o docs/travelport/developer-portal/stays-openapi-11.33-index.yaml \
  'https://developer.travelport.com/_bundle/apis/stays/@11.33/index.yaml'

curl -fsSL -o /tmp/sample.md \
  'https://developer.travelport.com/apis/stays/search-and-details/getpropertiesdetail.md'
```

بعد تحديث الإصدار في الرابط (`@11.33`) عدّل أسماء الملفات والمراجع في هذا README إذا لزم.
