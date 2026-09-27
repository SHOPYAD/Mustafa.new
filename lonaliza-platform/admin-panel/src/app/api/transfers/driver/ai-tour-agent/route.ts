// src/app/api/transfers/driver/ai-tour-agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveGeminiApiKey, getGeminiPublicConfig } from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TourDefinition {
  slug: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  durationHours: number;
  hubCity: string;
  category: string;
  stops: Array<{ time: string; titleAr: string; titleEn: string; descAr: string }>;
  suggestedPrice: number;
  extraHourRate: number;
}

const TURKEY_MASTER_TOURS: Record<string, TourDefinition[]> = {
  istanbul: [
    {
      slug: "tour-sapanca-masukiye-vip",
      titleAr: "جولة بحيرة صبنجة وقرية معشوقية وشلالات ناتوركوي",
      titleEn: "Sapanca Lake, Masukiye & Naturkoy VIP Tour",
      summaryAr: "يوم كامل في أحضان الطبيعة الريفية الساحرة، ركوب دبابات السفاري، زيارة الشلالات والغداء وسط الغابات.",
      durationHours: 10,
      hubCity: "Istanbul",
      category: "nature",
      suggestedPrice: 180,
      extraHourRate: 20,
      stops: [
        { time: "09:00", titleAr: "الانطلاق من الفندق", titleEn: "Hotel Pickup", descAr: "استقبال بالسيارة الملكية وسائق محترف" },
        { time: "11:00", titleAr: "شلالات وقرية معشوقية", titleEn: "Masukiye Waterfalls", descAr: "ركوب السفاري ATV وزيبلاين بين الأشجار" },
        { time: "13:30", titleAr: "غداء ريفي على ضفاف بحيرة صبنجة", titleEn: "Sapanca Lake Lunch", descAr: "وقت حر للتجول والمشي على كورنيش البحيرة" },
        { time: "16:00", titleAr: "قرية المحمودية وتيراس الزجاجي", titleEn: "Mahmudiye & Glass Terrace", descAr: "إطلالة بانورامية ساحرة فوق الوادي الأخضر" },
        { time: "19:00", titleAr: "العودة المريحة لإسطنبول", titleEn: "Return to Istanbul", descAr: "الوصول للفندق مع خدمات الضيافة والراحة" },
      ],
    },
    {
      slug: "tour-green-bursa-uludag-vip",
      titleAr: "جولة بورصة الخضراء وتلفريك جبل أولوداغ التاريخي",
      titleEn: "Green Bursa & Mount Uludag Cable Car VIP Tour",
      summaryAr: "عبور جسر عثمان غازي المعلق، صعود أعلى تلفريك في العالم، زيارة الشجرة المعمرة وأسواق الحلقوم والحرير.",
      durationHours: 11,
      hubCity: "Istanbul",
      category: "culture_nature",
      suggestedPrice: 220,
      extraHourRate: 25,
      stops: [
        { time: "08:30", titleAr: "الانطلاق وعبور جسر عثمان غازي", titleEn: "Osmangazi Bridge Crossing", descAr: "إطلالة بحر مرمرة الخلابة نحو بورصة" },
        { time: "11:00", titleAr: "تلفريك جبل أولوداغ", titleEn: "Uludag Cable Car", descAr: "صعود قمة الجبل والاستمتاع بالأجواء الباردة والثلجية" },
        { time: "13:30", titleAr: "غداء مشاوي تركية وإسكندر كباب", titleEn: "Authentic Iskender Lunch", descAr: "تجربة أشهر وجبة إسكندر كباب في موطنها الأصلي" },
        { time: "15:30", titleAr: "الشجرة المعمرة التاريخية (Inkaya)", titleEn: "Historical Inkaya Tree", descAr: "جلسة شاي تحت شجرة عمرها أكثر من 600 عام" },
        { time: "17:00", titleAr: "سوق الحرير والجامع الأخضر ومصانع الحلقوم", titleEn: "Silk Bazaar & Turkish Delight", descAr: "تسوق أجود أنواع الحلقوم وزيت الزيتون والحرير" },
      ],
    },
    {
      slug: "tour-bosphorus-royal-panoramic",
      titleAr: "جولة إسطنبول والبسفور البانورامية الملكية وتل العرائس",
      titleEn: "Royal Bosphorus & Camlica Panoramic VIP Tour",
      summaryAr: "استكشاف ضفاف البسفور الساحرة، تل العرائس تشامليجا، قصر دولمة بهجة، وأرقى مارينا لليخوت في إسطنبول.",
      durationHours: 8,
      hubCity: "Istanbul",
      category: "sightseeing",
      suggestedPrice: 150,
      extraHourRate: 20,
      stops: [
        { time: "09:30", titleAr: "تل العرائس وجامع تشامليجا الكبير", titleEn: "Camlica Hill & Grand Mosque", descAr: "بانوراما 360 درجة لمضيق البسفور والقارتين" },
        { time: "12:00", titleAr: "قصر دولمة بهجة والواجهة البحرية", titleEn: "Dolmabahce Waterfront Palace", descAr: "روعة العمارة العثمانية المذهلة" },
        { time: "14:00", titleAr: "أورتاكوي وغداء بحري أمام الجسر المعلق", titleEn: "Ortakoy & Bosphorus Lunch", descAr: "تناول وجبة شهية تحت جسر شهداء 15 تموز" },
        { time: "16:30", titleAr: "ساحل بيبيك ومارينا طرابيا", titleEn: "Bebek & Tarabya Marina", descAr: "جولة على الساحل وتناول القهوة التركية الفاخرة" },
      ],
    },
    {
      slug: "tour-sile-agva-black-sea",
      titleAr: "جولة شواطئ شيلا وأغوا والبحيرة المخفية على البحر الأسود",
      titleEn: "Sile & Agva Black Sea Secret Lakes VIP Tour",
      summaryAr: "طبيعة بكر، جولة قارب في النهر الأخضر، منارة شيلا العثمانية، والبحيرة المخفية الهادئة.",
      durationHours: 9,
      hubCity: "Istanbul",
      category: "nature",
      suggestedPrice: 190,
      extraHourRate: 20,
      stops: [
        { time: "09:00", titleAr: "الانطلاق نحو ساحل البحر الأسود", titleEn: "Departure to Black Sea", descAr: "طريق جبلي ريفي ممتع" },
        { time: "11:00", titleAr: "منارة شيلا والقلعة التاريخية", titleEn: "Sile Lighthouse & Castle", descAr: "إطلالة صخرية مذهلة على أمواج البحر الأسود" },
        { time: "13:00", titleAr: "نهر جوكسو في أغوا وجولة القارب", titleEn: "Agva Goksu River Boat Tour", descAr: "جولة نهرية هادئة وغداء وسط المطاعم النهرية" },
        { time: "16:00", titleAr: "البحيرة المخفية (Sakli Gol)", titleEn: "Hidden Lake", descAr: "جلسة هادئة وسط الغابات الطبيعية الكثيفة" },
      ],
    },
  ],
  trabzon: [
    {
      slug: "tour-uzungol-heights-vip",
      titleAr: "جولة بحيرة أوزنجول ومرتفعات غارستر وشلالات التنديري",
      titleEn: "Uzungol Lake & Garester Heights VIP Tour",
      summaryAr: "زيارة أجمل بحيرة جبلية في تركيا، مصانع الشاي الطبيعي، شلالات المياه العذبة، وإطلالة السحاب في قمة غارستر.",
      durationHours: 10,
      hubCity: "Trabzon",
      category: "nature",
      suggestedPrice: 170,
      extraHourRate: 20,
      stops: [
        { time: "09:30", titleAr: "مصنع الشاي وسكاكين سورميني", titleEn: "Tea Factory & Surmene", descAr: "تذوق أجود أنواع الشاي التركي الأسود" },
        { time: "11:30", titleAr: "جسر كيريميتلي التراثي وشلالات المياه", titleEn: "Historical Wooden Bridge", descAr: "جلسة تصوير تراثية بين الغابات" },
        { time: "13:00", titleAr: "بحيرة أوزنجول ووقت الغداء", titleEn: "Uzungol Lake & Lunch", descAr: "وقت حر للتجول وتناول سمك السلمون المرقط" },
        { time: "16:00", titleAr: "مرتفعات غارستر وهضبة شيكاراو", titleEn: "Garester Plateau", descAr: "مشهد مذهل للبحيرة من أعلى قمم السحاب" },
      ],
    },
    {
      slug: "tour-ayder-rize-waterfalls",
      titleAr: "جولة مرتفعات آيدر وريزا والشلالات والجسور العثمانية",
      titleEn: "Ayder Plateau & Rize Waterfalls VIP Tour",
      summaryAr: "مزارع الشاي الخضراء الشاسعة، وادي الرياح فيرتينا، ممارسة التجديف رافتينغ، وزيارة شلالات بالوفيت وقلعة زيل كالي.",
      durationHours: 11,
      hubCity: "Trabzon",
      category: "adventure_nature",
      suggestedPrice: 200,
      extraHourRate: 25,
      stops: [
        { time: "09:00", titleAr: "الانطلاق على ساحل البحر الأسود إلى ريزا", titleEn: "Scenic Coastal Drive", descAr: "مشاهد مزارع الشاي الطبيعية" },
        { time: "11:00", titleAr: "وادي فيرتينا والجسور الحجرية العثمانية", titleEn: "Firtina Valley & Stone Bridges", descAr: "الزيبلاين والتجديف النهري رافتينغ" },
        { time: "13:30", titleAr: "هضبة ومرتفعات آيدر الخضراء والغداء", titleEn: "Ayder Plateau Lunch", descAr: "مراعي خضراء ومنازل خشبية وينابيع كبريتية حارة" },
        { time: "16:00", titleAr: "شلال بالوفيت العملاق وقلعة زيل كالي", titleEn: "Palovit Waterfall & Zil Kale", descAr: "قلعة تاريخية منحوتة على حافة الجرف الصخري" },
      ],
    },
    {
      slug: "tour-sumela-hidirnebi-cave",
      titleAr: "جولة دير سوميلا التاريخي ومغارة تشال وهضبة حيدر نبي",
      titleEn: "Sumela Monastery & Hidirnebi Plateau VIP Tour",
      summaryAr: "معجزة سوميلا المنحوتة في قلب الجبل، ثاني أطول مغارة في العالم، وهضبة الضباب حيدر نبي.",
      durationHours: 9,
      hubCity: "Trabzon",
      category: "culture_nature",
      suggestedPrice: 160,
      extraHourRate: 20,
      stops: [
        { time: "09:30", titleAr: "دير سوميلا في وادي ألتينديري", titleEn: "Sumela Monastery", descAr: "زيارة الصرح التاريخي المعلق في صخور الجبال" },
        { time: "12:30", titleAr: "مغارة تشال والشلال الداخلي", titleEn: "Cal Cave Underground", descAr: "مغامرة استكشاف ممرات الصواعد والهوابط الكلسية" },
        { time: "14:30", titleAr: "هضبة حيدر نبي وتناول الغداء", titleEn: "Hidirnebi Plateau Lunch", descAr: "مشاوي الكفتة واللحوم الطازجة فوق السحاب" },
        { time: "17:00", titleAr: "بحيرة سيراجول في أكشابات", titleEn: "Sera Lake", descAr: "ركوب القوارب المائية والاسترخاء قبل العودة" },
      ],
    },
  ],
  antalya: [
    {
      slug: "tour-antalya-waterfalls-old-town",
      titleAr: "جولة شلالات دودين وكوربوز وتلفريك تونيك تبه والمدينة القديمة",
      titleEn: "Antalya Waterfalls, Cable Car & Kaleici VIP Tour",
      summaryAr: "شلال دودين المتدفق نحو البحر المتوسط، ركوب تلفريك جبل تونيك تبه، والتجول في أزقة كالتشي العثمانية وميناء اليخوت.",
      durationHours: 8,
      hubCity: "Antalya",
      category: "sightseeing",
      suggestedPrice: 160,
      extraHourRate: 20,
      stops: [
        { time: "09:30", titleAr: "شلالات دودين العليا والحديقة الطبيعية", titleEn: "Upper Duden Waterfalls", descAr: "كهوف مائية ومسارات مشي ظليلة منعشة" },
        { time: "11:30", titleAr: "تلفريك تونيك تبه البانورامي", titleEn: "Tunektepe Cable Car", descAr: "إطلالة شاملة على خليج وجبال طوروس الشامخة" },
        { time: "13:30", titleAr: "المدينة القديمة كالتشي والغداء البحري", titleEn: "Kaleici Old Town Marina", descAr: "بوابة هادريان والأزقة التراثية وميناء السفن" },
        { time: "16:00", titleAr: "شلال دودين السفلي المصب في البحر", titleEn: "Lower Duden Waterfall", descAr: "مشهد ساحر لسقوط المياه العذبة من الجرف الصخري نحو البحر" },
      ],
    },
    {
      slug: "tour-kemer-phaselis-tahtali",
      titleAr: "جولة كيمير وتلفريك أوليمبوس تهتالي ومدينة فاسيليس الغارقة",
      titleEn: "Kemer, Olympos Tahtali & Phaselis VIP Tour",
      summaryAr: "الصعود لأعلى قمة ساحلية (2365م) بتلفريك أوليمبوس، زيارة شواطئ وآثار فاسيليس الرومانية المحاطة بأشجار الصنوبر.",
      durationHours: 9,
      hubCity: "Antalya",
      category: "nature_adventure",
      suggestedPrice: 190,
      extraHourRate: 20,
      stops: [
        { time: "09:00", titleAr: "تلفريك أوليمبوس جبل تهتالي", titleEn: "Olympos Teleferik (2,365m)", descAr: "من البحر إلى الثلج والسحاب في 12 دقيقة" },
        { time: "12:30", titleAr: "شواطئ وآثار فاسيليس الأثرية", titleEn: "Ancient Phaselis Bays", descAr: "سباحة في خلجان المياه الكريستالية بين الآثار الرومانية" },
        { time: "15:00", titleAr: "مارينا كيمير والغداء في مطاعم السمك", titleEn: "Kemer Marina Seafood", descAr: "وقت حر للتسوق والتجول على الواجهة البحرية" },
      ],
    },
    {
      slug: "tour-side-manavgat-canyon",
      titleAr: "جولة سيدي التاريخية وشلال مانافغات والوادي الأخضر",
      titleEn: "Ancient Side, Manavgat Waterfall & Green Canyon VIP Tour",
      summaryAr: "معبد أبولو التاريخي على شاطئ البحر، رحلة شلال مانافغات، وجولة بحيرة الوادي الأخضر الطبيعية.",
      durationHours: 9,
      hubCity: "Antalya",
      category: "culture_nature",
      suggestedPrice: 180,
      extraHourRate: 20,
      stops: [
        { time: "09:30", titleAr: "معبد أبولو ومدينة سيدي الرومانية", titleEn: "Apollo Temple Side", descAr: "زيارة الصروح التراثية على ساحل البحر" },
        { time: "12:00", titleAr: "شلالات مانافغات المتدفقة", titleEn: "Manavgat Waterfalls", descAr: "مشهد مائي عذب واستراحة شاي" },
        { time: "14:00", titleAr: "بحيرة الوادي الأخضر الطبيعية", titleEn: "Green Canyon Lake", descAr: "جولة قارب ممتعة وغداء وسط الطبيعة الخلابة" },
      ],
    },
  ],
  cappadocia: [
    {
      slug: "tour-cappadocia-red-tour-vip",
      titleAr: "جولة كابادوكيا الحمراء (متحف غوريمي، وادي الرهبان، وباشاباغ)",
      titleEn: "Cappadocia Classic Red VIP Tour",
      summaryAr: "المتحف المفتوح في غوريمي، وادي الرهبان باشاباغ، مداخن الجنيات، ووادي الخيال في ديفريت مع غداء كهفي مميز.",
      durationHours: 8,
      hubCity: "Cappadocia",
      category: "sightseeing",
      suggestedPrice: 170,
      extraHourRate: 20,
      stops: [
        { time: "09:30", titleAr: "متحف غوريمي المفتوح", titleEn: "Goreme Open Air Museum", descAr: "كنائس صخرية ولوحات جدارية فريدة" },
        { time: "11:30", titleAr: "وادي باشاباغ ومداخن الجنيات", titleEn: "Pasabag Fairy Chimneys", descAr: "أجمل التكوينات الصخرية الطبيعية" },
        { time: "13:30", titleAr: "غداء في مطعم كهفي تراثي", titleEn: "Cave Restaurant Lunch", descAr: "تجربة فخار اللحم الكابادوكي الشهير" },
        { time: "15:30", titleAr: "وادي الخيال ديفريت وصناعة الفخار في أفانوس", titleEn: "Devrent Valley & Pottery", descAr: "مشاهدة صخور على أشكال حيوانات وورش الخزف" },
      ],
    },
    {
      slug: "tour-cappadocia-green-underground-vip",
      titleAr: "جولة كابادوكيا الخضراء (المدينة تحت الأرض، وادي إهلارا وسليمي)",
      titleEn: "Cappadocia Green VIP Tour",
      summaryAr: "استكشاف أعمق مدينة تحت الأرض (ديرينكويو)، المشي في وادي إهلارا الأخضر على ضفاف النهر، ودير سليمي الصخري التاريخي.",
      durationHours: 9,
      hubCity: "Cappadocia",
      category: "nature_adventure",
      suggestedPrice: 190,
      extraHourRate: 20,
      stops: [
        { time: "09:00", titleAr: "مدينة ديرينكويو تحت الأرض", titleEn: "Derinkuyu Underground City", descAr: "استكشاف غرف وطوابق منحوتة بعمق 85 متراً" },
        { time: "11:30", titleAr: "المشي في وادي إهلارا الأخضر", titleEn: "Ihlara Valley River Walk", descAr: "مسار مشي ظليل بين الجدران الصخرية وضفاف النهر" },
        { time: "13:30", titleAr: "غداء على منصات النهر العائمة في بيلسيرما", titleEn: "Belisirma River Dining", descAr: "تناول وجبة الغداء فوق مجرى المياه العذبة" },
        { time: "15:30", titleAr: "دير سليمي الصخري العملاق", titleEn: "Selime Rock Monastery", descAr: "قلعة وكنيسة صخرية مهيبة مطلة على الوادي" },
      ],
    },
  ],
  aegean: [
    {
      slug: "tour-bodrum-peninsula-bays-vip",
      titleAr: "جولة شبه جزيرة بودروم البانورامية وياليكافاك مارينا وقلعة بودروم",
      titleEn: "Bodrum Panoramic Peninsula VIP Tour",
      summaryAr: "قلعة بودروم البحرية، طواحين الهواء التاريخية، ياليكافاك مارينا والنوادي الشاطئية الفاخرة وغروب الشمس.",
      durationHours: 8,
      hubCity: "Bodrum",
      category: "sightseeing",
      suggestedPrice: 180,
      extraHourRate: 20,
      stops: [
        { time: "09:30", titleAr: "قلعة بودروم ومتحف الآثار تحت الماء", titleEn: "Bodrum Castle & Underwater Museum", descAr: "تاريخ الفرسان وإطلالة بحر إيجة الساحرة" },
        { time: "12:00", titleAr: "طواحين الهواء البانورامية", titleEn: "Historic Windmills Viewpoint", descAr: "إطلالة مزدوجة على خليج بودروم وغومبيت" },
        { time: "14:00", titleAr: "ياليكافاك مارينا وغداء على البحر", titleEn: "Yalikavak Luxury Marina Lunch", descAr: "أرقى مارينا لليخوت العالمية في تركيا" },
        { time: "16:30", titleAr: "قرية غوموشلوك وغروب الشمس", titleEn: "Gumusluk Sunset & Bays", descAr: "المشي فوق الآثار الغارقة في البحر" },
      ],
    },
    {
      slug: "tour-fethiye-oludeniz-saklikent-vip",
      titleAr: "جولة فتحية وأولودينيز ووادي صاكليكنت المائي وقرية كايا كوي",
      titleEn: "Fethiye, Oludeniz & Saklikent Gorge VIP Tour",
      summaryAr: "شاطئ أولودينيز ذو المياه الفيروزية، المشي في مياه أخدود صاكليكنت الصخري البارد، وقرية كايا كوي الأثرية المهجورة.",
      durationHours: 9,
      hubCity: "Fethiye",
      category: "adventure_nature",
      suggestedPrice: 190,
      extraHourRate: 20,
      stops: [
        { time: "09:00", titleAr: "شاطئ أولودينيز والبحيرة الزرقاء", titleEn: "Oludeniz Blue Lagoon", descAr: "سباحة في أنقى مياه شاطئية ومشاهدة الباراشوت" },
        { time: "11:30", titleAr: "قرية كايا كوي المهجورة التاريخية", titleEn: "Kayakoy Ghost Village", descAr: "بيوت حجرية تراثية بين تلال الصنوبر" },
        { time: "13:30", titleAr: "أخدود ووادي صاكليكنت المائي والغداء", titleEn: "Saklikent Gorge River Walk", descAr: "مغامرة المشي في الأخدود الصخري العملاق وتناول السمك النهري" },
      ],
    },
  ],
  southeast: [
    {
      slug: "tour-mardin-midyat-historic-vip",
      titleAr: "جولة ماردين ومديات والقصور الحجرية ودير الزعفران",
      titleEn: "Mardin & Midyat Historic Stone Architecture VIP Tour",
      summaryAr: "قصور ماردين الحجرية المطلة على سهول بلاد ما بين النهرين، دير الزعفران السرياني، وأسواق مديات الفضية التراثية.",
      durationHours: 9,
      hubCity: "Mardin",
      category: "culture",
      suggestedPrice: 170,
      extraHourRate: 20,
      stops: [
        { time: "09:30", titleAr: "دير الزعفران السرياني التاريخي", titleEn: "Deyrulzafaran Monastery", descAr: "صرح أثري عمره أكثر من 1500 عام" },
        { time: "11:30", titleAr: "أزقة ماردين القديمة والبيوت الحجرية", titleEn: "Old Mardin Stone Alleys", descAr: "فن العمارة الحجرية المنحوتة وإطلالة سهول الجزيرة" },
        { time: "14:00", titleAr: "قصر مديات التاريخي وأسواق التلكاري", titleEn: "Midyat Guest House & Silver", descAr: "صناعة الحلي الفضية السريانية وزيارة موقع تصوير المسلسلات" },
      ],
    },
    {
      slug: "tour-urfa-gobeklitepe-balikligol-vip",
      titleAr: "جولة شانلي أورفا وبركة إبراهيم وغوبكلي تبه أقدم معبد في التاريخ",
      titleEn: "Sanliurfa, Balikligol & Gobeklitepe VIP Tour",
      summaryAr: "زيارة غوبكلي تبه (أقدم معبد شيده الإنسان قبل 12,000 عام)، بركة الأسماك المقدسة، وأسواق حران التاريخية والبيوت الطينية.",
      durationHours: 9,
      hubCity: "Sanliurfa",
      category: "culture_history",
      suggestedPrice: 170,
      extraHourRate: 20,
      stops: [
        { time: "09:00", titleAr: "موقع غوبكلي تبه الأثري التاريخي", titleEn: "Gobeklitepe UNESCO Site", descAr: "أقدم نقطة صفر في تاريخ البشرية والمعابد الحجرية" },
        { time: "12:00", titleAr: "بركة الأسماك (باليكلي غول) والقلعة", titleEn: "Balikligol Sacred Pool", descAr: "معلم ديني وتراثي عريق وأسواق شعبية" },
        { time: "14:30", titleAr: "بيوت حران الطينية المخروطية", titleEn: "Harran Beehive Houses", descAr: "أقدم جامعة إسلامية وبيوت طينية فريدة" },
      ],
    },
  ],
};

function normalizeTourCityKey(city?: string): string {
  const c = (city || "").toLowerCase();
  if (c.includes("trabzon") || c.includes("طرابزون") || c.includes("rize") || c.includes("ريزا")) return "trabzon";
  if (c.includes("antalya") || c.includes("أنطاليا") || c.includes("alanya") || c.includes("ألانيا") || c.includes("kemer") || c.includes("كيمير")) return "antalya";
  if (c.includes("cappadocia") || c.includes("كابادوكيا") || c.includes("nevsehir") || c.includes("نوشهر") || c.includes("kayseri")) return "cappadocia";
  if (c.includes("aegean") || c.includes("bodrum") || c.includes("بودروم") || c.includes("fethiye") || c.includes("فتحية") || c.includes("marmaris") || c.includes("مرمريس")) return "aegean";
  if (c.includes("southeast") || c.includes("mardin") || c.includes("ماردين") || c.includes("urfa") || c.includes("أورفا") || c.includes("gaziantep") || c.includes("diyarbakir") || c.includes("van")) return "southeast";
  return "istanbul";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40) || "custom-tour";
}

function parsePaidActivities(
  title: string,
  customPaidText?: string,
  stopsText?: string
): Array<{ nameAr: string; priceEstimate?: string; noteAr?: string }> {
  const combined = `${title} ${customPaidText || ""} ${stopsText || ""}`.toLowerCase();
  const list: Array<{ nameAr: string; priceEstimate?: string; noteAr?: string }> = [];

  if (customPaidText && customPaidText.trim().length > 0) {
    const rawItems = customPaidText.split(/[\n,،;]+/).map((s) => s.trim()).filter(Boolean);
    for (const item of rawItems) {
      list.push({
        nameAr: item,
        noteAr: "يدفع العميل تكلفتها مباشرة في الموقع (اختياري)",
      });
    }
    return list;
  }

  // Automatic extraction based on tour context
  if (combined.includes("تلفريك") || combined.includes("teleferik") || combined.includes("cable car")) {
    list.push({
      nameAr: "تذاكر التلفريك (صعود قمة الجبل)",
      priceEstimate: "حوالي $12 - $18 للشخص",
      noteAr: "تدفع مباشرة عند شباك تذاكر محطة التلفريك",
    });
  }
  if (combined.includes("دباب") || combined.includes("سفاري") || combined.includes("atv") || combined.includes("safari")) {
    list.push({
      nameAr: "دبابات السفاري الجبلية (ATV Quad Safari)",
      priceEstimate: "حوالي $25 - $35 للدباب / ساعة",
      noteAr: "نشاط اختياري للمغامرة في الغابات والمسارات الجبلية",
    });
  }
  if (combined.includes("زيبلاين") || combined.includes("zipline") || combined.includes("حبل")) {
    list.push({
      nameAr: "لعبة الزيبلاين الهوائي (Zipline)",
      priceEstimate: "حوالي $10 - $15 للتذكرة",
      noteAr: "تجربة الانزلاق الهوائي فوق الشلالات والوديان",
    });
  }
  if (combined.includes("قارب") || combined.includes("تجديف") || combined.includes("رافتينغ") || combined.includes("rafting") || combined.includes("boat")) {
    list.push({
      nameAr: "جولة القارب أو التجديف المائي (Boat Tour / Rafting)",
      priceEstimate: "حوالي $15 - $25 للشخص",
      noteAr: "جولة مائية ممتعة وسط البحيرات أو الأنهار الطبيعية",
    });
  }
  if (combined.includes("متحف") || combined.includes("قلعة") || combined.includes("قصر") || combined.includes("museum") || combined.includes("palace") || combined.includes("معبد")) {
    list.push({
      nameAr: "رسوم وتذاكر دخول المتاحف والقصور الأثرية",
      priceEstimate: "حسب تسعيرة وزارة السياحة التركية",
      noteAr: "تدفع مباشرة في بوابات الدخول الرسمية",
    });
  }
  if (combined.includes("منطاد") || combined.includes("كابادوكيا") || combined.includes("balloon")) {
    list.push({
      nameAr: "رحلة منطاد الهواء الساخن في كابادوكيا",
      priceEstimate: "حسب الموسم والطلب ($120 - $220)",
      noteAr: "نشاط اختياري يتم حجزه مسبقاً للعميل",
    });
  }

  if (list.length === 0) {
    list.push({
      nameAr: "تذاكر المزارات والأنشطة الترفيهية الاختيارية في مسار الجولة",
      priceEstimate: "حسب رغبة واختيار العميل في الموقع",
      noteAr: "تدفع مباشرة من قبل العميل في الموقع وليست مشمولة في سعر السيارة VIP",
    });
    list.push({
      nameAr: "وجبات الغداء والمشروبات الإضافية الخاصة",
      priceEstimate: "حسب طلب العميل في المطاعم الريفية",
      noteAr: "يدفع العميل قيمة وجبته مباشرة للمطعم",
    });
  }

  return list;
}

function generateTourItineraryStops(
  title: string,
  city: string,
  durationHours: number,
  stopsDetails?: string
): Array<{ time: string; titleAr: string; titleEn: string; descAr: string; stayMinutes: number }> {
  // If specific stops provided by partner/driver:
  if (stopsDetails && stopsDetails.trim().length > 3) {
    const rawStops = stopsDetails
      .split(/[\n,،;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);

    if (rawStops.length >= 2) {
      const stops: Array<{ time: string; titleAr: string; titleEn: string; descAr: string; stayMinutes: number }> = [];
      let currentHour = 9;

      stops.push({
        time: "09:00",
        titleAr: "الاستقبال الملكي والانطلاق من الفندق",
        titleEn: "Hotel Pickup & Welcome",
        descAr: "لقاء السائق الخاص بسيارة مرسيدس فيتو VIP والانطلاق المريح نحو مسار الرحلة",
        stayMinutes: 30,
      });

      rawStops.forEach((stopName, idx) => {
        currentHour += Math.max(1, Math.floor((durationHours - 2) / rawStops.length));
        if (currentHour > 19) currentHour = 19;
        const timeStr = `${String(currentHour).padStart(2, "0")}:00`;
        stops.push({
          time: timeStr,
          titleAr: stopName,
          titleEn: `Visit ${stopName}`,
          descAr: `استكشاف ${stopName}، الاستمتاع بالمناظر الطبيعية والتقاط الصور التذكارية وقضاء وقت ممتع`,
          stayMinutes: idx === 1 ? 90 : 60,
        });
      });

      stops.push({
        time: `${String(Math.min(21, 9 + durationHours)).padStart(2, "0")}:00`,
        titleAr: "العودة الآمنة والمريحة إلى الفندق",
        titleEn: "Return to Hotel",
        descAr: "التوصيل حتى باب مقر الإقامة في ختام يوم سياحي حافل ومميز",
        stayMinutes: 30,
      });

      return stops;
    }
  }

  const query = `${title} ${city}`.toLowerCase();

  // 1. Trabzon - Uzungol
  if (query.includes("اوزنجول") || query.includes("أوزنجول") || query.includes("uzungol") || (query.includes("trabzon") && !query.includes("آيدر") && !query.includes("سوميلا") && !query.includes("حيدر"))) {
    return [
      { time: "09:00", titleAr: "الاستقبال من الفندق في طرابزون", titleEn: "Hotel Pickup & Scenic Coastal Drive", descAr: "استقبال السائق الخاص بسيارة مرسيدس فيتو VIP والانطلاق على الطريق الساحلي الشرقي", stayMinutes: 30 },
      { time: "10:00", titleAr: "مصنع الشاي ومعمل السكاكين التراثية في سورميني", titleEn: "Surmene Tea Factory & Knives", descAr: "تذوق الشاي التركي الطازج والتعرف على طرق تصنيعه وشراء أجود أنواع الشاي الطبيعي", stayMinutes: 45 },
      { time: "11:15", titleAr: "جسر كيريميتلي الخشبي التاريخي وشلالات التنديري", titleEn: "Historical Bridge & Waterfalls", descAr: "جلسة تصوير عند الجسر العثماني المسقوف بالقرميد والتنزه أمام الشلالات الجبلية", stayMinutes: 45 },
      { time: "12:30", titleAr: "بحيرة أوزنجول وجولة مشي حرة على ضفافها", titleEn: "Uzungol Lake Promenade", descAr: "استكشاف ضفاف البحيرة وركوب القوارب المائية والتقاط الصور التذكارية الساحرة", stayMinutes: 90 },
      { time: "14:15", titleAr: "استراحة غداء ريفي تركي ومشاوي السلمون", titleEn: "Highland Riverside Trout Lunch", descAr: "تناول وجبة غداء شهية من سمك السلمون المرقط والفطائر المحلية بإطلالة شلال البحيرة", stayMinutes: 75 },
      { time: "16:00", titleAr: "الصعود لمرتفعات غارستر وهضبة السلطان مراد", titleEn: "Garester Heights Viewpoint", descAr: "الصعود بالسيارة لقمة الجبل لمشاهدة بانوراما كاملة لبحيرة أوزنجول من فوق السحاب", stayMinutes: 75 },
      { time: "18:00", titleAr: "مطل كوم كافيه والتسوق والعودة لطرابزون", titleEn: "Com Cafe Viewpoint & Hotel Return", descAr: "جلسة شاي على المطل وجولة تسوق العسل الجبلي والهدايا والعودة الآمنة للفندق", stayMinutes: 60 },
    ];
  }

  // 2. Trabzon - Ayder & Rize
  if (query.includes("آيدر") || query.includes("ايدر") || query.includes("ayder") || query.includes("ريزا") || query.includes("rize")) {
    return [
      { time: "08:30", titleAr: "الانطلاق نحو ولاية ريزا ومزارع الشاي", titleEn: "Departure to Rize Tea Hills", descAr: "رحلة ساحلية ممتعة نحو مزارع الشاي الخضراء الشاسعة", stayMinutes: 45 },
      { time: "10:30", titleAr: "وادي فيرتينا والجسور الحجرية العثمانية", titleEn: "Firtina Valley & Historical Bridges", descAr: "مشاهدة نهر فيرتينا الهادر والجسور التاريخية وممارسة التجديف والزيبلاين", stayMinutes: 90 },
      { time: "12:15", titleAr: "قلعة زيل كالي التاريخية وشلال بالوفيت", titleEn: "Zil Kale Castle & Palovit Waterfall", descAr: "زيارة قلعة شامخة وسط الجبال وشلال بالوفيت العملاق وسط الغابات الكثيفة", stayMinutes: 75 },
      { time: "14:00", titleAr: "غداء ريفي تركي على ضفاف النهر", titleEn: "Riverside Traditional Lunch", descAr: "تناول وجبة الغداء ومأكولات البحر الأسود التقليدية في أجواء ريفية منعشة", stayMinutes: 75 },
      { time: "15:45", titleAr: "هضبة آيدر الشهيرة وشلال العروس", titleEn: "Ayder Plateau & Bridal Waterfall", descAr: "التجول في المروج الخضراء ورؤية شلال غلين تولو وزيارة الينابيع الكبريتية الحارة", stayMinutes: 90 },
      { time: "18:00", titleAr: "شراء العسل الطبيعي والعودة الآمنة لطرابزون", titleEn: "Honey Shopping & Return", descAr: "تسوق أجود أنواع عسل آيدر والعودة المريحة إلى مقر الإقامة", stayMinutes: 60 },
    ];
  }

  // 3. Trabzon - Sumela & Hamsikoy
  if (query.includes("سوميلا") || query.includes("sumela") || query.includes("همسيكوي") || query.includes("hamsikoy") || query.includes("كاراجا") || query.includes("حيدر")) {
    return [
      { time: "09:00", titleAr: "الانطلاق نحو متنزه ماتشكا الوطني", titleEn: "Departure to Macka National Park", descAr: "التحرك بالسيارة الفاخرة بين غابات الصنوبر الشاهقة", stayMinutes: 45 },
      { time: "10:15", titleAr: "دير سوميلا التاريخي المنحوت في الصخر", titleEn: "Sumela Monastery Rock Sanctuary", descAr: "استكشاف المعلم المعلق في حافة الجرف الصخري والممرات التاريخية واللوحات الجدارية", stayMinutes: 90 },
      { time: "12:30", titleAr: "قرية همسيكوي الجبلية وغداء ريفي أصيل", titleEn: "Hamsikoy Alpine Village Lunch", descAr: "تناول طعام الغداء الريفي في القرية الشهيرة وتذوق حلوى السوتلاش الأصلية بالفرن", stayMinutes: 75 },
      { time: "14:30", titleAr: "جبال زيكانا ومغارة كاراجا الكارستية", titleEn: "Zigana Pass & Karaca Cave", descAr: "عبور نفق زيكانا وزيارة مغارة كاراجا المليئة بالصواعد والهوابط الكلسية الملونة النادرة", stayMinutes: 75 },
      { time: "16:45", titleAr: "مطل بوزتبه البانورامي المطل على طرابزون", titleEn: "Boztepe Panoramic Hill", descAr: "جلسة شاي السماور الفاخرة وإطلالة شاملة على البحر الأسود والمدينة القديمة", stayMinutes: 60 },
      { time: "18:30", titleAr: "العودة المريحة لمقر الإقامة", titleEn: "Hotel Drop-off", descAr: "التوصيل الآمن إلى الفندق مع ختام جولة تاريخية وطبيعية مميزة", stayMinutes: 30 },
    ];
  }

  // 4. Istanbul - Sapanca & Masukiye
  if (query.includes("سبانجا") || query.includes("صبنجة") || query.includes("sapanca") || query.includes("معشوقية") || query.includes("masukiye")) {
    return [
      { time: "09:00", titleAr: "الانطلاق من إسطنبول وعبور الجسر المعلق", titleEn: "Istanbul Departure & Bridge Crossing", descAr: "استقبال بالسيارة الملكية فيتو VIP والانطلاق عبر الطريق السريع", stayMinutes: 30 },
      { time: "10:45", titleAr: "شلالات وقرية معشوقية وسفاري الدبابات ATV", titleEn: "Masukiye Waterfalls & ATV Safari", descAr: "ركوب دبابات السفاري الجبلية بين الغابات وتجربة الزيبلاين الهوائي الترفيهي", stayMinutes: 90 },
      { time: "13:00", titleAr: "غداء ريفي عائم فوق مياه الشلال في ناتوركوي", titleEn: "Floating Waterfall Lunch at Naturkoy", descAr: "تناول طواجن الفخار والمشاوي التركية في جلسات ساحرة فوق مجرى الشلال", stayMinutes: 75 },
      { time: "15:00", titleAr: "كورنيش بحيرة سبانجا والأنشطة المائية", titleEn: "Sapanca Lake Promenade", descAr: "المشي على ضفاف البحيرة، ركوب القوارب الكهربائية، والتصوير التذكاري", stayMinutes: 75 },
      { time: "16:45", titleAr: "تلفريك جبل كارتبه والمطل الزجاجي البانورامي", titleEn: "Kartepe Cable Car & Glass Terrace", descAr: "مشهد بانورامي مذهل يجمع بين بحيرة سبانجا والجبال الخضراء الشاهقة", stayMinutes: 60 },
      { time: "18:15", titleAr: "مجمع فيابورت مارينا والعودة المريحة لإسطنبول", titleEn: "Viaport Marina & Return", descAr: "وقت حر للتسوق في الماركات العالمية ثم العودة الهانئة للفندق", stayMinutes: 60 },
    ];
  }

  // 5. Istanbul - Bursa & Uludag
  if (query.includes("بورصة") || query.includes("بورصه") || query.includes("bursa") || query.includes("أولوداغ") || query.includes("uludag")) {
    return [
      { time: "08:30", titleAr: "الانطلاق وعبور جسر عثمان غازي المعلق", titleEn: "Osmangazi Suspension Bridge Crossing", descAr: "عبور رابع أطول جسر معلق في العالم وإطلالة خليج إزميت", stayMinutes: 45 },
      { time: "10:45", titleAr: "محطة تلفريك بورصة والصعود لجبل أولوداغ", titleEn: "Bursa Teleferik to Mount Uludag", descAr: "ركوب أطول تلفريك في العالم بين غابات الصنوبر وصولاً إلى قمة الجبل الثلجي", stayMinutes: 120 },
      { time: "13:30", titleAr: "غداء كباب إسكندر الأصلي التاريخي", titleEn: "Authentic Iskender Kebab Feast", descAr: "تذوق الطبق التركي الأشهر في مسقط رأسه الأصلي بالزبدة واللبن الطازج", stayMinutes: 75 },
      { time: "15:15", titleAr: "الشجرة المعمرة التاريخية (إينكايا - 600 عام)", titleEn: "Historic Inkaya Plane Tree", descAr: "جلسة شاي ريفية مظللة تحت أضخم شجرة معمرة في تركيا مع إطلالة الجبال", stayMinutes: 60 },
      { time: "16:45", titleAr: "سوق الحرير العثماني ومصانع الحلقوم والعسل", titleEn: "Silk Bazaar & Turkish Delight", descAr: "زيارة خان الحرير التاريخي وشراء أجود أنواع الحلقوم البورصي والعسل الجبلي", stayMinutes: 60 },
      { time: "18:30", titleAr: "العودة المريحة إلى إسطنبول", titleEn: "Comfortable Return to Istanbul", descAr: "الوصول الآمن والتوصيل إلى باب مقر الإقامة", stayMinutes: 45 },
    ];
  }

  // 6. Istanbul - Bosphorus & Royal Palaces
  if (query.includes("بسفور") || query.includes("بوسفور") || query.includes("bosphorus") || query.includes("دولمة") || query.includes("عرائس") || query.includes("istanbul")) {
    return [
      { time: "09:30", titleAr: "قصر دولمة بهجة الملكي والواجهة البحرية", titleEn: "Dolmabahce Palace Waterfront", descAr: "استكشاف حدائق وقاعات القصر الإمبراطوري العثماني المطل على مضيق البسفور", stayMinutes: 90 },
      { time: "11:45", titleAr: "ساحة أورتاكوي والتقاط الصور تحت الجسر المعلق", titleEn: "Ortakoy Square & Bosphorus Bridge", descAr: "إطلالة بانورامية تحت جسر البسفور وتذوق البطاطا المشوية الشهيرة (كومبير)", stayMinutes: 60 },
      { time: "13:15", titleAr: "غداء بحري فاخر في مارينا بيبيك أو طرابيا", titleEn: "Bebek & Tarabya Marina Seafood Lunch", descAr: "تناول وجبة غداء راقية مع إطلالة مباشرة على اليخوت ومياه البسفور الزرقاء", stayMinutes: 75 },
      { time: "15:00", titleAr: "تل العرائس (تشامليجا) وأعلى قمة في إسطنبول", titleEn: "Camlica Hill & Grand Mosque Panorama", descAr: "إطلالة 360 درجة تجمع بين القارتين الأوروبية والآسيوية وجلسة شاي تركي تقليدي", stayMinutes: 75 },
      { time: "17:00", titleAr: "تسوق راقٍ في زورلو سنتر أو استينيا بارك", titleEn: "Zorlu Center / IstinyePark Shopping", descAr: "وقت حر للتسوق في أفخم الماركات العالمية والمتاجر التركية الحصرية", stayMinutes: 90 },
      { time: "19:00", titleAr: "العودة والتوصيل إلى باب الفندق", titleEn: "Hotel Drop-off & Farewell", descAr: "التوصيل المريح والآمن في ختام يوم سياحي ملكي فاخر", stayMinutes: 30 },
    ];
  }

  // 7. Antalya
  if (query.includes("أنطاليا") || query.includes("انطاليا") || query.includes("antalya") || query.includes("دودين") || query.includes("دوران")) {
    return [
      { time: "09:30", titleAr: "شلالات دودين السفلية المصبة في البحر", titleEn: "Lower Duden Waterfall to Sea", descAr: "مشهد مذهل لتدفق المياه العذبة من الجرف الصخري نحو البحر الأبيض المتوسط", stayMinutes: 60 },
      { time: "11:00", titleAr: "البلدة القديمة (كاليتشي) وبوابة هادريان وميناء اليخوت", titleEn: "Kaleici Old Town & Roman Marina", descAr: "التجول في الأزقة العثمانية المرصوفة بالحصى وزيارة الآثار الرومانية التاريخية", stayMinutes: 90 },
      { time: "13:00", titleAr: "غداء بحري في مارينا اليخوت", titleEn: "Marina Seafood Lunch", descAr: "وجبة غداء فاخرة من الأسماك والمأكولات البحرية على ضفاف الميناء القديم", stayMinutes: 75 },
      { time: "15:00", titleAr: "تلفريك جبل تونيك تيبي والبانوراما الساحلية", titleEn: "Tunektepe Cable Car & Sea Overlook", descAr: "الصعود بالتلفريك إلى قمة الجبل لرؤية خليج أنطاليا بالكامل من أعلى السحاب", stayMinutes: 90 },
      { time: "17:00", titleAr: "شاطئ كونيالتي الشهير والكورنيش والعودة للفندق", titleEn: "Konyaalti Beach & Return", descAr: "جلسة شاي عند الشاطئ والتوصيل الآمن إلى الفندق", stayMinutes: 60 },
    ];
  }

  // 8. Cappadocia
  if (query.includes("كابادوكيا") || query.includes("cappadocia") || query.includes("غوريم") || query.includes("منطاد")) {
    return [
      { time: "05:30", titleAr: "مشاهدة إقلاع أسراب المناطيد في سماء كابادوكيا", titleEn: "Sunrise Hot Air Balloons Vista", descAr: "مشهد أسطوري لإقلاع مئات المناطيد الملونة فجراً فوق الوديان الصخرية", stayMinutes: 90 },
      { time: "09:30", titleAr: "متحف غوريم المفتوح والكنائس الصخرية الأثرية", titleEn: "Goreme Open-Air Museum", descAr: "استكشاف المستوطنات الكهفية والجداريات البيزنطية المنحوتة في قلب الجبال", stayMinutes: 90 },
      { time: "11:30", titleAr: "وادي الرهبان (باشاباغ) ومداخن الجنيات العجيبة", titleEn: "Pasabag Fairy Chimneys Valley", descAr: "أروع التكوينات الجيولوجية الطبيعية في العالم ومسارات المشي بين الصخور", stayMinutes: 75 },
      { time: "13:15", titleAr: "غداء كابادوكي أصيل في مطعم كهفي (تيستي كباب)", titleEn: "Cave Restaurant Pottery Kebab Lunch", descAr: "تجربة طهي اللحم في جرة الفخار وكسرها أمام الضيوف في أجواء كهفية فريدة", stayMinutes: 75 },
      { time: "15:00", titleAr: "قلعة أوتش حصار الصخرية وأعلى إطلالة بانورامية", titleEn: "Uchisar Rock Castle Viewpoint", descAr: "الصعود لأعلى نقطة في كابادوكيا لرؤية كامل الوديان والجبال المحيطة", stayMinutes: 60 },
      { time: "16:30", titleAr: "مدينة ديرينكويو الأثرية المنحوتة تحت الأرض", titleEn: "Derinkuyu Underground City", descAr: "مغامرة استكشاف أعمق مدينة تحت الأرض بطوابقها وغرفها وقنواتها الهوائية", stayMinutes: 75 },
      { time: "18:15", titleAr: "وادي الحمام ومشاغل الفخار في أفانوس والعودة", titleEn: "Pigeon Valley & Avanos Pottery Return", descAr: "مشاهدة صناعة الخزف اليدوي والتوصيل الآمن إلى الفندق", stayMinutes: 45 },
    ];
  }

  // Default regional fallback
  return [
    { time: "09:00", titleAr: `الاستقبال الملكي من الفندق في ${city}`, titleEn: `Hotel Pickup in ${city}`, descAr: `استقبال السائق الخاص بسيارة مرسيدس فيتو VIP فاخرة والانطلاق نحو مسار الرحلة`, stayMinutes: 30 },
    { time: "10:30", titleAr: `أبرز معالم الطبيعة والتراث في ${title}`, titleEn: `Main Attractions of ${title}`, descAr: `زيارة النقطة السياحية المميزة، الاستمتاع بالإطلالات الخلابة والتقاط الصور التذكارية`, stayMinutes: 90 },
    { time: "13:00", titleAr: "استراحة غداء ريفي تركي فاخر", titleEn: "Scenic Traditional Lunch", descAr: "تناول وجبة غداء شهية من المأكولات التركية المحلية في مطعم ذي إطلالة بانورامية", stayMinutes: 75 },
    { time: "15:00", titleAr: "الفعاليات الترفيهية والتسوق واستكشاف المنطقة", titleEn: "Activities, Shopping & Leisure", descAr: "وقت حر للأنشطة الترفيهية وشراء الهدايا التذكارية والمنتجات الإقليمية الشهيرة", stayMinutes: 90 },
    { time: "17:30", titleAr: "العودة الآمنة والمريحة إلى مقر الإقامة", titleEn: "Hotel Drop-off & Comfort Return", descAr: "العودة الهانئة بالسيارة الفارهة مع تمنياتنا لكم بأجمل الذكريات السعيدة", stayMinutes: 45 },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supplierId = body.supplierId || req.headers.get("x-supplier-id") || "sup-lonaliza-official";
    const {
      city = "Istanbul",
      vehicleClassId = "vc-vito-vip",
      currency = "USD",
    } = body;

    const cityKey = normalizeTourCityKey(city);
    const durationHours = Number(body.durationHours) || 10;
    const basePriceNum =
      Number(body.baseFullDayPrice) ||
      Number(body.fullDayBasePrice) ||
      Number(body.price) ||
      (cityKey === "trabzon" ? 170 : cityKey === "antalya" ? 160 : cityKey === "cappadocia" ? 170 : 180);
    const extraHourNum = Number(body.extraHourPrice) || 20;

    // Check if partner provided a custom tour title or specific prompt/details
    const isCustomTour = Boolean(
      body.isCustomTour ||
      (body.title && body.title.trim().length > 2) ||
      (body.stopsDetails && body.stopsDetails.trim().length > 2) ||
      (body.prompt && body.prompt.trim().length > 3 && !body.prompt.includes("جميع"))
    );

    if (isCustomTour) {
      // ══════════════════════════════════════════════════════════════════════════
      // MODE 1: CUSTOM VIP TOUR GENERATION (tailored to partner's inputs)
      // ══════════════════════════════════════════════════════════════════════════
      const titleAr = (body.title || body.titleAr || body.prompt || `جولة ${city} السياحية VIP`).trim();
      const stopsDetails = body.stopsDetails || body.details || body.prompt || "";
      const customPaidActivities = body.paidActivities || body.paidActivitiesNote || "";

      // Try Gemini 3.6 Flash for dynamic, rich multilingual tour architecture
      const [{ apiKey }, config] = await Promise.all([resolveGeminiApiKey(), getGeminiPublicConfig()]);
      const model = normalizeGeminiModelId(config.model);
      let aiTourData: any = null;

      if (apiKey) {
        try {
          const tourPrompt = `
You are the AI VIP Tour Architect for Lonaliza Luxury Travel in Turkey and worldwide.
A tour operator/driver wants to create and publish an exclusive VIP day tour:
City / Region: "${city}"
Tour Request / Title: "${titleAr}"
Driver Notes / Requested Highlights: "${stopsDetails}"
Duration: ${durationHours} hours
Base Price: $${basePriceNum}

Generate a comprehensive, luxurious VIP day tour with detailed stops, realistic times, rich multilingual descriptions in Arabic, English, and Turkish.
Respond ONLY with valid JSON (no markdown fences) matching this structure:
{
  "title": {
    "ar": "عنوان الجولة الفاخر بالعربية",
    "en": "Luxury English tour title",
    "tr": "Lüks Türkçe tur başlığı"
  },
  "summary": {
    "ar": "ملخص الجولة بالعربية في سطرين",
    "en": "Two-sentence English summary",
    "tr": "İki cümlelik Türkçe özet"
  },
  "description": {
    "ar": "وصف مفصل للجولة يبرز سيارة مرسيدس فيتو VIP والسائق الخاص والراحة والأنشطة",
    "en": "Detailed English description",
    "tr": "Ayrıntılı Türkçe açıklama"
  },
  "stops": [
    {
      "time": "09:00",
      "name": { "ar": "اسم المحطة بالعربية", "en": "Stop name in English", "tr": "Türkçe durak adı" },
      "description": { "ar": "ما سيفعله العميل في هذه المحطة من أنشطة ومناظر", "en": "Stop details in English", "tr": "Durak detayları" },
      "stayMinutes": 60
    }
  ],
  "inclusions": [
    "سيارة خاصة فاخرة VIP (Mercedes-Benz Vito) بسائق محترف خاص يتحدث العربية",
    "شامل الوقود بالكامل ورسوم كافة الطرق السريعة والأنفاق والجسور ومواقف السيارات",
    "مياه ضيافة باردة وضيافة داخل السيارة وإنترنت واي فاي عالي السرعة",
    "خدمة حصرية ممتدة لمدة ${durationHours} ساعات مع مرونة تامة في التوقف والتصوير"
  ],
  "exclusions": [
    "وجبات الطعام والمشروبات الإضافية الشخصية",
    "التذاكر والأنشطة الترفيهية الاختيارية المدفوعة للعميل"
  ],
  "paidActivities": [
    {
      "nameAr": "اسم النشاط الاختياري",
      "priceEstimate": "التكلفة التقديرية",
      "noteAr": "ملاحظة الدفع في الموقع"
    }
  ]
}
`;
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: tourPrompt }] }],
              generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
            }),
            signal: AbortSignal.timeout(18000),
          });
          if (res.ok) {
            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              aiTourData = JSON.parse(rawText.replace(/```json|```/g, "").trim());
            }
          }
        } catch (err) {
          console.warn("[ai-tour-agent] Gemini custom tour generation fallback:", err);
        }
      }

      const generatedStops = generateTourItineraryStops(titleAr, city, durationHours, stopsDetails);
      const paidActivitiesList = parsePaidActivities(titleAr, customPaidActivities, stopsDetails);

      const inclusions = aiTourData?.inclusions?.length
        ? aiTourData.inclusions
        : [
            "سيارة خاصة فاخرة VIP (Mercedes-Benz Vito) بسائق محترف خاص يتحدث العربية",
            "شامل الوقود بالكامل ورسوم كافة الطرق السريعة والأنفاق والجسور ومواقف السيارات",
            "مياه ضيافة باردة وضيافة داخل السيارة وإنترنت واي فاي عالي السرعة",
            `خدمة حصرية ممتدة لمدة ${durationHours} ساعات مع مرونة تامة في أوقات التوقف والتقاط الصور`,
          ];

      const exclusions = aiTourData?.exclusions?.length
        ? aiTourData.exclusions
        : [
            "وجبات الطعام والمشروبات الإضافية الشخصية",
            "التذاكر والأنشطة الترفيهية الاختيارية المدفوعة للعميل",
          ];

      const finalPaidActivities = aiTourData?.paidActivities?.length
        ? aiTourData.paidActivities
        : paidActivitiesList;

      const uniqueSlug = `tour-${Date.now()}-${slugify(titleAr)}`;

      const itineraryItems = Array.isArray(aiTourData?.stops) && aiTourData.stops.length >= 2
        ? aiTourData.stops.map((s: any, idx: number) => ({
            order: idx + 1,
            name: {
              ar: s.name?.ar || s.titleAr || `محطة ${idx + 1}`,
              en: s.name?.en || s.titleEn || `Stop ${idx + 1}`,
              tr: s.name?.tr || s.titleTr || `Durak ${idx + 1}`,
            },
            description: {
              ar: s.description?.ar || s.descAr || "",
              en: s.description?.en || s.descEn || "",
              tr: s.description?.tr || s.descTr || "",
            },
            kind: "sightseeing" as const,
            stayMinutes: s.stayMinutes || 60,
          }))
        : generatedStops.map((s, idx) => ({
            order: idx + 1,
            name: { ar: s.titleAr, en: s.titleEn, tr: s.titleEn },
            description: { ar: s.descAr, en: s.titleEn, tr: s.titleEn },
            kind: "sightseeing" as const,
            stayMinutes: s.stayMinutes || 60,
          }));

      const newTour = transferStore.saveTour({
        slug: uniqueSlug,
        title: {
          ar: aiTourData?.title?.ar || titleAr,
          en: aiTourData?.title?.en || `${titleAr} VIP Tour`,
          tr: aiTourData?.title?.tr || `${titleAr} VIP Turu`,
        },
        summary: {
          ar: aiTourData?.summary?.ar || `برنامج جولة سياحية VIP متكامل في ${city} لمدة ${durationHours} ساعات، يشمل أهم المحطات الطبيعية والتاريخية مع وقت حر للأنشطة والتسوق.`,
          en: aiTourData?.summary?.en || `Full-day VIP tour in ${city} (${durationHours} hours) with private chauffeur, scenic stops, and flexible itinerary.`,
          tr: aiTourData?.summary?.tr || `${city} ${durationHours} saatlik özel VIP gezi turu.`,
        },
        description: {
          ar: aiTourData?.description?.ar || `برنامج يوم كامل احترافي مصمم لراحة العائلة، يشمل سيارة مرسيدس فيتو VIP خاصة مع سائق يتحدث العربية، والمرور على أهم المحطات السياحية مع توضيح الأنشطة المشمولة والمدفوعة.`,
          en: aiTourData?.description?.en || `Professional full-day VIP tour tailored for families and private groups.`,
        },
        durationHours,
        hubCity: cityKey,
        category: "vip_custom",
        country: "Turkey",
        itinerary: itineraryItems,
        prices: [
          {
            vehicleClassId,
            price: basePriceNum,
            currency,
            minPax: 1,
            maxPax: 8,
          },
        ],
        extraHourPrice: { amount: extraHourNum, currency },
        inclusions,
        exclusions,
        paidActivities: finalPaidActivities,
        driverLanguages: ["ar", "tr", "en"],
        images: [
          { url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80", isCover: true },
        ],
        isActive: true,
      });

      if (supplierId) {
        transferStore.saveSupplierTourOffer({
          supplierId,
          tourId: newTour.id,
          vehicleClassId,
          price: basePriceNum,
          currency,
          isActive: true,
        });
      }

      return NextResponse.json({
        ok: true,
        tour: newTour,
        newlyCreated: true,
        message: `تم إنشاء واعتماد برنامج جولة "${titleAr}" بنجاح (${durationHours} ساعات — $${basePriceNum}) مع خط السير وقائمة الأنشطة المدفوعة!`,
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MODE 2: BATCH SEED & LINK MASTER REGIONAL TOURS
    // ══════════════════════════════════════════════════════════════════════════
    const toursList = TURKEY_MASTER_TOURS[cityKey] || TURKEY_MASTER_TOURS["istanbul"];
    const newlyCreated: any[] = [];
    const existingLinked: any[] = [];

    for (const tDef of toursList) {
      const existingTour = transferStore.getTourByIdOrSlug(tDef.slug);

      if (existingTour) {
        // Ensure existing tour is upgraded with full itinerary and paid activities
        const needsUpgrade = !Array.isArray(existingTour.itinerary) || existingTour.itinerary.length < 3 || !existingTour.paidActivities;
        if (needsUpgrade) {
          transferStore.saveTour({
            ...existingTour,
            itinerary: tDef.stops.map((s, idx) => ({
              order: idx + 1,
              name: { ar: s.titleAr, en: s.titleEn, tr: s.titleEn },
              description: { ar: s.descAr, en: s.titleEn, tr: s.titleEn },
              kind: "sightseeing" as const,
              stayMinutes: 60,
            })),
            paidActivities: parsePaidActivities(tDef.titleAr),
            inclusions: [
              "سيارة مرسيدس فيتو VIP خاصة بسائق محترف يتحدث العربية",
              "الوقود ورسوم كافة الطرق السريعة والجسور",
              "مياه شرب باردة وضيافة مجانية طوال اليوم",
              "إنترنت واي فاي عالي السرعة داخل المركبة",
            ],
            exclusions: ["تذاكر الدخول للمتاحف والأنشطة الاختيارية", "وجبات الغداء الشخصية"],
          });
        }

        if (supplierId) {
          transferStore.saveSupplierTourOffer({
            supplierId,
            tourId: existingTour.id,
            vehicleClassId,
            price: basePriceNum,
            currency,
            isActive: true,
          });
        }

        existingLinked.push({
          tourId: existingTour.id,
          titleAr: existingTour.title?.ar || tDef.titleAr,
          durationHours: existingTour.durationHours || tDef.durationHours,
          companyPrice: basePriceNum,
          currency,
          status: "existing_linked",
        });
      } else {
        const newTour = transferStore.saveTour({
          slug: tDef.slug,
          title: { ar: tDef.titleAr, en: tDef.titleEn, tr: tDef.titleEn },
          summary: { ar: tDef.summaryAr, en: tDef.titleEn, tr: tDef.titleEn },
          description: { ar: tDef.summaryAr, en: tDef.titleEn, tr: tDef.titleEn },
          durationHours: tDef.durationHours,
          hubCity: tDef.hubCity,
          category: tDef.category,
          country: "Turkey",
          itinerary: tDef.stops.map((s, idx) => ({
            order: idx + 1,
            name: { ar: s.titleAr, en: s.titleEn, tr: s.titleEn },
            description: { ar: s.descAr, en: s.titleEn, tr: s.titleEn },
            kind: "sightseeing" as const,
            stayMinutes: 60,
          })),
          prices: [
            {
              vehicleClassId,
              price: basePriceNum,
              currency,
              minPax: 1,
              maxPax: 8,
            },
          ],
          extraHourPrice: { amount: extraHourNum, currency },
          inclusions: [
            "سيارة مرسيدس فيتو VIP خاصة بسائق محترف يتحدث العربية",
            "الوقود ورسوم كافة الطرق السريعة والجسور",
            "مياه شرب باردة وضيافة مجانية طوال اليوم",
            "إنترنت واي فاي عالي السرعة داخل المركبة",
          ],
          exclusions: ["تذاكر الدخول للمتاحف والأنشطة الاختيارية", "وجبات الغداء الشخصية"],
          paidActivities: parsePaidActivities(tDef.titleAr),
          driverLanguages: ["ar", "tr", "en"],
          images: [
            { url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80", isCover: true },
          ],
          isActive: true,
        });

        if (supplierId) {
          transferStore.saveSupplierTourOffer({
            supplierId,
            tourId: newTour.id,
            vehicleClassId,
            price: basePriceNum,
            currency,
            isActive: true,
          });
        }

        newlyCreated.push({
          tourId: newTour.id,
          titleAr: tDef.titleAr,
          durationHours: tDef.durationHours,
          companyPrice: basePriceNum,
          currency,
          status: "newly_created",
        });
      }
    }

    const cityNameAr = cityKey === "trabzon" ? "طرابزون والشمال التركي" : cityKey === "antalya" ? "أنطاليا والساحل الجنوبي" : "إسطنبول الكبرى";

    const aiMessage = `مرحباً بك! بصفتي وكيل برامج الجولات السياحية VIP بالمنصة:\n\n` +
      `✅ **تم تجهيز واعتماد ${toursList.length} برامج جولات سياحية كاملة في ${cityNameAr}**:\n` +
      `• ${newlyCreated.length} برنامج جولة جديد تم نشره في كتالوج المنصة وتثبيت تسعيركم الخاص له.\n` +
      `• ${existingLinked.length} جولات كانت موجودة مسبقاً في النظام العام، **وتم ربط تسعير شركتكم الخاص بها مباشرة دون تكرار البرامج**.\n\n` +
      `💼 التسعير المعتمد لليوم الكامل: $${basePriceNum} (سعر الساعة الإضافية: $${extraHourNum}/ساعة).\n` +
      `تظهر هذه العروض الآن للعملاء عند البحث عن جولات ${cityNameAr} في المتجر بأفضل ترتيب سعر تنافسي.`;

    return NextResponse.json({
      ok: true,
      city: cityKey,
      tours: [...newlyCreated, ...existingLinked],
      newlyCreatedCount: newlyCreated.length,
      existingLinkedCount: existingLinked.length,
      aiMessage,
      message: "تم توليد واعتماد برامج الجولات السياحية بالذكاء الاصطناعي بنجاح",
    });
  } catch (err: any) {
    console.error("[ai-tour-agent error]:", err);
    return NextResponse.json({ ok: false, error: err.message || "فشل توليد الجولات" }, { status: 500 });
  }
}
