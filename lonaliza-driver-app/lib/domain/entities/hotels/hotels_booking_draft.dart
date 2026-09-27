import 'package:intl/intl.dart';

import '../place_search_hit.dart';
import 'hotels_flexible_month_grid.dart';

/// Guest-rating floor (aligned with filter sheet “Guest Rating” section).
enum HotelsGuestRatingFilter {
  none,
  pleasant6Plus,
  good7Plus,
  veryGood8Plus,
  great9Plus,
}

/// Single quick chip shown on the search card (mirrors an active facet).
class HotelsQuickFilterChip {
  const HotelsQuickFilterChip(this.id, this.label);

  /// Stable key for [HotelsBookingDraftNotifier.toggleQuickFilterChip].
  final String id;
  final String label;
}

/// Hotel search facets: shared by the **Filters** sheet and the horizontal quick chips.
class HotelsSearchFilters {
  const HotelsSearchFilters({
    this.hotelOnly = false,
    this.breakfastIncluded = false,
    this.freeCancellation = false,
    this.guestRating = HotelsGuestRatingFilter.none,
    this.doubleBed = false,
    this.payAtHotel = false,
    this.oneBedroomStudio = false,
    this.budgetMinPerNight = 0,
    this.budgetMaxPerNight = budgetRangeMax,
    this.minHotelStars = 0,
  });

  /// Upper bound for per-night budget slider (UI shows “+” at this cap).
  static const int budgetRangeMax = 2000;

  final bool hotelOnly;
  final bool breakfastIncluded;
  final bool freeCancellation;
  final HotelsGuestRatingFilter guestRating;
  final bool doubleBed;
  final bool payAtHotel;
  final bool oneBedroomStudio;

  /// Min price per room per night (USD whole units, UI only for now).
  final int budgetMinPerNight;

  /// Max price per room per night; use [budgetRangeMax] for “no upper cap” in UI.
  final int budgetMaxPerNight;

  /// Minimum hotel star level (1–5), or `0` if not filtering by stars.
  final int minHotelStars;

  HotelsSearchFilters copyWith({
    bool? hotelOnly,
    bool? breakfastIncluded,
    bool? freeCancellation,
    HotelsGuestRatingFilter? guestRating,
    bool? doubleBed,
    bool? payAtHotel,
    bool? oneBedroomStudio,
    int? budgetMinPerNight,
    int? budgetMaxPerNight,
    int? minHotelStars,
  }) {
    var mn = budgetMinPerNight ?? this.budgetMinPerNight;
    var mx = budgetMaxPerNight ?? this.budgetMaxPerNight;
    mn = mn.clamp(0, budgetRangeMax);
    mx = mx.clamp(0, budgetRangeMax);
    if (mn > mx) {
      final t = mn;
      mn = mx;
      mx = t;
    }
    final stars = (minHotelStars ?? this.minHotelStars).clamp(0, 5);
    return HotelsSearchFilters(
      hotelOnly: hotelOnly ?? this.hotelOnly,
      breakfastIncluded: breakfastIncluded ?? this.breakfastIncluded,
      freeCancellation: freeCancellation ?? this.freeCancellation,
      guestRating: guestRating ?? this.guestRating,
      doubleBed: doubleBed ?? this.doubleBed,
      payAtHotel: payAtHotel ?? this.payAtHotel,
      oneBedroomStudio: oneBedroomStudio ?? this.oneBedroomStudio,
      budgetMinPerNight: mn,
      budgetMaxPerNight: mx,
      minHotelStars: stars,
    );
  }

  bool get _hasCustomBudget =>
      budgetMinPerNight > 0 || budgetMaxPerNight < budgetRangeMax;

  static String guestRatingChipLabel(HotelsGuestRatingFilter g) {
    return switch (g) {
      HotelsGuestRatingFilter.none => '',
      HotelsGuestRatingFilter.pleasant6Plus => 'Guest Rating: Pleasant 6+',
      HotelsGuestRatingFilter.good7Plus => 'Guest Rating: Good 7+',
      HotelsGuestRatingFilter.veryGood8Plus => 'Guest Rating: Very Good 8+',
      HotelsGuestRatingFilter.great9Plus => 'Guest Rating: Great 9+',
    };
  }

  /// Active quick chips on the search card (tap removes that facet).
  List<HotelsQuickFilterChip> get activeQuickFilterChips {
    final out = <HotelsQuickFilterChip>[];
    if (hotelOnly) {
      out.add(const HotelsQuickFilterChip('hotelOnly', 'Hotel'));
    }
    if (breakfastIncluded) {
      out.add(const HotelsQuickFilterChip('breakfast', 'Breakfast included'));
    }
    if (freeCancellation) {
      out.add(const HotelsQuickFilterChip('freeCancel', 'Free cancellation'));
    }
    if (guestRating != HotelsGuestRatingFilter.none) {
      out.add(
        HotelsQuickFilterChip(
          'guestRating',
          guestRatingChipLabel(guestRating),
        ),
      );
    }
    if (doubleBed) {
      out.add(const HotelsQuickFilterChip('doubleBed', '2 beds'));
    }
    if (payAtHotel) {
      out.add(const HotelsQuickFilterChip('payAtHotel', 'Pay at Hotel'));
    }
    if (oneBedroomStudio) {
      out.add(const HotelsQuickFilterChip('studio', '1 bedroom/studio'));
    }
    if (_hasCustomBudget) {
      final maxLabel = budgetMaxPerNight >= budgetRangeMax
          ? '\$$budgetRangeMax+'
          : '\$$budgetMaxPerNight';
      out.add(
        HotelsQuickFilterChip('budget', '\$$budgetMinPerNight–$maxLabel'),
      );
    }
    if (minHotelStars > 0) {
      out.add(
        HotelsQuickFilterChip(
          'minStars',
          '$minHotelStars+ ${_starWord(minHotelStars)}',
        ),
      );
    }
    return out;
  }

  static String _starWord(int n) => n == 1 ? 'star' : 'stars';
}

/// Calendar chip row: **Exact dates** / **±1 day** / **±2 days** / **±3 days** / **±7 days**.
enum HotelsDateFlexOption {
  /// Exact dates (chip: "Exact dates").
  exactDates(0),

  /// ±1 day (chip: "±1 day").
  plusMinusOneDay(1),

  /// ±2 days (chip: "±2 days").
  plusMinusTwoDays(2),

  /// ±3 days (chip: "±3 days").
  plusMinusThreeDays(3),

  /// ±7 days (chip: "±7 days").
  plusMinusSevenDays(7);

  const HotelsDateFlexOption(this.flexDays);
  final int flexDays;

  /// Maps sheet / UI integer to this enum; unknown values fall back to [exactDates].
  static HotelsDateFlexOption fromFlexDays(int flexDays) => switch (flexDays) {
        0 => exactDates,
        1 => plusMinusOneDay,
        2 => plusMinusTwoDays,
        3 => plusMinusThreeDays,
        7 => plusMinusSevenDays,
        _ => exactDates,
      };
}

/// In-progress hotels search / booking selections (domain only, no Flutter).
///
/// Fields grow per booking step; starts empty until the user picks a destination.
class HotelsBookingDraft {
  const HotelsBookingDraft({
    this.selectedDestination,
    this.checkIn,
    this.checkOut,
    this.dateFlexibility = HotelsDateFlexOption.exactDates,
    this.flexibleStayNights = 2,
    this.includeFriday = false,
    this.includeSaturday = false,
    this.flexibleMonthYmKeys,
    this.useFlexibleDateDisplay = false,
    this.searchFilters = const HotelsSearchFilters(),
    int? roomCount,
    int? adultCount,
    int? childCount,
  }) : _roomCount = roomCount,
       _adultCount = adultCount,
       _childCount = childCount;

  /// Destination chosen from geocode search ([PlaceSearchHit]).
  final PlaceSearchHit? selectedDestination;

  /// First calendar night of the stay. Use date-only semantics (ignore clock time).
  final DateTime? checkIn;

  /// Day after the last booked night (hotel-style checkout date). Date-only semantics.
  final DateTime? checkOut;

  /// Search window around [checkIn]/[checkOut] (same meaning as date-picker chips).
  final HotelsDateFlexOption dateFlexibility;

  /// Nights for **I'm flexible** flow (chips 1–7 nights). Ignored when using fixed calendar dates only.
  final int flexibleStayNights;

  /// Prefer stays that include a Friday (flexible-tab checkbox).
  final bool includeFriday;

  /// Prefer stays that include a Saturday (flexible-tab checkbox).
  final bool includeSaturday;

  /// Selected months as `year * 100 + month` keys (see [HotelsFlexibleMonthGrid.ymKey]).
  /// Null or empty → first available month for [reference] when resolved.
  final List<int>? flexibleMonthYmKeys;

  /// When true, search UI shows **I'm flexible** copy instead of [checkIn]/[checkOut] range.
  final bool useFlexibleDateDisplay;

  /// Search facets (filters sheet + quick chip bar).
  final HotelsSearchFilters searchFilters;

  /// Stored nullable so stale isolate state / hot reload never yields a null `int` read.
  final int? _roomCount;
  final int? _adultCount;
  final int? _childCount;

  /// Number of rooms (≥ 1). Defaults when unset.
  int get roomCount => _roomCount ?? 1;

  /// Number of adults (≥ 1). Defaults when unset.
  int get adultCount => _adultCount ?? 2;

  /// Number of children (≥ 0). Defaults when unset.
  int get childCount => _childCount ?? 0;

  /// Destination chosen for search.
  bool get hasSelectedDestination => selectedDestination != null;

  /// Fixed calendar range with a valid stay (checkout strictly after first night).
  bool get hasCalendarDateRange {
    final ci = checkIn;
    final co = checkOut;
    return ci != null && co != null && co.isAfter(ci);
  }

  /// User set either **I'm flexible** or a concrete check-in / check-out range.
  bool get hasCompleteDateSelection =>
      useFlexibleDateDisplay || hasCalendarDateRange;

  /// At least one room and one adult (stored `0` is invalid; null uses defaults).
  bool get hasValidGuestCounts => roomCount >= 1 && adultCount >= 1;

  /// Ready to run hotels search from the home card.
  bool get canSubmitHotelsSearch =>
      hasSelectedDestination && hasCompleteDateSelection && hasValidGuestCounts;

  /// Keys valid for the rolling grid anchored at [reference] (usually today, date-only).
  List<int> resolvedFlexibleMonthYmKeys(DateTime reference) =>
      HotelsFlexibleMonthGrid.normalizeYmKeys(
        flexibleMonthYmKeys ?? const [],
        reference,
      );

  /// Primary line for the hotels search card when [useFlexibleDateDisplay] is true.
  String flexibleDateSearchTitle(String localeTag, DateTime reference) {
    final n = flexibleStayNights.clamp(1, 7);
    final keys = resolvedFlexibleMonthYmKeys(reference);
    final gridKeys = HotelsFlexibleMonthGrid.ymKeys(reference);
    final sameYear =
        keys.isNotEmpty && keys.every((k) => k ~/ 100 == keys.first ~/ 100);
    final fmt = DateFormat(sameYear ? 'MMM' : 'MMM yyyy', localeTag);
    final labels = keys
        .map((k) => fmt.format(HotelsFlexibleMonthGrid.dateFromYmKey(k)))
        .toList();
    if (gridKeys.isNotEmpty &&
        keys.length == gridKeys.length &&
        keys.toSet().length == gridKeys.length &&
        keys.toSet().containsAll(gridKeys)) {
      final first = fmt.format(HotelsFlexibleMonthGrid.dateFromYmKey(gridKeys.first));
      final last = fmt.format(HotelsFlexibleMonthGrid.dateFromYmKey(gridKeys.last));
      return 'Any $n nights in $first–$last';
    }
    if (labels.length == 1) return 'Any $n nights in ${labels.first}';
    if (labels.length == 2) {
      return 'Any $n nights in ${labels[0]} or ${labels[1]}';
    }
    if (labels.isEmpty) return 'Any $n nights';
    final head = labels.sublist(0, labels.length - 1).join(', ');
    return 'Any $n nights in $head or ${labels.last}';
  }

  /// Subtitle under flexible title (weekend prefs), or null if none.
  String? get flexibleDateSearchSubtitle {
    if (includeFriday && includeSaturday) return 'Must include Fri/Sat';
    if (includeFriday) return 'Must include Friday';
    if (includeSaturday) return 'Must include Saturday';
    return null;
  }
}
