import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../car_booking_theme.dart';
import '../../car_booking_typography.dart';

class CarBookingAppBar extends StatelessWidget implements PreferredSizeWidget {
  const CarBookingAppBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0.5,
      shadowColor: Colors.black12,
      leading: IconButton(
        onPressed: () => context.pop(),
        icon: const Icon(Icons.arrow_back_rounded),
        color: CarBookingTheme.titleDark,
      ),
      title: Text('Book', style: CarBookingTypography.appBarTitle()),
      centerTitle: false,
      titleSpacing: 8,
    );
  }
}
