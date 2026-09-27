import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../constants/app_constants.dart';

/// Client identifier for Lonaliza Platform API.
const String _defaultUserAgent = 'LonalizaDriver/2.0 (https://lonaliza.com)';

/// Allowed range for per-request timeouts passed to [AppDioClient.get] / [post] (clamped).
const Duration kDioConnectTimeoutMin = Duration(seconds: 1);
const Duration kDioConnectTimeoutMax = Duration(seconds: 60);
const Duration kDioReceiveTimeoutMin = Duration(seconds: 1);
const Duration kDioReceiveTimeoutMax = Duration(seconds: 120);
const Duration kDioSendTimeoutMin = Duration(seconds: 1);
const Duration kDioSendTimeoutMax = Duration(seconds: 120);

Duration _clampDuration(Duration value, Duration min, Duration max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/// Returns the current bearer token, or `null` / empty when logged out.
typedef AuthTokenGetter = String? Function();

/// Returns the current app language (e.g. 'ar', 'en').
typedef LanguageGetter = String? Function();

/// Factory for a single configured [Dio] instance (timeouts, default headers).
///
/// Repositories receive this via DI (e.g. Riverpod); do not create ad-hoc [Dio]
/// in widgets. Set per-API `baseUrl` on [BaseOptions] here when you have one backend,
/// or pass full URLs in each call while [BaseOptions.baseUrl] stays empty.
Dio createAppDio() {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: AppConstants.httpConnectTimeout,
      receiveTimeout: AppConstants.httpReceiveTimeout,
      sendTimeout: AppConstants.httpSendTimeout,
      headers: <String, Object?>{
        Headers.acceptHeader: Headers.jsonContentType,
      },
    ),
  );
  dio.options.headers['User-Agent'] = _defaultUserAgent;
  if (kDebugMode) {
    dio.interceptors.add(
      LogInterceptor(
        request: true,
        requestHeader: true,
        requestBody: true,
        responseHeader: true,
        responseBody: true,
        error: true,
        // logPrint: (Object object) => debugPrint('[ahmed][dio] $object'),
      ),
    );
  }
  return dio;
}

/// Thin wrapper around [Dio] with [get]/[post] and optional `Authorization: Bearer`.
///
/// Pass the same [Dio] from [createAppDio] / [dioProvider]. Wire [authTokenGetter]
/// from your auth layer (e.g. `() => ref.read(sessionProvider).accessToken`).
class AppDioClient {
  AppDioClient(
    this._dio, {
    this.authTokenGetter,
    this.languageGetter,
  });

  final Dio _dio;
  final AuthTokenGetter? authTokenGetter;
  final LanguageGetter? languageGetter;

  Map<String, dynamic> _mergedHeaders(Options? options, {required bool includeAuth}) {
    final headers = <String, dynamic>{...?options?.headers};
    if (includeAuth) {
      final token = authTokenGetter?.call()?.trim();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    final lang = languageGetter?.call()?.trim();
    if (lang != null && lang.isNotEmpty) {
      headers['Accept-Language'] = lang;
    }
    return headers;
  }

  Options _options(Options? options, {required bool includeAuth}) {
    final headers = _mergedHeaders(options, includeAuth: includeAuth);
    if (options == null) return Options(headers: headers);
    return options.copyWith(headers: headers);
  }

  /// Merges headers/auth with optional per-call timeouts (clamped to [kDio*Min]/[kDio*Max]).
  Options _optionsWithRequestTimeouts(
    Options? options, {
    required bool includeAuth,
    Duration? connectTimeout,
    Duration? receiveTimeout,
    Duration? sendTimeout,
  }) {
    var o = _options(options, includeAuth: includeAuth);
    if (connectTimeout != null) {
      o = o.copyWith(
        connectTimeout: _clampDuration(connectTimeout, kDioConnectTimeoutMin, kDioConnectTimeoutMax),
      );
    }
    if (receiveTimeout != null) {
      o = o.copyWith(
        receiveTimeout: _clampDuration(receiveTimeout, kDioReceiveTimeoutMin, kDioReceiveTimeoutMax),
      );
    }
    if (sendTimeout != null) {
      o = o.copyWith(
        sendTimeout: _clampDuration(sendTimeout, kDioSendTimeoutMin, kDioSendTimeoutMax),
      );
    }
    return o;
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Object? data,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
    bool includeAuth = true,
    Duration? connectTimeout,
    Duration? receiveTimeout,
    Duration? sendTimeout,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      data: data,
      options: _optionsWithRequestTimeouts(
        options,
        includeAuth: includeAuth,
        connectTimeout: connectTimeout,
        receiveTimeout: receiveTimeout,
        sendTimeout: sendTimeout,
      ),
      cancelToken: cancelToken,
      onReceiveProgress: onReceiveProgress,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
    bool includeAuth = true,
    Duration? connectTimeout,
    Duration? receiveTimeout,
    Duration? sendTimeout,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: _optionsWithRequestTimeouts(
        options,
        includeAuth: includeAuth,
        connectTimeout: connectTimeout,
        receiveTimeout: receiveTimeout,
        sendTimeout: sendTimeout,
      ),
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }
}
