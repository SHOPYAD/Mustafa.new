import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../recently_viewed_theme.dart';
import '../widgets/recently_viewed_category_tabs.dart';
import '../widgets/recently_viewed_city_chips_bar.dart';
import '../widgets/recently_viewed_day_header.dart';
import '../widgets/recently_viewed_footer_note.dart';
import '../widgets/recently_viewed_property_card.dart';

class RecentlyViewedPage extends StatefulWidget {
  const RecentlyViewedPage({super.key});

  static const _tabs = ['All', 'Stays', 'Attractions', 'Tours', 'Package tours'];

  static const _cityChips = [
    'All cities',
    'London',
    'Qesm Al Wahat Al Khargah',
    'Paris',
    'Tokyo',
  ];

  @override
  State<RecentlyViewedPage> createState() => _RecentlyViewedPageState();
}

class _RecentlyViewedPageState extends State<RecentlyViewedPage> {
  int _tabIndex = 0;
  int _cityChipIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        surfaceTintColor: Colors.transparent,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.grey.shade900),
          onPressed: () => context.pop(),
        ),
        title: Text('Recently viewed', style: RecentlyViewedTheme.appBarTitle),
        centerTitle: true,
        actions: [
          IconButton(
            tooltip: 'Wishlist',
            onPressed: () {},
            icon: Icon(Icons.collections_bookmark_outlined, size: 24, color: Colors.grey.shade900),
          ),
          IconButton(
            tooltip: 'Clear history',
            onPressed: () {},
            icon: Icon(Icons.delete_outline_rounded, size: 24, color: Colors.grey.shade900),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          RecentlyViewedCategoryTabs(
            labels: RecentlyViewedPage._tabs,
            selectedIndex: _tabIndex,
            onChanged: (i) => setState(() => _tabIndex = i),
          ),
          const SizedBox(height: 10),
          RecentlyViewedCityChipsBar(
            labels: RecentlyViewedPage._cityChips,
            selectedIndex: _cityChipIndex,
            onChanged: (i) => setState(() => _cityChipIndex = i),
          ),
          const SizedBox(height: 10),
          Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              children: [
                const RecentlyViewedDayHeader(),
                RecentlyViewedPropertyCard(
                  imageAsset: 'assets/images/1.jpg',
                  title: 'ibis budget London Whitechapel - Brick Lane',
                  starCount: 4,
                  ratingScore: '8.4',
                  reviewCount: 156,
                  areaLine: 'Theatreland',
                  dateRange: 'Apr 23 - Apr 25',
                  soldOut: true,
                ),
                RecentlyViewedPropertyCard(
                  imageAsset: 'assets/images/2.jpg',
                  title: 'Zedwell Capsule Hotel Piccadilly Circus',
                  starCount: 4,
                  ratingScore: '8.6',
                  reviewCount: 892,
                  dateRange: 'Apr 23 - Apr 25',
                  soldOut: false,
                ),
                RecentlyViewedPropertyCard(
                  imageAsset: 'assets/images/3.jpg',
                  title: 'The Resident Covent Garden',
                  starCount: 5,
                  ratingScore: '9.0',
                  reviewCount: 324,
                  areaLine: 'Covent Garden',
                  dateRange: 'Apr 20 - Apr 22',
                  soldOut: false,
                ),
                const RecentlyViewedFooterNote(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
