import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../car_detail_args.dart';
import '../car_rental_product_args.dart';
import '../car_offers_theme.dart';
import '../widgets/car_offer_option_tile.dart';
import '../widgets/car_offers_app_bar.dart';
import '../widgets/car_provider_offers_card.dart';

/// Supplier offers for a chosen vehicle (Trip-style list — not tour tabs).
class CarDetailPage extends StatefulWidget {
  const CarDetailPage({
    super.key,
    required this.args,
  });

  final CarDetailArgs args;

  @override
  State<CarDetailPage> createState() => _CarDetailPageState();
}

class _CarDetailPageState extends State<CarDetailPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.args.appBarTitle;

    final sixtOffers = <CarOfferData>[
      CarOfferData(
        heading: 'Cancellation with fee',
        headingIsTeal: false,
        bullets: const [
          CarOfferBullet(icon: Icons.bolt_rounded, text: 'Instant confirmation'),
          CarOfferBullet(icon: Icons.speed_rounded, text: 'Unlimited mileage'),
          CarOfferBullet(icon: Icons.account_balance_wallet_outlined, text: 'Prepay online'),
        ],
        pricePerDay: r'$58/day',
        totalLabel: r'$173 Total',
      ),
      CarOfferData(
        heading: 'Free cancellation before 10:00 AM, Apr 25',
        headingIsTeal: true,
        bullets: const [
          CarOfferBullet(icon: Icons.bolt_rounded, text: 'Instant confirmation'),
          CarOfferBullet(icon: Icons.speed_rounded, text: 'Unlimited mileage'),
          CarOfferBullet(icon: Icons.payments_outlined, text: 'Pay at pick-up'),
        ],
        pricePerDay: r'$66/day',
        totalLabel: r'$198 Total',
      ),
    ];

    final aceOffers = <CarOfferData>[
      CarOfferData(
        heading: 'Free cancellation before 10:00 AM, Apr 25',
        headingIsTeal: true,
        bullets: const [
          CarOfferBullet(icon: Icons.bolt_rounded, text: 'Instant confirmation'),
          CarOfferBullet(icon: Icons.speed_rounded, text: 'Unlimited mileage'),
          CarOfferBullet(icon: Icons.payments_outlined, text: 'Pay at pick-up'),
        ],
        pricePerDay: r'$61/day',
        totalLabel: r'$183 Total',
      ),
    ];

    return Scaffold(
      backgroundColor: CarOffersTheme.pageBg,
      appBar: CarOffersAppBar(title: title),
      body: Stack(
        children: [
          ListView(
            controller: _scrollController,
            padding: const EdgeInsets.only(top: 8, bottom: 88),
            children: [
              CarProviderOffersCard(
                supplierName: 'SIXT',
                onOfferSelect: (offer) => context.push(
                  '/cars/rental',
                  extra: CarRentalProductArgs.fromSelection(
                    vehicle: widget.args,
                    supplierName: 'SIXT',
                    offer: offer,
                  ),
                ),
                showTripPreferredBanner: true,
                logoLabel: 'SIXT',
                ratingLabel: '4.5/5',
                reviewsLine: 'Excellent 728 reviews',
                pickupLine1: 'Outside terminal, free shuttle (approx. 15 mins)',
                pickupLine2: 'Global chain',
                offers: sixtOffers,
              ),
              CarProviderOffersCard(
                supplierName: 'ACE',
                onOfferSelect: (offer) => context.push(
                  '/cars/rental',
                  extra: CarRentalProductArgs.fromSelection(
                    vehicle: widget.args,
                    supplierName: 'ACE',
                    offer: offer,
                  ),
                ),
                logoLabel: 'ACE',
                logoSubLabel: 'RENT A CAR',
                ratingLabel: '2.9/5',
                reviewsLine: '9 reviews',
                pickupLine1: 'Outside terminal, free shuttle (approx. 13 mins)',
                pickupLine2: 'Multinational chain',
                offers: aceOffers,
              ),
              const SizedBox(height: 8),
            ],
          ),
          Positioned(
            right: 16,
            bottom: 24,
            child: Material(
              elevation: 4,
              shadowColor: Colors.black26,
              shape: const CircleBorder(),
              color: Colors.white,
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: () {
                  if (_scrollController.hasClients) {
                    _scrollController.animateTo(
                      0,
                      duration: const Duration(milliseconds: 350),
                      curve: Curves.easeOutCubic,
                    );
                  }
                },
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Icon(Icons.arrow_upward_rounded, color: Colors.grey.shade600, size: 22),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
