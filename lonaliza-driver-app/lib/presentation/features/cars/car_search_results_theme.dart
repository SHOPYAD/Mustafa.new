import 'package:flutter/material.dart';

abstract final class CarSearchResultsTheme {
  static const Color pageBg = Color(0xFFF2F4F8);
  static const Color primaryBlue = Color(0xFF2B64E3);
  /// Navy for filter labels / icons (reference).
  static const Color navy = Color(0xFF1E3A5A);
  static const Color titleDark = Color(0xFF111827);
  static const Color metaGrey = Color(0xFF6B7280);
  static const Color chipBorder = Color(0xFFD1D5DB);
  static const Color pillBorder = Color(0xFFE2E8F0);
  static const Color tealBadge = Color(0xFF0D9488);
  static const Color tealBadgeSoft = Color(0xFFCCFBF1);
  static const Color promoPink = Color(0xFFFF4D6A);
  static const Color promoBg = Color(0xFFFFF0F3);

  static const TextStyle headerLocation = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.2,
  );

  static const TextStyle headerDates = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: metaGrey,
    height: 1.25,
  );

  static const TextStyle cardTitle = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.2,
  );

  static const TextStyle cardSubtitle = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: metaGrey,
    height: 1.25,
  );

  static const TextStyle priceFrom = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: titleDark,
    height: 1.2,
  );

  static const TextStyle priceBold = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w900,
    color: titleDark,
    height: 1.1,
  );

  static const TextStyle priceTotal = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: metaGrey,
    height: 1.2,
  );
}
