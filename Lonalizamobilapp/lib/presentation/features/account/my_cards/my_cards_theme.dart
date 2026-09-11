import 'package:flutter/material.dart';

import '../account_theme.dart';

abstract final class MyCardsTheme {
  static const Color navy = Color(0xFF1E3A5F);
  static const Color blue = AccountTheme.primaryBlueAlt;
  static const Color muted = Color(0xFF6B7280);
  static const Color lightMuted = Color(0xFF9CA3AF);
  static const Color border = Color(0xFFE5E7EB);
  static const Color nextGrey = Color(0xFF70798C);

  static const TextStyle appBarTitle = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: navy,
    letterSpacing: -0.3,
  );

  static const TextStyle tabActive = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: blue,
  );

  static const TextStyle tabInactive = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Color(0xFF9CA3AF),
  );

  static const TextStyle emptyTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: muted,
    height: 1.3,
  );

  static const TextStyle emptyBody = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: lightMuted,
    height: 1.55,
  );

  static const TextStyle promoTitle = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w800,
    color: Color(0xFF1E40AF),
    height: 1.35,
  );

  static const TextStyle promoPill = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    color: Color(0xFF166534),
    height: 1.2,
  );

  static const TextStyle addCardBtn = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: Colors.white,
    letterSpacing: -0.2,
  );

  static const TextStyle sheetTitle = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w800,
    color: Color(0xFF111827),
  );

  static const TextStyle fieldHint = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: Color(0xFF9CA3AF),
  );

  static const TextStyle sheetFooter = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: muted,
    height: 1.45,
  );
}
