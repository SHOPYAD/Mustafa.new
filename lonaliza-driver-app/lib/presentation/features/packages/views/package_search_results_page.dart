import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../widgets/package_tour_list_card.dart';

class PackageSearchResultsPage extends StatefulWidget {
  const PackageSearchResultsPage({super.key, this.query = 'Beijing'});
  final String query;

  @override
  State<PackageSearchResultsPage> createState() => _PackageSearchResultsPageState();
}

class _PackageSearchResultsPageState extends State<PackageSearchResultsPage> {
  late TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.query);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  static const _results = [
    _TourData(
      imagePath: 'assets/images/1.jpg',
      rating: '5',
      title: '5D4N·Beijing: The Palace Museum + Summer Palace + Grea...',
      reviewScore: '5.0/5',
      reviewCount: 1,
      bookedCount: 1,
      visitingDays: '3 days visiting Beijing',
      language: 'English | Tour guide included',
      transfer: 'Airport/station pick-up & drop-off incl...',
      departFrom: 'Depart from Beijing',
      freeCancellation: true,
      departureGuaranteed: true,
      price: r'$744',
    ),
    _TourData(
      imagePath: 'assets/images/2.jpg',
      rating: '3',
      title: '5D4N·China + Shanghai + Beijing',
      reviewScore: '5.0/5',
      reviewCount: 1,
      bookedCount: 5,
      visitingDays: '3 days visiting Beijing',
      language: 'English | Tour guide included',
      transfer: 'Airport/station pick-up & drop-off incl...',
      departFrom: 'Depart from Shanghai',
      departureGuaranteed: true,
      saleLabel: 'Limited-time sale',
      saleOff: r'$6 off >',
      price: r'$1,277',
    ),
    _TourData(
      imagePath: 'assets/images/3.jpg',
      rating: '4',
      title: '2D1N·Beijing + Temple of Heaven + Beijing Ancient Archi...',
      reviewScore: '5.0/5',
      reviewCount: 1,
      bookedCount: 3,
      visitingDays: '2 days visiting Beijing',
      language: 'English/Mandarin',
      transfer: 'Airport/station pick-up included',
      departFrom: 'Depart from Beijing',
      price: r'$246',
    ),
    _TourData(
      imagePath: 'assets/images/1.jpg',
      rating: '5',
      title: '5D4N·Beijing + Xi\'an Classic Heritage Tour',
      reviewScore: '4.8/5',
      reviewCount: 14,
      bookedCount: 32,
      visitingDays: '4 days visiting Beijing',
      language: 'English | Tour guide included',
      transfer: 'Airport/station pick-up & drop-off incl...',
      departFrom: 'Depart from Beijing',
      freeCancellation: true,
      price: r'$980',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF111827)),
          onPressed: () => context.pop(),
        ),
        titleSpacing: 0,
        title: Container(
          height: 40,
          decoration: BoxDecoration(
            color: const Color(0xFFF3F4F6),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              const SizedBox(width: 10),
              const Icon(Icons.search_rounded, size: 18, color: Color(0xFF9CA3AF)),
              const SizedBox(width: 6),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  style: const TextStyle(fontSize: 15, color: Color(0xFF111827)),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                icon: const Icon(Icons.cancel_rounded, size: 18, color: Color(0xFF9CA3AF)),
                onPressed: () => _searchController.clear(),
              ),
              const SizedBox(width: 4),
            ],
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.currency_exchange_rounded, size: 18, color: Color(0xFF374151)),
                Text('USD', style: TextStyle(fontSize: 9, color: Color(0xFF6B7280), fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xFFF3F4F6)),
        ),
      ),
      body: CustomScrollView(
        slivers: [
          // ── Filter chips
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(
                  children: const [
                    _FilterChip(label: 'Sort by'),
                    _FilterChip(label: 'Filter'),
                    _FilterChip(label: 'Duration/dates'),
                    _FilterChip(label: 'Budget'),
                    _FilterChip(label: 'Services'),
                  ],
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 8)),

          // ── Tour list
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final t = _results[index];
                return PackageTourListCard(
                  imagePath: t.imagePath,
                  imageLabel: 'Private Tours',
                  rating: t.rating,
                  title: t.title,
                  reviewScore: t.reviewScore,
                  reviewCount: t.reviewCount,
                  bookedCount: t.bookedCount,
                  visitingDays: t.visitingDays,
                  language: t.language,
                  transferIncluded: t.transfer,
                  departFrom: t.departFrom,
                  freeCancellation: t.freeCancellation,
                  departureGuaranteed: t.departureGuaranteed,
                  saleLabel: t.saleLabel,
                  saleOff: t.saleOff,
                  price: t.price,
                  onTap: () => context.push('/packages/details'),
                );
              },
              childCount: _results.length,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}

// ── Filter chip widget
class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFD1D5DB)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF374151), fontWeight: FontWeight.w500)),
          const SizedBox(width: 4),
          const Icon(Icons.arrow_drop_down_rounded, size: 16, color: Color(0xFF6B7280)),
        ],
      ),
    );
  }
}

// ── Simple data holder (no state management needed for static demo data)
class _TourData {
  const _TourData({
    required this.imagePath,
    required this.rating,
    required this.title,
    this.reviewScore,
    this.reviewCount,
    this.bookedCount,
    this.visitingDays,
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
  final String? visitingDays;
  final String language;
  final String transfer;
  final String departFrom;
  final bool freeCancellation;
  final bool departureGuaranteed;
  final String? saleLabel;
  final String? saleOff;
  final String price;
}
