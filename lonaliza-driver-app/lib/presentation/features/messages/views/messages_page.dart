import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/router_providers.dart';
import '../../home/widgets/home_bottom_nav.dart';
import '../widgets/messages_header.dart';
import '../widgets/messages_empty_state.dart';

class MessagesPage extends ConsumerStatefulWidget {
  const MessagesPage({super.key});

  @override
  ConsumerState<MessagesPage> createState() => _MessagesPageState();
}

class _MessagesPageState extends ConsumerState<MessagesPage> {
  void _handleBottomNavTap(int index) {
    if (index == 0) {
      ref.read(navigationRepositoryProvider).goHome();
    } else if (index == 1) {
      ref.read(navigationRepositoryProvider).goMessages();
    } else if (index == 3) {
      ref.read(navigationRepositoryProvider).goMyTrips();
    } else if (index == 4) {
      ref.read(navigationRepositoryProvider).goAccount();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: Column(
        children: const [
          MessagesHeader(),
          Expanded(
            child: MessagesEmptyState(),
          ),
        ],
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: 1, // 1 is Messages tab
        onTap: _handleBottomNavTap,
      ),
    );
  }
}
