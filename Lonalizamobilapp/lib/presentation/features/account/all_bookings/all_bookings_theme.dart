import 'package:flutter/material.dart';

import '../account_theme.dart';

/// Typography and colors for the All Bookings list (matches Trip-style list).
abstract final class AllBookingsTheme {
  static const Color cardBorder = Color(0xFFE5E7EB);
  static const Color blue = AccountTheme.primaryBlueAlt;
  static const Color titleDark = AccountTheme.textBody;
  static const Color metaGrey = AccountTheme.textSecondary;
  static const Color subtleGrey = AccountTheme.textMuted;

  static const TextStyle appBarTitle = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: AccountTheme.textPrimary,
    letterSpacing: -0.3,
  );

  static const TextStyle categoryLabel = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: metaGrey,
    height: 1.2,
  );

  static const TextStyle statusLabel = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: metaGrey,
  );

  static const TextStyle hotelName = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.35,
    letterSpacing: -0.2,
  );

  static const TextStyle bodyLine = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: metaGrey,
    height: 1.35,
  );

  static const TextStyle prepayLabel = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: metaGrey,
  );

  static const TextStyle priceBold = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w800,
    color: titleDark,
  );

  static const TextStyle routeTitle = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.3,
  );

  static const TextStyle flightMeta = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: metaGrey,
    height: 1.35,
  );

  static const TextStyle addonTitle = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w700,
    color: Color(0xFF5C5C5C),
    height: 1.3,
  );

  static const TextStyle promoLine = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: metaGrey,
  );

  static const TextStyle footerMuted = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: metaGrey,
  );

  static const TextStyle linkBlue = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: blue,
  );

  static const TextStyle chipLabel = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: titleDark,
  );
}
