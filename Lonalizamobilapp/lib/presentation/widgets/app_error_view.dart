import 'package:flutter/material.dart';
import 'package:liotrip/core/error/exceptions.dart';
import 'package:liotrip/core/extensions/context_error.dart';
import 'package:liotrip/core/extensions/context_l10n.dart';

/// A centralized error view that displays a localized message and action button.
///
/// It automatically handles:
/// - Translation of the error message.
/// - Switching between "Retry" and "Login" actions based on status code 401.
class AppErrorView extends StatelessWidget {
  const AppErrorView({
    super.key,
    required this.error,
    required this.onRetry,
    this.onLogin,
  });

  final Object error;
  final VoidCallback onRetry;
  final VoidCallback? onLogin;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    // Check if it's an Auth error (401)
    final isAuthError =
        error is AppException && (error as AppException).statusCode == 401;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon
            Icon(
              isAuthError ? Icons.lock_outline : Icons.error_outline,
              size: 64,
              color: isAuthError ? Colors.orange : Colors.red,
            ),
            const SizedBox(height: 16),

            // Error Message
            Builder(
              builder: (context) {
                final message = isAuthError
                    ? l10n.loginRequired
                    : context.translateError(error);
                return Text(
                  message,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                );
              },
            ),
            const SizedBox(height: 24),

            // Action Button
            if (isAuthError)
              ElevatedButton.icon(
                onPressed:
                    onLogin ??
                    () {
                      // Default logic: Navigate to login page if provided or just print

                    },
                icon: const Icon(Icons.login),
                label: Text(l10n.login),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                ),
              )
            else
              OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: Text(l10n.retry),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
