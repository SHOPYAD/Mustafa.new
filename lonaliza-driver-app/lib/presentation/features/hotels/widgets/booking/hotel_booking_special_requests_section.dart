import 'package:flutter/material.dart';

class HotelBookingSpecialRequestsSection extends StatefulWidget {
  const HotelBookingSpecialRequestsSection({super.key});

  @override
  State<HotelBookingSpecialRequestsSection> createState() =>
      _HotelBookingSpecialRequestsSectionState();
}

class _HotelBookingSpecialRequestsSectionState
    extends State<HotelBookingSpecialRequestsSection> {
  String? _elevatorChoice;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Special Requests (Optional)',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
                color: const Color(0xFF111827),
              ),
        ),
        const SizedBox(height: 6),
        Text(
          'The property will do its best, but cannot guarantee to fulfill all requests.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: const Color(0xFF6B7280),
                height: 1.35,
              ),
        ),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.elevator_outlined, size: 20, color: Colors.grey.shade800),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Elevator proximity',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF111827),
                        ),
                  ),
                  const SizedBox(height: 8),
                  _ElevatorOptionRow(
                    label: 'Away from elevator',
                    selected: _elevatorChoice == 'away',
                    onTap: () => setState(() => _elevatorChoice = 'away'),
                  ),
                  _ElevatorOptionRow(
                    label: 'Near elevator',
                    selected: _elevatorChoice == 'near',
                    onTap: () => setState(() => _elevatorChoice = 'near'),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(Icons.grid_view_outlined, size: 20, color: Colors.grey.shade800),
          title: Text(
            'Other requests',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          trailing: Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey.shade600),
          onTap: () {},
        ),
      ],
    );
  }
}

class _ElevatorOptionRow extends StatelessWidget {
  const _ElevatorOptionRow({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off_outlined,
              size: 22,
              color: selected ? const Color(0xFF2563EB) : const Color(0xFF6B7280),
            ),
            const SizedBox(width: 10),
            Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
