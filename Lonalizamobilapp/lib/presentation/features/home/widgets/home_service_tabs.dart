import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/router_providers.dart';

class HomeServiceTab {
  const HomeServiceTab({
    required this.keyName,
    required this.label,
    required this.icon,
    required this.agentTab,
    required this.onOpen,
  });

  final String keyName;
  final String label;
  final IconData icon;
  final String agentTab;
  final void Function(BuildContext context, WidgetRef ref) onOpen;
}

const homeSearchTabs = <HomeServiceTab>[
  HomeServiceTab(
    keyName: 'flight',
    label: 'طيران',
    icon: Icons.flight_rounded,
    agentTab: 'flight',
    onOpen: _goFlights,
  ),
  HomeServiceTab(
    keyName: 'hotel',
    label: 'فنادق',
    icon: Icons.hotel_rounded,
    agentTab: 'hotel',
    onOpen: _goHotels,
  ),
  HomeServiceTab(
    keyName: 'holiday',
    label: 'باقات',
    icon: Icons.card_travel_rounded,
    agentTab: 'holiday',
    onOpen: _goPackages,
  ),
  HomeServiceTab(
    keyName: 'cars',
    label: 'سيارات',
    icon: Icons.directions_car_filled_rounded,
    agentTab: 'cars',
    onOpen: _goCars,
  ),
  HomeServiceTab(
    keyName: 'transfers',
    label: 'ترانسفير',
    icon: Icons.airport_shuttle_rounded,
    agentTab: 'transfers',
    onOpen: _goTransfers,
  ),
];

void _goFlights(BuildContext context, WidgetRef ref) {
  ref.read(navigationRepositoryProvider).goFlights();
}

void _goHotels(BuildContext context, WidgetRef ref) {
  ref.read(navigationRepositoryProvider).goHotels();
}

void _goPackages(BuildContext context, WidgetRef ref) {
  context.push('/catalog/packages');
}

void _goCars(BuildContext context, WidgetRef ref) {
  context.push('/cars');
}

void _goTransfers(BuildContext context, WidgetRef ref) {
  ref.read(navigationRepositoryProvider).goTransfers();
}

class HomeServiceTabs extends ConsumerWidget {
  const HomeServiceTabs({
    super.key,
    required this.activeKey,
    required this.onChanged,
  });

  final String activeKey;
  final ValueChanged<HomeServiceTab> onChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final tab in homeSearchTabs)
            Padding(
              padding: const EdgeInsetsDirectional.only(end: 8),
              child: ChoiceChip(
                selected: tab.keyName == activeKey,
                label: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(tab.icon, size: 16),
                    const SizedBox(width: 6),
                    Text(tab.label),
                  ],
                ),
                selectedColor: LonalizaColors.royalPurple,
                labelStyle: TextStyle(
                  color: tab.keyName == activeKey ? Colors.white : LonalizaColors.ink,
                  fontWeight: FontWeight.w800,
                ),
                backgroundColor: const Color(0xFFF3E8FF),
                side: BorderSide.none,
                onSelected: (_) => onChanged(tab),
              ),
            ),
        ],
      ),
    );
  }
}
