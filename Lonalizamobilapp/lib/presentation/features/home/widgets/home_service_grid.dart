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
        context.push('/catalog/cars');
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
      default:
        final path = surface.path ?? '/ai-chat';
        context.push('/site?path=${Uri.encodeQueryComponent(path)}');
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
      'flight' => 'Flights',
      'hotel' => 'Hotels',
      'cars' => 'Cars',
      'transfers' => 'Transfer',
      'holiday' => 'Holiday',
      'tours' => 'Tours',
      'visa' => 'Visa',
      'insurance' => 'Insurance',
      'offers' => 'Offers',
      'ai-chat' => 'AI',
      'community' => 'Community',
      'reels' => 'Reels',
      'blog' => 'Blog',
      'about' => 'About',
      'contact' => 'Contact',
      'privacy' => 'Privacy',
      'terms' => 'Terms',
      'gdpr' => 'GDPR',
      'account-social' => 'Social',
      'account-chats' => 'Chats',
      'account-programs' => 'Programs',
      _ => key,
    };
  }
}
