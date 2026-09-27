import 'package:flutter/material.dart';

/// Bottom navigation (Home, Messages, Post, Trips, Account).
class HomeBottomNav extends StatelessWidget {
  const HomeBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.showBackToTop = false,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;
  final bool showBackToTop;

  @override
  Widget build(BuildContext context) {
    const blue = Color(0xFF0068E0);
    const yellow = Color(0xFFFFC107);

    return NavigationBar(
      height: 64,
      backgroundColor: Colors.white,
      selectedIndex: currentIndex,
      onDestinationSelected: onTap,
      indicatorColor: showBackToTop && currentIndex == 0
          ? Colors.transparent
          : blue.withValues(alpha: 0.15),
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      destinations: [
        NavigationDestination(
          icon: showBackToTop
              ? const _BackToTopIcon(backgroundColor: yellow)
              : const Icon(Icons.home_outlined),
          selectedIcon: showBackToTop
              ? const _BackToTopIcon(backgroundColor: yellow)
              : const Icon(Icons.home_rounded, color: blue),
          label: showBackToTop ? 'Back to top' : 'Home',
        ),
        const NavigationDestination(
          icon: Icon(Icons.mail_outline_rounded),
          selectedIcon: Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(Icons.mail_rounded, color: blue),
              Positioned(
                top: -2,
                right: -2,
                child: Icon(Icons.circle, size: 10, color: yellow),
              ),
            ],
          ),
          label: 'Messages',
        ),
        const NavigationDestination(
          icon: Icon(Icons.add_circle_outline_rounded),
          selectedIcon: Icon(Icons.add_circle_rounded, color: blue),
          label: 'Post',
        ),
        const NavigationDestination(
          icon: Icon(Icons.work_outline_rounded),
          selectedIcon: Icon(Icons.work_rounded, color: blue),
          label: 'My Trips',
        ),
        const NavigationDestination(
          icon: Icon(Icons.person_outline_rounded),
          selectedIcon: Icon(Icons.person_rounded, color: blue),
          label: 'Account',
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
