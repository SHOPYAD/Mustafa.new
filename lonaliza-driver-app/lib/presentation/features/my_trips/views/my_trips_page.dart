import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/router_providers.dart';
import '../../home/widgets/home_bottom_nav.dart';
import '../widgets/hotel_recommendation_card.dart';
import '../widgets/hotel_recommendation_section.dart';
import '../widgets/my_trips_empty_state.dart';
import '../widgets/my_trips_header.dart';
import '../widgets/plan_with_ai_banner.dart';
import '../widgets/where_to_next_divider.dart';

class MyTripsPage extends ConsumerStatefulWidget {
  const MyTripsPage({super.key});

  @override
  ConsumerState<MyTripsPage> createState() => _MyTripsPageState();
}

class _MyTripsPageState extends ConsumerState<MyTripsPage> {
  void _handleBottomNavTap(int index) {
    if (index == 0) {
      ref.read(navigationRepositoryProvider).goHome();
    } else if (index == 1) {
      ref.read(navigationRepositoryProvider).goMessages();
    } else if (index == 4) {
      ref.read(navigationRepositoryProvider).goAccount();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              const MyTripsHeader(),
              const MyTripsEmptyState(),
              const WhereToNextDivider(),
              
              // First Recommendation Section
              const HotelRecommendationSection(
                title: 'Al Wadi Al Gadid Desert',
                cards: [
                  HotelRecommendationCard(
                    imagePath: 'assets/images/1.jpg',
                    name: 'Prime Residence Golf Kattameya',
                    stars: 4,
                    score: '9.1',
                    scoreContext: '150 reviews',
                    price: '\$53.00',
                    originalPrice: '\$54.00',
                    discountOff: '1% off',
                  ),
                  HotelRecommendationCard(
                    imagePath: 'assets/images/2.jpg',
                    name: 'Host Prime Boutique Hotel 01',
                    stars: 3,
                    score: '8.0',
                    scoreContext: '120 reviews',
                    price: '\$30.00',
                    originalPrice: '\$35.00',
                    discountOff: '14% off',
                  ),
                ],
              ),
              
              // Second Recommendation Section
              const HotelRecommendationSection(
                title: 'London',
                cards: [
                  HotelRecommendationCard(
                    imagePath: 'assets/images/3.jpg',
                    name: 'ibis budget London Whitechapel - Brick L...',
                    stars: 3,
                    score: '8.4',
                    scoreContext: '156 reviews',
                    price: '\$118.00',
                    originalPrice: '\$130.00',
                    discountOff: '9% off',
                  ),
                  HotelRecommendationCard(
                    imagePath: 'assets/images/1.jpg',
                    name: 'City London Hotel',
                    stars: 3,
                    score: '9',
                    scoreContext: '239 reviews',
                    price: '\$99.00',
                    originalPrice: '\$130.00',
                    discountOff: '23% off',
                  ),
                ],
              ),
              
              const PlanWithAIBanner(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: 3, // My Trips is index 3
        onTap: _handleBottomNavTap,
      ),
    );
  }
}
