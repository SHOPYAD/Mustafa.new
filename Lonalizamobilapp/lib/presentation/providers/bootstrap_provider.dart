import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/bootstrap/app_bootstrap.dart';
import '../../core/constants/app_constants.dart';
import 'dio_provider.dart';

final bootstrapProvider = FutureProvider<AppBootstrap>((ref) async {
  final dio = ref.watch(dioProvider);
  try {
    final res = await dio.get<Map<String, dynamic>>(
      '${AppConstants.mobileApiBase}/api/mobile/v1/bootstrap',
    );
    return AppBootstrap.fromJson(res.data ?? const {});
  } on DioException {
    return const AppBootstrap(
      services: ['flight', 'hotel', 'cars', 'transfers', 'holiday'],
      locales: ['ar', 'en', 'tr', 'fr'],
      currencies: ['USD'],
    );
  }
});
