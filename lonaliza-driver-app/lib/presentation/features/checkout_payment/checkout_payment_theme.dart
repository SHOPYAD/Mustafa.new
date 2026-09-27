import 'package:flutter/material.dart';

/// Typography and colors aligned with Trip-style checkout (sans-serif, Roboto default).
abstract final class CheckoutPaymentTheme {
  static const Color pageBg = Color(0xFFF3F4F6);
  static const Color cardBg = Colors.white;
  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF4B5563);
  static const Color textMuted = Color(0xFF6B7280);
  static const Color textLight = Color(0xFF9CA3AF);
  static const Color blue = Color(0xFF2563EB);
  static const Color blueAlt = Color(0xFF2F60F5);
  static const Color redUrgent = Color(0xFFDC2626);
  static const Color teal = Color(0xFF0D9488);
  static const Color border = Color(0xFFE5E7EB);

  static const TextStyle urgentBanner = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: redUrgent,
    height: 1.2,
    letterSpacing: -0.1,
  );

  static const TextStyle secureTitle = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w800,
    color: teal,
    letterSpacing: -0.2,
  );

  static const TextStyle timerLine = TextStyle(
    fontSize: 13,
    color: textSecondary,
    height: 1.3,
  );

  static const TextStyle timerBold = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w800,
    color: textPrimary,
  );

  static const TextStyle priceLarge = TextStyle(
    fontSize: 30,
    fontWeight: FontWeight.w800,
    color: textPrimary,
    letterSpacing: -0.5,
  );

  static const TextStyle routeTitle = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: textPrimary,
  );

  static const TextStyle routeTime = TextStyle(
    fontSize: 13,
    color: textMuted,
    height: 1.25,
  );

  static const TextStyle passenger = TextStyle(
    fontSize: 13,
    color: textMuted,
  );

  static const TextStyle detailsLink = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: blue,
    decoration: TextDecoration.underline,
    decorationColor: blue,
  );

  static const TextStyle methodTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w700,
    color: textPrimary,
  );

  static const TextStyle methodSubtitle = TextStyle(
    fontSize: 12,
    color: textLight,
    height: 1.2,
  );

  static const TextStyle payButton = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: Colors.white,
    letterSpacing: -0.2,
  );

  static const TextStyle trustFoot = TextStyle(
    fontSize: 12,
    color: textSecondary,
    fontWeight: FontWeight.w500,
  );
}
