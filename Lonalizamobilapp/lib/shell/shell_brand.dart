import 'package:flutter/material.dart';

/// Isolated brand tokens for the native WebView shell overlays.
class ShellBrand {
  static const Color royalPurple = Color(0xFF2E1065);
  static const Color royalPurpleDeep = Color(0xFF140522);
  static const Color royalMid = Color(0xFF4C1D95);
  static const Color amberGold = Color(0xFFF59E0B);
  static const Color amberGoldLight = Color(0xFFFBBF24);
  static const Color canvas = Color(0xFFF7F4FC);

  static const LinearGradient nightSky = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xFF2E1065),
      Color(0xFF1A0A36),
      Color(0xFF140522),
    ],
  );
}
