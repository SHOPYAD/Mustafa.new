import 'package:flutter/material.dart';

/// Traveler info section: required count, list of travelers, and Add button
class PackageBookingTravelerInfo extends StatefulWidget {
  const PackageBookingTravelerInfo({super.key, required this.requiredCount});
  final int requiredCount;

  @override
  State<PackageBookingTravelerInfo> createState() => _PackageBookingTravelerInfoState();
}

class _PackageBookingTravelerInfoState extends State<PackageBookingTravelerInfo> {
  // Each traveler: name, selected (checkbox)
  final _travelers = <_Traveler>[
    _Traveler(name: 'KEMOUKH AHMED', selected: false),
  ];

  @override
  Widget build(BuildContext context) {
    final selectedCount = _travelers.where((t) => t.selected).length;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Section title
          const Text('Traveler info',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
          const SizedBox(height: 10),

          // ── Subtitle
          Text(
            'You must select ${widget.requiredCount} travelers ($selectedCount/${widget.requiredCount})',
            style: const TextStyle(fontSize: 13, color: Color(0xFF374151)),
          ),
          const SizedBox(height: 4),
          const Text('Information must match the ID used for travel',
              style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
          const SizedBox(height: 4),

          // Booking restrictions link
          GestureDetector(
            onTap: () {},
            child: const Row(
              children: [
                SizedBox(width: 2),
                Text('| ', style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
                Text('Booking restrictions  ›',
                    style: TextStyle(fontSize: 12, color: Color(0xFF2563EB), fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // ── Traveler rows
          ..._travelers.asMap().entries.map((e) {
            final i = e.key;
            final t = e.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  // Checkbox
                  GestureDetector(
                    onTap: () => setState(() => _travelers[i] = t.copyWith(selected: !t.selected)),
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: t.selected ? const Color(0xFF2563EB) : const Color(0xFF9CA3AF),
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(4),
                        color: t.selected ? const Color(0xFF2563EB) : Colors.white,
                      ),
                      child: t.selected
                          ? const Icon(Icons.check_rounded, size: 13, color: Colors.white)
                          : null,
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Name
                  Expanded(
                    child: Text(t.name,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                  ),

                  // Edit icon
                  GestureDetector(
                    onTap: () {},
                    child: const Icon(Icons.edit_outlined, size: 18, color: Color(0xFF2563EB)),
                  ),
                ],
              ),
            );
          }),

          const SizedBox(height: 4),

          // ── Add traveler button
          GestureDetector(
            onTap: () {
              setState(() {
                _travelers.add(_Traveler(name: 'New Traveler', selected: false));
              });
            },
            child: Container(
              width: double.infinity,
              height: 44,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFD1D5DB)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_circle_outline_rounded, size: 16, color: Color(0xFF2563EB)),
                  SizedBox(width: 6),
                  Text('Add', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF2563EB))),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Traveler {
  const _Traveler({required this.name, required this.selected});
  final String name;
  final bool selected;
  _Traveler copyWith({String? name, bool? selected}) =>
      _Traveler(name: name ?? this.name, selected: selected ?? this.selected);
}
