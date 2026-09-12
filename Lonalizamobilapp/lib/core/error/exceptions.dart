/// Thrown from data sources (remote/local) before repositories map them to [Failure].
///
/// Base for app-specific checked-style exceptions in the data layer.
abstract class AppException implements Exception {
  const AppException(this.message, {this.statusCode, this.cause});

  final String message;
  final int? statusCode;
  final Object? cause;

  @override
  String toString() =>
      'AppException: $message (code: $statusCode)${cause != null ? ' ($cause)' : ''}';
}

/// HTTP 5xx, malformed body, or business error envelope from backend.
class ServerException extends AppException {
  const ServerException([
    super.message = 'Server error',
    int? statusCode,
    Object? cause,
    this.errorsData,
  ]) : super(statusCode: statusCode, cause: cause);

  /// Holds validation errors for specific input fields (e.g. {"email": ["Invalid format"]})
  final Map<String, dynamic>? errorsData;
}

/// No network, timeout, cancelled, bad certificate, etc.
class NetworkException extends AppException {
  const NetworkException([
    super.message = 'Network error',
    int? statusCode,
    Object? cause,
  ]) : super(statusCode: statusCode, cause: cause);
}

/// Disk / DB / secure storage failures in data sources.
class CacheException extends AppException {
  const CacheException([
    super.message = 'Cache error',
    int? statusCode,
    Object? cause,
  ]) : super(statusCode: statusCode, cause: cause);
}
