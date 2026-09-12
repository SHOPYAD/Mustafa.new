import '../../domain/entities/place_search_address.dart';

/// JSON mapper for Nominatim `address` object.
class PlaceSearchAddressModel extends PlaceSearchAddress {
  const PlaceSearchAddressModel({
    super.city,
    super.county,
    super.state,
    super.country,
    super.countryCode,
    super.postcode,
    super.raw,
  });

  factory PlaceSearchAddressModel.fromJson(Map<String, dynamic> json) {
    final raw = <String, String>{};
    json.forEach((key, value) {
      if (value != null) raw[key] = value.toString();
    });

    String? pick(List<String> keys) {
      for (final key in keys) {
        final v = json[key];
        if (v is String && v.trim().isNotEmpty) return v.trim();
      }
      return null;
    }

    return PlaceSearchAddressModel(
      city: pick(const ['city', 'town', 'village', 'hamlet', 'municipality']),
      county: pick(const ['county']),
      state: pick(const ['state', 'region']),
      country: pick(const ['country']),
      countryCode: pick(const ['country_code'])?.toLowerCase(),
      postcode: pick(const ['postcode']),
      raw: raw,
    );
  }

  static Map<String, dynamic> toJsonMap(PlaceSearchAddress address) {
    final out = <String, dynamic>{...address.raw};
    if (address.city != null && address.city!.isNotEmpty) out['city'] = address.city;
    if (address.county != null && address.county!.isNotEmpty) out['county'] = address.county;
    if (address.state != null && address.state!.isNotEmpty) out['state'] = address.state;
    if (address.country != null && address.country!.isNotEmpty) out['country'] = address.country;
    if (address.countryCode != null && address.countryCode!.isNotEmpty) {
      out['country_code'] = address.countryCode;
    }
    if (address.postcode != null && address.postcode!.isNotEmpty) out['postcode'] = address.postcode;
    return out;
  }
}
