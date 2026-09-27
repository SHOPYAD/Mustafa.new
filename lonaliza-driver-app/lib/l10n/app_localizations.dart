import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';
import 'app_localizations_tr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
    Locale('tr'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Lonaliza Captain'**
  String get appTitle;

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTitle;

  /// No description provided for @languageLabel.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get languageLabel;

  /// No description provided for @english.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @arabic.
  ///
  /// In en, this message translates to:
  /// **'Arabic'**
  String get arabic;

  /// No description provided for @countryLabel.
  ///
  /// In en, this message translates to:
  /// **'Country or Region'**
  String get countryLabel;

  /// No description provided for @currencyLabel.
  ///
  /// In en, this message translates to:
  /// **'Currency'**
  String get currencyLabel;

  /// No description provided for @unitsLabel.
  ///
  /// In en, this message translates to:
  /// **'Units'**
  String get unitsLabel;

  /// No description provided for @temperatureLabel.
  ///
  /// In en, this message translates to:
  /// **'Temperature Scale'**
  String get temperatureLabel;

  /// No description provided for @timeFormatLabel.
  ///
  /// In en, this message translates to:
  /// **'Time format'**
  String get timeFormatLabel;

  /// No description provided for @manageAccountLabel.
  ///
  /// In en, this message translates to:
  /// **'Manage my account'**
  String get manageAccountLabel;

  /// No description provided for @scanQrLabel.
  ///
  /// In en, this message translates to:
  /// **'Scan QR Code'**
  String get scanQrLabel;

  /// No description provided for @darkThemeLabel.
  ///
  /// In en, this message translates to:
  /// **'Dark Theme'**
  String get darkThemeLabel;

  /// No description provided for @notificationsLabel.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notificationsLabel;

  /// No description provided for @tripGenieLabel.
  ///
  /// In en, this message translates to:
  /// **'TripGenie'**
  String get tripGenieLabel;

  /// No description provided for @accessibilityLabel.
  ///
  /// In en, this message translates to:
  /// **'Accessibility'**
  String get accessibilityLabel;

  /// No description provided for @termsLabel.
  ///
  /// In en, this message translates to:
  /// **'Terms & Conditions'**
  String get termsLabel;

  /// No description provided for @privacyLabel.
  ///
  /// In en, this message translates to:
  /// **'Privacy Statement'**
  String get privacyLabel;

  /// No description provided for @flights.
  ///
  /// In en, this message translates to:
  /// **'Flights'**
  String get flights;

  /// No description provided for @oneWay.
  ///
  /// In en, this message translates to:
  /// **'One-way'**
  String get oneWay;

  /// No description provided for @roundTrip.
  ///
  /// In en, this message translates to:
  /// **'Round-trip'**
  String get roundTrip;

  /// No description provided for @multiCity.
  ///
  /// In en, this message translates to:
  /// **'Multi-city'**
  String get multiCity;

  /// No description provided for @whereFrom.
  ///
  /// In en, this message translates to:
  /// **'Where from?'**
  String get whereFrom;

  /// No description provided for @whereTo.
  ///
  /// In en, this message translates to:
  /// **'Where to?'**
  String get whereTo;

  /// No description provided for @selectDate.
  ///
  /// In en, this message translates to:
  /// **'Select Date'**
  String get selectDate;

  /// No description provided for @selectDates.
  ///
  /// In en, this message translates to:
  /// **'Select Dates'**
  String get selectDates;

  /// No description provided for @addAnotherFlight.
  ///
  /// In en, this message translates to:
  /// **'Add another flight'**
  String get addAnotherFlight;

  /// No description provided for @adults.
  ///
  /// In en, this message translates to:
  /// **'Adults'**
  String get adults;

  /// No description provided for @children.
  ///
  /// In en, this message translates to:
  /// **'Children'**
  String get children;

  /// No description provided for @infants.
  ///
  /// In en, this message translates to:
  /// **'Infants'**
  String get infants;

  /// No description provided for @cabinEconomy.
  ///
  /// In en, this message translates to:
  /// **'Economy'**
  String get cabinEconomy;

  /// No description provided for @cabinPremiumEconomy.
  ///
  /// In en, this message translates to:
  /// **'Premium Economy'**
  String get cabinPremiumEconomy;

  /// No description provided for @cabinBusiness.
  ///
  /// In en, this message translates to:
  /// **'Business'**
  String get cabinBusiness;

  /// No description provided for @cabinFirst.
  ///
  /// In en, this message translates to:
  /// **'First Class'**
  String get cabinFirst;

  /// No description provided for @search.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get search;

  /// No description provided for @searchHint.
  ///
  /// In en, this message translates to:
  /// **'Enter a destination or property'**
  String get searchHint;

  /// No description provided for @currentLocation.
  ///
  /// In en, this message translates to:
  /// **'Current Location'**
  String get currentLocation;

  /// No description provided for @clear.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get clear;

  /// No description provided for @recentSearches.
  ///
  /// In en, this message translates to:
  /// **'Recent Searches'**
  String get recentSearches;

  /// No description provided for @popularDestinations.
  ///
  /// In en, this message translates to:
  /// **'Popular Destinations'**
  String get popularDestinations;

  /// No description provided for @typeMinChars.
  ///
  /// In en, this message translates to:
  /// **'Type at least 3 characters'**
  String get typeMinChars;

  /// No description provided for @noMatches.
  ///
  /// In en, this message translates to:
  /// **'No matches for \"{query}\"'**
  String noMatches(Object query);

  /// No description provided for @searchFooter.
  ///
  /// In en, this message translates to:
  /// **'Can\'t find what you\'re looking for? Try a more specific search (e.g. by adding the country or region).'**
  String get searchFooter;

  /// No description provided for @passengersTitle.
  ///
  /// In en, this message translates to:
  /// **'Passengers'**
  String get passengersTitle;

  /// No description provided for @adultsSub.
  ///
  /// In en, this message translates to:
  /// **'years old +12'**
  String get adultsSub;

  /// No description provided for @childrenSub.
  ///
  /// In en, this message translates to:
  /// **'years old 2-11'**
  String get childrenSub;

  /// No description provided for @infantsSub.
  ///
  /// In en, this message translates to:
  /// **'Under 2 years old'**
  String get infantsSub;

  /// No description provided for @passengersNotice.
  ///
  /// In en, this message translates to:
  /// **'Results show avg. price/passenger (incl. taxes). Prices may vary by passenger type'**
  String get passengersNotice;

  /// No description provided for @bookingInstructions.
  ///
  /// In en, this message translates to:
  /// **'Booking instructions for children/infants'**
  String get bookingInstructions;

  /// No description provided for @confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @errorNetwork.
  ///
  /// In en, this message translates to:
  /// **'Check your connection and try again.'**
  String get errorNetwork;

  /// No description provided for @errorServer.
  ///
  /// In en, this message translates to:
  /// **'The search service is temporarily unavailable.'**
  String get errorServer;

  /// No description provided for @errorGeneric.
  ///
  /// In en, this message translates to:
  /// **'An unexpected error occurred. Please try again.'**
  String get errorGeneric;

  /// No description provided for @errorNotFound.
  ///
  /// In en, this message translates to:
  /// **'The requested resource was not found.'**
  String get errorNotFound;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @loginRequired.
  ///
  /// In en, this message translates to:
  /// **'Please login to continue.'**
  String get loginRequired;

  /// No description provided for @flightNumber.
  ///
  /// In en, this message translates to:
  /// **'Flight {number}'**
  String flightNumber(Object number);

  /// No description provided for @pleaseSelectOrigin.
  ///
  /// In en, this message translates to:
  /// **'Please select departure city'**
  String get pleaseSelectOrigin;

  /// No description provided for @pleaseSelectDestination.
  ///
  /// In en, this message translates to:
  /// **'Please select destination city'**
  String get pleaseSelectDestination;

  /// No description provided for @atLeastOneAdult.
  ///
  /// In en, this message translates to:
  /// **'At least one adult is required'**
  String get atLeastOneAdult;

  /// No description provided for @dateMustBeAfterPrevious.
  ///
  /// In en, this message translates to:
  /// **'Date must be after previous flight'**
  String get dateMustBeAfterPrevious;

  /// No description provided for @noFlightsAvailable.
  ///
  /// In en, this message translates to:
  /// **'No flights available for this date'**
  String get noFlightsAvailable;

  /// No description provided for @showMoreFlights.
  ///
  /// In en, this message translates to:
  /// **'Show more ({count} flights)'**
  String showMoreFlights(int count);

  /// No description provided for @flightOutbound.
  ///
  /// In en, this message translates to:
  /// **'OUTBOUND'**
  String get flightOutbound;

  /// No description provided for @flightInbound.
  ///
  /// In en, this message translates to:
  /// **'RETURN'**
  String get flightInbound;

  /// No description provided for @flightNonstop.
  ///
  /// In en, this message translates to:
  /// **'Nonstop'**
  String get flightNonstop;

  /// No description provided for @flightStop.
  ///
  /// In en, this message translates to:
  /// **'{count} stop'**
  String flightStop(int count);

  /// No description provided for @flightStops.
  ///
  /// In en, this message translates to:
  /// **'{count} stops'**
  String flightStops(int count);

  /// No description provided for @flightStopVia.
  ///
  /// In en, this message translates to:
  /// **'{count} stop via {code}'**
  String flightStopVia(int count, Object code);

  /// No description provided for @flightLayover.
  ///
  /// In en, this message translates to:
  /// **'{duration} layover at {code}'**
  String flightLayover(Object duration, Object code);

  /// No description provided for @flightTerminal.
  ///
  /// In en, this message translates to:
  /// **'Terminal {terminal}'**
  String flightTerminal(Object terminal);

  /// No description provided for @flightEconomy.
  ///
  /// In en, this message translates to:
  /// **'Economy'**
  String get flightEconomy;

  /// No description provided for @farePackages.
  ///
  /// In en, this message translates to:
  /// **'FARE PACKAGES'**
  String get farePackages;

  /// No description provided for @compareInclusions.
  ///
  /// In en, this message translates to:
  /// **'Compare inclusions below'**
  String get compareInclusions;

  /// No description provided for @continueWithThisFare.
  ///
  /// In en, this message translates to:
  /// **'Continue with this fare'**
  String get continueWithThisFare;

  /// No description provided for @baggage.
  ///
  /// In en, this message translates to:
  /// **'BAGGAGE'**
  String get baggage;

  /// No description provided for @flexibility.
  ///
  /// In en, this message translates to:
  /// **'FLEXIBILITY'**
  String get flexibility;

  /// No description provided for @otherBenefits.
  ///
  /// In en, this message translates to:
  /// **'OTHER BENEFITS'**
  String get otherBenefits;

  /// No description provided for @cabinBaggage.
  ///
  /// In en, this message translates to:
  /// **'CABIN BAGGAGE'**
  String get cabinBaggage;

  /// No description provided for @checkedBaggage.
  ///
  /// In en, this message translates to:
  /// **'CHECKED BAGGAGE'**
  String get checkedBaggage;

  /// No description provided for @cancellation.
  ///
  /// In en, this message translates to:
  /// **'CANCELLATION'**
  String get cancellation;

  /// No description provided for @changes.
  ///
  /// In en, this message translates to:
  /// **'CHANGES'**
  String get changes;

  /// No description provided for @seatSelection.
  ///
  /// In en, this message translates to:
  /// **'SEAT SELECTION'**
  String get seatSelection;

  /// No description provided for @meals.
  ///
  /// In en, this message translates to:
  /// **'MEALS'**
  String get meals;

  /// No description provided for @fareRules.
  ///
  /// In en, this message translates to:
  /// **'FARE RULES'**
  String get fareRules;

  /// No description provided for @nonRefundable.
  ///
  /// In en, this message translates to:
  /// **'Non-refundable'**
  String get nonRefundable;

  /// No description provided for @refundableFeesApply.
  ///
  /// In en, this message translates to:
  /// **'Refundable (fees apply)'**
  String get refundableFeesApply;

  /// No description provided for @freeCancellation.
  ///
  /// In en, this message translates to:
  /// **'Free cancellation'**
  String get freeCancellation;

  /// No description provided for @nonExchangeable.
  ///
  /// In en, this message translates to:
  /// **'Non-exchangeable'**
  String get nonExchangeable;

  /// No description provided for @changesFeesApply.
  ///
  /// In en, this message translates to:
  /// **'Changes permitted (fees may apply)'**
  String get changesFeesApply;

  /// No description provided for @freeChanges.
  ///
  /// In en, this message translates to:
  /// **'Free changes'**
  String get freeChanges;

  /// No description provided for @seatSelectionIncluded.
  ///
  /// In en, this message translates to:
  /// **'Seat selection included'**
  String get seatSelectionIncluded;

  /// No description provided for @paidSeatSelection.
  ///
  /// In en, this message translates to:
  /// **'Paid / at airline discretion'**
  String get paidSeatSelection;

  /// No description provided for @mealsIncluded.
  ///
  /// In en, this message translates to:
  /// **'Meals included'**
  String get mealsIncluded;

  /// No description provided for @mealsNotIncluded.
  ///
  /// In en, this message translates to:
  /// **'Buy on board / not included'**
  String get mealsNotIncluded;

  /// No description provided for @flexibleConditions.
  ///
  /// In en, this message translates to:
  /// **'Flexible conditions'**
  String get flexibleConditions;

  /// No description provided for @viewRules.
  ///
  /// In en, this message translates to:
  /// **'View rules'**
  String get viewRules;

  /// No description provided for @optionsAvailable.
  ///
  /// In en, this message translates to:
  /// **'{count} options available'**
  String optionsAvailable(int count);

  /// No description provided for @oneOptionAvailable.
  ///
  /// In en, this message translates to:
  /// **'1 option available'**
  String get oneOptionAvailable;

  /// No description provided for @fallbackCabinBag1.
  ///
  /// In en, this message translates to:
  /// **'1 piece'**
  String get fallbackCabinBag1;

  /// No description provided for @fallbackCabinBag2.
  ///
  /// In en, this message translates to:
  /// **'2 pieces'**
  String get fallbackCabinBag2;

  /// No description provided for @fallbackCheckedBag1.
  ///
  /// In en, this message translates to:
  /// **'1 piece'**
  String get fallbackCheckedBag1;

  /// No description provided for @fallbackCheckedBag2.
  ///
  /// In en, this message translates to:
  /// **'2 pieces'**
  String get fallbackCheckedBag2;

  /// No description provided for @recommended.
  ///
  /// In en, this message translates to:
  /// **'RECOMMENDED'**
  String get recommended;

  /// No description provided for @notIncluded.
  ///
  /// In en, this message translates to:
  /// **'Not included'**
  String get notIncluded;

  /// No description provided for @searchingFaresTitle.
  ///
  /// In en, this message translates to:
  /// **'Searching...'**
  String get searchingFaresTitle;

  /// No description provided for @searchingFaresSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Finding the best fares for your dates.'**
  String get searchingFaresSubtitle;

  /// No description provided for @refreshSearchTitle.
  ///
  /// In en, this message translates to:
  /// **'Refresh your search'**
  String get refreshSearchTitle;

  /// No description provided for @refreshSearchMessage.
  ///
  /// In en, this message translates to:
  /// **'Prices may have moved up or down, or this fare may no longer be available. Run the search again for current offers.'**
  String get refreshSearchMessage;

  /// No description provided for @refreshSearchButton.
  ///
  /// In en, this message translates to:
  /// **'Refresh search'**
  String get refreshSearchButton;

  /// No description provided for @selectFare.
  ///
  /// In en, this message translates to:
  /// **'Select fare'**
  String get selectFare;

  /// No description provided for @details.
  ///
  /// In en, this message translates to:
  /// **'Details'**
  String get details;

  /// No description provided for @cheapestDirectFlight.
  ///
  /// In en, this message translates to:
  /// **'CHEAPEST DIRECT FLIGHT'**
  String get cheapestDirectFlight;

  /// No description provided for @bestValuedFlight.
  ///
  /// In en, this message translates to:
  /// **'BEST VALUED FLIGHT'**
  String get bestValuedFlight;

  /// No description provided for @tenPercentOff.
  ///
  /// In en, this message translates to:
  /// **'10% Off'**
  String get tenPercentOff;

  /// No description provided for @selectFlight.
  ///
  /// In en, this message translates to:
  /// **'SELECT FLIGHT'**
  String get selectFlight;

  /// No description provided for @layoverForIn.
  ///
  /// In en, this message translates to:
  /// **'Layover for {duration} in {city}'**
  String layoverForIn(Object duration, Object city);

  /// No description provided for @stops.
  ///
  /// In en, this message translates to:
  /// **'{count} stop(s)'**
  String stops(int count);

  /// No description provided for @aiAssistantBaggageTitle.
  ///
  /// In en, this message translates to:
  /// **'Got any questions about baggage? Ask me!'**
  String get aiAssistantBaggageTitle;

  /// No description provided for @aiQuestion1.
  ///
  /// In en, this message translates to:
  /// **'Do my handbag and laptop bag count as two carry-on items?'**
  String get aiQuestion1;

  /// No description provided for @aiQuestion2.
  ///
  /// In en, this message translates to:
  /// **'How much baggage can I check in?'**
  String get aiQuestion2;

  /// No description provided for @aiQuestion3.
  ///
  /// In en, this message translates to:
  /// **'Will I need to re-check my baggage during the transfer?'**
  String get aiQuestion3;

  /// No description provided for @askAiAssistant.
  ///
  /// In en, this message translates to:
  /// **'Ask our AI assistant'**
  String get askAiAssistant;

  /// No description provided for @bookWithConfidence.
  ///
  /// In en, this message translates to:
  /// **'Book with confidence on Lonaliza'**
  String get bookWithConfidence;

  /// No description provided for @awardWinning.
  ///
  /// In en, this message translates to:
  /// **'Award-winning'**
  String get awardWinning;

  /// No description provided for @supportApprox30s.
  ///
  /// In en, this message translates to:
  /// **'Support in approx. 30s'**
  String get supportApprox30s;

  /// No description provided for @rewardsForBooking.
  ///
  /// In en, this message translates to:
  /// **'Rewards for booking'**
  String get rewardsForBooking;

  /// No description provided for @totalTraveler.
  ///
  /// In en, this message translates to:
  /// **'Total (1 traveler)'**
  String get totalTraveler;

  /// No description provided for @totalTravelers.
  ///
  /// In en, this message translates to:
  /// **'Total ({count} travelers)'**
  String totalTravelers(int count);

  /// No description provided for @savedAmount.
  ///
  /// In en, this message translates to:
  /// **'Saved {amount}'**
  String savedAmount(Object amount);

  /// No description provided for @continueLabel.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueLabel;

  /// No description provided for @ticketUpgradedViewDetails.
  ///
  /// In en, this message translates to:
  /// **'View details'**
  String get ticketUpgradedViewDetails;

  /// No description provided for @turkish.
  ///
  /// In en, this message translates to:
  /// **'Turkish'**
  String get turkish;

  /// No description provided for @logoutLabel.
  ///
  /// In en, this message translates to:
  /// **'Log out'**
  String get logoutLabel;

  /// No description provided for @driverAppTitle.
  ///
  /// In en, this message translates to:
  /// **'Lonaliza Captain — VIP Fleet'**
  String get driverAppTitle;

  /// No description provided for @driverWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get driverWelcome;

  /// No description provided for @driverWorkspace.
  ///
  /// In en, this message translates to:
  /// **'Transfer & daily-tour workspace'**
  String get driverWorkspace;

  /// No description provided for @splashHeadline.
  ///
  /// In en, this message translates to:
  /// **'Lonaliza VIP Chauffeur & Fleet Platform'**
  String get splashHeadline;

  /// No description provided for @splashTagline.
  ///
  /// In en, this message translates to:
  /// **'Join our premier executive chauffeur and fleet network — receive VIP ride requests, instant payouts, and corporate contracts.'**
  String get splashTagline;

  /// No description provided for @startNow.
  ///
  /// In en, this message translates to:
  /// **'Start now'**
  String get startNow;

  /// No description provided for @goToDashboard.
  ///
  /// In en, this message translates to:
  /// **'Go to dashboard'**
  String get goToDashboard;

  /// No description provided for @incomingOffers.
  ///
  /// In en, this message translates to:
  /// **'Incoming offers'**
  String get incomingOffers;

  /// No description provided for @incomingOffersSub.
  ///
  /// In en, this message translates to:
  /// **'Accept or reject within the response window'**
  String get incomingOffersSub;

  /// No description provided for @activeTrips.
  ///
  /// In en, this message translates to:
  /// **'Active trips'**
  String get activeTrips;

  /// No description provided for @activeTripsSub.
  ///
  /// In en, this message translates to:
  /// **'Ongoing transfers and tours'**
  String get activeTripsSub;

  /// No description provided for @activeTrip.
  ///
  /// In en, this message translates to:
  /// **'Active trip'**
  String get activeTrip;

  /// No description provided for @activeTripSub.
  ///
  /// In en, this message translates to:
  /// **'Publish location during en_route / onboard'**
  String get activeTripSub;

  /// No description provided for @earnings.
  ///
  /// In en, this message translates to:
  /// **'Earnings'**
  String get earnings;

  /// No description provided for @earningsSub.
  ///
  /// In en, this message translates to:
  /// **'Commission rate and weekly settlement'**
  String get earningsSub;

  /// No description provided for @payouts.
  ///
  /// In en, this message translates to:
  /// **'Payouts'**
  String get payouts;

  /// No description provided for @payoutsSub.
  ///
  /// In en, this message translates to:
  /// **'Weekly received amounts and vouchers'**
  String get payoutsSub;

  /// No description provided for @fleet.
  ///
  /// In en, this message translates to:
  /// **'My fleet'**
  String get fleet;

  /// No description provided for @fleetSub.
  ///
  /// In en, this message translates to:
  /// **'Your vehicles and custom pricing'**
  String get fleetSub;

  /// No description provided for @catalog.
  ///
  /// In en, this message translates to:
  /// **'Catalog'**
  String get catalog;

  /// No description provided for @catalogSub.
  ///
  /// In en, this message translates to:
  /// **'Platform vehicles, transfers and tours'**
  String get catalogSub;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @profileSub.
  ///
  /// In en, this message translates to:
  /// **'Photo, documents and approval status'**
  String get profileSub;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @settingsSub.
  ///
  /// In en, this message translates to:
  /// **'Language, notifications and session'**
  String get settingsSub;

  /// No description provided for @vehiclesTab.
  ///
  /// In en, this message translates to:
  /// **'Vehicles'**
  String get vehiclesTab;

  /// No description provided for @transfersTab.
  ///
  /// In en, this message translates to:
  /// **'Transfers'**
  String get transfersTab;

  /// No description provided for @toursTab.
  ///
  /// In en, this message translates to:
  /// **'Tours'**
  String get toursTab;

  /// No description provided for @addToFleet.
  ///
  /// In en, this message translates to:
  /// **'Add to fleet'**
  String get addToFleet;

  /// No description provided for @addVehicle.
  ///
  /// In en, this message translates to:
  /// **'Add vehicle'**
  String get addVehicle;

  /// No description provided for @customPricing.
  ///
  /// In en, this message translates to:
  /// **'Custom pricing'**
  String get customPricing;

  /// No description provided for @savePricing.
  ///
  /// In en, this message translates to:
  /// **'Save pricing'**
  String get savePricing;

  /// No description provided for @fromCatalog.
  ///
  /// In en, this message translates to:
  /// **'Select from catalog'**
  String get fromCatalog;

  /// No description provided for @newVehicleClass.
  ///
  /// In en, this message translates to:
  /// **'Submit new vehicle class'**
  String get newVehicleClass;

  /// No description provided for @plateNumber.
  ///
  /// In en, this message translates to:
  /// **'Plate number'**
  String get plateNumber;

  /// No description provided for @uploadPhotos.
  ///
  /// In en, this message translates to:
  /// **'Upload photos'**
  String get uploadPhotos;

  /// No description provided for @pendingApproval.
  ///
  /// In en, this message translates to:
  /// **'Pending approval'**
  String get pendingApproval;

  /// No description provided for @pendingApprovalMsg.
  ///
  /// In en, this message translates to:
  /// **'Your account is under review. You cannot receive offers until approved.'**
  String get pendingApprovalMsg;

  /// No description provided for @completeOnboarding.
  ///
  /// In en, this message translates to:
  /// **'Complete setup'**
  String get completeOnboarding;

  /// No description provided for @onboardingCatalog.
  ///
  /// In en, this message translates to:
  /// **'Select from catalog to add to your fleet'**
  String get onboardingCatalog;

  /// No description provided for @onboardingDocuments.
  ///
  /// In en, this message translates to:
  /// **'Upload your documents for approval'**
  String get onboardingDocuments;

  /// No description provided for @documents.
  ///
  /// In en, this message translates to:
  /// **'Documents'**
  String get documents;

  /// No description provided for @uploadDocument.
  ///
  /// In en, this message translates to:
  /// **'Upload document'**
  String get uploadDocument;

  /// No description provided for @approvalStatus.
  ///
  /// In en, this message translates to:
  /// **'Approval status'**
  String get approvalStatus;

  /// No description provided for @approved.
  ///
  /// In en, this message translates to:
  /// **'Approved'**
  String get approved;

  /// No description provided for @pending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get pending;

  /// No description provided for @rejected.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get rejected;

  /// No description provided for @completedTrips.
  ///
  /// In en, this message translates to:
  /// **'Completed trips'**
  String get completedTrips;

  /// No description provided for @rating.
  ///
  /// In en, this message translates to:
  /// **'Rating'**
  String get rating;

  /// No description provided for @platformCommission.
  ///
  /// In en, this message translates to:
  /// **'Platform commission'**
  String get platformCommission;

  /// No description provided for @dailyEarnings.
  ///
  /// In en, this message translates to:
  /// **'Daily'**
  String get dailyEarnings;

  /// No description provided for @weeklyEarnings.
  ///
  /// In en, this message translates to:
  /// **'Weekly'**
  String get weeklyEarnings;

  /// No description provided for @monthlyEarnings.
  ///
  /// In en, this message translates to:
  /// **'Monthly'**
  String get monthlyEarnings;

  /// No description provided for @byServiceType.
  ///
  /// In en, this message translates to:
  /// **'By service type'**
  String get byServiceType;

  /// No description provided for @commissionBreakdown.
  ///
  /// In en, this message translates to:
  /// **'Commission breakdown'**
  String get commissionBreakdown;

  /// No description provided for @downloadVoucher.
  ///
  /// In en, this message translates to:
  /// **'Download voucher'**
  String get downloadVoucher;

  /// No description provided for @noActiveTrips.
  ///
  /// In en, this message translates to:
  /// **'No active trips'**
  String get noActiveTrips;

  /// No description provided for @noPayouts.
  ///
  /// In en, this message translates to:
  /// **'No payouts yet'**
  String get noPayouts;

  /// No description provided for @publishLocation.
  ///
  /// In en, this message translates to:
  /// **'Publish location'**
  String get publishLocation;

  /// No description provided for @stopTracking.
  ///
  /// In en, this message translates to:
  /// **'Stop tracking'**
  String get stopTracking;

  /// No description provided for @tripStatus.
  ///
  /// In en, this message translates to:
  /// **'Trip status'**
  String get tripStatus;

  /// No description provided for @enRoute.
  ///
  /// In en, this message translates to:
  /// **'En route'**
  String get enRoute;

  /// No description provided for @arrived.
  ///
  /// In en, this message translates to:
  /// **'Arrived'**
  String get arrived;

  /// No description provided for @onboard.
  ///
  /// In en, this message translates to:
  /// **'Onboard'**
  String get onboard;

  /// No description provided for @completed.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completed;

  /// No description provided for @registerTitle.
  ///
  /// In en, this message translates to:
  /// **'Driver registration'**
  String get registerTitle;

  /// No description provided for @submitForApproval.
  ///
  /// In en, this message translates to:
  /// **'Submit for approval'**
  String get submitForApproval;

  /// No description provided for @accountDetails.
  ///
  /// In en, this message translates to:
  /// **'Account details'**
  String get accountDetails;

  /// No description provided for @payoutDetails.
  ///
  /// In en, this message translates to:
  /// **'Payout details'**
  String get payoutDetails;

  /// No description provided for @accountHolder.
  ///
  /// In en, this message translates to:
  /// **'Account holder'**
  String get accountHolder;

  /// No description provided for @bankName.
  ///
  /// In en, this message translates to:
  /// **'Bank name'**
  String get bankName;

  /// No description provided for @savePayout.
  ///
  /// In en, this message translates to:
  /// **'Save payout details'**
  String get savePayout;

  /// No description provided for @payoutSaved.
  ///
  /// In en, this message translates to:
  /// **'Payout details saved'**
  String get payoutSaved;

  /// No description provided for @notificationsComingSoon.
  ///
  /// In en, this message translates to:
  /// **'Notification preferences coming soon'**
  String get notificationsComingSoon;

  /// No description provided for @tenantCodeLabel.
  ///
  /// In en, this message translates to:
  /// **'Agency code'**
  String get tenantCodeLabel;

  /// No description provided for @tenantCodeHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. alrayyan'**
  String get tenantCodeHint;

  /// No description provided for @tenantCodeRequired.
  ///
  /// In en, this message translates to:
  /// **'Agency code is required'**
  String get tenantCodeRequired;

  /// No description provided for @emailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get emailLabel;

  /// No description provided for @emailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email'**
  String get emailInvalid;

  /// No description provided for @passwordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get passwordLabel;

  /// No description provided for @passwordMinLength.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get passwordMinLength;

  /// No description provided for @registerNewSupplier.
  ///
  /// In en, this message translates to:
  /// **'Register as new supplier'**
  String get registerNewSupplier;

  /// No description provided for @selectVehicleClass.
  ///
  /// In en, this message translates to:
  /// **'Select a vehicle class'**
  String get selectVehicleClass;

  /// No description provided for @vehicleCodeLabel.
  ///
  /// In en, this message translates to:
  /// **'Vehicle code'**
  String get vehicleCodeLabel;

  /// No description provided for @capacityLabel.
  ///
  /// In en, this message translates to:
  /// **'Passenger capacity'**
  String get capacityLabel;

  /// No description provided for @routePricingHint.
  ///
  /// In en, this message translates to:
  /// **'Set your route prices in Route pricing'**
  String get routePricingHint;

  /// No description provided for @routePricingTitle.
  ///
  /// In en, this message translates to:
  /// **'Route pricing'**
  String get routePricingTitle;

  /// No description provided for @tourOffersTitle.
  ///
  /// In en, this message translates to:
  /// **'Tour offers'**
  String get tourOffersTitle;

  /// No description provided for @transferPriceLabel.
  ///
  /// In en, this message translates to:
  /// **'Transfer price'**
  String get transferPriceLabel;

  /// No description provided for @tourPriceLabel.
  ///
  /// In en, this message translates to:
  /// **'Tour price'**
  String get tourPriceLabel;

  /// No description provided for @continueWithLogin.
  ///
  /// In en, this message translates to:
  /// **'Already registered? Sign in'**
  String get continueWithLogin;

  /// No description provided for @pushNotificationsHint.
  ///
  /// In en, this message translates to:
  /// **'Receive trip and payout alerts when push is enabled'**
  String get pushNotificationsHint;

  /// No description provided for @pushNotificationsEnabled.
  ///
  /// In en, this message translates to:
  /// **'Push notifications enabled'**
  String get pushNotificationsEnabled;

  /// No description provided for @pushNotificationsDisabled.
  ///
  /// In en, this message translates to:
  /// **'Push notifications disabled'**
  String get pushNotificationsDisabled;

  /// No description provided for @subDriversTitle.
  ///
  /// In en, this message translates to:
  /// **'Sub-drivers'**
  String get subDriversTitle;

  /// No description provided for @subDriversSub.
  ///
  /// In en, this message translates to:
  /// **'Manage drivers under your company account'**
  String get subDriversSub;

  /// No description provided for @addSubDriver.
  ///
  /// In en, this message translates to:
  /// **'Add sub-driver'**
  String get addSubDriver;

  /// No description provided for @subDriverName.
  ///
  /// In en, this message translates to:
  /// **'Driver name'**
  String get subDriverName;

  /// No description provided for @subDriverPhone.
  ///
  /// In en, this message translates to:
  /// **'Phone number'**
  String get subDriverPhone;

  /// No description provided for @subDriverLicense.
  ///
  /// In en, this message translates to:
  /// **'License number'**
  String get subDriverLicense;

  /// No description provided for @subDriversEmpty.
  ///
  /// In en, this message translates to:
  /// **'No sub-drivers yet'**
  String get subDriversEmpty;

  /// No description provided for @subDriversCompanyOnly.
  ///
  /// In en, this message translates to:
  /// **'Sub-drivers are available for company accounts only'**
  String get subDriversCompanyOnly;

  /// No description provided for @registerStepAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get registerStepAccount;

  /// No description provided for @registerStepPayout.
  ///
  /// In en, this message translates to:
  /// **'Payout'**
  String get registerStepPayout;

  /// No description provided for @registerStepDocuments.
  ///
  /// In en, this message translates to:
  /// **'Documents'**
  String get registerStepDocuments;

  /// No description provided for @registerStepReview.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get registerStepReview;

  /// No description provided for @registerNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get registerNext;

  /// No description provided for @registerBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get registerBack;

  /// No description provided for @registerDocumentsHint.
  ///
  /// In en, this message translates to:
  /// **'Upload your license or company documents (optional — you can add more later)'**
  String get registerDocumentsHint;

  /// No description provided for @registerReviewHint.
  ///
  /// In en, this message translates to:
  /// **'Review your details before submitting for approval'**
  String get registerReviewHint;

  /// No description provided for @registerTradeName.
  ///
  /// In en, this message translates to:
  /// **'Trade name'**
  String get registerTradeName;

  /// No description provided for @registerPhone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get registerPhone;

  /// No description provided for @registerDriverCount.
  ///
  /// In en, this message translates to:
  /// **'Driver count'**
  String get registerDriverCount;

  /// No description provided for @registerAcceptCommission.
  ///
  /// In en, this message translates to:
  /// **'I accept the platform commission'**
  String get registerAcceptCommission;

  /// No description provided for @registerDocAdded.
  ///
  /// In en, this message translates to:
  /// **'Document added'**
  String get registerDocAdded;

  /// No description provided for @registerPickDocument.
  ///
  /// In en, this message translates to:
  /// **'Add document'**
  String get registerPickDocument;

  /// No description provided for @offlineCatalogCache.
  ///
  /// In en, this message translates to:
  /// **'Showing cached catalog — refreshing…'**
  String get offlineCatalogCache;

  /// No description provided for @platformLabel.
  ///
  /// In en, this message translates to:
  /// **'Lonaliza Global Platform'**
  String get platformLabel;

  /// No description provided for @platformDriverOnlyHint.
  ///
  /// In en, this message translates to:
  /// **'Official Lonaliza chauffeurs & licensed fleet partners — managed via lonaliza.com'**
  String get platformDriverOnlyHint;

  /// No description provided for @dashboardTitle.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get dashboardTitle;

  /// No description provided for @menuTitle.
  ///
  /// In en, this message translates to:
  /// **'Menu'**
  String get menuTitle;

  /// No description provided for @statActiveTrips.
  ///
  /// In en, this message translates to:
  /// **'Active trips'**
  String get statActiveTrips;

  /// No description provided for @statPendingOffers.
  ///
  /// In en, this message translates to:
  /// **'Pending offers'**
  String get statPendingOffers;

  /// No description provided for @statFleet.
  ///
  /// In en, this message translates to:
  /// **'Fleet vehicles'**
  String get statFleet;

  /// No description provided for @statCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get statCompleted;

  /// No description provided for @statTotalBookings.
  ///
  /// In en, this message translates to:
  /// **'Total bookings'**
  String get statTotalBookings;

  /// No description provided for @statEarnings.
  ///
  /// In en, this message translates to:
  /// **'Net earnings'**
  String get statEarnings;

  /// No description provided for @statDrivers.
  ///
  /// In en, this message translates to:
  /// **'Company drivers'**
  String get statDrivers;

  /// No description provided for @nextBooking.
  ///
  /// In en, this message translates to:
  /// **'Next booking'**
  String get nextBooking;

  /// No description provided for @liveBookings.
  ///
  /// In en, this message translates to:
  /// **'Live bookings now'**
  String get liveBookings;

  /// No description provided for @noUpcomingBooking.
  ///
  /// In en, this message translates to:
  /// **'No upcoming bookings scheduled'**
  String get noUpcomingBooking;

  /// No description provided for @bookingReminder.
  ///
  /// In en, this message translates to:
  /// **'Upcoming trip in {hours} hours'**
  String bookingReminder(int hours);

  /// No description provided for @vehicleNameEn.
  ///
  /// In en, this message translates to:
  /// **'Vehicle name (English)'**
  String get vehicleNameEn;

  /// No description provided for @vehicleNameAr.
  ///
  /// In en, this message translates to:
  /// **'Vehicle name (Arabic)'**
  String get vehicleNameAr;

  /// No description provided for @vehicleNameTr.
  ///
  /// In en, this message translates to:
  /// **'Vehicle name (Turkish)'**
  String get vehicleNameTr;

  /// No description provided for @bookingReminderNotificationTitle.
  ///
  /// In en, this message translates to:
  /// **'Upcoming trip reminder'**
  String get bookingReminderNotificationTitle;

  /// No description provided for @bookingReminderNotificationBody.
  ///
  /// In en, this message translates to:
  /// **'Booking {reference} starts in {hours} hours'**
  String bookingReminderNotificationBody(String reference, int hours);

  /// No description provided for @liveMap.
  ///
  /// In en, this message translates to:
  /// **'Live Fleet Map'**
  String get liveMap;

  /// No description provided for @liveMapSub.
  ///
  /// In en, this message translates to:
  /// **'Track vehicles and drivers on an interactive map in real time'**
  String get liveMapSub;

  /// No description provided for @quoteRequests.
  ///
  /// In en, this message translates to:
  /// **'Quote Requests'**
  String get quoteRequests;

  /// No description provided for @quoteRequestsSub.
  ///
  /// In en, this message translates to:
  /// **'Submit price bids to clients and agencies'**
  String get quoteRequestsSub;

  /// No description provided for @reviewsAndRatings.
  ///
  /// In en, this message translates to:
  /// **'Reviews & Ratings'**
  String get reviewsAndRatings;

  /// No description provided for @reviewsAndRatingsSub.
  ///
  /// In en, this message translates to:
  /// **'Passenger reviews and service quality scores'**
  String get reviewsAndRatingsSub;

  /// No description provided for @aiTourCreator.
  ///
  /// In en, this message translates to:
  /// **'AI Tour Studio'**
  String get aiTourCreator;

  /// No description provided for @aiTourCreatorSub.
  ///
  /// In en, this message translates to:
  /// **'Generate full itineraries with AI assistance'**
  String get aiTourCreatorSub;

  /// No description provided for @flightRadar.
  ///
  /// In en, this message translates to:
  /// **'Live Flight Radar'**
  String get flightRadar;

  /// No description provided for @welcomeSign.
  ///
  /// In en, this message translates to:
  /// **'VIP Welcome Sign'**
  String get welcomeSign;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en', 'tr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
    case 'tr':
      return AppLocalizationsTr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
