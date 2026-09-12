import '../../domain/entities/place_search_hit.dart';
import 'place_search_address_model.dart';

/// Nominatim (or compatible) JSON → [PlaceSearchHit]; can round-trip with [toJson].
class PlaceSearchHitModel extends PlaceSearchHit {
  PlaceSearchHitModel({
    required super.id,
    required super.name,
    required super.displayName,
    required super.location,
    super.latitude,
    super.longitude,
    super.osmType,
    super.osmId,
    super.countryCode,
    super.boundingBox,
    super.imageUrl,
    super.address,
  });

  factory PlaceSearchHitModel.fromJson(Map<String, dynamic> json) {
    var id = _readId(json);
    if (id.isEmpty) {
      final dn = json['display_name'];
      if (dn is String && dn.isNotEmpty) {
        id = 'n_${dn.hashCode}';
      } else {
        id = 'unknown';
      }
    }
    final name = _readName(json);
    final displayName = _readDisplayName(json, name);
    final location = _readLocation(json, name);

    return PlaceSearchHitModel(
      id: id,
      name: name,
      displayName: displayName,
      location: location,
      latitude: _readDouble(json['lat']),
      longitude: _readDouble(json['lon']),
      osmType: json['osm_type']?.toString(),
      osmId: json['osm_id']?.toString(),
      countryCode: _readCountryCode(json),
      boundingBox: _readBoundingBox(json),
      imageUrl: json['image_url']?.toString(),
      address: _readAddress(json),
    );
  }

  Map<String, dynamic> toJson() {
    final img = imageUrl;
    return <String, dynamic>{
      'id': id,
      'name': name,
      'display_name': displayName,
      if (location.isNotEmpty) 'location': location,
      if (latitude != null) 'lat': latitude,
      if (longitude != null) 'lon': longitude,
      if (osmType != null) 'osm_type': osmType,
      if (osmId != null) 'osm_id': osmId,
      if (countryCode != null) 'country_code': countryCode,
      if (boundingBox != null) 'boundingbox': boundingBox,
      if (img != null && img.isNotEmpty) 'image_url': img,
      if (address != null) 'address': PlaceSearchAddressModel.toJsonMap(address!),
    };
  }
}

String _readId(Map<String, dynamic> json) {
  final placeId = json['place_id'];
  if (placeId != null) return placeId.toString();
  final osmType = json['osm_type'];
  final osmId = json['osm_id'];
  if (osmType != null && osmId != null) return '${osmType}_$osmId';
  return '';
}

String _readDisplayName(Map<String, dynamic> json, String name) {
  final dn = json['display_name'];
  if (dn is String && dn.trim().isNotEmpty) return dn.trim();
  return name;
}

String _readName(Map<String, dynamic> json) {
  final addr = json['address'];
  if (addr is Map) {
    final map = Map<String, dynamic>.from(addr);
    for (final key in <String>[
      'city',
      'town',
      'village',
      'hamlet',
      'municipality',
      'state',
      'county',
      'region',
    ]) {
      final v = map[key];
      if (v is String && v.trim().isNotEmpty) return v.trim();
    }
  }
  final dn = json['display_name'];
  if (dn is String && dn.contains(',')) {
    return dn.split(',').first.trim();
  }
  if (dn is String && dn.trim().isNotEmpty) return dn.trim();
  return 'Unknown';
}

String _readLocation(Map<String, dynamic> json, String name) {
  final addr = json['address'];
  if (addr is Map) {
    final map = Map<String, dynamic>.from(addr);
    final parts = <String>[];
    final state = map['state'] ?? map['region'] ?? map['county'];
    if (state is String && state.trim().isNotEmpty && state.trim() != name) {
      parts.add(state.trim());
    }
    final country = map['country'];
    if (country is String && country.trim().isNotEmpty) {
      parts.add(country.trim());
    }
    if (parts.isNotEmpty) return parts.join(', ');
  }
  final dn = json['display_name'];
  if (dn is String && dn.contains(',')) {
    final segs = dn.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
    if (segs.length > 1) return segs.sublist(1).join(', ');
  }
  return '';
}

String? _readCountryCode(Map<String, dynamic> json) {
  final addr = json['address'];
  if (addr is! Map) return null;
  final cc = Map<String, dynamic>.from(addr)['country_code'];
  if (cc is String && cc.isNotEmpty) return cc.toLowerCase();
  return null;
}

PlaceSearchAddressModel? _readAddress(Map<String, dynamic> json) {
  final addr = json['address'];
  if (addr is! Map) return null;
  return PlaceSearchAddressModel.fromJson(Map<String, dynamic>.from(addr));
}

List<String>? _readBoundingBox(Map<String, dynamic> json) {
  final b = json['boundingbox'];
  if (b is! List<dynamic>) return null;
  return b.map((e) => e.toString()).toList();
}

double? _readDouble(Object? value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value);
  return null;
}
