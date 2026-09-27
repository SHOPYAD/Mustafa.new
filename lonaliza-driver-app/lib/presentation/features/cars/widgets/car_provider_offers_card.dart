import 'package:flutter/material.dart';

import '../car_offers_theme.dart';
import 'car_offer_option_tile.dart';
import 'car_trip_preferred_strip.dart';

class CarProviderOffersCard extends StatefulWidget {
  const CarProviderOffersCard({
    super.key,
    required this.supplierName,
    this.onOfferSelect,
    required this.logoLabel,
    this.logoSubLabel,
    required this.ratingLabel,
    required this.reviewsLine,
    required this.pickupLine1,
    required this.pickupLine2,
    required this.offers,
    this.showTripPreferredBanner = false,
  });

  /// Used when building [CarRentalProductArgs] after **Select**.
  final String supplierName;
  final void Function(CarOfferData offer)? onOfferSelect;

  final String logoLabel;
  final String? logoSubLabel;
  final String ratingLabel;
  final String reviewsLine;
  final String pickupLine1;
  final String pickupLine2;
  final List<CarOfferData> offers;
  final bool showTripPreferredBanner;

  @override
  State<CarProviderOffersCard> createState() => _CarProviderOffersCardState();
}

class _CarProviderOffersCardState extends State<CarProviderOffersCard> {
  bool _showAllOffers = true;

  List<CarOfferData> get _visibleOffers {
    if (_showAllOffers || widget.offers.length <= 1) return widget.offers;
    return [widget.offers.first];
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      decoration: BoxDecoration(
        color: CarOffersTheme.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (widget.showTripPreferredBanner) const CarTripPreferredStrip(),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.logoLabel, style: CarOffersTheme.providerName),
                      if (widget.logoSubLabel != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          widget.logoSubLabel!,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: CarOffersTheme.titleDark,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: CarOffersTheme.ratingBadgeBlue,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    widget.ratingLabel,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 8),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                widget.reviewsLine,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: CarOffersTheme.linkBlue,
                  decoration: TextDecoration.underline,
                  decorationColor: CarOffersTheme.linkBlue,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.pickupLine1,
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.grey.shade800, height: 1.35),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.pickupLine2,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: CarOffersTheme.metaGrey,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          for (var i = 0; i < _visibleOffers.length; i++) ...[
            if (i > 0) Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
            CarOfferOptionTile(
              data: _visibleOffers[i],
              onSelect: widget.onOfferSelect != null ? () => widget.onOfferSelect!(_visibleOffers[i]) : null,
            ),
          ],
          if (widget.offers.length > 1)
            TextButton(
              onPressed: () => setState(() => _showAllOffers = !_showAllOffers),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _showAllOffers ? 'Show less' : 'Show more',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: CarOffersTheme.linkBlue,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    _showAllOffers ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                    color: CarOffersTheme.linkBlue,
                    size: 22,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
