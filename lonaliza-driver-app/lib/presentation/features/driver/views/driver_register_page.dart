import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/app_locale_provider.dart';
import '../../../providers/driver_session_provider.dart';

class DriverRegisterPage extends ConsumerStatefulWidget {
  const DriverRegisterPage({super.key});

  @override
  ConsumerState<DriverRegisterPage> createState() =>
      _DriverRegisterPageState();
}

class _DriverRegisterPageState extends ConsumerState<DriverRegisterPage> {
  final _pageController = PageController();
  final _accountFormKey = GlobalKey<FormState>();
  final _payoutFormKey = GlobalKey<FormState>();

  int _step = 0;
  String _accountType = 'owner_driver';
  bool _accepted = false;
  bool _loading = false;
  double? _commissionPct;
  String? _defaultVehicleClassId;
  final List<File> _pendingDocs = [];

  final _legalName = TextEditingController();
  final _tradeName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _phone = TextEditingController();
  final _driverCount = TextEditingController(text: '1');
  final _plate = TextEditingController();
  final _iban = TextEditingController();
  final _bankName = TextEditingController();
  final _accountHolder = TextEditingController();

  static const _stepCount = 4;

  @override
  void initState() {
    super.initState();
    _loadCommission();
  }

  Future<void> _loadCommission() async {
    try {
      final api = ref.read(driverApiProvider);
      final data = await api.fetchCommission();
      if (!mounted) return;
      setState(() {
        _commissionPct = (data['platformCommissionPct'] as num?)?.toDouble();
        _defaultVehicleClassId = data['defaultVehicleClassId'] as String?;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _commissionPct = 15);
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    _legalName.dispose();
    _tradeName.dispose();
    _email.dispose();
    _password.dispose();
    _phone.dispose();
    _driverCount.dispose();
    _plate.dispose();
    _iban.dispose();
    _bankName.dispose();
    _accountHolder.dispose();
    super.dispose();
  }

  bool _validateCurrentStep() {
    final l10n = context.l10n;
    switch (_step) {
      case 0:
        return _accountFormKey.currentState?.validate() ?? false;
      case 1:
        if (!(_payoutFormKey.currentState?.validate() ?? false)) return false;
        if (!_accepted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(l10n.registerAcceptCommission),
              backgroundColor: const Color(0xFFDC2626),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  }

  void _goToStep(int step) {
    setState(() => _step = step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOutCubic,
    );
  }

  void _handleNext() {
    if (!_validateCurrentStep()) return;
    if (_step >= _stepCount - 1) {
      _submit();
      return;
    }
    _goToStep(_step + 1);
  }

  void _handleBack() {
    if (_step == 0) {
      if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      } else {
        context.go('/splash');
      }
      return;
    }
    _goToStep(_step - 1);
  }

  Future<void> _pickDocument() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (image == null) return;
    setState(() => _pendingDocs.add(File(image.path)));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(context.l10n.registerDocAdded),
        backgroundColor: const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_validateCurrentStep()) return;

    setState(() => _loading = true);
    try {
      final api = ref.read(driverApiProvider);
      final result = await api.registerAuth({
        'email': _email.text.trim(),
        'password': _password.text,
        'accountType': _accountType,
        'legalName': _legalName.text.trim(),
        'tradeName': _tradeName.text.trim().isNotEmpty ? _tradeName.text.trim() : _legalName.text.trim(),
        'contactEmail': _email.text.trim(),
        'contactPhone': _phone.text.trim(),
        'driverCount': int.tryParse(_driverCount.text.trim()) ?? 1,
        'commissionAccepted': true,
        'payoutDetails': {
          'iban': _iban.text.trim(),
          'bankName': _bankName.text.trim(),
          'accountHolder': _accountHolder.text.trim().isNotEmpty
              ? _accountHolder.text.trim()
              : _legalName.text.trim(),
        },
        if (_plate.text.trim().isNotEmpty)
          'vehicles': [
            {
              'vehicleClassId': _defaultVehicleClassId ?? 'vc-vito-vip',
              'plateNumber': _plate.text.trim(),
              'driver': {
                'name': _legalName.text.trim(),
                'phone': _phone.text.trim(),
              },
            },
          ],
      });

      if (result['ok'] != true ||
          result['supplierId'] == null ||
          result['token'] == null) {
        throw Exception(result['message'] as String? ?? 'Registration failed');
      }

      final supplierId = result['supplierId'] as String;
      final token = result['token'] as String;

      await ref.read(driverSessionProvider.notifier).setAuthSession(
            supplierId: supplierId,
            authToken: token,
            profile: DriverProfileSnapshot(
              legalName: _legalName.text.trim(),
              tradeName: _tradeName.text.trim().isNotEmpty
                  ? _tradeName.text.trim()
                  : _legalName.text.trim(),
              status: result['status'] as String? ?? 'pending',
              accountType: _accountType,
              documentsSubmitted: _pendingDocs.isNotEmpty,
            ),
          );

      // Upload documents if any were selected
      if (_pendingDocs.isNotEmpty) {
        final docs = <Map<String, dynamic>>[];
        for (final file in _pendingDocs) {
          try {
            final upload = await api.uploadFile(file);
            final url = upload['url'] as String? ?? upload['fileUrl'] as String?;
            if (url != null) {
              docs.add({'kind': 'license', 'url': url});
            }
          } catch (_) {
            // Non-blocking upload fallback
          }
        }
        if (docs.isNotEmpty) {
          try {
            await api.uploadDocuments(supplierId, docs);
          } catch (_) {}
        }
      }

      if (!mounted) return;

      // Show luxury confirmation modal
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF130D2B),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: const BorderSide(color: Color(0xFFD97706), width: 1.5),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_rounded, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'تم إرسال طلب الشريك بنجاح!',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'مرحباً بك في شبكة لوناليزا VIP كابتن. تم تسجيل حسابك وبيانات شركتك بنجاح، وطلبك الآن قيد مراجعة وتدقيق المستندات من قِبل إدارة لوناليزا.',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.85),
                  fontSize: 13,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFD97706).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFD97706).withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.shield_outlined, color: Color(0xFFFBBF24), size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'الحالة: قيد المراجعة والاعتماد الفوري',
                        style: const TextStyle(
                          color: Color(0xFFFBBF24),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFD97706),
                  foregroundColor: const Color(0xFF0F172A),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: () {
                  Navigator.of(ctx).pop();
                  context.go('/catalog');
                },
                child: const Text(
                  'متابعة إلى لوحة التحكم',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                ),
              ),
            ),
          ],
        ),
      );
    } catch (error) {
      if (!mounted) return;
      final msg = error.toString().replaceAll('Exception: ', '');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  msg,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFFDC2626),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final locale = ref.watch(appLocaleNotifierProvider);
    final isAr = locale.languageCode == 'ar';
    final bottomInset = MediaQuery.paddingOf(context).bottom;

    final stepLabels = [
      isAr ? 'بيانات الشريك' : l10n.registerStepAccount,
      isAr ? 'الحساب البنكي' : l10n.registerStepPayout,
      isAr ? 'أوراق الشركة' : l10n.registerStepDocuments,
      isAr ? 'مراجعة واعتماد' : l10n.registerStepReview,
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary),
          onPressed: _handleBack,
        ),
        title: Text(
          isAr ? 'تسجيل شريك أسطول VIP' : l10n.registerTitle,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Luxury Step Progress Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 14),
              child: Row(
                children: List.generate(_stepCount, (index) {
                  final active = index <= _step;
                  final current = index == _step;
                  return Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                        right: index < _stepCount - 1 ? 8 : 0,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 4,
                            decoration: BoxDecoration(
                              gradient: active
                                  ? const LinearGradient(
                                      colors: [Color(0xFFD97706), Color(0xFFF59E0B)],
                                    )
                                  : null,
                              color: active ? null : AppColors.border,
                              borderRadius: BorderRadius.circular(4),
                              boxShadow: current
                                  ? [
                                      BoxShadow(
                                        color: AppColors.purple.withValues(alpha: 0.3),
                                        blurRadius: 6,
                                      ),
                                    ]
                                  : null,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            stepLabels[index],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: current ? FontWeight.w900 : FontWeight.w500,
                              color: current
                                  ? AppColors.purple
                                  : (active ? AppColors.textPrimary : AppColors.textHint),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),

            // Step Pages
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (index) => setState(() => _step = index),
                children: [
                  _buildAccountStep(l10n, isAr),
                  _buildPayoutStep(l10n, isAr),
                  _buildDocumentsStep(l10n, isAr),
                  _buildReviewStep(l10n, isAr),
                ],
              ),
            ),

            // Bottom Navigation Actions
            Padding(
              padding: EdgeInsets.fromLTRB(20, 12, 20, 16 + bottomInset),
              child: Row(
                children: [
                  if (_step > 0)
                    Expanded(
                      child: SizedBox(
                        height: 50,
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          onPressed: _loading ? null : _handleBack,
                          child: Text(
                            l10n.registerBack,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                  if (_step > 0) const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: SizedBox(
                      height: 50,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFD97706), Color(0xFFF59E0B)],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFD97706).withValues(alpha: 0.35),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: _loading ? null : _handleNext,
                            child: Center(
                              child: _loading
                                  ? const SizedBox(
                                      width: 22,
                                      height: 22,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.5,
                                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0F172A)),
                                      ),
                                    )
                                  : Text(
                                      _step == _stepCount - 1
                                          ? (isAr ? 'إرسال طلب الانضمام للموافقة' : l10n.submitForApproval)
                                          : (isAr ? 'المتابعة للخطوة التالية' : l10n.registerNext),
                                      style: const TextStyle(
                                        color: Color(0xFF0F172A),
                                        fontSize: 15,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountStep(dynamic l10n, bool isAr) {
    return Form(
      key: _accountFormKey,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.border),
              boxShadow: AppTheme.cardShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAr ? 'نوع الحساب في المنظومة' : 'Partner Account Type',
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: _accountType,
                  dropdownColor: Colors.white,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: _inputDecoration(''),
                  items: [
                    DropdownMenuItem(
                      value: 'owner_driver',
                      child: Text(isAr ? 'كابتن وسائق مالك لمركبة VIP' : 'Owner-driver (Single VIP vehicle)'),
                    ),
                    DropdownMenuItem(
                      value: 'company',
                      child: Text(isAr ? 'شركة نقل سياحي رسمي / أسطول' : 'Licensed Transport Fleet Company'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) setState(() => _accountType = value);
                  },
                ),

                const SizedBox(height: 16),

                Text(
                  isAr ? 'اسم المفوض أو صاحب الحساب الرسمي' : l10n.accountHolder,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _legalName,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: _inputDecoration(isAr ? 'الاسم الثلاثي كما بالهوية / السجل' : 'Full legal name'),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? l10n.errorGeneric : null,
                ),

                const SizedBox(height: 16),

                Text(
                  isAr ? 'الاسم التجاري للشركة أو الأسطول' : l10n.registerTradeName,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _tradeName,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: _inputDecoration(isAr ? 'مثال: أسطول البوسفور للنقل الفاخر' : 'Trade / brand name'),
                ),

                const SizedBox(height: 16),

                Text(
                  l10n.emailLabel,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: _inputDecoration('partner@example.com'),
                  validator: (v) =>
                      v == null || !v.contains('@') ? l10n.emailInvalid : null,
                ),

                const SizedBox(height: 16),

                Text(
                  l10n.passwordLabel,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _password,
                  obscureText: true,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: _inputDecoration('••••••••'),
                  validator: (v) =>
                      v == null || v.length < 6 ? l10n.passwordMinLength : null,
                ),

                const SizedBox(height: 16),

                Text(
                  l10n.registerPhone,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: _inputDecoration('+90 5xx xxx xxxx'),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? l10n.errorGeneric : null,
                ),

                if (_accountType == 'company') ...[
                  const SizedBox(height: 16),
                  Text(
                    isAr ? 'عدد السائقين العاملين بالأسطول' : l10n.registerDriverCount,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _driverCount,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                    decoration: _inputDecoration('5'),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPayoutStep(dynamic l10n, bool isAr) {
    return Form(
      key: _payoutFormKey,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        children: [
          // Platform commission card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.account_balance_wallet_outlined, color: AppColors.goldDark, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      '${l10n.platformCommission}: ${_commissionPct?.toStringAsFixed(1) ?? '15.0'}%',
                      style: const TextStyle(
                        color: AppColors.goldDark,
                        fontWeight: FontWeight.w900,
                        fontSize: 15,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  isAr
                      ? 'أعلى هوامش ربح للسائقين والشركات مع تحويلات بنكية منتظمة لحسابك البنكي أو الـ IBAN أسبوعياً دون تأخير.'
                      : 'Guaranteed weekly bank payouts directly to your IBAN with industry-leading profit margins.',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Bank Details Container
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.border),
              boxShadow: AppTheme.cardShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAr ? 'اسم صاحب الحساب البنكي' : l10n.accountHolder,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _accountHolder,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: _inputDecoration(isAr ? 'الاسم المسجل في البنك' : 'Beneficiary Name'),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? l10n.errorGeneric : null,
                ),

                const SizedBox(height: 16),

                Text(
                  isAr ? 'اسم البنك' : l10n.bankName,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _bankName,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: _inputDecoration(isAr ? 'مثال: Ziraat Bankası / QNB' : 'Bank Name'),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? l10n.errorGeneric : null,
                ),

                const SizedBox(height: 16),

                const Text(
                  'رقم الآيبان الدولي (IBAN)',
                  style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _iban,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontFamily: 'monospace'),
                  decoration: _inputDecoration('TR00 0000 0000 0000 0000 0000 00'),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? l10n.errorGeneric : null,
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          CheckboxListTile(
            value: _accepted,
            onChanged: (value) => setState(() => _accepted = value ?? false),
            activeColor: AppColors.gold,
            checkColor: Colors.white,
            title: Text(
              '${isAr ? 'أوافق على شروط التعاقد ونسبة عمولة المنصة' : l10n.registerAcceptCommission} (${_commissionPct?.toStringAsFixed(1) ?? '15.0'}%)',
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
            ),
            contentPadding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentsStep(dynamic l10n, bool isAr) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      children: [
        Text(
          isAr
              ? 'يرجى إرفاق صور المستندات الرسمية: رخصة النقل السياحي (TURSAB / D2)، السجل التجاري، ورخصة القيادة لتسريع اعتماد الحساب.'
              : l10n.registerDocumentsHint,
          style: const TextStyle(color: AppColors.textSecondary, height: 1.5, fontSize: 13),
        ),
        const SizedBox(height: 16),

        if (_pendingDocs.isEmpty)
          GestureDetector(
            onTap: _pickDocument,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.purple.withValues(alpha: 0.3),
                  width: 1.5,
                ),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.purpleMuted,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.upload_file_rounded, color: AppColors.purple, size: 32),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    isAr ? 'انقر لرفع المستندات والأوراق الرسمية' : l10n.registerPickDocument,
                    style: const TextStyle(color: AppColors.purple, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAr ? 'PDF أو صور عالية الدقة (JPG, PNG)' : 'PDF or images (JPG, PNG)',
                    style: const TextStyle(color: AppColors.textHint, fontSize: 11),
                  ),
                ],
              ),
            ),
          )
        else ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
              boxShadow: AppTheme.cardShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${isAr ? 'المستندات المرفقة' : l10n.documents} (${_pendingDocs.length})',
                      style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    TextButton.icon(
                      onPressed: _pickDocument,
                      icon: const Icon(Icons.add, size: 16),
                      label: Text(isAr ? 'إضافة ملف' : 'Add file'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                ..._pendingDocs.map((doc) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.insert_drive_file_outlined, color: AppColors.purple, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          doc.path.split('/').last,
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: AppColors.textHint, size: 18),
                        onPressed: () => setState(() => _pendingDocs.remove(doc)),
                      ),
                    ],
                  ),
                )),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildReviewStep(dynamic l10n, bool isAr) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      children: [
        Text(
          isAr
              ? 'راجع كافة البيانات المدخلة قبل إرسال ملف الشريك للاعتماد من قِبل إدارة المنصة:'
              : l10n.registerReviewHint,
          style: const TextStyle(color: AppColors.textSecondary, height: 1.45, fontSize: 13),
        ),
        const SizedBox(height: 16),

        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.border),
            boxShadow: AppTheme.cardShadow,
          ),
          child: Column(
            children: [
              _reviewRow(isAr ? 'صاحب الحساب' : l10n.accountHolder, _legalName.text),
              _reviewRow(isAr ? 'الاسم التجاري' : l10n.registerTradeName, _tradeName.text),
              _reviewRow(l10n.emailLabel, _email.text),
              _reviewRow(l10n.registerPhone, _phone.text),
              _reviewRow(
                isAr ? 'نوع المنشأة' : 'Account type',
                _accountType == 'company'
                    ? (isAr ? 'شركة نقل وسياحة' : 'Fleet Company')
                    : (isAr ? 'سائق مالك VIP' : 'Owner-Driver'),
              ),
              _reviewRow(isAr ? 'اسم البنك' : l10n.bankName, _bankName.text),
              _reviewRow('IBAN', _iban.text),
              _reviewRow(
                isAr ? 'عدد الوثائق المرفقة' : l10n.documents,
                '${_pendingDocs.length}',
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Initial VIP vehicle registration
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
            boxShadow: AppTheme.cardShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.directions_car_rounded, color: AppColors.goldDark, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    isAr ? 'أول سيارة في الأسطول (Mercedes Vito VIP)' : 'First VIP Fleet Vehicle',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _plate,
                style: const TextStyle(color: Colors.white, fontSize: 14, fontFamily: 'monospace'),
                textCapitalization: TextCapitalization.characters,
                decoration: _inputDecoration(isAr ? 'رقم اللوحة (مثال: 34 VIP 001)' : l10n.plateNumber),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _reviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 125,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value.trim().isEmpty ? '—' : value,
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: AppColors.textHint, fontSize: 13),
      filled: true,
      fillColor: AppColors.surfaceLight,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AppColors.purple, width: 1.5),
      ),
    );
  }
}
