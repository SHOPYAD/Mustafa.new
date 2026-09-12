/// A single loyalty/promotional offer surfaced on the search results.
class LoyaltyOffer {
  const LoyaltyOffer({
    required this.kind,
    required this.id,
    required this.title,
    required this.promoLabel,
    this.promoCode,
    required this.applyMode,
    this.value,
  });

  /// e.g. 'coupon', 'voucher', 'spin', 'lottery', 'donate', 'assignment'
  final String kind;
  final String id;
  final String title;

  /// Display text — e.g. '10% off', 'Spin wheel', 'Lottery'
  final String promoLabel;

  /// Coupon code if applicable — e.g. 'LIOFLIGHT10'
  final String? promoCode;

  /// 'auto' (applied at checkout) or 'manual' (user must enter)
  final String applyMode;

  /// Numeric value (percentage, points, etc.) — nullable
  final double? value;
}

/// Groups loyalty offers by their display surface.
class FlightSearchLoyalty {
  const FlightSearchLoyalty({
    required this.searchStrip,
    required this.resultCardBadge,
  });

  const FlightSearchLoyalty.empty()
      : searchStrip = const [],
        resultCardBadge = const [];

  /// Offers shown as a promotional banner/strip at the top of search results.
  final List<LoyaltyOffer> searchStrip;

  /// Offers shown as small badges on each flight result card (e.g. '10% off').
  final List<LoyaltyOffer> resultCardBadge;
}
