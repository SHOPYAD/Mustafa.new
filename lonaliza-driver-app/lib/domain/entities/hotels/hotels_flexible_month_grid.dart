/// Rolling **I'm flexible** month strip: consecutive bookable months from the
/// current calendar month, capped at [lastBookableMonthStart].
class HotelsFlexibleMonthGrid {
  HotelsFlexibleMonthGrid._();

  /// Max tiles when enough horizon exists (product constant).
  static const int slotCount = 6;

  static DateTime _dayOnly(DateTime d) => DateTime(d.year, d.month, d.day);

  /// First day of the month that contains [d].
  static DateTime monthStart(DateTime d) => DateTime(d.year, d.month, 1);

  /// Aligns with hotels calendar: last openable month anchor (Dec, +2 years).
  static DateTime lastBookableMonthStart(DateTime reference) {
    final t = _dayOnly(reference);
    return DateTime(t.year + 2, 12, 1);
  }

  /// Up to [slotCount] month starts from [reference]'s month, none after [lastBookableMonthStart].
  static List<DateTime> monthStarts(DateTime reference) {
    final start = monthStart(_dayOnly(reference));
    final cap = lastBookableMonthStart(reference);
    final out = <DateTime>[];
    var cursor = start;
    for (var i = 0; i < slotCount; i++) {
      if (cursor.isAfter(cap)) break;
      out.add(cursor);
      cursor = DateTime(cursor.year, cursor.month + 1, 1);
    }
    return out;
  }

  /// Stable key `year * 100 + month` (e.g. 202605).
  static int ymKey(DateTime monthStart) => monthStart.year * 100 + monthStart.month;

  static DateTime dateFromYmKey(int key) => DateTime(key ~/ 100, key % 100, 1);

  static List<int> ymKeys(DateTime reference) =>
      monthStarts(reference).map(ymKey).toList(growable: false);

  /// Keep only keys that appear in the grid for [reference]; if none left, first slot.
  static List<int> normalizeYmKeys(Iterable<int> keys, DateTime reference) {
    final allowed = ymKeys(reference).toSet();
    final filtered = keys.where(allowed.contains).toSet().toList()..sort();
    if (filtered.isEmpty) {
      final fb = ymKeys(reference);
      return fb.isNotEmpty ? List<int>.unmodifiable([fb.first]) : const [];
    }
    return List<int>.unmodifiable(filtered);
  }
}
