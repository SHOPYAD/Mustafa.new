import 'package:flutter/material.dart';

import '../account_theme.dart';

class AccountMembershipRow extends StatelessWidget {
  const AccountMembershipRow({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.only(right: 4),
        children: const [
          _MembershipCard(
            icon: Icons.shield_outlined,
            title: 'Silver',
            subtitle: 'You have 3 exclusive rewards',
          ),
          SizedBox(width: 10),
          _MembershipCard(
            icon: Icons.flag_outlined,
            title: 'Earn نقاط لوناليزا',
            subtitle: 'Book to earn rewards',
          ),
          SizedBox(width: 10),
          _MembershipCard(
            icon: Icons.hotel_outlined,
            title: 'Hotel Member Deals',
            subtitle: 'Members save more',
          ),
        ],
      ),
    );
  }
}

class _MembershipCard extends StatelessWidget {
  const _MembershipCard({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 200,
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AccountTheme.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFE8EEFB),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AccountTheme.primaryBlueAlt, size: 22),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AccountTheme.listTitle.copyWith(fontSize: 15)),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: AccountTheme.listSubtitle.copyWith(fontSize: 12),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
