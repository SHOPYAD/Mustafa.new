import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/lonaliza_theme.dart';

/// Bottom navigation: Home / Bookings / Community / Inbox / Account.
class HomeBottomNav extends StatelessWidget {
  const HomeBottomNav({
    super.key,
    required this.currentIndex,
    this.onTap,
    this.showBackToTop = false,
  });

  final int currentIndex;
  final ValueChanged<int>? onTap;
  final bool showBackToTop;

  static void goToIndex(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
      case 1:
        context.go('/my-trips');
      case 2:
        context.go('/community');
      case 3:
        context.go('/messages');
      case 4:
        context.go('/account');
    }
  }

  @override
  Widget build(BuildContext context) {
    const purple = LonalizaColors.primary;
    const amber = LonalizaColors.amber;

    return NavigationBar(
      height: 64,
      backgroundColor: Colors.white,
      selectedIndex: currentIndex,
      onDestinationSelected: onTap ?? (index) => goToIndex(context, index),
      indicatorColor: showBackToTop && currentIndex == 0
          ? Colors.transparent
          : purple.withValues(alpha: 0.15),
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      destinations: [
        NavigationDestination(
          icon: showBackToTop
              ? const _BackToTopIcon(backgroundColor: amber)
              : const Icon(Icons.home_outlined),
          selectedIcon: showBackToTop
              ? const _BackToTopIcon(backgroundColor: amber)
              : const Icon(Icons.home_rounded, color: purple),
          label: showBackToTop ? 'للأعلى' : 'الرئيسية',
        ),
        const NavigationDestination(
          icon: Icon(Icons.luggage_outlined),
          selectedIcon: Icon(Icons.luggage_rounded, color: purple),
          label: 'حجوزاتي',
        ),
        const NavigationDestination(
          icon: Icon(Icons.groups_outlined),
          selectedIcon: Icon(Icons.groups_rounded, color: purple),
          label: 'مجتمع',
        ),
        const NavigationDestination(
          icon: Icon(Icons.mail_outline_rounded),
          selectedIcon: Icon(Icons.mail_rounded, color: purple),
          label: 'رسائل',
        ),
        const NavigationDestination(
          icon: Icon(Icons.person_outline_rounded),
          selectedIcon: Icon(Icons.person_rounded, color: purple),
          label: 'حسابي',
        ),
      ],
    );
  }
}

class _BackToTopIcon extends StatelessWidget {
  const _BackToTopIcon({required this.backgroundColor});

  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        color: backgroundColor,
        shape: BoxShape.circle,
      ),
      child: const Icon(
        Icons.arrow_upward_rounded,
        size: 14,
        color: Colors.white,
      ),
    );
  }
}
