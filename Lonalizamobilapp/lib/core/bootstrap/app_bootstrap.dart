class AppBootstrap {
  const AppBootstrap({
    required this.services,
    required this.locales,
    required this.currencies,
    this.primaryColor,
    this.accentColor,
    this.brandName = 'Lonaliza',
  });

  final List<String> services;
  final List<String> locales;
  final List<String> currencies;
  final String? primaryColor;
  final String? accentColor;
  final String brandName;

  static const fallbackLocales = ['ar', 'en'];

  factory AppBootstrap.fromJson(Map<String, dynamic> json) {
    final branding = json['branding'] is Map
        ? Map<String, dynamic>.from(json['branding'] as Map)
        : const <String, dynamic>{};
    final colors = branding['colors'] is Map
        ? Map<String, dynamic>.from(branding['colors'] as Map)
        : const <String, dynamic>{};
    final services = <String>[];
    final rawServices = json['services'];
    if (rawServices is List) {
      for (final row in rawServices) {
        if (row is Map && row['key'] != null) services.add('${row['key']}');
        if (row is String) services.add(row);
      }
    }
    return AppBootstrap(
      services: services,
      locales: (json['locales'] as List?)?.map((e) => '$e').toList() ?? const ['ar', 'en', 'tr', 'fr'],
      currencies: (json['currencies'] as List?)?.map((e) => '$e').toList() ?? const ['USD'],
      primaryColor: colors['primary']?.toString(),
      accentColor: colors['accent']?.toString(),
      brandName: '${branding['brandNameEn'] ?? branding['siteName'] ?? 'Lonaliza'}',
    );
  }

  bool isServiceEnabled(String key) => services.contains(key);

  String resolveLocale(String requested) {
    if (locales.contains(requested)) return requested;
    if (locales.contains('ar')) return 'ar';
    if (locales.contains('en')) return 'en';
    return locales.isNotEmpty ? locales.first : fallbackLocales.first;
  }
}
