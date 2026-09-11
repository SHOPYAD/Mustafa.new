import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../my_cards_theme.dart';
import '../widgets/my_cards_add_card_button.dart';
import '../widgets/my_cards_add_card_sheet.dart';
import '../widgets/my_cards_china_promo_banner.dart';
import '../widgets/my_cards_empty_state.dart';
import '../widgets/my_cards_tab_bar.dart';

class MyCardsPage extends StatefulWidget {
  const MyCardsPage({super.key});

  @override
  State<MyCardsPage> createState() => _MyCardsPageState();
}

class _MyCardsPageState extends State<MyCardsPage> {
  int _tabIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        surfaceTintColor: Colors.transparent,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.grey.shade900),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shield_outlined, size: 22, color: MyCardsTheme.navy),
            const SizedBox(width: 8),
            Text('My Cards', style: MyCardsTheme.appBarTitle),
          ],
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 8),
          MyCardsTabBar(
            selectedIndex: _tabIndex,
            onChanged: (i) => setState(() => _tabIndex = i),
          ),
          Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
          Expanded(
            child: _tabIndex == 0
                ? const MyCardsEmptyState()
                : Center(
                    child: Text(
                      'No other payment methods',
                      style: MyCardsTheme.emptyTitle,
                    ),
                  ),
          ),
          const MyCardsChinaPromoBanner(),
          MyCardsAddCardButton(
            onPressed: () => MyCardsAddCardSheet.show(context),
          ),
        ],
      ),
    );
  }
}
