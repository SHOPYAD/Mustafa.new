import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../widgets/booking/hotel_booking_bottom_bar.dart';
import '../widgets/booking/hotel_booking_discounts_section.dart';
import '../widgets/booking/hotel_booking_fine_print_section.dart';
import '../widgets/booking/hotel_booking_guest_info_section.dart';
import '../widgets/booking/hotel_booking_price_match_banner.dart';
import '../widgets/booking/hotel_booking_special_requests_section.dart';
import '../widgets/booking/hotel_booking_summary_card.dart';
import '../widgets/booking/hotel_booking_terms_section.dart';

class HotelBookingGuestPage extends StatelessWidget {
  const HotelBookingGuestPage({super.key});

  static const _hotelTitle = 'Zedwell Capsule Hotel Piccadilly Circus';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        surfaceTintColor: Colors.transparent,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.of(context).maybePop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
        title: const Text(
          _hotelTitle,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: Color(0xFF111827),
            height: 1.2,
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
        ),
      ),
      bottomNavigationBar: HotelBookingBottomBar(
        onBook: () => context.push('/hotels/search'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const HotelBookingSummaryCard(),
            const SizedBox(height: 20),
            const HotelBookingGuestInfoSection(),
            const SizedBox(height: 22),
            const HotelBookingDiscountsSection(),
            const SizedBox(height: 18),
            const HotelBookingSpecialRequestsSection(),
            const SizedBox(height: 18),
            Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
            const SizedBox(height: 18),
            const HotelBookingFinePrintSection(),
            const SizedBox(height: 18),
            const HotelBookingTermsSection(),
            const SizedBox(height: 16),
            const HotelBookingPriceMatchBanner(),
          ],
        ),
      ),
    );
  }
}
