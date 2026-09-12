import 'place_search_address.dart';

/// Data-only row for destination / geocode search (Nominatim-aligned).
///
/// No logic here; mapping lives in `data` models.
class PlaceSearchHit {
  const PlaceSearchHit({
    required this.id,
    required this.name,
    required this.displayName,
    required this.location,
    this.latitude,
    this.longitude,
    this.osmType,
    this.osmId,
    this.countryCode,
    this.boundingBox,
    this.imageUrl,
    this.address,
  });

  /// Nominatim `place_id` as string (or synthetic fallback in mapper).
  final String id;

  /// Short label (`name` from API or first segment of `display_name`).
  final String name;

  /// Full `display_name` from API.
  final String displayName;

  /// Secondary line for UI (region, country, …).
  final String location;

  final double? latitude;
  final double? longitude;

  final String? osmType;
  final String? osmId;

  /// Lowercase ISO country code when present (`address.country_code`).
  final String? countryCode;

  /// Nominatim order: south, north, west, east.
  final List<String>? boundingBox;

  /// Optional image URL when a backend provides one (often null for OSM search).
  final String? imageUrl;

  /// Structured address when present from upstream API.
  final PlaceSearchAddress? address;
}
