import 'package:flutter/material.dart';

import '../../account_theme.dart';
import '../manage_account_theme.dart';

/// Third-party linking section with badge, description, and brand rows.
class ManageAccountsCard extends StatelessWidget {
  const ManageAccountsCard({super.key});

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
      padding: const EdgeInsets.all(ManageAccountTheme.cardPad),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Flexible(
                child: Text('Manage accounts', style: ManageAccountTheme.sectionHeader),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: ManageAccountTheme.tealBadge,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  '👍 Easy Sign-in',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    height: 1.2,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            'Linking a third-party account enables quick sign-in using your account information.',
            style: ManageAccountTheme.bodySmall,
          ),
          const SizedBox(height: 16),
          const _SocialAccountRow(
            leading: _GoogleMark(),
            title: 'Google',
            linked: true,
          ),
          Divider(height: 1, thickness: 1, color: ManageAccountTheme.rowDivider),
          const _SocialAccountRow(
            leading: _FacebookMark(),
            title: 'Facebook',
            linked: false,
          ),
          Divider(height: 1, thickness: 1, color: ManageAccountTheme.rowDivider),
          const _SocialAccountRow(
            leading: _WeChatMark(),
            title: 'WeChat',
            linked: false,
          ),
        ],
      ),
    );
  }
}

class _SocialAccountRow extends StatelessWidget {
  const _SocialAccountRow({
    required this.leading,
    required this.title,
    required this.linked,
  });

  final Widget leading;
  final String title;
  final bool linked;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          leading,
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: ManageAccountTheme.rowLabel)),
          if (linked)
            _OutlineActionButton(label: 'Unlink', onPressed: () {})
          else
            _SolidActionButton(label: 'Link', onPressed: () {}),
        ],
      ),
    );
  }
}

class _SolidActionButton extends StatelessWidget {
  const _SolidActionButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        backgroundColor: AccountTheme.primaryBlueAlt,
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 8),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
    );
  }
}

class _OutlineActionButton extends StatelessWidget {
  const _OutlineActionButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: AccountTheme.primaryBlueAlt,
        side: const BorderSide(color: AccountTheme.primaryBlueAlt, width: 1.2),
        backgroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
    );
  }
}

class _GoogleMark extends StatelessWidget {
  const _GoogleMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: const Center(
        child: Text(
          'G',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF4285F4),
            height: 1,
          ),
        ),
      ),
    );
  }
}

class _FacebookMark extends StatelessWidget {
  const _FacebookMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        color: Color(0xFF1877F2),
      ),
      child: const Center(
        child: Text(
          'f',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: Colors.white,
            height: 1,
          ),
        ),
      ),
    );
  }
}

class _WeChatMark extends StatelessWidget {
  const _WeChatMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        color: Color(0xFF07C160),
      ),
      child: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 20),
    );
  }
}
