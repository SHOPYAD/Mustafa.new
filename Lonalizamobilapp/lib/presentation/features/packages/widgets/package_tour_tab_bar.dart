import 'package:flutter/material.dart';

/// Sticky tab bar: Itinerary | Details | What's included | Notice
class PackageTourTabBar extends StatelessWidget {
  const PackageTourTabBar({
    super.key,
    required this.tabs,
    required this.selectedIndex,
    required this.onTabChanged,
  });

  final List<String> tabs;
  final int selectedIndex;
  final ValueChanged<int> onTabChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      color: Colors.white,
      child: Column(
        mainAxisSize: MainAxisSize.max,
        children: [
          // ── Tab labels row (fills available height minus 2px for indicator)
          Expanded(
            child: Row(
              children: tabs.asMap().entries.map((e) {
                final i = e.key;
                final selected = i == selectedIndex;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => onTabChanged(i),
                    child: Container(
                      color: Colors.white,
                      alignment: Alignment.center,
                      child: Text(
                        e.value,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                          color: selected ? const Color(0xFF7C3AED) : const Color(0xFF6B7280),
                          height: 1.2,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // ── Indicator: one thin line per tab, blue only for selected
          SizedBox(
            height: 2,
            child: Row(
              children: tabs.asMap().entries.map((e) {
                final selected = e.key == selectedIndex;
                return Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    color: selected ? const Color(0xFF7C3AED) : const Color(0xFFF3F4F6),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
