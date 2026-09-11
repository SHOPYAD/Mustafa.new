import 'package:dio/dio.dart';

import '../constants/app_constants.dart';
import 'auth_session.dart';

class MobileAuthApi {
  MobileAuthApi(this._dio);

  final Dio _dio;

  String get _base => AppConstants.mobileApiBase;

  Future<AuthSession> login({required String email, required String password}) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '$_base/api/mobile/v1/auth/login',
      data: {'email': email, 'password': password},
    );
    return AuthSession.fromLoginJson(res.data ?? const {});
  }

  Future<AuthSession> register({
    required String email,
    required String password,
    required String name,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '$_base/api/mobile/v1/auth/register',
      data: {'email': email, 'password': password, 'name': name},
    );
    return AuthSession.fromLoginJson(res.data ?? const {});
  }

  Future<void> logout(String token) async {
    await _dio.post<Map<String, dynamic>>(
      '$_base/api/mobile/v1/auth/logout',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<HandoffTicket> mintHandoff({required String token, required String path}) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '$_base/api/mobile/v1/session/handoff',
      data: {'path': path},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return HandoffTicket.fromJson(res.data ?? const {});
  }
}
