import 'package:flutter/material.dart';

import '../account_theme.dart';

/// Trip-style manage account / user profile screens.
abstract final class ManageAccountTheme {
  static const Color pageBg = Color(0xFFF2F4F8);
  static const Color cardShadow = Color(0x14000000);
  static const Color rowDivider = Color(0xFFEEEEEE);
  static const Color insetDivider = Color(0xFFE8E8E8);
  static const Color memberCardBorder = Color(0xFFC7D6F5);
  static const Color memberCardBg0 = Color(0xFFEEF4FF);
  static const Color memberCardBg1 = Color(0xFFF8FAFF);
  static const Color rewardsFade = Color(0xFF9DB4E8);
  static const Color tealBadge = Color(0xFF0D9488);
  static const Color headerGradientTop = Color(0xFFE8EEFB);
  static const Color headerGradientBottom = Color(0xFFFFFFFF);

  static const TextStyle appBarTitle = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: AccountTheme.textPrimary,
    letterSpacing: -0.3,
    height: 1.2,
  );

  static const TextStyle sectionHeader = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w800,
    color: AccountTheme.textPrimary,
    height: 1.2,
  );

  static const TextStyle sectionHeaderBlue = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w800,
    color: AccountTheme.primaryBlueAlt,
    height: 1.2,
  );

  static const TextStyle rowLabel = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w500,
    color: AccountTheme.textBody,
    height: 1.25,
  );

  static const TextStyle rowValue = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: AccountTheme.textSecondary,
    height: 1.25,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AccountTheme.textSecondary,
    height: 1.45,
  );

  static const TextStyle placeholderSmall = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AccountTheme.textMuted,
    height: 1.3,
  );

  static const TextStyle rewardsWordmark = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w800,
    letterSpacing: 1.2,
    color: rewardsFade,
  );

  static const TextStyle disclaimer = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AccountTheme.textMuted,
    height: 1.4,
  );

  static const TextStyle linkBlue = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: AccountTheme.primaryBlueAlt,
    height: 1.2,
  );

  static const double cardRadius = 12;
  static const double cardPad = 16;
  static const double iconBox = 24;
}
