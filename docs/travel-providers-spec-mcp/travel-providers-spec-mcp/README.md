# Travel Multi-Provider Spec & Documentation MCP Server

خادم MCP للمواصفات والوثائق مخصص لربط كبرى شركات وموزعي الطيران والفنادق المعتمدة رسمياً بوثائق مفتوحة:

1. **Travelport Hotel (Stays v11 API):** واجهة REST JSON الحديثة للبحث والحجز في الفنادق العالمية عبر Travelport+.
2. **Hotelbeds (APItude API):** واجهة الحجز والمحتوى العالمية مع مصادقة `X-Signature (SHA256)`.
3. **Biletbank (Technoly İstanbul BBOST API):** محرك الحجز والتجميع التركي المعتمد للطيران الداخلي والدولي (THY, AJet, Pegasus, SunExpress).

---

## 🛠️ الأدوات المتاحة للوكيل

| اسم الأداة | الغرض |
|---|---|
| `travel_list_providers` | استعراض قائمة الموزعين، روابط وثائقهم، وطرق مصادقتهم |
| `travel_get_provider_spec` | استخراج مواصفات نقاط النهاية (Schemas, Headers, URLs) |
| `travel_get_mock_payload` | جلب عينات طلب واستجابة واقعية لاختبار الكود بدون مفاتيح حية |
| `travel_search_docs` | البحث في الوثائق وقواعد العمل وسياسات الإلغاء وحساب التوقيع |
| `travel_generate_adapter_scaffold` | توليد كود الـ Adapter بالـ TypeScript لدمجه داخل المشروع |
