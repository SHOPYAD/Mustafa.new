import PocketBase from "pocketbase";
import { promises as fs } from "fs";
import path from "path";

const URL = "http://127.0.0.1:8090";
const ENV_FILE = path.join(process.cwd(), ".data", "server-env.json");

async function getAdminPb() {
  const pb = new PocketBase(URL);
  pb.autoCancellation(false);
  let email = "admin@lonaliza.com";
  let pass = "LONA#@!li123za";
  try {
    const raw = await fs.readFile(ENV_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.values?.POCKETBASE_ADMIN_EMAIL) email = parsed.values.POCKETBASE_ADMIN_EMAIL;
    if (parsed.values?.POCKETBASE_ADMIN_PASSWORD) pass = parsed.values.POCKETBASE_ADMIN_PASSWORD;
  } catch {}
  await pb.collection("_superusers").authWithPassword(email, pass);
  return pb;
}

async function seed() {
  const pb = await getAdminPb();
  console.log("Connected to PocketBase as superuser.");

  // Check crm_leads
  const existingLeads = await pb.collection("crm_leads").getList(1, 1);
  if (existingLeads.totalItems === 0) {
    console.log("Seeding crm_leads...");
    const leads = [
      { name: "مجموعة دار الاستثمار الخليجية", email: "invest@dar-gulf.com", phone: "+966501234567", service_type: "packages", destination: "إسطنبول وبودروم", estimated_budget: 18500, currency: "USD", stage: "proposal_sent", priority: "urgent", assigned_agent: "أحمد مصطفى", probability: 80, source: "b2b_agent", notes: "طلب تنظيم مؤتمر تنفيذي مع إقامة في فندق 5 نجوم وحجوزات طيران درجة أولى لـ 8 تنفيذيين", due_date: "2026-09-20" },
      { name: "د. فهد الشمري", email: "f.shammari@gmail.com", phone: "+966559876543", service_type: "hotels", destination: "أنطاليا", estimated_budget: 6200, currency: "USD", stage: "won", priority: "high", assigned_agent: "سارة كمال", probability: 100, source: "website", notes: "فيلا خاصة مع مسبح خاص في منتجع ريكسوس بريميوم بيليك لمدة 10 ليالٍ", due_date: "2026-09-18" },
      { name: "المهندس عمر الفاروق", email: "omar.farooq@al-farooq.com", phone: "+971507654321", service_type: "packages", destination: "كابادوكيا وإسطنبول", estimated_budget: 4800, currency: "USD", stage: "contacted", priority: "medium", assigned_agent: "زينب يلماز", probability: 65, source: "whatsapp", notes: "باقة شهر عسل تتضمن ركوب المنطاد الهوائي وجلسة تصوير خاصة وجولة البوسفور بيخت خاص", due_date: "2026-09-22" },
      { name: "شركة الأفق العالمية للسياحة", email: "booking@alofooq-travel.com", phone: "+96599112233", service_type: "flights", destination: "مطار إسطنبول الدولي", estimated_budget: 12400, currency: "USD", stage: "proposal_sent", priority: "urgent", assigned_agent: "أحمد مصطفى", probability: 85, source: "b2b_agent", notes: "مجموعة 24 راكب على متن الخطوط التركية مع شحن أمتعة إضافي", due_date: "2026-09-19" },
      { name: "سارة القحطاني", email: "sara.qahtani@outlook.com", phone: "+966533445566", service_type: "tours", destination: "طرابزون وريزا", estimated_budget: 3900, currency: "USD", stage: "won", priority: "medium", assigned_agent: "سارة كمال", probability: 100, source: "social", notes: "برنامج سياحي عائلي 7 أيام مع سائق خاص يتحدث العربية وإقامة في أوزنجول وآيدر", due_date: "2026-09-17" },
      { name: "خالد المنصور", email: "k.mansour@gmail.com", phone: "+97455123456", service_type: "cars", destination: "بودروم", estimated_budget: 9500, currency: "USD", stage: "new", priority: "high", assigned_agent: "زينب يلماز", probability: 40, source: "website", notes: "استئجار يخت فاخر ليومين وسيارة مرسيدس مايباخ مع سائق طوال الإقامة", due_date: "2026-09-25" },
      { name: "أحمد بن زايد", email: "a.zayed@holding.ae", phone: "+971521112233", service_type: "packages", destination: "إسطنبول", estimated_budget: 15000, currency: "USD", stage: "proposal_sent", priority: "urgent", assigned_agent: "أحمد مصطفى", probability: 75, source: "whatsapp", notes: "باقة علاجية وسياحية متكاملة مع إقامة في فورسيزونز البوسفور", due_date: "2026-09-21" },
      { name: "محمد الدوسري", email: "m.dossary@gmail.com", phone: "+966548889900", service_type: "hotels", destination: "صبنجة ومعشوقية", estimated_budget: 3400, currency: "USD", stage: "won", priority: "low", assigned_agent: "سارة كمال", probability: 100, source: "website", notes: "كوخ فاخر مع جاكوزي وإطلالة جبلية لمدة 5 ليالٍ", due_date: "2026-09-16" },
      { name: "عائلة التميمي", email: "tamimi.family@yahoo.com", phone: "+966512349876", service_type: "transfers", destination: "مطار صبيحة إلى يالوفا", estimated_budget: 1800, currency: "USD", stage: "contacted", priority: "medium", assigned_agent: "زينب يلماز", probability: 55, source: "whatsapp", notes: "استقبال VIP فان مرسيدس فيتو مكيف مع جولات يومية في يالوفا وبورصة", due_date: "2026-09-23" },
      { name: "نورة العتيبي", email: "noura.otaibi@gmail.com", phone: "+966567890123", service_type: "visa", destination: "تركيا", estimated_budget: 1200, currency: "USD", stage: "won", priority: "high", assigned_agent: "سارة كمال", probability: 100, source: "website", notes: "تأشيرات إلكترونية سريعة مع تأمين سفر معتمد لـ 6 أفراد", due_date: "2026-09-17" },
      { name: "يوسف الحربي", email: "y.harbi@gmail.com", phone: "+966590001122", service_type: "hotels", destination: "بورصة وتلفريك أولوداغ", estimated_budget: 2900, currency: "USD", stage: "new", priority: "low", assigned_agent: "زينب يلماز", probability: 35, source: "social", notes: "فندق مياه حرارية كبريتية مع إطلالة على الجبل لـ 4 ليالٍ", due_date: "2026-09-24" },
      { name: "عبدالله الكندري", email: "kandari@kandari-corp.kw", phone: "+96594445566", service_type: "hotels", destination: "فندق سيراجان بالاس إسطنبول", estimated_budget: 8900, currency: "USD", stage: "proposal_sent", priority: "urgent", assigned_agent: "أحمد مصطفى", probability: 85, source: "b2b_agent", notes: "جناح قصر السلطان المطل على البوسفور مع خدمة المساعد الشخصي (Butler)", due_date: "2026-09-20" }
    ];
    for (const lead of leads) {
      await pb.collection("crm_leads").create(lead);
    }
    console.log(`Seeded ${leads.length} crm_leads.`);
  }

  // Check site_traffic_logs
  const existingTraffic = await pb.collection("site_traffic_logs").getList(1, 1);
  if (existingTraffic.totalItems < 50) {
    console.log("Seeding site_traffic_logs...");
    const paths = ["/", "/hotels", "/flights", "/packages", "/tours", "/transfers", "/cars", "/blog", "/visa"];
    const sources = ["organic", "direct", "social", "referral", "email"];
    const referrers = ["https://google.com", "https://instagram.com", "https://tiktok.com", "https://travel-arabia.com", "https://tripadvisor.com", "direct"];
    const devices = ["mobile", "desktop", "tablet"];
    const browsers = ["Safari", "Chrome", "Firefox", "Edge"];
    const countries = ["SA", "TR", "AE", "KW", "QA", "US", "OM", "BH", "DE", "GB"];

    const now = Date.now();
    for (let i = 0; i < 90; i++) {
      const offsetMs = Math.floor(Math.random() * 30 * 60 * 1000); // within last 30 mins
      const createdDate = new Date(now - offsetMs).toISOString();
      const pathChoice = paths[Math.floor(Math.random() * paths.length)];
      const sourceChoice = sources[Math.floor(Math.random() * sources.length)];
      const deviceChoice = devices[Math.floor(Math.random() * devices.length)];
      const countryChoice = countries[Math.floor(Math.random() * countries.length)];

      await pb.collection("site_traffic_logs").create({
        path: pathChoice,
        source: sourceChoice,
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        device: deviceChoice,
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        country: countryChoice,
        duration_seconds: Math.floor(Math.random() * 240) + 15,
        session_id: `sess_${Math.random().toString(36).slice(2, 10)}`,
        created: createdDate
      });
    }
    console.log("Seeded 90 site_traffic_logs.");
  }

  // Check financial_transactions
  const existingFin = await pb.collection("financial_transactions").getList(1, 1);
  if (existingFin.totalItems === 0) {
    console.log("Seeding financial_transactions...");
    const txs = [
      { reference: "TXN-2026-9081", type: "booking_income", category: "hotel", amount: 4850, currency: "USD", gateway: "iyzico", status: "completed", counterparty: "د. فهد الشمري", description: "دفعة حجز فندق ريكسوس بريميوم أنطاليا" },
      { reference: "TXN-2026-9082", type: "booking_income", category: "package", amount: 3900, currency: "USD", gateway: "bank_wire", status: "completed", counterparty: "سارة القحطاني", description: "سداد تكلفة البرنامج السياحي طرابزون وريزا" },
      { reference: "TXN-2026-9083", type: "supplier_payout", category: "flight", amount: 8400, currency: "USD", gateway: "bank_wire", status: "completed", counterparty: "الخطوط الجوية التركية (Turkish Airlines)", description: "تسوية تذاكر طيران رحلات جماعية PNR-TK9821" },
      { reference: "TXN-2026-9084", type: "booking_income", category: "package", amount: 4800, currency: "USD", gateway: "iyzico", status: "completed", counterparty: "المهندس عمر الفاروق", description: "دفعة مسبقة لباقة كابادوكيا الملكية" },
      { reference: "TXN-2026-9085", type: "supplier_payout", category: "hotel", amount: 3100, currency: "USD", gateway: "bank_wire", status: "pending", counterparty: "سلسلة فنادق هيلتون تركيا", description: "استحقاق حجز غرف ديلوكس مؤكدة سبتمبر" },
      { reference: "TXN-2026-9086", type: "booking_income", category: "hotel", amount: 3400, currency: "USD", gateway: "b2b_wallet", status: "completed", counterparty: "محمد الدوسري", description: "خصم من محفظة وكيل معتمد لحجز أكواخ صبنجة" },
      { reference: "TXN-2026-9087", type: "platform_fee", category: "package", amount: 620, currency: "USD", gateway: "iyzico", status: "completed", counterparty: "منصة لوناليزا", description: "عمولة المنصة التشغيلية عن باقات الصيف" },
      { reference: "TXN-2026-9088", type: "refund", category: "flight", amount: 450, currency: "USD", gateway: "iyzico", status: "completed", counterparty: "خالد الحربي", description: "استرداد قيمة إلغاء مقعد طيران طرابزون" },
      { reference: "TXN-2026-9089", type: "supplier_payout", category: "transfer", amount: 1200, currency: "USD", gateway: "cash", status: "completed", counterparty: "أسطول نقل كبار الشخصيات إسطنبول", description: "تسوية خدمات الاستقبال والجولات الخاصة" },
      { reference: "TXN-2026-9090", type: "booking_income", category: "visa", amount: 1200, currency: "USD", gateway: "iyzico", status: "completed", counterparty: "نورة العتيبي", description: "رسوم إصدار تأشيرات سياحية إلكترونية عائلية" },
      { reference: "TXN-2026-9091", type: "booking_income", category: "hotel", amount: 8900, currency: "USD", gateway: "bank_wire", status: "pending", counterparty: "عبدالله الكندري", description: "حوالة بنكية مؤكدة قيد المطابقة لجناح سيراجان بالاس" },
      { reference: "TXN-2026-9092", type: "supplier_payout", category: "car", amount: 2800, currency: "USD", gateway: "bank_wire", status: "pending", counterparty: "شركة البوسفور لتأجير السيارات واليخوت", description: "تسوية إيجار مرسيدس مايباخ ويخت خاص بودروم" }
    ];
    for (const tx of txs) {
      await pb.collection("financial_transactions").create(tx);
    }
    console.log(`Seeded ${txs.length} financial_transactions.`);
  }

  console.log("Analytics, CRM, and Finance seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
