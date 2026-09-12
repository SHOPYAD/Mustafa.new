import 'package:flutter/material.dart';

import '../widgets/hotels_filters_sheet.dart';
import '../widgets/search/hotels_search_app_bar.dart';
import '../widgets/search/hotels_search_filter_chips_row.dart';
import '../widgets/search/hotels_search_map_preview.dart';
import '../widgets/search/hotels_search_new_user_banner.dart';
import '../widgets/search/hotels_search_results_list.dart';
import '../widgets/search/hotels_sort_sheet.dart';

class HotelsSearchResultsPage extends StatelessWidget {
  const HotelsSearchResultsPage({super.key});

  Future<void> _showFiltersSheet(BuildContext context) {
    return showGeneralDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Filters',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 240),
      pageBuilder: (_, _, _) => const HotelsFiltersSheet(),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        final offsetTween = Tween<Offset>(
          begin: const Offset(0, 1),
          end: Offset.zero,
        );
        return SlideTransition(
          position: animation.drive(CurveTween(curve: Curves.easeOutCubic)).drive(offsetTween),
          child: child,
        );
      },
    );
  }

  Future<void> _showSortSheet(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => const HotelsSortSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: Column(
        children: [
          const HotelsSearchAppBar(),
          HotelsSearchFilterChipsRow(
            onFiltersTap: () => _showFiltersSheet(context),
            onSortTap: () => _showSortSheet(context),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.only(top: 12, bottom: 24),
              children: const [
                HotelsSearchMapPreview(),
                HotelsSearchNewUserBanner(),
                HotelsSearchResultsList(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
