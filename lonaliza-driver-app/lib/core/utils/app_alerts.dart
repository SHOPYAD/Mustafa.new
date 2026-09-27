import 'package:flutter/material.dart';

enum AppAlertPosition { top, center, bottom }

class AppAlerts {
  static void show(
    BuildContext context,
    String message, {
    AppAlertPosition position = AppAlertPosition.top,
    Duration duration = const Duration(seconds: 3),
    Color? backgroundColor,
    IconData? icon,
  }) {
    final overlayState = Overlay.of(context);
    
    late OverlayEntry overlayEntry;

    overlayEntry = OverlayEntry(
      builder: (context) => _AppAlertWidget(
        message: message,
        position: position,
        backgroundColor: backgroundColor,
        icon: icon,
        onDismiss: () {
          overlayEntry.remove();
        },
      ),
    );

    overlayState.insert(overlayEntry);

    // Auto dismiss
    Future.delayed(duration, () {
      if (overlayEntry.mounted) {
        overlayEntry.remove();
      }
    });
  }
}

class _AppAlertWidget extends StatefulWidget {
  final String message;
  final AppAlertPosition position;
  final Color? backgroundColor;
  final IconData? icon;
  final VoidCallback onDismiss;

  const _AppAlertWidget({
    required this.message,
    required this.position,
    this.backgroundColor,
    this.icon,
    required this.onDismiss,
  });

  @override
  State<_AppAlertWidget> createState() => _AppAlertWidgetState();
}

class _AppAlertWidgetState extends State<_AppAlertWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _offsetAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    // Dynamic offset based on position
    Offset beginOffset;
    switch (widget.position) {
      case AppAlertPosition.top:
        beginOffset = const Offset(0, -1);
        break;
      case AppAlertPosition.bottom:
        beginOffset = const Offset(0, 1);
        break;
      case AppAlertPosition.center:
        beginOffset = Offset.zero;
        break;
    }

    _offsetAnimation = Tween<Offset>(
      begin: beginOffset,
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Alignment alignment;
    switch (widget.position) {
      case AppAlertPosition.top:
        alignment = Alignment.topCenter;
        break;
      case AppAlertPosition.center:
        alignment = Alignment.center;
        break;
      case AppAlertPosition.bottom:
        alignment = Alignment.bottomCenter;
        break;
    }

    return SafeArea(
      child: Align(
        alignment: alignment,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
          child: SlideTransition(
            position: _offsetAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Material(
                color: Colors.transparent,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: widget.backgroundColor ?? const Color(0xFF1F2937),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        widget.icon ?? Icons.info_outline_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Flexible(
                        child: Text(
                          widget.message,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
