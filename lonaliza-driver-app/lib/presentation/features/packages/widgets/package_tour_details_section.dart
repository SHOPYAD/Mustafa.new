import 'package:flutter/material.dart';

/// "Details" rich text section with featured banner + Show more toggle
class PackageTourDetailsSection extends StatefulWidget {
  const PackageTourDetailsSection({super.key});

  @override
  State<PackageTourDetailsSection> createState() => _PackageTourDetailsSectionState();
}

class _PackageTourDetailsSectionState extends State<PackageTourDetailsSection> {
  bool _showMore = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
          const SizedBox(height: 20),
          const Text(
            'Details',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
          ),
          const SizedBox(height: 10),

          // Intro text
          const Text(
            '8 days and 7 nights. Three iconic cities. One unforgettable journey.',
            style: TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.6),
          ),
          const SizedBox(height: 10),

          // Rich body text
          RichText(
            text: const TextSpan(
              style: TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.6),
              children: [
                TextSpan(text: 'Walk the '),
                TextSpan(text: 'Great Wall', style: TextStyle(fontWeight: FontWeight.w700)),
                TextSpan(text: ' and explore '),
                TextSpan(text: "Beijing's Forbidden City.", style: TextStyle(fontWeight: FontWeight.w700)),
                TextSpan(text: ' Marvel at '),
                TextSpan(text: "Xi'an's Terracotta Warriors.", style: TextStyle(fontWeight: FontWeight.w700)),
                TextSpan(text: ' Experience '),
                TextSpan(text: "Shanghai's futuristic skyline.", style: TextStyle(fontWeight: FontWeight.w700)),
                TextSpan(text: ' With your '),
                TextSpan(text: 'personal guide and driver', style: TextStyle(fontWeight: FontWeight.w700)),
                TextSpan(text: ', enjoy seamless travel and local insights. A perfect introduction to China\'s history and modern energy.'),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Featured banner
          Container(
            height: 90,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: const Color(0xFF1D4ED8),
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset('assets/images/2.jpg', fit: BoxFit.cover, opacity: const AlwaysStoppedAnimation(0.5)),
                const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Trip.com', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                      SizedBox(height: 2),
                      Text('High-Speed Train Tour of China', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Show more toggle
          if (!_showMore)
            GestureDetector(
              onTap: () => setState(() => _showMore = true),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE5E7EB)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Show more', style: TextStyle(fontSize: 13, color: Color(0xFF374151), fontWeight: FontWeight.w600)),
                    SizedBox(width: 4),
                    Icon(Icons.keyboard_arrow_down_rounded, size: 18, color: Color(0xFF374151)),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
