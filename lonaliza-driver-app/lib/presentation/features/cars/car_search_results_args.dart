/// Passed as [GoRouterState.extra] when opening car search results.
class CarSearchResultsArgs {
  const CarSearchResultsArgs({
    required this.locationTitle,
    required this.locationSubtitle,
    required this.dateTimesPrimary,
    required this.dateTimesSecondary,
  });

  final String locationTitle;
  final String locationSubtitle;
  final String dateTimesPrimary;
  final String dateTimesSecondary;

  static CarSearchResultsArgs fallback() => const CarSearchResultsArgs(
        locationTitle: 'Los Angeles International Airport',
        locationSubtitle: 'Los Angeles',
        dateTimesPrimary: '10:00 AM, Apr 25 - 10:00 AM, Apr 28',
        dateTimesSecondary: '3 days',
      );
}
