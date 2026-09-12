class CatalogAirline {
  final String id;
  final String iata;
  final String name;
  final String? nameAr;
  final String logoUrl;
  final String? logoLocal;
  final String? country;
  final String? countryCode;

  const CatalogAirline({
    required this.id,
    required this.iata,
    required this.name,
    this.nameAr,
    required this.logoUrl,
    this.logoLocal,
    this.country,
    this.countryCode,
  });
}
