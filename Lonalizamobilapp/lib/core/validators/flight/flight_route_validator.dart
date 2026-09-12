import 'package:liotrip/domain/entities/flights/flights_booking_draft.dart';
import 'package:liotrip/l10n/app_localizations.dart';

class FlightRouteValidator {
  /// Validates a single flight segment.
  /// Returns a localized error message or null if valid.
  static String? validate(
    FlightRouteSegment segment,
    AppLocalizations l10n, {
    String? prefix,
  }) {
    final displayPrefix = prefix ?? '';

    if (segment.origin == null) {
      return '$displayPrefix${l10n.pleaseSelectOrigin}';
    }

    if (segment.destination == null) {
      return '$displayPrefix${l10n.pleaseSelectDestination}';
    }

    if (segment.departureDate == null) {
      return '$displayPrefix${l10n.selectDate}';
    }

    return null;
  }
}
