/// Passed as [GoRouterState.extra] when opening [CarDetailPage].
class CarDetailArgs {
  const CarDetailArgs({
    required this.appBarTitle,
    required this.vehicleName,
    required this.subtitle,
    required this.pricePerDayLabel,
    required this.totalLine,
    this.priceSubnote = '(incl. taxes & fees)',
  });

  final String appBarTitle;
  final String vehicleName;
  final String subtitle;
  /// e.g. "\$29/day" shown in bottom bar primary.
  final String pricePerDayLabel;
  final String totalLine;
  final String priceSubnote;

  static const CarDetailArgs fallback = CarDetailArgs(
    appBarTitle: 'Car rental',
    vehicleName: 'Vehicle',
    subtitle: 'Select a vehicle from search results',
    pricePerDayLabel: r'$0',
    totalLine: r'$0 Total',
  );

  static CarDetailArgs fromSearchCard({
    required String title,
    required String subtitle,
    required String pricePerDay,
    required String totalLabel,
  }) {
    return CarDetailArgs(
      appBarTitle: '$title or similar',
      vehicleName: title,
      subtitle: subtitle,
      pricePerDayLabel: pricePerDay,
      totalLine: totalLabel,
    );
  }
}
