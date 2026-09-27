import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'exceptions.dart';

/// Centralized error handler for Dio exceptions across all remote data sources.
abstract final class ExceptionHandler {
  /// Trusted status codes where we always prefer the server's translated message.
  static const _trustedCodes = [400, 401, 403, 409];

  /// Maps a [DioException] to a specific [AppException].
  /// Always throws the resulting exception.
  static Never handleDioException(DioException e) {


    if (e.type == DioExceptionType.cancel) {
      throw const NetworkException('Request cancelled');
    }

    if (e.type == DioExceptionType.badResponse) {
      final statusCode = e.response?.statusCode;
      final data = e.response?.data;



      // 1. أخطاء التوثيق والمدخلات (نثق برسالة السيرفر ونستخرج رسائل الحقول)
      if (_trustedCodes.contains(statusCode) && data is Map) {
        final serverMessage = data['message']?.toString() ?? data['error']?.toString() ?? 'errorGeneric';
        final errorsData = data['errors'] is Map ? Map<String, dynamic>.from(data['errors'] as Map) : null;
        


        throw ServerException(serverMessage, statusCode, null, errorsData);
      }

      // 2. جميع الأخطاء الأخرى (500, 502, 404, أو HTML Response)
      // نتجاهل رسالة السيرفر تماماً ونستخدم مفاتيح ثابتة للترجمة
      final fallbackMessage = _defaultMessageForStatus(statusCode);
      


      throw ServerException(fallbackMessage, statusCode);
    }

    // 3. Handle connection issues
    if (_isNetworkIssue(e)) {

      throw NetworkException(
        'errorNetwork',
        e.response?.statusCode,
      );
    }

    // 4. Final catch-all

    throw ServerException(
      'Could not load results. Please try again.',
      e.response?.statusCode,
    );
  }

  /// Handles generic, non-Dio exceptions like format or parsing errors.
  static Never handleGenericException(Object e) {

    throw ServerException('errorGeneric');
  }

  static bool _isNetworkIssue(DioException e) {
    return switch (e.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout ||
      DioExceptionType.connectionError => true,
      _ => false,
    };
  }

  static String _defaultMessageForStatus(int? statusCode) {
    if (statusCode == null) return 'errorGeneric';
    if (statusCode == 404) return 'errorNotFound';
    if (statusCode >= 500) return 'errorServer';
    return 'errorGeneric';
  }
}
