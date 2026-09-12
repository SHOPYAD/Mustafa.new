import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/bootstrap/app_bootstrap.dart';
import '../../../providers/bootstrap_provider.dart';
import '../../../providers/router_providers.dart';
import 'home_service_category_tile.dart';

class HomeServiceGrid extends ConsumerWidget {
  const HomeServiceGrid({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final navigationRepository = ref.watch(navigationRepositoryProvider);
    final bootstrap = ref.watch(bootstrapProvider);

    return bootstrap.when(
      loading: () => const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (_, _) => const SizedBox.shrink(),
      data: (config) {
        final tiles = <(AppSurface, IconData, String, VoidCallback)>[];
        for (final surface in config.surfaces) {
          if (surface.key.isEmpty) continue;
          if (surface.key.startsWith('account-') ||
              const {
                'blog',
                'about',
                'contact',
                'privacy',
                'terms',
                'gdpr',
              }.contains(surface.key)) {
            continue;
          }
          tiles.add((
            surface,
            _iconFor(surface.key),
            _labelFor(surface.key),
            () => _open(context, navigationRepository, surface),
          ));
        }
        if (tiles.isEmpty) return const SizedBox.shrink();
        return Wrap(
          spacing: 4,
          runSpacing: 4,
          children: [
            for (final tile in tiles)
              SizedBox(
                width: 72,
                child: HomeServiceCategoryTile(
                  icon: tile.$2,
                  label: tile.$3,
                  isFeatured: true,
                  denseFeatured: true,
                  onTap: tile.$4,
                ),
              ),
          ],
        );
      },
    );
  }

  void _open(BuildContext context, dynamic nav, AppSurface surface) {
    switch (surface.key) {
      case 'flight':
        nav.goFlights();
        return;
      case 'hotel':
        nav.goHotels();
        return;
      case 'cars':
        context.push('/cars');
        return;
      case 'transfers':
        nav.goTransfers();
        return;
      case 'holiday':
        context.push('/catalog/packages');
        return;
      case 'tours':
        context.push('/catalog/tours');
        return;
      case 'ai-chat':
        context.push('/ai');
        return;
      case 'community':
        context.push('/community');
        return;
      case 'reels':
        context.push('/community/reels');
        return;
      default:
        context.push('/ai');
    }
  }

  IconData _iconFor(String key) {
    return switch (key) {
      'flight' => Icons.flight_rounded,
      'hotel' => Icons.hotel_rounded,
      'cars' => Icons.directions_car_filled_rounded,
      'transfers' => Icons.airport_shuttle_rounded,
      'holiday' => Icons.card_travel_rounded,
      'tours' => Icons.explore_rounded,
      'visa' => Icons.badge_rounded,
      'insurance' => Icons.health_and_safety_rounded,
      'offers' => Icons.local_offer_rounded,
      'ai-chat' => Icons.smart_toy_rounded,
      'community' => Icons.groups_rounded,
      'reels' => Icons.movie_rounded,
      'blog' => Icons.article_rounded,
      'contact' => Icons.support_agent_rounded,
      _ => Icons.open_in_new_rounded,
    };
  }

  String _labelFor(String key) {
    return switch (key) {
      'flight' => 'طيران',
      'hotel' => 'فنادق',
      'cars' => 'سيارات',
      'transfers' => 'ترانسفير',
      'holiday' => 'باقات',
      'tours' => 'رحلات',
      'visa' => 'تأشيرة',
      'insurance' => 'تأمين',
      'offers' => 'عروض',
      'ai-chat' => 'المساعد',
      'community' => 'مجتمع',
      'reels' => 'ريلز',
      'blog' => 'المدونة',
      'about' => 'من نحن',
      'contact' => 'تواصل',
      'privacy' => 'الخصوصية',
      'terms' => 'الشروط',
      'gdpr' => 'GDPR',
      'account-social' => 'اجتماعي',
      'account-chats' => 'محادثات',
      'account-programs' => 'برامج',
      _ => key,
    };
  }
}
