import 'package:flutter/material.dart';

class PackageSearchSection extends StatelessWidget {
  const PackageSearchSection({super.key, required this.tabIndex});

  final int tabIndex;

  static const _privateCities  = ['Beijing', 'Shanghai', 'Chengdu', 'Japan', 'Zhangjiajie'];
  static const _groupCities    = ['Paris', 'Rome', 'Tokyo', 'Maldives', 'Istanbul'];

  @override
  Widget build(BuildContext context) {
    final cities = tabIndex == 0 ? _privateCities : _groupCities;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search field
          Container(
            height: 46,
            decoration: BoxDecoration(
              color: const Color(0xFFF9FAFB),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Row(
              children: [
                const SizedBox(width: 12),
                const Icon(Icons.search_rounded, color: Color(0xFF9CA3AF), size: 20),
                const SizedBox(width: 8),
                Text(
                  cities.first,
                  style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 15),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // City chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: cities.map((city) {
                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFD1D5DB)),
                  ),
                  child: Text(
                    city,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF374151), fontWeight: FontWeight.w500),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          // Flexible dates toggle
          Row(
            children: [
              const Icon(Icons.calendar_month_outlined, size: 18, color: Color(0xFF374151)),
              const SizedBox(width: 6),
              const Text(
                'Flexible dates',
                style: TextStyle(fontSize: 14, color: Color(0xFF374151), fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
