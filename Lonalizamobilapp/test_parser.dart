import 'dart:convert';
import 'dart:io';
import 'package:liotrip/data/models/flights/flight_offer_model.dart';
import 'package:liotrip/core/network/n8n_response_normalizer.dart';

void main() {
  try {
    print('Reading filejson.json...');
    final file = File('filejson.json');
    final rawString = file.readAsStringSync();
    final rawJson = jsonDecode(rawString);
    
    print('Extracting searchFlightsV2...');
    final sf = N8nResponseNormalizer.extractOr<Map>(
      rawJson,
      'searchFlightsV2',
      const <String, dynamic>{},
    );
    
    print('Raw searchFlightsV2 extracted: ${sf.isNotEmpty}');
    print('Parsing FlightSearchResponseModel...');
    
    final parsed = FlightSearchResponseModel.fromJson(
      sf.cast<String, dynamic>(),
    );
    
    print('Success! Total offers: ${parsed.offers.length}');
  } catch (e, stackTrace) {
    print('Error occurred during parsing:');
    print(e);
    print(stackTrace);
  }
}
