import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/app_dio.dart';
import 'app_locale_provider.dart';

/// App-wide [Dio] (timeouts, default headers). Watch from any feature provider.
///
/// [Accept-Language] follows [appLocaleNotifierProvider] on every request.
final dioProvider = Provider<Dio>((ref) {
  final dio = createAppDio();
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        final locale = ref.read(appLocaleNotifierProvider);
        options.headers['Accept-Language'] = acceptLanguageTagForLocale(locale);
        handler.next(options);
      },
    ),
  );
  return dio;
});

/// [get]/[post] with optional Bearer; pass [authTokenGetter] when auth layer exists.
final appDioClientProvider = Provider<AppDioClient>((ref) {
  return AppDioClient(
    ref.watch(dioProvider),
    authTokenGetter: null,
  );
});
