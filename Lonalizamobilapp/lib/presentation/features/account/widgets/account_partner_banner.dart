import 'package:flutter/material.dart';

import '../account_theme.dart';

class AccountPartnerBanner extends StatelessWidget {
  const AccountPartnerBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 12, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AccountTheme.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'انضم كشريك لوناليزا and grow your business',
                  style: AccountTheme.listTitle.copyWith(
                    fontSize: 15,
                    height: 1.35,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AccountTheme.primaryBlue,
                    side: const BorderSide(color: AccountTheme.primaryBlue, width: 1.2),
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text(
                    'Start Now',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 2,
            child: Container(
              height: 88,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AccountTheme.primaryBlue.withValues(alpha: 0.15),
                    const Color(0xFF93C5FD).withValues(alpha: 0.35),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Icon(Icons.public_rounded, size: 48, color: AccountTheme.primaryBlue.withValues(alpha: 0.5)),
                  Positioned(
                    bottom: 10,
                    child: Icon(Icons.handshake_rounded, size: 36, color: AccountTheme.primaryBlue.withValues(alpha: 0.85)),
                  ),
                  Positioned(
                    top: 12,
                    child: Icon(Icons.location_on_rounded, size: 22, color: Colors.red.shade400),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
