import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lonaliza_driver/presentation/features/flights/widgets/info/flight_booking_stepper.dart';
import 'package:lonaliza_driver/presentation/features/flights/widgets/addons/flight_airhelp_card.dart';
import 'package:lonaliza_driver/presentation/features/flights/widgets/addons/flight_vip_lounge_card.dart';
import 'package:lonaliza_driver/presentation/features/flights/widgets/addons/flight_addons_bottom_bar.dart';

class FlightAddonsPage extends ConsumerWidget {
  const FlightAddonsPage({super.key});

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
          'Select add-ons',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: FlightBookingStepper(currentStep: 2, totalSteps: 3),
          ),
        ],
      ),
      body: const CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: SizedBox(height: 8)),
          SliverToBoxAdapter(child: FlightAirhelpCard()),
          SliverToBoxAdapter(child: FlightVipLoungeCard()),
          SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
      bottomNavigationBar: const FlightAddonsBottomBar(),
    );
  }
}
