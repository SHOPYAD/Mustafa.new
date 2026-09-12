import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../providers/hotels_booking_draft_notifier.dart';

class HotelsSearchAppBar extends ConsumerWidget {
  const HotelsSearchAppBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(hotelsBookingDraftProvider);
    final dest = draft.selectedDestination;
    final destination = dest == null
        ? 'اختر وجهة'
        : (dest.name.isNotEmpty ? dest.name : dest.displayName);
    final fmt = DateFormat('d MMM');
    final inLabel = draft.checkIn != null ? fmt.format(draft.checkIn!) : '—';
    final outLabel = draft.checkOut != null ? fmt.format(draft.checkOut!) : '—';

    return Container(
      padding: const EdgeInsets.fromLTRB(8, 10, 12, 12),
      decoration: const BoxDecoration(color: Color(0xFF2E1065)),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            IconButton(
              onPressed: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/hotels');
                }
              },
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            ),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          inLabel,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: const Color(0xFF6B7280),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          outLabel,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: const Color(0xFF111827),
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                    const Icon(Icons.arrow_drop_down_rounded, color: Color(0xFF6B7280)),
                    const SizedBox(width: 6),
                    Container(width: 1, height: 24, color: const Color(0xFFE5E7EB)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        destination,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: const Color(0xFF111827),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
