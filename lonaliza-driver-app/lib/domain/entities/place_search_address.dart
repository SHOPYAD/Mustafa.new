/// Structured place address (Nominatim `address` object subset + passthrough extras).
class PlaceSearchAddress {
  const PlaceSearchAddress({
    this.city,
    this.county,
    this.state,
    this.country,
    this.countryCode,
    this.postcode,
    this.raw = const <String, String>{},
  });

  final String? city;
  final String? county;
  final String? state;
  final String? country;
  final String? countryCode;
  final String? postcode;

  /// Extra normalized key/value pairs from upstream address payload.
  final Map<String, String> raw;
}
