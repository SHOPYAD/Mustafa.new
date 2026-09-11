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

  /// Local-network webhook endpoint for flight search.
  static const String flightSearchUrl = '$urlAddress/webhook/flight-search';

  /// Local-network webhook endpoint for airline dictionary lookup.
  static const String airlinesUrl = '$urlAddress/webhook/airlines';

  /// Local-network webhook endpoint for catalog location (airport/city) search.
  static const String catalogLocationSearchUrl =
      '$urlAddress/webhook/catalog-locations';

  /// Local-network webhook endpoint for flight price confirmation.
  static const String flightConfirmPriceUrl =
      '$urlAddress/webhook/flight-pricing';
}
