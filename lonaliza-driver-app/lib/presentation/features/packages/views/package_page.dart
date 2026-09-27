import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/router_providers.dart';
import '../../home/widgets/home_bottom_nav.dart';
import '../widgets/package_action_buttons.dart';
import '../widgets/package_bookings_row.dart';
import '../widgets/package_itinerary_card.dart';
import '../widgets/package_itinerary_section.dart';
import '../widgets/package_search_section.dart';
import '../widgets/package_tab_bar.dart';
import '../widgets/package_tour_list_card.dart';

class PackagePage extends ConsumerStatefulWidget {
  const PackagePage({super.key});

  @override
  ConsumerState<PackagePage> createState() => _PackagePageState();
}

class _PackagePageState extends ConsumerState<PackagePage> {
  int _tabIndex = 0;

  void _handleBottomNavTap(int index) {
    if (index == 0) ref.read(navigationRepositoryProvider).goHome();
    if (index == 1) ref.read(navigationRepositoryProvider).goMessages();
    if (index == 3) ref.read(navigationRepositoryProvider).goMyTrips();
    if (index == 4) ref.read(navigationRepositoryProvider).goAccount();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // ── SliverAppBar = proper top nav + hero image
          SliverAppBar(
            expandedHeight: 220,
            pinned: false,
            floating: false,
            backgroundColor: Colors.transparent,
            elevation: 0,
            leading: Padding(
              padding: const EdgeInsets.all(8),
              child: GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.35),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                ),
              ),
            ),
            actions: [
              // User avatar
              Container(
                width: 34,
                height: 34,
                margin: const EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFF59E0B),
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
                alignment: Alignment.center,
                child: const Text('T', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              ),
              // More options
              Container(
                width: 34,
                height: 34,
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.35),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.more_horiz_rounded, color: Colors.white, size: 20),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(left: 16, bottom: 16),
              title: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Private Tours',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Container(
                    width: 7,
                    height: 7,
                    margin: const EdgeInsets.only(bottom: 3),
                    decoration: const BoxDecoration(
                      color: Color(0xFF3B82F6),
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset('assets/images/3.jpg', fit: BoxFit.cover),
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Color(0x55000000), Color(0x22000000), Color(0xBB000000)],
                        stops: [0.0, 0.5, 1.0],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── White body card (tabs + search + actions)
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tab bar
                  PackageTabBar(
                    selectedIndex: _tabIndex,
                    onTabChanged: (i) => setState(() => _tabIndex = i),
                  ),
                  // Search + chips + dates
                  PackageSearchSection(tabIndex: _tabIndex),
                  const SizedBox(height: 4),
                  // Action buttons
                  const PackageActionButtons(),
                ],
              ),
            ),
          ),


          // ── My Bookings row
          const SliverToBoxAdapter(child: SizedBox(height: 4)),
          const SliverToBoxAdapter(child: PackageBookingsRow()),

          // ── Popular China Itineraries
          SliverToBoxAdapter(
            child: PackageItinerarySection(
              title: 'Popular China itineraries',
              cards: const [
                PackageItineraryCard(
                  imagePath: 'assets/images/1.jpg',
                  title: 'Classic Cities &\nCulinary Discovery',
                  subtitle: 'Recommended 13–15 days',
                  duration: '15-day 14-night',
                  price: '\$3,265',
                  productId: '61745777',
                  rating: '5',
                  reviewCount: 120,
                  routeStops: ['Shanghai', 'Beijing', "Xi'an", 'Chengdu', 'Chongqing'],
                ),
                PackageItineraryCard(
                  imagePath: 'assets/images/2.jpg',
                  title: 'Classic Cities &\nCharm Discovery',
                  subtitle: 'Recommended 10–12 days',
                  duration: '12-day 11-night',
                  price: '\$2,890',
                  productId: '61745778',
                  rating: '5',
                  reviewCount: 98,
                  routeStops: ['Beijing', 'Lijiang', 'Dali'],
                ),
              ],
            ),
          ),

          // ── Recommended Tours
          SliverToBoxAdapter(
            child: PackageItinerarySection(
              title: 'Recommended Tours',
              cards: const [
                PackageItineraryCard(
                  imagePath: 'assets/images/3.jpg',
                  title: 'Golden Triangle\nAdventure',
                  subtitle: 'Recommended 8–10 days',
                  duration: '9-day 8-night',
                  price: '\$1,540',
                  productId: '61890001',
                  rating: '4',
                  reviewCount: 75,
                  routeStops: ['Dubai', 'Abu Dhabi', 'Sharjah'],
                ),
                PackageItineraryCard(
                  imagePath: 'assets/images/1.jpg',
                  title: 'Mediterranean\nHighlights',
                  subtitle: 'Recommended 12–14 days',
                  duration: '13-day 12-night',
                  price: '\$4,120',
                  productId: '61890002',
                  rating: '5',
                  reviewCount: 200,
                  routeStops: ['Rome', 'Florence', 'Venice', 'Athens'],
                ),
              ],
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 4)),

          // ── Vertical list section header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: const Text(
                'Recommended Tours',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF111827),
                  letterSpacing: -0.4,
                ),
              ),
            ),
          ),

          // Filter chips row
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _FilterChip(label: 'Sort by'),
                  _FilterChip(label: 'Filter'),
                  _FilterChip(label: 'Duration/dates'),
                  _FilterChip(label: 'Budget'),
                  _FilterChip(label: 'Services'),
                ],
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 8)),

          // ── Vertical tour list cards
          SliverList(
            delegate: SliverChildListDelegate([
              PackageTourListCard(
                imagePath: 'assets/images/1.jpg',
                imageLabel: 'Private Tours',
                rating: '4',
                title: '8D7N·China Golden Triangle Discovery',
                language: 'English/Mandarin | Tour guide included',
                transferIncluded: 'Airport/station pick-up & drop-off incl...',
                departFrom: 'Depart from Beijing',
                price: '\$1,686',
                freeCancellation: true,
                departureGuaranteed: true,
              ),
              PackageTourListCard(
                imagePath: 'assets/images/2.jpg',
                imageLabel: 'Private Tours',
                rating: '5',
                title: '3D2N·Zhangjiajie National Forest Park + Huanglong Cave + Z...',
                language: 'Mandarin/English | Tour guide included',
                transferIncluded: 'Airport/station pick-up & drop-off incl...',
                departFrom: 'Depart from Zhangjiajie',
                price: '\$406',
                reviewScore: '5.0/5',
                reviewCount: 61,
                bookedCount: 87,
                departureGuaranteed: true,
                freeEsim: true,
              ),
              PackageTourListCard(
                imagePath: 'assets/images/3.jpg',
                imageLabel: 'Private Tours',
                rating: '5',
                title: '3D2N·Jiuzhaigou + Huanglong National Scenic Area + Chengdu R...',
                language: 'Mandarin/English',
                transferIncluded: 'Airport/station pick-up & drop-off incl...',
                departFrom: 'Depart from Chengdu',
                price: '\$246',
                reviewScore: '4.9/5',
                reviewCount: 7,
                bookedCount: 26,
                freeCancellation: true,
                departureGuaranteed: true,
              ),
            ]),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: 2,
        onTap: _handleBottomNavTap,
      ),
    );
  }
}

/// Small filter chip used in the sort/filter row
class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFD1D5DB)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF374151), fontWeight: FontWeight.w500)),
          const SizedBox(width: 4),
          const Icon(Icons.arrow_drop_down_rounded, size: 16, color: Color(0xFF6B7280)),
        ],
      ),
    );
  }
}

