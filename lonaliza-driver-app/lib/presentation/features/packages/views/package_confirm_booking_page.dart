import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../presentation/features/checkout_payment/views/checkout_payment_page.dart';
import '../widgets/package_booking_contact_info.dart';
import '../widgets/package_booking_extras_cards.dart';
import '../widgets/package_booking_notes_and_terms.dart';
import '../widgets/package_booking_traveler_info.dart';
import '../widgets/package_booking_trip_summary.dart';
import '../widgets/package_confirm_bottom_bar.dart';

/// Step 2 of 3 – Confirm booking: traveler info, contact, discount, notes, terms
class PackageConfirmBookingPage extends StatelessWidget {
  const PackageConfirmBookingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: Stack(
        children: [
          NestedScrollView(
            headerSliverBuilder: (_, __) => [
              SliverAppBar(
                pinned: true,
                elevation: 0,
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                leading: GestureDetector(
                  onTap: () => context.pop(),
                  child: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                ),
                title: const Text('Confirm booking',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: Colors.white)),
                actions: [_StepIndicator(current: 2)],
              ),
            ],
            body: SingleChildScrollView(
              child: Column(
                children: [
                  // ── Trip summary
                  const PackageBookingTripSummary(
                    title: "8D7N · Private Tours · Beijing + Xi'an + Shanghai",
                    departCity: 'Beijing',
                    dateRange: 'April 29, 2026 - May 6, 2026',
                    adults: 2,
                  ),

                  // ── Traveler info
                  const PackageBookingTravelerInfo(requiredCount: 2),

                  // ── Contact info
                  const PackageBookingContactInfo(),

                  // ── Discount promo code
                  const PackageBookingDiscountCard(),

                  // ── Trip Coins
                  const PackageBookingTripCoinsCard(coins: 743, usdValue: r'$7.43'),

                  // ── Notes + Terms + confirmation bullet
                  const PackageBookingNotesAndTerms(),

                  // Bottom padding for fixed bar
                  const SizedBox(height: 140),
                ],
              ),
            ),
          ),

          // ── Fixed bottom bar — "Pay" navigates to checkout payment page
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: PackageConfirmBottomBar(
              totalPrice: r'$3,710.91',
              discount: '-\$124.14',
              tripCoins: '\$7.43',
              onNext: () => context.push(
                '/checkout-payment',
                extra: 'USD 3,710.91',
              ),
              onSupport: () {},
            ),
          ),
        ],
      ),
    );
  }
}

// ── Step indicator: ①-②-③
class _StepIndicator extends StatelessWidget {
  const _StepIndicator({required this.current});
  final int current;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 14),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(3, (i) {
          final step = i + 1;
          final isActive = step == current;
          final isCompleted = step < current;
          return Row(
            children: [
              if (i > 0)
                Container(
                  width: 14,
                  height: 1,
                  color: Colors.white.withOpacity(0.5),
                ),
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isActive
                      ? Colors.white
                      : isCompleted
                          ? Colors.white.withOpacity(0.4)
                          : Colors.transparent,
                  border: Border.all(color: Colors.white.withOpacity(0.7), width: 1.5),
                ),
                alignment: Alignment.center,
                child: Text(
                  '$step',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: isActive ? const Color(0xFF2563EB) : Colors.white,
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }
}
