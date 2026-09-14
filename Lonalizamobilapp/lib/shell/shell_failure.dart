import 'package:webview_flutter/webview_flutter.dart';

/// Classifies WebView / probe failures so the shell never shows raw nginx HTML.
enum ShellFailureKind {
  maintenance,
  offline,
  timeout,
  ssl,
  unknown,
}

class ShellFailure {
  const ShellFailure({
    required this.kind,
    this.statusCode,
    this.detail,
  });

  final ShellFailureKind kind;
  final int? statusCode;
  final String? detail;

  bool get isRetryable => true;

  String get titleAr {
    switch (kind) {
      case ShellFailureKind.offline:
        return 'لا يوجد اتصال بالإنترنت';
      case ShellFailureKind.timeout:
        return 'انتهت مهلة الاتصال';
      case ShellFailureKind.ssl:
        return 'تعذر تأمين الاتصال';
      case ShellFailureKind.maintenance:
      case ShellFailureKind.unknown:
        return 'تحديث مجدول قيد التنفيذ';
    }
  }

  String get messageAr {
    switch (kind) {
      case ShellFailureKind.offline:
        return 'تحقق من الشبكة ثم أعد المحاولة. جلستك محفوظة ولن يتم إغلاق التطبيق.';
      case ShellFailureKind.timeout:
        return 'الخادم استغرق وقتاً أطول من المعتاد. نعيد المحاولة دون فقدان جلستك.';
      case ShellFailureKind.ssl:
        return 'تعذر التحقق من شهادة الأمان. أعد المحاولة بعد لحظات.';
      case ShellFailureKind.maintenance:
      case ShellFailureKind.unknown:
        return 'نُجري تحديثاً قصيراً ومجدولاً لتجربة لوناليزا. عُد خلال لحظات ولن تحتاج لإعادة فتح التطبيق.';
    }
  }

  static bool isGatewayStatus(int? status) {
    if (status == null) return false;
    return status == 500 ||
        status == 502 ||
        status == 503 ||
        status == 504 ||
        (status >= 520 && status <= 527);
  }

  static bool isServerAvailableStatus(int status) {
    return status >= 200 && status < 500 && status != 408 && status != 429;
  }

  static bool looksLikeNginxErrorPage(String title, String bodyText) {
    final hay = '${title.toLowerCase()} ${bodyText.toLowerCase()}';
    if (hay.contains('502 bad gateway') ||
        hay.contains('503 service') ||
        hay.contains('504 gateway') ||
        hay.contains('500 internal server')) {
      return true;
    }
    final nginxBare = hay.contains('nginx') &&
        (hay.contains('bad gateway') ||
            hay.contains('service temporarily unavailable') ||
            hay.contains('gateway time-out') ||
            hay.contains('gateway timeout'));
    return nginxBare;
  }

  static bool isLikelyStaticAsset(Uri? uri) {
    if (uri == null) return false;
    final path = uri.path.toLowerCase();
    if (path.contains('/_next/') ||
        path.contains('/static/') ||
        path.contains('/assets/') ||
        path.startsWith('/api/')) {
      return true;
    }
    const exts = [
      '.js',
      '.css',
      '.map',
      '.png',
      '.jpg',
      '.jpeg',
      '.webp',
      '.gif',
      '.svg',
      '.ico',
      '.woff',
      '.woff2',
      '.ttf',
      '.mp4',
      '.webm',
    ];
    return exts.any(path.endsWith);
  }

  static bool sameDocument(Uri? a, Uri? b) {
    if (a == null || b == null) return false;
    if (a.host != b.host) return false;
    String norm(String p) {
      if (p.isEmpty || p == '/') return '/';
      return p.endsWith('/') ? p.substring(0, p.length - 1) : p;
    }

    return norm(a.path) == norm(b.path);
  }

  static ShellFailure fromHttpStatus(int status) {
    return ShellFailure(
      kind: ShellFailureKind.maintenance,
      statusCode: status,
    );
  }

  static ShellFailure fromWebResourceError(WebResourceError error) {
    switch (error.errorType) {
      case WebResourceErrorType.hostLookup:
      case WebResourceErrorType.connect:
        return ShellFailure(
          kind: ShellFailureKind.offline,
          detail: error.description,
        );
      case WebResourceErrorType.timeout:
        return ShellFailure(
          kind: ShellFailureKind.timeout,
          detail: error.description,
        );
      case WebResourceErrorType.failedSslHandshake:
        return ShellFailure(
          kind: ShellFailureKind.ssl,
          detail: error.description,
        );
      default:
        final desc = error.description.toLowerCase();
        if (desc.contains('internet') ||
            desc.contains('network') ||
            desc.contains('offline') ||
            desc.contains('unknownhost') ||
            desc.contains('err_name_not_resolved') ||
            desc.contains('err_internet_disconnected') ||
            desc.contains('err_address_unreachable') ||
            desc.contains('err_connection_refused') ||
            desc.contains('err_connection_reset')) {
          return ShellFailure(
            kind: ShellFailureKind.offline,
            detail: error.description,
          );
        }
        if (desc.contains('timed out') ||
            desc.contains('timeout') ||
            desc.contains('err_timed_out') ||
            desc.contains('err_connection_timed_out')) {
          return ShellFailure(
            kind: ShellFailureKind.timeout,
            detail: error.description,
          );
        }
        if (desc.contains('ssl') ||
            desc.contains('cert') ||
            desc.contains('err_cert') ||
            desc.contains('err_ssl')) {
          return ShellFailure(
            kind: ShellFailureKind.ssl,
            detail: error.description,
          );
        }
        return ShellFailure(
          kind: ShellFailureKind.maintenance,
          detail: error.description,
        );
    }
  }
}
