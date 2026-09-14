import 'dart:async';
import 'dart:io';

import 'shell_failure.dart';

class ServerProbeResult {
  const ServerProbeResult.ok() : failure = null;
  const ServerProbeResult.down(this.failure);

  final ShellFailure? failure;
  bool get ok => failure == null;
}

/// Lightweight origin probe used by Reload/Retry. Never opens a browser.
class ServerAvailability {
  static const Duration defaultTimeout = Duration(seconds: 5);

  static Future<ServerProbeResult> probe(
    String origin, {
    Duration timeout = defaultTimeout,
  }) async {
    final candidates = <Uri>[
      Uri.parse('$origin/api/mobile/v1/shell-health'),
      Uri.parse('$origin/api/mobile/v1/app-config'),
      Uri.parse('$origin/?app=1'),
    ];

    ShellFailure? lastFailure;
    for (final uri in candidates) {
      final result = await _get(uri, timeout);
      if (result.ok) return result;
      lastFailure = result.failure;
      if (lastFailure?.kind == ShellFailureKind.offline ||
          lastFailure?.kind == ShellFailureKind.ssl) {
        return result;
      }
    }
    return ServerProbeResult.down(
      lastFailure ?? const ShellFailure(kind: ShellFailureKind.maintenance),
    );
  }

  static Future<ServerProbeResult> _get(Uri uri, Duration timeout) async {
    HttpClient? client;
    try {
      client = HttpClient()
        ..connectionTimeout = timeout
        ..idleTimeout = timeout
        ..userAgent = 'LonalizaMobileApp/2.0 NativeShell';
      final request = await client.getUrl(uri).timeout(timeout);
      request.headers.set(HttpHeaders.acceptHeader, 'text/html,application/json');
      request.followRedirects = true;
      request.maxRedirects = 4;
      final response = await request.close().timeout(timeout);
      await response.drain<void>().timeout(const Duration(seconds: 2));
      final status = response.statusCode;
      if (ShellFailure.isGatewayStatus(status)) {
        return ServerProbeResult.down(ShellFailure.fromHttpStatus(status));
      }
      if (ShellFailure.isServerAvailableStatus(status) || status == 429) {
        return const ServerProbeResult.ok();
      }
      return ServerProbeResult.down(ShellFailure.fromHttpStatus(status));
    } on SocketException catch (e) {
      final os = e.osError?.message.toLowerCase() ?? e.message.toLowerCase();
      if (os.contains('timed out') || os.contains('timeout')) {
        return const ServerProbeResult.down(
          ShellFailure(kind: ShellFailureKind.timeout),
        );
      }
      return const ServerProbeResult.down(
        ShellFailure(kind: ShellFailureKind.offline),
      );
    } on HandshakeException {
      return const ServerProbeResult.down(
        ShellFailure(kind: ShellFailureKind.ssl),
      );
    } on TimeoutException {
      return const ServerProbeResult.down(
        ShellFailure(kind: ShellFailureKind.timeout),
      );
    } on HttpException catch (e) {
      final msg = e.message.toLowerCase();
      if (msg.contains('502') || msg.contains('503') || msg.contains('504')) {
        return const ServerProbeResult.down(
          ShellFailure(kind: ShellFailureKind.maintenance),
        );
      }
      return const ServerProbeResult.down(
        ShellFailure(kind: ShellFailureKind.offline),
      );
    } catch (_) {
      return const ServerProbeResult.down(
        ShellFailure(kind: ShellFailureKind.unknown),
      );
    } finally {
      client?.close(force: true);
    }
  }
}
