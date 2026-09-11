import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/auth/auth_session.dart';
import '../../core/auth/mobile_auth_api.dart';
import 'dio_provider.dart';

const _sessionKey = 'lonaliza_auth_session';

final authStoreProvider = Provider<MemoryAuthStore>((ref) => MemoryAuthStore());

final mobileAuthApiProvider = Provider<MobileAuthApi>((ref) {
  return MobileAuthApi(ref.watch(dioProvider));
});

final authSessionProvider = NotifierProvider<AuthSessionNotifier, AuthSession?>(
  AuthSessionNotifier.new,
);

class AuthSessionNotifier extends Notifier<AuthSession?> {
  @override
  AuthSession? build() {
    Future.microtask(_restore);
    return ref.read(authStoreProvider).session;
  }

  Future<void> _restore() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_sessionKey);
    if (raw == null || raw.isEmpty) return;
    try {
      final session = AuthSession.fromLoginJson(
        Map<String, dynamic>.from(jsonDecode(raw) as Map),
      );
      ref.read(authStoreProvider).save(session);
      state = session;
    } catch (_) {
      await prefs.remove(_sessionKey);
    }
  }

  Future<void> _persist(AuthSession? session) async {
    final prefs = await SharedPreferences.getInstance();
    if (session == null) {
      await prefs.remove(_sessionKey);
      return;
    }
    await prefs.setString(_sessionKey, jsonEncode(session.toJson()));
  }

  Future<void> _set(AuthSession session) async {
    ref.read(authStoreProvider).save(session);
    state = session;
    await _persist(session);
  }

  Future<void> login({required String email, required String password}) async {
    await _set(await ref.read(mobileAuthApiProvider).login(email: email, password: password));
  }

  Future<void> register({
    required String email,
    required String password,
    required String name,
  }) async {
    await _set(
      await ref.read(mobileAuthApiProvider).register(
            email: email,
            password: password,
            name: name,
          ),
    );
  }

  Future<void> googleFinish({
    required String code,
    required String verifier,
    required String redirectUri,
  }) async {
    await _set(
      await ref.read(mobileAuthApiProvider).googleFinish(
            code: code,
            verifier: verifier,
            redirectUri: redirectUri,
          ),
    );
  }

  Future<void> logout() async {
    final current = state;
    if (current != null) {
      await ref.read(mobileAuthApiProvider).logout(current.token);
    }
    ref.read(authStoreProvider).clear();
    state = null;
    await _persist(null);
  }
}
