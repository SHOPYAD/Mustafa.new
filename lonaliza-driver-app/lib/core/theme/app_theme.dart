import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Lonaliza VIP Captain — Ultra-Modern Executive Daylight Design System (2026/2027)
/// Premium Royal Purple & Imperial Gold palette tailored for daylight visibility,
/// institutional authority, crisp contrast, and tactile refinement.
abstract final class AppColors {
  // Core Daylight Canvas & Surfaces
  static const background = Color(0xFFF8FAFC); // Clean daylight canvas
  static const surface = Colors.white;
  static const surfaceLight = Color(0xFFF1F5F9);
  static const surfaceSubtle = Color(0xFFF8FAFC);
  static const card = Colors.white;
  static const cardHover = Color(0xFFF8FAFC);

  // Borders & Dividers
  static const border = Color(0xFFE2E8F0);
  static const borderLight = Color(0xFFF1F5F9);
  static const borderFocused = Color(0xFF6D28D9);

  // Lonaliza Royal Purple (Primary)
  static const purple = Color(0xFF6D28D9);
  static const purpleDark = Color(0xFF4C1D95);
  static const purpleLight = Color(0xFF8B5CF6);
  static const purpleMuted = Color(0x186D28D9);
  static const primary = Color(0xFF6D28D9);

  // Imperial Gold & VIP Accents
  static const gold = Color(0xFFD97706);
  static const goldDark = Color(0xFFB45309);
  static const goldLight = Color(0xFFF59E0B);
  static const goldMuted = Color(0x1AD97706);

  // Legacy Obsidian compat (mapped to crisp daylight tokens to prevent dark rendering)
  static const obsidian = Color(0xFFF8FAFC);
  static const obsidianDark = Color(0xFF0F172A);
  static const obsidianLight = Colors.white;
  static const obsidianCard = Colors.white;

  // High-Contrast Daylight Typography (Deep Slate)
  static const textPrimary = Color(0xFF0F172A); // Ultra-crisp slate 900
  static const textSecondary = Color(0xFF475569); // Slate 600
  static const textMuted = Color(0xFF64748B); // Slate 500
  static const textHint = Color(0xFF94A3B8); // Slate 400

  // Enterprise Status Badges
  static const emerald = Color(0xFF059669);
  static const emeraldLight = Color(0xFF10B981);
  static const emeraldMuted = Color(0x1A10B981);
  static const success = Color(0xFF059669);

  static const amber = Color(0xFFD97706);
  static const amberLight = Color(0xFFF59E0B);
  static const warning = Color(0xFFD97706);

  static const rose = Color(0xFFE11D48);
  static const error = Color(0xFFDC2626);
  static const errorMuted = Color(0x1ADC2626);

  static const blue = Color(0xFF2563EB);
  static const blueMuted = Color(0x1A2563EB);
}

abstract final class AppTheme {
  /// Ultra-Modern 2026/2027 Executive Daylight Theme
  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.purple,
        brightness: Brightness.light,
        primary: AppColors.purple,
        onPrimary: Colors.white,
        secondary: AppColors.gold,
        onSecondary: Colors.white,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
        error: AppColors.error,
        onError: Colors.white,
      ),
      scaffoldBackgroundColor: AppColors.background,
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.border, width: 1),
        ),
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceLight,
        floatingLabelBehavior: FloatingLabelBehavior.auto,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.purple, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        labelStyle: const TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w500),
        hintStyle: const TextStyle(color: AppColors.textHint),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.purple,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: const Size.fromHeight(54),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.purple,
          side: const BorderSide(color: AppColors.purple, width: 1.5),
          minimumSize: const Size.fromHeight(50),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.purple,
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
        actionsIconTheme: IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w800,
        ),
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.horizontal(left: Radius.circular(24)),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        elevation: 2,
        indicatorColor: AppColors.purpleMuted,
        height: 72,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: AppColors.purple, size: 26);
          }
          return const IconThemeData(color: AppColors.textMuted, size: 24);
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: AppColors.purple,
            );
          }
          return const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textMuted,
          );
        }),
      ),
      tabBarTheme: const TabBarThemeData(
        labelColor: AppColors.purple,
        unselectedLabelColor: AppColors.textMuted,
        indicatorColor: AppColors.purple,
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: AppColors.border,
        labelStyle: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
        unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: 1,
        space: 24,
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AppColors.purple,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
    );

    final textTheme = GoogleFonts.cairoTextTheme(base.textTheme).apply(
      bodyColor: AppColors.textPrimary,
      displayColor: AppColors.textPrimary,
    );

    return base.copyWith(
      textTheme: textTheme,
      primaryTextTheme: textTheme,
    );
  }

  /// Dark mode alias fallback if requested, but default is daylight
  static ThemeData dark() => light();

  // Modern Daylight Executive Gradients
  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF4C1D95), Color(0xFF6D28D9), Color(0xFF7E22CE)],
  );

  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFB45309), Color(0xFFD97706), Color(0xFFF59E0B)],
  );

  static const LinearGradient cardGlowGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Colors.white, Color(0xFFFBFBFE)],
  );

  static BoxDecoration splashDecoration = const BoxDecoration(
    color: AppColors.background,
  );

  static List<BoxShadow> cardShadow = const [
    BoxShadow(
      color: Color(0x0A0F172A),
      blurRadius: 12,
      spreadRadius: 0,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color(0x050F172A),
      blurRadius: 4,
      spreadRadius: 0,
      offset: Offset(0, 1),
    ),
  ];

  static List<BoxShadow> heroShadow = const [
    BoxShadow(
      color: Color(0x226D28D9),
      blurRadius: 24,
      spreadRadius: -4,
      offset: Offset(0, 10),
    ),
  ];
}
