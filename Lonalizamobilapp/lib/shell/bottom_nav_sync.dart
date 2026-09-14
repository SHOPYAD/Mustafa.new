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
