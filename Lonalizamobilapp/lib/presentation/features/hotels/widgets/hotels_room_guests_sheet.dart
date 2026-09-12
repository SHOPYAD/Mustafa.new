import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/hotels_booking_draft_notifier.dart';

class HotelsRoomGuestsSheet extends ConsumerStatefulWidget {
  const HotelsRoomGuestsSheet({super.key});

  @override
  ConsumerState<HotelsRoomGuestsSheet> createState() =>
      _HotelsRoomGuestsSheetState();
}

class _HotelsRoomGuestsSheetState extends ConsumerState<HotelsRoomGuestsSheet> {
  static const _maxRooms = 9;
  static const _maxAdults = 30;
  static const _maxChildren = 10;

  late int _rooms;
  late int _adults;
  late int _children;
  var _seededFromDraft = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_seededFromDraft) return;
    _seededFromDraft = true;
    final d = ref.read(hotelsBookingDraftProvider);
    _rooms = d.roomCount;
    _adults = d.adultCount;
    _children = d.childCount;
  }

  void _commitAndClose() {
    ref.read(hotelsBookingDraftProvider.notifier).applyRoomsAndGuests(
          roomCount: _rooms,
          adultCount: _adults,
          childCount: _children,
        );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _GuestsSheetHeader(
              onClose: () => Navigator.of(context).pop(),
            ),
            const Divider(height: 1),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 8),
                  _CounterRow(
                    label: 'Rooms',
                    value: _rooms,
                    onDecrement: _rooms > 1
                        ? () => setState(() => _rooms--)
                        : null,
                    onIncrement: _rooms < _maxRooms
                        ? () => setState(() => _rooms++)
                        : null,
                  ),
                  _CounterRow(
                    label: 'Adults',
                    value: _adults,
                    onDecrement: _adults > 1
                        ? () => setState(() => _adults--)
                        : null,
                    onIncrement: _adults < _maxAdults
                        ? () => setState(() => _adults++)
                        : null,
                  ),
                  _CounterRow(
                    label: 'Children',
                    value: _children,
                    onDecrement: _children > 0
                        ? () => setState(() => _children--)
                        : null,
                    onIncrement: _children < _maxChildren
                        ? () => setState(() => _children++)
                        : null,
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      '· Please confirm the number of children and their ages.\n'
                      '  This will help us find the room types and discounts best\n'
                      '  suited to your needs.\n'
                      '· If there are more guests, consider adding more rooms',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: const Color(0xFF6B7280),
                        height: 1.5,
                      ),
                    ),
                  ),
                  const Spacer(),
                  _DoneButtonBar(onDone: _commitAndClose),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GuestsSheetHeader extends StatelessWidget {
  const _GuestsSheetHeader({required this.onClose});

  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 10, 16, 10),
      child: Row(
        children: [
          IconButton(
            onPressed: onClose,
            icon: const Icon(Icons.arrow_back_rounded),
          ),
          const SizedBox(width: 8),
          Text(
            'Rooms and Guests',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontSize: 18,
              color: const Color(0xFF111827),
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _CounterRow extends StatelessWidget {
  const _CounterRow({
    required this.label,
    required this.value,
    required this.onDecrement,
    required this.onIncrement,
  });

  final String label;
  final int value;
  final VoidCallback? onDecrement;
  final VoidCallback? onIncrement;

  @override
  Widget build(BuildContext context) {
    final valueStyle = Theme.of(context).textTheme.titleMedium?.copyWith(
      color: const Color(0xFF111827),
      fontWeight: FontWeight.w700,
    );

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontSize: 16,
                    color: const Color(0xFF374151),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              _CounterButton(
                icon: Icons.remove_rounded,
                enabled: onDecrement != null,
                onTap: onDecrement,
              ),
              const SizedBox(width: 14),
              Text('$value', style: valueStyle),
              const SizedBox(width: 14),
              _CounterButton(
                icon: Icons.add_rounded,
                enabled: onIncrement != null,
                onTap: onIncrement,
              ),
            ],
          ),
        ),
        Divider(height: 1, color: Colors.grey.shade200),
      ],
    );
  }
}

class _CounterButton extends StatelessWidget {
  const _CounterButton({
    required this.icon,
    required this.enabled,
    this.onTap,
  });

  final IconData icon;
  final bool enabled;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final backgroundColor = enabled
        ? const Color(0xFF7C3AED)
        : const Color(0xFFF3F4F6);
    final iconColor = enabled ? Colors.white : const Color(0xFFC5CAD3);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          color: backgroundColor,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
    );
  }
}

class _DoneButtonBar extends StatelessWidget {
  const _DoneButtonBar({required this.onDone});

  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: FilledButton(
        onPressed: onDone,
        style: FilledButton.styleFrom(
          backgroundColor: const Color(0xFF7C3AED),
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(54),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: const Text(
          'Done',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
