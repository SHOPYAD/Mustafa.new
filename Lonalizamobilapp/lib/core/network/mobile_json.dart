List<Map<String, dynamic>> mapList(dynamic raw) {
  if (raw is! List) return const [];
  return raw.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList();
}

double? asDouble(dynamic raw) {
  if (raw is num) return raw.toDouble();
  return double.tryParse(raw?.toString() ?? '');
}

String asText(dynamic raw, [String fallback = '']) {
  final value = raw?.toString().trim() ?? '';
  return value.isEmpty ? fallback : value;
}
