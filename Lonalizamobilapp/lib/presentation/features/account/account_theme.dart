import 'package:flutter/material.dart';

/// Lonaliza–style account / profile colors and text styles.
abstract final class AccountTheme {
  static const Color primaryBlue = Color(0xFF7C3AED);
  static const Color primaryBlueAlt = Color(0xFF7C3AED);
  static const Color textPrimary = Color(0xFF111827);
  static const Color textBody = Color(0xFF333333);
  static const Color textMuted = Color(0xFF888888);
  static const Color textSecondary = Color(0xFF757575);
  static const Color border = Color(0xFFE5E7EB);
  static const Color chipSelectedBg = Color(0xFFE8EEFB);
  static const Color promoCardBg = Color(0xFFEFF6FF);
  static const Color coinGold = Color(0xFFB45309);
  static const Color promoPink = Color(0xFFFF4D6A);
  static const Color coinYellow = Color(0xFFFFB800);

  static const TextStyle headerTitle = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w800,
    color: textPrimary,
    height: 1.2,
    letterSpacing: -0.2,
  );

  static const TextStyle manageLink = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: textMuted,
    height: 1.2,
  );

  static const TextStyle sectionTitle = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w800,
    color: textPrimary,
    height: 1.2,
  );

  static const TextStyle listTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: textBody,
    height: 1.25,
  );

  static const TextStyle listSubtitle = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: textMuted,
    height: 1.3,
  );

  static const TextStyle trustCaption = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: textSecondary,
  );
}
