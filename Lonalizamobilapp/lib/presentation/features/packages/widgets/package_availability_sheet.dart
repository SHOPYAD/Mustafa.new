import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Bottom sheet shown when "Check availability" is pressed
/// Contains: departure city, passenger counters, date picker (All/Recommended)
void showAvailabilitySheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) => const _AvailabilitySheet(),
  );
}

class _AvailabilitySheet extends StatefulWidget {
  const _AvailabilitySheet();

  @override
  State<_AvailabilitySheet> createState() => _AvailabilitySheetState();
}

class _AvailabilitySheetState extends State<_AvailabilitySheet> {
  int _adults = 2;
  int _children = 0;
  int _dateTab = 0; // 0 = All dates, 1 = Recommended dates
  DateTime _selected = DateTime(2026, 4, 29);
  int _selectedReco = 0;

  // Sample price data per day (offset from Apr 19 = index 0)
  static const _prices = <int, int>{
    25: 1832, 26: 1830, 27: 1863, 28: 1845, 29: 1834, 30: 1869,
    // May prices (day-of-month as key + 100 offset)
    101: 1846, 102: 1799, 103: 1744, 104: 1735, 105: 1709,
    106: 1749, 107: 1748, 108: 1749, 109: 1815,
  };

  static const _recos = [
    _RecoDate(departure: 'Wed, Apr 29', returnDate: 'Wed, May 6', price: r'$1,834'),
    _RecoDate(departure: 'Tue, May 19', returnDate: 'Tue, May 26', price: r'$1,702', isLowPrice: true),
    _RecoDate(departure: 'Sat, May 3', returnDate: 'Sat, May 10', price: r'$1,744'),
  ];

  @override
  Widget build(BuildContext context) {
    final screenH = MediaQuery.of(context).size.height;

    return SizedBox(
      height: screenH * 0.88,
      child: Column(
        children: [
          // ── Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
            child: Stack(
              alignment: Alignment.center,
              children: [
                const Text('Please select',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                Align(
                  alignment: Alignment.centerLeft,
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.close_rounded, size: 22, color: Color(0xFF374151)),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
          const SizedBox(height: 4),

          // ── Departure city
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('Departure city',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
                Text('Beijing',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Color(0xFF374151))),
              ],
            ),
          ),

          const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6), indent: 20, endIndent: 20),

          // ── Adults counter
          _PassengerRow(
            label: 'Adults',
            sublabel: '12 years or over',
            count: _adults,
            onDecrement: _adults > 1 ? () => setState(() => _adults--) : null,
            onIncrement: () => setState(() => _adults++),
          ),

          const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6), indent: 20, endIndent: 20),

          // ── Children counter
          _PassengerRow(
            label: 'Children',
            sublabel: '2–11 years old',
            count: _children,
            onDecrement: _children > 0 ? () => setState(() => _children--) : null,
            onIncrement: () => setState(() => _children++),
          ),

          const Divider(height: 1, thickness: 8, color: Color(0xFFF3F4F6)),

          // ── Date tabs
          _DateTabBar(
            selectedIndex: _dateTab,
            onChanged: (i) => setState(() => _dateTab = i),
          ),

          // ── Date content
          Expanded(
            child: _dateTab == 0
                ? _CalendarView(
                    selected: _selected,
                    prices: _prices,
                    onDateSelected: (d) => setState(() => _selected = d),
                  )
                : _RecommendedDatesView(
                    items: _recos,
                    selectedIndex: _selectedReco,
                    onSelect: (i) => setState(() => _selectedReco = i),
                  ),
          ),

          // ── Next button
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            child: GestureDetector(
              onTap: () {
                Navigator.pop(context);
                context.push('/packages/confirm');
              },
              child: Container(
                width: double.infinity,
                height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFF7C3AED),
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: const Text('Next',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Passenger counter row
class _PassengerRow extends StatelessWidget {
  const _PassengerRow({
    required this.label,
    required this.sublabel,
    required this.count,
    this.onDecrement,
    required this.onIncrement,
  });

  final String label;
  final String sublabel;
  final int count;
  final VoidCallback? onDecrement;
  final VoidCallback onIncrement;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        children: [
          // Label
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Text(sublabel,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                    const SizedBox(width: 4),
                    const Icon(Icons.info_outline_rounded, size: 13, color: Color(0xFF9CA3AF)),
                  ],
                ),
              ],
            ),
          ),
          // Counter
          Row(
            children: [
              _CounterBtn(
                icon: Icons.remove_rounded,
                enabled: onDecrement != null,
                onTap: onDecrement,
              ),
              SizedBox(
                width: 32,
                child: Text('$count',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
              ),
              _CounterBtn(icon: Icons.add_rounded, enabled: true, onTap: onIncrement),
            ],
          ),
        ],
      ),
    );
  }
}

class _CounterBtn extends StatelessWidget {
  const _CounterBtn({required this.icon, required this.enabled, this.onTap});
  final IconData icon;
  final bool enabled;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: enabled ? const Color(0xFF7C3AED) : const Color(0xFFF3F4F6),
        ),
        child: Icon(icon, size: 18, color: enabled ? Colors.white : const Color(0xFFD1D5DB)),
      ),
    );
  }
}

// ── Date tab bar (All dates / Recommended dates)
class _DateTabBar extends StatelessWidget {
  const _DateTabBar({required this.selectedIndex, required this.onChanged});
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  static const _tabs = ['All dates', 'Recommended dates'];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: _tabs.asMap().entries.map((e) {
              final selected = e.key == selectedIndex;
              return Expanded(
                child: GestureDetector(
                  onTap: () => onChanged(e.key),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    color: Colors.white,
                    child: Text(
                      e.value,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                        color: selected ? const Color(0xFF7C3AED) : const Color(0xFF6B7280),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          // Indicator
          Row(
            children: _tabs.asMap().entries.map((e) {
              return Expanded(
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 2,
                  color: e.key == selectedIndex ? const Color(0xFF7C3AED) : const Color(0xFFF3F4F6),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

// ── Full Calendar view with prices
class _CalendarView extends StatelessWidget {
  const _CalendarView({required this.selected, required this.prices, required this.onDateSelected});
  final DateTime selected;
  final Map<int, int> prices;
  final ValueChanged<DateTime> onDateSelected;

  static const _weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Weekday headers
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              children: _weekdays.map((d) {
                final isWeekend = d == 'Sun' || d == 'Sat';
                return Expanded(
                  child: Text(
                    d,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isWeekend ? const Color(0xFF7C3AED) : const Color(0xFF374151),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // April 2026
          _MonthGrid(
            month: DateTime(2026, 4),
            selected: selected,
            prices: prices,
            onDateSelected: onDateSelected,
            priceKeyOffset: 0,
          ),

          // May 2026
          _MonthGrid(
            month: DateTime(2026, 5),
            selected: selected,
            prices: prices,
            onDateSelected: onDateSelected,
            priceKeyOffset: 100,
          ),

          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _MonthGrid extends StatelessWidget {
  const _MonthGrid({
    required this.month,
    required this.selected,
    required this.prices,
    required this.onDateSelected,
    required this.priceKeyOffset,
  });

  final DateTime month;
  final DateTime selected;
  final Map<int, int> prices;
  final ValueChanged<DateTime> onDateSelected;
  final int priceKeyOffset;

  @override
  Widget build(BuildContext context) {
    final monthLabel = _monthName(month.month);
    final firstDay = DateTime(month.year, month.month, 1);
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final startWeekday = firstDay.weekday % 7; // 0=Sun

    return Column(
      children: [
        // Month header
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Text('$monthLabel ${month.year}',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
        ),
        // Grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 4),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            childAspectRatio: 0.75,
          ),
          itemCount: startWeekday + daysInMonth,
          itemBuilder: (_, index) {
            if (index < startWeekday) return const SizedBox();
            final day = index - startWeekday + 1;
            final date = DateTime(month.year, month.month, day);
            final isSelected = date.year == selected.year &&
                date.month == selected.month &&
                date.day == selected.day;
            final isPast = date.isBefore(DateTime(2026, 4, 25));
            final price = prices[priceKeyOffset + day];
            final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;

            return GestureDetector(
              onTap: isPast ? null : () => onDateSelected(date),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isSelected ? const Color(0xFF7C3AED) : Colors.transparent,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '$day',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                        color: isSelected
                            ? Colors.white
                            : isPast
                                ? const Color(0xFFD1D5DB)
                                : isWeekend
                                    ? const Color(0xFF7C3AED)
                                    : const Color(0xFF111827),
                      ),
                    ),
                  ),
                  if (price != null && !isPast)
                    Text(
                      '${(price / 1000).toStringAsFixed(0)},${(price % 1000).toString().padLeft(3, '0')}',
                      style: TextStyle(
                        fontSize: 9,
                        color: isSelected ? const Color(0xFF7C3AED) : const Color(0xFF9CA3AF),
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  String _monthName(int m) {
    const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[m];
  }
}

// ── Recommended dates cards
class _RecommendedDatesView extends StatelessWidget {
  const _RecommendedDatesView({required this.items, required this.selectedIndex, required this.onSelect});
  final List<_RecoDate> items;
  final int selectedIndex;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (_, i) {
        final item = items[i];
        final isSelected = i == selectedIndex;
        return GestureDetector(
          onTap: () => onSelect(i),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? const Color(0xFF7C3AED) : const Color(0xFFE5E7EB),
                width: isSelected ? 1.5 : 1,
              ),
            ),
            child: Stack(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (item.isLowPrice)
                      const Padding(
                        padding: EdgeInsets.only(bottom: 8),
                        child: Text('Low price',
                            style: TextStyle(fontSize: 12, color: Color(0xFF7C3AED), fontWeight: FontWeight.w600)),
                      ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Departure',
                                style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                            const SizedBox(height: 2),
                            Text(item.departure,
                                style: const TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                          ],
                        ),
                        Container(width: 24, height: 1, color: const Color(0xFFE5E7EB)),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text('Return',
                                style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                            const SizedBox(height: 2),
                            Text(item.returnDate,
                                style: const TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: Text.rich(
                        TextSpan(children: [
                          const TextSpan(
                              text: 'From ',
                              style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                          TextSpan(
                              text: item.price,
                              style: const TextStyle(
                                  fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF7C3AED))),
                        ]),
                      ),
                    ),
                  ],
                ),
                // Selected checkmark
                if (isSelected)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: const BoxDecoration(
                        color: Color(0xFF7C3AED),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check_rounded, color: Colors.white, size: 13),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _RecoDate {
  const _RecoDate({
    required this.departure,
    required this.returnDate,
    required this.price,
    this.isLowPrice = false,
  });
  final String departure;
  final String returnDate;
  final String price;
  final bool isLowPrice;
}
