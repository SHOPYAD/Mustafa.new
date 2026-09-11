import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../all_bookings/all_bookings_theme.dart';
import '../../all_bookings/widgets/all_bookings_flight_card.dart';
import '../../all_bookings/widgets/all_bookings_stay_card.dart';
import '../widgets/upcoming_filter_bar.dart';
import '../widgets/upcoming_list_footer.dart';

class UpcomingPage extends StatelessWidget {
  const UpcomingPage({super.key});

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
        title: Text('Upcoming', style: AllBookingsTheme.appBarTitle),
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
          UpcomingFilterBar(),
          SizedBox(height: 14),
          AllBookingsStayCard(
            hotelName: 'Zedwell Capsule Hotel Piccadilly Circus',
            roomType: 'Capsule Cocoon | 1 Room',
            datesLine: 'Apr 28 - Apr 30, 1 room 2 nights',
            prepayLabel: 'Prepay online',
            price: '\$105.12',
            status: 'Confirmed',
            primaryButtonLabel: 'View booking',
          ),
          SizedBox(height: 12),
          AllBookingsFlightCard(
            status: 'Confirmed',
            leg1Route: 'Algiers (ALG) ➔ Doha (DOH)',
            leg1Schedule: '3:35 PM, Apr 24 - 11:35 PM, Apr 24',
            leg1Code: 'QR1380 (ALG)',
            leg2Route: 'Doha (DOH) ➔ Tokyo (NRT)',
            leg2Schedule: '3:05 AM, Apr 25 - 7:35 PM, Apr 25',
            leg2Code: 'QR806 (DOH)',
            addonTitle: 'Add-ons Purchased or Included',
            promoLine: 'Promo code',
            price: '\$619.30',
          ),
          UpcomingListFooter(),
        ],
      ),
    );
  }
}
