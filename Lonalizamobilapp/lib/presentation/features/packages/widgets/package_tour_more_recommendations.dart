import 'package:flutter/material.dart';

import 'package_tour_list_card.dart';

/// "More recommendations" horizontal section used at the bottom of tabs
class PackageTourMoreRecommendations extends StatelessWidget {
  const PackageTourMoreRecommendations({super.key});

  static const _items = [
    _RecoItem(
      imagePath: 'assets/images/1.jpg',
      rating: '4',
      title: '2D1N·Private 2-Day Classic Beijing Tour - Free Tic...',
      reviewScore: '5.0/5',
      reviewCount: 18,
      bookedCount: 104,
      language: 'English/Mandarin',
      transfer: 'Car-type options available',
      departFrom: 'Depart from Beijing',
      freeCancellation: true,
      price: r'$221',
    ),
    _RecoItem(
      imagePath: 'assets/images/2.jpg',
      rating: '4',
      title: '3D2N·Private Beijing Tour for First-Time Visitors with Tic...',
      reviewScore: '5.0/5',
      reviewCount: 6,
      bookedCount: 29,
      language: 'English',
      transfer: 'Car-type options available',
      departFrom: 'Depart from Beijing',
      freeCancellation: true,
      saleLabel: 'Limited-time sale',
      saleOff: r'$8 off >',
      price: r'$366',
    ),
    _RecoItem(
      imagePath: 'assets/images/3.jpg',
      rating: '5',
      title: '5D4N·Beijing + Xi\'an Classic Heritage Highlights',
      reviewScore: '4.9/5',
      reviewCount: 43,
      bookedCount: 88,
      language: 'English | Tour guide included',
      transfer: 'Airport/station pick-up & drop-off incl...',
      departFrom: 'Depart from Beijing',
      departureGuaranteed: true,
      price: r'$980',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(height: 8, thickness: 8, color: Color(0xFFF3F4F6)),
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 20, 16, 12),
          child: Text(
            'More recommendations',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
          ),
        ),
        ..._items.map(
          (item) => PackageTourListCard(
            imagePath: item.imagePath,
            imageLabel: 'Private Tours',
            rating: item.rating,
            title: item.title,
            reviewScore: item.reviewScore,
            reviewCount: item.reviewCount,
            bookedCount: item.bookedCount,
            language: item.language,
            transferIncluded: item.transfer,
            departFrom: item.departFrom,
            freeCancellation: item.freeCancellation,
            departureGuaranteed: item.departureGuaranteed,
            saleLabel: item.saleLabel,
            saleOff: item.saleOff,
            price: item.price,
          ),
        ),
        const SizedBox(height: 8),
      ],
    );
  }
}

class _RecoItem {
  const _RecoItem({
    required this.imagePath,
    required this.rating,
    required this.title,
    this.reviewScore,
    this.reviewCount,
    this.bookedCount,
    required this.language,
    required this.transfer,
    required this.departFrom,
    this.freeCancellation = false,
    this.departureGuaranteed = false,
    this.saleLabel,
    this.saleOff,
    required this.price,
  });

  final String imagePath;
  final String rating;
  final String title;
  final String? reviewScore;
  final int? reviewCount;
  final int? bookedCount;
  final String language;
  final String transfer;
  final String departFrom;
  final bool freeCancellation;
  final bool departureGuaranteed;
  final String? saleLabel;
  final String? saleOff;
  final String price;
}
