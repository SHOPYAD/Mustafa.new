import 'package:flutter/material.dart';

/// "What's included" section with adults/children toggle + expandable checklist
class PackageTourWhatsIncluded extends StatefulWidget {
  const PackageTourWhatsIncluded({super.key});

  @override
  State<PackageTourWhatsIncluded> createState() => _PackageTourWhatsIncludedState();
}

class _PackageTourWhatsIncludedState extends State<PackageTourWhatsIncluded> {
  int _passengerType = 0; // 0 = adults, 1 = children

  // All items expanded by default (matching original design)
  final _expanded = <int, bool>{0: true, 1: true, 2: true, 3: true, 4: true};

  static const _items = [
    _IncludedItem(
      title: 'Transportation',
      body: "Intermediate journey from Beijing to Xi'an train ticket; Xi'an to Shanghai  G-series High-speed Train  2nd class sleeper train ticket",
    ),
    _IncludedItem(
      title: 'Accommodation',
      body: 'Accommodation at your self-selected hotels. The number of guests allowed in your selected hotel room is based on your choice at the time of booking, in accordance with the room type and hotel policy.',
    ),
    _IncludedItem(
      title: 'Meals',
      body: 'For details on breakfast in self-selected hotels, please check the room type you have booked and the hotel\'s policy.\nIncluded for adults: 2 meals (breakfast*2)',
    ),
    _IncludedItem(
      title: 'Tour staff',
      body: 'English-speaking tour guide throughout the entire tour.',
    ),
    _IncludedItem(
      title: 'Tickets and activities',
      body: 'Admission ticket to the main entrance of the scenic spots as listed in the itinerary.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(height: 1, thickness: 8, color: Color(0xFFF3F4F6)),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "What's included",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Adults / Children toggle pill
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Container(
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                _TypeTab(label: 'adults', selected: _passengerType == 0, onTap: () => setState(() => _passengerType = 0)),
                _TypeTab(label: 'children', selected: _passengerType == 1, onTap: () => setState(() => _passengerType = 1)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Adults note
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'The following instructions only apply to adults (12 years or over).',
            style: TextStyle(fontSize: 12, color: Color(0xFF6B7280), height: 1.5),
          ),
        ),
        const SizedBox(height: 12),

        // Included items
        ..._items.asMap().entries.map((e) {
          final i = e.key;
          final item = e.value;
          final isOpen = _expanded[i] ?? false;
          return Column(
            children: [
              const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6), indent: 16, endIndent: 16),
              InkWell(
                onTap: () => setState(() => _expanded[i] = !isOpen),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.check_rounded, size: 18, color: Color(0xFF10B981)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              item.title,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF111827)),
                            ),
                          ),
                          Icon(
                            isOpen ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                            size: 20,
                            color: const Color(0xFF9CA3AF),
                          ),
                        ],
                      ),
                      if (isOpen) ...[
                        const SizedBox(height: 8),
                        Padding(
                          padding: const EdgeInsets.only(left: 28),
                          child: Text(
                            item.body,
                            style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280), height: 1.5),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
        const SizedBox(height: 24),
      ],
    );
  }
}

class _IncludedItem {
  const _IncludedItem({required this.title, required this.body});
  final String title;
  final String body;
}

class _TypeTab extends StatelessWidget {
  const _TypeTab({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            color: selected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(6),
            boxShadow: selected
                ? [BoxShadow(color: Colors.black.withOpacity(0.07), blurRadius: 6, offset: const Offset(0, 2))]
                : [],
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              color: selected ? const Color(0xFF111827) : const Color(0xFF9CA3AF),
            ),
          ),
        ),
      ),
    );
  }
}
