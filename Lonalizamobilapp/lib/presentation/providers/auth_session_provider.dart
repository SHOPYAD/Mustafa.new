import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth/auth_session.dart';
import '../../core/auth/mobile_auth_api.dart';
import 'dio_provider.dart';

final authStoreProvider = Provider<MemoryAuthStore>((ref) => MemoryAuthStore());

final mobileAuthApiProvider = Provider<MobileAuthApi>((ref) {
  return MobileAuthApi(ref.watch(dioProvider));
});

final authSessionProvider = NotifierProvider<AuthSessionNotifier, AuthSession?>(
  AuthSessionNotifier.new,
);

class AuthSessionNotifier extends Notifier<AuthSession?> {
  @override
  AuthSession? build() => ref.read(authStoreProvider).session;

  Future<void> login({required String email, required String password}) async {
    final session = await ref.read(mobileAuthApiProvider).login(
          email: email,
          password: password,
        );
    ref.read(authStoreProvider).save(session);
    state = session;
  }

  Future<void> register({
    required String email,
    required String password,
    required String name,
  }) async {
    final session = await ref.read(mobileAuthApiProvider).register(
          email: email,
          password: password,
          name: name,
        );
    ref.read(authStoreProvider).save(session);
    state = session;
  }

  Future<void> logout() async {
    final current = state;
    if (current != null) {
      await ref.read(mobileAuthApiProvider).logout(current.token);
    }
    ref.read(authStoreProvider).clear();
    state = null;
  }
}
