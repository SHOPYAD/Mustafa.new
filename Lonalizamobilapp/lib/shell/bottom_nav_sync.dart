// URL ↔ bottom-tab role matching for the native WebView shell.
// Keep in lockstep with src/lib/mobile/bottom-nav-active.ts

const String kAppMenuPath = '/menu';

enum BottomNavRole { home, wallet, community, account, more, none }

const _morePrefixes = <String>[
  '/menu',
  '/flights',
  '/hotels',
  '/cars',
  '/transfers',
  '/holidays',
  '/visa',
  '/packages',
  '/package',
  '/tours',
  '/vip-tours',
  '/uae-tours',
  '/search',
  '/terms',
  '/privacy',
  '/gdpr',
  '/about',
  '/contact',
  '/ai-chat',
  '/blog',
  '/gift-cards',
  '/invoice',
];

class AppLocation {
  const AppLocation({required this.pathname, required this.search});
  final String pathname;
  final String search;
}

AppLocation parseAppLocation(String url) {
  final raw = url.trim();
  if (raw.isEmpty) return const AppLocation(pathname: '/', search: '');
  try {
    final uri = raw.startsWith('http://') || raw.startsWith('https://')
        ? Uri.parse(raw)
        : Uri.parse('https://lonaliza.com$raw');
    var path = uri.path;
    if (path.length > 1 && path.endsWith('/')) {
      path = path.substring(0, path.length - 1);
    }
    if (path.isEmpty) path = '/';
    final search = uri.query.isEmpty ? '' : '?${uri.query}';
    return AppLocation(pathname: path, search: search);
  } catch (_) {
    return const AppLocation(pathname: '/', search: '');
  }
}

/// Home is the site root only — `/` or `/?app=1`, never a service path.
bool isHomeRoot(String url) => parseAppLocation(url).pathname == '/';

bool isMenuPath(String url) => parseAppLocation(url).pathname == kAppMenuPath;

bool _isWalletLocation(String pathname, String search) {
  if (pathname == '/wallet' || pathname.startsWith('/wallet/')) return true;
  final q = search.startsWith('?') ? search.substring(1) : search;
  return Uri.splitQueryString(q)['tab'] == 'wallet';
}

bool _isCommunityPath(String pathname) =>
    pathname == '/community' || pathname.startsWith('/community/');

bool _isAccountPath(String pathname) =>
    pathname == '/account' || pathname.startsWith('/account/');

bool _isMorePath(String pathname) {
  if (pathname.startsWith('/p/')) return true;
  for (final prefix in _morePrefixes) {
    if (pathname == prefix || pathname.startsWith('$prefix/')) return true;
  }
  return false;
}

BottomNavRole roleForTabPath(String path) {
  final loc = parseAppLocation(path);
  if (loc.pathname == '/' || loc.pathname.isEmpty) return BottomNavRole.home;
  if (loc.pathname == kAppMenuPath) return BottomNavRole.more;
  if (_isWalletLocation(loc.pathname, loc.search)) return BottomNavRole.wallet;
  if (_isCommunityPath(loc.pathname)) return BottomNavRole.community;
  if (_isAccountPath(loc.pathname)) return BottomNavRole.account;
  return BottomNavRole.none;
}

BottomNavRole roleForUrl(String url) {
  final loc = parseAppLocation(url);
  if (loc.pathname == '/') return BottomNavRole.home;
  if (_isWalletLocation(loc.pathname, loc.search)) return BottomNavRole.wallet;
  if (_isCommunityPath(loc.pathname)) return BottomNavRole.community;
  if (_isAccountPath(loc.pathname)) return BottomNavRole.account;
  if (_isMorePath(loc.pathname)) return BottomNavRole.more;
  return BottomNavRole.none;
}

/// Index of the matching bottom tab, or -1 when no root tab should highlight.
int activeTabIndex(String url, List<String> tabPaths) {
  final role = roleForUrl(url);
  if (role == BottomNavRole.none) return -1;
  final idx = tabPaths.indexWhere((path) => roleForTabPath(path) == role);
  return idx;
}

bool tabPathLooksLikeMore(String path) {
  final loc = parseAppLocation(path);
  final iconHint = path.toLowerCase();
  return loc.pathname == kAppMenuPath ||
      iconHint.contains('tab_more') ||
      iconHint.contains('/menu');
}

Map<String, String> parseBridgeStringMap(dynamic raw) {
  if (raw is! Map) return {};
  final out = <String, String>{};
  raw.forEach((key, value) {
    if (value == null) return;
    final text = value.toString().trim();
    if (text.isEmpty) return;
    out[key.toString()] = text;
  });
  return out;
}

String? titleForNavRole(BottomNavRole role, Map<String, String> titles) {
  switch (role) {
    case BottomNavRole.home:
      return _firstTitle(titles, const ['home']);
    case BottomNavRole.wallet:
      return _firstTitle(titles, const ['wallet']);
    case BottomNavRole.community:
      return _firstTitle(titles, const ['reels', 'community']);
    case BottomNavRole.account:
      return _firstTitle(titles, const ['me', 'account']);
    case BottomNavRole.more:
      return _firstTitle(titles, const ['more']);
    case BottomNavRole.none:
      return null;
  }
}

String interpolateChrome(String template, String value) {
  return template.replaceAll('{0}', value);
}

/// After a native tab press, ignore stale WebView URL events that still
/// report the previous path — that is what "highlight then snap back" looks like.
bool shouldAcceptUrlTabSync({
  required DateTime now,
  required DateTime? lockUntil,
  required int? lockedTab,
  required int urlTab,
}) {
  if (lockUntil == null || !now.isBefore(lockUntil)) return true;
  if (lockedTab == null) return true;
  if (urlTab == lockedTab) return true;
  // Unknown / unmatched path: keep the committed tab.
  if (urlTab < 0) return false;
  return false;
}

String? _firstTitle(Map<String, String> titles, List<String> keys) {
  for (final key in keys) {
    final value = titles[key];
    if (value != null && value.trim().isNotEmpty) return value;
  }
  return null;
}
