const JUNK =
  /province|district|municipality|metropolitan|governorate|prefecture|belediyesi|ilçesi|محافظة|ولاية|إقليم|مقاطعة|\btoki\b|housing|apartment|apartmanı|site konut|sitesi|daire|köyü|köyü camii|yaylacık|wikipedia|wikimedia|disambiguation|^list of|^category:|census|population|\bvillage\b|\bmahallesi\b|\bprimary school\b|\bbelediye\b|cemetery|graveyard|mezarlık|mezarlığı|مقبرة|مدافن|türbe|türbesi|şehitlik|kabristan|çeşme|çeşmesi|sebil|fountain|water fountain|höyük|tumulus|mound|lise|ortaokul|ilkokul|yurt\b|dormitory|eczane|pharmacy|hastane|hospital|sağlık ocağı|oto sanayi|car wash|benzinlik|gas station|petrol|sanayi sitesi|university|üniversite|fakülte|fakültesi|bölümü|department of|enstitü|clinic|poliklinik|cerrahpasa|cerrahpaşa|küçükçekmece|kucukcekmece|ancient roman ruins|postal\b|post office|المتحف البريدي|بوستة العتبة|sporting club|racing club|horse racing|سباق الخيل|نادي الجزيرة|medical museum|متحف طبي|قصر العيني|agricultural museum|المتحف الزراعي|geological museum|المتحف الجيولوجي|railway museum|السكة الحديد|police museum|متحف الشرطة|embassy|consulate|سفارة|قنصلية|solar boat museum|مركب الجيزة|mastaba of|pyramid g[0-9]|gurob\b|mazghuna|\b(metro|مترو|كشك|kiosk|station|محطة مترو|محطة قطار|bus stop)\b|متحف الشمع|wax museum|textile museum|سعد زغلول|المريوطية|المشربية|كوبري قصر النيل|تمثال (?!أبو الهول|رمسيس)/i;

const WEAK_WORSHIP =
  /camii$|cami \(|kilise$|église|\bmosque\b|\bchurch\b|مسجد (?!السلطان|آيا|الأزرق)/i;

const FAMOUS_WORSHIP =
  /hagia|ayasofya|aya sofya|sultanahmet|blue mosque|süleymaniye|suleymaniye|ortakoy|ortaköy|yeni cami|ulu cami|selimiye|fatih mosque|eyup|eyüp|lala mustafa|nuruosmaniye|sumela|sümela|sagrada|sagrada família|notre dame|sacré-cœur|st peter|saint peter|duomo/i;

const TOURIST =
  /museum|castle|palace|valley|cave|underground|balloon|open.?air|viewpoint|park|tower|bridge|bazaar|market|waterfall|cathedral|basilica|fort|garden|beach|harbor|harbour|old town|medina|pyramid|anıtkabir|anitkabir|taj mahal|amphitheatre|ruins|canyon|fairy|chimney|pasabag|paşabağ|devrent|ihlara|zelve|sumela|uzungol|hagia|topkapi|bosphorus|galata|clock tower|minaret|plaza|square|pigeon valley|love valley|red valley|rose valley|ortahisar|avanos|lake|göl|golu|monastery|manastir|plateau|yayla|hill|tepe|mansion|kosk|köşk|national park|waterfall|şelale|kale|castle|cave|mağara|gaudí|gaudi|batlló|casa milà|rambla|boqueria|barri gòtic|montjuïc|camp nou|tibidabo|متحف|قصر|قلعة|وادي|كهف|منطاد|شلال|سوق|برج|ميدان|شاطئ|بحيرة|دير|هضبة|مدينة تحت/i;

const ADMIN_BLURB =
  /\bis a (large )?city\b|\bis a province\b|\bis a district\b|\bis a town\b|\bis a village\b|\bsead of\b|\bcapital of\b|\bpopulation is\b/i;

const BARE_DEST =
  /^(göreme|goreme|cappadocia|kapadokya|nevşehir|nevsehir|kayseri|aksaray|ürgüp|urgup|the city)$/i;

const BARE_GEO =
  /^(the )?[\p{L}\s]{0,24}(province|region|district|governorate|municipality|city|town|köyü|köy)$/iu;

export function isJunkPlaceTitle(title: string): boolean {
  const t = String(title || "").trim();
  if (!t || t.length < 4) return true;
  if (BARE_GEO.test(t) || BARE_DEST.test(t)) return true;
  if (JUNK.test(t) && !/taj mahal|pyramid|anıtkabir/i.test(t)) return true;
  if (WEAK_WORSHIP.test(t) && !FAMOUS_WORSHIP.test(t) && !TOURIST.test(t)) return true;
  return false;
}

export function isTouristPoi(p: {
  titleEn?: string;
  titleAr?: string;
  detailEn?: string;
  detailAr?: string;
  image?: string;
  kind?: string;
  source?: string;
}): boolean {
  if (p.kind === "hotel" || p.kind === "airport" || p.kind === "transfer") return false;
  const title = `${p.titleEn || ""} ${p.titleAr || ""}`.trim();
  if (isJunkPlaceTitle(p.titleEn || "") || isJunkPlaceTitle(p.titleAr || "")) return false;
  if (WEAK_WORSHIP.test(title) && !FAMOUS_WORSHIP.test(title) && !TOURIST.test(title)) return false;
  if (ADMIN_BLURB.test(p.detailEn || "") && !TOURIST.test(title)) return false;
  if (p.source === "osm" && !TOURIST.test(title) && !p.image) return false;
  return true;
}

export function rankTouristPoi(p: {
  titleEn?: string;
  titleAr?: string;
  detailEn?: string;
  detailAr?: string;
  image?: string;
  popularity?: number;
  source?: string;
}): number {
  const blob = `${p.titleEn || ""} ${p.titleAr || ""} ${p.detailEn || ""}`;
  let score = 0;
  if (p.image) score += 12;
  if (p.detailEn || p.detailAr) score += 5;
  if (p.source === "google_places_live" || p.source === "google_places") score += 20;
  else if (p.source === "catalog") score += 16;
  else if (p.source === "wikidata") score += 8;
  else if (p.source === "wikipedia") score += 6;
  score += Math.min(16, (p.popularity || 0) / 5);
  if (TOURIST.test(blob)) score += 14;
  if (FAMOUS_WORSHIP.test(blob)) score += 8;
  if (WEAK_WORSHIP.test(blob) && !FAMOUS_WORSHIP.test(blob)) score -= 16;
  if (JUNK.test(blob)) score -= 24;
  return score;
}
