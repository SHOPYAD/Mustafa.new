import 'package:flutter/material.dart';

import 'home_gallery_card.dart';

class HomeGallerySection extends StatelessWidget {
  const HomeGallerySection({super.key});

  static const _cards = [
    _GalleryCardData(
      height: 226,
      imageAssets: ['assets/images/2.jpg', 'assets/images/1.jpg'],
      startImageIndex: 0,
      imageHeightFactor: 0.82,
      title: 'VPN in China — What You Need to Know Before...',
      metaLeadingText: 'Sanyu_ch',
      metaTrailingText: '15k',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x22000000), Color(0x00000000), Color(0x66000000)],
      ),
    ),
    _GalleryCardData(
      height: 166,
      imageAssets: ['assets/images/1.jpg', 'assets/images/2.jpg', 'assets/images/3.jpg'],
      startImageIndex: 0,
      imageHeightFactor: 0.7,
      title: '3-Day London Tour: From the Tower of London to ...',
      metaLeadingText: '10 attractions',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x12000000), Color(0x00000000), Color(0x0DFFFFFF)],
      ),
    ),
    _GalleryCardData(
      height: 188,
      imageAssets: ['assets/images/1.jpg'],
      startImageIndex: 0,
      imageHeightFactor: 0.74,
      title: 'London Welcomes a Heavy Snowfall',
      metaLeadingText: 'نبض لوناليزا',
      metaTrailingText: '242',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x14000000), Color(0x00000000), Color(0x0DFFFFFF)],
      ),
    ),
    _GalleryCardData(
      height: 248,
      imageAssets: ['assets/images/3.jpg', 'assets/images/2.jpg'],
      startImageIndex: 0,
      imageHeightFactor: 0.78,
      title: 'Escape the crowds! Check in at the stunning secre...',
      metaLeadingText: 'Mitchell_Ella_30',
      metaTrailingText: '33',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x05000000), Color(0x00000000), Color(0x0DFFFFFF)],
      ),
    ),
    _GalleryCardData(
      height: 204,
      imageAssets: ['assets/images/2.jpg', 'assets/images/3.jpg'],
      startImageIndex: 1,
      imageHeightFactor: 0.76,
      title: 'Best cliffside stays for weekend trips',
      metaLeadingText: 'Jason Egg',
      metaTrailingText: '828',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x22000000), Color(0x00000000), Color(0x66000000)],
      ),
    ),
    _GalleryCardData(
      height: 196,
      imageAssets: ['assets/images/1.jpg'],
      startImageIndex: 0,
      imageHeightFactor: 0.7,
      title: 'Sunny picks for couples and friends',
      metaLeadingText: 'نبض لوناليزا',
      metaTrailingText: '242',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x22000000), Color(0x00000000), Color(0x55000000)],
      ),
    ),
    _GalleryCardData(
      height: 214,
      imageAssets: ['assets/images/3.jpg'],
      startImageIndex: 0,
      imageHeightFactor: 0.75,
      title: 'Traveller stories from scenic rooms',
      metaLeadingText: '12 featured posts',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x18000000), Color(0x00000000), Color(0x0DFFFFFF)],
      ),
    ),
    _GalleryCardData(
      height: 184,
      imageAssets: ['assets/images/2.jpg', 'assets/images/1.jpg', 'assets/images/3.jpg'],
      startImageIndex: 0,
      imageHeightFactor: 0.72,
      title: 'Hand-picked stays by the water',
      metaLeadingText: 'For you',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x22000000), Color(0x00000000), Color(0x0DFFFFFF)],
      ),
    ),
    _GalleryCardData(
      height: 224,
      imageAssets: ['assets/images/1.jpg', 'assets/images/2.jpg'],
      startImageIndex: 0,
      imageHeightFactor: 0.8,
      title: 'Drive-ready stays with unforgettable stops',
      metaLeadingText: 'Road Trip',
      metaTrailingText: '96',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x22000000), Color(0x00000000), Color(0x66000000)],
      ),
    ),
    _GalleryCardData(
      height: 206,
      imageAssets: ['assets/images/3.jpg', 'assets/images/1.jpg'],
      startImageIndex: 1,
      imageHeightFactor: 0.73,
      title: 'Short escapes that feel like a big trip',
      metaLeadingText: 'Updated today',
      imageOverlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x18000000), Color(0x00000000), Color(0x0DFFFFFF)],
      ),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final leftColumnCards = <_GalleryCardData>[];
    final rightColumnCards = <_GalleryCardData>[];

    for (int index = 0; index < _cards.length; index++) {
      if (index.isEven) {
        leftColumnCards.add(_cards[index]);
      } else {
        rightColumnCards.add(_cards[index]);
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Explore More',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w800,
            color: const Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 14),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: _GalleryColumn(cards: leftColumnCards)),
            const SizedBox(width: 12),
            Expanded(child: _GalleryColumn(cards: rightColumnCards)),
          ],
        ),
      ],
    );
  }
}

class _GalleryColumn extends StatelessWidget {
  const _GalleryColumn({required this.cards});

  final List<_GalleryCardData> cards;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (int index = 0; index < cards.length; index++) ...[
          _GalleryCardItem(data: cards[index]),
          if (index != cards.length - 1) const SizedBox(height: 12),
        ],
      ],
    );
  }
}

class _GalleryCardItem extends StatelessWidget {
  const _GalleryCardItem({required this.data});

  final _GalleryCardData data;

  @override
  Widget build(BuildContext context) {
    return HomeGalleryCard(
      height: data.height,
      imageAssets: data.imageAssets,
      startImageIndex: data.startImageIndex,
      imageHeightFactor: data.imageHeightFactor,
      imageOverlayGradient: data.imageOverlayGradient,
      title: data.title,
      metaLeadingText: data.metaLeadingText,
      metaTrailingText: data.metaTrailingText,
    );
  }
}

class _GalleryCardData {
  const _GalleryCardData({
    required this.height,
    required this.imageAssets,
    this.startImageIndex = 0,
    this.imageHeightFactor = 0.62,
    this.imageOverlayGradient,
    this.title,
    this.metaLeadingText,
    this.metaTrailingText,
  });

  final double height;
  final List<String> imageAssets;
  final int startImageIndex;
  final double imageHeightFactor;
  final Gradient? imageOverlayGradient;
  final String? title;
  final String? metaLeadingText;
  final String? metaTrailingText;
}
