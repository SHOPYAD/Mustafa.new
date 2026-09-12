import 'package:liotrip/domain/entities/flights/flight_offer.dart';

class Helper {
  /// Formats a duration in minutes to a readable string like "2h 30m" or "45m"
  static String formatDurationMinutes(int minutes) {
    final hours = minutes ~/ 60;
    final mins = minutes % 60;
    if (hours > 0 && mins > 0) return '${hours}h ${mins}m';
    if (hours > 0) return '${hours}h';
    return '${mins}m';
  }

  /// Formats a layover duration in minutes to a compact duration string like "8h 45m"
  /// (caller passes it to l10n.flightLayover(duration, code) for the full label)
  static String formatLayoverDuration(int minutes) {
    return formatDurationMinutes(minutes);
  }

  /// Formats a layover duration to a string like "2h 30m layover" (English-only legacy use)
  static String formatLayover(int minutes) {
    return '${formatDurationMinutes(minutes)} layover';
  }

  /// Checks if a baggage value actually contains meaningful allowance
  static bool isMeaningfulBag(String? value) {
    if (value == null || value.trim().isEmpty) return false;
    final val = value.trim().toLowerCase();
    const noBagValues = [
      '0',
      '0 kg',
      '0kg',
      '0 pc',
      '0pc',
      '0 piece',
      '0piece',
      'n/a',
      'na',
    ];
    return !noBagValues.contains(val);
  }

  /// Formats the checked baggage display string
  static String formatCheckedBaggage(String? raw) {
    if (!isMeaningfulBag(raw)) {
      return 'No checked bag';
    }
    final clean = raw!.trim();
    if (clean.toLowerCase().contains('checked')) return clean;
    return '$clean checked';
  }

  /// Formats the cabin baggage display string
  static String? formatCabinBaggage(String? raw) {
    if (!isMeaningfulBag(raw)) {
      return null; // Do not show cabin bag tag if not meaningful
    }
    final clean = raw!.trim();
    if (clean.toLowerCase().contains('cabin')) return clean;
    return '$clean cabin';
  }

  /// Resolves the airline logo URL.
  /// If no URL is provided, falls back to Kiwi CDN using the carrier code.
  static String? resolveAirlineLogo(String? logoUrl, String carrierCode) {
    if (logoUrl != null && logoUrl.isNotEmpty) return logoUrl;
    if (carrierCode.isNotEmpty && carrierCode != 'N/A') {
      return 'https://images.kiwi.com/airlines/64/$carrierCode.png';
    }
    return null;
  }

  // ─── Flight Calculations ───────────────────────────────────────────────────

  /// Returns the cheapest available fare variant price, or falls back to the
  /// offer base price if no variants exist.
  static double calcBestPrice(
    List<FlightFareVariant> variants,
    double fallback,
  ) {
    if (variants.isEmpty) return fallback;
    final valid = variants.map((v) => v.pricing.total).where((p) => p > 0);
    return valid.isEmpty ? fallback : valid.reduce((a, b) => a < b ? a : b);
  }

  /// Returns the best (cheapest / isBestPrice) fare variant, or null.
  static FlightFareVariant? calcDefaultVariant(
    List<FlightFareVariant> variants,
  ) {
    if (variants.isEmpty) return null;
    return variants.where((v) => v.isBestPrice == true).firstOrNull ??
        variants.first;
  }

  /// Calculates the total itinerary duration as a formatted string.
  /// Uses [durationMinutes] if set, otherwise derives it from first/last segment.
  static String calcItineraryDuration(
    int? durationMinutes,
    FlightSegment? first,
    FlightSegment? last,
  ) {
    if (durationMinutes != null && durationMinutes > 0) {
      return formatDurationMinutes(durationMinutes);
    }
    if (first == null || last == null) return '';
    final diff = last.arrival.dateTime.difference(first.departure.dateTime);
    return formatDurationMinutes(diff.inMinutes);
  }

  /// Returns the maximum layover gap (in minutes) across all segments
  /// in an itinerary.
  static int calcMaxLayoverMinutes(List<FlightSegment> segments) {
    if (segments.length < 2) return 0;
    int max = 0;
    for (int i = 0; i < segments.length - 1; i++) {
      final gap = segments[i + 1].departure.dateTime
          .difference(segments[i].arrival.dateTime)
          .inMinutes;
      if (gap > max) max = gap;
    }
    return max;
  }

  /// Builds a human-readable stops string like "Nonstop", "1 stop via IST".
  static String calcStopsString(int stops, List<FlightSegment> segments) {
    if (stops == 0) return 'Nonstop';
    final stopWord = stops == 1 ? 'stop' : 'stops';
    String via = '';
    if (segments.length > 1 && segments.first.arrival.airportCode.isNotEmpty) {
      via = ' via ${segments.first.arrival.airportCode}';
    }
    return '$stops $stopWord$via';
  }
}
