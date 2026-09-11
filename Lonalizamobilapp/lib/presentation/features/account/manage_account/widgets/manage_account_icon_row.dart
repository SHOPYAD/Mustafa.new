import 'package:flutter/material.dart';

import '../manage_account_theme.dart';

/// Row with outline icon, label, optional value, optional chevron, optional custom trailing.
class ManageAccountIconRow extends StatelessWidget {
  const ManageAccountIconRow({
    super.key,
    required this.icon,
    required this.label,
    this.value,
    this.showChevron = false,
    this.trailing,
    this.onTap,
    this.dividerIndent,
  });

  final IconData icon;
  final String label;
  final String? value;
  final bool showChevron;
  final Widget? trailing;
  final VoidCallback? onTap;
  /// When set, a bottom divider is shown inset from the left (after icon column).
  final double? dividerIndent;

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: ManageAccountTheme.cardPad,
        vertical: 14,
      ),
      child: Row(
        children: [
          Icon(icon, size: ManageAccountTheme.iconBox, color: Colors.grey.shade800),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: ManageAccountTheme.rowLabel)),
          if (value != null) ...[
            Flexible(
              child: Text(
                value!,
                textAlign: TextAlign.end,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: ManageAccountTheme.rowValue,
              ),
            ),
            const SizedBox(width: 6),
          ],
          ?trailing,
          if (showChevron)
            Icon(Icons.chevron_right_rounded, size: 22, color: Colors.grey.shade400),
        ],
      ),
    );

    final inner = onTap != null
        ? Material(
            color: Colors.transparent,
            child: InkWell(onTap: onTap, child: content),
          )
        : content;

    if (dividerIndent == null) return inner;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        inner,
        Divider(height: 1, thickness: 1, color: ManageAccountTheme.insetDivider, indent: dividerIndent),
      ],
    );
  }
}
