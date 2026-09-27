# Travelport Stays — star sort vs property rating

ملخص من `stays-openapi-11.33-index.yaml` لتجنب الخلط أثناء التكامل.

## SortOrder (طلب البحث)

- **المكان:** طلب البحث حسب الموقع يستخدم كائن البحث الذي يتضمن `**SortOrder`**.
- **المعنى:** طريقة **ترتيب نتائج البحث** فقط، وليست تصنيف النجوم للفندق.
- **القيم (`HotelSortOrderEnum`):** `StarRating` | `Proximity`
- **الوصف في المخطط:** "The method to be used in sorting hotel properties"

## Rating (استجابة الخاصية)

- **المكان:** بيانات الفندق في الاستجابة تحتوي مصفوفة `**Rating`** (أو مسارات متشابهة حسب الـ schema المدمج).
- **الحقول:**
  - `**value`** (number): "Rating used to classify hotels according to the quality" — مثال: `5`
  - `**provider**` (string): مصدر التصنيف — مثال: `"NTM"`
- **الوصف في المخطط:** "The actual award or rating received by the facility."

## قاعدة سريعة


| الحقل                       | دوره                                  |
| --------------------------- | ------------------------------------- |
| `SortOrder` في الطلب        | كيف تُرتَّب قائمة النتائج             |
| `Rating[].value` في الخاصية | قيمة التصنيف/الجودة كما يعلنها المزود |


