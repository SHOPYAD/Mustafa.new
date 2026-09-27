import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

enum FlightsDateSelectionMode {
  single,
  range,
}

class FlightsDatePickerResult {
  const FlightsDatePickerResult({
    required this.start,
    this.end,
  });

  final DateTime start;
  final DateTime? end;
}

Future<FlightsDatePickerResult?> showFlightsDatePickerSheet(
  BuildContext context, {
  required FlightsDateSelectionMode selectionMode,
  DateTime? initialDate,
  DateTimeRange? initialRange,
}) {
  return showModalBottomSheet<FlightsDatePickerResult>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.white,
    builder: (context) {
      return FractionallySizedBox(
        heightFactor: 0.96,
        child: FlightsDatePickerSheet(
          selectionMode: selectionMode,
          initialDate: initialDate,
          initialRange: initialRange,
        ),
      );
    },
  );
}

class FlightsDatePickerSheet extends StatefulWidget {
  const FlightsDatePickerSheet({
    super.key,
    required this.selectionMode,
    this.initialDate,
    this.initialRange,
  });

  final FlightsDateSelectionMode selectionMode;
  final DateTime? initialDate;
  final DateTimeRange? initialRange;

  @override
  State<FlightsDatePickerSheet> createState() => _FlightsDatePickerSheetState();
}

class _FlightsDatePickerSheetState extends State<FlightsDatePickerSheet> {
  late DateTime _visibleMonth;
  late DateTime _selectedStart;
  DateTime? _selectedEnd;
  bool _nonstopOnly = false;

  static final DateFormat _summaryFormat = DateFormat('EEE, MMM d');

  @override
  void initState() {
    super.initState();
    _selectedStart =
        widget.initialRange?.start ?? widget.initialDate ?? DateTime.now();
    _selectedEnd = widget.selectionMode == FlightsDateSelectionMode.range
        ? widget.initialRange?.end
        : null;
    _visibleMonth = DateTime(_selectedStart.year, _selectedStart.month);
  }

  @override
  Widget build(BuildContext context) {
    final monthA = DateTime(_visibleMonth.year, _visibleMonth.month);
    final monthB = DateTime(_visibleMonth.year, _visibleMonth.month + 1);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 8, 14, 10),
          child: Column(
            children: [
              Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                  Text(
                    'Select Dates',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF111827),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    'Nonstop',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Switch(
                    value: _nonstopOnly,
                    onChanged: (value) {
                      setState(() => _nonstopOnly = value);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 4),
              const _WeekdayHeader(),
            ],
          ),
        ),
        const Divider(height: 1, color: Color(0xFFE5E7EB)),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 16),
            children: [
              _MonthCalendar(
                month: monthA,
                selectedStart: _selectedStart,
                selectedEnd: _selectedEnd,
                selectionMode: widget.selectionMode,
                onDateTap: _handleDateTap,
              ),
              const SizedBox(height: 8),
              const Divider(height: 1, color: Color(0xFFF1F5F9)),
              const SizedBox(height: 8),
              _MonthCalendar(
                month: monthB,
                selectedStart: _selectedStart,
                selectedEnd: _selectedEnd,
                selectionMode: widget.selectionMode,
                onDateTap: _handleDateTap,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                color: const Color(0xFFFFF7ED),
                child: Text(
                  'Prices are per person in USD. All times are local.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFF9A5A1A),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  _buildSummaryLabel(),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF111827),
                  ),
                ),
                const SizedBox(height: 14),
                FilledButton(
                  onPressed: _canSubmit()
                      ? () {
                          Navigator.of(context).pop(
                            FlightsDatePickerResult(
                              start: _selectedStart,
                              end: widget.selectionMode ==
                                      FlightsDateSelectionMode.range
                                  ? _selectedEnd
                                  : null,
                            ),
                          );
                        }
                      : null,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF2F60F5),
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(56),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Done',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _handleDateTap(DateTime date) {
    setState(() {
      if (widget.selectionMode == FlightsDateSelectionMode.single) {
        _selectedStart = date;
        return;
      }

      if (_selectedEnd != null) {
        _selectedStart = date;
        _selectedEnd = null;
        return;
      }

      if (date.isBefore(_selectedStart)) {
        _selectedEnd = _selectedStart;
        _selectedStart = date;
        return;
      }

      if (_isSameDay(date, _selectedStart)) {
        _selectedEnd = date;
        return;
      }

      _selectedEnd = date;
    });
  }

  bool _canSubmit() {
    return widget.selectionMode == FlightsDateSelectionMode.single ||
        _selectedEnd != null;
  }

  String _buildSummaryLabel() {
    if (widget.selectionMode == FlightsDateSelectionMode.single) {
      return _summaryFormat.format(_selectedStart);
    }

    if (_selectedEnd == null) {
      return _summaryFormat.format(_selectedStart);
    }

    return '${_summaryFormat.format(_selectedStart)} - ${_summaryFormat.format(_selectedEnd!)}';
  }
}

class _WeekdayHeader extends StatelessWidget {
  const _WeekdayHeader();

  static const _labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (final label in _labels)
          Expanded(
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: const Color(0xFF3157C8),
                fontWeight: FontWeight.w500,
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
    required this.selectedStart,
    required this.selectedEnd,
    required this.selectionMode,
    required this.onDateTap,
  });

  final DateTime month;
  final DateTime selectedStart;
  final DateTime? selectedEnd;
  final FlightsDateSelectionMode selectionMode;
  final ValueChanged<DateTime> onDateTap;

  @override
  Widget build(BuildContext context) {
    final monthTitle = DateFormat('MMMM yyyy').format(month);
    final firstDay = DateTime(month.year, month.month, 1);
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final startOffset = firstDay.weekday % 7;
    final totalCells = ((startOffset + daysInMonth) / 7).ceil() * 7;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Text(
            monthTitle,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: const Color(0xFF1F2937),
              fontWeight: FontWeight.w700,
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
            final isStart = _isSameDay(date, selectedStart);
            final isEnd = selectedEnd != null && _isSameDay(date, selectedEnd!);
            final isInRange = selectedEnd != null &&
                date.isAfter(selectedStart) &&
                date.isBefore(selectedEnd!);

            return InkWell(
              onTap: () => onDateTap(date),
              borderRadius: BorderRadius.circular(12),
              child: Center(
                child: Container(
                  width: 42,
                  height: 42,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isStart || isEnd
                        ? const Color(0xFF2F60F5)
                        : isInRange
                            ? const Color(0xFFDBE8FF)
                            : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '$dayNumber',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: isStart || isEnd
                          ? Colors.white
                          : const Color(0xFF4B5563),
                      fontWeight:
                          isStart || isEnd ? FontWeight.w700 : FontWeight.w500,
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

bool _isSameDay(DateTime a, DateTime b) {
  return a.year == b.year && a.month == b.month && a.day == b.day;
}
