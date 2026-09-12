import { packFor } from "@/lib/automation/content/catalog";
import {
  countWords,
  escapeHtml,
  linksForTopic,
  renderLinksHtml,
  whatsappHref,
} from "@/lib/automation/content/internal-links";
import { getGeminiPublicConfig, resolveGeminiApiKey } from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import type {
  ContentLocale,
  ContentPhotoAttribution,
  DiscoveredTopic,
  GeneratedArticle,
} from "@/lib/automation/types";

function monthNameAr(now: Date): string {
  return new Intl.DateTimeFormat("ar", { month: "long" }).format(now);
}

function seasonHint(now: Date): { ar: string; en: string; tr: string } {
  const m = now.getMonth() + 1;
  if (m >= 6 && m <= 8) {
    return {
      ar: "الصيف الحالي مناسب للبحر في أنطاليا وبودروم، بينما إسطنبول تكون أكثر ازدحاماً وحرارة في منتصف النهار.",
      en: "Summer suits Antalya and Bodrum beaches; Istanbul is busier and hotter at midday.",
      tr: "Yaz Antalya ve Bodrum sahilleri için uygundur; İstanbul öğlenleri daha kalabalık ve sıcaktır.",
    };
  }
  if (m >= 9 && m <= 11) {
    return {
      ar: "الخريف يلطّف إسطنبول وكابادوكيا، وتبدأ ألوان طرابزون والجبال بالظهور دون برد قاسٍ في معظم الأيام.",
      en: "Autumn softens Istanbul and Cappadocia, and the Black Sea hills start to color without harsh cold most days.",
      tr: "Sonbahar İstanbul ve Kapadokya’yı yumuşatır; Karadeniz yaylaları çoğu günde sert soğuk olmadan renklenir.",
    };
  }
  if (m === 12 || m <= 2) {
    return {
      ar: "الشتاء يناسب عشّاق الثلج في أولوداغ والمساجد الدافئة في إسطنبول، مع الحاجة لملابس طبقات ومرونة في المواعيد بسبب المطر.",
      en: "Winter suits Uludağ snow and Istanbul’s indoor heritage, with layers and flexible timing for rain.",
      tr: "Kış Uludağ karı ve İstanbul’un kapalı mirası için uygundur; katmanlı giysi ve yağmura esnek plan gerekir.",
    };
  }
  return {
    ar: "الربيع من ألطف نوافذ تركيا: حدائق إسطنبول، بالونات كابادوكيا، وبداية موسم الجنوب قبل الذروة.",
    en: "Spring is one of Turkey’s gentlest windows: Istanbul gardens, Cappadocia balloons, and the south before peak heat.",
    tr: "İlkbahar Türkiye’nin en yumuşak pencerelerinden: İstanbul bahçeleri, Kapadokya balonları, güney sezonu zirveden önce.",
  };
}

function destName(topic: DiscoveredTopic): { ar: string; en: string; tr: string } {
  const pack = packFor(topic.destination);
  if (topic.destination === "visa") {
    return { ar: "تركيا (التأشيرة)", en: "Turkey (visa)", tr: "Türkiye (vize)" };
  }
  if (topic.destination === "season" || topic.destination === "events") {
    return { ar: "تركيا", en: "Turkey", tr: "Türkiye" };
  }
  return {
    ar: pack?.nameAr || "تركيا",
    en: pack?.nameEn || "Turkey",
    tr: pack?.nameTr || "Türkiye",
  };
}

function newsContext(topic: DiscoveredTopic): string {
  if (!topic.sourceTitles.length) {
    return "نعتمد في هذا الدليل على معرفة تشغيلية لبرامج الريان وعلى عناوين عامة من مصادر سياحية رسمية وإخبارية، ثم نعيد صياغتها كدليل عملي مستقل — دون نسخ مقالات الآخرين.";
  }
  const titles = topic.sourceTitles
    .slice(0, 3)
    .map((t) => escapeHtml(t))
    .join("؛ ");
  return `ظهرت مؤخراً عناوين متداولة حول السفر إلى تركيا (${titles}). نستخدم هذه الإشارات فقط لفهم الاهتمام الحالي، ثم نكتب دليلاً أصلياً يناسب مسافر الريان: برنامج، فندق، طيران، وتواصل واضح.`;
}

function bodyForDestination(topic: DiscoveredTopic, now: Date): {
  ar: string[];
  en: string[];
} {
  const d = destName(topic);
  const season = seasonHint(now);
  const month = monthNameAr(now);
  const news = newsContext(topic);

  const sharedAr = [
    `<p>${news} نكتب من منظور وكالة تنظّم برامج متعددة الأيام في تركيا، لا من منظور إعادة نشر خبر.</p>`,
    `<p>في ${month} يسأل المسافر العربي عادةً ثلاثة أسئلة قبل الحجز: هل التوقيت مناسب؟ هل البرنامج ثقيل على الأطفال أو كبار السن؟ وهل يمكن ربط ${d.ar} بمدينة ثانية دون إضاعة يوم كامل في التنقل؟ هذا الدليل يجيب عليها بالتفصيل.</p>`,
    `<p>${season.ar} هذا لا يعني أن أي شهر «خطأ»؛ يعني أنك تضبط الإيقاع: مشي أقل في الحر، طبقة إضافية في الجبل، وحجز مسبق للمنطاد أو المطاعم المطلة عندما يكون الموسم مزدحماً.</p>`,
  ];

  const destAr: Record<string, string[]> = {
    istanbul: [
      `<h2>لماذا تبقى إسطنبول أول محطة لمعظم برامج الريان</h2>`,
      `<p>إسطنبول ليست مدينة معلم واحد. السلطان أحمد يعطيك آيا صوفيا والمسجد الأزرق والخزان الأرضي في دائرة مشي قصيرة، لكن اليوم الثاني ينقلك إلى غلطة والبوسفور، واليوم الثالث إلى الجانب الآسيوي أو سوق التوابل. المسافر الذي يضغط كل شيء في 48 ساعة يخرج متعباً ويتذكّر الزحام أكثر مما يتذكّر المكان.</p>`,
      `<p>لذلك نفضّل برنامجاً من أربعة إلى ستة أيام لمعظم العائلات: يوم تراث، يوم بوسفور، يوم حر أو تسوق، ويوم اختياري لبورصة أو سبانجا إن بقي فائض طاقة. الفندق في السلطان أحمد يوفّر المشي الصباحي؛ شيشلي أو تقسيم تسهّل المطاعم والتنقل المسائي. لا يوجد خيار واحد صحيح — يوجد خيار يناسب نوم أطفالك وموعد طيرانك.</p>`,
      `<h2>كيف تقسّم الأيام دون إرهاق</h2>`,
      `<h3>اليوم الأول: وصول هادئ لا سباق معالم</h3>`,
      `<p>بعد الهبوط، الترانسفير الخاص يختصر ساعة ضائعة في التاكسي العشوائي. إن وصلتم قبل الظهر يمكن المشي حول المسجد الأزرق فقط، ثم الراحة. إن وصلتم مساءً اكتفوا بعشاء قريب من الفندق. الإصرار على «رؤية كل شيء من أول ليلة» يفسد اليوم التالي.</p>`,
      `<h3>اليوم الثاني: السلطان أحمد بترتيب منطقي</h3>`,
      `<p>ابدأ مبكراً بآيا صوفيا أو الخزان حسب مواعيد التذاكر المعلنة في حينها، ثم المسجد الأزرق من الخارج والساحة، ثم قصر طوب كابي إن كانت الطاقة تسمح. الغداء في المنطقة جيد إذا حجزتم أو اخترتم مكاناً جانبياً بعيداً عن الصف الأول السياحي. بعد العصر اتركوا السوق الكبير لليوم الثالث إن كان معكم أطفال.</p>`,
      `<h3>يوم البوسفور والجانب الحديث</h3>`,
      `<p>رحلة البوسفور صباحاً أو عصراً تعطي المدينة معناها الجغرافي: قارتان ومضيق وحياة موانئ. بعدها برج غلطة أو استقلالية حسب الزحام. المساء في كراكوي أو جيهانكير أهدأ من تقسيم في عطلة نهاية الأسبوع.</p>`,
      `<h2>الفنادق والطيران من منظور عملي</h2>`,
      `<p>لا نثبت في هذا المقال أسعاراً لحظة بلحظة؛ أسعار الطيران والغرف تتغير يومياً. ما نثبته هو الأسلوب: طيران يصل قبل العصر إن أمكن حتى لا يضيع أول يوم، وفندق بدرجة واضحة (4 أو 5 نجوم) قريب من محطة مترو أو من منطقة المشاة. الريان يرتّب الاستقبال والمواصلات الداخلية ضمن البرنامج حتى لا تديروا ثلاثة تطبيقات في مدينة لا تعرفونها.</p>`,
      `<p>إن كان معكم كبار سن، تجنّبوا فنادق التلال الضيقة في بعض أزقة السلطان أحمد ما لم يكن هناك مصعد مؤكد وخطة سيارة لكل تنقّل. العائلات الكبيرة تستفيد من غرف متصلة أو جناح، لا من ثلاث غرف مبعثرة في طوابق مختلفة.</p>`,
    ],
    antalya: [
      `<h2>أنطاليا: بحر المتوسط حين تريد الراحة لا سباق المتاحف</h2>`,
      `<p>أنطاليا تناسب من يريد صباحاً على الشاطئ ومساءً هادئاً، مع يوم أو يومين للبلدة القديمة كاليتشي أو شلال دودان. البرنامج الذي يملأ كل يوم بجولة بعيدة يحوّل المصيف إلى جدول مدرسي. اتركوا يومين كاملين للفندق إن سافرتم مع أطفال.</p>`,
      `<p>اختيار المنطقة أهم من عدد النجوم وحده: لارا وبيليك تسهّلان الشاطئ الرملي والمنتجعات العائلية؛ كمر أقرب للجبل والبحر معاً؛ كاليشي أجمل للمشي وأصعب لعربات الأطفال. حدّدوا أولويتكم قبل أن تسألوا عن السعر.</p>`,
      `<h2>إيقاع أيام مقترح</h2>`,
      `<p>يوم وصول واستقرار، يوم شاطئ، يوم كاليتشي والميناء، يوم اختياري لمدينة سايد أو ترمسوس حسب الموسم والحر، ثم يوم حر قبل المغادرة. في ذروة الصيف اجعلوا الجولات في الصباح الباكر أو بعد العصر، واتركوا الظهيرة للفندق والمسبح.</p>`,
      `<h2>الطيران والفنادق</h2>`,
      `<p>مطار أنطاليا قريب نسبياً من معظم المنتجعات مقارنة بمسافات كابادوكيا الجبلية. مع ذلك الترانسفير المنظم أفضل من التفاوض عند الباب بعد رحلة ليلية. اسألوا عن بُعد الغرفة عن الملاهي إن كان نوم الأطفال أولوية، وعن وجود شاطئ خاص أو نقل شاطئ.</p>`,
    ],
    trabzon: [
      `<h2>طرابزون والطبيعة: لماذا يحجزها المسافر الخليجي بكثافة</h2>`,
      `<p>طرابزون ليست امتداداً لإسطنبول. الطرق لولبية، والطقس يتبدّل بين ضباب ومطر وشمس في اليوم الواحد، والمشهد هو بحيرات وهضاب لا مساجد عثمانية كبرى. من يأتي وهو يتوقع «إسطنبول ثانية» يصاب بخيبة؛ من يأتي وهو يريد هواءً وماءً وخضرة يخرج راضياً.</p>`,
      `<p>أوزونغول أشهر صورة، لكنها ليست اليوم الوحيد. آيدر وريزه والهضاب تضيف تنوعاً إن امتد البرنامج إلى خمسة أو ستة أيام. القيادة الذاتية على منعطفات الجبل مرهقة للزائر الجديد؛ سيارة خاصة مع سائق يعرف الطريق تختصر التوتر خاصة مع الأطفال.</p>`,
      `<h2>توزيع الأيام</h2>`,
      `<p>يوم وصول ومشي خفيف في المدينة أو الساحل، يوم أوزونغول بوتيرة هادئة مع توقفات للشاي والصورة، يوم آيدر أو ريزه حسب الطقس، يوم حر للمطر أو للراحة، ثم مغادرة. لا تحشروا ثلاث هضاب في يوم واحد؛ الضباب قد يلغي المشهد الذي سافرتم من أجله.</p>`,
      `<h2>الفندق والملابس</h2>`,
      `<p>الفندق المطل على البحيرة جميل في الصباح، لكنه قد يكون أبرد وأبعد عن الخدمات مساءً. بعض العائلات تفضّل الإقامة في طرابزون المدينة والتنقل نهاراً. أحضروا طبقات، حذاءً يمنع الانزلاق، وموقفاً مرناً تجاه المطر. الطيران إلى طرابزون مباشر في مواسم معيّنة؛ في غيرها يمر عبر إسطنبول — وهذا يفتح باب برنامج مركّب إن رغبتم.</p>`,
    ],
    cappadocia: [
      `<h2>كابادوكيا: المنطاد ليس كل الرحلة، لكنه يحتاج قراراً مبكراً</h2>`,
      `<p>المنطاد يعتمد على الطقس، وقد يُلغى في الصباح نفسه. لذلك لا تبنوا كامل معنى الرحلة على رحلة واحدة. وديان غوريم، ومتحف الهواء الطلق، ومدينة تحت الأرض، وخيول أو دراجات في بعض المسارات — هذه هي الرحلة حتى لو نام المنطاد يوماً.</p>`,
      `<p>الإقامة في كهف فندقي تجربة بصرية، لكن تأكدوا من التهوية والمصعد وصعوبة الدرج إن كان معكم كبار سن. جوريم وأوشيسار وأفانيوس لكل منها طابع: القرب من نقاط الانطلاق، أو الهدوء، أو الإطلالة.</p>`,
      `<h2>ربط إسطنبول وكابادوكيا</h2>`,
      `<p>الطيران الداخلي يوفّر يوماً ضائعاً على الطريق البري. برنامج سبعة أو ثمانية أيام (إسطنبول ثم كابادوكيا) هو الأكثر اتزاناً للأزواج والعائلات التي تريد تراثاً ثم مشهداً جيولوجياً. لا تحاولوا ضغط المدينتين في أربعة أيام إلا إذا قبلتم برنامجاً سريعاً.</p>`,
      `<h2>الصباح الباكر</h2>`,
      `<p>إن تأكد المنطاد فالاستعداد قبل الفجر جزء من التجربة. نظّموا نوم الليلة السابقة، واتركوا اليوم نفسه خفيفاً بعدها. إن ألغي، حوّلوا الصباح إلى وادي عند الشروق — غالباً أجمل مما تتوقعون بعد خيبة الإلغاء.</p>`,
    ],
    bursa: [
      `<h2>بورصة وأولوداغ: أقرب نفس جبلي لإسطنبول</h2>`,
      `<p>بورصة تُزار في يوم طويل أو ليلتين. التاريخ العثماني المبكر في المركز، والحمامات، وأولوداغ للثلج أو الهواء حسب الشهر. من إسطنبول العبّارة ثم الطريق منظّمة ضمن برنامج الريان أفضل من اكتشاف المحطات وحدكم في أول زيارة.</p>`,
      `<p>في الشتاء افحصوا حالة الطريق والملابس. في الربيع والخريف يكفي يوم تراث ونصف يوم جبل أو تلفريك إن كان التشغيل معلناً. لا تخلطوا بورصة مع سبانجا في اليوم نفسه إلا إذا قبلتم ساعات طريق أطول من ساعات المشهد.</p>`,
    ],
    sapanca: [
      `<h2>سبانجا ومعشوقية: يوم طبيعة دون الابتعاد كثيراً عن إسطنبول</h2>`,
      `<p>سبانجا بحيرة وطرق ريفية وشلالات قريبة. تناسب عائلات تريد خضرة بعد يومين في السلطان أحمد. البرنامج القصير (ثلاث أو أربع ليالٍ إسطنبول + يوم سبانجا) من أكثر الطلبات تكراراً لدينا لأنه يوازن المدينة والهدوء.</p>`,
      `<p>احجزوا الغداء مسبقاً في المواسم، واتركوا وقتاً للعودة قبل زحام المساء. إن أمطرت، الشلالات تبقى تستحق والتقاط الصور من السيارة إلى الموقف لا يحتاج يوماً مشمساً مثالياً.</p>`,
    ],
    bodrum: [
      `<h2>بودروم: بحر إيجة بإيقاع أهدأ من أنطاليا العائلية أحياناً</h2>`,
      `<p>بودروم قلعة وميناء وأحياء للمساء. المنتجعات حول المدينة تختلف: بعضها عائلي هادئ وبعضها أقرب للحياة الليلية. حدّدوا الحي قبل الفندق. يوم للقلعة والمارينا، ويومان بحر، ويوم اختياري لأفسس إن امتد البرنامج نحو إزمير — أفضل من حشر كل الساحل في تنقّل يومي.</p>`,
    ],
    izmir: [
      `<h2>إزمير وأفسس: ثقافة إيجة دون أن تكون الرحلة متحفاً فقط</h2>`,
      `<p>إزمير مدينة معيشة أكثر من مدينة بطاقة بريدية واحدة. أفسس تحتاج صباحاً مبكراً وقبعة وماء، ثم عودة للساحل أو تشيشمي إن كان البرنامج شاطئاً وثقافة. أربعة إلى خمسة أيام تكفي لمعظم الزوار الذين لا يريدون إكمال الساحل كله.</p>`,
    ],
    visa: [
      `<h2>التأشيرة قبل الحجز لا بعده</h2>`,
      `<p>قواعد الدخول إلى تركيا تتغير حسب الجنسية والإقامات والاستثناءات الموسمية. لا تعتمدوا على تدوينة قديمة ولا على ما فعله قريبكم العام الماضي دون تحقق. راجعوا المصدر الرسمي لبلدكم ولتركيا قبل دفع تذاكر غير قابلة للاسترداد.</p>`,
      `<p>ما يمكن للريان أن يفعله: ترتيب البرنامج والفنادق والاستقبال بعد أن تتضح أهليتكم للدخول. ما لا نفعله في مقال عام: إصدار حكم نهائي باسمكم. أرسلوا عبر واتساب جنسيتكم وتاريخ السفر وسنوجّهكم إلى المسار الصحيح أو إلى مكتب مختص عند الحاجة.</p>`,
      `<h2>ربط التأشيرة بالبرنامج</h2>`,
      `<p>احجزوا بمرونة حتى صدور الموافقة إن كانت حالتكم تتطلب ذلك. المسافرون الذين يدخلون وفق الأنظمة المعلنة لجوازاتهم يمكنهم تثبيت الطيران والبرنامج معاً. لا تخترعوا مواعيد؛ اطلبوا من الفريق نسخة الشروط الحالية لا لقطة شاشة من مجموعة واتساب.</p>`,
    ],
    season: [
      `<h2>كيف تختار الموسم حسب هدف الرحلة لا حسب الإعلان</h2>`,
      `<p>البحر = أواخر الربيع إلى أوائل الخريف على المتوسط وإيجة. الهضاب والبحيرات = أواخر الربيع إلى الخريف على البحر الأسود مع احتمال مطر. التراث المدني في إسطنبول يعمل طوال العام مع اختلاف الزحام. الثلج = شتاء أولوداغ وفق تشغيل المنشآت.</p>`,
      `<p>${season.ar} اسألوا أنفسكم: هل الأولوية سباحة، أم صور بالون، أم مشي في مدينة، أم هروب من الحر في الخليج؟ الإجابة تختار المدينة قبل أن تختار الفندق.</p>`,
    ],
    events: [
      `<h2>المواسم والمناسبات: احجزوا السكن مبكراً واتركوا البرنامج مرناً</h2>`,
      `<p>عندما يرتفع الاهتمام بحدث أو عطلة في تركيا ترتفع الأسعار ويضيق الاختيار في الأحياء المركزية. الحل ليس إلغاء الرحلة؛ الحل تثبيت الفندق والترانسفير مبكراً، وجعل يوم الحدث اختيارياً لا عموداً يهدم الجدول إن تغيّر الموعد.</p>`,
    ],
    turkey: [
      `<h2>تركيا بأكثر من مدينة واحدة</h2>`,
      `<p>معظم مسافري الريان لا يريدون «كل تركيا» في أسبوع. يريدون مدينتين بحد أقصى وإيقاعاً يمكن النوم فيه. إسطنبول + كابادوكيا، أو إسطنبول + طرابزون، أو أنطاليا وحدها للعائلات — هذه أنماط أثبتت أنها أقل إرهاقاً من سلسلة تنقّلات يومية.</p>`,
    ],
  };

  const destKey =
    topic.destination in destAr ? topic.destination : "turkey";
  const extraAr = destAr[destKey] || destAr.turkey;

  const practicalAr = [
    `<h2>نصائح عملية من غرفة العمليات لا من دليل سياحي منسوخ</h2>`,
    `<p>احملوا نسخة رقمية من الحجوزات والجوازات، وشاركا الفريق رقم الرحلة قبل 48 ساعة إن تغيّر. في تركيا الدفع بالبطاقات شائع في المدن، والنقد مفيد في القرى والهضاب. الكهرباء والماء في الفنادق المختارة ضمن برامجنا بمستوى يليق بعائلة خليجية؛ خارج ذلك افحصوا التقييمات الحديثة لا الصور الدعائية فقط.</p>`,
    `<p>الاتصال: احصلوا على بيانات التجوال أو شريحة محلية إن كنتم ستتنقلون كثيراً. واتساب يكفي للتنسيق معنا. لا تشاركوا تفاصيل جوازكم في مجموعات عامة. إن ضاع جواز، التوجه لقنصليتكم أولاً ثم إبلاغنا لتعديل التنقل لا العكس.</p>`,
    `<p>الصحة: مشايات السلطان أحمد وكابادوكيا وأفسس تتطلّب حذاءً مريحاً. أدوية الأطفال المعتادة في الحقيبة اليدوية أهم من شراء كل شيء بعد الوصول. احترموا قواعد اللباس عند دخول المساجد، واسألوا قبل التصوير في الأسواق الصغيرة.</p>`,
    `<h2>أسئلة يتكرر طرحها على مستشاري الريان</h2>`,
    `<h3>كم يوماً يكفي ${escapeHtml(d.ar)}؟</h3>`,
    `<p>للزيارة الأولى: إسطنبول 4–6، أنطاليا 5–7 إن كان البحر أساسياً، كابادوكيا 3–4 بعد الوصول، طرابزون 4–6. أقل من ذلك ممكن لكنه يسرّع الإيقاع. أكثر من ذلك ممتاز إن دمجتم مدينة ثانية بيوم انتقال واضح لا ليلي مُرهق.</p>`,
    `<h3>هل نحتاج مرشداً عربياً في كل يوم؟</h3>`,
    `<p>في أيام التراث الكثيفة نعم يوفّر وقتاً ويمنع الطوابير الخاطئة. في يوم الشاطئ أو اليوم الحر غالباً لا. نكتب ذلك في البرنامج حتى لا تدفعوا لخدمة لا تستخدمونها.</p>`,
    `<h3>هل الأسعار في هذا المقال نهائية؟</h3>`,
    `<p>لا. المقال دليل تخطيط. السعر النهائي يظهر بعد تاريخ السفر وعدد الغرف ودرجة الفندق ووجود طيران داخلي. اطلبوا عرضاً عبر واتساب على نفس التواريخ.</p>`,
    `<h3>هل يمكن تعديل البرنامج بعد الوصول؟</h3>`,
    `<p>نعم في حدود السائق والمرشد والحجوزات المسبقة (منطاد، مطاعم، تذاكر). كلّما كان التغيير مبكراً كان أسهل. يوم المطر في طرابزون مثال كلاسيكي نعيد ترتيبه دون إعادة اختراع الرحلة.</p>`,
  ];

  const ar = [...sharedAr, ...extraAr, ...practicalAr];

  const en = [
    `<p>${escapeHtml(season.en)} This guide is original planning copy for Alrayyan guests — not a republished news article.</p>`,
    `<h2>How we plan ${escapeHtml(d.en)}</h2>`,
    `<p>We pace days so families sleep, eat, and still see the places that matter. Internal flights or a private car beat improvised taxis on a first visit. Hotel area matters as much as star rating.</p>`,
    `<h2>Flights and stays</h2>`,
    `<p>We do not quote live ticket prices here. Share dates on WhatsApp for a real outline: hotel class, transfers, and whether a second city fits without burning a day on the road.</p>`,
    `<h2>FAQ</h2>`,
    `<h3>How many days?</h3>`,
    `<p>Istanbul 4–6, Antalya 5–7, Cappadocia 3–4 after you arrive, Trabzon 4–6. Combos need a clear transfer day.</p>`,
    `<h3>Do we need a guide every day?</h3>`,
    `<p>On dense heritage days, yes. On a beach or rest day, usually no.</p>`,
  ];

  return { ar, en };
}

function ctaBlock(topic: DiscoveredTopic, links: ReturnType<typeof linksForTopic>): {
  ar: string;
  en: string;
} {
  const wa = whatsappHref(topic.titleAr || topic.titleEn);
  return {
    ar: `<h2>احجزوا إيقاعاً واضحاً لا قائمة أمنيات</h2>
<p>إن ناسبكم هذا الإطار، راسلوا فريق الريان على واتساب وسنحوّله إلى برنامج بتواريخكم: فندق، استقبال، وجولات بالسعة التي تحتملونها لا التي تبدو طويلة على الورق.</p>
<p><a href="${wa}">تواصل واتساب مع الريان للسياحة</a></p>
<h3>برامج ذات صلة على الموقع</h3>
${renderLinksHtml(links, "ar")}`,
    en: `<h2>Turn this outline into dates</h2>
<p>Message Alrayyan on WhatsApp with your dates. We will map hotels, airport pickup, and a pace that fits your group.</p>
<p><a href="${wa}">WhatsApp Alrayyan Tourism</a></p>
<h3>Related programs</h3>
${renderLinksHtml(links, "en")}`,
  };
}

function slugFromTopic(topic: DiscoveredTopic): string {
  const base = (topic.queryEn || topic.titleEn || topic.id)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
  return base || `turkey-${topic.destination}`;
}

function padArabicToMin(html: string, minWords: number, destAr: string): string {
  const extras = [
    `<p>قبل تثبيت التواريخ اكتبوا على ورقة واحدة: عدد الليالي، عدد الغرف، وهل يوجد كبار سن يحتاجون مصعداً وسيارة باب إلى باب. هذه الورقة تختصر نصف الأسئلة في أول محادثة واتساب، وتمنع عرضاً جميلاً على الشاشة لا يناسب واقع العائلة في ${escapeHtml(destAr)}.</p>`,
    `<p>نحن لا نعدكم بأن كل مطعم في الدليل سيكون فارغاً، ولا بأن كل تذكرة متحف بلا طابور. نعدكم بترتيب واضح: من يصل أولاً، أين الاستراحة، ومتى نلغي جولة إن ساء الطقس. هذا الفرق بين مقال منسوخ وبرنامج يُدار.</p>`,
    `<p>إن كان ميزانيتكم مرنة في الفندق وضيّقة في التنقّل، أخبرونا؛ أحياناً غرفة أفضل مع سيارة أقل أيام تُتعب أقل من فندق بعيد وثلاث جولات طويلة. العكس صحيح للعائلات التي تبقى في المنتجع ولا تريد سيارة يومياً.</p>`,
    `<p>الطيران الداخلي بين إسطنبول وكابادوكيا أو طرابزون يوفّر يوماً على الطريق، لكنه يضيف حقيبة ووقتاً في المطار. لا نقرّره نيابة عنكم في المقال؛ نعرضه كخيار عندما تكون الليالي كافية ولا يكون الهبوط ليلاً ثم إقلاع فجراً.</p>`,
    `<p>آخر تذكير: أي رقم سعر تقرؤونه في مجموعات السفر هو لشخص آخر في تاريخ آخر. اطلبوا عرض الريان على تواريخكم. المقال يبقى دليل تخطيط أصلي، والحجز يبقى محادثة بشرية بعد رؤية الجوازات وعدد الأطفال ودرجة الفندق المطلوبة.</p>`,
    `<p>إن سافرتم من الرياض أو جدة أو الدوحة أو الكويت أو أبوظبي، فكّروا في يوم الوصول كيوم استرداد لا كيوم إنجاز. النوم الجيد في الليلة الأولى يحوّل اليوم التالي من سباق إلى زيارة. هذه قاعدة نكررها لأن تجاهلها يكلّف نصف تقييم الرحلة في اليوم الثاني فقط.</p>`,
  ];
  let out = html;
  let i = 0;
  while (countWords(out) < minWords && i < 48) {
    out += `\n${extras[i % extras.length]}`;
    i += 1;
  }
  return out;
}

function excerptFrom(html: string, max = 180): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length <= max ? text : `${text.slice(0, max).trim()}…`;
}

function categoryFor(topic: DiscoveredTopic): string {
  switch (topic.destination) {
    case "visa":
      return "Visa Guide";
    case "season":
    case "events":
      return "Travel Tips";
    case "istanbul":
    case "antalya":
    case "trabzon":
    case "cappadocia":
    case "bursa":
    case "sapanca":
    case "bodrum":
    case "izmir":
    case "turkey":
      return "Destination Guides";
    default: {
      const _never: never = topic.destination;
      return _never;
    }
  }
}

async function tryGeminiArticle(input: {
  topic: DiscoveredTopic;
  minWords: number;
  locales: ContentLocale[];
  links: ReturnType<typeof linksForTopic>;
}): Promise<{ contentAr: string; contentEn: string } | null> {
  if (process.env.VITEST || process.env.CONTENT_SKIP_GEMINI === "1") return null;
  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) return null;
  const config = await getGeminiPublicConfig();
  const model = normalizeGeminiModelId(config.model);
  const prompt = `اكتب مقالاً أصلياً طويلاً بالعربية (حد أدنى ${input.minWords} كلمة ظاهرة) عن: ${input.topic.titleAr}.
قواعد: لا تنسخ مقالات منشورة. حقائق عامة فقط. HTML مع h2/h3 وfaq. اربط داخلياً بهذه المسارات: ${input.links.map((l) => l.href).join(", ")}.
أضف فقرة CTA لواتساب. ${input.locales.includes("en") ? "ثم نسخة إنجليزية أقصر." : "الإنجليزية ملخص قصير."}
أعد JSON: {"contentAr":"...","contentEn":"..."} فقط.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      }
    );
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
      "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as {
      contentAr?: string;
      contentEn?: string;
    };
    if (!parsed.contentAr || countWords(parsed.contentAr) < input.minWords) {
      return null;
    }
    return {
      contentAr: parsed.contentAr,
      contentEn: parsed.contentEn || "",
    };
  } catch {
    return null;
  }
}

export async function writeOriginalArticle(input: {
  topic: DiscoveredTopic;
  locales: ContentLocale[];
  minWords: number;
  now: Date;
  photos: ContentPhotoAttribution[];
  ogImage: string;
}): Promise<GeneratedArticle> {
  const links = linksForTopic(input.topic);
  const d = destName(input.topic);
  const sections = bodyForDestination(input.topic, input.now);
  const cta = ctaBlock(input.topic, links);
  const photoHtml = input.photos
    .slice(0, 2)
    .map((photo) => {
      const src = photo.localUrl || photo.url;
      const credit = photo.authorName
        ? `<p class="text-sm opacity-70">الصورة: ${escapeHtml(photo.authorName)}${photo.license ? ` · ${escapeHtml(photo.license)}` : ""}</p>`
        : "";
      return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(photo.alt)}" />${credit}</figure>`;
    })
    .join("");

  let contentAr = `${sections.ar.join("\n")}\n${photoHtml}\n${cta.ar}`;
  let contentEn = `${sections.en.join("\n")}\n${cta.en}`;

  const gemini = await tryGeminiArticle({
    topic: input.topic,
    minWords: input.minWords,
    locales: input.locales,
    links,
  });
  if (gemini) {
    contentAr = `${gemini.contentAr}\n${photoHtml}\n${cta.ar}`;
    contentEn = gemini.contentEn || contentEn;
  }

  contentAr = padArabicToMin(contentAr, input.minWords, d.ar);

  const titleAr = input.topic.titleAr;
  const titleEn = input.topic.titleEn;
  const slug = slugFromTopic(input.topic);
  const cover = input.photos[0] || {
    provider: "brand" as const,
    url: input.ogImage,
    authorName: "Alrayyan Tourism",
    alt: titleAr,
  };

  return {
    slug,
    titleAr,
    titleEn,
    titleTr: input.locales.includes("tr") ? input.topic.titleTr : undefined,
    excerptAr: excerptFrom(contentAr),
    excerptEn: excerptFrom(contentEn || contentAr),
    contentAr,
    contentEn: input.locales.includes("en") || input.locales.includes("tr")
      ? contentEn
      : contentEn,
    category: categoryFor(input.topic),
    tags: [d.en, input.topic.angle, "Turkey", "Alrayyan"].filter(Boolean),
    cover,
    photos: input.photos,
    ogImage: input.ogImage || cover.localUrl || cover.url,
    wordCountAr: countWords(contentAr),
    locales: input.locales,
    internalLinks: links,
  };
}
