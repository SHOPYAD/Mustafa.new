import 'package:flutter/material.dart';

abstract final class LonalizaColors {
  LonalizaColors._();

  static const Color royalPurple = Color(0xFF2E1065);
  static const Color primary = Color(0xFF7C3AED);
  static const Color amber = Color(0xFFF59E0B);
  static const Color daytimeWhite = Color(0xFFFFFFFF);
  static const Color ink = Color(0xFF111827);
}

abstract final class LonalizaTheme {
  LonalizaTheme._();

  static const String displayName = 'Lonaliza';

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: LonalizaColors.primary,
      primary: LonalizaColors.primary,
      secondary: LonalizaColors.amber,
      surface: LonalizaColors.daytimeWhite,
      brightness: Brightness.light,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: LonalizaColors.daytimeWhite,
      appBarTheme: const AppBarTheme(
        backgroundColor: LonalizaColors.royalPurple,
        foregroundColor: LonalizaColors.daytimeWhite,
        elevation: 0,
      ),
    );
  }
}
