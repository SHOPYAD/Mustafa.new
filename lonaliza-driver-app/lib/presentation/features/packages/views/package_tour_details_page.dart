import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../widgets/package_availability_sheet.dart';
import '../widgets/package_tour_bottom_bar.dart';
import '../widgets/package_tour_customize_card.dart';
import '../widgets/package_tour_details_section.dart';
import '../widgets/package_tour_highlights_list.dart';
import '../widgets/package_tour_highlights_section.dart';
import '../widgets/package_tour_image_slider.dart';
import '../widgets/package_tour_itinerary_section.dart';
import '../widgets/package_tour_more_recommendations.dart';
import '../widgets/package_tour_notice_section.dart';
import '../widgets/package_tour_tab_bar.dart';
import '../widgets/package_tour_title_section.dart';
import '../widgets/package_tour_type_card.dart';
import '../widgets/package_tour_whats_included.dart';

class PackageTourDetailsPage extends StatefulWidget {
  const PackageTourDetailsPage({super.key});

  @override
  State<PackageTourDetailsPage> createState() => _PackageTourDetailsPageState();
}

class _PackageTourDetailsPageState extends State<PackageTourDetailsPage> {
  int _tabIndex = 0;

  static const _tabs = ['Itinerary', 'Details', "What's\nincluded", 'Notice'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // ── SliverAppBar (transparent, floats over image)
              SliverAppBar(
                backgroundColor: Colors.black.withOpacity(0.01),
                elevation: 0,
                pinned: true,
                expandedHeight: 0,
                leading: Padding(
                  padding: const EdgeInsets.all(8),
                  child: GestureDetector(
                    onTap: () => context.pop(),
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
                  _AppBarAction(icon: Icons.favorite_border_rounded, onTap: () {}),
                  const SizedBox(width: 4),
                  _AppBarAction(icon: Icons.share_outlined, onTap: () {}),
                  const SizedBox(width: 4),
                  _AppBarAction(icon: Icons.more_horiz_rounded, onTap: () {}),
                  const SizedBox(width: 8),
                ],
              ),

              // ── Image slider
              const SliverToBoxAdapter(
                child: PackageTourImageSlider(
                  images: [
                    'assets/images/1.jpg',
                    'assets/images/2.jpg',
                    'assets/images/3.jpg',
                  ],
                ),
              ),

              // ── White rounded card body
              SliverToBoxAdapter(
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Title section
                      const PackageTourTitleSection(
                        title: "8D7N · Private Tours · Beijing + Xi'an + Shanghai",
                        tags: ['Departure guaranteed', 'Car-type options available'],
                        recentlyViewedCount: 2981,
                      ),

                      // ── Tour type card
                      const PackageTourTypeCard(
                        label: 'Private tour',
                        description: '+ Travel expert, private car service,\ncustomizable itinerary',
                      ),

                      // ── Quick highlights (info rows)
                      PackageTourHighlightsSection(
                        rows: [
                          PackageTourHighlightRow(
                            icon: const Icon(Icons.diamond_outlined, size: 22, color: Color(0xFF6366F1)),
                            label: '4 diamonds:  High-end',
                            hasChevron: true,
                          ),
                          PackageTourHighlightRow(
                            icon: const Icon(Icons.location_on_outlined, size: 22, color: Color(0xFF374151)),
                            label: 'Departure city:  Beijing',
                          ),
                          PackageTourHighlightRow(
                            icon: const Icon(Icons.group_outlined, size: 22, color: Color(0xFF374151)),
                            label: 'Group size',
                            sublabel: 'Flexible (travel independently)',
                          ),
                          PackageTourHighlightRow(
                            icon: const Icon(Icons.shield_outlined, size: 22, color: Color(0xFF374151)),
                            label: 'Free cancellation',
                            sublabel: 'Free cancellation up to 7 days in advance',
                          ),
                          PackageTourHighlightRow(
                            icon: const Icon(Icons.person_outline_rounded, size: 22, color: Color(0xFF374151)),
                            label: 'Guide',
                            sublabel: 'Tour guide included',
                          ),
                          PackageTourHighlightRow(
                            icon: const Icon(Icons.translate_rounded, size: 22, color: Color(0xFF374151)),
                            label: 'Service language:  English/Mandarin',
                            hasChevron: true,
                          ),
                          PackageTourHighlightRow(
                            icon: const Icon(Icons.directions_car_outlined, size: 22, color: Color(0xFF374151)),
                            label: 'Pick-up & drop-off methods',
                            sublabel: 'Airport/station pick-up included',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // ── Sticky Tab Bar
              SliverPersistentHeader(
                pinned: true,
                delegate: _TabBarDelegate(
                  child: PackageTourTabBar(
                    tabs: _tabs,
                    selectedIndex: _tabIndex,
                    onTabChanged: (i) => setState(() => _tabIndex = i),
                  ),
                ),
              ),

              // ── Tab content
              SliverToBoxAdapter(
                child: IndexedStack(
                  index: _tabIndex,
                  children: [
                    // ── Tab 0: Itinerary
                    Column(
                      children: [
                        PackageTourHighlightsList(highlights: const [
                          "Savor Beijing's essence – curated routes, zero time wasted.",
                          "Discover the dual charm of Beijing's millennium-old imperial capital, step into Xi'an's time tunnel spanning three thousand years, and experience Shanghai's modern symphony of diversity.",
                          "Choose from a 5-seater, 7-seater business car, or 15-seater minibus. Enjoy exclusive use throughout the journey, a comfortable and time-saving experience, and flexible itinerary adjustments.",
                        ]),
                        const Divider(height: 8, thickness: 8, color: Color(0xFFF3F4F6)),
                        PackageTourItinerarySection(days: PackageTourItinerarySection.sampleDays),
                        const PackageTourCustomizeCard(),
                        const Padding(
                          padding: EdgeInsets.fromLTRB(16, 4, 16, 16),
                          child: Row(
                            children: [
                              Icon(Icons.info_outline_rounded, size: 14, color: Color(0xFF9CA3AF)),
                              SizedBox(width: 6),
                              Text('Itinerary info', style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
                            ],
                          ),
                        ),
                        const PackageTourMoreRecommendations(),
                      ],
                    ),

                    // ── Tab 1: Details → rich text + What's included (as shown in screenshot)
                    Column(
                      children: const [
                        PackageTourDetailsSection(),
                        PackageTourWhatsIncluded(),
                        PackageTourMoreRecommendations(),
                      ],
                    ),

                    // ── Tab 2: What's included (standalone)
                    Column(
                      children: const [
                        PackageTourWhatsIncluded(),
                        PackageTourMoreRecommendations(),
                      ],
                    ),

                    // ── Tab 3: Notice → contact + booking notices + more recommendations
                    Column(
                      children: const [
                        PackageTourNoticeSection(),
                        PackageTourMoreRecommendations(),
                      ],
                    ),
                  ],
                ),
              ),

              // Bottom padding for bottom bar
              const SliverToBoxAdapter(child: SizedBox(height: 130)),
            ],
          ),

          // ── Fixed bottom bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: PackageTourBottomBar(
              price: r'$1,686',
              onCustomize: () {},
              onCheckAvailability: () => showAvailabilitySheet(context),
            ),
          ),
        ],
      ),
    );
  }
}

// ── SliverPersistentHeader delegate for the sticky tab bar
class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  const _TabBarDelegate({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) => child;

  @override
  double get maxExtent => 50;
  @override
  double get minExtent => 50;
  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => true;
}

// ── AppBar action button
class _AppBarAction extends StatelessWidget {
  const _AppBarAction({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.30),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.white, size: 18),
      ),
    );
  }
}
