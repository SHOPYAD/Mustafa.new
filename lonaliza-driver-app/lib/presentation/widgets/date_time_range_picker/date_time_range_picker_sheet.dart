import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// Result of [showDateTimeRangePickerSheet] (pick-up / drop-off dates + times).
class DateTimeRangePickerResult {
  const DateTimeRangePickerResult({
    required this.range,
    required this.pickupTime,
    required this.dropoffTime,
  });

  final DateTimeRange range;
  final TimeOfDay pickupTime;
  final TimeOfDay dropoffTime;
}

/// Trip-style bottom sheet: range calendar, local-time notice, pick-up / drop-off times, confirm.
Future<DateTimeRangePickerResult?> showDateTimeRangePickerSheet(
  BuildContext context, {
  DateTimeRange? initialRange,
  TimeOfDay? initialPickupTime,
  TimeOfDay? initialDropoffTime,
  String title = 'Select Dates & Times',
  DateTime? firstDate,
  DateTime? lastDate,
}) {
  final now = DateTime.now();
  final first = DateTime(now.year, now.month, now.day);
  final last = lastDate ?? DateTime(first.year + 2, first.month, first.day);

  return showModalBottomSheet<DateTimeRangePickerResult>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.white,
    builder: (context) {
      return FractionallySizedBox(
        heightFactor: 0.94,
        child: DateTimeRangePickerSheet(
          title: title,
          firstDate: firstDate ?? first,
          lastDate: last,
          initialRange: initialRange,
          initialPickupTime: initialPickupTime ?? const TimeOfDay(hour: 10, minute: 0),
          initialDropoffTime: initialDropoffTime ?? const TimeOfDay(hour: 10, minute: 0),
        ),
      );
    },
  );
}

class DateTimeRangePickerSheet extends StatefulWidget {
  const DateTimeRangePickerSheet({
    super.key,
    required this.firstDate,
    required this.lastDate,
    required this.initialPickupTime,
    required this.initialDropoffTime,
    this.title = 'Select Dates & Times',
    this.initialRange,
  });

  final String title;
  final DateTime firstDate;
  final DateTime lastDate;
  final DateTimeRange? initialRange;
  final TimeOfDay initialPickupTime;
  final TimeOfDay initialDropoffTime;

  @override
  State<DateTimeRangePickerSheet> createState() => _DateTimeRangePickerSheetState();
}

const Color _calendarRangeFill = Color(0xFFE8F0FF);

class _DateTimeRangePickerSheetState extends State<DateTimeRangePickerSheet> {
  static const Color _primaryBlue = Color(0xFF2B61FF);
  static const Color _terracotta = Color(0xFFC45C3E);

  late DateTime _selectedStart;
  DateTime? _selectedEnd;
  late TimeOfDay _pickupTime;
  late TimeOfDay _dropoffTime;

  late final List<DateTime> _months;

  static final DateFormat _dayShort = DateFormat('EEE');
  static final DateFormat _monthDay = DateFormat('MMM d');
  @override
  void initState() {
    super.initState();
    final init = widget.initialRange;
    final today = DateTime(widget.firstDate.year, widget.firstDate.month, widget.firstDate.day);
    if (init != null) {
      var a = DateTime(init.start.year, init.start.month, init.start.day);
      var b = DateTime(init.end.year, init.end.month, init.end.day);
      if (b.isBefore(a)) {
        final t = a;
        a = b;
        b = t;
      }
      _selectedStart = a;
      _selectedEnd = b;
    } else {
      _selectedStart = today;
      _selectedEnd = today.add(const Duration(days: 3));
    }
    _pickupTime = widget.initialPickupTime;
    _dropoffTime = widget.initialDropoffTime;
    _months = _enumerateMonths(
      DateTime(widget.firstDate.year, widget.firstDate.month),
      DateTime(widget.lastDate.year, widget.lastDate.month),
    );
  }

  static List<DateTime> _enumerateMonths(DateTime from, DateTime to) {
    final list = <DateTime>[];
    var y = from.year;
    var m = from.month;
    final toMonth = DateTime(to.year, to.month);
    for (;;) {
      final d = DateTime(y, m);
      if (d.isAfter(toMonth)) break;
      list.add(d);
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
    if (list.isEmpty) {
      return [DateTime(from.year, from.month)];
    }
    return list;
  }

  int get _inclusiveDays {
    if (_selectedEnd == null) return 0;
    final a = DateTime(_selectedStart.year, _selectedStart.month, _selectedStart.day);
    final b = DateTime(_selectedEnd!.year, _selectedEnd!.month, _selectedEnd!.day);
    return b.difference(a).inDays + 1;
  }

  void _handleDateTap(DateTime date) {
    final day = DateTime(date.year, date.month, date.day);
    final first = DateTime(widget.firstDate.year, widget.firstDate.month, widget.firstDate.day);
    final last = DateTime(widget.lastDate.year, widget.lastDate.month, widget.lastDate.day);
    if (day.isBefore(first) || day.isAfter(last)) return;

    setState(() {
      if (_selectedEnd != null) {
        _selectedStart = day;
        _selectedEnd = null;
        return;
      }
      if (day.isBefore(_selectedStart)) {
        _selectedEnd = _selectedStart;
        _selectedStart = day;
        return;
      }
      if (_isSameDay(day, _selectedStart)) {
        _selectedEnd = day;
        return;
      }
      _selectedEnd = day;
    });
  }

  bool _canConfirm() => _selectedEnd != null;

  Future<void> _pickTime(bool pickup) async {
    final initial = pickup ? _pickupTime : _dropoffTime;
    final picked = await showTimePicker(
      context: context,
      initialTime: initial,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(colorScheme: ColorScheme.light(primary: _primaryBlue)),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
    if (picked != null) {
      setState(() {
        if (pickup) {
          _pickupTime = picked;
        } else {
          _dropoffTime = picked;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final end = _selectedEnd ?? _selectedStart;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(6, 6, 14, 8),
          child: Row(
            children: [
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close_rounded, size: 26),
                color: const Color(0xFF111827),
              ),
              Expanded(
                child: Text(
                  widget.title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF111827),
                        fontSize: 18,
                      ),
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1, thickness: 1, color: Color(0xFFE5E7EB)),
        Padding(
          padding: const EdgeInsets.fromLTRB(8, 8, 8, 6),
          child: _WeekdayHeaderRow(),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
            itemCount: _months.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _MonthCalendar(
                  month: _months[index],
                  firstSelectable: widget.firstDate,
                  lastSelectable: widget.lastDate,
                  selectedStart: _selectedStart,
                  selectedEnd: _selectedEnd,
                  onDateTap: _handleDateTap,
                ),
              );
            },
          ),
        ),
        const Divider(height: 1, thickness: 1, color: Color(0xFFE5E7EB)),
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Text(
            'All times are in local time',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: _terracotta,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
          ),
        ),
        const Divider(height: 1, thickness: 1, color: Color(0xFFE5E7EB)),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _TimeColumn(
                  label: 'Pick-up time',
                  dateLine: '${_dayShort.format(_selectedStart)}, ${_monthDay.format(_selectedStart)}',
                  dateLineBlue: true,
                  selectedTime: _pickupTime,
                  onTimeTap: () => _pickTime(true),
                ),
              ),
              Container(
                width: 1,
                margin: const EdgeInsets.only(top: 4),
                height: 72,
                color: const Color(0xFFE5E7EB),
              ),
              Expanded(
                child: _TimeColumn(
                  label: 'Drop-off time',
                  dateLine: '${_dayShort.format(end)}, ${_monthDay.format(end)}',
                  dateLineBlue: false,
                  selectedTime: _dropoffTime,
                  onTimeTap: () => _pickTime(false),
                ),
              ),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 14),
            child: FilledButton(
              onPressed: _canConfirm()
                  ? () {
                      Navigator.of(context).pop(
                        DateTimeRangePickerResult(
                          range: DateTimeRange(start: _selectedStart, end: _selectedEnd!),
                          pickupTime: _pickupTime,
                          dropoffTime: _dropoffTime,
                        ),
                      );
                    }
                  : null,
              style: FilledButton.styleFrom(
                backgroundColor: _primaryBlue,
                foregroundColor: Colors.white,
                disabledBackgroundColor: const Color(0xFFCBD5E1),
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: Text(
                _canConfirm()
                    ? 'Confirm ($_inclusiveDays ${_inclusiveDays == 1 ? 'Day' : 'Days'})'
                    : 'Confirm',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _WeekdayHeaderRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Row(
      children: [
        for (var i = 0; i < labels.length; i++)
          Expanded(
            child: Text(
              labels[i],
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: i == 0 || i == 6 ? const Color(0xFF2B61FF) : const Color(0xFF111827),
                  ),
            ),
          ),
      ],
    );
  }
}

class _MonthCalendar extends StatelessWidget {
  const _MonthCalendar({
    required this.month,
    required this.firstSelectable,
    required this.lastSelectable,
    required this.selectedStart,
    required this.selectedEnd,
    required this.onDateTap,
  });

  final DateTime month;
  final DateTime firstSelectable;
  final DateTime lastSelectable;
  final DateTime selectedStart;
  final DateTime? selectedEnd;
  final ValueChanged<DateTime> onDateTap;

  @override
  Widget build(BuildContext context) {
    final monthTitle = DateFormat('MMMM yyyy').format(month);
    final firstDay = DateTime(month.year, month.month, 1);
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final startOffset = firstDay.weekday % 7;
    final totalCells = ((startOffset + daysInMonth) / 7).ceil() * 7;
    final today = DateTime.now();
    final todayDay = DateTime(today.year, today.month, today.day);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text(
            monthTitle,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: const Color(0xFF111827),
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                ),
          ),
        ),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: totalCells,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            childAspectRatio: 1,
          ),
          itemBuilder: (context, index) {
            final dayNumber = index - startOffset + 1;
            if (dayNumber < 1 || dayNumber > daysInMonth) {
              return const SizedBox.shrink();
            }

            final date = DateTime(month.year, month.month, dayNumber);
            final dateDay = DateTime(date.year, date.month, date.day);
            final isPast = dateDay.isBefore(todayDay);
            final isBeforeFirst = dateDay.isBefore(
              DateTime(firstSelectable.year, firstSelectable.month, firstSelectable.day),
            );
            final isAfterLast = dateDay.isAfter(
              DateTime(lastSelectable.year, lastSelectable.month, lastSelectable.day),
            );
            final disabled = isPast || isBeforeFirst || isAfterLast;

            final isStart = _isSameDay(date, selectedStart);
            final isEnd = selectedEnd != null && _isSameDay(date, selectedEnd!);
            final isInRange = selectedEnd != null &&
                dateDay.isAfter(DateTime(selectedStart.year, selectedStart.month, selectedStart.day)) &&
                dateDay.isBefore(DateTime(selectedEnd!.year, selectedEnd!.month, selectedEnd!.day));

            final weekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;

            Color textColor;
            if (isStart || isEnd) {
              textColor = Colors.white;
            } else if (isInRange) {
              textColor = const Color(0xFF1E40AF);
            } else if (disabled) {
              textColor = const Color(0xFFCBD5E1);
            } else if (weekend) {
              textColor = const Color(0xFF2B61FF);
            } else {
              textColor = const Color(0xFF111827);
            }

            return InkWell(
              onTap: disabled ? null : () => onDateTap(date),
              borderRadius: BorderRadius.circular(10),
              child: Center(
                child: Container(
                  width: 42,
                  height: 42,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isStart || isEnd
                        ? const Color(0xFF2B61FF)
                        : isInRange
                            ? _calendarRangeFill
                            : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '$dayNumber',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: textColor,
                          fontWeight: isStart || isEnd ? FontWeight.w800 : FontWeight.w600,
                          fontSize: 15,
                        ),
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _TimeColumn extends StatelessWidget {
  const _TimeColumn({
    required this.label,
    required this.dateLine,
    required this.dateLineBlue,
    required this.selectedTime,
    required this.onTimeTap,
  });

  final String label;
  final String dateLine;
  final bool dateLineBlue;
  final TimeOfDay selectedTime;
  final VoidCallback onTimeTap;

  @override
  Widget build(BuildContext context) {
    final timeStr = MaterialLocalizations.of(context).formatTimeOfDay(
      selectedTime,
      alwaysUse24HourFormat: false,
    );

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: const Color(0xFF9CA3AF),
                  fontWeight: FontWeight.w500,
                  fontSize: 12,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            dateLine,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                  color: dateLineBlue ? const Color(0xFF2B61FF) : const Color(0xFF111827),
                ),
          ),
          const SizedBox(height: 6),
          InkWell(
            onTap: onTimeTap,
            borderRadius: BorderRadius.circular(6),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  timeStr,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF111827),
                        fontSize: 16,
                      ),
                ),
                Icon(Icons.keyboard_arrow_down_rounded, size: 22, color: Colors.grey.shade700),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

bool _isSameDay(DateTime a, DateTime b) {
  return a.year == b.year && a.month == b.month && a.day == b.day;
}
