import 'package:flutter/material.dart';

import '../../account_theme.dart';
import '../manage_account_theme.dart';
import 'manage_account_icon_row.dart';

/// "Personal Info" card with header Edit action and inset dividers between rows.
class PersonalInfoCard extends StatelessWidget {
  const PersonalInfoCard({super.key});

  static const double _indent = ManageAccountTheme.cardPad + ManageAccountTheme.iconBox + 12;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(ManageAccountTheme.cardRadius),
        boxShadow: const [
          BoxShadow(color: ManageAccountTheme.cardShadow, blurRadius: 10, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              ManageAccountTheme.cardPad,
              ManageAccountTheme.cardPad,
              ManageAccountTheme.cardPad,
              8,
            ),
            child: Row(
              children: [
                const Expanded(child: Text('Personal Info', style: ManageAccountTheme.sectionHeader)),
                InkWell(
                  onTap: () {},
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.edit_outlined, size: 18, color: AccountTheme.primaryBlueAlt),
                        const SizedBox(width: 4),
                        Text('Edit', style: ManageAccountTheme.linkBlue),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, thickness: 1, color: ManageAccountTheme.rowDivider),
          ManageAccountIconRow(
            icon: Icons.favorite_border_rounded,
            label: 'Display name',
            value: '-',
            dividerIndent: _indent,
            onTap: () {},
          ),
          ManageAccountIconRow(
            icon: Icons.people_outline_rounded,
            label: 'Gender',
            value: '-',
            dividerIndent: _indent,
            onTap: () {},
          ),
          ManageAccountIconRow(
            icon: Icons.public_rounded,
            label: 'Country or Region',
            value: '-',
            dividerIndent: _indent,
            onTap: () {},
          ),
          ManageAccountIconRow(
            icon: Icons.apartment_outlined,
            label: 'City of Residence',
            value: '-',
            dividerIndent: _indent,
            onTap: () {},
          ),
          ManageAccountIconRow(
            icon: Icons.map_outlined,
            label: 'Frequently visited city',
            value: '-',
            onTap: () {},
          ),
          const SizedBox(height: 4),
        ],
      ),
    );
  }
}
