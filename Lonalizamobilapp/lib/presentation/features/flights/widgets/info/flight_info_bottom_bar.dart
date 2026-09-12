import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liotrip/core/extensions/context_l10n.dart';
import '../../../../providers/router_providers.dart';
import '../../providers/flights_booking_draft_notifier.dart';

class FlightInfoBottomBar extends ConsumerWidget {
  const FlightInfoBottomBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(flightsBookingDraftProvider);
    final offer = draft.selectedOffer;
    final variant = draft.selectedVariant;
    final isAr = Localizations.localeOf(context).languageCode == 'ar';
    final l10n = context.l10n;

    // Retrieve passenger counts from draft
    final adults = draft.adultCount > 0 ? draft.adultCount : 1;
    final children = draft.childCount;
    final infants = draft.infantCount;
    final totalPassengers = adults + children + infants;

    final passengerText = totalPassengers == 1
        ? l10n.totalTraveler
        : l10n.totalTravelers(totalPassengers);

    // Resolve active pricing
    final currency = variant?.pricing.currency ?? offer?.pricing.currency ?? '\$';
    final basePrice = variant?.pricing.total ?? offer?.pricing.total ?? 704.70;
    
    // Total price is price per person multiplied by total travelers
    final totalPrice = basePrice * totalPassengers;
    final priceStr = '$currency${totalPrice.toStringAsFixed(2)}';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            offset: const Offset(0, -4),
            blurRadius: 10,
          ),
        ],
      ),
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom + 12,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  passengerText,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
                ),
                const SizedBox(height: 2),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      priceStr,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF7C3AED),
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Padding(
                      padding: EdgeInsets.only(bottom: 4),
                      child: Icon(Icons.info_outline_rounded, size: 16, color: Color(0xFF6B7280)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      margin: const EdgeInsets.only(bottom: 3),
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: Text(
                        l10n.savedAmount('$currency${isAr ? '٤' : '4'}'),
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFFE11D48)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(navigationRepositoryProvider).goFlightAddons();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C3AED),
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            ),
            child: Text(
              l10n.continueLabel,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
