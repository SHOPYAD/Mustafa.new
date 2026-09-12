/// Base type for failures surfaced to domain callers and presentation.
///
/// Repository implementations map [Exception]s from `exceptions.dart` into
/// concrete [Failure] subclasses. No Flutter imports.
abstract class Failure {
  const Failure([this.message, this.statusCode]);

  /// Optional detail for logs or debug UI (not always user-facing copy).
  final String? message;

  /// HTTP or internal error code.
  final int? statusCode;
}

/// Connectivity, DNS, TLS, or client timeouts.
final class NetworkFailure extends Failure {
  const NetworkFailure([super.message, super.statusCode]);
}

/// Remote API responded with an error or unparsable success payload.
final class ServerFailure extends Failure {
  const ServerFailure([super.message, super.statusCode]);
}

/// Local persistence (Hive/SQLite/preferences) failed.
final class CacheFailure extends Failure {
  const CacheFailure([super.message, super.statusCode]);
}

/// Input or state broke business rules before I/O.
final class ValidationFailure extends Failure {
  const ValidationFailure([super.message, super.statusCode]);
}

/// Resource missing (empty search, 404 mapped at repo boundary, etc.).
final class NotFoundFailure extends Failure {
  const NotFoundFailure([super.message, super.statusCode]);
}

/// Catch-all when no more specific [Failure] applies.
final class UnknownFailure extends Failure {
  const UnknownFailure([super.message, super.statusCode]);
}
