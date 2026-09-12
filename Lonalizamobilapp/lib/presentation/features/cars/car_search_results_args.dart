/// Passed as [GoRouterState.extra] when opening car search results.
class CarSearchResultsArgs {
  const CarSearchResultsArgs({
    required this.locationTitle,
    required this.locationSubtitle,
    required this.dateTimesPrimary,
    required this.dateTimesSecondary,
    this.pickup = 'istanbul',
    this.dropoff,
    this.date,
    this.returnDate,
    this.days = 3,
  });

  final String locationTitle;
  final String locationSubtitle;
  final String dateTimesPrimary;
  final String dateTimesSecondary;
  final String pickup;
  final String? dropoff;
  final String? date;
  final String? returnDate;
  final int days;

  static CarSearchResultsArgs fallback() => const CarSearchResultsArgs(
        locationTitle: 'مطار إسطنبول',
        locationSubtitle: 'إسطنبول',
        dateTimesPrimary: '10:00 · 3 أيام',
        dateTimesSecondary: '3 أيام',
        pickup: 'istanbul',
      );
}
