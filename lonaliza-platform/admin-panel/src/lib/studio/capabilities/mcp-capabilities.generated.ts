/** AUTO-GENERATED — node scripts/gen-mcp-capabilities.cjs */
export const MCP_TOOL_ALLOWLIST: ReadonlySet<string> = new Set(["mcp_admin_get_financial_ledger","mcp_admin_manage_staff_permissions","mcp_admin_query_database","mcp_admin_update_currency_rates","mcp_b2b_leads_scout","mcp_comms_whatsapp_status","mcp_dashboard_bookings","mcp_financial_margin_audit","mcp_meta_ads_intelligence","mcp_reseller_inspect_api_health","mcp_reseller_list_agencies","mcp_reseller_provision_whitelabel","mcp_reseller_set_pricing_margin","mcp_storefront_get_page_layout","mcp_storefront_manage_translations","mcp_storefront_publish_blog_article","mcp_storefront_update_seo_metadata","mcp_tourism_inventory","mcp_visual_apply_theme_tokens","mcp_visual_generate_component","mcp_visual_get_schema","mcp_visual_patch_section","mcp_visual_read_sections","mcp_visual_reorder_sections"]);

export const MCP_TOOL_CATALOG: { name: string; description: string; domain: string }[] = [
  {
    "name": "mcp_admin_get_financial_ledger",
    "description": "جرد الأرباح، المدفوعات، ورصيد بوابات الدفع (Iyzico, Stripe, التحويلات البنكية)",
    "domain": "admin"
  },
  {
    "name": "mcp_admin_update_currency_rates",
    "description": "تحديث واستعلام أسعار الصرف وهامش التحويل للعملات (SAR, USD, EUR, TRY, AED, KWD)",
    "domain": "admin"
  },
  {
    "name": "mcp_admin_query_database",
    "description": "استعلام مباشر وآمن من جداول PocketBase (الحجوزات، الموردين، السائقين، المستخدمين)",
    "domain": "admin"
  },
  {
    "name": "mcp_admin_manage_staff_permissions",
    "description": "فحص وتدقيق حسابات المشرفين وصلاحيات طاقم العمل ومحاولات الدخول",
    "domain": "admin"
  },
  {
    "name": "mcp_financial_margin_audit",
    "description": "تدقيق هوامش الربح والتسعير ومنع الحملات ذات العائد السلبي أو منخفض الهامش",
    "domain": "admin"
  },
  {
    "name": "mcp_storefront_get_page_layout",
    "description": "قراءة الهيكل البرمجي والمسارات العامة للصفحات (الرئيسية، باقات VIP، الطيران، الفنادق)",
    "domain": "storefront"
  },
  {
    "name": "mcp_storefront_update_seo_metadata",
    "description": "كتابة وتحديث وسوم الميتا و OpenGraph وعناوين H1/H2 تلقائياً لدعم محركات البحث",
    "domain": "storefront"
  },
  {
    "name": "mcp_storefront_manage_translations",
    "description": "قراءة وتعديل قواميس الترجمة الفورية للموقع (عربي، إنجليزي، تركي، روسي)",
    "domain": "storefront"
  },
  {
    "name": "mcp_storefront_publish_blog_article",
    "description": "نشر مقالات المدونة المنسقة برمجياً مع الصور المهيأة ومفاتيح السيو",
    "domain": "storefront"
  },
  {
    "name": "mcp_reseller_list_agencies",
    "description": "فحص حسابات المكاتب والشركات السياحية المسجلة وحالة أرصدتها واشتراكاتها",
    "domain": "reseller"
  },
  {
    "name": "mcp_reseller_set_pricing_margin",
    "description": "تعديل هوامش الربح للموزعين (Wholesale Margin) لقطاع الطيران، الفنادق، والتوصيلات",
    "domain": "reseller"
  },
  {
    "name": "mcp_reseller_inspect_api_health",
    "description": "فحص استجابة واجهات الـ B2B API (/api/v1/b2b/flights/search, /hotels, /transfers)",
    "domain": "reseller"
  },
  {
    "name": "mcp_reseller_provision_whitelabel",
    "description": "توليد وتفعيل إعدادات النطاقات البيضاء للشركاء (Whitelabel Domains) مع شهادات SSL",
    "domain": "reseller"
  },
  {
    "name": "mcp_visual_get_schema",
    "description": "سحب مخطط تصميم الصفحة بالكامل من المحرر البصري وهيكل السيكشانات الحالية",
    "domain": "visual_editor"
  },
  {
    "name": "mcp_visual_read_sections",
    "description": "قراءة أقسام الصفحة الحالية وترتيبها ومحتواها النصي والبصري وألوانها",
    "domain": "visual_editor"
  },
  {
    "name": "mcp_visual_patch_section",
    "description": "تطبيق تعديل برمجي وتصميمي فوري على أي سكشن (Hero, Packages Grid, Fleet, Testimonials)",
    "domain": "visual_editor"
  },
  {
    "name": "mcp_visual_reorder_sections",
    "description": "إعادة ترتيب الأقسام على الصفحة الرئيسية لتحقيق أعلى نسبة تحويل (Conversion Rate)",
    "domain": "visual_editor"
  },
  {
    "name": "mcp_visual_generate_component",
    "description": "توليد كود سكشن جديد بالكامل متوافق مع نظام التصميم السيبراني أو العصري للوجهات",
    "domain": "visual_editor"
  },
  {
    "name": "mcp_visual_apply_theme_tokens",
    "description": "تعديل لوحة الألوان (Color Palette)، الخطوط (Typography)، وأنماط البطاقات",
    "domain": "visual_editor"
  },
  {
    "name": "mcp_dashboard_bookings",
    "description": "سحب إحصائيات الحجوزات، العملاء، وحالة قاعدة بيانات PocketBase الفعلية",
    "domain": "admin"
  },
  {
    "name": "mcp_tourism_inventory",
    "description": "استعلام الجولات، البرامج السياحية، الفنادق المتاحة، والسيارات في النظام",
    "domain": "storefront"
  },
  {
    "name": "mcp_comms_whatsapp_status",
    "description": "فحص أرقام واتساب المتصلة والمحادثات المفتوحة مع العملاء",
    "domain": "comms"
  },
  {
    "name": "mcp_meta_ads_intelligence",
    "description": "فحص حالة الحملات الإعلانية وميزانيات Meta Ads والوصول",
    "domain": "marketing"
  },
  {
    "name": "mcp_b2b_leads_scout",
    "description": "استعلام بيانات الوكلاء والشركات السياحية المستهدفة ونتائج الرادار",
    "domain": "reseller"
  }
];

export const MCP_CAPABILITIES_GENERATED_AT = "2026-09-30T19:26:03.412Z";
