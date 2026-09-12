import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

/// Horizontal tabs: Details | Select coverage package | Required documents …
class CarRentalDetailTabsBar extends StatelessWidget {
  const CarRentalDetailTabsBar({
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
            final sel = i == selectedIndex;
            return InkWell(
              onTap: () => onChanged(i),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      tabs[i],
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: sel ? FontWeight.w800 : FontWeight.w600,
                        color: sel ? CarRentalProductTheme.primaryBlue : CarRentalProductTheme.metaGrey,
                      ),
                    ),
                    Container(
                      height: 3,
                      width: 32,
                      decoration: BoxDecoration(
                        color: sel ? CarRentalProductTheme.primaryBlue : Colors.transparent,
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
