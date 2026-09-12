import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../core/theme/lonaliza_theme.dart';
import '../../../../providers/router_providers.dart';
import '../../providers/flights_booking_draft_notifier.dart';

class FlightAddonsBottomBar extends ConsumerWidget {
  const FlightAddonsBottomBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(flightsBookingDraftProvider);
    final offer = draft.selectedOffer;
    final variant = draft.selectedVariant;
    final total = variant?.pricing.total ?? offer?.displayPrice;
    final currency = variant?.pricing.currency ?? offer?.pricing.currency ?? '';
    final priceLabel = total == null ? '—' : '$currency ${total.toStringAsFixed(2)}';

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
                  'الإجمالي (${draft.adultCount} بالغ)',
                  style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
                ),
                const SizedBox(height: 2),
                Text(
                  priceLabel,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: LonalizaColors.primary,
                    height: 1.1,
                  ),
                ),
              ],
            ),
          ),
          InkWell(
            onTap: () => ref.read(navigationRepositoryProvider).goFlightPayment(),
            child: Container(
              width: 140,
              decoration: BoxDecoration(
                border: Border.all(color: LonalizaColors.primary),
                borderRadius: BorderRadius.circular(4),
                color: Colors.white,
              ),
              clipBehavior: Clip.antiAlias,
              child: const Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ColoredBox(
                    color: LonalizaColors.primary,
                    child: SizedBox(
                      width: double.infinity,
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Text(
                          'الدفع',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
