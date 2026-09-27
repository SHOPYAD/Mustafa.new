import '../../../domain/entities/flights/flight_price_confirm_result.dart';

class FlightPriceConfirmResultModel extends FlightPriceConfirmResult {
  const FlightPriceConfirmResultModel({
    required super.cachedTotal,
    required super.verifiedTotal,
    required super.changed,
    required super.bookable,
    required super.currency,
    super.expiresAt,
    super.source,
  });

  factory FlightPriceConfirmResultModel.fromJson(Map<String, dynamic> json) {
    return FlightPriceConfirmResultModel(
      cachedTotal: (json['cachedTotal'] as num?)?.toDouble() ?? 0.0,
      verifiedTotal: (json['verifiedTotal'] as num?)?.toDouble() ?? 0.0,
      changed: json['changed'] as bool? ?? false,
      bookable: json['bookable'] as bool? ?? true,
      currency: json['currency'] as String? ?? 'USD',
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'].toString())
          : null,
      source: json['source'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'cachedTotal': cachedTotal,
    'verifiedTotal': verifiedTotal,
    'changed': changed,
    'bookable': bookable,
    'currency': currency,
    if (expiresAt != null) 'expiresAt': expiresAt!.toIso8601String(),
    if (source != null) 'source': source,
  };
}
