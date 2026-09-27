import 'package:flutter/material.dart';

import '../checkout_payment_theme.dart';

/// Secure badge, countdown, total, itinerary rows, passenger line.
class CheckoutPaymentSummaryCard extends StatelessWidget {
  const CheckoutPaymentSummaryCard({
    super.key,
    required this.totalAmountLabel,
    this.timerText = '00:20:15',
    this.leg1Route = 'Algiers → Doha',
    this.leg1Time = 'Fri, Apr 24, 3:35 PM - 11:35 PM',
    this.leg2Route = 'Doha → Tokyo',
    this.leg2Time = 'Sat, Apr 25, 3:05 AM - 7:35 PM',
    this.passengerLine = 'Passenger: AHMED KEMOUKH (Adult)',
    this.onDetailsTap,
  });

  final String totalAmountLabel;
  final String timerText;
  final String leg1Route;
  final String leg1Time;
  final String leg2Route;
  final String leg2Time;
  final String passengerLine;
  final VoidCallback? onDetailsTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(
        color: CheckoutPaymentTheme.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: CheckoutPaymentTheme.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shield_outlined, size: 20, color: Colors.teal.shade600),
              const SizedBox(width: 8),
              Text('Secure Payment', style: CheckoutPaymentTheme.secureTitle.copyWith(color: Colors.teal.shade700)),
            ],
          ),
          const SizedBox(height: 8),
          Text.rich(
            TextSpan(
              style: CheckoutPaymentTheme.timerLine,
              children: [
                const TextSpan(text: 'Complete payment within '),
                TextSpan(text: timerText, style: CheckoutPaymentTheme.timerBold),
              ],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 14),
          Text(totalAmountLabel, style: CheckoutPaymentTheme.priceLarge),
          const SizedBox(height: 20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Text(leg1Route, style: CheckoutPaymentTheme.routeTitle),
              ),
              GestureDetector(
                onTap: onDetailsTap,
                child: const Text('Details', style: CheckoutPaymentTheme.detailsLink),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerLeft,
            child: Text(leg1Time, style: CheckoutPaymentTheme.routeTime),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerLeft,
            child: Text(leg2Route, style: CheckoutPaymentTheme.routeTitle),
          ),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerLeft,
            child: Text(leg2Time, style: CheckoutPaymentTheme.routeTime),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerLeft,
            child: Text(passengerLine, style: CheckoutPaymentTheme.passenger),
          ),
        ],
      ),
    );
  }
}
