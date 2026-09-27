import 'package:flutter/material.dart';

import 'car_detail_args.dart';
import 'widgets/car_offer_option_tile.dart';

/// After tapping **Select** on a supplier offer — full rental product / checkout prep screen.
class CarRentalProductArgs {
  const CarRentalProductArgs({
    required this.vehicleTitle,
    required this.vehicleSubtitle,
    required this.dateRangeLine,
    required this.totalLabel,
    required this.paymentNote,
    required this.supplierName,
    required this.ratingLabel,
    required this.reviewsLine,
    required this.chainTag,
    required this.cancellationHeading,
    required this.rentalPreviewBullets,
    required this.pickupDateLine,
    required this.pickupBranchLine,
    required this.businessHoursLine,
  });

  final String vehicleTitle;
  final String vehicleSubtitle;
  final String dateRangeLine;
  final String totalLabel;
  final String paymentNote;
  final String supplierName;
  final String ratingLabel;
  final String reviewsLine;
  final String chainTag;
  final String cancellationHeading;
  final List<CarOfferBullet> rentalPreviewBullets;
  final String pickupDateLine;
  final String pickupBranchLine;
  final String businessHoursLine;

  static const CarRentalProductArgs fallback = CarRentalProductArgs(
    vehicleTitle: 'Toyota Camry or similar',
    vehicleSubtitle: 'or similar Mid-sized car',
    dateRangeLine: '10:00 AM, Apr 25 - 10:00 AM, Apr 28',
    totalLabel: r'$173.1 Total',
    paymentNote: 'Prepay online',
    supplierName: 'SIXT',
    ratingLabel: '4.5/5',
    reviewsLine: 'Excellent 728 reviews',
    chainTag: 'Global chain',
    cancellationHeading: 'Cancellation with fee',
    rentalPreviewBullets: [
      CarOfferBullet(icon: Icons.bolt_rounded, text: 'Instant confirmation'),
      CarOfferBullet(icon: Icons.speed_rounded, text: 'Unlimited mileage'),
      CarOfferBullet(icon: Icons.local_gas_station_outlined, text: 'Full to full'),
      CarOfferBullet(icon: Icons.check_circle_outline_rounded, text: 'E-voucher'),
    ],
    pickupDateLine: '10:00 AM, Sat, Apr 25 - 10:00 AM, Tue, Apr 28 | 3 days',
    pickupBranchLine:
        'Los Angeles International Airport branch, Outside terminal, free shuttle (approx. 15 mins)',
    businessHoursLine: 'Business hours: 12:00 AM - 1:00 AM, 6:00 AM - 11:59 PM',
  );

  /// Builds args from search vehicle context + chosen supplier offer.
  factory CarRentalProductArgs.fromSelection({
    required CarDetailArgs vehicle,
    required String supplierName,
    required CarOfferData offer,
  }) {
    final prepay = offer.bullets.any((b) => b.text.toLowerCase().contains('prepay'));
    final bullets = <CarOfferBullet>[
      const CarOfferBullet(icon: Icons.bolt_rounded, text: 'Instant confirmation'),
      const CarOfferBullet(icon: Icons.speed_rounded, text: 'Unlimited mileage'),
      const CarOfferBullet(icon: Icons.local_gas_station_outlined, text: 'Full to full'),
      const CarOfferBullet(icon: Icons.check_circle_outline_rounded, text: 'E-voucher'),
    ];

    return CarRentalProductArgs(
      vehicleTitle: vehicle.appBarTitle,
      vehicleSubtitle: vehicle.subtitle,
      dateRangeLine: '10:00 AM, Apr 25 - 10:00 AM, Apr 28',
      totalLabel: _displayTotal(offer.totalLabel),
      paymentNote: prepay ? 'Prepay online' : 'Pay at pick-up',
      supplierName: supplierName,
      ratingLabel: supplierName == 'ACE' ? '2.9/5' : '4.5/5',
      reviewsLine: supplierName == 'ACE' ? '9 reviews' : 'Excellent 728 reviews',
      chainTag: supplierName == 'ACE' ? 'Multinational chain' : 'Global chain',
      cancellationHeading: offer.heading,
      rentalPreviewBullets: bullets,
      pickupDateLine: '10:00 AM, Sat, Apr 25 - 10:00 AM, Tue, Apr 28 | 3 days',
      pickupBranchLine:
          'Los Angeles International Airport branch, Outside terminal, free shuttle (approx. 15 mins)',
      businessHoursLine: 'Business hours: 12:00 AM - 1:00 AM, 6:00 AM - 11:59 PM',
    );
  }

  static String _displayTotal(String totalLabel) {
    final t = totalLabel.trim();
    if (t.startsWith(r'$') && t.endsWith(' Total')) {
      final mid = t.substring(1, t.length - 6);
      return '\$$mid.1 Total';
    }
    return t;
  }
}
