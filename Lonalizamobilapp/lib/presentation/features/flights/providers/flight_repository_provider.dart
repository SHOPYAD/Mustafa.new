import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../data/repositories/flight_repository_impl.dart';
import '../../../../domain/repositories/flight_repository.dart';
import '../../../providers/dio_provider.dart';

/// Provides the FlightRepository implementation.
final flightRepositoryProvider = Provider<FlightRepository>((ref) {
  return FlightRepositoryImpl(ref.watch(appDioClientProvider));
});
