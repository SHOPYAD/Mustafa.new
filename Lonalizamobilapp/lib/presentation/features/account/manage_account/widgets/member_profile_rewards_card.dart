import 'package:flutter/material.dart';

import '../../account_theme.dart';
import '../manage_account_theme.dart';

/// Light blue bordered card: Member Profile + REWARDS + copy + inner white field + Edit.
class MemberProfileRewardsCard extends StatelessWidget {
  const MemberProfileRewardsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(ManageAccountTheme.cardRadius),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            ManageAccountTheme.memberCardBg0,
            ManageAccountTheme.memberCardBg1,
          ],
        ),
        border: Border.all(color: ManageAccountTheme.memberCardBorder, width: 1),
        boxShadow: const [
          BoxShadow(color: ManageAccountTheme.cardShadow, blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      padding: const EdgeInsets.all(ManageAccountTheme.cardPad),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Expanded(
                child: Text('Member Profile', style: ManageAccountTheme.sectionHeaderBlue),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.star_rounded, size: 16, color: Colors.amber.shade600),
                  const SizedBox(width: 4),
                  Text('REWARDS', style: ManageAccountTheme.rewardsWordmark),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            'Add your legal name and date of birth to complete your member profile and be eligible '
            'for membership rewards or upgrades. Please make sure your info matches your travel ID.',
            style: ManageAccountTheme.bodySmall,
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: ManageAccountTheme.rowDivider),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Legal name', style: ManageAccountTheme.placeholderSmall),
                      SizedBox(height: 6),
                      Text('Date of Birth', style: ManageAccountTheme.placeholderSmall),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Material(
                  color: AccountTheme.primaryBlueAlt,
                  borderRadius: BorderRadius.circular(8),
                  child: InkWell(
                    onTap: () {},
                    borderRadius: BorderRadius.circular(8),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      child: Text(
                        'Edit',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
