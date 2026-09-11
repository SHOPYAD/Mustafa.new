import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/bootstrap_provider.dart';
import '../../../providers/router_providers.dart';
import 'home_service_category_tile.dart';

class _ServiceTile {
  const _ServiceTile({
    required this.keyName,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final String keyName;
  final IconData icon;
  final String label;
  final VoidCallback onTap;
}

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
        final catalog = <_ServiceTile>[
          _ServiceTile(
            keyName: 'flight',
            icon: Icons.flight_rounded,
            label: 'Flights',
            onTap: navigationRepository.goFlights,
          ),
          _ServiceTile(
            keyName: 'hotel',
            icon: Icons.hotel_rounded,
            label: 'Hotels',
            onTap: navigationRepository.goHotels,
          ),
          _ServiceTile(
            keyName: 'cars',
            icon: Icons.directions_car_filled_rounded,
            label: 'Cars',
            onTap: navigationRepository.goCars,
          ),
          _ServiceTile(
            keyName: 'transfers',
            icon: Icons.airport_shuttle_rounded,
            label: 'Transfer',
            onTap: navigationRepository.goTransfers,
          ),
          _ServiceTile(
            keyName: 'holiday',
            icon: Icons.card_travel_rounded,
            label: 'Holiday',
            onTap: navigationRepository.goPackage,
          ),
          _ServiceTile(
            keyName: 'tours',
            icon: Icons.explore_rounded,
            label: 'Tours',
            onTap: navigationRepository.goPackage,
          ),
        ];
        final visible = catalog.where((tile) => config.isServiceEnabled(tile.keyName)).toList();
        if (visible.isEmpty) {
          return const SizedBox.shrink();
        }
        return Wrap(
          spacing: 4,
          runSpacing: 4,
          children: [
            for (final tile in visible)
              SizedBox(
                width: 72,
                child: HomeServiceCategoryTile(
                  icon: tile.icon,
                  label: tile.label,
                  isFeatured: true,
                  denseFeatured: true,
                  onTap: tile.onTap,
                ),
              ),
          ],
        );
      },
    );
  }
}
