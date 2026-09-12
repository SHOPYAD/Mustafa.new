import '../../../domain/entities/flights/catalog_location_suggestion.dart';

class CatalogAirportSuggestionModel extends CatalogAirportSuggestion {
  const CatalogAirportSuggestionModel({
    required super.iata,
    required super.name,
    super.nameAr,
    required super.city,
    required super.country,
    required super.countryCode,
  });

  factory CatalogAirportSuggestionModel.fromJson(Map<String, dynamic> json) {
    return CatalogAirportSuggestionModel(
      iata: json['iata'] as String? ?? '',
      name: json['name'] as String? ?? '',
      nameAr: json['nameAr'] as String?,
      city: json['city'] as String? ?? '',
      country: json['country'] as String? ?? '',
      countryCode: json['countryCode'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'iata': iata,
    'name': name,
    if (nameAr != null) 'nameAr': nameAr,
    'city': city,
    'country': country,
    'countryCode': countryCode,
  };
}

class CatalogLocationSuggestionModel extends CatalogLocationSuggestion {
  const CatalogLocationSuggestionModel({
    required super.kind,
    required super.name,
    super.nameAr,
    required super.country,
    required super.countryCode,
    required super.airports,
  });

  factory CatalogLocationSuggestionModel.fromJson(Map<String, dynamic> json) {
    final airportsList = json['airports'] as List<dynamic>? ?? [];
    final list = airportsList
        .map(
          (e) => CatalogAirportSuggestionModel.fromJson(
            e is Map ? Map<String, dynamic>.from(e) : {},
          ),
        )
        .toList();

    if (list.length > 1) {
      final allIatas = list.map((a) => a.iata).join(',');
      final cityName = json['name'] as String? ?? '';
      final countryName = json['country'] as String? ?? '';
      final countryCode = json['countryCode'] as String? ?? '';

      final virtualAllAirports = CatalogAirportSuggestionModel(
        iata: allIatas,
        name: 'All airports',
        nameAr: 'جميع المطارات',
        city: cityName,
        country: countryName,
        countryCode: countryCode,
      );
      list.insert(0, virtualAllAirports);
    }

    return CatalogLocationSuggestionModel(
      kind: json['kind'] as String? ?? 'city',
      name: json['name'] as String? ?? '',
      nameAr: json['nameAr'] as String?,
      country: json['country'] as String? ?? '',
      countryCode: json['countryCode'] as String? ?? '',
      airports: list,
    );
  }

  Map<String, dynamic> toJson() => {
    'kind': kind,
    'name': name,
    if (nameAr != null) 'nameAr': nameAr,
    'country': country,
    'countryCode': countryCode,
    'airports': airports
        .map((a) => (a as CatalogAirportSuggestionModel).toJson())
        .toList(),
  };
}
