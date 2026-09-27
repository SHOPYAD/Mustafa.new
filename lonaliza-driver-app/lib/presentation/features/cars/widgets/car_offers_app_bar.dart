import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../car_offers_theme.dart';

class CarOffersAppBar extends StatelessWidget implements PreferredSizeWidget {
  const CarOffersAppBar({
    super.key,
    required this.title,
  });

  final String title;

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
        color: CarOffersTheme.titleDark,
      ),
      title: Text(
        title,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        style: CarOffersTheme.appBarTitle,
      ),
      centerTitle: true,
    );
  }
}
