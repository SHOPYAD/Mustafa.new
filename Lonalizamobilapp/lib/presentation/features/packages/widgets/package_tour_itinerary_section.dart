import 'package:flutter/material.dart';

class PackageTourItinerarySection extends StatelessWidget {
  const PackageTourItinerarySection({super.key, required this.days});
  final List<_DayEntry> days;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Text(
            '8-day itinerary',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
          ),
        ),
        ...days.map((d) => _DayRow(day: d)),
      ],
    );
  }

  static List<_DayEntry> get sampleDays => const [
        _DayEntry(day: 'Day 1', description: 'Airport/Train station pick-up (a dedicated driver holds up a sign & without a tour guide) - Check-in at the hotel'),
        _DayEntry(day: 'Day 2', description: "Discover Beijing's Cultural Heart : Tiananmen Square - The Palace Museum - Shichahai Scenic Area"),
        _DayEntry(day: 'Day 3', description: "Beijing Cultural Highlights: Temple of Heaven - Mutianyu great wall (Not including round-trip cable car)"),
        _DayEntry(day: 'Day 4', description: "Summer Palace - Transfer to Xi'an by high-speed train - Hotel drop-off  (Driver station pick-up does not include tour guide)"),
        _DayEntry(day: 'Day 5', description: "Emperor Qinshihuang's Mausoleum Site Museum - Xi'an City Wall"),
        _DayEntry(day: 'Day 6', description: "Big Wild Goose Pagoda - The Hanyangling Museum - Transfer to Shanghai by High-Speed Trian - Hotel drop-off  (Driver station pick-up does not include tour guide)"),
        _DayEntry(day: 'Day 7', description: "Yu Garden - City God Temple - Nanjing Road- The Bund"),
        _DayEntry(day: 'Day 8', description: "Check-out - Airport/Train station drop-off service (no tour guide accompanying)"),
      ];
}

class _DayEntry {
  const _DayEntry({required this.day, required this.description});
  final String day;
  final String description;
}

class _DayRow extends StatelessWidget {
  const _DayRow({required this.day});
  final _DayEntry day;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
        InkWell(
          onTap: () {},
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 44,
                  child: Text(
                    day.day,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF111827)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    day.description,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.5),
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF9CA3AF)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
