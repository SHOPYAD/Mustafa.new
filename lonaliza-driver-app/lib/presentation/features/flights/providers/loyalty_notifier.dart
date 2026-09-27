import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../domain/entities/flights/flight_search_loyalty.dart';

// ── Shared Notifier class ────────────────────────────────────────────
class LoyaltyOffersNotifier extends Notifier<List<LoyaltyOffer>> {
  @override
  List<LoyaltyOffer> build() => const [];

  void set(List<LoyaltyOffer> offers) => state = offers;

  void reset() => state = const [];

  /// Returns the first coupon offer if available.
  LoyaltyOffer? get firstCoupon {
    try {
      return state.firstWhere((o) => o.kind == 'coupon');
    } catch (_) {
      return null;
    }
  }
}

// ── Search Strip (promotional banner at top of results) ──────────────
final loyaltySearchStripProvider =
    NotifierProvider<LoyaltyOffersNotifier, List<LoyaltyOffer>>(
  LoyaltyOffersNotifier.new,
);

// ── Result Card Badge (discount chips on each flight card) ───────────
final loyaltyResultCardBadgeProvider =
    NotifierProvider<LoyaltyOffersNotifier, List<LoyaltyOffer>>(
  LoyaltyOffersNotifier.new,
);
