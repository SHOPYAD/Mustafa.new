// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Lonaliza';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get languageLabel => 'Language';

  @override
  String get english => 'English';

  @override
  String get arabic => 'Arabic';

  @override
  String get countryLabel => 'Country or Region';

  @override
  String get currencyLabel => 'Currency';

  @override
  String get unitsLabel => 'Units';

  @override
  String get temperatureLabel => 'Temperature Scale';

  @override
  String get timeFormatLabel => 'Time format';

  @override
  String get manageAccountLabel => 'Manage my account';

  @override
  String get scanQrLabel => 'Scan QR Code';

  @override
  String get darkThemeLabel => 'Dark Theme';

  @override
  String get notificationsLabel => 'Notifications';

  @override
  String get tripGenieLabel => 'TripGenie';

  @override
  String get accessibilityLabel => 'Accessibility';

  @override
  String get termsLabel => 'Terms & Conditions';

  @override
  String get privacyLabel => 'Privacy Statement';

  @override
  String get flights => 'Flights';

  @override
  String get oneWay => 'One-way';

  @override
  String get roundTrip => 'Round-trip';

  @override
  String get multiCity => 'Multi-city';

  @override
  String get whereFrom => 'Where from?';

  @override
  String get whereTo => 'Where to?';

  @override
  String get selectDate => 'Select Date';

  @override
  String get selectDates => 'Select Dates';

  @override
  String get addAnotherFlight => 'Add another flight';

  @override
  String get adults => 'Adults';

  @override
  String get children => 'Children';

  @override
  String get infants => 'Infants';

  @override
  String get cabinEconomy => 'Economy';

  @override
  String get cabinPremiumEconomy => 'Premium Economy';

  @override
  String get cabinBusiness => 'Business';

  @override
  String get cabinFirst => 'First Class';

  @override
  String get search => 'Search';

  @override
  String get searchHint => 'Enter a destination or property';

  @override
  String get currentLocation => 'Current Location';

  @override
  String get clear => 'Clear';

  @override
  String get recentSearches => 'Recent Searches';

  @override
  String get popularDestinations => 'Popular Destinations';

  @override
  String get typeMinChars => 'Type at least 3 characters';

  @override
  String noMatches(Object query) {
    return 'No matches for \"$query\"';
  }

  @override
  String get searchFooter =>
      'Can\'t find what you\'re looking for? Try a more specific search (e.g. by adding the country or region).';

  @override
  String get passengersTitle => 'Passengers';

  @override
  String get adultsSub => 'years old +12';

  @override
  String get childrenSub => 'years old 2-11';

  @override
  String get infantsSub => 'Under 2 years old';

  @override
  String get passengersNotice =>
      'Results show avg. price/passenger (incl. taxes). Prices may vary by passenger type';

  @override
  String get bookingInstructions => 'Booking instructions for children/infants';

  @override
  String get confirm => 'Confirm';

  @override
  String get retry => 'Retry';

  @override
  String get errorNetwork => 'Check your connection and try again.';

  @override
  String get errorServer => 'The search service is temporarily unavailable.';

  @override
  String get errorGeneric => 'An unexpected error occurred. Please try again.';

  @override
  String get errorNotFound => 'The requested resource was not found.';

  @override
  String get login => 'Login';

  @override
  String get loginRequired => 'Please login to continue.';

  @override
  String flightNumber(Object number) {
    return 'Flight $number';
  }

  @override
  String get pleaseSelectOrigin => 'Please select departure city';

  @override
  String get pleaseSelectDestination => 'Please select destination city';

  @override
  String get atLeastOneAdult => 'At least one adult is required';

  @override
  String get dateMustBeAfterPrevious => 'Date must be after previous flight';

  @override
  String get noFlightsAvailable => 'No flights available for this date';

  @override
  String showMoreFlights(int count) {
    return 'Show more ($count flights)';
  }

  @override
  String get flightOutbound => 'OUTBOUND';

  @override
  String get flightInbound => 'RETURN';

  @override
  String get flightNonstop => 'Nonstop';

  @override
  String flightStop(int count) {
    return '$count stop';
  }

  @override
  String flightStops(int count) {
    return '$count stops';
  }

  @override
  String flightStopVia(int count, Object code) {
    return '$count stop via $code';
  }

  @override
  String flightLayover(Object duration, Object code) {
    return '$duration layover at $code';
  }

  @override
  String flightTerminal(Object terminal) {
    return 'Terminal $terminal';
  }

  @override
  String get flightEconomy => 'Economy';

  @override
  String get farePackages => 'FARE PACKAGES';

  @override
  String get compareInclusions => 'Compare inclusions below';

  @override
  String get continueWithThisFare => 'Continue with this fare';

  @override
  String get baggage => 'BAGGAGE';

  @override
  String get flexibility => 'FLEXIBILITY';

  @override
  String get otherBenefits => 'OTHER BENEFITS';

  @override
  String get cabinBaggage => 'CABIN BAGGAGE';

  @override
  String get checkedBaggage => 'CHECKED BAGGAGE';

  @override
  String get cancellation => 'CANCELLATION';

  @override
  String get changes => 'CHANGES';

  @override
  String get seatSelection => 'SEAT SELECTION';

  @override
  String get meals => 'MEALS';

  @override
  String get fareRules => 'FARE RULES';

  @override
  String get nonRefundable => 'Non-refundable';

  @override
  String get refundableFeesApply => 'Refundable (fees apply)';

  @override
  String get freeCancellation => 'Free cancellation';

  @override
  String get nonExchangeable => 'Non-exchangeable';

  @override
  String get changesFeesApply => 'Changes permitted (fees may apply)';

  @override
  String get freeChanges => 'Free changes';

  @override
  String get seatSelectionIncluded => 'Seat selection included';

  @override
  String get paidSeatSelection => 'Paid / at airline discretion';

  @override
  String get mealsIncluded => 'Meals included';

  @override
  String get mealsNotIncluded => 'Buy on board / not included';

  @override
  String get flexibleConditions => 'Flexible conditions';

  @override
  String get viewRules => 'View rules';

  @override
  String optionsAvailable(int count) {
    return '$count options available';
  }

  @override
  String get oneOptionAvailable => '1 option available';

  @override
  String get fallbackCabinBag1 => '1 piece';

  @override
  String get fallbackCabinBag2 => '2 pieces';

  @override
  String get fallbackCheckedBag1 => '1 piece';

  @override
  String get fallbackCheckedBag2 => '2 pieces';

  @override
  String get recommended => 'RECOMMENDED';

  @override
  String get notIncluded => 'Not included';

  @override
  String get searchingFaresTitle => 'Searching...';

  @override
  String get searchingFaresSubtitle => 'Finding the best fares for your dates.';

  @override
  String get refreshSearchTitle => 'Refresh your search';

  @override
  String get refreshSearchMessage =>
      'Prices may have moved up or down, or this fare may no longer be available. Run the search again for current offers.';

  @override
  String get refreshSearchButton => 'Refresh search';

  @override
  String get selectFare => 'Select fare';

  @override
  String get details => 'Details';

  @override
  String get cheapestDirectFlight => 'CHEAPEST DIRECT FLIGHT';

  @override
  String get bestValuedFlight => 'BEST VALUED FLIGHT';

  @override
  String get tenPercentOff => '10% Off';

  @override
  String get selectFlight => 'SELECT FLIGHT';

  @override
  String layoverForIn(Object duration, Object city) {
    return 'Layover for $duration in $city';
  }

  @override
  String stops(int count) {
    return '$count stop(s)';
  }

  @override
  String get aiAssistantBaggageTitle =>
      'Got any questions about baggage? Ask me!';

  @override
  String get aiQuestion1 =>
      'Do my handbag and laptop bag count as two carry-on items?';

  @override
  String get aiQuestion2 => 'How much baggage can I check in?';

  @override
  String get aiQuestion3 =>
      'Will I need to re-check my baggage during the transfer?';

  @override
  String get askAiAssistant => 'Ask our AI assistant';

  @override
  String get bookWithConfidence => 'Book with confidence on Lonaliza';

  @override
  String get awardWinning => 'Award-winning';

  @override
  String get supportApprox30s => 'Support in approx. 30s';

  @override
  String get rewardsForBooking => 'Rewards for booking';

  @override
  String get totalTraveler => 'Total (1 traveler)';

  @override
  String totalTravelers(int count) {
    return 'Total ($count travelers)';
  }

  @override
  String savedAmount(Object amount) {
    return 'Saved $amount';
  }

  @override
  String get continueLabel => 'Continue';

  @override
  String get ticketUpgradedViewDetails => 'View details';
}
