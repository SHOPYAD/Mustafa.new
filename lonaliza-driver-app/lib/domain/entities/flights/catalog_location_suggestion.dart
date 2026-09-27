/// Represents a single airport within a location suggestion.
class CatalogAirportSuggestion {
  const CatalogAirportSuggestion({
    required this.iata,
    required this.name,
    this.nameAr,
    required this.city,
    required this.country,
    required this.countryCode,
  });

  final String iata;
  final String name;
  final String? nameAr;
  final String city;
  final String country;
  final String countryCode;
}

/// Represents a location suggestion returned by the catalog search API.
/// Maps directly to the TypeScript `CatalogLocationSuggestion` interface.
class CatalogLocationSuggestion {
  const CatalogLocationSuggestion({
    required this.kind,
    required this.name,
    this.nameAr,
    required this.country,
    required this.countryCode,
    required this.airports,
  });

  /// Either 'city' or 'airport'.
  final String kind;
  final String name;
  final String? nameAr;
  final String country;
  final String countryCode;
  final List<CatalogAirportSuggestion> airports;
}

extension CatalogAirportSuggestionDisplay on CatalogAirportSuggestion {
  String getDisplayLabel({required bool isAr}) {
    if (iata.contains(',')) {
      // All airports in city case: E.g. "Istanbul (All airports)"
      var cityName = (isAr && nameAr != null && nameAr!.isNotEmpty)
          ? nameAr!
          : city;
      if (cityName.contains(',')) {
        cityName = cityName.split(',').last.trim();
      }
      return isAr ? '$cityName (جميع المطارات)' : '$cityName (All airports)';
    } else {
      // Normal airport case: E.g. "Istanbul - Sabiha Gökçen (SAW)"
      var cleanCity = city;
      if (cleanCity.contains(',')) {
        cleanCity = cleanCity.split(',').last.trim();
      }

      var airportName = (isAr && nameAr != null && nameAr!.isNotEmpty)
          ? nameAr!
          : name;

      var cleanAirportName = airportName;
      // Remove city prefix if present (either English or Arabic)
      if (cleanAirportName.toLowerCase().startsWith(cleanCity.toLowerCase())) {
        cleanAirportName = cleanAirportName.substring(cleanCity.length).trim();
      }

      // Also check if the raw English city name is a prefix of airportName
      var rawCity = city;
      if (rawCity.contains(',')) {
        rawCity = rawCity.split(',').last.trim();
      }
      if (cleanAirportName.toLowerCase().startsWith(rawCity.toLowerCase())) {
        cleanAirportName = cleanAirportName.substring(rawCity.length).trim();
      }

      // Clean up symbols or separators at the start
      if (cleanAirportName.startsWith('-') ||
          cleanAirportName.startsWith(',') ||
          cleanAirportName.startsWith('—')) {
        cleanAirportName = cleanAirportName.substring(1).trim();
      }

      // Remove "International Airport" or "Airport" to keep it compact
      cleanAirportName = cleanAirportName
          .replaceAll(
            RegExp(r'\b(International\s+)?Airport\b', caseSensitive: false),
            '',
          )
          .replaceAll(RegExp(r'\b(الدولي\s+)?المطار\b'), '')
          .replaceAll(RegExp(r'\bمطار\b'), '')
          .replaceAll(RegExp(r'\bالدولي\b'), '')
          .trim();

      if (cleanAirportName.isEmpty) {
        return '$cleanCity ($iata)';
      }

      return '$cleanCity - $cleanAirportName ($iata)';
    }
  }
}
