import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/router_providers.dart';
import '../widgets/flights_hero_header.dart';
import '../widgets/flights_inspiration_section.dart';
import '../widgets/flights_promo_card.dart';
import '../widgets/flights_quick_actions_row.dart';
import '../widgets/flights_search_card.dart';

class FlightsPage extends ConsumerWidget {
  const FlightsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final navigationRepository = ref.watch(navigationRepositoryProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          const FlightsHeroHeader(),
          Transform.translate(
            offset: const Offset(0, -22),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  FlightsSearchCard(
                    onSearch: navigationRepository.goFlightsSearch,
                  ),
                  const SizedBox(height: 16),
                  const FlightsQuickActionsRow(),
                  const SizedBox(height: 16),
                  const FlightsPromoCard(),
                  const SizedBox(height: 22),
                  const FlightsInspirationSection(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
