import '../../../domain/entities/flights/catalog_airline.dart';

class CatalogAirlineModel extends CatalogAirline {
  const CatalogAirlineModel({
    required super.id,
    required super.iata,
    required super.name,
    super.nameAr,
    required super.logoUrl,
    super.logoLocal,
    super.country,
    super.countryCode,
  });

  factory CatalogAirlineModel.fromJson(Map<String, dynamic> json) {
    return CatalogAirlineModel(
      id: json['id'] as String? ?? '',
      iata: json['iata'] as String? ?? '',
      name: json['name'] as String? ?? '',
      nameAr: json['nameAr'] as String?,
      logoUrl: json['logoUrl'] as String? ?? '',
      logoLocal: json['logoLocal'] as String?,
      country: json['country'] as String?,
      countryCode: json['countryCode'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'iata': iata,
    'name': name,
    'nameAr': nameAr,
    'logoUrl': logoUrl,
    'logoLocal': logoLocal,
    'country': country,
    'countryCode': countryCode,
  };
}
