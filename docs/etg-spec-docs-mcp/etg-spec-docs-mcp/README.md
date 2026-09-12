# ETG Specification & Documentation MCP Server (Enterprise Agent Bridge)

خادم MCP متطور وذاتي الاحتواء (Self-Contained Specification & Documentation Server) مصمم خصيصاً ليُعطى للوكيل البرمجي (AI Agent مثل Cursor أو Claude Code أو Windsurf أو أي وكيل مستقل).

---

## 🎯 الهدف المعماري (Enterprise Architecture)

في الشركات الكبرى، قبل الحصول على مفاتيح الإنتاج أو حتى مفاتيح الاختبار، يتم تزويد الوكيل بخادم **Spec & Docs MCP** يحتوي على:
1. **المواصفات الرسمية لجميع نقاط النهاية (Endpoints Specifications):** المسارات، الترويسات، نماذج الطلب والاستجابة مع أنواع الحقول الدقيقة (Schemas).
2. **قواعد العمل الصارمة (Business Logic & Validation Rules):** مثل إلزامية خطوة الـ Prebook، أسماء النزلاء بالحروف اللاتينية، مفاتيح الـ Idempotency، ودورة الفحص غير المتزامن (Async Polling).
3. **بيانات وهمية واقعية (Realistic Mock Payloads):** تُمكّن الوكيل من كتابة اختبارات الوحدة (Unit Tests & Integration Tests) واختبار الكود بدون الحاجة لمفاتيح حقيقية.
4. **مسارات التدفق القياسية (End-to-End Workflows):** خطوات دورة الحجز والإلغاء خطوة بخطوة.

---

## 🛠️ الأدوات التي يوفرها الخادم للوكيل

| اسم الأداة | الغرض |
|---|---|
| `etg_get_endpoint_spec` | استعراض مواصفات أي مسار (Schemas, Headers, Rules) |
| `etg_get_mock_payload` | جلب نماذج JSON للطلب والاستجابة لكتابة الاختبارات |
| `etg_get_integration_workflow` | معرفة خطوات التكامل الإلزامية وهيكلة الكود (State Machine) |
| `etg_search_docs` | البحث في وثائق الموزع عن أي مفهوم أو مصطلح أو كود خطأ |
| `etg_generate_service_template` | توليد كود أساسي (Scaffolding / Interfaces) بالـ TypeScript |

---

## 🚀 كيفية توجيه الوكيل لاستخدامه في مشروعك

### 1. إضافة الخادم إلى إعدادات الوكيل:
أضف الخادم إلى ملف إعدادات MCP في محرر الأكواد لديك (مثل Cursor أو Claude Desktop):
```json
{
  "mcpServers": {
    "etg-docs": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/etg-spec-docs-mcp/dist/index.js"]
    }
  }
}
```

### 2. التوجيه (Prompt) الذي تعطيه للوكيل:
> *"لديك خادم MCP باسم `etg-docs` يحتوي على كامل وثائق ومواصفات موزع الفنادق ETG / RateHawk API v3. قم بالاتصال به واستعراض دورة الحجز الكاملة ومواصفات الـ Endpoints، ثم قم ببناء طبقة التكامل كاملة في مشروعنا بالـ TypeScript (النماذج DTOs، الخدمات Services، وحدات التحكم Controllers، ومعالجة الأخطاء والاختبارات الوهمية Mock Tests) بدقة تامة طبقاً للوثائق الرسمية."*
