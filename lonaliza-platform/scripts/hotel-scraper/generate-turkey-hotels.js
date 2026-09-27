/**
 * Generates src/data/hotels.ts with ~30 Turkey hotels.
 * Run: node scripts/generate-turkey-hotels.js
 */
const fs = require("fs");
const path = require("path");

const IMG = {
  luxury: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80",
  ],
  cave: [
    "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
  ],
  beach: [
    "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1600&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80",
  ],
  nature: [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
  ],
  cabin: [
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600&q=80",
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1600&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80",
  ],
  room: [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
  ],
};

const coords = {
  Istanbul: [41.0082, 28.9784],
  Antalya: [36.8969, 30.7133],
  Trabzon: [41.0027, 39.7168],
  Bursa: [40.1885, 29.061],
  Cappadocia: [38.6431, 34.8289],
  Sapanca: [40.6914, 30.2683],
  Rize: [41.0201, 40.5234],
  Ayder: [40.952, 41.102],
};

function hotel(def) {
  const [lat, lng] = coords[def.city] || coords.Istanbul;
  const images = def.images || IMG.luxury;
  return {
    id: def.id,
    slug: def.slug,
    nameAr: def.nameAr,
    nameEn: def.nameEn,
    city: def.city,
    country: "Turkey",
    neighborhoodAr: def.nAr,
    neighborhoodEn: def.nEn,
    stars: def.stars || 5,
    rating: def.rating || 4.7,
    reviewCount: def.reviews || 1200,
    addressAr: def.addrAr,
    addressEn: def.addrEn,
    descriptionAr: def.descAr,
    descriptionEn: def.descEn,
    highlightsAr: def.hlAr,
    highlightsEn: def.hlEn,
    images,
    amenities: def.amenities || [
      "WiFi",
      "Spa",
      "Restaurant",
      "Fitness Center",
      "Parking",
      "Concierge",
    ],
    nearbyAr: def.nearbyAr || ["معالم المدينة القريبة", "مطاعم محلية", "نقل عام"],
    nearbyEn: def.nearbyEn || ["Nearby city landmarks", "Local restaurants", "Public transport"],
    rooms: [
      {
        id: `${def.id}-r1`,
        nameAr: def.roomAr || "غرفة ديلوكس",
        nameEn: def.roomEn || "Deluxe Room",
        descriptionAr: "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        descriptionEn: "Spacious room with a notable view and daily housekeeping.",
        beds: "1 King",
        capacity: 2,
        sizeSqm: def.size || 38,
        price: def.price || 220,
        currency: "USD",
        amenities: ["WiFi", "Mini Bar", "Safe", "Smart TV"],
        images: IMG.room,
        breakfastIncluded: true,
        freeCancellation: true,
      },
      {
        id: `${def.id}-r2`,
        nameAr: "جناح",
        nameEn: "Suite",
        descriptionAr: "جناح فسيح مع منطقة جلوس منفصلة.",
        descriptionEn: "Spacious suite with a separate seating area.",
        beds: "1 King + Sofa",
        capacity: 3,
        sizeSqm: (def.size || 38) + 25,
        price: Math.round((def.price || 220) * 1.8),
        currency: "USD",
        amenities: ["WiFi", "Lounge", "Bathrobe", "Espresso"],
        images: [IMG.room[1]],
        breakfastIncluded: true,
        freeCancellation: false,
      },
    ],
    lat: lat + (Math.random() - 0.5) * 0.04,
    lng: lng + (Math.random() - 0.5) * 0.04,
    checkIn: "15:00",
    checkOut: "12:00",
    policiesAr: [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00",
      "ممنوع التدخين داخل الغرف",
    ],
    policiesEn: [
      "Check-in from 15:00",
      "Check-out until 12:00",
      "Non-smoking rooms",
    ],
    whatsappNumber: "DEFAULT_WA",
    whatsappMessageAr: `مرحباً الريان للسياحة، أرغب بحجز إقامة في ${def.nameAr}.`,
    whatsappMessageEn: `Hello Alrayyan Tourism, I would like to book a stay at ${def.nameEn}.`,
    phone: def.phone,
    website: def.website,
    isFeatured: !!def.featured,
    isActive: true,
  };
}

const defs = [
  // Istanbul
  { id: "1", slug: "ciragan-palace-kempinski-istanbul", nameAr: "قصر تشراغان كمبينسكي إسطنبول", nameEn: "Çırağan Palace Kempinski Istanbul", city: "Istanbul", nAr: "بشكتاش / البوسفور", nEn: "Beşiktaş / Bosphorus", addrAr: "تشراغان جادسي، بشكتاش، إسطنبول", addrEn: "Çırağan Cad., Beşiktaş, Istanbul", descAr: "القصر العثماني الوحيد على البوسفور الذي يعمل كفندق فاخر من فئة خمس نجوم، مع مسبح لانهائي وإطلالات بوسفور وأجنحة قصور تاريخية.", descEn: "The only Ottoman imperial palace operating as a five-star hotel on the Bosphorus, with an infinity pool, strait views, and historic palace suites.", hlAr: ["قصر عثماني أصلي", "مسبح على البوسفور", "سبا عالمي"], hlEn: ["Authentic Ottoman palace", "Bosphorus infinity pool", "World-class spa"], price: 650, featured: true, stars: 5, rating: 4.8, reviews: 4200 },
  { id: "2", slug: "raffles-istanbul", nameAr: "رافلز إسطنبول", nameEn: "Raffles Istanbul", city: "Istanbul", nAr: "زولرو سنتر / ليفنت", nEn: "Zorlu Center / Levent", addrAr: "زولرو سنتر، بشيكتاش، إسطنبول", addrEn: "Zorlu Center, Beşiktaş, Istanbul", descAr: "فندق فاخر داخل مجمع زولرو مع إطلالات بوسفور، خدمة بتلر، وسبا حاصل على نجوم فوربس.", descEn: "Luxury hotel inside Zorlu Center with Bosphorus views, butler service, and a Forbes Five-Star spa.", hlAr: ["خدمة بتلر", "سبا فوربس", "موقع زولرو"], hlEn: ["Butler service", "Forbes spa", "Zorlu location"], price: 480, featured: true },
  { id: "3", slug: "four-seasons-bosphorus", nameAr: "فور سيزونز البوسفور", nameEn: "Four Seasons Hotel Istanbul at the Bosphorus", city: "Istanbul", nAr: "البوسفور", nEn: "Bosphorus", addrAr: "تشيراغان جادسي، إسطنبول", addrEn: "Çırağan Cad., Istanbul", descAr: "قصر عثماني معاد ترميمه على ضفاف البوسفور مع سبا حمام تركي وحدائق واسعة.", descEn: "A restored Ottoman palace on the Bosphorus with a Turkish hammam spa and expansive gardens.", hlAr: ["موقع على البوسفور", "حمام تركي", "حدائق واسعة"], hlEn: ["Bosphorus setting", "Turkish hammam", "Large gardens"], price: 520, featured: true },
  { id: "4", slug: "shangri-la-bosphorus", nameAr: "شانغريلا البوسفور", nameEn: "Shangri-La Bosphorus Istanbul", city: "Istanbul", nAr: "بشكتاش", nEn: "Beşiktaş", addrAr: "بشكتاش، إسطنبول", addrEn: "Beşiktaş, Istanbul", descAr: "فندق آسيوي فاخر على البوسفور معروف بمطاعمه وسبا CHI وإطلالاته البانورامية.", descEn: "Asian-inspired luxury on the Bosphorus known for dining, CHI spa, and panoramic views.", hlAr: ["سبا CHI", "إطلالة بوسفور", "مطاعم مميزة"], hlEn: ["CHI spa", "Bosphorus views", "Signature dining"], price: 410 },
  { id: "5", slug: "peninsula-istanbul", nameAr: "ذا بينينسولا إسطنبول", nameEn: "The Peninsula Istanbul", city: "Istanbul", nAr: "كاراكوي", nEn: "Karaköy", addrAr: "كاراكوي، إسطنبول", addrEn: "Karaköy, Istanbul", descAr: "أيقونة فخامة حديثة على القرن الذهبي مع خدمة بينينسولا الشهيرة وموقع تاريخي.", descEn: "A modern luxury icon on the Golden Horn with signature Peninsula service and a historic waterfront setting.", hlAr: ["القرن الذهبي", "خدمة فاخرة", "موقع كاراكوي"], hlEn: ["Golden Horn", "Peninsula service", "Karaköy location"], price: 590, featured: true },
  { id: "6", slug: "swissotel-the-bosphorus", nameAr: "سويسوتيل البوسفور", nameEn: "Swissôtel The Bosphorus Istanbul", city: "Istanbul", nAr: "معمار سنان", nEn: "Maçka / Bosphorus", addrAr: "بايلديريم، إسطنبول", addrEn: "Baydildim Cad., Istanbul", descAr: "منتجع حضري بإطلالة بوسفور ومجمع سبا كبير وحدائق خضراء قرب وسط المدينة.", descEn: "Urban resort with Bosphorus views, a large spa complex, and gardens near the city center.", hlAr: ["حدائق واسعة", "سبا كبير", "إطلالة بوسفور"], hlEn: ["Large gardens", "Extensive spa", "Bosphorus views"], price: 280 },
  { id: "7", slug: "cvk-park-bosphorus", nameAr: "سي في كي بارك بوسفور", nameEn: "CVK Park Bosphorus Hotel Istanbul", city: "Istanbul", nAr: "غوموشوي", nEn: "Gümüşsuyu", addrAr: "غوموشوي، إسطنبول", addrEn: "Gümüşsuyu, Istanbul", descAr: "فندق معاصر بإطلالات بوسفور ومسبح خارجي وموقع قريب من تقسيم وشارع الاستقلال.", descEn: "Contemporary hotel with Bosphorus views, an outdoor pool, and a location near Taksim and Istiklal.", hlAr: ["قريب من تقسيم", "مسبح خارجي", "إطلالة بوسفور"], hlEn: ["Near Taksim", "Outdoor pool", "Bosphorus views"], price: 240 },
  { id: "8", slug: "pera-palace-hotel", nameAr: "فندق بيرا بالاس", nameEn: "Pera Palace Hotel", city: "Istanbul", nAr: "بيرا / تكسم", nEn: "Pera / Tepebaşı", addrAr: "مسروتية جادسي، إسطنبول", addrEn: "Mesrutiyet Cad., Istanbul", descAr: "فندق تاريخي من عصر قطار الشرق السريع، يجمع بين الطابع الكلاسيكي والفخامة الحديثة في قلب بيرا.", descEn: "Historic Orient Express-era hotel blending classic character with modern luxury in the heart of Pera.", hlAr: ["تاريخ الشرق السريع", "حي بيرا", "طابع كلاسيكي"], hlEn: ["Orient Express heritage", "Pera district", "Classic character"], price: 320, featured: true },
  { id: "9", slug: "ritz-carlton-istanbul", nameAr: "ريتز كارلتون إسطنبول", nameEn: "The Ritz-Carlton, Istanbul", city: "Istanbul", nAr: "بشكتاش", nEn: "Beşiktaş", addrAr: "سزايرلر جادسي، إسطنبول", addrEn: "Suzer Plaza, Istanbul", descAr: "فندق ريتز كارلتون المطل على البوسفور مع سبا وحمام تركي وخدمة كونسيرج راقية.", descEn: "Bosphorus-facing Ritz-Carlton with spa, Turkish hammam, and refined concierge service.", hlAr: ["حمام تركي", "إطلالة بوسفور", "خدمة ريتز"], hlEn: ["Turkish hammam", "Bosphorus view", "Ritz service"], price: 390 },
  { id: "10", slug: "ajia-hotel-istanbul", nameAr: "أجيا هوتيل إسطنبول", nameEn: "A'jia Hotel Istanbul", city: "Istanbul", nAr: "كانديلي / الجانب الآسيوي", nEn: "Kandilli / Asian side", addrAr: "كانديلي، إسطنبول", addrEn: "Kandilli, Istanbul", descAr: "بوتيك فاخر في قصر على الجانب الآسيوي من البوسفور، هادئ وإطلالات مائية مباشرة.", descEn: "Boutique luxury in a waterside mansion on the Asian Bosphorus — quiet, intimate, and scenic.", hlAr: ["جانب آسيوي", "بوتيك هادئ", "على الماء"], hlEn: ["Asian side", "Quiet boutique", "Waterfront"], price: 350 },

  // Antalya
  { id: "11", slug: "rixos-premium-belek", nameAr: "ريكوسس بريميوم بيليك", nameEn: "Rixos Premium Belek", city: "Antalya", nAr: "بيليك", nEn: "Belek", addrAr: "بيليك، أنطاليا", addrEn: "Belek, Antalya", descAr: "منتجع شامل فاخر على شاطئ بيليك مع ألعاب مائية وملاعب غولف وخيارات عائلية واسعة.", descEn: "Ultra all-inclusive beach resort in Belek with water sports, golf access, and extensive family facilities.", hlAr: ["شاطئ خاص", "أول إنكلوسف", "جولف"], hlEn: ["Private beach", "All-inclusive", "Golf"], price: 380, featured: true, images: IMG.beach },
  { id: "12", slug: "maxx-royal-kemer", nameAr: "ماكس رويال كيمر", nameEn: "Maxx Royal Kemer Resort", city: "Antalya", nAr: "كيمر", nEn: "Kemer", addrAr: "كيمر، أنطاليا", addrEn: "Kemer, Antalya", descAr: "منتجع ماكس رويال الفاخر بين الجبال والبحر المتوسط مع فلل خاصة وخدمة ماكس إيمو.", descEn: "Maxx Royal luxury between the Taurus mountains and the Mediterranean, with private villas and Maxximo service.", hlAr: ["فلل خاصة", "بحر وجبال", "خدمة ماكس"], hlEn: ["Private villas", "Sea & mountains", "Maxximo service"], price: 520, featured: true, images: IMG.beach },
  { id: "13", slug: "akra-antalya", nameAr: "أكرا أنطاليا", nameEn: "Akra Antalya", city: "Antalya", nAr: "لارا / وسط أنطاليا", nEn: "Lara / City", addrAr: "شارع أتيلي، أنطاليا", addrEn: "Atatürk Cad., Antalya", descAr: "فندق حضري أنيق مطل على البحر في أنطاليا مع مطاعم راقية ومسبح إنفينيتي.", descEn: "Stylish urban hotel overlooking the Antalya seafront with fine dining and an infinity pool.", hlAr: ["موقع حضري", "إطلالة بحر", "مطاعم"], hlEn: ["City location", "Sea views", "Dining"], price: 210, images: IMG.beach },
  { id: "14", slug: "calista-luxury-resort", nameAr: "كاليستا لاكشري ريزورت", nameEn: "Calista Luxury Resort", city: "Antalya", nAr: "بيليك", nEn: "Belek", addrAr: "بيليك، أنطاليا", addrEn: "Belek, Antalya", descAr: "منتجع فاخر في بيليك معروف بالسبا الشامل والشاطئ الخاص والبرامج العائلية.", descEn: "Belek luxury resort known for its extensive spa, private beach, and family programs.", hlAr: ["سبا واسع", "شاطئ خاص", "عائلي"], hlEn: ["Large spa", "Private beach", "Family-friendly"], price: 340, images: IMG.beach },
  { id: "15", slug: "regnum-carya", nameAr: "ريجنوم كاريا", nameEn: "Regnum Carya Golf & Spa Resort", city: "Antalya", nAr: "بيليك", nEn: "Belek", addrAr: "بيليك، أنطاليا", addrEn: "Belek, Antalya", descAr: "منتجع غولف وسبا فاخر في بيليك مع شاطئ خاص وملاعب بطولات.", descEn: "Golf and spa resort in Belek with a private beach and championship courses.", hlAr: ["جولف بطولات", "سبا", "شاطئ"], hlEn: ["Championship golf", "Spa", "Beach"], price: 360, images: IMG.beach },

  // Cappadocia
  { id: "16", slug: "museum-hotel-cappadocia", nameAr: "ميوزيوم هوتيل كابادوكيا", nameEn: "Museum Hotel Cappadocia", city: "Cappadocia", nAr: "أوتشيسار", nEn: "Uçhisar", addrAr: "أوتشيسار، نيفشهير", addrEn: "Uçhisar, Nevşehir", descAr: "فندق كهفي فاخر بإطلالة على وادي كابادوكيا، غرف منحوتة في الصخر ومجموعة مقتنيات فنية.", descEn: "Luxury cave hotel overlooking Cappadocia valleys — rock-carved rooms and curated art pieces.", hlAr: ["غرف كهفية", "إطلالة وادي", "فنون"], hlEn: ["Cave rooms", "Valley views", "Art collection"], price: 420, featured: true, images: IMG.cave },
  { id: "17", slug: "argos-in-cappadocia", nameAr: "أرغوس في كابادوكيا", nameEn: "Argos in Cappadocia", city: "Cappadocia", nAr: "أوتشيسار", nEn: "Uçhisar", addrAr: "أوتشيسار، نيفشهير", addrEn: "Uçhisar, Nevşehir", descAr: "مجموعة منازل حجرية وكهوف مرممة في أوتشيسار مع مطعم حائز على جوائز وإطلالات غروب.", descEn: "Restored stone houses and caves in Uçhisar with an acclaimed restaurant and sunset views.", hlAr: ["منازل حجرية", "مطعم مميز", "غروب"], hlEn: ["Stone houses", "Acclaimed dining", "Sunsets"], price: 390, featured: true, images: IMG.cave },
  { id: "18", slug: "kayakapi-premium-caves", nameAr: "كايا كابي بريميوم كيفز", nameEn: "Kayakapi Premium Caves Cappadocia", city: "Cappadocia", nAr: "أورغوب", nEn: "Ürgüp", addrAr: "أورغوب، نيفشهير", addrEn: "Ürgüp, Nevşehir", descAr: "منتجع كهفي في حي كايا كابي التاريخي يجمع بين التراث والرفاهية الحديثة.", descEn: "Cave resort in the historic Kayakapi quarter combining heritage architecture with modern comfort.", hlAr: ["حي تاريخي", "كهوف فاخرة", "سبا"], hlEn: ["Historic quarter", "Luxury caves", "Spa"], price: 280, images: IMG.cave },
  { id: "19", slug: "cappadocia-cave-resort", nameAr: "كابادوكيا كيف ريزورت آند سبا", nameEn: "Cappadocia Cave Resort & Spa", city: "Cappadocia", nAr: "أورغوب", nEn: "Ürgüp", addrAr: "أورغوب", addrEn: "Ürgüp, Nevşehir", descAr: "منتجع كهفي مع سبا ومسبح وإطلالات على مداخن الجن الشهيرة.", descEn: "Cave resort with spa, pool, and views toward the famous fairy chimneys.", hlAr: ["سبا", "مسبح", "مداخن الجن"], hlEn: ["Spa", "Pool", "Fairy chimneys"], price: 230, images: IMG.cave },

  // Trabzon
  { id: "20", slug: "zorlu-grand-trabzon", nameAr: "زورلو جراند طرابزون", nameEn: "Zorlu Grand Hotel Trabzon", city: "Trabzon", nAr: "وسط طرابزون", nEn: "Trabzon Center", addrAr: "وسط طرابزون", addrEn: "Trabzon city center", descAr: "أبرز فنادق خمس نجوم في طرابزون، موقع مركزي مناسب لرحلات البحر الأسود وسوميلة.", descEn: "Leading five-star hotel in Trabzon with a central base for Black Sea and Sümela trips.", hlAr: ["خمس نجوم", "موقع مركزي", "بوابة سوميلة"], hlEn: ["Five-star", "Central location", "Sümela gateway"], price: 180, featured: true, images: IMG.nature },
  { id: "21", slug: "novotel-trabzon", nameAr: "نوفوتيل طرابزون", nameEn: "Novotel Trabzon", city: "Trabzon", nAr: "يومرا / المطار", nEn: "Yomra / Airport area", addrAr: "يومرا، طرابزون", addrEn: "Yomra, Trabzon", descAr: "فندق عملي حديث قريب من مطار طرابزون مع غرف مريحة ومرافق أعمال.", descEn: "Modern practical hotel near Trabzon Airport with comfortable rooms and business facilities.", hlAr: ["قرب المطار", "غرف حديثة", "مناسب للعائلات"], hlEn: ["Near airport", "Modern rooms", "Family-friendly"], price: 120, stars: 4, images: IMG.nature },
  { id: "22", slug: "radisson-blu-trabzon", nameAr: "رادسون بلو طرابزون", nameEn: "Radisson Blu Hotel Trabzon", city: "Trabzon", nAr: "وسط المدينة", nEn: "City center", addrAr: "طرابزون", addrEn: "Trabzon", descAr: "فندق دولي في طرابزون مع إطلالات بحرية جزئية ومطعم وسبا خفيف.", descEn: "International brand hotel in Trabzon with partial sea views, dining, and a wellness area.", hlAr: ["علامة دولية", "موقع حضري", "إطلالة بحر"], hlEn: ["International brand", "Urban location", "Sea views"], price: 150, images: IMG.nature },

  // Bursa
  { id: "23", slug: "swissotel-uludag-bursa", nameAr: "سويسوتيل أولوداغ بورصة", nameEn: "Swissôtel Uludağ Bursa Resort", city: "Bursa", nAr: "أولوداغ", nEn: "Uludağ", addrAr: "أولوداغ، بورصة", addrEn: "Uludağ, Bursa", descAr: "منتجع جبلي على أولوداغ مثالي للتزلج في الشتاء والطبيعة في الصيف.", descEn: "Mountain resort on Uludağ ideal for winter skiing and summer nature escapes.", hlAr: ["جبل أولوداغ", "تزلج", "منتجع جبلي"], hlEn: ["Mount Uludağ", "Skiing", "Mountain resort"], price: 260, featured: true, images: IMG.nature },
  { id: "24", slug: "kervansaray-bursa", nameAr: "كرفانسراي بورصة", nameEn: "Kervansaray Bursa Hotel", city: "Bursa", nAr: "وسط بورصة", nEn: "Bursa Center", addrAr: "بورصة", addrEn: "Bursa center", descAr: "فندق كلاسيكي معروف في وسط بورصة، قاعدة مريحة لزيارة المسجد الأخضر والأسواق.", descEn: "Well-known classic hotel in central Bursa — a comfortable base for the Green Mosque and bazaars.", hlAr: ["وسط المدينة", "قريب من المعالم", "كلاسيكي"], hlEn: ["City center", "Near landmarks", "Classic hotel"], price: 110, stars: 4 },
  { id: "25", slug: "holiday-inn-bursa", nameAr: "هوليداي إن بورصة", nameEn: "Holiday Inn Bursa - City Centre", city: "Bursa", nAr: "نيلوفر", nEn: "Nilüfer / Center", addrAr: "بورصة", addrEn: "Bursa", descAr: "فندق دولي حديث في بورصة مع غرف عملية ومرافق اجتماعات.", descEn: "Modern international hotel in Bursa with practical rooms and meeting facilities.", hlAr: ["علامة دولية", "غرف حديثة", "اجتماعات"], hlEn: ["International brand", "Modern rooms", "Meetings"], price: 130, stars: 4 },

  // Sapanca
  { id: "26", slug: "sapanca-lake-houses", nameAr: "أكواخ بحيرة سبانجا", nameEn: "Sapanca Lake Houses & Cabins", city: "Sapanca", nAr: "ضفاف البحيرة", nEn: "Lake shore", addrAr: "سبانجا، سكاريا", addrEn: "Sapanca, Sakarya", descAr: "كبائن وبيوت خشبية على بحيرة سبانجا — هدوء الطبيعة على بعد ساعة تقريباً من إسطنبول.", descEn: "Wooden cabins and lake houses on Sapanca — nature calm about an hour from Istanbul.", hlAr: ["كبائن خشبية", "بحيرة", "قريب من إسطنبول"], hlEn: ["Wooden cabins", "Lakeside", "Near Istanbul"], price: 160, featured: true, images: IMG.cabin, stars: 4 },
  { id: "27", slug: "ng-sapanca-wellness", nameAr: "إن جي سبانجا ويلنس", nameEn: "NG Sapanca Wellness & Convention", city: "Sapanca", nAr: "سبانجا", nEn: "Sapanca", addrAr: "سبانجا", addrEn: "Sapanca, Sakarya", descAr: "منتجع ويلنس ومؤتمرات في سبانجا مع سبا ومسابح وإطلالات خضراء.", descEn: "Wellness and convention resort in Sapanca with spa, pools, and green views.", hlAr: ["ويلنس", "سبا", "طبيعة"], hlEn: ["Wellness", "Spa", "Nature"], price: 190, images: IMG.cabin },
  { id: "28", slug: "sapanca-glamping-suites", nameAr: "جلامبينج سبانجا", nameEn: "Sapanca Glamping Suites", city: "Sapanca", nAr: "غابات سبانجا", nEn: "Sapanca forest", addrAr: "سبانجا", addrEn: "Sapanca forests", descAr: "وحدات جلامبينج فاخرة وسط الأشجار مع تجهيزات فندقية لعطلة طبيعية مريحة.", descEn: "Upscale glamping suites among the trees with hotel-grade comfort for a soft nature escape.", hlAr: ["جلامبينج", "غابة", "خصوصية"], hlEn: ["Glamping", "Forest", "Privacy"], price: 140, stars: 4, images: IMG.cabin },

  // Rize / Ayder
  { id: "29", slug: "ayder-plateau-resort", nameAr: "منتجع هضبة آيدر", nameEn: "Ayder Plateau Resort", city: "Ayder", nAr: "آيدر", nEn: "Ayder Plateau", addrAr: "آيدر، ريزا", addrEn: "Ayder, Rize", descAr: "إقامة جبلية على هضبة آيدر بين الينابيع الحارة والشلالات ومناظر البحر الأسود الخضراء.", descEn: "Mountain stay on Ayder Plateau among hot springs, waterfalls, and lush Black Sea scenery.", hlAr: ["هضبة آيدر", "ينابيع حارة", "شلالات"], hlEn: ["Ayder plateau", "Hot springs", "Waterfalls"], price: 130, featured: true, images: IMG.nature, stars: 4 },
  { id: "30", slug: "rize-tea-garden-hotel", nameAr: "فندق حدائق الشاي ريزا", nameEn: "Rize Tea Garden Hotel", city: "Rize", nAr: "ريزا", nEn: "Rory", addrAr: "ريزا", addrEn: "Rory", descAr: "فندق مطل على تلال الشاي في ريزا — قاعدة مثالية لرحلات آيدر ومزارع الشاي.", descEn: "Hotel overlooking Rize tea hills — an ideal base for Ayder trips and tea plantation visits.", hlAr: ["تلال الشاي", "بوابة آيدر", "طبيعة"], hlEn: ["Tea hills", "Ayder gateway", "Nature"], price: 100, stars: 4, images: IMG.nature },
];

// Fix Rize city names that may have been mistyped as Rory in this script source
for (const d of defs) {
  if (d.city === "Rory") d.city = "Ri" + "ze";
  if (d.nameEn && d.nameEn.includes("Rory")) d.nameEn = d.nameEn.split("Rory").join("Ri" + "ze");
  if (d.nEn && d.nEn.includes("Rory")) d.nEn = d.nEn.split("Rory").join("Ri" + "ze");
  if (d.addrEn && d.addrEn.includes("Rory")) d.addrEn = d.addrEn.split("Rory").join("Ri" + "ze");
  if (d.descEn && d.descEn.includes("Rory")) d.descEn = d.descEn.split("Rory").join("Ri" + "ze");
}

coords["Ri" + "ze"] = coords.Rize || coords.Rize;
coords["Ri" + "ze"] = [41.0201, 40.5234];

const hotels = defs.map(hotel);

function serialize(obj) {
  return JSON.stringify(obj, null, 2)
    .replace(/"DEFAULT_WA"/g, "DEFAULT_WA")
    .replace(/"([^"]+)":/g, "$1:");
}

const out = `import type { Hotel, HotelInput } from "@/types/hotel";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";

const STORAGE_KEY = "alrayyan_hotels_v3";
const OLD_STORAGE_KEYS = ["oktravel_hotels_v2", "oktravel_hotels", "alrayyan_hotels_v2"];
const DEFAULT_WA = DEFAULT_SITE_WHATSAPP;

export const defaultHotels: Hotel[] = ${serialize(hotels).replace(/DEFAULT_WA/g, "DEFAULT_WA")};

function save(hotels: Hotel[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
}

function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeRoom(room: Record<string, unknown>, index: number) {
  return {
    id: String(room.id || \`r\${Date.now()}-\${index}\`),
    nameAr: String(room.nameAr || ""),
    nameEn: String(room.nameEn || ""),
    descriptionAr: String(room.descriptionAr || ""),
    descriptionEn: String(room.descriptionEn || ""),
    beds: String(room.beds || "1 King"),
    capacity: Number(room.capacity) || 2,
    sizeSqm: Number(room.sizeSqm) || 0,
    price: Number(room.price) || 0,
    currency: String(room.currency || "USD"),
    amenities: parseListField(room.amenities),
    images: parseListField(room.images),
    breakfastIncluded: Boolean(room.breakfastIncluded),
    freeCancellation: Boolean(room.freeCancellation),
  };
}

function migrateIfNeeded(hotels: Hotel[]): Hotel[] {
  return hotels.map((raw) => {
    const h = raw as Hotel & Record<string, unknown>;
    const rooms = Array.isArray(h.rooms)
      ? h.rooms.map((r, i) =>
          normalizeRoom(r as unknown as Record<string, unknown>, i)
        )
      : [];

    return {
      id: String(h.id),
      slug: String(h.slug || ""),
      nameAr: String(h.nameAr || ""),
      nameEn: String(h.nameEn || ""),
      city: String(h.city || ""),
      country: String(h.country || "Turkey"),
      neighborhoodAr: String(h.neighborhoodAr || h.city || ""),
      neighborhoodEn: String(h.neighborhoodEn || h.city || ""),
      stars: Number(h.stars) || 5,
      rating: Number(h.rating) || 0,
      reviewCount: Number(h.reviewCount) || 0,
      addressAr: String(h.addressAr || ""),
      addressEn: String(h.addressEn || ""),
      descriptionAr: String(h.descriptionAr || ""),
      descriptionEn: String(h.descriptionEn || ""),
      highlightsAr: parseListField(h.highlightsAr),
      highlightsEn: parseListField(h.highlightsEn),
      images: parseListField(h.images),
      amenities: parseListField(h.amenities),
      nearbyAr: parseListField(h.nearbyAr),
      nearbyEn: parseListField(h.nearbyEn),
      rooms,
      lat: Number(h.lat) || 41.0082,
      lng: Number(h.lng) || 28.9784,
      checkIn: String(h.checkIn || "15:00"),
      checkOut: String(h.checkOut || "12:00"),
      policiesAr: parseListField(h.policiesAr),
      policiesEn: parseListField(h.policiesEn),
      whatsappNumber: String(h.whatsappNumber || DEFAULT_WA),
      whatsappMessageAr:
        String(h.whatsappMessageAr || "") ||
        \`مرحباً، أرغب بالحجز في \${h.nameAr || "هذا الفندق"}\`,
      whatsappMessageEn:
        String(h.whatsappMessageEn || "") ||
        \`Hello, I would like to book at \${h.nameEn || "this hotel"}\`,
      phone: h.phone ? String(h.phone) : undefined,
      website: h.website ? String(h.website) : undefined,
      isFeatured: Boolean(h.isFeatured),
      isActive: h.isActive !== false,
    } satisfies Hotel;
  });
}

function clearLegacyKeys() {
  for (const key of OLD_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export function getHotels(): Hotel[] {
  if (typeof window === "undefined") return defaultHotels;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return migrateIfNeeded(JSON.parse(stored) as Hotel[]);
    } catch {
      return defaultHotels;
    }
  }

  clearLegacyKeys();
  save(defaultHotels);
  return defaultHotels;
}

export function getActiveHotels(): Hotel[] {
  return getHotels().filter((h) => h.isActive);
}

export function getFeaturedHotels(): Hotel[] {
  return getActiveHotels().filter((h) => h.isFeatured);
}

export function getHotelBySlug(slug: string): Hotel | undefined {
  return getHotels().find((h) => h.slug === slug);
}

export function getHotelById(id: string): Hotel | undefined {
  return getHotels().find((h) => h.id === id);
}

export function addHotel(input: HotelInput): Hotel {
  const hotels = getHotels();
  const hotel: Hotel = { ...input, id: Date.now().toString() };
  hotels.unshift(hotel);
  save(hotels);
  return hotel;
}

export function updateHotel(id: string, data: Partial<Hotel>): Hotel | null {
  const hotels = getHotels();
  const idx = hotels.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  hotels[idx] = { ...hotels[idx], ...data, id };
  save(hotels);
  return hotels[idx];
}

export function deleteHotel(id: string): boolean {
  save(getHotels().filter((h) => h.id !== id));
  return true;
}

export function resetHotels() {
  clearLegacyKeys();
  save(defaultHotels);
}
`;

const target = path.join("src", "data", "hotels.ts");
fs.writeFileSync(target, out);
console.log("Wrote", target, "hotels:", hotels.length, "cities:", [...new Set(hotels.map((h) => h.city))]);
