class AuthUser {
  const AuthUser({required this.id, required this.email, required this.name});

  final String id;
  final String email;
  final String name;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: '${json['id'] ?? ''}',
      email: '${json['email'] ?? ''}',
      name: '${json['name'] ?? ''}',
    );
  }
}

class AuthSession {
  const AuthSession({required this.token, required this.user});

  final String token;
  final AuthUser user;

  factory AuthSession.fromLoginJson(Map<String, dynamic> json) {
    final user = json['user'];
    if (json['ok'] != true || json['token'] is! String || user is! Map) {
      throw const FormatException('invalid_login');
    }
    return AuthSession(
      token: json['token'] as String,
      user: AuthUser.fromJson(Map<String, dynamic>.from(user)),
    );
  }

  String? get bearerToken => token.isEmpty ? null : token;

  Map<String, dynamic> toJson() => {
        'ok': true,
        'token': token,
        'user': {'id': user.id, 'email': user.email, 'name': user.name},
      };
}

class MemoryAuthStore {
  AuthSession? _session;

  AuthSession? get session => _session;

  void save(AuthSession session) => _session = session;

  void clear() => _session = null;
}

class HandoffTicket {
  const HandoffTicket(this.url);

  final String url;

  factory HandoffTicket.fromJson(Map<String, dynamic> json) {
    final url = '${json['url'] ?? ''}';
    if (json['ok'] != true || url.isEmpty) {
      throw const FormatException('invalid_handoff');
    }
    if (url.contains('Bearer') || url.contains('token=')) {
      throw const FormatException('token_leaked');
    }
    return HandoffTicket(url);
  }
}
