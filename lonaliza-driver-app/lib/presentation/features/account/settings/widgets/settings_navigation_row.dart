import 'package:flutter/material.dart';

import '../settings_theme.dart';

class SettingsNavigationRow extends StatelessWidget {
  const SettingsNavigationRow({
    super.key,
    required this.label,
    this.onTap,
  });

  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      child: InkWell(
        onTap: onTap ?? () {},
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(label, style: SettingsTheme.labelStyle),
          ),
        ),
      ),
    );
  }
}
