import 'package:flutter/material.dart';

import '../settings_theme.dart';

class SettingsSectionDivider extends StatelessWidget {
  const SettingsSectionDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Divider(
      height: 1,
      thickness: 1,
      color: SettingsTheme.sectionLine,
      indent: 20,
      endIndent: 0,
    );
  }
}
