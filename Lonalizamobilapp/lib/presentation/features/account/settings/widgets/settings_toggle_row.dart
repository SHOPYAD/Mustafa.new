import 'package:flutter/cupertino.dart';

import '../settings_theme.dart';

class SettingsToggleRow extends StatelessWidget {
  const SettingsToggleRow({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
      child: Row(
        children: [
          Expanded(child: Text(label, style: SettingsTheme.labelStyle)),
          CupertinoSwitch(
            value: value,
            onChanged: onChanged,
            activeTrackColor: SettingsTheme.trackBlue,
            inactiveTrackColor: const Color(0xFFE5E7EB),
          ),
        ],
      ),
    );
  }
}
