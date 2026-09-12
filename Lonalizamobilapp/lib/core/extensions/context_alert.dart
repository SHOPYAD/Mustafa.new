import 'package:flutter/material.dart';
import '../utils/app_alerts.dart';

extension ContextAlert on BuildContext {
  /// Shows a beautiful custom alert/toast.
  /// 
  /// [position] can be top, center, or bottom.
  void showAlert(
    String message, {
    AppAlertPosition position = AppAlertPosition.top,
    Color? backgroundColor,
    IconData? icon,
    Duration duration = const Duration(seconds: 3),
  }) {
    AppAlerts.show(
      this,
      message,
      position: position,
      backgroundColor: backgroundColor,
      icon: icon,
      duration: duration,
    );
  }

  /// Shortcut for error alerts (Red background)
  void showErrorAlert(String message, {AppAlertPosition position = AppAlertPosition.top}) {
    showAlert(
      message,
      position: position,
      backgroundColor: const Color(0xFFEF4444), // Red
      icon: Icons.error_outline_rounded,
    );
  }

  /// Shortcut for warning alerts (Orange background)
  void showWarningAlert(String message, {AppAlertPosition position = AppAlertPosition.top}) {
    showAlert(
      message,
      position: position,
      backgroundColor: const Color(0xFFF59E0B), // Orange
      icon: Icons.warning_amber_rounded,
    );
  }
}
