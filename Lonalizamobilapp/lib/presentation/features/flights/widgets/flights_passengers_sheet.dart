import 'package:flutter/material.dart';
import 'package:liotrip/core/extensions/context_l10n.dart';

class FlightsPassengersResult {
  const FlightsPassengersResult({
    required this.adults,
    required this.children,
    required this.infantsOnLap,
  });

  final int adults;
  final int children;
  final int infantsOnLap;
}

Future<FlightsPassengersResult?> showFlightsPassengersSheet(
  BuildContext context, {
  required FlightsPassengersResult initialValue,
}) {
  return showModalBottomSheet<FlightsPassengersResult>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return FractionallySizedBox(
        heightFactor: 0.62,
        child: FlightsPassengersSheet(initialValue: initialValue),
      );
    },
  );
}

class FlightsPassengersSheet extends StatefulWidget {
  const FlightsPassengersSheet({
    super.key,
    required this.initialValue,
  });

  final FlightsPassengersResult initialValue;

  @override
  State<FlightsPassengersSheet> createState() => _FlightsPassengersSheetState();
}

class _FlightsPassengersSheetState extends State<FlightsPassengersSheet> {
  late int _adults;
  late int _children;
  late int _infantsOnLap;

  @override
  void initState() {
    super.initState();
    _adults = widget.initialValue.adults;
    _children = widget.initialValue.children;
    _infantsOnLap = widget.initialValue.infantsOnLap;
  }

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                  Expanded(
                    child: Text(
                      context.l10n.passengersTitle,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: const Color(0xFF111827),
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE5E7EB)),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    _PassengerCounterTile(
                      title: context.l10n.adults,
                      subtitle: context.l10n.adultsSub,
                      count: _adults,
                      onDecrement:
                          _adults > 1 ? () => setState(() => _adults -= 1) : null,
                      onIncrement: () => setState(() => _adults += 1),
                    ),
                    _PassengerCounterTile(
                      title: context.l10n.children,
                      subtitle: context.l10n.childrenSub,
                      count: _children,
                      onDecrement: _children > 0
                          ? () => setState(() => _children -= 1)
                          : null,
                      onIncrement: () => setState(() => _children += 1),
                    ),
                    _PassengerCounterTile(
                      title: context.l10n.infants,
                      subtitle: context.l10n.infantsSub,
                      count: _infantsOnLap,
                      onDecrement: _infantsOnLap > 0
                          ? () => setState(() => _infantsOnLap -= 1)
                          : null,
                      onIncrement: _infantsOnLap < _adults
                          ? () => setState(() => _infantsOnLap += 1)
                          : null,
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF2F7FF),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: Text.rich(
                                TextSpan(
                                  children: [
                                    TextSpan(
                                      text:
                                          '${context.l10n.passengersNotice}\n',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                            color: const Color(0xFF4B5563),
                                            height: 1.2,
                                          ),
                                    ),
                                    TextSpan(
                                      text:
                                          context.l10n.bookingInstructions,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                            color: const Color(0xFF3157C8),
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(
                              Icons.family_restroom_rounded,
                              color: Color(0xFF7C83FF),
                              size: 34,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
              child: FilledButton(
                onPressed: () {
                  Navigator.of(context).pop(
                    FlightsPassengersResult(
                      adults: _adults,
                      children: _children,
                      infantsOnLap: _infantsOnLap,
                    ),
                  );
                },
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF7C3AED),
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(52),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  context.l10n.confirm,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PassengerCounterTile extends StatelessWidget {
  const _PassengerCounterTile({
    required this.title,
    required this.subtitle,
    required this.count,
    this.onDecrement,
    this.onIncrement,
  });

  final String title;
  final String subtitle;
  final int count;
  final VoidCallback? onDecrement;
  final VoidCallback? onIncrement;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: const Color(0xFF111827),
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 13,
                        color: const Color(0xFF6B7280),
                        fontWeight: FontWeight.w400,
                      ),
                ),
              ],
            ),
          ),
          _CounterButton(
            icon: Icons.remove_rounded,
            enabled: onDecrement != null,
            onTap: onDecrement,
          ),
          const SizedBox(width: 16),
          Text(
            '$count',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: const Color(0xFF111827),
                  fontWeight: FontWeight.w500,
                ),
          ),
          const SizedBox(width: 16),
          _CounterButton(
            icon: Icons.add_rounded,
            enabled: onIncrement != null,
            onTap: onIncrement,
            filled: true,
          ),
        ],
      ),
    );
  }
}

class _CounterButton extends StatelessWidget {
  const _CounterButton({
    required this.icon,
    required this.enabled,
    this.onTap,
    this.filled = false,
  });

  final IconData icon;
  final bool enabled;
  final VoidCallback? onTap;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final backgroundColor = filled
        ? const Color(0xFF7C3AED)
        : enabled
            ? Colors.white
            : const Color(0xFFF3F4F6);
    final borderColor = filled
        ? const Color(0xFF7C3AED)
        : const Color(0xFFD1D5DB);
    final iconColor = filled
        ? Colors.white
        : enabled
            ? const Color(0xFF9CA3AF)
            : const Color(0xFFD1D5DB);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        width: 24,
        height: 24,
        decoration: BoxDecoration(
          color: backgroundColor,
          shape: BoxShape.circle,
          border: Border.all(color: borderColor),
        ),
        child: Icon(icon, size: 16, color: iconColor),
      ),
    );
  }
}
