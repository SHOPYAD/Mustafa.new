import 'package:dio/dio.dart';

/// Maps auth failures to Arabic copy. Never surfaces [DioException] text.
abstract final class AuthErrorMapper {
  AuthErrorMapper._();

  static const invalidCredentials = 'بيانات الدخول غير صحيحة';
  static const duplicateEmail = 'هذا البريد مستخدم مسبقاً';
  static const shortPassword = 'كلمة السر يجب أن تكون 8 أحرف على الأقل';
  static const generic = 'تعذر إتمام تسجيل الدخول. حاول مرة أخرى.';

  static String map(Object error, {required String password, bool register = false}) {
    if (password.trim().length < 8) return shortPassword;
    if (error is DioException) {
      final status = error.response?.statusCode;
      if (status == 401) return invalidCredentials;
      if (status == 400) {
        final body = error.response?.data;
        final text = body is Map
            ? '${body['error'] ?? body['message'] ?? ''}'.toLowerCase()
            : '';
        if (register ||
            text.contains('exist') ||
            text.contains('duplicate') ||
            text.contains('مستخدم') ||
            text.contains('already')) {
          return duplicateEmail;
        }
        if (text.contains('password') || text.contains('8')) {
          return shortPassword;
        }
      }
      return generic;
    }
    return generic;
  }
}
