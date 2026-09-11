import 'package:flutter_test/flutter_test.dart';
import 'package:liotrip/core/constants/app_constants.dart';
import 'package:liotrip/data/models/flights/flight_offer_model.dart';

void main() {
  test('flight search points at the mobile BFF, not n8n', () {
    expect(AppConstants.flightSearchUrl.contains('/api/mobile/v1/flights/search'), isTrue);
    expect(AppConstants.flightSearchUrl.contains('192.168.1.7'), isFalse);
  });

  test('website-shaped offers keep id and client total', () {
    final parsed = FlightSearchResponseModel.fromJson({
      'source': 'lonaliza',
      'meta': {'totalResults': 1, 'searchDurationMs': 0, 'traceId': 'sess-1'},
      'offers': [
        {
          'id': 'offer-77',
          'pricing': {'total': 108, 'currency': 'USD'},
          'itineraries': [],
        },
      ],
      'airlines': [],
      'loyalty': {},
    });
    expect(parsed.offers.single.id, 'offer-77');
    expect(parsed.offers.single.pricing.total, 108);
  });
}
