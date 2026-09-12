import 'package:flutter/material.dart';
import '../error/exceptions.dart';
import 'context_l10n.dart';

extension ContextErrorTranslation on BuildContext {
  /// Translates an error (usually an [AppException]) into a localized string.
  /// 
  /// It checks if the message is a known translation key, or returns the 
  /// message as is (for server-provided translated messages).
  String translateError(Object? error) {
    final l10n = this.l10n;
    
    if (error is AppException) {
      return switch (error.message) {
        'errorNetwork' => l10n.errorNetwork,
        'errorServer' => l10n.errorServer,
        'errorGeneric' => l10n.errorGeneric,
        'errorNotFound' => l10n.errorNotFound,
        _ => error.message,
      };
    }
    
    return l10n.errorGeneric;
  }
}
