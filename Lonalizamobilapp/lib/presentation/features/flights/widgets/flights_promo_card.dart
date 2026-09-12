import 'package:flutter/material.dart';

class FlightsPromoCard extends StatelessWidget {
  const FlightsPromoCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF7EF), Color(0xFFFFE7CF)],
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF4D2B5)),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: const BoxDecoration(
                color: Color(0xFFFFF1DD),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.weekend_outlined,
                color: Color(0xFFD28B36),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Business class top picks',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: const Color(0xFF7C4A16),
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Discover luxury options for less',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: const Color(0xFF8B5E34),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            FilledButton(
              onPressed: () {},
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFFFD7B0),
                foregroundColor: const Color(0xFF8E4F12),
                elevation: 0,
                minimumSize: const Size(88, 38),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text(
                'Explore >',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
