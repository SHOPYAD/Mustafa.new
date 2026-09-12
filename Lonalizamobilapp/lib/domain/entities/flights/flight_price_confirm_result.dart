class FlightPriceConfirmResult {
  const FlightPriceConfirmResult({
    required this.cachedTotal,
    required this.verifiedTotal,
    required this.changed,
    required this.bookable,
    required this.currency,
    this.expiresAt,
    this.source,
  });

  final double cachedTotal;
  final double verifiedTotal;
  final bool changed;
  final bool bookable;
  final String currency;
  final DateTime? expiresAt;
  final String? source;
}
