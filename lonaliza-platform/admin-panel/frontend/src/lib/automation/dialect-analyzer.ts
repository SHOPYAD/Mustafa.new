export type DetectedDialect = {
  region: "morocco" | "gulf" | "egypt" | "levant" | "standard_ar" | "english" | "turkish" | "french";
  regionNameAr: string;
  dialectGuidelinesAr: string;
  samplePhrasesAr: string;
  isCasualPersonalVibe: boolean;
};

const MOROCCAN_KEYWORDS = [
  "شنو",
  "واش",
  "مزيان",
  "كيداير",
  "كيبقيتي",
  "ديال",
  "ديالي",
  "فالدار",
  "بزاف",
  "دابا",
  "صافي",
  "حبيبتي",
  "حبيبي",
  "عفاك",
  "واخا",
  "زوين",
  "غادي",
  "فينك",
];

const GULF_KEYWORDS = [
  "شلونك",
  "شخبارك",
  "ايش",
  "وش",
  "ابشر",
  "هلا والله",
  "يا هلا",
  "عساك بخير",
  "طال عمرك",
  "تكفى",
  "ودي",
  "تسلم",
];

const EGYPTIAN_KEYWORDS = [
  "ازيك",
  "عامل ايه",
  "عايز",
  "فين",
  "كده",
  "ايه الأخبار",
  "يا فندم",
  "تمام يا باشا",
  "دلوقتي",
  "النهاردة",
];

const LEVANT_KEYWORDS = [
  "شلونك",
  "كيفك",
  "شو الأخبار",
  "بدي",
  "عم احكي",
  "هيك",
  "تكرم",
  "يسلمو",
];

const CASUAL_PERSONAL_PHRASES = [
  "حبيبتي كيبقيتي",
  "حبيبي",
  "وانت شنو كدير",
  "شنو كدير",
  "راني فالدار",
  "صافي تفاهمنا",
  "نتلاقاو",
  "ههههه",
  "ههههههه",
  "صباح الورد حبيبي",
  "تصبح على خير",
  "كيبقيتي كلشي مزيان",
];

export function analyzeClientDialectAndTone(
  phone: string,
  messageText: string
): DetectedDialect {
  const digits = phone.replace(/\D/g, "");
  const lowerMsg = messageText.toLowerCase();

  // Check if it's a casual personal message
  const isCasualPersonalVibe = CASUAL_PERSONAL_PHRASES.some((phrase) =>
    lowerMsg.includes(phrase)
  );

  // 1. Check message words first for strong regional dialect markers
  if (MOROCCAN_KEYWORDS.some((kw) => lowerMsg.includes(kw))) {
    return {
      region: "morocco",
      regionNameAr: "المغرب العربي (الدارجة المغربية الراقية والودية)",
      dialectGuidelinesAr:
        "تحدث بأسلوب مغربي راقٍ ودافئ (دارجة مغربية مهذبة مع لمسة فصحى بسيطة وودودة مثل: 'أهلاً بيك أ خويا / أختي العزيزة 🌸'، 'مرحبا بيك في لوناليزا'، 'على الراس والعين'، 'كيف نقدر نعاونك؟'). اجعل الرد قصيراً وخفيفاً جداً وبدون أي تكلف أو إطالة.",
      samplePhrasesAr: "مرحبا بيك أ خويا / أختي العزيزة 🌸، نهارك مبروك، كيف نقدر نعاونك اليوم؟",
      isCasualPersonalVibe,
    };
  }

  if (GULF_KEYWORDS.some((kw) => lowerMsg.includes(kw))) {
    return {
      region: "gulf",
      regionNameAr: "الخليج العربي (السعودية، الإمارات، الكويت، قطر، عمان، البحرين)",
      dialectGuidelinesAr:
        "تحدث بلهجة خليجية راقية ومرحبة جداً (مثل: 'يا هلا ومسهلا والله 🌸'، 'حياك الله أستاذنا العزيز'، 'أبشر بعزك'، 'يسعدنا نخدمك ونرتب لك اللي يسرك'). رد بأسلوب راقٍ ومختصر.",
      samplePhrasesAr: "يا هلا ومسهلا والله 🌸، حياك الله، وش في خاطرك لرحلتك القادمة؟",
      isCasualPersonalVibe,
    };
  }

  if (EGYPTIAN_KEYWORDS.some((kw) => lowerMsg.includes(kw))) {
    return {
      region: "egypt",
      regionNameAr: "مصر",
      dialectGuidelinesAr:
        "تحدث بأسلوب مصري راقٍ وودود ومحترم (مثل: 'أهلاً وسهلاً بحضرتك يا فندم 🌸'، 'منورنا والله وتحت أمرك في أي وقت'). رد باختصار وإيجاز محبب.",
      samplePhrasesAr: "أهلاً بحضرتك يا فندم 🌸، نورتنا، إيه الاستفسار اللي تحب نساعدك فيه؟",
      isCasualPersonalVibe,
    };
  }

  if (LEVANT_KEYWORDS.some((kw) => lowerMsg.includes(kw))) {
    return {
      region: "levant",
      regionNameAr: "بلاد الشام (الأردن، لبنان، سوريا، فلسطين)",
      dialectGuidelinesAr:
        "تحدث بأسلوب شامي لطيف وودود (مثل: 'أهلاً وسهلاً بحضرتك 🌸'، 'تكرم عينك، كيف بنقدر نساعدك اليوم؟').",
      samplePhrasesAr: "أهلاً وسهلاً بحضرتك 🌸، تكرم عينك، شو الوجهة أو البرنامج اللي حابب تسأل عنه؟",
      isCasualPersonalVibe,
    };
  }

  // 2. Fall back to Phone Country Code if message is short or ambiguous
  if (digits.startsWith("212")) {
    return {
      region: "morocco",
      regionNameAr: "المغرب العربي (+212)",
      dialectGuidelinesAr:
        "العميل يتواصل من رقم مغربي (+212). تحدث معه بأسلوب مغربي دافئ ومحبب ومختصر (دارجة مغربية راقية).",
      samplePhrasesAr: "أهلاً بيك أ خويا / أختي العزيزة 🌸، مرحبا بيك، كيف نقدر نعاونك؟",
      isCasualPersonalVibe,
    };
  }

  if (
    digits.startsWith("966") ||
    digits.startsWith("971") ||
    digits.startsWith("965") ||
    digits.startsWith("974") ||
    digits.startsWith("968") ||
    digits.startsWith("973")
  ) {
    return {
      region: "gulf",
      regionNameAr: "الخليج العربي",
      dialectGuidelinesAr:
        "العميل يتواصل من رقم خليجي. استخدم لهجة خليجية راقية ومرحبة ومختصرة ('يا هلا وغلا 🌸'، 'حياك الله أستاذنا').",
      samplePhrasesAr: "يا هلا والله ومسهلا 🌸، حياك الله، كيف نقدر نخدمك اليوم؟",
      isCasualPersonalVibe,
    };
  }

  if (digits.startsWith("20")) {
    return {
      region: "egypt",
      regionNameAr: "مصر (+20)",
      dialectGuidelinesAr:
        "العميل يتواصل من رقم مصري (+20). تحدث بلهجة مصرية راقية ومحترمة ومختصرة.",
      samplePhrasesAr: "أهلاً بحضرتك يا فندم 🌸، تحت أمرك، إزاي نقدر نساعدك؟",
      isCasualPersonalVibe,
    };
  }

  if (digits.startsWith("90")) {
    return {
      region: "turkish",
      regionNameAr: "تركيا (+90)",
      dialectGuidelinesAr:
        "إذا كان الكلام بالتركي رد بالتركي الودود. إذا كان بالعربي رد بعربي فصيح مبسط وودود جداً.",
      samplePhrasesAr: "أهلاً بك معنا في لوناليزا 🌸 / Merhaba, size nasıl yardımcı olabiliriz?",
      isCasualPersonalVibe,
    };
  }

  // 3. Default: Modern Standard Warm Arabic
  return {
    region: "standard_ar",
    regionNameAr: "عربي فصيح دافئ ومبسط",
    dialectGuidelinesAr:
      "تحدث باللغة العربية الفصحى البسيطة الدافئة والموجزة جداً مع إيموجي لطيف وبدون تكلف.",
    samplePhrasesAr: "أهلاً بك معنا في لوناليزا 🌸، يسعدنا تواصلك، كيف يمكننا مساعدتك اليوم؟",
    isCasualPersonalVibe,
  };
}
