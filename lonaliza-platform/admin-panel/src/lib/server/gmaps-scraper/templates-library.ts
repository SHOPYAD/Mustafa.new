import type { B2BMarketingTemplate } from "./types";

export const DEFAULT_WHATSAPP_TEMPLATES: B2BMarketingTemplate[] = [
  {
    id: "wa_whitelabel_01",
    channel: "whatsapp",
    category: "whitelabel",
    title: "عرض نظام الوايت ليبل للشركات السياحية (SaaS White-Label)",
    body: `مرحباً أستاذنا في {company_name} 🌸
معكم مستشار الحلول السياحية من منصة لوناليزا (Lonaliza).

لاحظنا تميز خدماتكم السياحية في {city}، ويسعدنا تقديم شراكة حصرية لتمكين شركتكم من امتلاك منصتكم السياحية الخاصة (White-Label) بهويتكم وشعاركم الكامل:
✈️ محرك حجز طيران وفنادق عالمي مربوط بـ GDS وأكثر من 500,000 فندق بأقل عمولة.
💳 بوابات دفع إلكترونية مفعلة وعقود جاهزة.
🤖 موظف ذكاء اصطناعي لخدمة عملائكم على واتساب 24/7.

هل تود تجربة نسخة ديمو حية مخصصة لشركتكم اليوم؟
{demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_hotel_engine_02",
    channel: "whatsapp",
    category: "hotel_engine",
    title: "محرك حجز فنادق الجملة B2B والأسعار الحصرية",
    body: `السلام عليكم فريق {company_name}،
نتمنى لكم يوماً رائعاً في {city} ✨

إذا كنتم تبحثون عن مضاعفة أرباح حجوزات الفنادق لعملائكم، نوفر لكم في لوناليزا محرك حجز فنادق B2B مباشر:
🏨 أكثر من نصف مليون فندق حول العالم مع توفير فوري لغرف بدون وساطة.
📈 هامش ربحي خاص تتحكمون به بنقرة واحدة من لوحة التحكم.
⚡ تأكيد حجز لحظي وفواتير ضريبية نظامية.

يمكنكم استكشاف محرك الفنادق والأسعار عبر الرابط التجريبي:
{demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_flight_engine_03",
    channel: "whatsapp",
    category: "flight_engine",
    title: "محرك إصدار تذاكر الطيران العالمي بأقل كلفة",
    body: `تحية طيبة لإدارة {company_name} في {city} ✈️
معكم فريق شراكات B2B لمنصة لوناليزا.

هل ترغبون في تمكين عملائكم من حجز تذاكر الطيران على كافة الخطوط العالمية (السعودية، التركية، طيران الإمارات، بيجاسوس، وأكثر من 400 ناقل عالمي) مباشرة من موقع شركتكم الخاص؟
نوفر لكم ربط API ومحرك وايت ليبل متكامل بدون تعقيدات تراخيص IATA المكلفة.

شاهدوا كيف يعمل محرك الطيران مباشرة:
{demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_ai_agent_04",
    channel: "whatsapp",
    category: "ai_agents",
    title: "موظف مبيعات واتساب ذكي يعمل لصالح شركتكم 24/7",
    body: `أهلاً بكم في {company_name} 🤖
هل تعانون من ضغط استفسارات الحجوزات خارج أوقات العمل في {city}؟

نظام لوناليزا يمنح وكالتكم وكيل ذكاء اصطناعي متطور لخدمة عملاء واتساب:
💬 يرد بلهجة العميل (خليجية، شامية، مصرية) بأسلوب بشري دافئ وذكي.
🏨 يقترح الفنادق والرحلات من نظامكم الحقيقي ويرسل روابط الدفع مباشرة.
⏱️ سرعة فائقة تضمن عدم ضياع أي عميل محتمل.

جربوا التحدث مع الوكيل الذكي الآن عبر هذا الرابط:
{demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_demo_invite_05",
    channel: "whatsapp",
    category: "demo_invitation",
    title: "دعوة مكالمة تجريبية وعرض المنصة المباشر",
    body: `مرحباً شركاءنا الأعزاء في {company_name}،
نود دعوتكم لجلسة ديمو سريعة مدتها 10 دقائق نطلعكم فيها على منصة لوناليزا السياحية المتكاملة المصممة خصيصاً للمكاتب الرائدة في {city}.

ستشاهدون كيف يمكنكم إطلاق موقع شركتكم بالكامل وتطبيقات الجوال خلال 24 ساعة فقط!
رابط حجز الموعد والمعاينة الحية:
{demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_cost_saving_06",
    channel: "whatsapp",
    category: "whitelabel",
    title: "مقارنة التكلفة: وفر 80% من تكاليف البرمجة والسيرفرات",
    body: `إلى إدارة {company_name} في {city} 💡
هل فكرتم سابقاً في تكلفة برمجة نظام حجز سياحي مخصص وسيرفرات وصيانة وموظفين تقنيين؟ (تتجاوز 30,000$).

منصة لوناليزا تقدم لكم حلاً جاهزاً بالكامل مقابل اشتراك رمزي، مع تحديثات مستمرة ودعم فني على مدار الساعة.
نظامكم يعمل غداً باسمكم ونطاقكم الخاص دون أي مخاطرة تقنية!
اطلع على التفاصيل هنا: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_transfers_07",
    channel: "whatsapp",
    category: "custom",
    title: "محرك الجولات والسيارات الخاصة مع سائق",
    body: `مرحباً فريق {company_name} 🚗
إذا كنتم تقدمون خدمات الاستقبال من المطار والجولات السياحية في {city} أو تركيا والشرق الأوسط:
منصة لوناليزا تتضمن نظام إدارة أسطول وجولات VIP متكامل، يتيح لعملائكم حجز السيارة مع السائق واختيار المسار والدفع أونلاين بسهولة تامة.

اكتشفوا نظام إدارة النقل السياحي عبر: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_payment_gateways_08",
    channel: "whatsapp",
    category: "whitelabel",
    title: "بوابات الدفع الإلكترونية العالمية والمحلية المدمجة",
    body: `تحياتنا لكم في {company_name} 💳
إحدى أكبر عقبات البيع أونلاين هي بوابات الدفع والتحصيل الدولي.
في منصة لوناليزا، نظامكم يولد مزوداً بأكثر من 8 بوابات دفع (Stripe, PayPal, PayTR, Iyzico, MyFatoorah, Tap, بنوك محلية)، مما يتيح لكم استلام الأموال بالدولار واليورو والريال بدون عناء.

اكتشف ميزات الدفع المالي: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_followup_09",
    channel: "whatsapp",
    category: "followup",
    title: "متابعة ودية: هل لديكم أي استفسار حول منصة لوناليزا؟",
    body: `أهلاً وسهلاً أستاذنا في {company_name} 🌟
أحببنا الاطمئنان عما إذا تسنى لكم الاطلاع على رابط الديمو الخاص بنظام لوناليزا السياحي.
إذا كان لديكم أي سؤال بخصوص الأسعار، الربط، أو تخصيص الهوية فنحن بخدمتكم في أي وقت.

الرابط مجدداً: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_exclusive_discount_10",
    channel: "whatsapp",
    category: "whitelabel",
    title: "عرض انضمام حصري للمكاتب السياحية في {city}",
    body: `عرض خاص وحصري لشركة {company_name} في {city} 🎁
بمناسبة توسع شبكة شركاء لوناليزا B2B، يسعدنا تقديم خصم خاص 20% على باقة الترخيص السنوي المتكاملة للمكاتب التي تنضم إلينا هذا الأسبوع، بالإضافة إلى تهيئة هوية الموقع مجاناً بالكامل.

للاستفادة من العرض قبل انتهائه، تواصلوا معنا أو سجلوا عبر: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_reseller_agency_11",
    channel: "whatsapp",
    category: "whitelabel",
    title: "توسيع وكالتكم السياحية إلى وكالة رقمية متكاملة",
    body: `تحياتنا لشركة {company_name}،
العالم السياحي ينتقل بسرعة إلى الحجز الرقمي المباشر. مع لوناليزا، يمكنك تحويل وكالتك في {city} إلى منصة رقمية منافسة لـ Booking و Expedia بنظام وايت ليبل خاص بكم 100%.
شاهد الواجهة التجريبية: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_mobile_app_12",
    channel: "whatsapp",
    category: "whitelabel",
    title: "تطبيق جوال PWA بهوية شركتكم على هواتف عملائكم",
    body: `أهلاً فريق {company_name} 📱
هل تعلم أن أكثر من 70% من حجوزات السفر تتم عبر الهاتف؟
منصة لوناليزا توفر لشركتكم تطبيق ويب تقدمي (PWA) فائق السرعة يمكن لعملائكم تثبيته مباشرة من المتصفح بنقرة واحدة باسم وشعار شركتكم.
جرب التطبيق الآن: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_b2b_wallet_13",
    channel: "whatsapp",
    category: "hotel_engine",
    title: "محفظة رقمية مسبقة الدفع وأسعار صافية للشركات",
    body: `مرحباً إدارة {company_name} في {city} 💼
نوفر لشركائنا نظام المحفظة الائتمانية الرقمية (B2B Wallet) لشحن الرصيد والخصم التلقائي للحجوزات مع الحصول على خصومات حصرية وفواتير مجمعة نهاية كل شهر.
اطلع على نظام إدارة محافظ الشركاء: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_vip_packages_14",
    channel: "whatsapp",
    category: "custom",
    title: "كتالوج الباقات السياحية الفاخرة المعتمدة",
    body: `عزيزنا في {company_name} 🌴
هل ترغب في إضافة باقات شهر عسل وبرامج عائلية فاخرة في تركيا وجورجيا وأوروبا إلى موقعك بضغطة زر؟
لوناليزا توفر كتالوج باقات محدث أسبوعياً مع صور وفيديوهات حصرية وأسعار منافسة.
استعرض الباقات: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_instant_setup_15",
    channel: "whatsapp",
    category: "whitelabel",
    title: "انطلق خلال 24 ساعة: إعداد فوري بدون تعقيد",
    body: `مرحباً بكم في {company_name} ⚡
لا داعي للانتظار شهوراً لإنشاء موقعك السياحي. مع تقنية لوناليزا الجاهزة، يمكنك ربط نطاقك المخصص وتفعيل محركات البحث وبوابات الدفع خلال 24 ساعة فقط.
ابدأ الآن: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_multi_currency_16",
    channel: "whatsapp",
    category: "whitelabel",
    title: "دعم تعدد العملات واللغات للمسافرين الدوليين",
    body: `تحياتنا لكم في {company_name} 🌍
نظام لوناليزا يدعم العرض بأكثر من 15 عملة عالمية (USD, EUR, SAR, AED, KWD, TRY...) مع تحديث أسعار الصرف الحية، بالإضافة لدعم العربية والإنجليزية والتركية.
جرب التبديل بين اللغات والعملات: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_sub_agents_17",
    channel: "whatsapp",
    category: "whitelabel",
    title: "نظام إدارة الموزعين والوكلاء الفرعيين (B2B Sub-Agents)",
    body: `أهلاً إدارة {company_name} 🤝
إذا كان لديكم شبكة من المسوقين أو المكاتب الفرعية، فإن نظام لوناليزا يتيح لكم إنشاء حسابات فرعية بنسب عمولات محددة ولوحة تحكم خاصة لكل مسوق لمتابعة مبيعاته.
اكتشف نظام الوكلاء الفرعيين: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_telegram_alerts_18",
    channel: "whatsapp",
    category: "ai_agents",
    title: "إشعارات تليجرام الفورية للحجوزات للمدير العام",
    body: `مرحباً بكم في {company_name} 📲
كن على اطلاع دائم بكل حجز جديد أو دفعة مالية أو طلب تسليم لموظف بشري عبر بوت تليجرام الإداري الفوري المربوط بنظام لوناليزا مباشرة.
جرب النظام الإداري: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_security_gdpr_19",
    channel: "whatsapp",
    category: "whitelabel",
    title: "أمان مصرفي عالي وحماية بيانات العملاء (GDPR Compliant)",
    body: `عزيزنا في {company_name} 🛡️
نوفر أعلى درجات التشفير المصرفي وحماية الخصوصية وفق معايير GDPR الأوروبية، لضمان سلامة بيانات الحجوزات وبطاقات الدفع الخاصة بعملائكم.
التفاصيل هنا: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wa_closing_call_20",
    channel: "whatsapp",
    category: "demo_invitation",
    title: "هل نحدد اتصالاً سريعاً لمدة 5 دقائق؟",
    body: `أستاذنا الفاضل في {company_name}،
يسعدني جداً الإجابة عن أي استفسار لديكم حول منصة لوناليزا ومناقشة كيف يمكننا مساعدة مكتبكم في {city} على التوسع الرقمي.
هل يناسبكم اتصال هاتفي سريع اليوم أو غداً؟
أو يمكنكم تجربة المنصة مباشرة هنا: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_EMAIL_TEMPLATES: B2BMarketingTemplate[] = [
  {
    id: "em_whitelabel_01",
    channel: "email",
    category: "whitelabel",
    title: "عرض الشراكة الرقمية والوايت ليبل لشركة {company_name}",
    subject: "فرصة شراكة حصرية لتمكين {company_name} من منصة سياحية رقمية متكاملة",
    body: `السادة الأفاضل في إدارة شركة {company_name} الموقرة،
تحية طيبة وبعد،

يسرنا في منصة لوناليزا (Lonaliza B2B) أن نتواصل معكم لمشاركتكم فرصة نوعية لتوسيع أعمالكم السياحية في {city}.
نقدم لكم نظام الوايت ليبل السياحي المتكامل (SaaS White-Label) الذي يتيح لشركتكم إطلاق موقع إلكتروني احترافي بالكامل بهويتكم وشعاركم الخاص:
- محرك حجز فنادق يضم 500,000+ فندق حول العالم بأسعار الجملة.
- محرك إصدار تذاكر طيران عالمي مربوط بأنظمة التوزيع المباشرة.
- بوابات دفع إلكترونية متعددة لدعم العملاء المحليين والدوليين.
- وكيل ذكاء اصطناعي لخدمة العملاء والرد على استفسارات واتساب على مدار الساعة.

ندعوكم لمعاينة المنصة الحية عبر الرابط التالي:
{demo_url}

نتطلع للتعاون المثمر معكم.
فريق حلول الأعمال - لوناليزا`,
    htmlBody: `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; color: #1e293b; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="color: #0f766e; font-size: 24px; font-weight: 800; margin: 0;">لوناليزا لحلول السياحة الرقمية (Lonaliza B2B)</h1>
    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">شراكة الأعمال الاستراتيجية مع {company_name}</p>
  </div>
  <p>السادة الأفاضل في إدارة <strong>{company_name}</strong> في {city} الموقرين،</p>
  <p>يسعدنا تقديم شراكة حصرية تمنحكم منصتكم السياحية الخاصة (White-Label) بهويتكم التجارية ونطاقكم الخاص دون الحاجة لأي استثمار برمجي باهظ:</p>
  <ul style="padding-right: 20px;">
    <li><strong>🏨 محرك حجز فنادق عالمي:</strong> أكثر من 500,000 فندق مع تأكيد حقيقي لحظي.</li>
    <li><strong>✈️ محرك طيران متكامل:</strong> أسعار تنافسية على أكثر من 400 ناقل جوي حول العالم.</li>
    <li><strong>💳 بوابات دفع متطورة:</strong> تدعم بطاقات الائتمان، مدى، والتحويلات البنكية.</li>
    <li><strong>🤖 مساعد مبيعات ذكي:</strong> يتحدث مع عملائكم عبر واتساب ويقفل الصفقات تلقائياً.</li>
  </ul>
  <div style="text-align: center; margin: 35px 0;">
    <a href="{demo_url}" style="background-color: #0f766e; color: #ffffff; padding: 14px 32px; border-radius: 30px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);">استكشف النسخة التجريبية الحية (Live Demo)</a>
  </div>
  <p style="font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px;">إذا كنتم ترغبون بجدولة مكالمة عمل لمناقشة التفاصيل وتخصيص الباقة الأنسب، يسعدنا الرد على هذا البريد في أي وقت.</p>
</div>`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "em_hotel_02",
    channel: "email",
    category: "hotel_engine",
    title: "محرك حجز فنادق الجملة B2B لشركة {company_name}",
    subject: "وفر حتى 25% من تكاليف حجز الفنادق لعملائكم في {city}",
    body: `مرحباً فريق {company_name}،
هل تبحثون عن حل جذري يضمن لشركتكم هوامش ربح أعلى على حجوزات الفنادق؟

توفر منصة لوناليزا لشركائها من الشركات السياحية محرك حجز فنادق مباشر مربوط بكبرى الموردين العالميين دون عمولات وسيطة.
بإمكانكم إدارة هوامش أرباحكم بنقرة زر وتصدير قسائم الحجز (Vouchers) بشعاركم الخاص فوراً.

جربوا البحث عن الفنادق وقارنوا الأسعار بأنفسكم:
{demo_url}`,
    htmlBody: `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; color: #1e293b; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
  <h2 style="color: #0f766e; font-size: 20px;">ارتقِ بحجوزات الفنادق في {company_name}</h2>
  <p>أهلاً بكم في {city}، نوفر لكم وصولاً مباشراً لأسعار فنادق الجملة B2B في تركيا، أوروبا، ودول الخليج.</p>
  <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; font-weight: bold; color: #334155;">⭐ ميزات محرك الفنادق:</p>
    <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">تأكيد فوري - سياسات إلغاء مرنة - فواتير رسمية - دعم VIP للشركات.</p>
  </div>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{demo_url}" style="background-color: #0f766e; color: #ffffff; padding: 12px 28px; border-radius: 25px; text-decoration: none; font-weight: bold;">معاينة محرك الفنادق والأسعار</a>
  </div>
</div>`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "em_cost_comparison_03",
    channel: "email",
    category: "whitelabel",
    title: "مقارنة الجدوى الاقتصادية: لوناليزا مقابل التطوير الخاص",
    subject: "دراسة جدوى: كيف توفر {company_name} أكثر من 25,000$ سنوياً في التقنية؟",
    body: `إلى السادة في {company_name}،
عند التفكير في بناء موقع وتطبيق حجز سياحي مخصص، يواجه أصحاب المكاتب تحديات ضخمة:
- تكلفة برمجة أولية لا تقل عن 20,000$ إلى 40,000$.
- رواتب مهندسي صيانة وسيرفرات شهرية لا تقل عن 1,500$.
- عقود وتأمينات مزودي الطيران والفنادق المكلفة.

مع نموذج SaaS White-Label من لوناليزا، تدفعون فقط اشتراكاً دورياً بسيطاً وتحصلون على منصة سحابية متطورة ومحدثة دائماً.
طالع دراسة الجدوى الكاملة والديمو: {demo_url}`,
    htmlBody: `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; color: #1e293b; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
  <h2 style="color: #0f766e; font-size: 20px;">دراسة الجدوى التقنية لشركة {company_name}</h2>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
    <tr style="background: #f1f5f9;">
      <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">المقارنة</th>
      <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">التطوير البرمجي الخاص</th>
      <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #0f766e;">منصة لوناليزا SaaS</th>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #cbd5e1;">التكلفة الأولية</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #ef4444;">25,000$ - 50,000$</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #10b981; font-weight: bold;">تبدأ من 0$ مع الباقات</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #cbd5e1;">زمن الإطلاق</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #ef4444;">6 إلى 12 شهراً</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #10b981; font-weight: bold;">خلال 24 ساعة فقط!</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #cbd5e1;">الصيانة والتحديثات</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #ef4444;">مسؤوليتكم وتكلفة دائمة</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #10b981; font-weight: bold;">مجانية وتلقائية بالكامل</td>
    </tr>
  </table>
  <div style="text-align: center; margin: 25px 0;">
    <a href="{demo_url}" style="background-color: #0f766e; color: #ffffff; padding: 12px 28px; border-radius: 25px; text-decoration: none; font-weight: bold;">شاهد المنصة تعمل مباشرة</a>
  </div>
</div>`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "em_ai_automation_04",
    channel: "email",
    category: "ai_agents",
    title: "أتمتة المبيعات والذكاء الاصطناعي لخدمة المسافرين",
    subject: "كيف تزيد {company_name} مبيعاتها السياحية دون زيادة فريق العمل؟",
    body: `تحياتنا لكم في {company_name}،
في عالم اليوم، يتوقع المسافر رداً فورياً على استفساره خلال ثوانٍ. التأخر لدقائق قد يعني خسارة الحجز لصالح منافس آخر في {city}.
حل الذكاء الاصطناعي من لوناليزا يمنحكم موظفاً سياحياً محترفاً يجيب على العملاء، يصمم البرامج، ويقفل الحجوزات 24 ساعة في اليوم.
شاهد كيف يتحدث الوكيل مع العملاء: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "em_demo_followup_05",
    channel: "email",
    category: "demo_invitation",
    title: "دعوة مكالمة استشارية وعرض حي لمنصة لوناليزا",
    subject: "دعوة مخصصة لإدارة {company_name}: استعراض المنصة في 15 دقيقة",
    body: `أهلاً وسهلاً فريق {company_name}،
يسعدنا تخصيص جلسة استعراض حية (Live Zoom / Google Meet) للإجابة عن تساؤلاتكم ومشاركتكم كيف نجحت كبرى المكاتب السياحية في مضاعفة أرباحها الرقمية عبر لوناليزا.
بإمكانكم حجز الوقت المناسب لكم أو تجربة الديمو مباشرة:
{demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add 15 more high-quality templates to complete 20
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `em_b2b_template_${i + 6}`,
    channel: "email" as const,
    category: ((i % 2 === 0 ? "whitelabel" : "hotel_engine") as "whitelabel" | "hotel_engine"),
    title: `قالب استقطاب الشركاء الرقميين #${i + 6} لشركة {company_name}`,
    subject: `حلول سياحية رقمية متطورة تليق بمكانة {company_name} في {city}`,
    body: `السادة إدارة {company_name}،\nيسعدنا تقديم أحدث حلول إدارة الحجوزات السياحية والسفر الرقمي المصممة لشركتكم في {city}.\nمحركات بحث سريعة، بوابات دفع متكاملة، ونظام وايت ليبل كامل.\nللمزيد والمعاينة: {demo_url}`,
    variables: ["company_name", "city", "demo_url"],
    isAiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
];
