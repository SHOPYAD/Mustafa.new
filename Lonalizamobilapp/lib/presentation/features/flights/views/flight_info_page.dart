import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liotrip/presentation/features/flights/widgets/info/flight_booking_stepper.dart';
import 'package:liotrip/presentation/features/flights/widgets/info/flight_info_summary_header.dart';
import 'package:liotrip/presentation/features/flights/widgets/info/flight_passengers_card.dart';
import 'package:liotrip/presentation/features/flights/widgets/info/flight_contact_card.dart';
import 'package:liotrip/presentation/features/flights/widgets/info/flight_insurance_card.dart';
import 'package:liotrip/presentation/features/flights/widgets/info/flight_baggage_protection_card.dart';
import 'package:liotrip/presentation/features/flights/widgets/info/flight_trip_coins_card.dart';
import 'package:liotrip/presentation/features/flights/widgets/info/flight_promo_code_card.dart';
import 'package:liotrip/presentation/features/flights/widgets/info/flight_info_bottom_bar.dart';

class FlightInfoPage extends ConsumerWidget {
  const FlightInfoPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1F2937)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Enter info',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: FlightBookingStepper(currentStep: 1),
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          const SliverToBoxAdapter(child: FlightInfoSummaryHeader()),
          const SliverToBoxAdapter(child: SizedBox(height: 8)),
          const SliverToBoxAdapter(child: FlightPassengersCard()),
          const SliverToBoxAdapter(child: FlightContactCard()),
          const SliverToBoxAdapter(child: FlightInsuranceCard()),
          const SliverToBoxAdapter(child: FlightBaggageProtectionCard()),
          const SliverToBoxAdapter(child: FlightTripCoinsCard()),
          const SliverToBoxAdapter(child: FlightPromoCodeCard()),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('Need Special Assistance?', style: TextStyle(fontSize: 13, color: Color(0xFF4B5563))),
                      const SizedBox(width: 4),
                      Text('View', style: TextStyle(fontSize: 13, color: const Color(0xFF7C3AED).withValues(alpha: 0.8))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  RichText(
                    text: const TextSpan(
                      style: TextStyle(fontSize: 13, color: Color(0xFF4B5563), height: 1.4),
                      children: [
                        TextSpan(text: 'By proceeding, I acknowledge that I have read and agree to Lonaliza\'s '),
                        TextSpan(text: 'Terms of Use', style: TextStyle(color: Color(0xFF7C3AED))),
                        TextSpan(text: ' and '),
                        TextSpan(text: 'Privacy Statement', style: TextStyle(color: Color(0xFF7C3AED))),
                        TextSpan(text: ' for flight bookings.'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Center(
                    child: Text('احجز بثقة مع لوناليزا', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
                  ),
                  const SizedBox(height: 8),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.military_tech, size: 14, color: Color(0xFF0E766E)), // Using military_tech for Award-winning
                      SizedBox(width: 4),
                      Text('Award-winning', style: TextStyle(fontSize: 12, color: Color(0xFF4B5563))),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8),
                        child: Text('|', style: TextStyle(color: Color(0xFFD1D5DB))),
                      ),
                      Icon(Icons.verified, size: 14, color: Color(0xFFD97706)),
                      SizedBox(width: 4),
                      Text('Support in approx. 30s', style: TextStyle(fontSize: 12, color: Color(0xFF4B5563))),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.monetization_on, size: 14, color: Color(0xFFFBBF24)),
                      SizedBox(width: 4),
                      Text('Rewards for booking', style: TextStyle(fontSize: 12, color: Color(0xFF4B5563))),
                    ],
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: const FlightInfoBottomBar(),
    );
  }
}
