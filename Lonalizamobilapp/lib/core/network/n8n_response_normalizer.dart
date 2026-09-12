import 'dart:convert';

/// Utility to unpack the standard n8n webhook response envelope.
///
/// n8n always wraps the response in:
/// ```
/// [ { "data": { "<nodeName>": <payload> } } ]
/// ```
/// This helper extracts `<payload>` safely for any node name,
/// returning `null` if the structure is unexpected.
abstract final class N8nResponseNormalizer {
  N8nResponseNormalizer._();

  /// Extracts the value at `response[0].data[nodeName]`.
  ///
  /// Works with both `List` and raw `Map` responses.
  /// Returns `null` if the path does not exist or types mismatch.
  static T? extract<T>(dynamic rawData, String nodeName) {
    var data = rawData;
    if (data is String) {
      try {
        data = jsonDecode(data);
      } catch (_) {
        return null;
      }
    }

    final item = data is List && (data as List).isNotEmpty
        ? (data as List).first
        : data;

    if (item is! Map) return null;

    final dataNode = item['data'];
    if (dataNode is! Map) return null;

    final value = dataNode[nodeName];
    return value is T ? value : null;
  }

  /// Same as [extract] but returns [fallback] instead of null.
  static T extractOr<T>(dynamic rawData, String nodeName, T fallback) {
    return extract<T>(rawData, nodeName) ?? fallback;
  }
}
