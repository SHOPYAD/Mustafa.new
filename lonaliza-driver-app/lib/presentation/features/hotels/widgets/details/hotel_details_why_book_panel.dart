import 'package:flutter/material.dart';

import '../hotels_why_book_section.dart';

/// Full-width grey strip for "Why book with Trip.com?" (reuses existing section).
class HotelDetailsWhyBookPanel extends StatelessWidget {
  const HotelDetailsWhyBookPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: const Color(0xFFF5F7FB),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
        child: const HotelsWhyBookSection(),
      ),
    );
  }
}
