import 'package:flutter/material.dart';

import '../car_detail_theme.dart';

class CarDetailTabBar extends StatelessWidget {
  const CarDetailTabBar({
    super.key,
    required this.tabs,
    required this.selectedIndex,
    required this.onChanged,
  });

  final List<String> tabs;
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      child: SizedBox(
        height: 48,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          itemCount: tabs.length,
          separatorBuilder: (_, _) => const SizedBox(width: 4),
          itemBuilder: (context, i) {
            final selected = i == selectedIndex;
            return InkWell(
              onTap: () => onChanged(i),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      tabs[i],
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                        color: selected ? CarDetailTheme.titleDark : CarDetailTheme.tabInactive,
                      ),
                    ),
                    Container(
                      height: 3,
                      width: 28,
                      decoration: BoxDecoration(
                        color: selected ? CarDetailTheme.primaryBlue : Colors.transparent,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
