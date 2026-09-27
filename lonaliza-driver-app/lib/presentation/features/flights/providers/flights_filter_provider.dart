import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lonaliza_driver/domain/entities/flights/flight_offer.dart';
import 'flight_search_results_provider.dart';

class FlightsFilterState {
  const FlightsFilterState({
    this.nonStopOnly = false,
    this.oneStopMax = false,
    this.seats5PlusOnly = false,
    this.checkedBag20kgPlus = false,
    this.redEyeOnly = false,
    this.minPrice,
    this.maxPrice,
    this.durationMax,
    this.layoverMaxMinutes,
    this.selectedAirlines = const {},
    this.departWindows = const {},
    this.arriveWindows = const {},
    this.selectedCabins = const {},
    this.fromAirports = const {},
    this.toAirports = const {},
    this.layoverAirports = const {},
    this.sort = 'recommended',
  });

  final bool nonStopOnly;
  final bool oneStopMax;
  final bool seats5PlusOnly;
  final bool checkedBag20kgPlus;
  final bool redEyeOnly;

  final double? minPrice;
  final double? maxPrice;
  final int? durationMax;
  final int? layoverMaxMinutes;

  final Set<String> selectedAirlines;
  final Set<String> departWindows;
  final Set<String> arriveWindows;
  final Set<String> selectedCabins;
  final Set<String> fromAirports;
  final Set<String> toAirports;
  final Set<String> layoverAirports;
  final String sort;

  FlightsFilterState copyWith({
    bool? nonStopOnly,
    bool? oneStopMax,
    bool? seats5PlusOnly,
    bool? checkedBag20kgPlus,
    bool? redEyeOnly,
    double? minPrice,
    double? maxPrice,
    int? durationMax,
    int? layoverMaxMinutes,
    Set<String>? selectedAirlines,
    Set<String>? departWindows,
    Set<String>? arriveWindows,
    Set<String>? selectedCabins,
    Set<String>? fromAirports,
    Set<String>? toAirports,
    Set<String>? layoverAirports,
    String? sort,
  }) {
    return FlightsFilterState(
      nonStopOnly: nonStopOnly ?? this.nonStopOnly,
      oneStopMax: oneStopMax ?? this.oneStopMax,
      seats5PlusOnly: seats5PlusOnly ?? this.seats5PlusOnly,
      checkedBag20kgPlus: checkedBag20kgPlus ?? this.checkedBag20kgPlus,
      redEyeOnly: redEyeOnly ?? this.redEyeOnly,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      durationMax: durationMax ?? this.durationMax,
      layoverMaxMinutes: layoverMaxMinutes ?? this.layoverMaxMinutes,
      selectedAirlines: selectedAirlines ?? this.selectedAirlines,
      departWindows: departWindows ?? this.departWindows,
      arriveWindows: arriveWindows ?? this.arriveWindows,
      selectedCabins: selectedCabins ?? this.selectedCabins,
      fromAirports: fromAirports ?? this.fromAirports,
      toAirports: toAirports ?? this.toAirports,
      layoverAirports: layoverAirports ?? this.layoverAirports,
      sort: sort ?? this.sort,
    );
  }

  FlightsFilterState clearMaxPrice() {
    return FlightsFilterState(
      nonStopOnly: nonStopOnly,
      oneStopMax: oneStopMax,
      seats5PlusOnly: seats5PlusOnly,
      checkedBag20kgPlus: checkedBag20kgPlus,
      redEyeOnly: redEyeOnly,
      minPrice: minPrice,
      maxPrice: null,
      durationMax: durationMax,
      layoverMaxMinutes: layoverMaxMinutes,
      selectedAirlines: selectedAirlines,
      departWindows: departWindows,
      arriveWindows: arriveWindows,
      selectedCabins: selectedCabins,
      fromAirports: fromAirports,
      toAirports: toAirports,
      layoverAirports: layoverAirports,
      sort: sort,
    );
  }

  FlightsFilterState clearMinPrice() {
    return FlightsFilterState(
      nonStopOnly: nonStopOnly,
      oneStopMax: oneStopMax,
      seats5PlusOnly: seats5PlusOnly,
      checkedBag20kgPlus: checkedBag20kgPlus,
      redEyeOnly: redEyeOnly,
      minPrice: null,
      maxPrice: maxPrice,
      durationMax: durationMax,
      layoverMaxMinutes: layoverMaxMinutes,
      selectedAirlines: selectedAirlines,
      departWindows: departWindows,
      arriveWindows: arriveWindows,
      selectedCabins: selectedCabins,
      fromAirports: fromAirports,
      toAirports: toAirports,
      layoverAirports: layoverAirports,
      sort: sort,
    );
  }

  FlightsFilterState clearDurationMax() {
    return FlightsFilterState(
      nonStopOnly: nonStopOnly,
      oneStopMax: oneStopMax,
      seats5PlusOnly: seats5PlusOnly,
      checkedBag20kgPlus: checkedBag20kgPlus,
      redEyeOnly: redEyeOnly,
      minPrice: minPrice,
      maxPrice: maxPrice,
      durationMax: null,
      layoverMaxMinutes: layoverMaxMinutes,
      selectedAirlines: selectedAirlines,
      departWindows: departWindows,
      arriveWindows: arriveWindows,
      selectedCabins: selectedCabins,
      fromAirports: fromAirports,
      toAirports: toAirports,
      layoverAirports: layoverAirports,
      sort: sort,
    );
  }

  FlightsFilterState clearLayoverMaxMinutes() {
    return FlightsFilterState(
      nonStopOnly: nonStopOnly,
      oneStopMax: oneStopMax,
      seats5PlusOnly: seats5PlusOnly,
      checkedBag20kgPlus: checkedBag20kgPlus,
      redEyeOnly: redEyeOnly,
      minPrice: minPrice,
      maxPrice: maxPrice,
      durationMax: durationMax,
      layoverMaxMinutes: null,
      selectedAirlines: selectedAirlines,
      departWindows: departWindows,
      arriveWindows: arriveWindows,
      selectedCabins: selectedCabins,
      fromAirports: fromAirports,
      toAirports: toAirports,
      layoverAirports: layoverAirports,
      sort: sort,
    );
  }
}

class FlightsFilterNotifier extends Notifier<FlightsFilterState> {
  @override
  FlightsFilterState build() {
    return const FlightsFilterState();
  }

  void updateFilter(FlightsFilterState newState) {
    state = newState;
  }

  void reset() {
    state = const FlightsFilterState();
  }
}

final flightsFilterProvider =
    NotifierProvider<FlightsFilterNotifier, FlightsFilterState>(
      FlightsFilterNotifier.new,
    );

final filteredFlightsProvider = Provider<AsyncValue<FlightSearchResponse>>((
  ref,
) {
  final searchState = ref.watch(flightSearchStateProvider);
  final filter = ref.watch(flightsFilterProvider);

  return searchState.when(
    data: (response) {
      var filteredOffers = List<FlightOffer>.from(response.offers);

      // --- Popular Filters ---
      if (filter.nonStopOnly) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every(
            (itinerary) => itinerary.stopsCount == 0,
          );
        }).toList();
      }

      if (filter.oneStopMax) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every(
            (itinerary) => itinerary.stopsCount <= 1,
          );
        }).toList();
      }

      if (filter.seats5PlusOnly) {
        filteredOffers = filteredOffers.where((offer) {
          return (offer.seatsRemaining ?? 0) >= 5;
        }).toList();
      }

      if (filter.checkedBag20kgPlus) {
        filteredOffers = filteredOffers.where((offer) {
          String checkedBaggage = offer.defaultVariant?.checkedBagDesc ?? '';

          if (checkedBaggage.isEmpty) {
            final outbound = offer.itineraries.isNotEmpty
                ? offer.itineraries.first
                : null;
            if (outbound != null) {
              for (final seg in outbound.segments) {
                final allowance = seg.baggageAllowance;
                if (allowance != null) {
                  final pieces = allowance.checkedBags;
                  final weight = allowance.weightKg ?? 0;
                  if (pieces > 0 && weight > 0) {
                    checkedBaggage = '$pieces x $weight kg';
                  } else if (weight > 0) {
                    checkedBaggage = '$weight kg';
                  } else if (pieces > 0) {
                    checkedBaggage = '$pieces pc';
                  }
                }
              }
            }
          }

          final weightKg = _parseWeightKg(checkedBaggage);
          final matched = weightKg >= 20;
          debugPrint(
            '[BAGGAGE DEBUG] Flight ${offer.id}: checkedBaggage text: "$checkedBaggage", parsed weight: $weightKg kg. Matched: $matched',
          );
          return matched;
        }).toList();
      }

      if (filter.redEyeOnly) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every((itinerary) {
            if (itinerary.segments.isEmpty) return false;
            final firstDep = itinerary.segments.first.departure.dateTime;
            final lastArr = itinerary.segments.last.arrival.dateTime;

            final depHour = firstDep.hour;
            final arrHour = lastArr.hour;

            final isDepRedEye = depHour >= 22 || depHour < 5;
            final isArrRedEye = arrHour < 6;

            return isDepRedEye || isArrRedEye;
          });
        }).toList();
      }

      // --- Price Filter ---
      if (filter.minPrice != null) {
        filteredOffers = filteredOffers
            .where((offer) => offer.displayPrice >= filter.minPrice!)
            .toList();
      }
      if (filter.maxPrice != null) {
        filteredOffers = filteredOffers
            .where((offer) => offer.displayPrice <= filter.maxPrice!)
            .toList();
      }

      // --- Flight Duration Filter ---
      if (filter.durationMax != null) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every(
            (itinerary) =>
                itinerary.effectiveDurationMinutes <= filter.durationMax!,
          );
        }).toList();
      }

      // --- Layover Rules Filter ---
      if (filter.layoverMaxMinutes != null) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every(
            (itinerary) =>
                itinerary.stopsCount > 0 &&
                itinerary.maxLayoverMinutes <= filter.layoverMaxMinutes!,
          );
        }).toList();
      }

      // --- Airline Names Filter (Starting airline only) ---
      if (filter.selectedAirlines.isNotEmpty) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every((itinerary) {
            if (itinerary.segments.isEmpty) return false;
            final startingCarrier = itinerary.segments.first.carrierName;
            final normName = startingCarrier.toLowerCase().replaceAll(' ', '_');
            return filter.selectedAirlines.contains(normName);
          });
        }).toList();
      }

      // --- Amenities / Departure Windows Filter ---
      if (filter.departWindows.isNotEmpty) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every((itinerary) {
            if (itinerary.segments.isEmpty) return false;
            final depHour = itinerary.segments.first.departure.dateTime.hour;
            String window = '';
            if (depHour >= 6 && depHour < 12)
              window = 'morning';
            else if (depHour >= 12 && depHour < 18)
              window = 'afternoon';
            else if (depHour >= 18 && depHour < 22)
              window = 'evening';
            else
              window = 'night';
            return filter.departWindows.contains(window);
          });
        }).toList();
      }

      // --- Arrival Windows Filter ---
      if (filter.arriveWindows.isNotEmpty) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every((itinerary) {
            if (itinerary.segments.isEmpty) return false;
            final arrHour = itinerary.segments.last.arrival.dateTime.hour;
            String window = '';
            if (arrHour >= 6 && arrHour < 12)
              window = 'morning';
            else if (arrHour >= 12 && arrHour < 18)
              window = 'afternoon';
            else if (arrHour >= 18 && arrHour < 22)
              window = 'evening';
            else
              window = 'night';
            return filter.arriveWindows.contains(window);
          });
        }).toList();
      }

      // --- Cabin Class Filter ---
      if (filter.selectedCabins.isNotEmpty) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every((itinerary) {
            return itinerary.segments.every((segment) {
              final cabin = segment.cabinClass?.toLowerCase() ?? '';
              return filter.selectedCabins.any(
                (c) => cabin.contains(c.toLowerCase()),
              );
            });
          });
        }).toList();
      }

      // --- Airports Filter (From) ---
      if (filter.fromAirports.isNotEmpty) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every((itinerary) {
            if (itinerary.segments.isEmpty) return false;
            return filter.fromAirports.contains(
              itinerary.segments.first.departure.airportCode.toLowerCase(),
            );
          });
        }).toList();
      }

      // --- Airports Filter (To) ---
      if (filter.toAirports.isNotEmpty) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every((itinerary) {
            if (itinerary.segments.isEmpty) return false;
            return filter.toAirports.contains(
              itinerary.segments.last.arrival.airportCode.toLowerCase(),
            );
          });
        }).toList();
      }

      // --- Layover Airports Filter ---
      if (filter.layoverAirports.isNotEmpty) {
        filteredOffers = filteredOffers.where((offer) {
          return offer.itineraries.every((itinerary) {
            if (itinerary.segments.length <= 1) return false;
            final layovers = itinerary.segments
                .sublist(0, itinerary.segments.length - 1)
                .map((seg) => seg.arrival.airportCode.toLowerCase())
                .toSet();
            return layovers.any(
              (airport) => filter.layoverAirports.contains(airport),
            );
          });
        }).toList();
      }

      // --- Sort Filters ---
      if (filter.sort == 'price_asc') {
        filteredOffers.sort((a, b) => a.displayPrice.compareTo(b.displayPrice));
      } else if (filter.sort == 'price_desc') {
        filteredOffers.sort((a, b) => b.displayPrice.compareTo(a.displayPrice));
      } else if (filter.sort == 'duration_asc') {
        filteredOffers.sort((a, b) {
          final durA = a.itineraries.fold<int>(
            0,
            (sum, it) => sum + it.effectiveDurationMinutes,
          );
          final durB = b.itineraries.fold<int>(
            0,
            (sum, it) => sum + it.effectiveDurationMinutes,
          );
          return durA.compareTo(durB);
        });
      } else if (filter.sort == 'depart_asc') {
        filteredOffers.sort((a, b) {
          if (a.itineraries.isEmpty || b.itineraries.isEmpty) return 0;
          final depA = a.itineraries.first.segments.first.departure.dateTime;
          final depB = b.itineraries.first.segments.first.departure.dateTime;
          return depA.compareTo(depB);
        });
      }

      return AsyncData(
        FlightSearchResponse(
          source: response.source,
          meta: response.meta,
          offers: filteredOffers,
          airlines: response.airlines,
          loyalty: response.loyalty,
        ),
      );
    },
    error: (err, stack) => AsyncError(err, stack),
    loading: () => const AsyncLoading(),
  );
});

int _parseWeightKg(String? value) {
  final raw = (value ?? '').toLowerCase().trim();
  if (raw.isEmpty) return 0;
  final regExp = RegExp(r'\d+');
  final matches = regExp.allMatches(raw);
  if (matches.isEmpty) return 0;
  return matches.map((m) => int.parse(m.group(0)!)).reduce((acc, n) => acc + n);
}
