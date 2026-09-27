import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../providers/driver_session_provider.dart';

class DriverHomePage extends ConsumerWidget {
  const DriverHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final session = ref.watch(driverSessionProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.driverAppTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 88),
        children: [
          if (session.isPendingApproval)
            Card(
              color: AppColors.warning.withValues(alpha: 0.08),
              margin: const EdgeInsets.only(bottom: 16),
              child: ListTile(
                leading: const Icon(Icons.hourglass_top, color: AppColors.warning),
                title: Text(l10n.pendingApproval,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(l10n.pendingApprovalMsg),
              ),
            ),
          if (session.needsOnboarding)
            Card(
              color: AppColors.purple.withValues(alpha: 0.06),
              margin: const EdgeInsets.only(bottom: 16),
              child: ListTile(
                leading: const Icon(Icons.assignment_outlined, color: AppColors.purple),
                title: Text(l10n.completeOnboarding,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(l10n.onboardingCatalog),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/catalog'),
              ),
            ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppTheme.brandGradient,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(l10n.driverWelcome,
                    style: const TextStyle(color: Colors.white70, fontSize: 14)),
                const SizedBox(height: 4),
                Text(
                  session.profile?.displayName.isNotEmpty == true
                      ? session.profile!.displayName
                      : l10n.driverWorkspace,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _NavTile(
            icon: Icons.inbox_outlined,
            title: l10n.incomingOffers,
            subtitle: l10n.incomingOffersSub,
            onTap: () => context.push('/offers'),
          ),
          const SizedBox(height: 10),
          _NavTile(
            icon: Icons.local_taxi_outlined,
            title: l10n.activeTrips,
            subtitle: l10n.activeTripsSub,
            onTap: () => context.push('/trips'),
          ),
          const SizedBox(height: 10),
          _NavTile(
            icon: Icons.directions_car_outlined,
            title: l10n.fleet,
            subtitle: l10n.fleetSub,
            onTap: () => context.push('/fleet'),
          ),
          const SizedBox(height: 10),
          _NavTile(
            icon: Icons.storefront_outlined,
            title: l10n.catalog,
            subtitle: l10n.catalogSub,
            onTap: () => context.push('/catalog'),
          ),
          const SizedBox(height: 10),
          _NavTile(
            icon: Icons.price_change_outlined,
            title: l10n.routePricingTitle,
            subtitle: l10n.routePricingHint,
            onTap: () => context.push('/route-pricing'),
          ),
          const SizedBox(height: 10),
          _NavTile(
            icon: Icons.tour_outlined,
            title: l10n.tourOffersTitle,
            subtitle: l10n.toursTab,
            onTap: () => context.push('/tour-offers'),
          ),
          const SizedBox(height: 10),
          _NavTile(
            icon: Icons.payments_outlined,
            title: l10n.earnings,
            subtitle: l10n.earningsSub,
            onTap: () => context.push('/earnings'),
          ),
          const SizedBox(height: 10),
          _NavTile(
            icon: Icons.receipt_long_outlined,
            title: l10n.payouts,
            subtitle: l10n.payoutsSub,
            onTap: () => context.push('/payouts'),
          ),
          const SizedBox(height: 10),
          if (session.profile?.isCompany == true)
            _NavTile(
              icon: Icons.groups_outlined,
              title: l10n.subDriversTitle,
              subtitle: l10n.subDriversSub,
              onTap: () => context.push('/sub-drivers'),
            ),
          if (session.profile?.isCompany == true) const SizedBox(height: 10),
          _NavTile(
            icon: Icons.person_outline,
            title: l10n.profile,
            subtitle: l10n.profileSub,
            onTap: () => context.push('/profile'),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        backgroundColor: AppColors.purpleDark,
        indicatorColor: AppColors.gold.withValues(alpha: 0.3),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined, color: Colors.white70),
            selectedIcon: const Icon(Icons.home, color: AppColors.goldLight),
            label: l10n.driverAppTitle.split(' ').first,
          ),
          NavigationDestination(
            icon: const Icon(Icons.route_outlined, color: Colors.white70),
            selectedIcon: const Icon(Icons.route, color: AppColors.goldLight),
            label: l10n.activeTrips,
          ),
          NavigationDestination(
            icon: const Icon(Icons.payments_outlined, color: Colors.white70),
            selectedIcon: const Icon(Icons.payments, color: AppColors.goldLight),
            label: l10n.earnings,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline, color: Colors.white70),
            selectedIcon: const Icon(Icons.person, color: AppColors.goldLight),
            label: l10n.profile,
          ),
        ],
        onDestinationSelected: (index) {
          switch (index) {
            case 0:
              break;
            case 1:
              context.push('/trips');
            case 2:
              context.push('/earnings');
            case 3:
              context.push('/profile');
          }
        },
      ),
    );
  }
}

class _NavTile extends StatelessWidget {
  const _NavTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: AppColors.purple),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 15)),
                    const SizedBox(height: 2),
                    Text(subtitle,
                        style: const TextStyle(
                            color: AppColors.textMuted, fontSize: 13)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textMuted),
            ],
          ),
        ),
      ),
    );
  }
}
