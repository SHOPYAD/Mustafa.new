import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/router_providers.dart';
import 'home_service_category_tile.dart';

/// Primary + secondary service shortcuts (grid / rows).
class HomeServiceGrid extends ConsumerWidget {
  const HomeServiceGrid({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final navigationRepository = ref.watch(navigationRepositoryProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: HomeServiceCategoryTile(
                icon: Icons.flight_rounded,
                label: 'Flights',
                isFeatured: true,
                denseFeatured: true,
                onTap: navigationRepository.goFlights,
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: HomeServiceCategoryTile(
                icon: Icons.hotel_rounded,
                label: 'Hotels',
                isFeatured: true,
                denseFeatured: true,
                onTap: navigationRepository.goHotels,
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: HomeServiceCategoryTile(
                icon: Icons.directions_car_filled_rounded,
                label: 'Car',
                isFeatured: true,
                denseFeatured: true,
                onTap: navigationRepository.goCars,
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: HomeServiceCategoryTile(
                icon: Icons.airport_shuttle_rounded,
                label: 'Transfer\ncar',
                isFeatured: true,
                denseFeatured: true,
                onTap: () {},
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: HomeServiceCategoryTile(
                icon: Icons.card_travel_rounded,
                label: 'Package',
                isFeatured: true,
                denseFeatured: true,
                onTap: navigationRepository.goPackage,
              ),
            ),
          ],
        ),

      ],
    );
  }
}
