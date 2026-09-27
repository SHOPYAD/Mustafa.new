import 'package:flutter/material.dart';

import '../account_theme.dart';

/// Avatar + member text (+ manage link). Right: scan, support, settings.
/// Tapping the profile block opens sign-in / registration ([onProfileTap]).
class AccountPageHeader extends StatelessWidget {
  const AccountPageHeader({
    super.key,
    required this.onProfileTap,
    this.onManageAccountTap,
    this.onScanTap,
    this.onSupportTap,
    this.onSettingsTap,
  });

  final VoidCallback onProfileTap;
  /// When set, the "Manage my account" row uses this instead of [onProfileTap].
  final VoidCallback? onManageAccountTap;
  final VoidCallback? onScanTap;
  final VoidCallback? onSupportTap;
  final VoidCallback? onSettingsTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 8, 0, 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: onProfileTap,
                      borderRadius: BorderRadius.circular(40),
                      child: CircleAvatar(
                        radius: 26,
                        backgroundColor: AccountTheme.primaryBlue,
                        child: const Icon(Icons.person_rounded, color: Colors.white, size: 30),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: onProfileTap,
                            borderRadius: BorderRadius.circular(8),
                            child: Padding(
                              padding: const EdgeInsets.only(top: 2, bottom: 2, right: 4),
                              child: Text(
                                'Hi Trip.com Member',
                                style: AccountTheme.headerTitle.copyWith(fontSize: 16),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: onManageAccountTap ?? onProfileTap,
                            borderRadius: BorderRadius.circular(8),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 2),
                              child: Row(
                                children: [
                                  Text(
                                    'Manage my account',
                                    style: AccountTheme.manageLink.copyWith(color: AccountTheme.textSecondary),
                                  ),
                                  Icon(Icons.chevron_right_rounded, size: 18, color: Colors.grey.shade500),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            onPressed: onScanTap ?? () {},
            icon: Icon(Icons.qr_code_scanner_rounded, color: Colors.grey.shade800, size: 24),
            visualDensity: VisualDensity.compact,
          ),
          IconButton(
            onPressed: onSupportTap ?? () {},
            icon: Icon(Icons.headset_mic_outlined, color: Colors.grey.shade800, size: 24),
            visualDensity: VisualDensity.compact,
          ),
          IconButton(
            onPressed: onSettingsTap ?? () {},
            icon: Icon(Icons.settings_outlined, color: Colors.grey.shade800, size: 24),
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }
}
