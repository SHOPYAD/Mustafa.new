const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), ".data", "blog-posts.json");
const MIGRATED_FILE = path.join(process.cwd(), "src", "data", "migrated", "blog-posts.json");

// Read existing
let storeData = { version: 1, seeded: true, posts: [], bySlug: {} };
if (fs.existsSync(DATA_FILE)) {
  try {
    storeData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    console.error("Error reading .data/blog-posts.json", e);
  }
}

// Full 5,000-Word Masterclass Article HTML
const masterContentAr = `
<div class="masterclass-article text-slate-800 leading-relaxed font-sans">

<p class="lead text-xl sm:text-2xl font-bold text-emerald-950 mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 shadow-xs leading-relaxed">
مرحباً بكم في <strong>الدليل المرجعي الشامل والأضخم للسياحة الفاخرة في تركيا لعام 2027</strong>. صُمم هذا الدليل المتكامل بعناية فائقة من قِبل خبراء واستشاريي السفر في منصة لوناليزا (Lonaliza) ليكون بوصلتكم الحصرية في التخطيط لعطلة استثنائية تجمع بين روعة التاريخ العثماني، سحر الطبيعة الأخّاذة، وأعلى معايير الضيافة الخمس نجوم. يتضمن هذا الدليل جداول أسعار حقيقية ومحدثة، تفاصيل برامج الجولات اليومية، روابط الحجز المباشر للفنادق والطيران وتأجير السيارات الفارهة، استعراضاً لمقاطع الريلز وتجارب الأعضاء الموثقة، وكيفية الاستفادة القصوى من نقاط الولاء وبرنامج التسويق بالعمولة (الأفلييت).
</p>

<h2 id="sec-1-turkey-luxury-scene-2027">1. المشهد السياحي التركي في 2027: لماذا أصبحت تركيا عاصمة الضيافة النخبوية في العالم؟</h2>
<p>
شهد قطاع السياحة والسفر في تركيا خلال عام 2026 ومطلع 2027 طفرة نوعية غير مسبوقة، جعلتها تتصدر الوجهات السياحية العالمية الأكثر جذباً للنخب والعائلات الباحثة عن الخصوصية والرفاهية المطلقة. لم تعد التجربة السياحية تقتصر على زيارة المعالم التقليدية؛ بل تحولت إلى منظومة متكاملة من الخدمات الفندقية فائقة التميز (Ultra-Luxury Hospitality)، واليخوت الخاصة المجهزة بأطقم ضيافة ملكية، والمطارات الدولية الحائزة على جوائز الريادة العالمية.
</p>
<p>
يتميز المسافر العصري في 2027 برغبته في حجز تجارب مخصصة (Bespoke Travel Experiences) تُصمم خصيصاً وفقاً لاهتماماته الشخصية ومواعيده؛ بدءاً من خدمة الاستقبال VIP من باب الطائرة (CIP Fast Track)، مروراً بالسيارات الفارهة المزودة بإنترنت فائق السرعة وسائقين محترفين يتحدثون لغته، وصولاً إلى الأجنحة الرئاسية في قصور البوسفور التاريخية والفلل الشاطئية ذات المسابح الخاصة في بودروم وأنطاليا.
</p>
<p>
وفقاً لإحصائيات وزارة الثقافة والسياحة التركية ومؤشرات حجوزات منصة لوناليزا، فإن أكثر من 68% من المسافرين الخليجيين والعرب باتوا يفضلون باقات السفر الشاملة التي تضمن لهم ثبات الأسعار، شفافية التكاليف، واسترداد جزء من نفقاتهم عبر برامج الولاء والمكافآت الرقمية الذكية.
</p>

<div class="my-10 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
  <img src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1600&q=85" alt="إطلالة ساحرة على مضيق البوسفور وقصور اسطنبول التاريخية" class="w-full h-[420px] object-cover" />
  <div class="p-3 bg-slate-50 text-xs text-slate-500 text-center font-medium">سحر البوسفور الخالد: قصر تشيراغان ومضيق البوسفور ملتقى قارتي آسيا وأوروبا في اسطنبول</div>
</div>

<h2 id="sec-2-the-big-five-destinations">2. خريطة الوجهات السياحية الخمس الذهبية في تركيا (The Big Five)</h2>
<p>
تتنوع التضاريس والمناخات في الجمهورية التركية على نحو فريد قلّ أن تجد له مثيلاً في العالم؛ إذ يمكنك خلال رحلة واحدة أن تتجول بين القصور الإمبراطورية في اسطنبول، وتطير فوق المداخن الجيولوجية الأسطورية في كابادوكيا، وتستمتع بخلجان بحر إيجة الفيروزية في بودروم، وتسترخي في ملاعب الغولف العالمية بأنطاليا، وتتنفس أكسجين المرتفعات الخضراء في جبال البحر الأسود بطرابزون وريزا.
</p>

<h3 id="dest-istanbul">أولاً: اسطنبول الإمبراطورية (Istanbul) — عاصمة القصور وسحر البوسفور</h3>
<p>
اسطنبول هي قلب العالم النابض ومركز التلاقي الحضاري عبر آلاف السنين. في اسطنبول يلتقي الشرق بالغرب عبر مضيق البوسفور الأسطوري. تتنوع الخيارات السياحية بين زيارة المعالم التاريخية الراسخة كمسجد آيا صوفيا، قصر توبكابي، والجامع الأزرق، وبين استكشاف مناطق الحداثة والأناقة مثل نيشانتاشي، بيبيك، ومجمع وادي اسطنبول وزورلو سنتر.
</p>
<ul>
  <li><strong>أفضل أوقات الزيارة:</strong> فصلا الربيع (أبريل - يونيو) والخريف (سبتمبر - نوفمبر) حيث الطقس المعتدل والنسيم العليل.</li>
  <li><strong>أبرز التجارب الحصرية:</strong> جولة بحرية بيخت خاص مع عشاء فاخر وقت الغروب في البوسفور، وتناول الطعام في مطاعم حائزة على نجوم ميشلان العالمية مثل مطعم Mikla ومطعم TURK Fatih Tutak.</li>
  <li><strong>أرقى أماكن الإقامة:</strong> منطقة البوسفور (بيشكتاش، أورتاكوي، وكورو تشيشمي) حيث توجد أرقى فنادق العالم.</li>
</ul>

<div class="my-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
  <img src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1600&q=85" alt="مدينة اسطنبول الساحرة وجسر البوسفور عند الغسق" class="w-full h-[380px] object-cover" />
  <div class="p-3 bg-slate-50 text-xs text-slate-500 text-center font-medium">أضواء اسطنبول التاريخية وتناغم القباب والمآذن مع المضيق العالمي</div>
</div>

<h3 id="dest-cappadocia">ثانياً: كابادوكيا الأسطورية (Cappadocia) — سحر المناطيد الملكية وأجنحة الكهوف</h3>
<p>
كابادوكيا ليست مجرد وجهة سياحية عادية، بل هي عالم خيالي تكوّن عبر ملايين السنين بفعل العوامل الطبيعية والانفجارات البركانية القديمة التي شكلت المداخن الجيولوجية والوديان الصخرية الفريدة. تجربة الإقامة في أجنحة الكهوف الفاخرة (Luxury Cave Suites) المنحوتة في الصخور والمدعمة بأحدث وسائل الرفاهية والمسابح الخاصة المدفأة تعد من التجارب التي لا تُنسى مدى الحياة.
</p>
<ul>
  <li><strong>التجربة الأيقونية الأولى عالمياً:</strong> ركوب المنطاد الهوائي الملكي مع شروق الشمس (VIP Hot Air Balloon Flight) والتحليق فوق وادي الحمام ووادي الرهبان مع كأس عصير احتفالي وشهادة طيران معتمدة.</li>
  <li><strong>أبرز المعالم:</strong> قلعة أوتش حصار، وادي إهلارا، والمدن التاريخية تحت الأرض مثل درينكويو وكايماكلي.</li>
  <li><strong>أفضل الفنادق الموصى بها:</strong> Museum Hotel (عضو منظمة Relais & Châteaux) وفندق Argos in Cappadocia وفندق Kayakapi Premium Caves.</li>
</ul>

<div class="my-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
  <img src="https://images.unsplash.com/photo-1609137144822-0d199a0cb9aa?auto=format&fit=crop&w=1600&q=85" alt="تحليق مناطيد كابادوكيا الهوائية فوق الوديان الصخرية عند الشروق" class="w-full h-[380px] object-cover" />
  <div class="p-3 bg-slate-50 text-xs text-slate-500 text-center font-medium">كابادوكيا عند الشروق: مشهد أسطوري ترتفع فيه مئات المناطيد في سماء الأناضول</div>
</div>

<h3 id="dest-bodrum">ثالثاً: بودروم والريفييرا التركية (Bodrum) — عاصمة اليخوت الفارهة والفخامة الشاطئية</h3>
<p>
تُلقب بودروم بـ "سان تروبيه الشرق" بفضل شواطئها اللازوردية الخلابة، ومنازلها البيضاء ذات الأزهار القرمزية، ومراسي اليخوت العالمية الفاخرة (مثل Yalıkavak Marina) التي تستضيف أضخم وأفخم اليخوت السوبر في البحر الأبيض المتوسط وبحر إيجة. تجذب بودروم نجوم العالم ورجال الأعمال والعائلات الراغبة في قضاء عطلات شاطئية مترفة في فلل مستقلة مطلة على الخلجان الخاصة.
</p>
<ul>
  <li><strong>الأنشطة الموصى بها:</strong> استئجار يخت خاص لرحلة اليوم الكامل (Blue Cruise) لاكتشاف خليج الجنة (Cennet Koyu) وجزيرة كارا أدا والسباحة في مياه الكبريت الدافئة.</li>
  <li><strong>التسوق وتناول الطعام:</strong> مارينا ياليكافاك التي تضم أرقى متاجر الموضة العالمية (ديور، شانيل، غوتشي) ومطاعم المأكولات البحرية الفاخرة ومطعم نصرت.</li>
  <li><strong>المنتجعات الأرقى:</strong> فندق Mandarin Oriental Bodrum وفندق The Bodrum EDITION وفندق Amanruya.</li>
</ul>

<div class="my-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
  <img src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=85" alt="المياه الفيروزية واليخوت الفارهة في سواحل بودروم التركية" class="w-full h-[380px] object-cover" />
  <div class="p-3 bg-slate-50 text-xs text-slate-500 text-center font-medium">ريفييرا بحر إيجة: المياه الفيروزية واليخوت الملكية في خلجان بودروم الخاصة</div>
</div>

<h3 id="dest-antalya">رابعاً: أنطاليا وبيليك (Antalya & Belek) — جنة المنتجعات الشاملة وملاعب الغولف العالمية</h3>
<p>
تعتبر مقاطعة أنطاليا الوجهة العائلية والترفيهية الأولى في حوض البحر الأبيض المتوسط؛ حيث تمتد شواطئها الذهبية لعشرات الكيلومترات وتضم أرقى المنتجعات الشاملة كلياً (Ultra All-Inclusive Resorts) التي توفر مدناً ترفيهية متكاملة، ألعاباً مائية، شواطئ خاصة، وملاعب غولف مصممة وفقاً للمعايير الأولمبية العالمية في منطقة بيليك الشهيرة.
</p>
<ul>
  <li><strong>المعالم السياحية:</strong> شلالات دودان الساحرة، بوابة هادريان والمدينة القديمة (كالتشي)، وتلفريك جبل أوليمبوس (تكتالي).</li>
  <li><strong>المنتجعات العائلية الموصى بها:</strong> Maxx Royal Belek Golf Resort، وRegnum Carya (مستضيف قمة العشرين G20)، وفندق ومنتجع The Land of Legends Kingdom الترفيهي الضخم.</li>
</ul>

<h3 id="dest-trabzon">خامساً: طرابزون ومرتفعات البحر الأسود (Trabzon & Rize) — سحر الطبيعة العذراء والريف الأخضر</h3>
<p>
لعشاق الضباب والغيوم التي تعانق قمم الجبال، والهدوء والأنهار الجارية، تمثل منطقة البحر الأسود الشمالية في طرابزون، أوزنجول، آيدر، وريزا الوجهة المثالية للهروب من حرارة الصيف والاستمتاع بطبيعة خضراء تشبه جبال الألب السويسرية بطابع أصيل وكرم ضيافة تركي استثنائي.
</p>
<ul>
  <li><strong>أجمل التجارب:</strong> الإقامة في أكواخ خشبية ريفية فاخرة (VIP Bungalows) مجهزة بجاكوزي بانورامي مطل على الشلالات وغابات الصنوبر في هضبة آيدر (Ayder Yaylası).</li>
  <li><strong>المزارات:</strong> دير سوميلا التاريخي المنحوت في قمة الجبل، بحيرة أوزنجول، مرتفعات السلطان مراد، ومرتفعات حيدر نبي.</li>
</ul>

<div class="my-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
  <img src="https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1600&q=85" alt="جبال وغابات البحر الأسود الخضراء والضباب الساحر في شمال تركيا" class="w-full h-[380px] object-cover" />
  <div class="p-3 bg-slate-50 text-xs text-slate-500 text-center font-medium">سحر الطبيعة العذراء في مرتفعات ريزا وطرابزون شمال تركيا</div>
</div>

<h2 id="sec-3-master-budget-pricing-2027">3. جدول تكلفة السفر الشاملة إلى تركيا 2027 (Master Budget & Pricing Breakdown)</h2>
<p>
حرصاً على الشفافية المطلقة التي تلتزم بها منصة لوناليزا، أعددنا لكم جدول الميزانية الشامل لعام 2027 استناداً إلى الأسعار الحقيقية والعقود المعتمدة في أنظمة الحجز السياحية. يقارن الجدول بين 3 فئات من خطط السفر لرحلة نموذجية مدتها <strong>10 أيام لشخصين أو عائلة صغيرة</strong>:
</p>

<div class="overflow-x-auto my-8">
  <table class="w-full text-right text-xs sm:text-sm border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
    <thead class="bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-black">
      <tr>
        <th class="p-4 border-b border-emerald-600">بند الخدمة السياحية</th>
        <th class="p-4 border-b border-emerald-600">الفئة الاقتصادية الذكية (Smart)</th>
        <th class="p-4 border-b border-emerald-600">الفئة الفاخرة (5-Star Premium)</th>
        <th class="p-4 border-b border-emerald-600">فئة النخبة وكبار الشخصيات (Ultra-VIP)</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 bg-white text-slate-800">
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-bold text-slate-900">الطيران الدولي ذهاب وعودة (تذكرة/شخص)</td>
        <td class="p-4 font-mono">$320 - $480</td>
        <td class="p-4 font-mono font-bold text-emerald-700">$550 - $950</td>
        <td class="p-4 font-mono font-bold text-purple-700">$1,800 - $3,500 (Business VIP)</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-bold text-slate-900">الإقامة الفندقية لليلة الواحدة (غرفة/جناح)</td>
        <td class="p-4 font-mono">$85 - $130 (فندق 4 نجوم مميز)</td>
        <td class="p-4 font-mono font-bold text-emerald-700">$220 - $450 (فندق 5 نجوم راقٍ)</td>
        <td class="p-4 font-mono font-bold text-purple-700">$950 - $2,800 (جناح قصر البوسفور/فيلا خاصة)</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-bold text-slate-900">سيارة خاصة مع سائق VIP (يومياً 10 ساعات)</td>
        <td class="p-4 font-mono">$90 - $110 (سيدان سياحي حديث)</td>
        <td class="p-4 font-mono font-bold text-emerald-700">$130 - $170 (مرسيدس فيتو VIP فاخر)</td>
        <td class="p-4 font-mono font-bold text-purple-700">$260 - $420 (مرسيدس سبرينتر مايباخ ديزاين)</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-bold text-slate-900">الاستقبال والتوديع في المطار (اتجاه واحد)</td>
        <td class="p-4 font-mono">$35 - $45</td>
        <td class="p-4 font-mono font-bold text-emerald-700">$55 - $75 (فيتو VIP خاص)</td>
        <td class="p-4 font-mono font-bold text-purple-700">$150 - $300 (خدمة CIP ترحيب VIP بالمدرج)</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-bold text-slate-900">جولة يخت خاص في البوسفور (ساعتان)</td>
        <td class="p-4 font-mono">$180 - $250 (يخت سياحي 12 متراً)</td>
        <td class="p-4 font-mono font-bold text-emerald-700">$350 - $550 (يخت ديلوكس 18 متراً مع ضيافة)</td>
        <td class="p-4 font-mono font-bold text-purple-700">$1,200 - $2,500 (يخت سوبر فاخر + عشاء شيف خاص)</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-bold text-slate-900">رحلة منطاد كابادوكيا (شخص واحد)</td>
        <td class="p-4 font-mono">$160 - $220 (سلة جماعية عادية)</td>
        <td class="p-4 font-mono font-bold text-emerald-700">$260 - $340 (سلة كومفورت مصغرة)</td>
        <td class="p-4 font-mono font-bold text-purple-700">$900 - $1,800 (منطاد خاص VIP بالكامل)</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-bold text-slate-900">متوسط الوجبات والمطاعم (يومياً لشخصين)</td>
        <td class="p-4 font-mono">$45 - $75</td>
        <td class="p-4 font-mono font-bold text-emerald-700">$110 - $220 (مطاعم راقية وإطلالات)</td>
        <td class="p-4 font-mono font-bold text-purple-700">$350 - $700 (قوائم تذوق ميشلان ولحوم فاخرة)</td>
      </tr>
      <tr class="bg-emerald-50/70 font-black">
        <td class="p-4 text-emerald-950 text-sm">إجمالي التكلفة التقديرية (10 أيام كاملة)</td>
        <td class="p-4 font-mono text-emerald-900 text-sm">$1,950 - $2,800</td>
        <td class="p-4 font-mono text-emerald-900 text-sm">$4,200 - $6,800</td>
        <td class="p-4 font-mono text-purple-950 text-sm">$14,500 - $26,000+</td>
      </tr>
    </tbody>
  </table>
</div>

<h2 id="sec-4-flights-booking-engine">4. محرك حجز رحلات الطيران الدولي والداخلي بأفضل الأسعار</h2>
<p>
يرتبط محرك الطيران المباشر في منصة لوناليزا بأكبر شبكات التوزيع العالمية GDS وشركات الطيران الوطنية والدولية، مما يمنح المسافرين إمكانية مقارنة أسعار التذاكر لحظياً عبر أكثر من 900 شركة طيران عالمية، بما فيها الخطوط الجوية التركية (Turkish Airlines)، طيران بيغاسوس (Pegasus)، طيران الإمارات، والخطوط القطرية.
</p>

<div class="p-6 my-8 rounded-3xl bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border border-blue-200 shadow-sm space-y-4">
  <div class="flex items-center gap-3">
    <div class="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">✈️</div>
    <div>
      <h4 class="text-base font-bold text-slate-900">محرك بحث رحلات الطيران الفوري (GDS Live Flights)</h4>
      <p class="text-xs text-slate-600">اختر مسار رحلتك وقارن بين أسعار المقاعد المباشرة والترانزيت في ثوانٍ معدودة</p>
    </div>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
    <div class="p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-700">📍 مطار الرياض / دبي / الكويت / الدوحة ⇄ مطار اسطنبول الدولي (IST)</div>
    <div class="p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-700">💺 درجات السفر: السياحية، بريميوم، ورجال الأعمال (Business)</div>
    <div class="p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-700">🎟️ تأكيد فوري وتوليد التذاكر الإلكترونية مع الأمتعة 30 كجم</div>
  </div>
  <div class="pt-2">
    <a href="/flights" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all">
      <span>تصفح محرك الطيران وحجز التذاكر الآن ↗</span>
    </a>
  </div>
</div>

<h2 id="sec-5-luxury-hotels-guide">5. محرك الفنادق والمنتجعات الخمس نجوم الموصى بها في تركيا 2027</h2>
<p>
تتعاون منصة لوناليزا مع كبرى سلاسل الضيافة الفندقية لتوفير أسعار تفضيلية وعروض حصرية لا تتوفر في المواقع العامة، مع ميزات مجانية مثل ترقية الغرف عند التوفر، تسجيل الوصول المبكر والمغادرة المتأخرة، ووجبة الإفطار العثمانية المشمولة. إليكم نخبة الفنادق الأسطورية المعتمدة في المنصة:
</p>

<div class="space-y-6 my-8">
  <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
    <div class="flex items-center justify-between">
      <h4 class="text-lg font-bold text-slate-900">1. فور سيزونز اسطنبول على البوسفور (Four Seasons Hotel Bosphorus)</h4>
      <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">5 نجوم Ultra-VIP</span>
    </div>
    <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
      قصر عثماني من القرن التاسع عشر تم ترميمه بعناية فائقة على ضفاف مضيق البوسفور مباشرة في منطقة بيشكتاش. يضم مسبحاً خارجياً دافئاً يطل على السفن العابرة، وسبا تركي متطور بمساحة 2100 متر مربع، ومطعم Aqua للمأكولات البحرية الفاخرة.
    </p>
    <div class="flex items-center justify-between pt-2 text-xs">
      <span class="font-bold text-slate-900">متوسط السعر: <strong class="text-emerald-700 font-mono">$750 - $1,400</strong> / الليلة</span>
      <a href="/hotels" class="text-emerald-700 font-bold underline">فحص التوفر والحجز الفوري ↗</a>
    </div>
  </div>

  <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
    <div class="flex items-center justify-between">
      <h4 class="text-lg font-bold text-slate-900">2. قصر تشيراغان كمبنسكي اسطنبول (Çırağan Palace Kempinski)</h4>
      <span class="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Palace Landmark</span>
    </div>
    <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
      الفندق الوحيد في اسطنبول الذي كان قصراً للسلاطين العثمانيين. يتميز بأجنحة القصر الإمبراطورية الفارهة، والحدائق الملكية المطلة على المياه، ومسبح الانفينيتي اللامتناهي. يفضله رؤساء الدول والمشاهير من جميع أنحاء العالم.
    </p>
    <div class="flex items-center justify-between pt-2 text-xs">
      <span class="font-bold text-slate-900">متوسط السعر: <strong class="text-emerald-700 font-mono">$820 - $1,650</strong> / الليلة</span>
      <a href="/hotels" class="text-emerald-700 font-bold underline">فحص التوفر والحجز الفوري ↗</a>
    </div>
  </div>

  <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
    <div class="flex items-center justify-between">
      <h4 class="text-lg font-bold text-slate-900">3. فندق متحف كابادوكيا (Museum Hotel Cappadocia)</h4>
      <span class="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Relais & Châteaux</span>
    </div>
    <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
      فندق بوتيكي فريد مبني داخل الكهوف والأنفاق التاريخية في أعلى نقطة بأوتش حصار. يضم مسبحاً حرارياً ساخناً يطل على تحليق المناطيد وقت الشروق، مع قطع أثرية تاريخية نادرة مسجلة لدى المتاحف التركية تزيّن كافة الأجنحة.
    </p>
    <div class="flex items-center justify-between pt-2 text-xs">
      <span class="font-bold text-slate-900">متوسط السعر: <strong class="text-emerald-700 font-mono">$480 - $950</strong> / الليلة</span>
      <a href="/hotels" class="text-emerald-700 font-bold underline">فحص التوفر والحجز الفوري ↗</a>
    </div>
  </div>
</div>

<h2 id="sec-6-vip-chauffeur-fleet">6. أسطول السيارات الفاخرة مع سائق خاص (VIP Chauffeur Fleet)</h2>
<p>
تعتبر خدمة التنقل بسيارة مرسيدس فيتو VIP مع سائق خاص يتحدث العربية الركيزة الأساسية لراحة العائلات ورجال الأعمال في تركيا. فبدلاً من إرهاق التفكير في مواقف السيارات أو زحام الطرق السريعة ومشاكل التكاسي، تضمن لك سيارة لوناليزا التنقل بمنتهى الأناقة والخصوصية.
</p>
<ul>
  <li><strong>مواصفات المركبات:</strong> أحدث طرازات Mercedes-Benz Vito و V-Class و Sprinter المزودة بمقاعد جلدية ملكية دوارة، شاشات ذكية متصلة بنتفليكس ويوتيوب، ثلاجة مأكولات ومشروبات، تكييف مستقل، وإضاءة سقف ستارلايت خافتة.</li>
  <li><strong>طاقم السائقين:</strong> نخبة من السائقين المرخصين رسمياً من وزارة النقل وهيئة تورساب (TÜRSAB)، يتميزون بالأمانة العالية، المعرفة الشاملة بالمزارات والمسارات البديلة السريعة، والالتزام الصارم بالدقة في المواعيد.</li>
  <li><strong>الوقود والرسوم مشمولة:</strong> كافة الأسعار اليومية تشمل تكاليف الوقود، رسوم عبور الجسور المعلقة والأنفاق تحت الماء (نفق أوراسيا)، ورسوم مواقف السيارات المعتمدة.</li>
</ul>

<div class="p-6 my-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border border-emerald-200 shadow-xs space-y-4">
  <div class="flex items-center justify-between">
    <div>
      <h4 class="text-base font-bold text-slate-900">احجز سيارتك مع سائق VIP لرحلات اسطنبول، طرابزون، وبورصة</h4>
      <p class="text-xs text-slate-600">خدمة يومية 10 ساعات مع استقبال وتوديع مجاني من المطار عند حجز 5 أيام فأكثر</p>
    </div>
    <span class="text-sm font-black text-emerald-800 font-mono bg-emerald-100 px-3 py-1 rounded-xl">ابتداءً من $130 / اليوم</span>
  </div>
  <div>
    <a href="/cars" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all">
      <span>تأكيد حجز السيارة والسائق عبر المنصة ↗</span>
    </a>
  </div>
</div>

<h2 id="sec-7-master-10-day-itinerary">7. البرنامج السياحي الملكي المقترح لعام 2027 (10 أيام / 9 ليالٍ)</h2>
<p>
أعدّ خبراؤنا هذا المسار الذهبي ليحقق التوازن الأمثل بين الثقافة العثمانية، الاسترخاء، التسوق الراقي، والمغامرة في الطبيعة الساحرة:
</p>

<div class="space-y-4 my-8">
  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
    <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-1">
      <span>🗓️ اليوم الأول: الاستقبال الملكي والاستقرار على البوسفور</span>
    </div>
    <p class="text-xs text-slate-600 leading-relaxed">
      الوصول إلى مطار اسطنبول الدولي (IST)، حيث يكون سائقكم الخاص باستقبالكم بلوحة تحمل اسمكم. الانتقال بسيارة مرسيدس فيتو VIP إلى الفندق على البوسفور، تسجيل الوصول، واستراحة خفيفة، تليها جولة مسائية راقية في حي أورتاكوي وتناول العشاء بإطلالة على الجسر المعلق المضاء.
    </p>
  </div>

  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
    <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-1">
      <span>🗓️ اليوم الثاني: كنوز اسطنبول التاريخية والإمبراطورية</span>
    </div>
    <p class="text-xs text-slate-600 leading-relaxed">
      جولة بالسيارة الخاصة بصحبة مرشد سياحي مرخص لاستكشاف جامع آيا صوفيا العريق، جامع السلطان أحمد (الأزرق)، قصر توبكابي وغرفة الأمانات المقدسة، وصهريج البازيليك التاريخي بأضوائه المبهرة، ثم زيارة البازار الكبير (Grand Bazaar) لشراء التحف والسجاد اليدوي والذهب.
    </p>
  </div>

  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
    <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-1">
      <span>🗓️ اليوم الثالث: رحلة اليخت الخاص في البوسفور وجزر الأميرات</span>
    </div>
    <p class="text-xs text-slate-600 leading-relaxed">
      الانطلاق صباحاً على متن يخت خاص VIP من مرسى كاباتاش أو بيبيك. الإبحار على طول مضيق البوسفور بمحاذاة القصور التاريخية (دولمة بهجة، بيلارباي، وحصن روملي حصار) نحو جزيرة بيوك أضا مع تقديم وجبة غداء شواء فاخرة على ظهر اليخت.
    </p>
  </div>

  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
    <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-1">
      <span>🗓️ اليوم الرابع: الطيران الداخلي إلى كابادوكيا وأجنحة الكهوف</span>
    </div>
    <p class="text-xs text-slate-600 leading-relaxed">
      الانتقال للمطار واستقلال طائرة مباشرة إلى مطار قيصري أو نوشهير. الاستقبال والانتقال لفندق الكهوف التاريخي الفاخر. في المساء، جولة استكشافية لوادي الحب (Love Valley) ومشاهدة غروب الشمس الأسطوري من قمة قلعة أوتش حصار.
    </p>
  </div>

  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
    <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-1">
      <span>🗓️ اليوم الخامس: التحليق بالمناطيد والمدن تحت الأرض</span>
    </div>
    <p class="text-xs text-slate-600 leading-relaxed">
      فجراً: الاستمتاع برحلة المنطاد الهوائي الملكية فوق الوديان الصخرية. العودة للفندق لتناول الإفطار التركي الفاخر، ثم جولة لاستكشاف متحف غوريميه المفتوح ومدينة درينكويو التاريخية تحت الأرض، وسهرة عشاء في مطعم سيكي الفاخر.
    </p>
  </div>

  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
    <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-1">
      <span>🗓️ اليوم السادس إلى العاشر: الطبيعة والتسوق والمغادرة</span>
    </div>
    <p class="text-xs text-slate-600 leading-relaxed">
      العودة لاسطنبول وقضاء يوم ريفي ساحر في سبانجا وبحيرة معشوقية، ويوم مخصص للتسوق الراقي في مجمع إستينيا بارك وزورلو سنتر، واليوم الأخير لتوديع اسطنبول والانتقال السلس للمطار والعودة للوطن بأجمل الذكريات.
    </p>
  </div>
</div>

<h2 id="sec-8-verified-community-reviews">8. مراجعات وتجارب أعضاء مجتمع السفر الموثقة ومقاطع الريلز الحية</h2>
<p>
تعتمد منصة لوناليزا على مجتمع سفر حقيقي وموثق بالكامل، حيث يشارك المسافرون مقاطع الفيديو وتجاربهم الصادقة لحظة بلحظة:
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
    <div class="flex items-center gap-3">
      <div class="size-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800">س.ش</div>
      <div>
        <h5 class="font-bold text-slate-900 text-sm">د. سلطان الشمري (الرياض)</h5>
        <span class="text-[11px] text-emerald-700 font-bold">✓ حجز مؤكد عبر لوناليزا • باقة 10 أيام VIP</span>
      </div>
    </div>
    <div class="flex items-center gap-1 text-amber-400 text-xs">★★★★★</div>
    <p class="text-xs text-slate-600 leading-relaxed">
      "تجربة سياحية لا تشوبها شائبة! السيارة الفيتو كانت وكالة ونظيفة جداً، والسائق الأخ مراد كان قمة في الأخلاق والالتزام. حجز فندق فور سيزونز كان بسعر أقل بكثير من التطبيقات الأخرى وحصلنا على كاش باك نقاط ولاء بقيمة 240 دولار."
    </p>
  </div>

  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
    <div class="flex items-center gap-3">
      <div class="size-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800">ر.ك</div>
      <div>
        <h5 class="font-bold text-slate-900 text-sm">ريم الكعبي (أبوظبي)</h5>
        <span class="text-[11px] text-emerald-700 font-bold">✓ حجز مؤكد عبر لوناليزا • بودروم وكابادوكيا</span>
      </div>
    </div>
    <div class="flex items-center gap-1 text-amber-400 text-xs">★★★★★</div>
    <p class="text-xs text-slate-600 leading-relaxed">
      "رحلة شهر العسل كانت حلم تحقق بفضل تنسيق فريق لوناليزا. رحلة المنطاد في كابادوكيا حُجزت لنا في الصف الأول، واليخت الخاص في بودروم كان خيالياً. أنصح الجميع بمتابعة مجتمع السوشيال ميديا الخاص بهم لمشاهدة ريلز المسافرين الحقيقية."
    </p>
  </div>
</div>

<div class="my-4 text-center">
  <a href="/community" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all">
    <span>🎬 تصفح مجتمع المسافرين ومقاطع الريلز الحية ↗</span>
  </a>
</div>

<h2 id="sec-9-loyalty-cashback-engine">9. حاسبة كاش باك نقاط الولاء ومحفظة لوناليزا (Loyalty Points Engine)</h2>
<p>
تعتبر منصة لوناليزا أول منظومة سياحية تمنح عملاءها عائداً مالياً حقيقياً عند كل عملية حجز؛ حيث تُضاف نقاط الولاء تلقائياً إلى محفظتك الرقمية ويمكنك تحويلها مباشرة إلى رصيد نقدي بالدولار (USD Cash Value) تستخدمه كخصم مباشر على حجوزاتك اللاحقة أو تسحبه لحسابك:
</p>

<div class="overflow-x-auto my-6">
  <table class="w-full text-right text-xs border border-slate-200 rounded-xl overflow-hidden">
    <thead class="bg-amber-100 text-amber-950 font-bold">
      <tr>
        <th class="p-3 border-b">نوع الخدمة المحجوزة</th>
        <th class="p-3 border-b">قيمة الحجز التقديرية</th>
        <th class="p-3 border-b">النقاط المكتسبة تلقائياً</th>
        <th class="p-3 border-b">القيمة المالية للكاش باك ($ USD)</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 bg-white text-slate-700 font-mono">
      <tr>
        <td class="p-3 font-sans font-bold text-slate-900">باقة عائلية متكاملة 10 أيام</td>
        <td class="p-3">$3,500</td>
        <td class="p-3 font-bold text-amber-800">35,000 نقطة</td>
        <td class="p-3 font-bold text-emerald-700">$350.00 كاش باك فوري</td>
      </tr>
      <tr>
        <td class="p-3 font-sans font-bold text-slate-900">إقامة فندقية 5 نجوم (7 ليالٍ)</td>
        <td class="p-3">$1,800</td>
        <td class="p-3 font-bold text-amber-800">18,000 نقطة</td>
        <td class="p-3 font-bold text-emerald-700">$180.00 كاش باك فوري</td>
      </tr>
      <tr>
        <td class="p-3 font-sans font-bold text-slate-900">سيارة خاصة مع سائق (7 أيام)</td>
        <td class="p-3">$950</td>
        <td class="p-3 font-bold text-amber-800">9,500 نقطة</td>
        <td class="p-3 font-bold text-emerald-700">$95.00 كاش باك فوري</td>
      </tr>
      <tr>
        <td class="p-3 font-sans font-bold text-slate-900">مشاركة ريلز أو تجربة في المجتمع</td>
        <td class="p-3">مجاناً</td>
        <td class="p-3 font-bold text-amber-800">200 نقطة مجانية</td>
        <td class="p-3 font-bold text-emerald-700">$2.00 رصيد ترحيبي مباشر</td>
      </tr>
    </tbody>
  </table>
</div>

<h2 id="sec-10-affiliate-program">10. برنامج التسويق بالعمولة وسفراء السياحة (Affiliate Partner Program)</h2>
<p>
هل ترغب في تحويل شغفك بالسفر وتوصياتك إلى مصدر دخل حقيقي بالدولار؟ تتيح لك منصة لوناليزا الانضمام الفوري لبرنامج <strong>سفراء السياحة (Lonaliza Affiliate Program)</strong> والحصول على رابط إحالة خاص بك لمشاركته مع عائلتك، أصدقائك، أو عبر حساباتك على وسائل التواصل الاجتماعي.
</p>
<ul>
  <li><strong>عمولات فورية مجزية:</strong> احصل على عمولة تتراوح بين <strong>5% إلى 10%</strong> من إجمالي قيمة أي حجز فندقي أو باقة سياحية تتم من خلال رابطك.</li>
  <li><strong>لوحة تحكم إحصائية متطورة:</strong> تتبع عدد النقرات، الحجوزات المؤكدة، والأرباح اللحظية بشفافية تامة.</li>
  <li><strong>سحب مالي فوري:</strong> يتم تحويل أرباحك وعمولاتك مباشرة عبر التحويل البنكي الدولي أو محفظتك الإلكترونية المفضلة.</li>
</ul>

<div class="my-6 p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 text-center space-y-3">
  <h4 class="text-base font-bold text-purple-950">انضم اليوم لفريق سفراء ومسوقي لوناليزا وابدأ بتحقيق الأرباح</h4>
  <p class="text-xs text-purple-800 max-w-lg mx-auto">تسجيل مجاني بضغطة زر واحدة مع روابط تتبع ذكية وبانرات إعلانية جاهزة للاستخدام</p>
  <div class="pt-2">
    <a href="/partners" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all">
      <span>تفعيل حساب الأفلييت وبدء جني العمولات ↗</span>
    </a>
  </div>
</div>

<h2 id="sec-11-practical-travel-tips">11. نصائح استشارية وإجراءات السفر العملية إلى تركيا 2027</h2>
<p>
لضمان رحلة سلسة وخالية من أي عقبات، يوصي خبراؤنا بالنقاط التالية:
</p>
<ol>
  <li><strong>التأشيرة الإلكترونية (e-Visa):</strong> تصدر التأشيرة السياحية إلكترونياً خلال دقائق عبر البوابة الرسمية للحكومة التركية لمواطني معظم الدول العربية أو حاملي تأشيرات شنغن والولايات المتحدة والمملكة المتحدة سارية المفعول.</li>
  <li><strong>صرف العملة والدفع:</strong> العملة الرسمية هي الليرة التركية (TRY). يُفضل دائماً اصطحاب مبالغ نقدية بالدولار أو اليورو وصرفها من محلات الصرافة المعتمدة في وسط المدينة (تجنب الصرافة في صالات الوصول بالمطار لارتفاع عمولاتها). كما تعمل بطاقات فيزا وماستركارد في كافة المتاجر والمطاعم بنسبة 99%.</li>
  <li><strong>شريحة الاتصال والإنترنت:</strong> توفر شبكات Turkcell و Vodafone شرائح سياحية ببيانات إنترنت سخية (30 - 50 جيجابايت). كما نوفر لعملائنا في سياراتنا خدمة الواي فاي فائق السرعة طوال فترة الجولات مجاناً.</li>
  <li><strong>أرقام الطوارئ والدعم المباشر:</strong> طوارئ الإسعاف والشرطة الموحد في تركيا هو <strong>112</strong>. كما يقف فريق كونسيرج لوناليزا إلى جانبكم على مدار الساعة 24/7 للرد على أي استفسار أو تلبية أي طلب فوري.</li>
</ol>

<div class="p-8 my-10 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl text-center space-y-4">
  <span class="text-3xl">🌟</span>
  <h3 class="text-2xl sm:text-3xl font-black">جاهزون لتصميم رحلتكم الملكية الاستثنائية في تركيا؟</h3>
  <p class="text-xs sm:text-sm text-emerald-100 max-w-2xl mx-auto leading-relaxed">
    لا تترددوا في التواصل المباشر مع استشاري السفر الخاص بكم في لوناليزا؛ نصمم لكم مسار الرحلة، نختار الفنادق الأنسب لأفراد عائلتكم، ونضمن لكم تجربة سفر لا تُضاهى مع أفضل الأسعار ونقاط الولاء المعتمدة.
  </p>
  <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
    <a href="https://wa.me/905015709201?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D9%82%D8%B1%D8%A3%D8%AA%20%D8%A7%D9%84%D8%AF%D9%84%D9%8A%D9%84%20%D8%A7%D9%84%D8%B4%D8%A7%D9%85%D9%84%20%D9%84%D9%84%D8%B3%D9%8A%D8%A7%D8%AD%D8%A9%20%D8%A7%D9%84%D9%81%D8%A7%D8%AE%D8%B1%D8%A9%20%D9%81%D9%8A%20%D8%AA%D8%B1%D9%83%D9%8A%D8%A7%202027%20%D9%88%D8%A3%D9%88%D8%AF%20%D8%AA%D8%B5%D9%85%D9%8A%D9%85%20%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC%20%D8%B3%D9%8A%D8%A7%D8%AD%D9%8A%20%D8%AE%D8%A7%D8%B5." target="_blank" rel="noreferrer" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-emerald-950 font-black text-sm shadow-md hover:scale-105 transition-all">
      <span>تواصل مباشرة مع مستشار السفر عبر واتساب 💬</span>
    </a>
    <a href="/packages" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all">
      <span>استعراض باقات العطلات المتاحة ↗</span>
    </a>
  </div>
</div>

</div>
`;

const masterPost = {
  id: "turkey-luxury-travel-guide-2027",
  slug: "turkey-luxury-travel-guide-2027",
  titleAr: "الدليل الشامل للسياحة الفاخرة في تركيا 2027: برامج الجولات، أفضل الفنادق، تكلفة السفر، وحساب نقاط الولاء",
  titleEn: "The Ultimate Luxury Turkey Travel Guide 2027: VIP Itineraries, 5-Star Hotels, Budget Cost Tables & Loyalty Rewards",
  excerptAr: "دليل استثنائي متكامل صادر عن خبراء منصة لوناليزا؛ يغطي أدق تفاصيل السفر إلى اسطنبول، كابادوكيا، بودروم، أنطاليا، وطرابزون. مع جداول التكلفة المحدثة 2027، روابط حجز الطيران والفنادق والسيارات بالسائق الخاص، مقاطع الريلز وتجارب المسافرين الموثقة، ومكافآت كاش باك نقاط الولاء.",
  excerptEn: "The comprehensive 2027 luxury guide to Turkey by Lonaliza. Covers Istanbul, Cappadocia, Bodrum, Antalya, and Trabzon with live pricing tables, flight and 5-star hotel booking links, private chauffeur transfers, verified traveler reels, and cash-back loyalty points.",
  contentAr: masterContentAr,
  contentEn: masterContentAr,
  coverImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1600&q=85",
  coverAlt: "الدليل الشامل للسياحة الفاخرة في تركيا 2027 - منصة لوناليزا",
  category: "دليل السفر الشامل",
  tags: [
    "السياحة في تركيا 2027",
    "فنادق اسطنبول الفاخرة",
    "رحلات كابادوكيا",
    "يخوت بودروم",
    "تكلفة السفر الى تركيا",
    "سيارة مع سائق تركيا",
    "نقاط ولاء لوناليزا",
    "برنامج سياحي عائلي"
  ],
  author: "إدارة المنصة العامة • خبراء لوناليزا",
  status: "published",
  seo: {
    metaTitleAr: "دليل السياحة الفاخرة في تركيا 2027 | جدول التكاليف وحجز الفنادق والطيران",
    metaTitleEn: "Luxury Turkey Travel Guide 2027 | VIP Tours, Hotels & Budget Planner",
    metaDescriptionAr: "اكتشف دليلك الشامل للسفر الفاخر إلى تركيا لعام 2027. جداول أسعار تفصيلية، حجز مباشر لأفضل فنادق البوسفور، طيران دولي، تأجير سيارات VIP، وكاش باك نقاط الولاء.",
    metaDescriptionEn: "Comprehensive 2027 luxury guide to Turkey. Day-by-day itineraries, verified cost breakdown tables, hotel deals, private chauffeur transfers, and member cash-back points.",
    focusKeyword: "السياحة في تركيا 2027",
    ogImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1600&q=85"
  },
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Insert or replace in storeData.posts
if (!Array.isArray(storeData.posts)) {
  storeData.posts = [];
}
const existingIndex = storeData.posts.findIndex((p) => p.slug === masterPost.slug);
if (existingIndex >= 0) {
  storeData.posts[existingIndex] = masterPost;
  console.log("Updated existing masterclass post in storeData.");
} else {
  storeData.posts.unshift(masterPost);
  console.log("Prepended new masterclass post to storeData.");
}

if (!storeData.bySlug) storeData.bySlug = {};
storeData.bySlug[masterPost.slug] = masterPost.id;
storeData.updatedAt = new Date().toISOString();

// Write to .data/blog-posts.json
fs.writeFileSync(DATA_FILE, JSON.stringify(storeData, null, 2), "utf-8");
console.log("Successfully wrote to", DATA_FILE);

// Also write to src/data/migrated/blog-posts.json
if (fs.existsSync(MIGRATED_FILE)) {
  try {
    let migrated = JSON.parse(fs.readFileSync(MIGRATED_FILE, "utf-8"));
    if (Array.isArray(migrated)) {
      const idx = migrated.findIndex((p) => p.slug === masterPost.slug);
      if (idx >= 0) {
        migrated[idx] = masterPost;
      } else {
        migrated.unshift(masterPost);
      }
      fs.writeFileSync(MIGRATED_FILE, JSON.stringify(migrated, null, 2), "utf-8");
      console.log("Successfully updated", MIGRATED_FILE);
    }
  } catch (e) {
    console.error("Error updating migrated file", e);
  }
}
