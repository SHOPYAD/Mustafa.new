import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../domain/entities/hotels/hotels_booking_draft.dart';
import '../../../../domain/entities/place_search_hit.dart';
import '../../../feedback_messages.dart';
import '../../../providers/router_providers.dart';
import '../providers/hotels_booking_draft_notifier.dart';
import 'hotels_date_picker_sheet.dart';
import '../../../widgets/place_search_sheet.dart';
import 'hotels_filters_sheet.dart';
import 'hotels_room_guests_sheet.dart';

Future<T?> _openHotelsSheet<T>(
  BuildContext context,
  String barrierLabel,
  Widget sheet,
) {
  return showGeneralDialog<T>(
    context: context,
    barrierLabel: barrierLabel,
    barrierDismissible: true,
    barrierColor: Colors.black.withValues(alpha: 0.22),
    transitionDuration: const Duration(milliseconds: 220),
    pageBuilder: (context, animation, secondaryAnimation) => sheet,
    transitionBuilder: (context, animation, secondaryAnimation, child) {
      final offsetAnimation = Tween<Offset>(
        begin: const Offset(0, 1),
        end: Offset.zero,
      ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic));
      return SlideTransition(
        position: offsetAnimation,
        child: FadeTransition(opacity: animation, child: child),
      );
    },
  );
}

class HotelsSearchCard extends ConsumerWidget {
  const HotelsSearchCard({super.key});

  static const _brandBlue = Color(0xFF2563EB);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(hotelsBookingDraftProvider);

    void openDestination() {
      _openHotelsSheet<PlaceSearchHit?>(
        context,
        'Destination search',
        const PlaceSearchSheet(),
      ).then((hit) {
        if (hit != null) {
          ref.read(hotelsBookingDraftProvider.notifier).setSelectedDestination(hit);
        }
      });
    }

    void openDates() {
      _openHotelsSheet<void>(
        context,
        'Date picker',
        const HotelsDatePickerSheet(),
      );
    }

    void openGuests() {
      _openHotelsSheet<void>(
        context,
        'Room and guests',
        const HotelsRoomGuestsSheet(),
      );
    }

    void openFilters() {
      _openHotelsSheet<void>(
        context,
        'Filters',
        const HotelsFiltersSheet(),
      );
    }

    void onSearch() {
      final d = ref.read(hotelsBookingDraftProvider);
      if (!d.canSubmitHotelsSearch) {
        final parts = <String>[];
        if (!d.hasSelectedDestination) {
          parts.add(FeedbackMessages.hotelsMissingDestination);
        }
        if (!d.hasCompleteDateSelection) {
          parts.add(FeedbackMessages.hotelsMissingDates);
        }
        if (!d.hasValidGuestCounts) {
          parts.add(FeedbackMessages.hotelsInvalidGuestCounts);
        }
        FeedbackMessages.showSnackBar(
          context,
          FeedbackMessages.fillMissingFields(parts),
        );
        return;
      }
      ref.read(navigationRepositoryProvider).goHotelsSearch();
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _HotelsDestinationField(
              selected: draft.selectedDestination,
              onTap: openDestination,
              onClear: () => ref
                  .read(hotelsBookingDraftProvider.notifier)
                  .setSelectedDestination(null),
            ),
            SizedBox(height: 10),
            _HotelsDateCard(draft: draft, onTap: openDates),
            SizedBox(height: 10),
            _HotelsGuestsRow(draft: draft, onTap: openGuests),
            SizedBox(height: 10),
            _HotelsFiltersRow(
              onFiltersTap: openFilters,
            ),
            SizedBox(height: 12),
            _HotelsSearchButton(onTap: onSearch),
          ],
        ),
      ),
    );
  }
}

class _HotelsDestinationField extends StatelessWidget {
  const _HotelsDestinationField({
    this.selected,
    required this.onTap,
    required this.onClear,
  });

  final PlaceSearchHit? selected;
  final VoidCallback onTap;
  final VoidCallback onClear;

  static String _primaryLine(PlaceSearchHit hit) {
    return hit.name.isNotEmpty ? hit.name : hit.displayName;
  }

  /// Second line: [location] when distinct, else tail of [displayName] after first comma.
  static String? _subtitleLine(PlaceSearchHit hit) {
    final primary = _primaryLine(hit);
    final loc = hit.location.trim();
    if (loc.isNotEmpty && loc.toLowerCase() != primary.toLowerCase()) {
      return loc;
    }
    final parts = hit.displayName
        .split(',')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();
    if (parts.length >= 2) {
      final tail = parts.sublist(1).join(', ');
      if (tail.isNotEmpty && tail.toLowerCase() != primary.toLowerCase()) {
        return tail;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final hit = selected;
    final hasSelection = hit != null;
    final subtitle = hasSelection ? _subtitleLine(hit) : null;

    return Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.fromLTRB(10, 6, 4, 6),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFD7E6FF)),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            IconButton(
              onPressed: onTap,
              visualDensity: VisualDensity.compact,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
              icon: Icon(Icons.search_rounded, color: Colors.grey.shade600),
            ),
            Expanded(
              child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(10),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 2),
                  child: !hasSelection
                      ? Text(
                          'Enter a destination or property',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                color: const Color(0xFF6B7280),
                                fontWeight: FontWeight.w600,
                              ),
                        )
                      : Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(
                                text: _primaryLine(hit),
                                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                      color: const Color(0xFF111827),
                                      fontWeight: FontWeight.w700,
                                    ),
                              ),
                              if (subtitle != null)
                                TextSpan(
                                  text: '  $subtitle',
                                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                        color: const Color(0xFF9CA3AF),
                                        fontWeight: FontWeight.w500,
                                      ),
                                ),
                            ],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                ),
              ),
            ),
            if (hasSelection)
              IconButton(
                onPressed: onClear,
                tooltip: 'Clear',
                visualDensity: VisualDensity.compact,
                style: IconButton.styleFrom(
                  foregroundColor: const Color(0xFF9CA3AF),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                icon: const Icon(Icons.close_rounded, size: 22),
              ),
          ],
        ),
      ),
    );
  }
}

String _hotelsDateRangeLabel(BuildContext context, HotelsBookingDraft d) {
  final ci = d.checkIn;
  final co = d.checkOut;
  if (ci == null || co == null) {
    return 'Select dates';
  }
  final loc = Localizations.localeOf(context).toString();
  final fmt = DateFormat('EEE, MMM d', loc);
  // [co] is departure day (exclusive of last night), e.g. Tue 26 – Fri 29.
  return '${fmt.format(ci)} – ${fmt.format(co)}';
}

int _hotelsNightsCount(HotelsBookingDraft d) {
  final ci = d.checkIn;
  final co = d.checkOut;
  if (ci == null || co == null) return 1;
  final n = co.difference(ci).inDays;
  return n < 1 ? 1 : n;
}

String? _hotelsFlexSubtitle(HotelsDateFlexOption o) {
  return switch (o) {
    HotelsDateFlexOption.exactDates => null,
    HotelsDateFlexOption.plusMinusOneDay => '±1 day',
    HotelsDateFlexOption.plusMinusTwoDays => '±2 days',
    HotelsDateFlexOption.plusMinusThreeDays => '±3 days',
    HotelsDateFlexOption.plusMinusSevenDays => '±7 days',
  };
}

class _HotelsDateCard extends StatelessWidget {
  const _HotelsDateCard({required this.draft, required this.onTap});

  final HotelsBookingDraft draft;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    const purple = Color(0xFF6D5EF5);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final useFlex = draft.useFlexibleDateDisplay;
    final hasCalendar = draft.checkIn != null && draft.checkOut != null;
    final nights = useFlex
        ? draft.flexibleStayNights.clamp(1, 7)
        : _hotelsNightsCount(draft);
    final showNights = useFlex || hasCalendar;
    final secondaryLine = useFlex
        ? draft.flexibleDateSearchSubtitle
        : (hasCalendar ? _hotelsFlexSubtitle(draft.dateFlexibility) : null);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFE5E7EB)),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_outlined, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    useFlex
                        ? draft.flexibleDateSearchTitle(
                            Localizations.localeOf(context).toString(),
                            today,
                          )
                        : _hotelsDateRangeLabel(context, draft),
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1F2937),
                        ),
                  ),
                  if (secondaryLine != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      secondaryLine,
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: const Color(0xFF6D7AB0),
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ],
                ],
              ),
            ),
            const Icon(Icons.nights_stay_outlined, size: 18, color: purple),
            const SizedBox(width: 4),
            Text(
              showNights
                  ? '$nights ${nights == 1 ? 'night' : 'nights'}'
                  : '—',
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: purple,
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HotelsGuestsRow extends StatelessWidget {
  const _HotelsGuestsRow({required this.draft, required this.onTap});

  final HotelsBookingDraft draft;
  final VoidCallback onTap;

  static String _roomLabel(int n) => n == 1 ? '1 room' : '$n rooms';

  static String _adultLabel(int n) => n == 1 ? '1 adult' : '$n adults';

  static String _childLabel(int n) {
    if (n == 0) return '0 children';
    if (n == 1) return '1 child';
    return '$n children';
  }

  @override
  Widget build(BuildContext context) {
    final itemStyle = Theme.of(context).textTheme.titleSmall?.copyWith(
      fontWeight: FontWeight.w700,
      color: const Color(0xFF1F2937),
    );

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFE5E7EB)),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            const Icon(Icons.person_outline_rounded, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                '${_roomLabel(draft.roomCount)}  '
                '${_adultLabel(draft.adultCount)}  '
                '${_childLabel(draft.childCount)}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: itemStyle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HotelsFiltersRow extends ConsumerStatefulWidget {
  const _HotelsFiltersRow({required this.onFiltersTap});

  final VoidCallback onFiltersTap;

  @override
  ConsumerState<_HotelsFiltersRow> createState() => _HotelsFiltersRowState();
}

class _HotelsFiltersRowState extends ConsumerState<_HotelsFiltersRow> {
  /// Quick chips shown before "Show more" when collapsed.
  static const int _maxCollapsedQuick = 3;

  bool _showAllQuick = false;

  @override
  Widget build(BuildContext context) {
    final draft = ref.watch(hotelsBookingDraftProvider);
    final notifier = ref.read(hotelsBookingDraftProvider.notifier);
    final quick = draft.searchFilters.activeQuickFilterChips;

    final needsToggle = quick.length > _maxCollapsedQuick;
    final expanded = !needsToggle || _showAllQuick;
    final visibleQuick =
        expanded ? quick : quick.take(_maxCollapsedQuick).toList(growable: false);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _FilterChip(
            label: 'Filters',
            icon: Icons.tune_rounded,
            onTap: widget.onFiltersTap,
          ),
          const SizedBox(width: 8),
          for (final chip in visibleQuick) ...[
            _FilterChip(
              label: chip.label,
              onTap: () => notifier.toggleQuickFilterChip(chip.id),
            ),
            const SizedBox(width: 8),
          ],
          if (needsToggle)
            _FilterChip(
              label: expanded ? 'Show less' : 'Show more',
              onTap: () => setState(() => _showAllQuick = !expanded),
            ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    this.icon,
    this.onTap,
  });

  final String label;
  final IconData? icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 16, color: const Color(0xFF4B5563)),
              const SizedBox(width: 6),
            ],
            Text(
              label,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: const Color(0xFF374151),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HotelsSearchButton extends StatelessWidget {
  const _HotelsSearchButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: onTap,
      style: FilledButton.styleFrom(
        backgroundColor: HotelsSearchCard._brandBlue,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(46),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: const Text(
        'Search',
        style: TextStyle(fontWeight: FontWeight.w700),
      ),
    );
  }
}
