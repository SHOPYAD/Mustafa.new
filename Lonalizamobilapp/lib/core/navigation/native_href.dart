/// Maps website / AI hrefs onto native go_router paths. Never opens a WebView.
String nativePathFromHref(String? raw) {
  if (raw == null || raw.trim().isEmpty) return '/';
  final trimmed = raw.trim();
  final uri = Uri.tryParse(trimmed.startsWith('http') ? trimmed : 'https://lonaliza.com$trimmed');
  final path = uri?.path ?? trimmed;
  final query = (uri?.query.isNotEmpty ?? false) ? '?${uri!.query}' : '';

  if (path.startsWith('/flights')) return '/flights${path.contains('/search') ? '/search' : ''}';
  if (path.startsWith('/hotels')) return '/hotels${path.contains('/search') ? '/search' : ''}';
  if (path.startsWith('/cars')) return '/cars';
  if (path.startsWith('/transfers')) return '/transfers';
  if (path.startsWith('/tours')) return '/catalog/tours';
  if (path.contains('holiday') || path.startsWith('/packages')) return '/catalog/packages';
  if (path.contains('ai-chat') || path == '/ai') return '/ai';
  if (path.contains('reels')) return '/community/reels';
  if (path.contains('community')) return '/community';
  if (path.contains('gift')) return '/gift-cards';
  if (path.contains('inbox') || path.contains('messages')) return '/messages';
  if (path.startsWith('/account')) return '/account';
  if (path.startsWith('/visa') || path.startsWith('/insurance') || path.startsWith('/offers')) {
    return '/ai';
  }
  if (path.startsWith('/')) return path + query;
  return '/';
}

String nativePathFromIntent(String? intent) {
  return switch (intent) {
    'flight' => '/flights',
    'hotel' => '/hotels',
    'cars' => '/cars',
    'transfers' => '/transfers',
    'tours' => '/catalog/tours',
    'holiday' => '/catalog/packages',
    'visa' || 'insurance' || 'offers' => '/ai',
    _ => '/',
  };
}
