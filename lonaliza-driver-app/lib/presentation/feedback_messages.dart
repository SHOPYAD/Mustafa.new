import 'package:flutter/material.dart';

/// Short user-facing strings (SnackBars, inline errors). Use from any feature under [presentation].
abstract final class FeedbackMessages {
  FeedbackMessages._();

  // —— Hotels search (home card validation) ——

  static const hotelsMissingDestination = 'منطقة الإقامة';
  static const hotelsMissingDates = 'التواريخ';
  static const hotelsInvalidGuestCounts = 'عدد الغرف والبالغين (لا يمكن أن يكون 0)';

  /// Builds a single line listing missing pieces (e.g. SnackBar).
  static String fillMissingFields(Iterable<String> segments) {
    final joined = segments
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .join('، ');
    return 'يرجى تعبئة: $joined';
  }

  /// Default floating SnackBar used across the app for non-blocking errors / hints.
  static void showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
