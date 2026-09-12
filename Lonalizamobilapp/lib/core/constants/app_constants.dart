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

  static const String placesSearchUrl = '$mobileApiBase/api/mobile/v1/places';

  static const String nominatimSearchUrl = '$placesSearchUrl?type=hotels';

  /// Live flight search on the Lonaliza mobile BFF (website engine + markup).
  static const String flightSearchUrl =
      '$mobileApiBase/api/mobile/v1/flights/search';

  static const String flightBookUrl = '$mobileApiBase/api/mobile/v1/flights/book';

  static const String hotelSearchUrl = '$mobileApiBase/api/mobile/v1/hotels/search';

  static const String hotelDetailsUrl =
      '$mobileApiBase/api/mobile/v1/hotels/details';

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

  static const String accountWalletUrl =
      '$mobileApiBase/api/mobile/v1/account/wallet';

  static const String accountPaymentsUrl =
      '$mobileApiBase/api/mobile/v1/account/payments';

  static const String loyaltyApplyUrl =
      '$mobileApiBase/api/mobile/v1/account/loyalty/apply';

  static const String toursCatalogUrl =
      '$mobileApiBase/api/mobile/v1/catalog/tours';

  static const String catalogLocationSearchUrl = '$placesSearchUrl?type=airports';

  static const String flightConfirmPriceUrl =
      '$mobileApiBase/api/mobile/v1/flights/quote';

  static const String flightExtrasUrl =
      '$mobileApiBase/api/mobile/v1/flights/extras';

  static const String flightAncillaryUrl =
      '$mobileApiBase/api/mobile/v1/flights/ancillary';

  static const String communityFeedUrl =
      '$mobileApiBase/api/mobile/v1/community/feed';

  static const String communityPublishUrl =
      '$mobileApiBase/api/mobile/v1/community/publish';

  static const String communityCommentsUrl =
      '$mobileApiBase/api/mobile/v1/community/comments';

  static const String communityCommentsLikeUrl =
      '$mobileApiBase/api/mobile/v1/community/comments/like';

  static const String communityRewardUrl =
      '$mobileApiBase/api/mobile/v1/community/reward';

  static const String communityBuddiesUrl =
      '$mobileApiBase/api/mobile/v1/community/buddies';

  static const String communityCreatorStatsUrl =
      '$mobileApiBase/api/mobile/v1/community/creator/stats';

  static const String aiSalesChatUrl =
      '$mobileApiBase/api/mobile/v1/ai/sales-chat';

  static const String aiSearchAgentUrl =
      '$mobileApiBase/api/mobile/v1/ai/search-agent';

  static const String accountInboxUrl =
      '$mobileApiBase/api/mobile/v1/account/inbox';

  static String accountInboxThreadUrl(String id) => '$accountInboxUrl/$id';

  static const String accountRecentlyViewedUrl =
      '$mobileApiBase/api/mobile/v1/account/recently-viewed';

  static const String accountCardsUrl =
      '$mobileApiBase/api/mobile/v1/account/cards';

  static const String giftCardsUrl = '$mobileApiBase/api/mobile/v1/gift-cards';

  static const String giftCardsRedeemUrl =
      '$mobileApiBase/api/mobile/v1/gift-cards/redeem';

  static const String homeFeaturedUrl =
      '$mobileApiBase/api/mobile/v1/home/featured';

  static const String onboardingDoneKey = 'lonaliza_onboarding_done';
}
