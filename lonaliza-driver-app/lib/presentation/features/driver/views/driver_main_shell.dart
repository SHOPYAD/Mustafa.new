import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../providers/driver_session_provider.dart';

class DriverMainShell extends ConsumerWidget {
  const DriverMainShell({super.key, required this.child});

  final Widget child;

  int _selectedIndex(String location) {
    if (location.startsWith('/trips')) return 1;
    if (location.startsWith('/earnings')) return 2;
    if (location.startsWith('/profile')) return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final location = GoRouterState.of(context).uri.path;
    final selected = _selectedIndex(location);
    final session = ref.watch(driverSessionProvider);
    final driverName = session.profile?.displayName.isNotEmpty == true
        ? session.profile!.displayName
        : l10n.driverWorkspace;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                gradient: AppTheme.brandGradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'VIP',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              l10n.dashboardTitle,
              style: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 17,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: AppColors.textPrimary),
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: AppColors.textSecondary),
            onPressed: () => context.push('/settings'),
          ),
          const SizedBox(width: 4),
        ],
      ),
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: SafeArea(
          child: Column(
            children: [
              // Executive Daylight Driver Header
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        gradient: AppTheme.brandGradient,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.purple.withValues(alpha: 0.25),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.shield_rounded,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  driverName,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textPrimary,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(
                                Icons.verified_rounded,
                                color: AppColors.emerald,
                                size: 16,
                              ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: AppColors.gold.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.star_rounded, color: AppColors.gold, size: 13),
                                    SizedBox(width: 3),
                                    Text(
                                      '4.98',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.goldDark,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'كابتن معتمد VIP',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.emerald,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Drawer Navigation List
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  children: [
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      child: Text(
                        'إدارة الخدمات والرحلات',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textMuted,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    _DrawerItem(
                      icon: Icons.map_rounded,
                      iconColor: AppColors.purple,
                      label: 'الخريطة المباشرة للأسطول (Live Map)',
                      isHighlight: true,
                      onTap: () => _go(context, '/live-map'),
                    ),
                    _DrawerItem(
                      icon: Icons.inbox_outlined,
                      iconColor: AppColors.purple,
                      label: l10n.incomingOffers,
                      onTap: () => _go(context, '/offers'),
                    ),
                    _DrawerItem(
                      icon: Icons.request_quote_outlined,
                      iconColor: AppColors.emerald,
                      label: 'طلبات عروض الأسعار (Bids)',
                      onTap: () => _go(context, '/quote-requests'),
                    ),
                    _DrawerItem(
                      icon: Icons.storefront_outlined,
                      iconColor: AppColors.blue,
                      label: l10n.catalog,
                      onTap: () => _go(context, '/catalog'),
                    ),
                    _DrawerItem(
                      icon: Icons.directions_car_outlined,
                      iconColor: AppColors.emerald,
                      label: l10n.fleet,
                      onTap: () => _go(context, '/fleet'),
                    ),
                    _DrawerItem(
                      icon: Icons.auto_awesome_rounded,
                      iconColor: AppColors.gold,
                      label: 'إضافة مركبة بالذكاء الاصطناعي (AI)',
                      onTap: () => _go(context, '/fleet/add'),
                    ),
                    _DrawerItem(
                      icon: Icons.explore_outlined,
                      iconColor: AppColors.amber,
                      label: 'تصميم جولة ذكية (AI Tour)',
                      onTap: () => _go(context, '/tours/create'),
                    ),
                    _DrawerItem(
                      icon: Icons.price_change_outlined,
                      iconColor: AppColors.purple,
                      label: l10n.routePricingTitle,
                      onTap: () => _go(context, '/route-pricing'),
                    ),
                    _DrawerItem(
                      icon: Icons.tour_outlined,
                      iconColor: AppColors.amber,
                      label: l10n.tourOffersTitle,
                      onTap: () => _go(context, '/tour-offers'),
                    ),
                    _DrawerItem(
                      icon: Icons.star_outline_rounded,
                      iconColor: AppColors.gold,
                      label: 'التقييمات وآراء العملاء',
                      onTap: () => _go(context, '/reviews'),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      child: Divider(height: 1),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: Text(
                        'المالية والحساب',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textMuted,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    _DrawerItem(
                      icon: Icons.receipt_long_outlined,
                      iconColor: AppColors.emerald,
                      label: l10n.payouts,
                      onTap: () => _go(context, '/payouts'),
                    ),
                    _DrawerItem(
                      icon: Icons.groups_outlined,
                      iconColor: AppColors.blue,
                      label: l10n.subDriversTitle,
                      onTap: () => _go(context, '/sub-drivers'),
                    ),
                    _DrawerItem(
                      icon: Icons.settings_outlined,
                      iconColor: AppColors.textSecondary,
                      label: l10n.settingsTitle,
                      onTap: () => _go(context, '/settings'),
                    ),
                  ],
                ),
              ),

              // Drawer Footer Badge
              Container(
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: AppColors.borderLight)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Lonaliza Captain VIP 2026/27',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textHint,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.emerald,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: AppColors.border, width: 0.8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: selected,
          backgroundColor: Colors.white,
          indicatorColor: AppColors.purpleMuted,
          height: 68,
          onDestinationSelected: (index) {
            switch (index) {
              case 0:
                context.go('/');
              case 1:
                context.go('/trips');
              case 2:
                context.go('/earnings');
              case 3:
                context.go('/profile');
            }
          },
          destinations: [
            NavigationDestination(
              icon: const Icon(Icons.dashboard_outlined),
              selectedIcon: const Icon(Icons.dashboard_rounded, color: AppColors.purple),
              label: l10n.dashboardTitle,
            ),
            NavigationDestination(
              icon: const Icon(Icons.route_outlined),
              selectedIcon: const Icon(Icons.route_rounded, color: AppColors.purple),
              label: l10n.activeTrips,
            ),
            NavigationDestination(
              icon: const Icon(Icons.payments_outlined),
              selectedIcon: const Icon(Icons.payments_rounded, color: AppColors.purple),
              label: l10n.earnings,
            ),
            NavigationDestination(
              icon: const Icon(Icons.person_outline),
              selectedIcon: const Icon(Icons.person_rounded, color: AppColors.purple),
              label: l10n.profile,
            ),
          ],
        ),
      ),
    );
  }

  void _go(BuildContext context, String path) {
    Navigator.of(context).pop();
    context.push(path);
  }
}

class _DrawerItem extends StatelessWidget {
  const _DrawerItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.iconColor = AppColors.purple,
    this.isHighlight = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color iconColor;
  final bool isHighlight;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 2.5),
      child: Material(
        color: isHighlight ? AppColors.gold.withValues(alpha: 0.08) : Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: iconColor, size: 20),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isHighlight ? FontWeight.w800 : FontWeight.w600,
                      color: isHighlight ? AppColors.goldDark : AppColors.textPrimary,
                    ),
                  ),
                ),
                Icon(
                  Icons.chevron_left_rounded, // Arabic RTL arrow
                  size: 18,
                  color: isHighlight ? AppColors.gold : AppColors.textHint,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
