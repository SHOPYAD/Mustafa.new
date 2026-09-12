import 'package:flutter/material.dart';
import 'package:liotrip/core/extensions/context_l10n.dart';
import '../../../../domain/entities/flights/flight_offer.dart';
import '../widgets/details/flight_itinerary_card.dart';
import '../widgets/details/flight_fare_packages_section.dart';

class FlightDetailsPage extends StatelessWidget {
  const FlightDetailsPage({super.key, this.offer});

  final FlightOffer? offer;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(
        0xFFE8EBF1,
      ), // slightly darker gray from screenshot
      appBar: AppBar(
        backgroundColor: Colors.white,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF1F2937)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          context.l10n.selectFare,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF1F2937),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.notifications_none_rounded,
              color: Color(0xFF1F2937),
            ),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(
              Icons.more_horiz_rounded,
              color: Color(0xFF1F2937),
            ),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.only(top: 12),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: FlightItineraryCard(offer: offer),
          ),
          const SizedBox(height: 12),
          FlightFarePackagesSection(offer: offer),
        ],
      ),
    );
  }
}
