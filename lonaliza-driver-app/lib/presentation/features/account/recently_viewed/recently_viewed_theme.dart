import 'package:flutter/material.dart';

import '../account_theme.dart';

abstract final class RecentlyViewedTheme {
  static const Color blue = AccountTheme.primaryBlueAlt;
  static const Color title = AccountTheme.textPrimary;
  static const Color body = AccountTheme.textBody;
  static const Color muted = AccountTheme.textSecondary;
  static const Color light = AccountTheme.textMuted;
  static const Color border = AccountTheme.border;
  static const Color badgeBg = Color(0xFF1E3A5F);
  static const Color star = Color(0xFFFFC107);

  static const TextStyle appBarTitle = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: title,
    letterSpacing: -0.35,
  );

  static const TextStyle tabActive = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w800,
    color: blue,
    height: 1.1,
  );

  static const TextStyle tabInactive = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: Color(0xFF9CA3AF),
    height: 1.1,
  );

  static const TextStyle dayHeader = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: title,
    height: 1.2,
  );

  static const TextStyle cardTitle = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w800,
    color: title,
    height: 1.25,
    letterSpacing: -0.15,
  );

  static const TextStyle ratingScore = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w800,
    color: blue,
    height: 1.2,
  );

  static const TextStyle ratingMeta = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: muted,
    height: 1.2,
  );

  static const TextStyle subLocation = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: muted,
    height: 1.25,
  );

  static const TextStyle datesLine = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: Color(0xFF9CA3AF),
    height: 1.3,
  );

  static const TextStyle badge = TextStyle(
    fontSize: 10,
    fontWeight: FontWeight.w800,
    color: Colors.white,
    letterSpacing: 0.2,
  );

  static const TextStyle footer = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: Color(0xFF9CA3AF),
    height: 1.45,
  );

  /// Location chips (second row under category tabs).
  static const Color cityChipActiveBg = Color(0xFFEFF6FF);
  static const Color cityChipActiveText = Color(0xFF2563EB);
  static const Color cityChipInactiveBorder = Color(0xFFE5E7EB);
  static const Color cityChipInactiveText = Color(0xFF4B5563);

  static const TextStyle cityChipActive = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w700,
    color: cityChipActiveText,
    height: 1.2,
  );

  static const TextStyle cityChipInactive = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: cityChipInactiveText,
    height: 1.2,
  );
}
