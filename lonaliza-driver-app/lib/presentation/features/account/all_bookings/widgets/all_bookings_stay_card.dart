import 'package:flutter/material.dart';

import '../all_bookings_theme.dart';

/// Hotel / stay booking row card.
class AllBookingsStayCard extends StatelessWidget {
  const AllBookingsStayCard({
    super.key,
    this.hotelName = 'ibis budget London Whitechapel - Brick Lane',
    this.roomType = 'Twin Classic-Room With 2 Single Beds',
    this.datesLine = 'Apr 23 - Apr 25, 1 room 2 nights',
    this.prepayLabel = 'Prepay online',
    this.price = '\$287.00',
    this.status = 'Canceled',
    this.primaryButtonLabel = 'Book Again',
    this.onBookAgain,
  });

  final String hotelName;
  final String roomType;
  final String datesLine;
  final String prepayLabel;
  final String price;
  final String status;
  final String primaryButtonLabel;
  final VoidCallback? onBookAgain;

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
                Icon(Icons.hotel_rounded, size: 20, color: Colors.grey.shade600),
                const SizedBox(width: 6),
                Text('Stays', style: AllBookingsTheme.categoryLabel),
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
                Text(hotelName, style: AllBookingsTheme.hotelName),
                const SizedBox(height: 6),
                Text(roomType, style: AllBookingsTheme.bodyLine),
                const SizedBox(height: 4),
                Text(datesLine, style: AllBookingsTheme.bodyLine),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text('$prepayLabel ', style: AllBookingsTheme.prepayLabel),
                    Text(price, style: AllBookingsTheme.priceBold.copyWith(fontSize: 15)),
                  ],
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: OutlinedButton(
                    onPressed: onBookAgain ?? () {},
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AllBookingsTheme.blue,
                      side: const BorderSide(color: AllBookingsTheme.blue, width: 1.2),
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      minimumSize: const Size(0, 36),
                    ),
                    child: Text(
                      primaryButtonLabel,
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
