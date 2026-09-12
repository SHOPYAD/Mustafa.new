// Live check against Nominatim. Prints [PlaceSearchHitModel.toJson] as JSON.
//
//   dart run tool/place_search_live.dart
//   dart run tool/place_search_live.dart Algiers

import 'dart:convert';

import 'package:liotrip/core/network/app_dio.dart';
import 'package:liotrip/data/models/place_search_hit_model.dart';
import 'package:liotrip/data/repositories/place_search_repository_impl.dart';

Future<void> main(List<String> args) async {
  final query = args.isEmpty ? 'Paris' : args.join(' ');
  final repo = PlaceSearchRepositoryImpl(AppDioClient(createAppDio()));

  final hits = await repo.searchPlaces(query, limit: 5);
  final rows = <Map<String, dynamic>>[];
  for (final h in hits) {
    if (h is PlaceSearchHitModel) {
      rows.add(h.toJson());
    }
  }

  // ignore: avoid_print
  print(const JsonEncoder.withIndent('  ').convert(rows));
}
