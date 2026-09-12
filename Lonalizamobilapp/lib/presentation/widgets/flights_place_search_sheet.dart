import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:liotrip/core/extensions/context_l10n.dart';
import 'package:liotrip/domain/entities/flights/catalog_location_suggestion.dart';
import '../notifier/flights_place_search_notifier.dart';
import 'app_error_view.dart';

class FlightsPlaceSearchSheet extends ConsumerStatefulWidget {
  const FlightsPlaceSearchSheet({
    super.key,
    this.title = 'Search departure or arrival',
  });

  final String title;

  @override
  ConsumerState<FlightsPlaceSearchSheet> createState() =>
      _FlightsPlaceSearchSheetState();
}

class _FlightsPlaceSearchSheetState
    extends ConsumerState<FlightsPlaceSearchSheet> {
  late final TextEditingController _query;
  Timer? _debounce;
  static const _searchDebounce = Duration(milliseconds: 300);

  @override
  void initState() {
    super.initState();
    _query = TextEditingController();
  }

  void _scheduleSearchFromInput(String text) {
    _debounce?.cancel();
    final trimmed = text.trim();
    if (trimmed.isEmpty) {
      ref.read(flightsPlaceSearchNotifierProvider.notifier).search('');
      return;
    }
    _debounce = Timer(_searchDebounce, () {
      if (!mounted) return;
      ref.read(flightsPlaceSearchNotifierProvider.notifier).search(text);
    });
  }

  void _clearQuery() {
    _debounce?.cancel();
    _query.clear();
    ref.read(flightsPlaceSearchNotifierProvider.notifier).search('');
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _query.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncSuggestions = ref.watch(flightsPlaceSearchNotifierProvider);
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Search Bar Header
              Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(
                      Icons.close_rounded,
                      color: Color(0xFF374151),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: ListenableBuilder(
                      listenable: _query,
                      builder: (context, _) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.search_rounded,
                                color: Color(0xFF9CA3AF),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextField(
                                  controller: _query,
                                  autofocus: true,
                                  onChanged: _scheduleSearchFromInput,
                                  textInputAction: TextInputAction.search,
                                  style: const TextStyle(
                                    color: Color(0xFF111827),
                                    fontWeight: FontWeight.w600,
                                    fontSize: 16,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: l10n.searchHint,
                                    hintStyle: const TextStyle(
                                      color: Color(0xFF9CA3AF),
                                      fontWeight: FontWeight.w500,
                                    ),
                                    border: InputBorder.none,
                                    isDense: true,
                                    contentPadding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    suffixIcon: _query.text.isNotEmpty
                                        ? IconButton(
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(
                                              minWidth: 32,
                                              minHeight: 32,
                                            ),
                                            icon: Icon(
                                              Icons.cancel_rounded,
                                              size: 18,
                                              color: Colors.grey.shade400,
                                            ),
                                            onPressed: _clearQuery,
                                          )
                                        : null,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Main Results Body
              Expanded(
                child: ListenableBuilder(
                  listenable: _query,
                  builder: (context, _) {
                    final trimmed = _query.text.trim();
                    final hasQuery = trimmed.isNotEmpty;

                    if (!hasQuery) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.indigo.withValues(alpha: 0.06),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.flight_takeoff_rounded,
                                size: 48,
                                color: Colors.indigo.shade600,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              l10n.searchHint,
                              style: const TextStyle(
                                color: Color(0xFF4B5563),
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Search by city name, airport name, or IATA code',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Color(0xFF9CA3AF),
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    if (trimmed.length < 2) {
                      return Center(
                        child: Text(
                          l10n.typeMinChars,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Color(0xFF6B7280),
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      );
                    }

                    return asyncSuggestions.when(
                      data: (rawSuggestions) {
                        final suggestions = _groupSuggestionsByCity(
                          rawSuggestions,
                        );
                        if (suggestions.isEmpty) {
                          if (_debounce?.isActive ?? false) {
                            return const Center(
                              child: Padding(
                                padding: EdgeInsets.all(24),
                                child: CircularProgressIndicator(
                                  color: Colors.indigo,
                                ),
                              ),
                            );
                          }
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.search_off_rounded,
                                    size: 40,
                                    color: Colors.grey.shade400,
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    l10n.noMatches(trimmed),
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: Color(0xFF6B7280),
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }

                        // Flatten the list into list items for the UI
                        final List<Widget> listItems = [];

                        for (final suggestion in suggestions) {
                          final isCity = suggestion.kind == 'city';

                          if (isCity) {
                            // City header
                            listItems.add(
                              _CityHeaderTile(
                                suggestion: suggestion,
                                onTap: () {
                                  final allIatas = suggestion.airports
                                      .map((a) => a.iata)
                                      .join(',');
                                  Navigator.of(context).pop(
                                    CatalogAirportSuggestion(
                                      iata: allIatas,
                                      name: suggestion.name,
                                      nameAr: suggestion.nameAr,
                                      city: suggestion.name,
                                      country: suggestion.country,
                                      countryCode: suggestion.countryCode,
                                    ),
                                  );
                                },
                              ),
                            );

                            // Children airports
                            for (final airport in suggestion.airports) {
                              listItems.add(
                                _AirportTile(
                                  airport: airport,
                                  cityName: suggestion.name,
                                  countryName: suggestion.country,
                                  onTap: () =>
                                      Navigator.of(context).pop(airport),
                                ),
                              );
                            }
                          } else {
                            // Standalone airport suggestion
                            for (final airport in suggestion.airports) {
                              listItems.add(
                                _AirportTile(
                                  airport: airport,
                                  cityName: airport.city,
                                  countryName: airport.country,
                                  onTap: () =>
                                      Navigator.of(context).pop(airport),
                                ),
                              );
                            }
                          }

                          // Separator between suggestions
                          listItems.add(
                            const Divider(
                              height: 1,
                              thickness: 1,
                              color: Color(0xFFF3F4F6),
                            ),
                          );
                        }

                        return ListView(
                          padding: const EdgeInsets.only(top: 8, bottom: 24),
                          children: listItems,
                        );
                      },
                      error: (e, _) => AppErrorView(
                        error: e,
                        onRetry: () {
                          ref
                              .read(flightsPlaceSearchNotifierProvider.notifier)
                              .search(_query.text);
                        },
                      ),
                      loading: () => const Center(
                        child: Padding(
                          padding: EdgeInsets.all(24),
                          child: CircularProgressIndicator(
                            color: Colors.indigo,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CityHeaderTile extends StatelessWidget {
  const _CityHeaderTile({required this.suggestion, required this.onTap});

  final CatalogLocationSuggestion suggestion;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final actualCount = suggestion.airports.length;
    final isAr = Localizations.localeOf(context).languageCode == 'ar';

    var displayName = suggestion.name;
    // Dynamically localized city name if nameAr is provided by API
    if (isAr && suggestion.nameAr != null && suggestion.nameAr!.isNotEmpty) {
      displayName = suggestion.nameAr!;
    }

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          color: Color(0xFFF9FAFB),
          border: Border(
            left: BorderSide(color: Colors.orange, width: 4),
            bottom: BorderSide(color: Color(0xFFE5E7EB), width: 1),
          ),
        ),
        child: Row(
          children: [
            const Icon(
              Icons.location_on_rounded,
              color: Colors.orange,
              size: 24,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        displayName,
                        style: const TextStyle(
                          color: Color(0xFF1E3A8A),
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.orange.shade200,
                            width: 0.5,
                          ),
                        ),
                        child: Text(
                          isAr
                              ? '$actualCount ${actualCount == 1 ? 'مطار' : 'مطارات'}'
                              : '$actualCount ${actualCount == 1 ? 'airport' : 'airports'}',
                          style: TextStyle(
                            color: Colors.orange.shade800,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAr ? 'جميع المطارات في $displayName' : 'All airports in $displayName',
                    style: const TextStyle(
                      color: Color(0xFF6B7280),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AirportTile extends StatelessWidget {
  const _AirportTile({
    required this.airport,
    required this.cityName,
    required this.countryName,
    required this.onTap,
  });

  final CatalogAirportSuggestion airport;
  final String cityName;
  final String countryName;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isAr = Localizations.localeOf(context).languageCode == 'ar';
    final displayName =
        (isAr && airport.nameAr != null && airport.nameAr!.isNotEmpty)
        ? airport.nameAr!
        : airport.name;

    final isAllAirports = airport.iata.contains(',');

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            bottom: BorderSide(color: Color(0xFFF3F4F6), width: 1),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top gray city, country text
            Text(
              isAllAirports
                  ? (isAr
                        ? 'جميع مطارات $cityName'
                        : 'All airports in $cityName')
                  : '$cityName, $countryName',
              style: const TextStyle(
                color: Color(0xFF6B7280),
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                // Airplane icon (purple, or orange for All airports)
                Icon(
                  isAllAirports
                      ? Icons.location_on_rounded
                      : Icons.flight_takeoff_rounded,
                  color: isAllAirports ? Colors.orange : Colors.indigo.shade600,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    displayName,
                    style: const TextStyle(
                      color: Color(0xFF1F2937),
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Badge (indigo or orange)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: isAllAirports
                        ? Colors.orange.shade50
                        : Colors.indigo.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    airport.iata,
                    style: TextStyle(
                      color: isAllAirports
                          ? Colors.orange.shade800
                          : Colors.indigo.shade700,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

List<CatalogLocationSuggestion> _groupSuggestionsByCity(
  List<CatalogLocationSuggestion> rawSuggestions,
) {
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
      groupedResults.add(
        CatalogLocationSuggestion(
          kind: 'city',
          name: cityName,
          nameAr: source.nameAr,
          country: source.country,
          countryCode: source.countryCode,
          airports: airports,
        ),
      );
    }
  });

  groupedResults.addAll(standaloneAirports);
  return groupedResults;
}

String _normalizeCityName(String city) {
  var name = city.split('(').first.trim();
  name = name.split(',').last.trim();
  // Normalize Turkish İ/I and casing
  name = name.replaceAll('İ', 'i').replaceAll('I', 'i').toLowerCase();
  return name;
}

String _getCleanCityDisplay(String city) {
  var name = city.split('(').first.trim();
  name = name.split(',').last.trim();
  if (name.isEmpty) return '';
  return name[0].toUpperCase() + name.substring(1);
}
