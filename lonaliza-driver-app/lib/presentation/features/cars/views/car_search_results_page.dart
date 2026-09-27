import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../car_detail_args.dart';
import '../car_search_results_args.dart';
import '../car_search_results_theme.dart';
import '../widgets/car_result_vehicle_card.dart';
import '../widgets/car_results_promo_strip.dart';
import '../widgets/car_search_results_top_block.dart';

class CarSearchResultsPage extends StatelessWidget {
  const CarSearchResultsPage({
    super.key,
    required this.args,
  });

  final CarSearchResultsArgs args;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CarSearchResultsTheme.pageBg,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          CarSearchResultsTopBlock(
            args: args,
            onEditSearch: () => Navigator.of(context).maybePop(),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.only(top: 8),
              children: [
                const CarResultsPromoStrip(),
                CarResultVehicleCard(
                  onTap: () => context.push(
                    '/cars/detail',
                    extra: CarDetailArgs.fromSearchCard(
                      title: 'Toyota Camry',
                      subtitle: 'or similar Mid-sized car',
                      pricePerDay: r'$29',
                      totalLabel: r'$86 Total',
                    ),
                  ),
                  title: 'Toyota Camry',
                  subtitle: 'or similar Mid-sized car',
                  passengers: 5,
                  bags: 2,
                  doors: 4,
                  transmission: 'Automatic',
                  shuttleLabel: 'Shuttle bus',
                  brandsLine: 'SIXT  ·  ACE  ·  +7',
                  pricePerDay: '\$29',
                  totalLabel: '\$86 Total',
                ),
                CarResultVehicleCard(
                  onTap: () => context.push(
                    '/cars/detail',
                    extra: CarDetailArgs.fromSearchCard(
                      title: 'Honda Civic',
                      subtitle: 'or similar Compact car',
                      pricePerDay: r'$32',
                      totalLabel: r'$96 Total',
                    ),
                  ),
                  title: 'Honda Civic',
                  subtitle: 'or similar Compact car',
                  passengers: 5,
                  bags: 2,
                  doors: 4,
                  transmission: 'Automatic',
                  shuttleLabel: 'Shuttle bus',
                  brandsLine: 'Alamo  ·  Budget  ·  +4',
                  pricePerDay: '\$32',
                  totalLabel: '\$96 Total',
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
