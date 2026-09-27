import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'car_circle_icon_button.dart';

/// Navbar only (back, support, more) — not part of scrollable hero / page body.
class CarRentalsNavBar extends StatelessWidget implements PreferredSizeWidget {
  const CarRentalsNavBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      leadingWidth: 56,
      leading: Padding(
        padding: const EdgeInsets.only(left: 8),
        child: Align(
          alignment: Alignment.centerLeft,
          child: CarCircleIconButton(
            icon: Icons.arrow_back_rounded,
            onPressed: () => context.pop(),
          ),
        ),
      ),
      actions: [
        CarCircleIconButton(
          icon: Icons.headset_mic_outlined,
          onPressed: () {},
        ),
        const SizedBox(width: 10),
        Padding(
          padding: const EdgeInsets.only(right: 8),
          child: CarCircleIconButton(
            icon: Icons.more_horiz_rounded,
            onPressed: () {},
          ),
        ),
      ],
    );
  }
}
