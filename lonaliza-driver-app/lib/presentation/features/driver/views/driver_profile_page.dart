import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverProfilePage extends ConsumerStatefulWidget {
  const DriverProfilePage({super.key});

  @override
  ConsumerState<DriverProfilePage> createState() => _DriverProfilePageState();
}

class _DriverProfilePageState extends ConsumerState<DriverProfilePage> {
  final _iban = TextEditingController();
  final _bankName = TextEditingController();
  final _accountHolder = TextEditingController();
  bool _saving = false;
  bool _loading = true;
  Map<String, dynamic>? _profileData;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    setState(() => _loading = true);
    try {
      final data = await ref.read(driverApiProvider).fetchProfile(supplierId);
      if (!mounted) return;

      final profile = parseSupplierProfileMap(data);
      await ref
          .read(driverSessionProvider.notifier)
          .updateProfileFromApi(data);

      final payout = profile['payoutDetails'] as Map<String, dynamic>?;
      _accountHolder.text = payout?['accountHolder'] as String? ?? '';
      _bankName.text = payout?['bankName'] as String? ?? '';
      _iban.text = payout?['iban'] as String? ?? '';

      setState(() {
        _profileData = profile;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _iban.dispose();
    _bankName.dispose();
    _accountHolder.dispose();
    super.dispose();
  }

  Future<void> _savePayout() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    setState(() => _saving = true);
    try {
      await ref.read(driverApiProvider).updatePayout(supplierId, {
        'iban': _iban.text.trim(),
        'bankName': _bankName.text.trim(),
        'accountHolder': _accountHolder.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.payoutSaved)),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _uploadDocument() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image == null) return;

    try {
      final upload = await ref.read(driverApiProvider).uploadFile(File(image.path));
      final url = upload['url'] as String? ?? upload['fileUrl'] as String?;
      if (url == null) return;

      await ref.read(driverApiProvider).uploadDocuments(supplierId, [
        {'kind': 'license', 'url': url},
      ]);

      final profile = ref.read(driverSessionProvider).profile;
      if (profile != null) {
        await ref.read(driverSessionProvider.notifier).setProfile(
              DriverProfileSnapshot(
                legalName: profile.legalName,
                tradeName: profile.tradeName,
                status: profile.status,
                accountType: profile.accountType,
                rating: profile.rating,
                completedTrips: profile.completedTrips,
                photoUrl: profile.photoUrl,
                logoUrl: profile.logoUrl,
                documentsSubmitted: true,
              ),
            );
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.uploadDocument)),
      );
      await _loadProfile();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final session = ref.watch(driverSessionProvider);
    final profile = session.profile;
    final bottomInset = MediaQuery.paddingOf(context).bottom;

    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.profile)),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final status = profile?.status ?? _profileData?['status'] as String? ?? 'pending';
    final statusColor = switch (status) {
      'approved' || 'active' => AppColors.success,
      'rejected' => AppColors.error,
      _ => AppColors.warning,
    };
    final statusLabel = switch (status) {
      'approved' || 'active' => l10n.approved,
      'rejected' => l10n.rejected,
      _ => l10n.pending,
    };

    return Scaffold(
      appBar: AppBar(title: Text(l10n.profile)),
      body: SafeArea(
        child: ListView(
          padding: EdgeInsets.fromLTRB(20, 8, 20, 24 + bottomInset),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: AppColors.purple.withValues(alpha: 0.15),
                      backgroundImage: profile?.photoUrl != null
                          ? NetworkImage(profile!.photoUrl!)
                          : null,
                      child: profile?.photoUrl == null
                          ? const Icon(Icons.person, size: 36, color: AppColors.purple)
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            profile?.displayName ??
                                _profileData?['tradeName'] as String? ??
                                '—',
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.star, size: 16, color: AppColors.gold),
                              const SizedBox(width: 4),
                              Text(
                                '${profile?.rating ?? _profileData?['rating'] ?? '—'} · ${profile?.completedTrips ?? _profileData?['completedTrips'] ?? 0} ${l10n.completedTrips}',
                                style: const TextStyle(color: AppColors.textMuted),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '${l10n.approvalStatus}: $statusLabel',
                              style: TextStyle(
                                color: statusColor,
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (profile?.logoUrl != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          profile!.logoUrl!,
                          width: 48,
                          height: 48,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            if (session.isPendingApproval) ...[
              const SizedBox(height: 12),
              Card(
                color: AppColors.warning.withValues(alpha: 0.08),
                child: ListTile(
                  leading: const Icon(Icons.hourglass_top, color: AppColors.warning),
                  title: Text(l10n.pendingApproval,
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(l10n.pendingApprovalMsg),
                ),
              ),
            ],
            const SizedBox(height: 16),
            if (session.profile?.isCompany == true) ...[
              Text(l10n.subDriversTitle,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.purple,
                      )),
              const SizedBox(height: 8),
              Card(
                child: ListTile(
                  leading: const Icon(Icons.groups_outlined, color: AppColors.purple),
                  title: Text(l10n.subDriversTitle),
                  subtitle: Text(l10n.subDriversSub),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/sub-drivers'),
                ),
              ),
              const SizedBox(height: 16),
            ],
            Text(l10n.documents,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.purple,
                    )),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: const Icon(Icons.upload_file, color: AppColors.purple),
                title: Text(l10n.uploadDocument),
                trailing: profile?.documentsSubmitted == true
                    ? const Icon(Icons.check_circle, color: AppColors.success)
                    : const Icon(Icons.chevron_right),
                onTap: _uploadDocument,
              ),
            ),
            const SizedBox(height: 16),
            Text(l10n.payoutDetails,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.purple,
                    )),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(
                      controller: _accountHolder,
                      decoration: InputDecoration(labelText: l10n.accountHolder),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _bankName,
                      decoration: InputDecoration(labelText: l10n.bankName),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _iban,
                      decoration: const InputDecoration(labelText: 'IBAN'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _saving ? null : _savePayout,
              child: _saving
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.purpleDark,
                      ),
                    )
                  : Text(l10n.savePayout),
            ),
          ],
        ),
      ),
    );
  }
}
