import 'package:flutter/material.dart';

class MyTripsHeader extends StatelessWidget {
  const MyTripsHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top Row: Title + Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'My Trips',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF111827),
                      letterSpacing: -0.5,
                    ),
                  ),
                  Container(
                    width: 6,
                    height: 6,
                    margin: const EdgeInsets.only(left: 2, bottom: 6),
                    decoration: const BoxDecoration(
                      color: Color(0xFFFFC107),
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  _HeaderActionItem(icon: Icons.grid_view_rounded, label: 'Widget'),
                  const SizedBox(width: 16),
                  _HeaderActionItem(icon: Icons.calendar_today_outlined, label: 'Calendar'),
                ],
              )
            ],
          ),
          const SizedBox(height: 20),
          
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _FilterChip(icon: Icons.calendar_month_outlined, label: 'All Bookings', isSelected: true),
                const SizedBox(width: 8),
                _FilterChip(icon: Icons.route_outlined, label: 'My itineraries', isSelected: false),
                const SizedBox(width: 8),
                _FilterChip(icon: Icons.search_outlined, label: 'Find...', isSelected: false, hasDropdown: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HeaderActionItem extends StatelessWidget {
  const _HeaderActionItem({required this.icon, required this.label});
  
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 22, color: const Color(0xFF374151)),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF374151)),
        ),
      ],
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.icon,
    required this.label,
    required this.isSelected,
    this.hasDropdown = false,
  });

  final IconData icon;
  final String label;
  final bool isSelected;
  final bool hasDropdown;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFD1D5DB)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF374151)),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF1F2937)),
          ),
          if (hasDropdown) ...[
            const SizedBox(width: 4),
            const Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: Color(0xFF6B7280)),
          ]
        ],
      ),
    );
  }
}
