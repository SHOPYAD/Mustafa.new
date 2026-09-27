import 'package:lonaliza_driver/domain/entities/flights/flights_booking_draft.dart';
import 'package:lonaliza_driver/l10n/app_localizations.dart';
import 'flight_route_validator.dart';

class FlightBookingValidator {
  /// Validates the entire flight booking draft.
  /// Coordinates between route validation and passenger validation.
  static String? validate(FlightsBookingDraft draft, AppLocalizations l10n) {
    // 1. Ensure enough segments for the trip type
    if (draft.tripType == FlightTripType.roundTrip && draft.segments.length < 2) {
      return l10n.selectDate; // Or a specific "Please select return date"
    }

    // 2. Validate all segments (Routes and Dates)
    for (int i = 0; i < draft.segments.length; i++) {
      final prefix = draft.tripType == FlightTripType.multiCity 
          ? '${l10n.flightNumber(i + 1)}: ' 
          : '';
          
      final routeError = FlightRouteValidator.validate(
        draft.segments[i], 
        l10n, 
        prefix: prefix,
      );
      
      if (routeError != null) return routeError;

      // 3. Sequential Date Validation (Check if current date is before previous segment)
      if (i > 0) {
        final prevDate = draft.segments[i - 1].departureDate;
        final currDate = draft.segments[i].departureDate;

        if (prevDate != null && currDate != null && currDate.isBefore(prevDate)) {
          return prefix + l10n.dateMustBeAfterPrevious;
        }
      }
    }

    // 4. Validate Passengers
    if (draft.adultCount < 1) {
      return l10n.atLeastOneAdult;
    }

    // 5. Specific Round-trip check (already covered by sequential check above, 
    // but keeping it if you want specific return-date message)
    if (draft.tripType == FlightTripType.roundTrip && draft.segments.length >= 2) {
      final depDate = draft.segments[0].departureDate;
      final retDate = draft.segments[1].departureDate;
      
      if (depDate != null && retDate != null && retDate.isBefore(depDate)) {
        // You might want to add a localized string for this too
        return 'Return date cannot be before departure date'; 
      }
    }

    return null;
  }
}
