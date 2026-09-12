import 'package:flutter/material.dart';

import '../widgets/hotels_deals_section.dart';
import '../widgets/hotels_hero_header.dart';
import '../widgets/hotels_new_user_benefits_card.dart';
import '../widgets/hotels_quick_actions_row.dart';
import '../widgets/hotels_search_card.dart';
import '../widgets/hotels_shortcuts_sheet.dart';
import '../widgets/hotels_why_book_section.dart';

class HotelsPage extends StatefulWidget {
  const HotelsPage({super.key});

  @override
  State<HotelsPage> createState() => _HotelsPageState();
}

class _HotelsPageState extends State<HotelsPage> {
  final ScrollController _scrollController = ScrollController();

  Future<void> _showShortcutsSheet() {
    return showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.38),
      isScrollControlled: true,
      builder: (context) => const HotelsShortcutsSheet(),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: ListView(
        controller: _scrollController,
        padding: EdgeInsets.zero,
        children: [
          HotelsHeroHeader(onMoreTap: _showShortcutsSheet),
          Transform.translate(
            offset: const Offset(0, -20),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const HotelsSearchCard(),
                  SizedBox(height: 16),
                  const HotelsQuickActionsRow(),
                  SizedBox(height: 18),
                  const HotelsNewUserBenefitsCard(),
                  SizedBox(height: 18),
                  const HotelsDealsSection(),
                  SizedBox(height: 24),
                  const HotelsWhyBookSection(),
                  SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
