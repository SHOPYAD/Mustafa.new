import 'package:flutter_test/flutter_test.dart';
import 'package:liotrip/core/auth/auth_session.dart';

void main() {
  test('parses a website-created user login into a Bearer session', () {
    final session = AuthSession.fromLoginJson({
      'ok': true,
      'token': 'users-jwt',
      'user': {'id': 'user-42', 'email': 'guest@lonaliza.com', 'name': 'Guest'},
    });
    expect(session.user.id, 'user-42');
    expect(session.bearerToken, 'users-jwt');
  });

  test('handoff ticket rejects a URL that embeds the JWT', () {
    expect(
      () => HandoffTicket.fromJson({
        'ok': true,
        'url': '/api/mobile/v1/session/handoff?code=abc&token=users-jwt',
      }),
      throwsFormatException,
    );
  });

  test('handoff ticket accepts a code-only relative URL', () {
    final ticket = HandoffTicket.fromJson({
      'ok': true,
      'url': '/api/mobile/v1/session/handoff?code=abc',
    });
    expect(ticket.url.contains('token='), isFalse);
    expect(ticket.url.contains('code=abc'), isTrue);
  });

  test('logout clears the in-memory session so Bearer is gone', () {
    final store = MemoryAuthStore();
    store.save(
      AuthSession.fromLoginJson({
        'ok': true,
        'token': 'users-jwt',
        'user': {'id': 'user-42', 'email': 'guest@lonaliza.com', 'name': 'Guest'},
      }),
    );
    store.clear();
    expect(store.session, isNull);
  });
}
