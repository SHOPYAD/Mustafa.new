import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverSubDriversPage extends ConsumerStatefulWidget {
  const DriverSubDriversPage({super.key});

  @override
  ConsumerState<DriverSubDriversPage> createState() =>
      _DriverSubDriversPageState();
}

class _DriverSubDriversPageState extends ConsumerState<DriverSubDriversPage> {
  List<dynamic> _drivers = [];
  bool _loading = true;

  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _license = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _license.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    setState(() => _loading = true);
    try {
      final list = await ref.read(driverApiProvider).fetchDrivers(supplierId);
      if (!mounted) return;
      setState(() {
        _drivers = list;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _addDriver() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null || _name.text.trim().isEmpty) return;

    try {
      await ref.read(driverApiProvider).addDriver(supplierId, {
        'name': _name.text.trim(),
        'phone': _phone.text.trim(),
        'licenseNumber': _license.text.trim(),
      });
      _name.clear();
      _phone.clear();
      _license.clear();
      if (!mounted) return;
      Navigator.pop(context);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  void _openAddSheet() {
    final l10n = context.l10n;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          20,
          20,
          20 + MediaQuery.viewInsetsOf(ctx).bottom,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(l10n.addSubDriver, style: const TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 16),
            TextField(
              controller: _name,
              decoration: InputDecoration(labelText: l10n.subDriverName),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(labelText: l10n.subDriverPhone),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _license,
              decoration: InputDecoration(labelText: l10n.subDriverLicense),
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _addDriver,
              child: Text(l10n.confirm),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final session = ref.watch(driverSessionProvider);
    final isCompany = session.profile?.isCompany == true;

    if (!isCompany) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.subDriversTitle)),
        body: Center(child: Text(l10n.subDriversCompanyOnly)),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(l10n.subDriversTitle)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _drivers.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(l10n.subDriversEmpty),
                      const SizedBox(height: 16),
                      FilledButton(
                        onPressed: _openAddSheet,
                        child: Text(l10n.addSubDriver),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _drivers.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final driver = _drivers[index] as Map<String, dynamic>;
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: AppColors.gold.withValues(alpha: 0.2),
                            child: const Icon(Icons.person, color: AppColors.purple),
                          ),
                          title: Text(
                            driver['name'] as String? ?? '—',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          subtitle: Text(
                            '${driver['phone'] ?? ''}${driver['licenseNumber'] != null ? ' · ${driver['licenseNumber']}' : ''}',
                          ),
                        ),
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddSheet,
        icon: const Icon(Icons.person_add_outlined),
        label: Text(l10n.addSubDriver),
        backgroundColor: AppColors.gold,
        foregroundColor: AppColors.purpleDark,
      ),
    );
  }
}
