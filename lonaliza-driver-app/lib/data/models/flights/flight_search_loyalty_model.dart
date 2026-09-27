import '../../../domain/entities/flights/flight_search_loyalty.dart';

class LoyaltyOfferModel extends LoyaltyOffer {
  const LoyaltyOfferModel({
    required super.kind,
    required super.id,
    required super.title,
    required super.promoLabel,
    super.promoCode,
    required super.applyMode,
    super.value,
  });

  factory LoyaltyOfferModel.fromJson(Map<String, dynamic> json) {
    return LoyaltyOfferModel(
      kind: json['kind'] as String? ?? '',
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      promoLabel: json['promoLabel'] as String? ?? '',
      promoCode: json['promoCode'] as String?,
      applyMode: json['applyMode'] as String? ?? 'manual',
      value: (json['value'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'kind': kind,
        'id': id,
        'title': title,
        'promoLabel': promoLabel,
        if (promoCode != null) 'promoCode': promoCode,
        'applyMode': applyMode,
        if (value != null) 'value': value,
      };
}

class FlightSearchLoyaltyModel extends FlightSearchLoyalty {
  const FlightSearchLoyaltyModel({
    required super.searchStrip,
    required super.resultCardBadge,
  });

  factory FlightSearchLoyaltyModel.fromJson(Map<String, dynamic> json) {
    return FlightSearchLoyaltyModel(
      searchStrip: (json['searchStrip'] as List? ?? [])
          .map(
            (e) => LoyaltyOfferModel.fromJson(
              e is Map ? Map<String, dynamic>.from(e) : {},
            ),
          )
          .toList(),
      resultCardBadge: (json['resultCardBadge'] as List? ?? [])
          .map(
            (e) => LoyaltyOfferModel.fromJson(
              e is Map ? Map<String, dynamic>.from(e) : {},
            ),
          )
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'searchStrip': searchStrip
            .map((e) => (e as LoyaltyOfferModel).toJson())
            .toList(),
        'resultCardBadge': resultCardBadge
            .map((e) => (e as LoyaltyOfferModel).toJson())
            .toList(),
      };
}
