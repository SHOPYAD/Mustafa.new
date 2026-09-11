import 'package:flutter/material.dart';

import '../account_theme.dart';
import 'account_menu_tile.dart';
import 'account_section_header.dart';

class AccountMyPostsSection extends StatefulWidget {
  const AccountMyPostsSection({super.key});

  @override
  State<AccountMyPostsSection> createState() => _AccountMyPostsSectionState();
}

class _AccountMyPostsSectionState extends State<AccountMyPostsSection> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AccountSectionHeader(title: 'My posts', showTrailingChevron: true),
        const SizedBox(height: 4),
        Row(
          children: [
            _PostChip(
              label: 'Moments',
              selected: _tab == 0,
              onTap: () => setState(() => _tab = 0),
            ),
            const SizedBox(width: 8),
            _PostChip(
              label: 'Reviews',
              selected: _tab == 1,
              onTap: () => setState(() => _tab = 1),
            ),
            const SizedBox(width: 8),
            _PostChip(
              label: 'Travel Buddies',
              selected: _tab == 2,
              onTap: () => setState(() => _tab = 2),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
          decoration: BoxDecoration(
            color: AccountTheme.promoCardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFBFDBFE).withValues(alpha: 0.6)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.add_photo_alternate_outlined, color: AccountTheme.primaryBlue, size: 28),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text.rich(
                  TextSpan(
                    style: AccountTheme.listSubtitle.copyWith(color: AccountTheme.textBody, fontSize: 14),
                    children: const [
                      TextSpan(text: 'Post your first Trip Moments to earn '),
                      TextSpan(
                        text: '25 Trip Coins',
                        style: TextStyle(
                          color: AccountTheme.coinGold,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: () {},
                style: FilledButton.styleFrom(
                  backgroundColor: AccountTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Go', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        AccountMenuTile(
          icon: Icons.auto_fix_high_outlined,
          title: 'Creator center',
          iconColor: AccountTheme.textBody,
          dense: true,
          onTap: () {},
        ),
      ],
    );
  }
}

class _PostChip extends StatelessWidget {
  const _PostChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: selected ? AccountTheme.primaryBlue : AccountTheme.border,
                width: selected ? 1.5 : 1,
              ),
              color: selected ? AccountTheme.chipSelectedBg : Colors.white,
            ),
            alignment: Alignment.center,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: selected ? AccountTheme.primaryBlue : AccountTheme.textBody,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
