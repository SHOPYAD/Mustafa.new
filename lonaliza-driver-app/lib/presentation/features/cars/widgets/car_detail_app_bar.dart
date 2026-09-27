import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../car_detail_theme.dart';

class CarDetailAppBar extends StatelessWidget implements PreferredSizeWidget {
  const CarDetailAppBar({
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
      elevation: 0.5,
      shadowColor: Colors.black12,
      leading: IconButton(
        onPressed: () => context.pop(),
        icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
        color: CarDetailTheme.titleDark,
      ),
      title: Text(
        title,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: CarDetailTheme.appBarTitle,
      ),
      actions: [
        IconButton(onPressed: () {}, icon: const Icon(Icons.favorite_border_rounded)),
        IconButton(onPressed: () {}, icon: const Icon(Icons.share_outlined)),
        IconButton(onPressed: () {}, icon: const Icon(Icons.more_horiz_rounded)),
      ],
    );
  }
}
