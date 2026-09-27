import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../widgets/all_bookings_filter_bar.dart';
import '../widgets/all_bookings_flight_card.dart';
import '../widgets/all_bookings_list_footer.dart';
import '../widgets/all_bookings_stay_card.dart';
import '../all_bookings_theme.dart';

class AllBookingsPage extends StatelessWidget {
  const AllBookingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        surfaceTintColor: Colors.transparent,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.grey.shade900),
          onPressed: () => context.pop(),
        ),
        title: Text('All Bookings', style: AllBookingsTheme.appBarTitle),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: () {},
            icon: Icon(Icons.manage_search_rounded, size: 26, color: Colors.grey.shade900),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        children: const [
          AllBookingsFilterBar(),
          SizedBox(height: 14),
          AllBookingsStayCard(),
          SizedBox(height: 12),
          AllBookingsFlightCard(),
          AllBookingsListFooter(),
        ],
      ),
    );
  }
}
