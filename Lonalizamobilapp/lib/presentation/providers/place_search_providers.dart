import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/place_search_repository_impl.dart';
import '../../domain/repositories/place_search_repository.dart';
import 'dio_provider.dart';

final placeSearchRepositoryProvider = Provider<PlaceSearchRepository>((ref) {
  return PlaceSearchRepositoryImpl(ref.watch(appDioClientProvider));
});
