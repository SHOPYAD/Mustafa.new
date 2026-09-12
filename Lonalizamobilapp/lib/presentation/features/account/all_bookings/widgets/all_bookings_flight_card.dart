import 'package:flutter/material.dart';

import '../all_bookings_theme.dart';

/// Flight booking card with legs, add-ons line, and price.
class AllBookingsFlightCard extends StatelessWidget {
  const AllBookingsFlightCard({
    super.key,
    this.status = 'Canceled',
    this.leg1Route = 'Algiers (ALG) ➔ Doha (DOH)',
    this.leg1Schedule = '3:35 PM, Apr 24 - 11:35 PM, Apr 24',
    this.leg1Code = 'QR1380 (ALG)',
    this.leg2Route = 'Doha (DOH) ➔ Tokyo (NRT)',
    this.leg2Schedule = '3:05 AM, Apr 25 - 7:35 PM, Apr 25',
    this.leg2Code = 'QR806 (DOH)',
    this.addonTitle = 'Add-ons Purchased or Included',
    this.promoLine = 'Promo code',
    this.price = '',
  });

  final String status;
  final String leg1Route;
  final String leg1Schedule;
  final String leg1Code;
  final String leg2Route;
  final String leg2Schedule;
  final String leg2Code;
  final String addonTitle;
  final String promoLine;
  final String price;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AllBookingsTheme.cardBorder),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            child: Row(
              children: [
                Icon(Icons.flight_rounded, size: 20, color: Colors.grey.shade600),
                const SizedBox(width: 6),
                Text('Flights', style: AllBookingsTheme.categoryLabel),
                const Spacer(),
                Text(status, style: AllBookingsTheme.statusLabel),
              ],
            ),
          ),
          Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(leg1Route, style: AllBookingsTheme.routeTitle),
                const SizedBox(height: 4),
                Text(leg1Schedule, style: AllBookingsTheme.flightMeta),
                const SizedBox(height: 2),
                Text(leg1Code, style: AllBookingsTheme.flightMeta),
                const SizedBox(height: 12),
                Text(leg2Route, style: AllBookingsTheme.routeTitle),
                const SizedBox(height: 4),
                Text(leg2Schedule, style: AllBookingsTheme.flightMeta),
                const SizedBox(height: 2),
                Text(leg2Code, style: AllBookingsTheme.flightMeta),
                const SizedBox(height: 14),
                Text(addonTitle, style: AllBookingsTheme.addonTitle),
                const SizedBox(height: 4),
                Text(promoLine, style: AllBookingsTheme.promoLine),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(price, style: AllBookingsTheme.priceBold.copyWith(fontSize: 17)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
