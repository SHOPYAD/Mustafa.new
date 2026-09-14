/// Policy for keeping same-origin moves on the Next.js client router
/// instead of a Flutter `loadRequest` document reload.
class SpaNavigation {
  static bool isHttpUrl(Uri uri) =>
      uri.scheme == 'http' || uri.scheme == 'https';

  static bool sameOrigin(Uri page, Uri target) =>
      page.host.toLowerCase() == target.host.toLowerCase() &&
      page.scheme == target.scheme;

  /// Payment / OAuth / API document loads must stay real navigations.
  static bool mustFullDocument(Uri uri) {
    final host = uri.host.toLowerCase();
    final path = uri.path.toLowerCase();
    if (host.contains('iyzico') || host.contains('iyzipay')) return true;
    if (host.contains('accounts.google')) return true;
    if (path.contains('/auth/google')) return true;
    if (path.startsWith('/api/')) return true;
    if (path.contains('/payments/iyzico')) return true;
    if (path.contains('3dsecure') || path.contains('/3ds')) return true;
    return false;
  }

  /// After the first paint, same-origin site pages reuse the live DOM.
  static bool shouldClientRoute({
    required Uri current,
    required Uri target,
    required bool pageInteractive,
    required bool isMainFrame,
  }) {
    if (!pageInteractive) return false;
    if (!isMainFrame) return false;
    if (!isHttpUrl(target)) return false;
    if (current.host.isEmpty) return false;
    if (!sameOrigin(current, target)) return false;
    if (mustFullDocument(target)) return false;
    final path = target.path.toLowerCase();
    if (path.contains('/_next/') ||
        path.contains('/static/') ||
        path.contains('/assets/')) {
      return false;
    }
    return true;
  }

  static String pathWithQuery(Uri uri) {
    final q = uri.hasQuery ? '?${uri.query}' : '';
    final h = uri.hasFragment ? '#${uri.fragment}' : '';
    return '${uri.path}$q$h';
  }

  static String withAppParam(String path) {
    if (path.contains('app=1')) return path;
    final hashAt = path.indexOf('#');
    final beforeHash = hashAt == -1 ? path : path.substring(0, hashAt);
    final hash = hashAt == -1 ? '' : path.substring(hashAt);
    final sep = beforeHash.contains('?') ? '&' : '?';
    return '$beforeHash${sep}app=1$hash';
  }

  static bool isHomePath(String path) {
    final cut = path.split('#').first.split('?').first;
    return cut.isEmpty || cut == '/';
  }
}
