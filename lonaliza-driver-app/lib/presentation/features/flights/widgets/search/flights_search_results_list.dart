import 'package:flutter/material.dart';

import 'package:lonaliza_driver/domain/entities/flights/flight_offer.dart';
import 'package:lonaliza_driver/domain/entities/flights/catalog_airline.dart';
import 'flights_search_result_card.dart';

class FlightsSearchResultsList extends StatelessWidget {
  const FlightsSearchResultsList({
    super.key,
    required this.offers,
    required this.airlinesMap,
  });

  final List<FlightOffer> offers;
  final Map<String, CatalogAirline> airlinesMap;

  @override
  Widget build(BuildContext context) {
    // Find the index of the absolute cheapest offer overall
    int? cheapestIndex;
    double minPrice = double.infinity;

    // Find the index of the cheapest direct offer
    int? cheapestDirectIndex;
    double minDirectPrice = double.infinity;

    for (int i = 0; i < offers.length; i++) {
      final offer = offers[i];
      final segments = offer.itineraries.isNotEmpty
          ? offer.itineraries.first.segments
          : [];
      final isDirect = segments.length <= 1;
      final price = offer.displayPrice;

      if (price < minPrice) {
        minPrice = price;
        cheapestIndex = i;
      }

      if (isDirect && price < minDirectPrice) {
        minDirectPrice = price;
        cheapestDirectIndex = i;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: List.generate(offers.length, (index) {
        final offer = offers[index];
        final isCheapestDirect = index == cheapestDirectIndex;
        final isBestValued = index == cheapestIndex && !isCheapestDirect;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            FlightsSearchResultCard(
              offer: offer,
              airline: offer.firstSegment != null
                  ? airlinesMap[offer.firstSegment!.carrierCode]
                  : null,
              isCheapestDirect: isCheapestDirect,
              isBestValued: isBestValued,
            ),
            if (index != offers.length - 1) const SizedBox(height: 12),
          ],
        );
      }),
    );
  }
}
