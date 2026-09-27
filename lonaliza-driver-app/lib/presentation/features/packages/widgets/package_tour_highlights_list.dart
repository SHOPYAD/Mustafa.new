import 'package:flutter/material.dart';

/// "Highlights" section with thumbs-up icons and Show Less / Show More toggle
class PackageTourHighlightsList extends StatefulWidget {
  const PackageTourHighlightsList({super.key, required this.highlights});
  final List<String> highlights;

  @override
  State<PackageTourHighlightsList> createState() => _PackageTourHighlightsListState();
}

class _PackageTourHighlightsListState extends State<PackageTourHighlightsList> {
  bool _expanded = true;

  @override
  Widget build(BuildContext context) {
    final shown = _expanded ? widget.highlights : widget.highlights.take(2).toList();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Highlights',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
          ),
          const SizedBox(height: 14),

          ...shown.map((h) => _HighlightItem(text: h)),

          const SizedBox(height: 8),
          // Show less / Show more toggle
          GestureDetector(
            onTap: () => setState(() => _expanded = !_expanded),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  _expanded ? 'Show Less' : 'Show More',
                  style: const TextStyle(fontSize: 13, color: Color(0xFF374151), fontWeight: FontWeight.w600),
                ),
                const SizedBox(width: 4),
                Icon(
                  _expanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                  size: 18,
                  color: const Color(0xFF374151),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _HighlightItem extends StatelessWidget {
  const _HighlightItem({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.thumb_up_alt_outlined, size: 18, color: Color(0xFF374151)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.5)),
          ),
        ],
      ),
    );
  }
}
