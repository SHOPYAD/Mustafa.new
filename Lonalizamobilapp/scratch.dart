import 'dart:convert';

class CatalogAirportSuggestion {
  final String iata;
  final String name;
  final String? nameAr;
  final String city;
  final String country;
  final String countryCode;

  CatalogAirportSuggestion({
    required this.iata,
    required this.name,
    this.nameAr,
    required this.city,
    required this.country,
    required this.countryCode,
  });

  Map<String, dynamic> toJson() => {
    'iata': iata,
    'name': name,
    'nameAr': nameAr,
    'city': city,
    'country': country,
    'countryCode': countryCode,
  };
}

class CatalogLocationSuggestion {
  final String kind;
  final String name;
  final String? nameAr;
  final String country;
  final String countryCode;
  final List<CatalogAirportSuggestion> airports;

  CatalogLocationSuggestion({
    required this.kind,
    required this.name,
    this.nameAr,
    required this.country,
    required this.countryCode,
    required this.airports,
  });
}

String _normalizeCityName(String city) {
  var name = city.split('(').first.trim();
  name = name.split(',').last.trim();
  // Normalize Turkish İ / I and convert to lowercase
  name = name.replaceAll('İ', 'i').replaceAll('I', 'i').toLowerCase();
  return name;
}

String _getCleanCityDisplay(String city) {
  var name = city.split('(').first.trim();
  name = name.split(',').last.trim();
  // Capitalize first letter
  if (name.isEmpty) return '';
  return name[0].toUpperCase() + name.substring(1);
}

List<CatalogLocationSuggestion> groupSuggestionsByCity(List<CatalogLocationSuggestion> rawSuggestions) {
  if (rawSuggestions.isEmpty) return [];

  final Map<String, List<CatalogAirportSuggestion>> cityGroups = {};
  final Map<String, CatalogLocationSuggestion> cityInfo = {};
  final Map<String, String> originalCityNames = {};
  final List<CatalogLocationSuggestion> standaloneAirports = [];

  for (final suggestion in rawSuggestions) {
    if (suggestion.kind == 'city' && suggestion.airports.length > 1) {
      standaloneAirports.add(suggestion);
      continue;
    }

    for (final airport in suggestion.airports) {
      final normalizedCity = _normalizeCityName(airport.city);
      if (!cityGroups.containsKey(normalizedCity)) {
        cityGroups[normalizedCity] = [];
        cityInfo[normalizedCity] = suggestion;
        originalCityNames[normalizedCity] = _getCleanCityDisplay(airport.city);
      }
      cityGroups[normalizedCity]!.add(airport);
    }
  }

  final List<CatalogLocationSuggestion> groupedResults = [];

  cityGroups.forEach((cityKey, airports) {
    final cityName = originalCityNames[cityKey]!;
    if (airports.length == 1) {
      final source = cityInfo[cityKey]!;
      groupedResults.add(
        CatalogLocationSuggestion(
          kind: 'airport',
          name: airports.first.name,
          nameAr: airports.first.nameAr,
          country: source.country,
          countryCode: source.countryCode,
          airports: airports,
        ),
      );
    } else {
      final source = cityInfo[cityKey]!;
      final allIatas = airports.map((a) => a.iata).join(',');

      final virtualAll = CatalogAirportSuggestion(
        iata: allIatas,
        name: 'All airports',
        nameAr: 'جميع المطارات',
        city: cityName,
        country: source.country,
        countryCode: source.countryCode,
      );

      final List<CatalogAirportSuggestion> finalAirports = [
        virtualAll,
        ...airports,
      ];

      groupedResults.add(
        CatalogLocationSuggestion(
          kind: 'city',
          name: cityName,
          nameAr: source.nameAr,
          country: source.country,
          countryCode: source.countryCode,
          airports: finalAirports,
        ),
      );
    }
  });

  groupedResults.addAll(standaloneAirports);
  return groupedResults;
}

void main() {
  final raw = [
    CatalogLocationSuggestion(
      kind: 'airport',
      name: 'Istanbul Sabiha Gökçen International Airport',
      country: 'Turkey',
      countryCode: 'TR',
      airports: [
        CatalogAirportSuggestion(
          iata: 'SAW',
          name: 'Istanbul Sabiha Gökçen International Airport',
          city: 'Pendik, Istanbul',
          country: 'Turkey',
          countryCode: 'TR',
        ),
      ],
    ),
    CatalogLocationSuggestion(
      kind: 'airport',
      name: 'İstanbul Airport',
      country: 'Turkey',
      countryCode: 'TR',
      airports: [
        CatalogAirportSuggestion(
          iata: 'IST',
          name: 'İstanbul Airport',
          city: 'Istanbul',
          country: 'Turkey',
          countryCode: 'TR',
        ),
      ],
    ),
  ];

  final results = groupSuggestionsByCity(raw);
  print('Total suggestions: ${results.length}');
  for (var res in results) {
    print('Suggestion kind: ${res.kind}, name: ${res.name}, country: ${res.country}');
    for (var a in res.airports) {
      print('  Airport: ${a.iata} - ${a.name} (city: ${a.city})');
    }
  }
}
