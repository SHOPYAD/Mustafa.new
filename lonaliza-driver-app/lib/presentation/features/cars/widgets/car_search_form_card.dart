import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../providers/router_providers.dart';
import '../../../widgets/date_time_range_picker/date_time_range_picker_sheet.dart';
import '../car_search_results_args.dart';
import '../car_rentals_theme.dart';
import 'car_dropoff_toggle_row.dart';
import 'car_rapid_support_footer.dart';
import 'car_search_input_row.dart';
import 'car_slanted_tabs.dart';

/// White overlapping card: tabs, toggle, fields, Search, support footer.
class CarSearchFormCard extends ConsumerStatefulWidget {
  const CarSearchFormCard({super.key});

  @override
  ConsumerState<CarSearchFormCard> createState() => _CarSearchFormCardState();
}

class _CarSearchFormCardState extends ConsumerState<CarSearchFormCard> {
  bool _carRentalsTab = true;
  bool _differentDropoff = false;

  late DateTimeRange _dateRange;
  late TimeOfDay _pickupTime;
  late TimeOfDay _dropoffTime;

  static final DateFormat _md = DateFormat('MMM d');

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, now.day);
    _dateRange = DateTimeRange(start: start, end: start.add(const Duration(days: 3)));
    _pickupTime = const TimeOfDay(hour: 10, minute: 0);
    _dropoffTime = const TimeOfDay(hour: 10, minute: 0);
  }

  int _inclusiveRentalDays() {
    final a = DateTime(_dateRange.start.year, _dateRange.start.month, _dateRange.start.day);
    final b = DateTime(_dateRange.end.year, _dateRange.end.month, _dateRange.end.day);
    return b.difference(a).inDays + 1;
  }

  String _dateTimePrimaryLine(BuildContext context) {
    final loc = MaterialLocalizations.of(context);
    final t1 = loc.formatTimeOfDay(_pickupTime, alwaysUse24HourFormat: false);
    final t2 = loc.formatTimeOfDay(_dropoffTime, alwaysUse24HourFormat: false);
    final d1 = _md.format(_dateRange.start);
    final d2 = _md.format(_dateRange.end);
    return '$t1, $d1 - $t2, $d2';
  }

  String _rentalDurationSubtitle() {
    final n = _inclusiveRentalDays();
    return n == 1 ? '1 day' : '$n days';
  }

  Future<void> _openDateTimePicker(BuildContext context) async {
    final result = await showDateTimeRangePickerSheet(
      context,
      initialRange: _dateRange,
      initialPickupTime: _pickupTime,
      initialDropoffTime: _dropoffTime,
    );
    if (!context.mounted || result == null) return;
    setState(() {
      _dateRange = result.range;
      _pickupTime = result.pickupTime;
      _dropoffTime = result.dropoffTime;
    });
  }

  void _onSearch(BuildContext context) {
    final nav = ref.read(navigationRepositoryProvider);
    nav.goCarsSearch(
      CarSearchResultsArgs(
        locationTitle: 'Los Angeles International Airport',
        locationSubtitle: 'Los Angeles',
        dateTimesPrimary: _dateTimePrimaryLine(context),
        dateTimesSecondary: _rentalDurationSubtitle(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 8,
      shadowColor: Colors.black.withValues(alpha: 0.12),
      borderRadius: BorderRadius.circular(16),
      color: Colors.white,
      clipBehavior: Clip.antiAlias,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          CarSlantedTabs(
            leftSelected: _carRentalsTab,
            onLeftTap: () => setState(() => _carRentalsTab = true),
            onRightTap: () => setState(() => _carRentalsTab = false),
          ),
          Divider(height: 1, thickness: 1, color: CarRentalsTheme.rowDivider),
          CarDropoffToggleRow(
            value: _differentDropoff,
            onChanged: (v) => setState(() => _differentDropoff = v),
          ),
          Divider(height: 1, thickness: 1, color: CarRentalsTheme.rowDivider),
          const CarSearchInputRow(
            icon: Icons.directions_car_outlined,
            primary: 'Los Angeles International Airport',
            secondary: 'Los Angeles',
          ),
          Divider(height: 1, thickness: 1, color: CarRentalsTheme.rowDivider, indent: 16, endIndent: 16),
          CarSearchInputRow(
            icon: Icons.calendar_today_outlined,
            primary: _dateTimePrimaryLine(context),
            secondary: _rentalDurationSubtitle(),
            onTap: () => _openDateTimePicker(context),
          ),
          Divider(height: 1, thickness: 1, color: CarRentalsTheme.rowDivider, indent: 16, endIndent: 16),
          const CarSearchInputRow(
            icon: Icons.person_outline_rounded,
            primary: "Driver's age 30~60",
            showChevron: false,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton(
                onPressed: () => _onSearch(context),
                style: FilledButton.styleFrom(
                  backgroundColor: CarRentalsTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                ),
                child: const Text('Search'),
              ),
            ),
          ),
          const CarRapidSupportFooter(),
        ],
      ),
    );
  }
}
