import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/catalog_i18n.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

enum AddVehicleMode { aiCopilot, fromCatalog, manual }

class DriverAddVehiclePage extends ConsumerStatefulWidget {
  const DriverAddVehiclePage({super.key});

  @override
  ConsumerState<DriverAddVehiclePage> createState() =>
      _DriverAddVehiclePageState();
}

class _DriverAddVehiclePageState extends ConsumerState<DriverAddVehiclePage> {
  AddVehicleMode _mode = AddVehicleMode.aiCopilot;

  final _plate = TextEditingController();
  final _code = TextEditingController();
  final _nameEn = TextEditingController();
  final _nameAr = TextEditingController();
  final _nameTr = TextEditingController();
  final _capacity = TextEditingController(text: '6');
  final _aiPrompt = TextEditingController();

  final _descAr = TextEditingController();
  final _descEn = TextEditingController();
  final _videoUrl = TextEditingController();
  final _make = TextEditingController(text: 'Mercedes-Benz');
  final _model = TextEditingController(text: 'Vito VIP');
  final _year = TextEditingController(text: '2024');
  final _luggageLarge = TextEditingController(text: '6');
  final _luggageSmall = TextEditingController(text: '4');
  String _tier = 'vip';
  final Set<String> _selectedAmenities = {
    'واي فاي 5G فائق السرعة',
    'مقصورة عازلة للصوت بالكامل',
    'مقاعد جلدية VIP مع مساج وتبريد',
    'شاشة ذكية / Apple TV / Netflix',
    'ثلاجة ومشروبات وضيافة مجانية',
    'شواحن هواتف ومنافذ كهرباء 220V',
  };

  static const List<String> _availableAmenities = [
    'واي فاي 5G فائق السرعة',
    'مقصورة عازلة للصوت بالكامل',
    'مقاعد جلدية VIP مع مساج وتبريد',
    'شاشة ذكية / Apple TV / Netflix',
    'ثلاجة ومشروبات وضيافة مجانية',
    'شواحن هواتف ومنافذ كهرباء 220V',
    'سائق خاص يتحدث العربية',
    'استقبال بالاسم في المطار وتتبع الرحلات',
    'تكييف هواء مركزي مزدوج',
    'ستائر خصوصية وزجاج مظلل بالكامل',
    'سقف مضاء بنجوم السماء (Starlight)',
    'نسبة نظافة وتعقيم معتمدة 98%',
    'مقاعد أطفال معتمدة مجاناً',
    'مساحة شاسعة للحقائب الكبيرة',
    'طاولة عمل واجتماعات قابلة للطي',
  ];

  bool _loading = false;
  bool _isAiAnalyzing = false;
  bool _loadingClasses = true;

  final List<File> _photos = [];
  String? _selectedClassId;
  List<Map<String, dynamic>> _vehicleClasses = [];

  Map<String, dynamic>? _aiResult;

  @override
  void initState() {
    super.initState();
    _loadClasses();
  }

  Future<void> _loadClasses() async {
    try {
      final data = await ref.read(driverApiProvider).fetchCatalog();
      if (!mounted) return;
      setState(() {
        _vehicleClasses = (data['vehicleClasses'] as List?)
                ?.cast<Map<String, dynamic>>() ??
            [];
        _loadingClasses = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingClasses = false);
    }
  }

  @override
  void dispose() {
    _plate.dispose();
    _code.dispose();
    _nameEn.dispose();
    _nameAr.dispose();
    _nameTr.dispose();
    _capacity.dispose();
    _aiPrompt.dispose();
    _descAr.dispose();
    _descEn.dispose();
    _videoUrl.dispose();
    _make.dispose();
    _model.dispose();
    _year.dispose();
    _luggageLarge.dispose();
    _luggageSmall.dispose();
    super.dispose();
  }

  IconData _getAmenityIcon(String amenity) {
    if (amenity.contains('واي فاي') || amenity.contains('WiFi')) {
      return Icons.wifi_rounded;
    }
    if (amenity.contains('عازلة للصوت') || amenity.contains('هدوء')) {
      return Icons.volume_off_rounded;
    }
    if (amenity.contains('مساج') || amenity.contains('مقاعد') || amenity.contains('جلد')) {
      return Icons.airline_seat_recline_extra_rounded;
    }
    if (amenity.contains('شاشة') || amenity.contains('TV') || amenity.contains('Netflix')) {
      return Icons.tv_rounded;
    }
    if (amenity.contains('ثلاجة') || amenity.contains('مشروبات') || amenity.contains('ضيافة')) {
      return Icons.kitchen_rounded;
    }
    if (amenity.contains('شواحن') || amenity.contains('كهرباء') || amenity.contains('220V')) {
      return Icons.power_rounded;
    }
    if (amenity.contains('سائق') || amenity.contains('العربية')) {
      return Icons.person_pin_rounded;
    }
    if (amenity.contains('استقبال') || amenity.contains('مطار') || amenity.contains('تتبع')) {
      return Icons.badge_rounded;
    }
    if (amenity.contains('تكييف') || amenity.contains('مزدوج')) {
      return Icons.ac_unit_rounded;
    }
    if (amenity.contains('ستائر') || amenity.contains('مظلل') || amenity.contains('خصوصية')) {
      return Icons.curtains_closed_rounded;
    }
    if (amenity.contains('نجوم') || amenity.contains('Starlight') || amenity.contains('سقف')) {
      return Icons.auto_awesome_rounded;
    }
    if (amenity.contains('نظافة') || amenity.contains('تعقيم')) {
      return Icons.cleaning_services_rounded;
    }
    if (amenity.contains('أطفال') || amenity.contains('طفل')) {
      return Icons.child_friendly_rounded;
    }
    if (amenity.contains('حقائب') || amenity.contains('أمتعة')) {
      return Icons.luggage_rounded;
    }
    if (amenity.contains('طاولة') || amenity.contains('اجتماعات') || amenity.contains('عمل')) {
      return Icons.table_restaurant_rounded;
    }
    return Icons.check_circle_outline_rounded;
  }

  Future<void> _pickPhoto({ImageSource source = ImageSource.gallery}) async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: source, imageQuality: 85);
    if (image != null) {
      setState(() => _photos.add(File(image.path)));
    }
  }

  Future<List<String>> _uploadPhotos() async {
    final urls = <String>[];
    for (final photo in _photos) {
      try {
        final result = await ref.read(driverApiProvider).uploadFile(photo);
        final url = result['url'] as String? ?? result['fileUrl'] as String?;
        if (url != null) urls.add(url);
      } catch (_) {}
    }
    return urls;
  }

  Future<void> _runAiCopilot() async {
    if (_aiPrompt.text.trim().isEmpty && _photos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.rose,
          content: Text('يرجى كتابة شرح للسيارة أو التقاط/رفع صورة واحدة على الأقل لتحليلها بالذكاء الاصطناعي'),
        ),
      );
      return;
    }

    setState(() => _isAiAnalyzing = true);
    try {
      final uploadedUrls = await _uploadPhotos();
      final supplierId = ref.read(driverSessionProvider).supplierId;

      final res = await ref.read(driverApiProvider).generateAiVehicleSpecs(
        promptText: _aiPrompt.text.trim(),
        imageUrls: uploadedUrls,
        supplierId: supplierId,
        autoSave: false,
      );

      if (!mounted) return;
      if (res['ok'] == true && res['vehicleClass'] != null) {
        final cls = res['vehicleClass'] as Map<String, dynamic>;
        setState(() {
          _aiResult = cls;
          _nameAr.text = cls['name']?['ar'] ?? '';
          _nameEn.text = cls['name']?['en'] ?? '';
          _code.text = cls['code'] ?? '';
          _descAr.text = cls['description']?['ar'] ?? '';
          if (cls['tier'] != null) _tier = cls['tier'].toString();
          final cap = cls['capacity']?['passengers'];
          if (cap != null) _capacity.text = cap.toString();
          final lugL = cls['capacity']?['luggageLarge'];
          if (lugL != null) _luggageLarge.text = lugL.toString();
          final lugS = cls['capacity']?['luggageSmall'];
          if (lugS != null) _luggageSmall.text = lugS.toString();
          if (cls['amenities'] is List) {
            for (final a in cls['amenities']) {
              if (a != null) _selectedAmenities.add(a.toString());
            }
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AppColors.emerald,
            content: Text('✨ تم استخراج مواصفات السيارة بالذكاء الاصطناعي بنجاح! راجع البيانات أدناه ثم اضغط اعتماد ونشر.'),
          ),
        );
      } else {
        throw Exception(res['error'] ?? 'فشل تحليل السيارة');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.rose,
          content: Text('خطأ الذكاء الاصطناعي: $e'),
        ),
      );
    } finally {
      if (mounted) setState(() => _isAiAnalyzing = false);
    }
  }

  Future<void> _submit() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    if (_plate.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.rose,
          content: Text('يرجى إدخال رقم لوحة السيارة (مثال: 34 VIP 789)'),
        ),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final photoUrls = await _uploadPhotos();

      if (_mode == AddVehicleMode.aiCopilot && _aiResult == null) {
        final res = await ref.read(driverApiProvider).generateAiVehicleSpecs(
          promptText: _aiPrompt.text.trim(),
          imageUrls: photoUrls,
          supplierId: supplierId,
          plateNumber: _plate.text.trim(),
          autoSave: true,
          publishToCatalog: true,
        );
        if (res['ok'] != true) {
          throw Exception(res['error'] ?? 'فشل نشر السيارة بالكتالوج');
        }
      } else if (_mode == AddVehicleMode.fromCatalog) {
        if (_selectedClassId == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(context.l10n.selectVehicleClass)),
          );
          return;
        }

        await ref.read(driverApiProvider).addFleetVehicle(
          supplierId,
          {
            'vehicleClassId': _selectedClassId,
            'plateNumber': _plate.text.trim(),
            if (photoUrls.isNotEmpty)
              'ownImages': photoUrls.map((url) => {'url': url}).toList(),
          },
        );
      } else {
        // AI Copilot with reviewed/edited specs OR Manual Mode
        final nameAr = _nameAr.text.trim().isNotEmpty
            ? _nameAr.text.trim()
            : (_aiResult?['name']?['ar'] ?? '${_make.text.trim().isNotEmpty ? _make.text.trim() : "Mercedes-Benz"} ${_model.text.trim().isNotEmpty ? _model.text.trim() : "Vito"} VIP');
        final nameEn = _nameEn.text.trim().isNotEmpty
            ? _nameEn.text.trim()
            : (_aiResult?['name']?['en'] ?? nameAr);

        final descAr = _descAr.text.trim().isNotEmpty
            ? _descAr.text.trim()
            : (_aiResult?['description']?['ar'] ?? 'مركبة سياحية فاخرة مع سائق محترف وضيافة VIP متكاملة');

        final finalAmenities = _selectedAmenities.isNotEmpty
            ? _selectedAmenities.toList()
            : (_aiResult?['amenities'] is List ? List<String>.from(_aiResult!['amenities']) : _availableAmenities.take(6).toList());

        await ref.read(driverApiProvider).submitNewVehicleClass(supplierId, {
          'code': _code.text.trim().isNotEmpty
              ? _code.text.trim().toUpperCase()
              : 'VIP_${_plate.text.trim().replaceAll(' ', '_')}',
          'nameI18n': {
            'ar': nameAr,
            'en': nameEn,
            'tr': nameEn,
          },
          'descriptionI18n': {
            'ar': descAr,
            'en': 'Luxury VIP transfer vehicle with professional chauffeur',
            'tr': 'Lüks VIP transfer aracı',
          },
          'tier': _aiResult?['tier'] ?? _tier,
          'capacity': {
            'passengers': int.tryParse(_capacity.text.trim()) ?? _aiResult?['capacity']?['passengers'] ?? 6,
            'luggageLarge': int.tryParse(_luggageLarge.text.trim()) ?? _aiResult?['capacity']?['luggageLarge'] ?? 6,
            'luggageSmall': int.tryParse(_luggageSmall.text.trim()) ?? 4,
          },
          'specs': {
            'doors': 5,
            'transmission': 'automatic',
            'fuelType': 'diesel',
          },
          'make': _make.text.trim().isNotEmpty ? _make.text.trim() : 'Mercedes-Benz',
          'model': _model.text.trim().isNotEmpty ? _model.text.trim() : 'Vito VIP',
          'year': int.tryParse(_year.text.trim()) ?? 2024,
          'plateNumber': _plate.text.trim(),
          'images': photoUrls,
          'ownImages': photoUrls.map((u) => {'url': u}).toList(),
          'videoUrl': _videoUrl.text.trim(),
          'amenities': finalAmenities,
        });
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.emerald,
          content: Text('🎉 تم اعتماد ونشر السيارة بنجاح وإضافتها لأسطولك المعتمد!'),
        ),
      );
      context.pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.rose, content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('إضافة سيارة للأسطول (AI Studio)'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          // 3 Mode Segmented Buttons with Daylight Design
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                _buildModeTab(
                  mode: AddVehicleMode.aiCopilot,
                  label: 'وكيل AI الذكي ✨',
                  icon: Icons.auto_awesome_rounded,
                ),
                _buildModeTab(
                  mode: AddVehicleMode.fromCatalog,
                  label: 'من الكتالوج',
                  icon: Icons.storefront_outlined,
                ),
                _buildModeTab(
                  mode: AddVehicleMode.manual,
                  label: 'يدوي',
                  icon: Icons.edit_note_rounded,
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // AI Copilot Studio Mode
          if (_mode == AddVehicleMode.aiCopilot) ...[
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE9D5FF), width: 1.5),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: AppTheme.brandGradient,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.psychology_rounded, color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'استوديو الذكاء الاصطناعي لفحص المركبات',
                              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.textPrimary),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'التقط صور السيارة واكتب أو سجل وصفها، وسيتكفل Gemini AI باستخراج المميزات ونشرها فوراً.',
                              style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.3),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Quick Suggestion Chips
                  const Text(
                    'نماذج سريعة للإلهام:',
                    style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _buildPromptChip('مرسيدس فيتو VIP ملكية 2024 مقاعد مساج وثلاجة وواي فاي'),
                      _buildPromptChip('مرسيدس سبرينتر VIP عائلية 14 راكب وسقف نجوم شاشة ذكية'),
                      _buildPromptChip('مرسيدس مايباخ S-Class فاخرة لرجال الأعمال مع ضيافة'),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Prompt input
                  TextField(
                    controller: _aiPrompt,
                    maxLines: 3,
                    style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'اكتب مواصفات سيارتك هنا (مثال: مرسيدس فيتو تورير VIP موديل 2024، مقصورة جلدية فاخرة، شاشة Apple TV، ثلاجة، مقاعد تدليك، وسائق يتحدث العربية)...',
                      filled: true,
                      fillColor: AppColors.surfaceLight,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Photo Pickers (Camera & Gallery)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickPhoto(source: ImageSource.camera),
                          icon: const Icon(Icons.camera_alt_rounded, size: 18),
                          label: const Text('تصوير بالكاميرا'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.purple),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickPhoto(source: ImageSource.gallery),
                          icon: const Icon(Icons.photo_library_rounded, size: 18),
                          label: const Text('من الاستوديو'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.purple),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Thumbnails Gallery
                  if (_photos.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    SizedBox(
                      height: 80,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _photos.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 10),
                        itemBuilder: (_, i) => Stack(
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: i == 0 ? AppColors.purple : AppColors.border,
                                  width: i == 0 ? 2 : 1,
                                ),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: Image.file(_photos[i], fit: BoxFit.cover),
                            ),
                            if (i == 0)
                              Positioned(
                                bottom: 4,
                                left: 4,
                                right: 4,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.purple,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'الغلاف',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
                                  ),
                                ),
                              ),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: GestureDetector(
                                onTap: () => setState(() => _photos.removeAt(i)),
                                child: Container(
                                  padding: const EdgeInsets.all(3),
                                  decoration: const BoxDecoration(
                                    color: Colors.black87,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.close, color: Colors.white, size: 12),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),

                  // AI Analyze Trigger Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.purple,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: _isAiAnalyzing ? null : _runAiCopilot,
                      icon: _isAiAnalyzing
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.auto_awesome_rounded, color: AppColors.goldLight),
                      label: Text(
                        _isAiAnalyzing ? 'جاري الفحص واستخراج المواصفات عبر Gemini...' : 'تحليل السيارة بالذكاء الاصطناعي ✨',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                      ),
                    ),
                  ),

                  // AI Extracted Specifications Preview Card
                  if (_aiResult != null) ...[
                    const SizedBox(height: 18),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.emerald, width: 1.5),
                        boxShadow: AppTheme.cardShadow,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.verified_rounded, color: AppColors.emerald, size: 22),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _aiResult!['name']?['ar'] ?? '',
                                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.textPrimary),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.purple,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  (_aiResult!['tier'] ?? 'VIP').toString().toUpperCase(),
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _aiResult!['description']?['ar'] ?? '',
                            style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary, height: 1.4),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.people_alt_outlined, size: 16, color: AppColors.purple),
                                    const SizedBox(width: 6),
                                    Text(
                                      '${_aiResult!['capacity']?['passengers'] ?? 6} مقاعد VIP',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 10),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.luggage_outlined, size: 16, color: AppColors.purple),
                                    const SizedBox(width: 6),
                                    Text(
                                      '${_aiResult!['capacity']?['luggageLarge'] ?? 6} حقائب كبيرة',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          if (_aiResult!['amenities'] is List) ...[
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: (_aiResult!['amenities'] as List).map((a) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: AppColors.emerald.withValues(alpha: 0.3)),
                                  ),
                                  child: Text(
                                    a.toString(),
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.emerald),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 18),
          ],

          // Standard Catalog Selection
          if (_mode == AddVehicleMode.fromCatalog) ...[
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Column(
                children: [
                  if (_loadingClasses)
                    const LinearProgressIndicator(color: AppColors.purple)
                  else
                    DropdownButtonFormField<String>(
                      value: _selectedClassId,
                      decoration: InputDecoration(
                        labelText: l10n.vehiclesTab,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      items: _vehicleClasses.map((cls) {
                        final id = cls['_id']?.toString() ?? cls['id']?.toString() ?? '';
                        return DropdownMenuItem(
                          value: id,
                          child: Text(catalogItemTitle(cls, context)),
                        );
                      }).toList(),
                      onChanged: (v) => setState(() => _selectedClassId = v),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 18),
          ],

          // Manual Mode Fields
          if (_mode == AddVehicleMode.manual) ...[
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'صور المركبة والألبوم (الكتالوج)',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'التقط أو ارفع صور السيارة لتظهر في نتائج البحث والكتالوج الرسمي',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 12),

                  // Photo buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickPhoto(source: ImageSource.camera),
                          icon: const Icon(Icons.camera_alt_rounded, size: 18),
                          label: const Text('تصوير بالكاميرا'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.purple),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickPhoto(source: ImageSource.gallery),
                          icon: const Icon(Icons.photo_library_rounded, size: 18),
                          label: const Text('من الاستوديو'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.purple),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Thumbnails Gallery
                  if (_photos.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    SizedBox(
                      height: 80,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _photos.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 10),
                        itemBuilder: (_, i) => Stack(
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: i == 0 ? AppColors.purple : AppColors.border,
                                  width: i == 0 ? 2 : 1,
                                ),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: Image.file(_photos[i], fit: BoxFit.cover),
                            ),
                            if (i == 0)
                              Positioned(
                                bottom: 4,
                                left: 4,
                                right: 4,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.purple,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'الغلاف',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
                                  ),
                                ),
                              ),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: GestureDetector(
                                onTap: () => setState(() => _photos.removeAt(i)),
                                child: Container(
                                  padding: const EdgeInsets.all(3),
                                  decoration: const BoxDecoration(
                                    color: Colors.black87,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.close, color: Colors.white, size: 12),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),
                  const Divider(color: AppColors.border),
                  const SizedBox(height: 12),

                  const Text(
                    'رابط فيديو السيارة (اختياري)',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _videoUrl,
                    decoration: const InputDecoration(
                      hintText: 'https://youtube.com/... أو رابط فيديو سحابي',
                      prefixIcon: Icon(Icons.video_library_rounded, color: AppColors.purple),
                    ),
                  ),

                  const SizedBox(height: 16),
                  const Divider(color: AppColors.border),
                  const SizedBox(height: 12),

                  const Text(
                    'المواصفات الفنية والموديل',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _make,
                          decoration: const InputDecoration(
                            labelText: 'الشركة الصانعة',
                            hintText: 'مثال: Mercedes-Benz',
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _model,
                          decoration: const InputDecoration(
                            labelText: 'الموديل',
                            hintText: 'مثال: Vito VIP',
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _year,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'سنة الصنع',
                            hintText: '2024',
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _tier,
                          decoration: const InputDecoration(labelText: 'درجة الفخامة'),
                          items: const [
                            DropdownMenuItem(value: 'vip', child: Text('فخامة مطلقة VIP')),
                            DropdownMenuItem(value: 'maybach', child: Text('مايباخ رويال Maybach')),
                            DropdownMenuItem(value: 'business', child: Text('رجال أعمال Business')),
                            DropdownMenuItem(value: 'group', child: Text('حافلة مجموعات Sprinter')),
                          ],
                          onChanged: (v) {
                            if (v != null) setState(() => _tier = v);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _nameAr,
                    decoration: const InputDecoration(
                      labelText: 'اسم السيارة التجاري (عربي)',
                      hintText: 'مثال: مرسيدس فيتو VIP ملكية 2024',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _nameEn,
                    decoration: InputDecoration(
                      labelText: l10n.vehicleNameEn,
                      hintText: 'e.g. Mercedes Vito VIP Tourer',
                    ),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _descAr,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'الوصف التسويقي للسيارة والمقصورة (عربي)',
                      hintText: 'مقصورة فاخرة عازلة للصوت مع مقاعد جلدية وخدمات ضيافة ملكية...',
                    ),
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _capacity,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'مقاعد الركاب'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _luggageLarge,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'حقائب كبيرة'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _luggageSmall,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'حقائب يد'),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),
                  const Divider(color: AppColors.border),
                  const SizedBox(height: 12),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'المزايا والكماليات المتوفرة (صفين صفين)',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.textPrimary),
                      ),
                      Text(
                        '(${_selectedAmenities.length} محددة)',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.purple),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  GridView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    shrinkWrap: true,
                    itemCount: _availableAmenities.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 2.7,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    itemBuilder: (context, index) {
                      final amenity = _availableAmenities[index];
                      final isSelected = _selectedAmenities.contains(amenity);
                      final icon = _getAmenityIcon(amenity);

                      return InkWell(
                        onTap: () {
                          setState(() {
                            if (isSelected) {
                              _selectedAmenities.remove(amenity);
                            } else {
                              _selectedAmenities.add(amenity);
                            }
                          });
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 160),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFFAF5FF) : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? AppColors.purple : Colors.grey.shade200,
                              width: isSelected ? 1.6 : 1,
                            ),
                            boxShadow: [
                              if (isSelected)
                                BoxShadow(
                                  color: AppColors.purple.withValues(alpha: 0.08),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 30,
                                height: 30,
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.purple.withValues(alpha: 0.12) : Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(
                                  icon,
                                  size: 16,
                                  color: isSelected ? AppColors.purple : Colors.grey.shade600,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  amenity,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                    color: isSelected ? AppColors.purpleDark : AppColors.textPrimary,
                                    height: 1.2,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (isSelected)
                                const Icon(Icons.check_circle_rounded, size: 16, color: AppColors.purple),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
          ],

          // Plate Number & Confirm Publish Button
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
              boxShadow: AppTheme.cardShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'بيانات اللوحة والترخيص',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _plate,
                  decoration: const InputDecoration(
                    labelText: 'رقم لوحة المركبة (مثال: 34 VIP 789)',
                    prefixIcon: Icon(Icons.badge_rounded, color: AppColors.purple),
                  ),
                  textCapitalization: TextCapitalization.characters,
                ),
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.purple,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: _loading ? null : _submit,
                    child: _loading
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            _mode == AddVehicleMode.aiCopilot
                                ? 'اعتماد ونشر السيارة في الكتالوج والأسطول ✨'
                                : l10n.confirm,
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModeTab({
    required AddVehicleMode mode,
    required String label,
    required IconData icon,
  }) {
    final isSelected = _mode == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _mode = mode),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.purple : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 16,
                color: isSelected ? Colors.white : AppColors.textMuted,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPromptChip(String text) {
    return GestureDetector(
      onTap: () => setState(() => _aiPrompt.text = text),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: AppColors.purpleMuted,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          text,
          style: const TextStyle(fontSize: 11, color: AppColors.purple, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
