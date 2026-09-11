import 'package:flutter/material.dart';

import '../../../../core/theme/lonaliza_theme.dart';

class TransfersPage extends StatelessWidget {
  const TransfersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LonalizaColors.daytimeWhite,
      appBar: AppBar(title: const Text('Transfers')),
      body: const Center(
        child: Text('Airport transfers will load from the live Lonaliza catalog.'),
      ),
    );
  }
}
