import 'dart:convert';

/// Android WebView cache policy for the Lonaliza shell.
///
/// `webview_flutter_android` 4.x does not expose `WebSettings.setCacheMode`.
/// Chromium therefore stays on **LOAD_DEFAULT** (honor Cache-Control).
/// Do **not** switch documents to LOAD_CACHE_ELSE_NETWORK — that serves stale
/// SPA HTML. Hashed `/_next/static` assets still cache via HTTP headers.
/// Never attach extra headers on `loadRequest` — Android skips HTTP cache then.
class WebViewCachePolicy {
  static const String androidDocumentMode = 'LOAD_DEFAULT';
  static const bool passHeadersOnLoadRequest = false;

  static const List<String> spaPrefetchPaths = [
    '/ai-chat?app=1',
    '/menu?app=1',
  ];

  static String prefetchScript() {
    final pathsJson = jsonEncode(spaPrefetchPaths);
    return '''
      (function() {
        try {
          var paths = $pathsJson;
          var run = function() {
            var router = window.__lonalizaRouter;
            if (!router || typeof router.prefetch !== 'function') return false;
            for (var i = 0; i < paths.length; i++) {
              try { router.prefetch(paths[i]); } catch (e) {}
            }
            return true;
          };
          if (!run()) {
            setTimeout(run, 800);
            setTimeout(run, 2500);
          }
        } catch (e) {}
      })();
    ''';
  }
}
