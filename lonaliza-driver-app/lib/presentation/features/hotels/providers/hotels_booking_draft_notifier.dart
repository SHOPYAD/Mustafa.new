import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../domain/entities/hotels/hotels_booking_draft.dart';
import '../../../../domain/entities/hotels/hotels_flexible_month_grid.dart';
import '../../../../domain/entities/place_search_hit.dart';

/// Holds in-memory [HotelsBookingDraft] for the hotels flow (destination, dates, guests, …).
final hotelsBookingDraftProvider =
    NotifierProvider<HotelsBookingDraftNotifier, HotelsBookingDraft>(
  HotelsBookingDraftNotifier.new,
);

DateTime _dateOnlyNow() {
  final n = DateTime.now();
  return DateTime(n.year, n.month, n.day);
}

class HotelsBookingDraftNotifier extends Notifier<HotelsBookingDraft> {
  @override
  HotelsBookingDraft build() => const HotelsBookingDraft();

  List<int>? _copyYmKeys(HotelsBookingDraft s) {
    final k = s.flexibleMonthYmKeys;
    if (k == null || k.isEmpty) return null;
    return List<int>.from(k);
  }

  void setSelectedDestination(PlaceSearchHit? destination) {
    state = HotelsBookingDraft(
      selectedDestination: destination,
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      dateFlexibility: state.dateFlexibility,
      flexibleStayNights: state.flexibleStayNights,
      includeFriday: state.includeFriday,
      includeSaturday: state.includeSaturday,
      flexibleMonthYmKeys: _copyYmKeys(state),
      useFlexibleDateDisplay: state.useFlexibleDateDisplay,
      searchFilters: state.searchFilters,
      roomCount: state.roomCount,
      adultCount: state.adultCount,
      childCount: state.childCount,
    );
  }

  void clearDraft() {
    state = const HotelsBookingDraft();
  }

  /// Calendar tab: [checkIn] first night, [checkOut] departure day (exclusive of last night; must be after [checkIn]).
  void applyCalendarStay({
    required DateTime checkIn,
    required DateTime checkOut,
    required HotelsDateFlexOption dateFlexibility,
  }) {
    final inD = DateTime(checkIn.year, checkIn.month, checkIn.day);
    final outD = DateTime(checkOut.year, checkOut.month, checkOut.day);
    if (!outD.isAfter(inD)) return;
    state = HotelsBookingDraft(
      selectedDestination: state.selectedDestination,
      checkIn: inD,
      checkOut: outD,
      dateFlexibility: dateFlexibility,
      flexibleStayNights: state.flexibleStayNights,
      includeFriday: state.includeFriday,
      includeSaturday: state.includeSaturday,
      flexibleMonthYmKeys: _copyYmKeys(state),
      useFlexibleDateDisplay: false,
      searchFilters: state.searchFilters,
      roomCount: state.roomCount,
      adultCount: state.adultCount,
      childCount: state.childCount,
    );
  }

  /// Flexible tab: nights + weekend preferences (calendar dates unchanged).
  void applyFlexibleStay({
    required int flexibleStayNights,
    required bool includeFriday,
    required bool includeSaturday,
    required List<int> flexibleMonthYmKeys,
  }) {
    final ref = _dateOnlyNow();
    state = HotelsBookingDraft(
      selectedDestination: state.selectedDestination,
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      dateFlexibility: state.dateFlexibility,
      flexibleStayNights: flexibleStayNights.clamp(1, 7),
      includeFriday: includeFriday,
      includeSaturday: includeSaturday,
      flexibleMonthYmKeys:
          HotelsFlexibleMonthGrid.normalizeYmKeys(flexibleMonthYmKeys, ref),
      useFlexibleDateDisplay: true,
      searchFilters: state.searchFilters,
      roomCount: state.roomCount,
      adultCount: state.adultCount,
      childCount: state.childCount,
    );
  }

  /// Persists rooms / adults / children from the room-guests sheet.
  void applyRoomsAndGuests({
    required int roomCount,
    required int adultCount,
    required int childCount,
  }) {
    state = HotelsBookingDraft(
      selectedDestination: state.selectedDestination,
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      dateFlexibility: state.dateFlexibility,
      flexibleStayNights: state.flexibleStayNights,
      includeFriday: state.includeFriday,
      includeSaturday: state.includeSaturday,
      flexibleMonthYmKeys: _copyYmKeys(state),
      useFlexibleDateDisplay: state.useFlexibleDateDisplay,
      searchFilters: state.searchFilters,
      roomCount: roomCount.clamp(1, 9),
      adultCount: adultCount.clamp(1, 30),
      childCount: childCount.clamp(0, 10),
    );
  }

  /// Replaces search filters (filters sheet / tests).
  void setSearchFilters(HotelsSearchFilters filters) {
    state = HotelsBookingDraft(
      selectedDestination: state.selectedDestination,
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      dateFlexibility: state.dateFlexibility,
      flexibleStayNights: state.flexibleStayNights,
      includeFriday: state.includeFriday,
      includeSaturday: state.includeSaturday,
      flexibleMonthYmKeys: _copyYmKeys(state),
      useFlexibleDateDisplay: state.useFlexibleDateDisplay,
      searchFilters: filters,
      roomCount: state.roomCount,
      adultCount: state.adultCount,
      childCount: state.childCount,
    );
  }

  void updateSearchFilters(
    HotelsSearchFilters Function(HotelsSearchFilters current) updater,
  ) {
    setSearchFilters(updater(state.searchFilters));
  }

  /// Toggles a facet from a quick chip on the search card.
  void toggleQuickFilterChip(String id) {
    final f = state.searchFilters;
    final next = switch (id) {
      'hotelOnly' => f.copyWith(hotelOnly: !f.hotelOnly),
      'breakfast' => f.copyWith(breakfastIncluded: !f.breakfastIncluded),
      'freeCancel' => f.copyWith(freeCancellation: !f.freeCancellation),
      'guestRating' => f.copyWith(guestRating: HotelsGuestRatingFilter.none),
      'doubleBed' => f.copyWith(doubleBed: !f.doubleBed),
      'payAtHotel' => f.copyWith(payAtHotel: !f.payAtHotel),
      'studio' => f.copyWith(oneBedroomStudio: !f.oneBedroomStudio),
      'budget' => f.copyWith(
          budgetMinPerNight: 0,
          budgetMaxPerNight: HotelsSearchFilters.budgetRangeMax,
        ),
      'minStars' => f.copyWith(minHotelStars: 0),
      _ => f,
    };
    if (identical(next, f)) return;
    setSearchFilters(next);
  }

  void resetSearchFilters() {
    setSearchFilters(const HotelsSearchFilters());
  }
}
