import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// WhatsApp / tel / mailto / intent URLs must leave the WebView.
/// Chromium's ERR_UNKNOWN_URL_SCHEME is not a server 502.
class ExternalUrlHandoff {
  ExternalUrlHandoff._();

  static const Set<String> _schemes = {
    'whatsapp',
    'intent',
    'tel',
    'mailto',
    'sms',
    'smsto',
    'market',
  };

  /// Main-frame loads that must never become the shell document.
  static bool shouldIgnoreWebViewLoad(String url) {
    if (url.isEmpty) return false;
    return isChromeErrorUrl(url) || shouldHandoff(url);
  }

  static bool isChromeErrorUrl(String url) {
    final lower = url.toLowerCase();
    return lower.startsWith('chrome-error:') ||
        lower.contains('chrome-error://') ||
        lower.startsWith('chrome://chromewebdata') ||
        lower.contains('://chromewebdata');
  }

  static bool shouldHandoff(String url) {
    final trimmed = url.trim();
    if (trimmed.isEmpty) return false;
    final lower = trimmed.toLowerCase();
    if (lower.startsWith('whatsapp:') ||
        lower.startsWith('intent:') ||
        lower.startsWith('tel:') ||
        lower.startsWith('mailto:') ||
        lower.startsWith('sms:') ||
        lower.startsWith('smsto:') ||
        lower.startsWith('market:')) {
      return true;
    }
    final uri = Uri.tryParse(trimmed);
    if (uri == null) return false;
    if (_schemes.contains(uri.scheme.toLowerCase())) return true;
    return isWhatsAppHttps(uri);
  }

  static bool isWhatsAppHttps(Uri uri) {
    if (uri.scheme != 'http' && uri.scheme != 'https') return false;
    final host = uri.host.toLowerCase();
    return host == 'wa.me' || host == 'www.wa.me' || host == 'api.whatsapp.com';
  }

  static bool isIgnorableResourceError(WebResourceError error) {
    if (error.errorType == WebResourceErrorType.unsupportedScheme) {
      return true;
    }
    // net::ERR_UNKNOWN_URL_SCHEME
    if (error.errorCode == -10) return true;
    final desc = error.description.toLowerCase();
    if (desc.contains('err_unknown_url_scheme') ||
        desc.contains('unknown url scheme') ||
        desc.contains('unsupported scheme') ||
        desc.contains('err_invalid_url')) {
      return true;
    }
    final url = error.url ?? '';
    return shouldIgnoreWebViewLoad(url);
  }

  /// Convert Android `intent:` URIs into something url_launcher can open.
  static String resolveLaunchUrl(String raw) {
    final trimmed = raw.trim();
    if (trimmed.toLowerCase().startsWith('intent:')) {
      return _fromIntent(trimmed) ?? trimmed;
    }
    return trimmed;
  }

  static String? _fromIntent(String raw) {
    final fallback = RegExp(
      r'S\.browser_fallback_url=([^;]+)',
      caseSensitive: false,
    ).firstMatch(raw);
    if (fallback != null) {
      return Uri.decodeComponent(fallback.group(1)!);
    }

    final nested = RegExp(
      r'^intent:((?:whatsapp|https|http|tel|mailto|sms|smsto|market):.+?)(?:#|$)',
      caseSensitive: false,
    ).firstMatch(raw);
    if (nested != null) {
      return nested.group(1);
    }

    String? nestedScheme;
    final schemeMatch = RegExp(
      r'[;]scheme=([^;]+)',
      caseSensitive: false,
    ).firstMatch(raw);
    if (schemeMatch != null) {
      nestedScheme = schemeMatch.group(1);
    }

    if (raw.toLowerCase().startsWith('intent://')) {
      final hash = raw.indexOf('#');
      final body = hash == -1
          ? raw.substring('intent:'.length)
          : raw.substring('intent:'.length, hash);
      if (nestedScheme != null && nestedScheme.isNotEmpty) {
        return '$nestedScheme:$body';
      }
    }
    return null;
  }

  static Uri? httpsFallback(Uri uri) {
    if (uri.scheme == 'http' || uri.scheme == 'https') return null;
    if (uri.scheme != 'whatsapp') return null;
    final phone = (uri.queryParameters['phone'] ?? '').replaceAll('+', '');
    final text = uri.queryParameters['text'];
    if (phone.isEmpty) {
      return Uri.parse('https://wa.me/');
    }
    return Uri.https('wa.me', '/$phone', {
      if (text != null && text.isNotEmpty) 'text': text,
    });
  }

  static Future<bool> launchExternal(String raw) async {
    final resolved = resolveLaunchUrl(raw);
    final uri = Uri.tryParse(resolved);
    if (uri == null || uri.scheme.isEmpty) return false;
    try {
      if (await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        return true;
      }
    } catch (_) {}
    final fallback = httpsFallback(uri);
    if (fallback == null) return false;
    try {
      return await launchUrl(fallback, mode: LaunchMode.externalApplication);
    } catch (_) {
      return false;
    }
  }
}
