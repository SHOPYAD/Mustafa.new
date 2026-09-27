import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../domain/entities/flights/catalog_airline.dart';
import 'flight_repository_provider.dart';

final airlinesNotifierProvider = NotifierProvider<AirlinesNotifier,
    AsyncValue<Map<String, CatalogAirline>>>(AirlinesNotifier.new);

class AirlinesNotifier
    extends Notifier<AsyncValue<Map<String, CatalogAirline>>> {

  @override
  AsyncValue<Map<String, CatalogAirline>> build() {
    return const AsyncData({});
  }

  void cancel() {
    // No longer needed
  }

  void setAirlines(List<CatalogAirline> airlines) {
    // نحوّل القائمة إلى Map للبحث السريع: {"EK": CatalogAirline, ...}
    final airlinesMap = {for (final a in airlines) a.iata: a};
    state = AsyncData(airlinesMap);
  }
}

