import 'package:flutter/widgets.dart';

String _resolveI18nOrString(
  dynamic raw,
  BuildContext context, {
  String fallback = '',
}) {
  if (raw == null) return fallback;
  if (raw is String) return raw.trim().isNotEmpty ? raw.trim() : fallback;
  if (raw is Map) {
    final code = Localizations.localeOf(context).languageCode;
    final val = raw[code] ?? raw['ar'] ?? raw['en'] ?? raw['tr'];
    if (val != null) {
      final s = '$val'.trim();
      if (s.isNotEmpty) return s;
    }
  }
  final str = '$raw'.trim();
  return str.isNotEmpty ? str : fallback;
}

/// Resolve localized text from platform i18n maps or string values
String catalogI18nText(
  dynamic i18n,
  BuildContext context, {
  String fallback = '',
}) {
  return _resolveI18nOrString(i18n, context, fallback: fallback);
}

final Map<String, Map<String, String>> _knownZoneNames = {
  // Istanbul & Marmara
  'zone-ist-airport': {'ar': 'مطار إسطنبول الدولي (IST)', 'en': 'Istanbul Airport (IST)', 'tr': 'İstanbul Havalimanı (IST)'},
  'zone-istanbul_airport': {'ar': 'مطار إسطنبول الدولي (IST)', 'en': 'Istanbul Airport (IST)', 'tr': 'İstanbul Havalimanı (IST)'},
  'zone-saw-airport': {'ar': 'مطار صبيحة كوكجن (SAW)', 'en': 'Sabiha Gokcen Airport (SAW)', 'tr': 'Sabiha Gökçen Havalimanı (SAW)'},
  'zone-sabiha_gokcen': {'ar': 'مطار صبيحة كوكجن (SAW)', 'en': 'Sabiha Gokcen Airport (SAW)', 'tr': 'Sabiha Gökçen Havalimanı (SAW)'},
  'zone-taksim': {'ar': 'تقسيم وبي أوغلو', 'en': 'Taksim & Beyoglu', 'tr': 'Taksim & Beyoğlu'},
  'zone-taksim_beyoglu': {'ar': 'تقسيم وبي أوغلو', 'en': 'Taksim & Beyoglu', 'tr': 'Taksim & Beyoğlu'},
  'zone-sultanahmet': {'ar': 'السلطان أحمد والفاتح', 'en': 'Sultanahmet & Fatih', 'tr': 'Sultanahmet & Fatih'},
  'zone-sisli': {'ar': 'شيشلي ومجدية كوي', 'en': 'Sisli & Mecidiyekoy', 'tr': 'Şişli & Mecidiyeköy'},
  'zone-besiktas': {'ar': 'بشكتاش وأورتاكوي', 'en': 'Besiktas & Ortakoy', 'tr': 'Beşiktaş & Ortaköy'},
  'zone-kadikoy': {'ar': 'كاديكوي (الجانب الآسيوي)', 'en': 'Kadikoy (Asian Side)', 'tr': 'Kadıköy'},
  'zone-basaksehir': {'ar': 'باشاك شهير', 'en': 'Basaksehir', 'tr': 'Başakşehir'},
  'zone-bursa': {'ar': 'بورصة وجبل أولوداغ', 'en': 'Bursa & Uludag', 'tr': 'Bursa'},
  'zone-sapanca': {'ar': 'سبانجا والمعشوقية', 'en': 'Sapanca & Masukiye', 'tr': 'Sapanca & Maşukiye'},
  'zone-yalova': {'ar': 'يالوفا والترمال', 'en': 'Yalova & Termal', 'tr': 'Yalova'},

  // Trabzon & Black Sea
  'zone-trabzon-apt': {'ar': 'مطار طرابزون (TZX)', 'en': 'Trabzon Airport (TZX)', 'tr': 'Trabzon Havalimanı (TZX)'},
  'zone-trabzon_airport': {'ar': 'مطار طرابزون (TZX)', 'en': 'Trabzon Airport (TZX)', 'tr': 'Trabzon Havalimanı (TZX)'},
  'zone-trabzon_center': {'ar': 'وسط طرابزون (الميدان)', 'en': 'Trabzon City Center', 'tr': 'Trabzon Meydan'},
  'zone-uzungol': {'ar': 'بحيرة أوزنجول', 'en': 'Uzungol Lake', 'tr': 'Uzungöl'},
  'zone-ayder': {'ar': 'هضبة آيدر (ريزا)', 'en': 'Ayder Plateau (Rize)', 'tr': 'Ayder Yaylası'},
  'zone-rize_airport': {'ar': 'مطار ريزا-أرتفين (RZV)', 'en': 'Rize-Artvin Airport (RZV)', 'tr': 'Rize-Artvin Havalimanı'},
  'zone-sumela': {'ar': 'دير سوميلا ومتشكا', 'en': 'Sumela Monastery', 'tr': 'Sümela Manastırı'},

  // Antalya & Mediterranean
  'zone-antalya-apt': {'ar': 'مطار أنطاليا الدولي (AYT)', 'en': 'Antalya Airport (AYT)', 'tr': 'Antalya Havalimanı (AYT)'},
  'zone-antalya_airport': {'ar': 'مطار أنطاليا الدولي (AYT)', 'en': 'Antalya Airport (AYT)', 'tr': 'Antalya Havalimanı (AYT)'},
  'zone-antalya_center': {'ar': 'وسط أنطاليا وكاليتشي', 'en': 'Antalya Center & Kaleici', 'tr': 'Antalya Merkez & Kaleiçi'},
  'zone-belek': {'ar': 'بيليك ومنتجعات الغولف', 'en': 'Belek Resorts', 'tr': 'Belek'},
  'zone-kemer': {'ar': 'كيمير ومارينا', 'en': 'Kemer & Marina', 'tr': 'Kemer'},
  'zone-side': {'ar': 'سيدي والآثار الرومانية', 'en': 'Side & Manavgat', 'tr': 'Side'},
  'zone-alanya': {'ar': 'ألانيا وقلعة البحر', 'en': 'Alanya & Castle', 'tr': 'Alanya'},
  'zone-kas_kalkan': {'ar': 'كاش وكالكان', 'en': 'Kas & Kalkan', 'tr': 'Kaş & Kalkan'},

  // Cappadocia & Central
  'zone-nevsehir_airport': {'ar': 'مطار كابادوكيا نفسهير (NAV)', 'en': 'Nevsehir Airport (NAV)', 'tr': 'Nevşehir Havalimanı (NAV)'},
  'zone-kayseri_airport': {'ar': 'مطار قيصري (ASR)', 'en': 'Kayseri Airport (ASR)', 'tr': 'Kayseri Havalimanı (ASR)'},
  'zone-goreme': {'ar': 'غوريميه ومداخن العفاريت', 'en': 'Goreme & Fairy Chimneys', 'tr': 'Göreme'},
  'zone-uchisar': {'ar': 'قلعة أوتش حصار', 'en': 'Uchisar Castle', 'tr': 'Uçhisar'},
  'zone-urgup': {'ar': 'أورغوب والكهوف الفاخرة', 'en': 'Urgup Caves', 'tr': 'Ürgüp'},
  'zone-avanos': {'ar': 'أفانوس ونهر كيزيليرماك', 'en': 'Avanos Pottery Center', 'tr': 'Avanos'},

  // Aegean
  'zone-bodrum_airport': {'ar': 'مطار بودروم ميلاس (BJV)', 'en': 'Bodrum Milas Airport (BJV)', 'tr': 'Milas-Bodrum Havalimanı'},
  'zone-bodrum_center': {'ar': 'وسط بودروم ومارينا', 'en': 'Bodrum Center & Marina', 'tr': 'Bodrum Merkez'},
  'zone-yalikavak': {'ar': 'يالي كافاك ومارينا اليخوت', 'en': 'Yalikavak Luxury Marina', 'tr': 'Yalıkavak Marina'},
  'zone-dalaman_airport': {'ar': 'مطار دالامان الدولي (DLM)', 'en': 'Dalaman Airport (DLM)', 'tr': 'Dalaman Havalimanı (DLM)'},
  'zone-fethiye_oludeniz': {'ar': 'فتحية وشاطئ أولودينيز', 'en': 'Fethiye & Oludeniz Blue Lagoon', 'tr': 'Fethiye & Ölüdeniz'},
  'zone-marmaris': {'ar': 'مرمريس والخليج الفيروزي', 'en': 'Marmaris Bay', 'tr': 'Marmaris'},
  'zone-cesme_alacati': {'ar': 'تشيشمي وألاتشاتي', 'en': 'Cesme & Alacati', 'tr': 'Çeşme & Alaçatı'},
  'zone-izmir_airport': {'ar': 'مطار إزمير عدنان مندريس (ADB)', 'en': 'Izmir Adnan Menderes Airport (ADB)', 'tr': 'İzmir Adnan Menderes Havalimanı'},

  // Southeast & Anatolia
  'zone-gaziantep_airport': {'ar': 'مطار غازي عنتاب (GZT)', 'en': 'Gaziantep Airport (GZT)', 'tr': 'Gaziantep Havalimanı (GZT)'},
  'zone-gaziantep_center': {'ar': 'وسط غازي عنتاب ومتحف الفسيفساء', 'en': 'Gaziantep Old City & Zeugma', 'tr': 'Gaziantep Merkez'},
  'zone-sanliurfa_center': {'ar': 'شانلي أورفا (بركة إبراهيم)', 'en': 'Sanliurfa City & Balikligol', 'tr': 'Şanlıurfa Balıklıgöl'},
  'zone-gobeklitepe': {'ar': 'موقع غوبكلي تبه الأثري', 'en': 'Gobeklitepe Historic Site', 'tr': 'Göbeklitepe'},
  'zone-mardin_old_city': {'ar': 'ماردين القديمة والبيوت الحجرية', 'en': 'Mardin Old Stone City', 'tr': 'Eski Mardin'},
  'zone-diyarbakir_airport': {'ar': 'مطار ديار بكر والأسوار (DIY)', 'en': 'Diyarbakir Airport & Walls (DIY)', 'tr': 'Diyarbakır Havalimanı (DIY)'},
  'zone-erzurum_airport': {'ar': 'مطار أرضروم وجبال بالاندوكن (ERZ)', 'en': 'Erzurum Airport & Palandoken (ERZ)', 'tr': 'Erzurum Havalimanı (ERZ)'},
  'zone-kars_airport': {'ar': 'مطار قارص ومدينة آني الأثرية (KSY)', 'en': 'Kars Airport & Ani Ruins (KSY)', 'tr': 'Kars Harakani Havalimanı (KSY)'},
  'zone-van_airport': {'ar': 'مطار وان وبحيرة وان (VAN)', 'en': 'Van Ferit Melen Airport & Lake (VAN)', 'tr': 'Van Ferit Melen Havalimanı (VAN)'},
};

String _humanizeZoneSlug(String raw, BuildContext context) {
  final clean = raw.trim();
  if (clean.isEmpty) return '—';

  // Normalize slug: strip trailing underscores/numbers like __is, __ist, etc.
  final normalizedKey = clean.toLowerCase().replaceAll(RegExp(r'__\w+'), '');

  final code = Localizations.localeOf(context).languageCode;

  // Direct dictionary lookup
  if (_knownZoneNames.containsKey(normalizedKey)) {
    final entry = _knownZoneNames[normalizedKey]!;
    return entry[code] ?? entry['ar'] ?? entry['en'] ?? raw;
  }

  // Check with or without 'zone-' prefix
  final keyWithPrefix = normalizedKey.startsWith('zone-') ? normalizedKey : 'zone-$normalizedKey';
  if (_knownZoneNames.containsKey(keyWithPrefix)) {
    final entry = _knownZoneNames[keyWithPrefix]!;
    return entry[code] ?? entry['ar'] ?? entry['en'] ?? raw;
  }

  // Keyword heuristic matching
  final lower = clean.toLowerCase();
  if (lower.contains('istanbul_airport') || lower.contains('ist_airport') || lower.contains('ist-airport')) {
    return code == 'ar' ? 'مطار إسطنبول الدولي (IST)' : 'Istanbul Airport (IST)';
  }
  if (lower.contains('sabiha') || lower.contains('saw_airport') || lower.contains('saw-airport')) {
    return code == 'ar' ? 'مطار صبيحة كوكجن (SAW)' : 'Sabiha Gokcen Airport (SAW)';
  }
  if (lower.contains('taksim')) {
    return code == 'ar' ? 'تقسيم وبي أوغلو' : 'Taksim & Beyoglu';
  }
  if (lower.contains('sultanahmet') || lower.contains('fatih')) {
    return code == 'ar' ? 'السلطان أحمد والفاتح' : 'Sultanahmet & Fatih';
  }
  if (lower.contains('antalya') && (lower.contains('airport') || lower.contains('apt'))) {
    return code == 'ar' ? 'مطار أنطاليا الدولي (AYT)' : 'Antalya Airport (AYT)';
  }
  if (lower.contains('trabzon') && (lower.contains('airport') || lower.contains('apt'))) {
    return code == 'ar' ? 'مطار طرابزون (TZX)' : 'Trabzon Airport (TZX)';
  }
  if (lower.contains('uzungol')) {
    return code == 'ar' ? 'بحيرة أوزنجول' : 'Uzungol Lake';
  }
  if (lower.contains('ayder')) {
    return code == 'ar' ? 'هضبة آيدر (ريزا)' : 'Ayder Plateau';
  }
  if (lower.contains('goreme')) {
    return code == 'ar' ? 'غوريميه (كابادوكيا)' : 'Goreme Cappadocia';
  }
  if (lower.contains('bodrum') && (lower.contains('airport') || lower.contains('apt'))) {
    return code == 'ar' ? 'مطار بودروم (BJV)' : 'Bodrum Airport (BJV)';
  }
  if (lower.contains('fethiye') || lower.contains('oludeniz')) {
    return code == 'ar' ? 'فتحية وشاطئ أولودينيز' : 'Fethiye & Oludeniz';
  }
  if (lower.contains('marmaris')) {
    return code == 'ar' ? 'مرمريس والخليج الفيروزي' : 'Marmaris Bay';
  }
  if (lower.contains('mardin')) {
    return code == 'ar' ? 'ماردين القديمة' : 'Mardin Old City';
  }
  if (lower.contains('sanliurfa') || lower.contains('urfa')) {
    return code == 'ar' ? 'شانلي أورفا' : 'Sanliurfa';
  }
  if (lower.contains('gaziantep')) {
    return code == 'ar' ? 'غازي عنتاب' : 'Gaziantep';
  }

  // If it's a zone slug, remove 'zone-' prefix and underscores
  if (clean.startsWith('zone-')) {
    final title = clean.substring(5).replaceAll('_', ' ').replaceAll('-', ' ');
    return title.split(' ').map((word) => word.isNotEmpty ? '${word[0].toUpperCase()}${word.substring(1)}' : '').join(' ');
  }

  return clean;
}

String catalogZoneLabel(dynamic zone, BuildContext context) {
  if (zone == null) return '—';
  if (zone is Map) {
    final nameObj = zone['nameI18n'] ?? zone['name'];
    final name = _resolveI18nOrString(nameObj, context);
    if (name.isNotEmpty && !name.startsWith('zone-')) return name;
    final code = zone['code']?.toString() ?? '';
    if (code.isNotEmpty && !code.startsWith('zone-')) return code;
    // If name or code is a zone slug, humanize it
    if (name.isNotEmpty) return _humanizeZoneSlug(name, context);
    if (code.isNotEmpty) return _humanizeZoneSlug(code, context);
  }
  final text = '$zone'.trim();
  if (text.isEmpty) return '—';
  if (text.startsWith('zone-') || text.contains('_') || text.contains('-')) {
    return _humanizeZoneSlug(text, context);
  }
  return text;
}

String catalogVehicleClassLabel(
  dynamic vehicleClass,
  BuildContext context, {
  String? vehicleClassId,
}) {
  if (vehicleClass is Map) {
    final title = catalogItemTitle(vehicleClass, context);
    if (title.isNotEmpty) return title;
  }
  return vehicleClassId ?? vehicleClass?.toString() ?? '—';
}

String catalogRouteLabel(Map<String, dynamic> route, BuildContext context) {
  final fromZone = route['fromZone'];
  final toZone = route['toZone'];
  final vehicleClass = route['vehicleClass'];

  final from = fromZone != null
      ? catalogZoneLabel(fromZone, context)
      : catalogZoneLabel(route['fromZoneName'] ?? route['fromZoneId'], context);
  final to = toZone != null
      ? catalogZoneLabel(toZone, context)
      : catalogZoneLabel(route['toZoneName'] ?? route['toZoneId'], context);

  final classLabel = vehicleClass != null
      ? catalogVehicleClassLabel(vehicleClass, context)
      : catalogVehicleClassLabel(
          null,
          context,
          vehicleClassId: route['vehicleClassId'] as String?,
        );

  if (classLabel.isNotEmpty && classLabel != '—') {
    return '$from → $to · $classLabel';
  }
  return '$from → $to';
}

String catalogItemTitle(dynamic item, BuildContext context) {
  if (item == null) return '';
  if (item is Map) {
    final val = item['nameI18n'] ?? item['titleI18n'] ?? item['name'] ?? item['title'];
    final text = _resolveI18nOrString(val, context);
    if (text.isNotEmpty) return text;
    final code = item['code']?.toString() ?? '';
    if (code.isNotEmpty) return code;
  }
  return '$item'.trim();
}

String catalogItemDescription(dynamic item, BuildContext context) {
  if (item == null) return '';
  if (item is Map) {
    final val = item['descriptionI18n'] ?? item['description'] ?? item['summaryI18n'] ?? item['summary'];
    return _resolveI18nOrString(val, context);
  }
  return '$item'.trim();
}
