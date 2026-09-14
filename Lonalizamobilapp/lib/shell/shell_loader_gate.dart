/// Dismissal contract for the native branded interstitial.
///
/// The overlay must never hold the UI hostage. Hide on the first of:
/// main-frame [onPageFinished], JS-bridge `pageReady`/`paint`, a hard
/// safety timeout, or Android back while the overlay is visible.
class ShellLoaderGate {
  ShellLoaderGate({this.initiallyVisible = true}) : visible = initiallyVisible;

  static const Duration safetyTimeout = Duration(seconds: 6);
  static const Duration fadeDuration = Duration(milliseconds: 220);

  final bool initiallyVisible;

  bool visible;
  bool interactive = false;
  ShellLoaderDismissReason? lastReason;

  /// Full document navigation (`onPageStarted` / `loadRequest`).
  void documentLoadStarted() {
    visible = true;
    interactive = false;
    lastReason = null;
  }

  /// SPA tab / history changes must not pin a blocking interstitial.
  bool get showOverlayOnSpaNav => false;

  void onSpaNavStart() {
    // Intentional no-op: client routes are already painted.
  }

  bool dismiss(ShellLoaderDismissReason reason) {
    if (reason == ShellLoaderDismissReason.failure) {
      visible = false;
      interactive = false;
      lastReason = reason;
      return true;
    }
    if (!visible && interactive) return false;
    visible = false;
    interactive = true;
    lastReason = reason;
    return true;
  }

  void onPageFinished() => dismiss(ShellLoaderDismissReason.pageFinished);

  void onBridgeReady() => dismiss(ShellLoaderDismissReason.pageReady);

  void onBridgePaint() => dismiss(ShellLoaderDismissReason.paint);

  void onSafetyTimeout() => dismiss(ShellLoaderDismissReason.timeout);

  void onBackWhileVisible() => dismiss(ShellLoaderDismissReason.back);
}

enum ShellLoaderDismissReason {
  pageFinished,
  pageReady,
  paint,
  timeout,
  back,
  failure,
}
