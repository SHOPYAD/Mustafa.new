import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../domain/entities/hotels/hotels_booking_draft.dart';
import '../../../../domain/entities/hotels/hotels_flexible_month_grid.dart';
import '../providers/hotels_booking_draft_notifier.dart';

bool _daysSame(DateTime a, DateTime b) =>
    a.year == b.year && a.month == b.month && a.day == b.day;

DateTime _dayOnly(DateTime d) => DateTime(d.year, d.month, d.day);

/// Month grid with **range** highlight (check-in / between / check-out stay visible).
class _HotelsRangeMonthPicker extends StatelessWidget {
  const _HotelsRangeMonthPicker({
    required this.visibleMonth,
    required this.rangeStart,
    required this.rangeEnd,
    required this.firstDate,
    required this.lastDate,
    required this.onDayTap,
    required this.onPreviousMonth,
    required this.onNextMonth,
    required this.canGoPrevious,
    required this.canGoNext,
  });

  final DateTime visibleMonth;
  final DateTime? rangeStart;
  final DateTime? rangeEnd;
  final DateTime firstDate;
  final DateTime lastDate;
  final ValueChanged<DateTime> onDayTap;
  final VoidCallback onPreviousMonth;
  final VoidCallback onNextMonth;
  final bool canGoPrevious;
  final bool canGoNext;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final loc = MaterialLocalizations.of(context);
    final y = visibleMonth.year;
    final m = visibleMonth.month;
    final daysInMonth = DateUtils.getDaysInMonth(y, m);
    final leading = DateUtils.firstDayOffset(y, m, loc);
    final rowCount = ((leading + daysInMonth) / 7).ceil();

    final monthTitle = DateFormat.yMMMM(
      Localizations.localeOf(context).toString(),
    ).format(DateTime(y, m));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            IconButton(
              onPressed: canGoPrevious ? onPreviousMonth : null,
              icon: const Icon(Icons.chevron_left_rounded),
            ),
            Expanded(
              child: Text(
                monthTitle,
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF111827),
                ),
              ),
            ),
            IconButton(
              onPressed: canGoNext ? onNextMonth : null,
              icon: const Icon(Icons.chevron_right_rounded),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            for (var i = 0; i < 7; i++)
              Expanded(
                child: Center(
                  child: Text(
                    loc.narrowWeekdays[(i + loc.firstDayOfWeekIndex) % 7],
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: const Color(0xFF6B7280),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 6),
        for (var row = 0; row < rowCount; row++) ...[
          Row(
            children: [
              for (var col = 0; col < 7; col++)
                Expanded(
                  child: _RangeDayCell(
                    day: _cellDayForIndex(row, col, leading, daysInMonth, y, m),
                    rangeStart: rangeStart,
                    rangeEnd: rangeEnd,
                    firstDate: firstDate,
                    lastDate: lastDate,
                    onTap: onDayTap,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
        ],
      ],
    );
  }

  static DateTime? _cellDayForIndex(
    int row,
    int col,
    int leading,
    int daysInMonth,
    int y,
    int m,
  ) {
    final index = row * 7 + col;
    if (index < leading) return null;
    final dayNum = index - leading + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return DateTime(y, m, dayNum);
  }
}

class _RangeDayCell extends StatelessWidget {
  const _RangeDayCell({
    required this.day,
    required this.rangeStart,
    required this.rangeEnd,
    required this.firstDate,
    required this.lastDate,
    required this.onTap,
  });

  final DateTime? day;
  final DateTime? rangeStart;
  final DateTime? rangeEnd;
  final DateTime firstDate;
  final DateTime lastDate;
  final ValueChanged<DateTime> onTap;

  bool _selectable(DateTime d) {
    final x = _dayOnly(d);
    return !x.isBefore(_dayOnly(firstDate)) && !x.isAfter(_dayOnly(lastDate));
  }

  bool _inRange(DateTime d) {
    final rs = rangeStart;
    final re = rangeEnd;
    if (rs == null || re == null) return false;
    final x = _dayOnly(d);
    return !x.isBefore(_dayOnly(rs)) && !x.isAfter(_dayOnly(re));
  }

  @override
  Widget build(BuildContext context) {
    final d = day;
    if (d == null) {
      return const SizedBox(height: 40);
    }

    final theme = Theme.of(context);
    final label = '${d.day}';
    final on = _selectable(d);
    final rs =
        rangeStart != null && _daysSame(d, rangeStart!);
    final re = rangeEnd != null && _daysSame(d, rangeEnd!);
    final edge = rs || re;
    final mid = _inRange(d) && !edge;

    if (!on) {
      return SizedBox(
        height: 40,
        child: Center(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(color: const Color(0xFFC4C4C4)),
          ),
        ),
      );
    }

    if (edge) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => onTap(d),
          borderRadius: BorderRadius.circular(20),
          child: SizedBox(
            height: 40,
            child: Center(
              child: Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: const BoxDecoration(
                  color: Color(0xFF2563EB),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  label,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    if (mid) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => onTap(d),
          child: Container(
            height: 40,
            alignment: Alignment.center,
            decoration: const BoxDecoration(color: Color(0xFFE8F0FE)),
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF1E40AF),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      );
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onTap(d),
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          height: 40,
          child: Center(
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF374151),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class HotelsDatePickerSheet extends ConsumerStatefulWidget {
  const HotelsDatePickerSheet({super.key});

  @override
  ConsumerState<HotelsDatePickerSheet> createState() =>
      _HotelsDatePickerSheetState();
}

class _HotelsDatePickerSheetState extends ConsumerState<HotelsDatePickerSheet> {
  bool _isFlexible = false;
  DateTime? _calendarCheckIn;
  DateTime? _calendarCheckOut;
  late DateTime _visibleMonth;
  int _selectedNights = 2;
  /// `year*100+month` keys (see [HotelsFlexibleMonthGrid.ymKey]); at least one.
  final Set<int> _selectedFlexibleMonthYmKeys = {};
  bool _includeFriday = false;
  bool _includeSaturday = false;

  /// `0` = exact dates; `1`/`2`/`3`/`7` = ±N days window for search.
  int _selectedDateFlexDays = 0;

  @override
  void initState() {
    super.initState();
    final draft = ref.read(hotelsBookingDraftProvider);
    final today = _today();
    if (draft.checkIn != null) {
      var ci = _dayOnly(draft.checkIn!);
      if (ci.isBefore(today)) ci = today;
      _calendarCheckIn = ci;
    }
    if (draft.checkOut != null) {
      var co = _dayOnly(draft.checkOut!);
      if (_calendarCheckIn != null && !co.isAfter(_calendarCheckIn!)) {
        co = _calendarCheckIn!.add(const Duration(days: 1));
      }
      _calendarCheckOut = co;
    }
    _selectedDateFlexDays = draft.dateFlexibility.flexDays;
    _selectedNights = draft.flexibleStayNights.clamp(1, 7);
    _includeFriday = draft.includeFriday;
    _includeSaturday = draft.includeSaturday;
    _selectedFlexibleMonthYmKeys.clear();
    _selectedFlexibleMonthYmKeys.addAll(
      draft.resolvedFlexibleMonthYmKeys(today),
    );
    final anchor = _calendarCheckOut ?? _calendarCheckIn ?? today;
    _visibleMonth = DateTime(anchor.year, anchor.month);
    _visibleMonth = _clampVisibleMonth(_visibleMonth);
  }

  DateTime _today() {
    final n = DateTime.now();
    return DateTime(n.year, n.month, n.day);
  }

  DateTime _lastBookableMonthStart() {
    final t = _today();
    return DateTime(t.year + 2, 12, 1);
  }

  DateTime _clampVisibleMonth(DateTime m) {
    final low = DateTime(_today().year, _today().month);
    final high = _lastBookableMonthStart();
    final ms = DateTime(m.year, m.month);
    if (ms.isBefore(low)) return low;
    if (ms.isAfter(high)) return high;
    return ms;
  }

  bool _canGoPrevMonth() {
    final vm = DateTime(_visibleMonth.year, _visibleMonth.month);
    final low = DateTime(_today().year, _today().month);
    return vm.isAfter(low);
  }

  bool _canGoNextMonth() {
    final vm = DateTime(_visibleMonth.year, _visibleMonth.month);
    final high = _lastBookableMonthStart();
    return vm.isBefore(high);
  }

  void _shiftVisibleMonth(int delta) {
    setState(() {
      _visibleMonth = _clampVisibleMonth(
        DateTime(_visibleMonth.year, _visibleMonth.month + delta),
      );
    });
  }

  void _handleCalendarDay(DateTime raw) {
    final day = _dayOnly(raw);
    final today = _today();
    if (day.isBefore(today)) return;

    setState(() {
      final ci = _calendarCheckIn;
      if (ci == null || day.isBefore(ci)) {
        _calendarCheckIn = day;
        _calendarCheckOut = null;
        return;
      }
      if (_daysSame(day, ci)) {
        _calendarCheckIn = day;
        _calendarCheckOut = null;
        return;
      }
      _calendarCheckOut = day;
    });
  }

  void _toggleFlexibleMonth(int ymKey) {
    setState(() {
      if (_selectedFlexibleMonthYmKeys.contains(ymKey)) {
        if (_selectedFlexibleMonthYmKeys.length > 1) {
          _selectedFlexibleMonthYmKeys.remove(ymKey);
        }
      } else {
        _selectedFlexibleMonthYmKeys.add(ymKey);
      }
    });
  }

  String _flexibleConfirmHelper() {
    final locale = Localizations.localeOf(context).toString();
    final ref = _today();
    final gridKeys = HotelsFlexibleMonthGrid.ymKeys(ref);
    final sorted = _selectedFlexibleMonthYmKeys.toList()..sort();
    final sameYear =
        sorted.isNotEmpty && sorted.every((k) => k ~/ 100 == sorted.first ~/ 100);
    final fmt = DateFormat(sameYear ? 'MMM' : 'MMM yyyy', locale);
    if (gridKeys.isNotEmpty &&
        sorted.length == gridKeys.length &&
        sorted.toSet().containsAll(gridKeys)) {
      final first = fmt.format(
        HotelsFlexibleMonthGrid.dateFromYmKey(gridKeys.first),
      );
      final last = fmt.format(
        HotelsFlexibleMonthGrid.dateFromYmKey(gridKeys.last),
      );
      return 'Any $_selectedNights nights in $first–$last';
    }
    if (sorted.length == 1) {
      final name = fmt.format(
        HotelsFlexibleMonthGrid.dateFromYmKey(sorted.first),
      );
      return 'Any $_selectedNights nights in $name';
    }
    if (sorted.isEmpty) return 'Any $_selectedNights nights';
    final labels = sorted
        .map((k) => fmt.format(HotelsFlexibleMonthGrid.dateFromYmKey(k)))
        .toList();
    if (labels.length == 2) {
      return 'Any $_selectedNights nights in ${labels[0]} or ${labels[1]}';
    }
    final head = labels.sublist(0, labels.length - 1).join(', ');
    return 'Any $_selectedNights nights in $head or ${labels.last}';
  }

  void _commitAndClose() {
    final notifier = ref.read(hotelsBookingDraftProvider.notifier);
    if (_isFlexible) {
      notifier.applyFlexibleStay(
        flexibleStayNights: _selectedNights,
        includeFriday: _includeFriday,
        includeSaturday: _includeSaturday,
        flexibleMonthYmKeys: List<int>.from(_selectedFlexibleMonthYmKeys)
          ..sort(),
      );
    } else {
      final ci = _calendarCheckIn;
      final co = _calendarCheckOut;
      if (ci == null || co == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Select check-in, then check-out')),
        );
        return;
      }
      notifier.applyCalendarStay(
        checkIn: ci,
        checkOut: co,
        dateFlexibility:
            HotelsDateFlexOption.fromFlexDays(_selectedDateFlexDays),
      );
    }
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewPaddingOf(context).bottom;
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        top: true,
        left: true,
        right: true,
        bottom: false,
        child: Align(
          alignment: Alignment.bottomCenter,
          child: SingleChildScrollView(
            padding: EdgeInsets.only(bottom: bottomInset > 0 ? bottomInset : 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _HotelsDatePickerHeader(
                  isFlexible: _isFlexible,
                  onClose: () => Navigator.of(context).pop(),
                  onCalendarTap: () => setState(() => _isFlexible = false),
                  onFlexibleTap: () => setState(() => _isFlexible = true),
                ),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 180),
                  child: _isFlexible
                      ? _HotelsFlexibleTab(
                          key: const ValueKey('flexible-tab'),
                          selectedNights: _selectedNights,
                          monthSlots: HotelsFlexibleMonthGrid.monthStarts(
                            _today(),
                          ),
                          selectedMonthYmKeys: _selectedFlexibleMonthYmKeys,
                          includeFriday: _includeFriday,
                          includeSaturday: _includeSaturday,
                          onNightsChanged: (value) =>
                              setState(() => _selectedNights = value),
                          onMonthToggle: _toggleFlexibleMonth,
                          onIncludeFridayChanged: (value) =>
                              setState(() => _includeFriday = value),
                          onIncludeSaturdayChanged: (value) =>
                              setState(() => _includeSaturday = value),
                        )
                      : _HotelsCalendarTab(
                          key: const ValueKey('calendar-tab'),
                          visibleMonth: _visibleMonth,
                          onPreviousMonth: () => _shiftVisibleMonth(-1),
                          onNextMonth: () => _shiftVisibleMonth(1),
                          canGoPrevious: _canGoPrevMonth(),
                          canGoNext: _canGoNextMonth(),
                          onDateChanged: _handleCalendarDay,
                          checkIn: _calendarCheckIn,
                          checkOut: _calendarCheckOut,
                          selectedDateFlexDays: _selectedDateFlexDays,
                          onDateFlexDaysChanged: (days) =>
                              setState(() => _selectedDateFlexDays = days),
                        ),
                ),
                _ConfirmButtonBar(
                  label: _isFlexible
                      ? 'Confirm ($_selectedNights ${_selectedNights == 1 ? 'night' : 'nights'})'
                      : 'Confirm',
                  helperText: _isFlexible ? _flexibleConfirmHelper() : null,
                  onConfirm: _commitAndClose,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _HotelsDatePickerHeader extends StatelessWidget {
  const _HotelsDatePickerHeader({
    required this.isFlexible,
    required this.onClose,
    required this.onCalendarTap,
    required this.onFlexibleTap,
  });

  final bool isFlexible;
  final VoidCallback onClose;
  final VoidCallback onCalendarTap;
  final VoidCallback onFlexibleTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 6, 8, 0),
      child: Column(
        children: [
          Row(
            children: [
              IconButton(
                onPressed: onClose,
                icon: const Icon(Icons.close_rounded),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: _TopTabButton(
                        label: 'Calendar',
                        isSelected: !isFlexible,
                        onTap: onCalendarTap,
                      ),
                    ),
                    Expanded(
                      child: _TopTabButton(
                        label: "I'm flexible",
                        isSelected: isFlexible,
                        onTap: onFlexibleTap,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Divider(color: Colors.grey.shade200, height: 1),
        ],
      ),
    );
  }
}

class _TopTabButton extends StatelessWidget {
  const _TopTabButton({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    const blue = Color(0xFF2563EB);

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: isSelected ? blue : const Color(0xFF111827),
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: 40,
              height: 3,
              decoration: BoxDecoration(
                color: isSelected ? blue : Colors.transparent,
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HotelsCalendarTab extends StatelessWidget {
  const _HotelsCalendarTab({
    super.key,
    required this.visibleMonth,
    required this.onPreviousMonth,
    required this.onNextMonth,
    required this.canGoPrevious,
    required this.canGoNext,
    required this.onDateChanged,
    required this.checkIn,
    required this.checkOut,
    required this.selectedDateFlexDays,
    required this.onDateFlexDaysChanged,
  });

  final DateTime visibleMonth;
  final VoidCallback onPreviousMonth;
  final VoidCallback onNextMonth;
  final bool canGoPrevious;
  final bool canGoNext;
  final ValueChanged<DateTime> onDateChanged;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final int selectedDateFlexDays;
  final ValueChanged<int> onDateFlexDaysChanged;

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            checkOut == null
                ? (checkIn == null
                    ? '1. Choose check-in'
                    : '2. Choose check-out')
                : 'Adjust dates',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF374151),
                ),
          ),
          const SizedBox(height: 8),
          _HotelsRangeMonthPicker(
            visibleMonth: visibleMonth,
            rangeStart: checkIn,
            rangeEnd: checkOut,
            firstDate: today,
            lastDate: DateTime(today.year + 2, 12, 31),
            onDayTap: onDateChanged,
            onPreviousMonth: onPreviousMonth,
            onNextMonth: onNextMonth,
            canGoPrevious: canGoPrevious,
            canGoNext: canGoNext,
          ),
          const SizedBox(height: 18),
          const _CalendarPriceLegendBar(),
          const SizedBox(height: 12),
          _DateRangeSummaryCard(checkIn: checkIn, checkOut: checkOut),
          const SizedBox(height: 12),
          _ExactDateChipsRow(
            selectedFlexDays: selectedDateFlexDays,
            onFlexDaysSelected: onDateFlexDaysChanged,
          ),
        ],
      ),
    );
  }
}

/// Legend for range mid-nights styling (`0xFFE8F0FE` in [_RangeDayCell]).
/// Full-bleed horizontally without negative [Container.margin] (disallowed).
class _CalendarPriceLegendBar extends StatelessWidget {
  const _CalendarPriceLegendBar();

  /// Matches parent [_HotelsCalendarTab] horizontal padding.
  static const _horizontalBleed = 16.0;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Transform.translate(
          offset: const Offset(-_horizontalBleed, 0),
          child: SizedBox(
            width: constraints.maxWidth + 2 * _horizontalBleed,
            child: ColoredBox(
              color: const Color(0xFFF3F4F6),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: _horizontalBleed,
                  vertical: 10,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: const Color(0xFF93C5FD),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Dates with relatively lower prices',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontSize: 13,
                              height: 1.25,
                              color: const Color(0xFF6B7280),
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _DateRangeSummaryCard extends StatelessWidget {
  const _DateRangeSummaryCard({this.checkIn, this.checkOut});

  final DateTime? checkIn;
  final DateTime? checkOut;

  @override
  Widget build(BuildContext context) {
    final localeTag = Localizations.localeOf(context).toString();
    final fmt = DateFormat('EEE, MMM d', localeTag);
    final inLabel = checkIn != null ? fmt.format(checkIn!) : '—';
    final outLabel = checkOut != null ? fmt.format(checkOut!) : '—';
    return Row(
      children: [
        Expanded(
          child: _SummaryColumn(
            title: 'Check-in',
            primary: inLabel,
            primaryColor: const Color(0xFF2563EB),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _SummaryColumn(
            title: 'Check-out',
            primary: outLabel,
            primaryColor: const Color(0xFF111827),
            alignEnd: true,
          ),
        ),
      ],
    );
  }
}

class _SummaryColumn extends StatelessWidget {
  const _SummaryColumn({
    required this.title,
    required this.primary,
    required this.primaryColor,
    this.alignEnd = false,
  });

  final String title;
  final String primary;
  final Color primaryColor;
  final bool alignEnd;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment:
          alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: const Color(0xFF6B7280),
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          primary,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontSize: 18,
            color: primaryColor,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _ExactDateChipsRow extends StatelessWidget {
  const _ExactDateChipsRow({
    required this.selectedFlexDays,
    required this.onFlexDaysSelected,
  });

  final int selectedFlexDays;
  final ValueChanged<int> onFlexDaysSelected;

  /// Label + flex-day value (`0` = exact dates only).
  static const _chips = [
    ('Exact dates', 0),
    ('±1 day', 1),
    ('±2 days', 2),
    ('±3 days', 3),
    ('±7 days', 7),
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final chip in _chips) ...[
            _PickerChip(
              label: chip.$1,
              selected: selectedFlexDays == chip.$2,
              onTap: () => onFlexDaysSelected(chip.$2),
            ),
            const SizedBox(width: 8),
          ],
        ],
      ),
    );
  }
}

class _HotelsFlexibleTab extends StatelessWidget {
  const _HotelsFlexibleTab({
    super.key,
    required this.selectedNights,
    required this.monthSlots,
    required this.selectedMonthYmKeys,
    required this.includeFriday,
    required this.includeSaturday,
    required this.onNightsChanged,
    required this.onMonthToggle,
    required this.onIncludeFridayChanged,
    required this.onIncludeSaturdayChanged,
  });

  final int selectedNights;
  final List<DateTime> monthSlots;
  final Set<int> selectedMonthYmKeys;
  final bool includeFriday;
  final bool includeSaturday;
  final ValueChanged<int> onNightsChanged;
  final ValueChanged<int> onMonthToggle;
  final ValueChanged<bool> onIncludeFridayChanged;
  final ValueChanged<bool> onIncludeSaturdayChanged;

  static const _nightOptions = [1, 2, 3, 4, 5, 6, 7];

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context).toString();
    final monthFmt = DateFormat('MMM', locale);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
                Text(
                  'Stay duration',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF111827),
                  ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    for (final nights in _nightOptions)
                      _DurationChip(
                        label: '$nights ${nights == 1 ? 'night' : 'nights'}',
                        selected: selectedNights == nights,
                        onTap: () => onNightsChanged(nights),
                      ),
                  ],
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: CheckboxListTile(
                        contentPadding: EdgeInsets.zero,
                        value: includeFriday,
                        onChanged: (value) =>
                            onIncludeFridayChanged(value ?? false),
                        title: const Text('Include Friday'),
                        controlAffinity: ListTileControlAffinity.leading,
                      ),
                    ),
                    Expanded(
                      child: CheckboxListTile(
                        contentPadding: EdgeInsets.zero,
                        value: includeSaturday,
                        onChanged: (value) =>
                            onIncludeSaturdayChanged(value ?? false),
                        title: const Text('Include Saturday'),
                        controlAffinity: ListTileControlAffinity.leading,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  'Month',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF111827),
                  ),
                ),
                const SizedBox(height: 14),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                        childAspectRatio: 1.05,
                      ),
                  itemCount: monthSlots.length,
                  itemBuilder: (context, index) {
                    final slot = monthSlots[index];
                    final ymKey = HotelsFlexibleMonthGrid.ymKey(slot);
                    return _MonthTile(
                      month: monthFmt.format(slot),
                      year: '${slot.year}',
                      selected: selectedMonthYmKeys.contains(ymKey),
                      onTap: () => onMonthToggle(ymKey),
                    );
                  },
                ),
        ],
      ),
    );
  }
}

class _DurationChip extends StatelessWidget {
  const _DurationChip({
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
      borderRadius: BorderRadius.circular(10),
      child: Container(
        width: 100,
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: selected ? Colors.white : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected ? const Color(0xFF2563EB) : const Color(0xFFE5E7EB),
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            color: selected ? const Color(0xFF2563EB) : const Color(0xFF111827),
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _MonthTile extends StatelessWidget {
  const _MonthTile({
    required this.month,
    required this.year,
    required this.selected,
    required this.onTap,
  });

  final String month;
  final String year;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFF8FBFF) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? const Color(0xFF2563EB) : const Color(0xFFE5E7EB),
          ),
        ),
        child: Stack(
          children: [
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.calendar_month_outlined,
                    color: selected
                        ? const Color(0xFF2563EB)
                        : const Color(0xFF6B7280),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    month,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: selected
                          ? const Color(0xFF2563EB)
                          : const Color(0xFF111827),
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Text(
                    year,
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: const Color(0xFF6B7280),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            if (selected)
              const Positioned(
                right: 8,
                bottom: 8,
                child: Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF2563EB),
                  size: 18,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _PickerChip extends StatelessWidget {
  const _PickerChip({
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
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? Colors.white : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected ? const Color(0xFF2563EB) : const Color(0xFFE5E7EB),
          ),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color:
                    selected ? const Color(0xFF2563EB) : const Color(0xFF6B7280),
                fontWeight: FontWeight.w700,
              ),
        ),
      ),
    );
  }
}

class _ConfirmButtonBar extends StatelessWidget {
  const _ConfirmButtonBar({
    required this.label,
    this.helperText,
    required this.onConfirm,
  });

  final String label;
  final String? helperText;
  final VoidCallback onConfirm;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (helperText != null) ...[
            Text(
              helperText!,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: const Color(0xFF111827),
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),
          ],
          FilledButton(
            onPressed: onConfirm,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}
