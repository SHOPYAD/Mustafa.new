/// Application-wide constant values (keys, defaults, limits, etc.).
abstract final class AppConstants {
  AppConstants._();

  /// [Dio] connect handshake timeout.
  static const Duration httpConnectTimeout = Duration(seconds: 15);

  /// [Dio] response body wait timeout.
  static const Duration httpReceiveTimeout = Duration(seconds: 30);

  /// [Dio] upload / request body send timeout.
  static const Duration httpSendTimeout = Duration(seconds: 30);

  /// The duration of the flight search countdown timer in seconds.
  static const int flightSearchTimeoutSeconds = 160;

  /// Lonaliza website origin for the mobile BFF. Override with `--dart-define=MOBILE_API_BASE=`.
  static const String mobileApiBase = String.fromEnvironment(
    'MOBILE_API_BASE',
    defaultValue: 'https://lonaliza.com',
  );

  /// Base URL Address for local network server.
  static const String urlAddress = 'http://192.168.1.7:5678';

  /// Local-network webhook endpoint for place search.
  static const String nominatimSearchUrl = '$urlAddress/webhook/get-locations';

  /// Live flight search on the Lonaliza mobile BFF (website engine + markup).
  static const String flightSearchUrl =
      '$mobileApiBase/api/mobile/v1/flights/search';

  static const String flightBookUrl = '$mobileApiBase/api/mobile/v1/flights/book';

  static const String hotelSearchUrl = '$mobileApiBase/api/mobile/v1/hotels/search';

  static const String hotelQuoteUrl = '$mobileApiBase/api/mobile/v1/hotels/quote';

  static const String hotelBookUrl = '$mobileApiBase/api/mobile/v1/hotels/book';

  static const String carsCatalogUrl = '$mobileApiBase/api/mobile/v1/catalog/cars';

  static const String packagesCatalogUrl =
      '$mobileApiBase/api/mobile/v1/catalog/packages';

  static const String transfersCatalogUrl =
      '$mobileApiBase/api/mobile/v1/catalog/transfers';

  static const String catalogEnquireUrl =
      '$mobileApiBase/api/mobile/v1/catalog/enquire';

  static const String accountBookingsUrl =
      '$mobileApiBase/api/mobile/v1/account/bookings';

  static const String accountProfileUrl =
      '$mobileApiBase/api/mobile/v1/account/profile';

  static const String accountAffiliateUrl =
      '$mobileApiBase/api/mobile/v1/account/affiliate';

  static const String iyzicoInitUrl =
      '$mobileApiBase/api/mobile/v1/payments/iyzico/init';

  static const String iyzicoStatusUrl =
      '$mobileApiBase/api/mobile/v1/payments/iyzico/status';

  /// Local-network webhook endpoint for airline dictionary lookup.
  static const String airlinesUrl = '$urlAddress/webhook/airlines';

  /// Local-network webhook endpoint for catalog location (airport/city) search.
  static const String catalogLocationSearchUrl =
      '$urlAddress/webhook/catalog-locations';

  /// Local-network webhook endpoint for flight price confirmation.
  static const String flightConfirmPriceUrl =
      '$urlAddress/webhook/flight-pricing';
}
