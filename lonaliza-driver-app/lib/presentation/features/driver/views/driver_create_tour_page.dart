import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverCreateTourPage extends ConsumerStatefulWidget {
  const DriverCreateTourPage({super.key});

  @override
  ConsumerState<DriverCreateTourPage> createState() => _DriverCreateTourPageState();
}

class _DriverCreateTourPageState extends ConsumerState<DriverCreateTourPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController(text: 'جولة بحيرة أوزنجول ومرتفعات السلطان مراد VIP');
  final _stopsController = TextEditingController(
    text: 'الانطلاق من الفندق - مصنع الشاي الطبيعي - بحيرة أوزنجول الخلابة - مرتفعات السلطان مراد - شلالات أوزنجول',
  );
  final _paidActivitiesController = TextEditingController(
    text: 'تذاكر دخول المزارات الخاصة، ألعاب الملاهي والزيبلاين في أوزنجول، وجبة الغداء والمشروبات',
  );
  final _priceController = TextEditingController(text: '160');

  String _selectedCity = 'Trabzon';
  int _durationHours = 10;
  String _selectedVehicleClass = 'vito_vip';

  bool _generating = false;
  bool _publishing = false;
  Map<String, dynamic>? _generatedTour;

  final List<Map<String, String>> _cities = [
    {'id': 'Trabzon', 'nameAr': 'طرابزون والشمال التركي', 'nameEn': 'Trabzon'},
    {'id': 'Istanbul', 'nameAr': 'إسطنبول والبسفور', 'nameEn': 'Istanbul'},
    {'id': 'Cappadocia', 'nameAr': 'كابادوكيا والمناطيد', 'nameEn': 'Cappadocia'},
    {'id': 'Antalya', 'nameAr': 'أنطاليا والريفييرا', 'nameEn': 'Antalya'},
    {'id': 'Bodrum', 'nameAr': 'بودروم وبحر إيجة', 'nameEn': 'Bodrum'},
    {'id': 'Bursa', 'nameAr': 'بورصة وجبل أولوداغ', 'nameEn': 'Bursa'},
    {'id': 'Sapanca', 'nameAr': 'سبانجا ومعشوقية', 'nameEn': 'Sapanca'},
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _stopsController.dispose();
    _paidActivitiesController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  void _onCityChanged(String cityId) {
    setState(() {
      _selectedCity = cityId;
      if (cityId == 'Trabzon') {
        _titleController.text = 'جولة بحيرة أوزنجول ومرتفعات السلطان مراد VIP';
        _stopsController.text = 'الانطلاق من الفندق - مصنع الشاي الطبيعي - بحيرة أوزنجول الخلابة - مرتفعات السلطان مراد - شلالات أوزنجول';
        _paidActivitiesController.text = 'تذاكر دخول المزارات الخاصة، ألعاب الملاهي والزيبلاين في أوزنجول، وجبة الغداء والمشروبات';
      } else if (cityId == 'Istanbul') {
        _titleController.text = 'جولة إسطنبول التاريخية ومضيق البسفور VIP';
        _stopsController.text = 'قصر دولمة بهجة - أورتاكوي والبسفور - منطقة السلطان أحمد وآيا صوفيا - برج الفتاة - تل العرائس تشامليجا';
        _paidActivitiesController.text = 'تذاكر دخول القصور والمتاحف، جولة القارب بالبسفور، وجبة الغداء بالمطعم البحري';
      } else if (cityId == 'Sapanca') {
        _titleController.text = 'جولة سبانجا والمعشوقية VIP مع التلفريك والدبابات';
        _stopsController.text = 'الانطلاق من الفندق - بحيرة سبانجا - شلالات المعشوقية الساحرة - تلفريك جبل كارتبه - قرية ناتوركوي';
        _paidActivitiesController.text = 'تذاكر ركوب تلفريك سبانجا، تأجير دبابات السفاري الجبلية ATV، تجربة الزيبلاين، وجبات الغداء والمشروبات الشخصية';
      } else if (cityId == 'Antalya') {
        _titleController.text = 'جولة شلالات دودان وتلفريك أوليمبوس VIP';
        _stopsController.text = 'شلالات دودان العليا والسفلى - المدينة القديمة كاليتشي - تلفريك أوليمبوس - شاطئ كونيالتي';
        _paidActivitiesController.text = 'تذاكر تلفريك أوليمبوس، قارب المدينة القديمة، وجبة الغداء';
      } else if (cityId == 'Bursa') {
        _titleController.text = 'جولة بورصة الخضراء وتلفريك جبل أولوداغ VIP';
        _stopsController.text = 'الجامع الكبير ببورصة - الشجرة التاريخية المعمرة - تلفريك أولوداغ ومحطة الثلوج - مصنع الحلقوم والعسل';
        _paidActivitiesController.text = 'تذاكر تلفريك بورصة أولوداغ، وجبة إسكندر كباب الأصلية، مشتريات الحلقوم التذكارية';
      } else if (cityId == 'Cappadocia') {
        _titleController.text = 'جولة معالم كابادوكيا والمناطيد والوادي الأحمر VIP';
        _stopsController.text = 'مشاهدة إقلاع المناطيد عند الفجر - وادي الرهبان - متحف غوريم المفتوح - قلعة أوتش حصار - مدينة تحت الأرض';
        _paidActivitiesController.text = 'تذاكر ركوب المنطاد الهوائي، رسوم دخول المتاحف والمدن تحت الأرض، وجبات الطعام';
      }
    });
  }

  Future<void> _generateAiTour() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    setState(() => _generating = true);

    try {
      final title = _titleController.text.trim();
      final stops = _stopsController.text.trim();
      final paid = _paidActivitiesController.text.trim();
      final priceVal = double.tryParse(_priceController.text.trim()) ?? 150.0;

      final res = await ref.read(driverApiProvider).generateAiTour(
        title: title.isNotEmpty ? title : 'جولة VIP في $_selectedCity',
        city: _selectedCity,
        durationDays: 1,
        durationHours: _durationHours,
        theme: 'luxury',
        supplierId: supplierId,
        publishToCatalog: true,
        stopsDetails: stops.isNotEmpty ? stops : null,
        paidActivities: paid.isNotEmpty ? paid : null,
        baseFullDayPrice: priceVal,
        isCustomTour: true,
      );

      if (!mounted) return;
      if (res['ok'] == true && res['tour'] != null) {
        setState(() {
          _generatedTour = res['tour'] as Map<String, dynamic>;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('فشل توليد البرنامج: $e')),
      );
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  Future<void> _publishTour() async {
    if (_generatedTour == null) return;
    setState(() => _publishing = true);

    try {
      await Future.delayed(const Duration(milliseconds: 600));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.white),
              SizedBox(width: 8),
              Text('تم نشر واعتماد الجولة في الكتالوج والبحث بنجاح!'),
            ],
          ),
          backgroundColor: AppColors.emerald,
        ),
      );
      context.pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('فشل النشر: $e')),
      );
    } finally {
      if (mounted) setState(() => _publishing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.auto_awesome_rounded, color: AppColors.purpleDark, size: 18),
            ),
            const SizedBox(width: 8),
            const Text(
              'صانع الجولات بالذكاء الاصطناعي',
              style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
          children: [
            // Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.purpleDark, AppColors.purple],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.purple.withValues(alpha: 0.25),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.flight_takeoff_rounded, color: AppColors.gold, size: 28),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ابتكر جولات سياحية احترافية بالذكاء الاصطناعي',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'اختر المدينة والمدة وسيقوم Gemini بصياغة جدول زمني كامل ومحطات الجولة والنشر الفوري في الكتالوج ومحرك بحث الموقع.',
                          style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Step 1: Select City
            const Text(
              'المدينة التركية الوجهة',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _cities.map((city) {
                final isSelected = _selectedCity == city['id'];
                return ChoiceChip(
                  label: Text(city['nameAr']!),
                  selected: isSelected,
                  selectedColor: AppColors.gold.withValues(alpha: 0.2),
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? AppColors.purpleDark : AppColors.textPrimary,
                  ),
                  onSelected: (selected) {
                    if (selected) _onCityChanged(city['id']!);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Step 2: Tour Title
            const Text(
              'عنوان واسم الجولة VIP',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _titleController,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.tour_rounded, color: AppColors.purple, size: 18),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
              ),
            ),
            const SizedBox(height: 16),

            // Step 3: Duration & Price
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('ساعات الجولة', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Row(
                        children: [8, 10, 12].map((hours) {
                          final isSelected = _durationHours == hours;
                          return Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(left: 6),
                              child: InkWell(
                                onTap: () => setState(() => _durationHours = hours),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: isSelected ? AppColors.purple : Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isSelected ? AppColors.purple : AppColors.border,
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '$hours ساعات',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: isSelected ? Colors.white : AppColors.textPrimary,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('السعر المقترح (\$ USD)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _priceController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.attach_money_rounded, size: 18),
                          filled: true,
                          fillColor: Colors.white,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Step 4: Stops & Itinerary
            const Text(
              'محطات وأماكن الزيارة (خط السير)',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _stopsController,
              maxLines: 2,
              style: const TextStyle(fontSize: 12),
              decoration: InputDecoration(
                hintText: 'اكتب المحطات مفصولة بشرطة (-)، وسيقوم الذكاء الاصطناعي بتنظيمها كبرنامج زمني متناسق',
                hintStyle: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                filled: true,
                fillColor: Colors.white,
                prefixIcon: const Icon(Icons.alt_route_rounded, color: AppColors.purple, size: 18),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
              ),
            ),
            const SizedBox(height: 16),

            // Step 5: Paid Activities & Client Tickets Disclaimer
            Row(
              children: [
                const Text(
                  'الأنشطة الإضافية والتذاكر المدفوعة للعميل',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFFB45309)),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
                  child: const Text('غير مشمولة في السيارة', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                ),
              ],
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _paidActivitiesController,
              maxLines: 2,
              style: const TextStyle(fontSize: 12),
              decoration: InputDecoration(
                hintText: 'مثال: تذاكر تلفريك، دبابات ATV سفاري، زيبلاين، رسوم دخول المتاحف، وجبات طعام شخصية',
                hintStyle: const TextStyle(fontSize: 11, color: Color(0xFF92400E)),
                helperText: 'توضح للعميل بشفافية كأنشطة اختيارية يدفعها بنفسه في الموقع تجنباً لأي سوء فهم مالي.',
                helperStyle: const TextStyle(fontSize: 10.5, color: Color(0xFFB45309)),
                filled: true,
                fillColor: const Color(0xFFFFFBEB),
                prefixIcon: const Icon(Icons.receipt_long_rounded, color: Color(0xFFB45309), size: 18),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFFDE68A))),
              ),
            ),
            const SizedBox(height: 20),

            // Generate Button
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: AppColors.purpleDark,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 2,
                ),
                icon: _generating
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.purpleDark))
                    : const Icon(Icons.auto_awesome_rounded),
                label: Text(
                  _generating ? 'جاري توليد وصياغة البرنامج...' : 'توليد واعتماد برنامج الجولة بالذكاء الاصطناعي',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                onPressed: _generating ? null : _generateAiTour,
              ),
            ),
            const SizedBox(height: 24),

            // Generated Tour Display
            if (_generatedTour != null) ...[
              Builder(builder: (context) {
                final tour = _generatedTour!;
                final title = tour['title'] is Map
                    ? (tour['title']['ar'] ?? tour['title']['en'] ?? 'جولة VIP')
                    : (tour['titleAr'] ?? tour['title']?.toString() ?? 'جولة VIP');

                final price = tour['price'] ??
                    (tour['prices'] is List && (tour['prices'] as List).isNotEmpty
                        ? (tour['prices'] as List).first['price']
                        : _priceController.text.trim());

                final itinerary = tour['itinerary'] is List
                    ? (tour['itinerary'] as List)
                    : (tour['stops'] is List ? (tour['stops'] as List) : []);

                final inclusions = tour['inclusions'] is List ? (tour['inclusions'] as List) : [];
                final paidList = tour['paidActivities'] is List ? (tour['paidActivities'] as List) : [];

                return Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.5)),
                    boxShadow: AppTheme.cardShadow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.emerald.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('برنامج معتمد VIP', style: TextStyle(color: AppColors.emerald, fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                          const Spacer(),
                          Text(
                            '\$$price',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.purple),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        title.toString(),
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                      ),
                      const Divider(height: 20),

                      // Stops timeline
                      const Text('الجدول الزمني ومحطات الجولة:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      if (itinerary.isNotEmpty)
                        ...List.generate(itinerary.length, (idx) {
                          final stop = itinerary[idx];
                          if (stop is! Map) return const SizedBox.shrink();
                          final stopTitle = stop['titleAr'] ??
                              (stop['name'] is Map ? (stop['name']['ar'] ?? stop['name']['en']) : stop['name']?.toString() ?? 'محطة سياحية');
                          final stopDesc = stop['descAr'] ??
                              (stop['description'] is Map ? (stop['description']['ar'] ?? stop['description']['en']) : stop['description']?.toString() ?? '');
                          final stay = stop['stayMinutes'] != null ? '${stop['stayMinutes']} دقيقة' : null;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.purple.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    stop['time'] ?? 'المحطة ${idx + 1}',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.purple),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              stopTitle.toString(),
                                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                          if (stay != null)
                                            Text(
                                              stay,
                                              style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                                            ),
                                        ],
                                      ),
                                      if (stopDesc.toString().isNotEmpty)
                                        Text(
                                          stopDesc.toString(),
                                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                        ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      const SizedBox(height: 14),

                      // Inclusions
                      const Text('المشمولات مع السيارة والسائق:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: (inclusions.isNotEmpty
                            ? inclusions
                            : ['سيارة مرسيدس فيتو VIP خاصة', 'سائق يتحدث العربية', 'شامل الوقود ورسوم الطرق', 'مياه ضيافة وواي فاي'])
                            .map((inc) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0FDF4),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFBBF7D0)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.check_circle, color: Color(0xFF059669), size: 12),
                                const SizedBox(width: 4),
                                Text(inc.toString(), style: const TextStyle(fontSize: 11, color: Color(0xFF14532D))),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 14),

                      // Paid Activities Warning Box
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.warning_amber_rounded, color: Color(0xFFB45309), size: 16),
                                SizedBox(width: 6),
                                Text(
                                  'تنبيه: أنشطة وتذاكر اختيارية مدفوعة للعميل (On-site)',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'لا يشملها سعر السيارة ويقوم العميل بدفعها مباشرة في الموقع:',
                              style: TextStyle(fontSize: 10.5, color: Color(0xFF78350F)),
                            ),
                            const SizedBox(height: 6),
                            if (paidList.isNotEmpty)
                              ...paidList.map((act) {
                                final actName = act is Map
                                    ? (act['nameAr'] ?? (act['name'] is Map ? (act['name']['ar'] ?? act['name']['en']) : act['name']?.toString() ?? ''))
                                    : act.toString();
                                final note = act is Map ? (act['noteAr'] ?? act['note']?.toString() ?? '') : '';
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.arrow_right_rounded, size: 16, color: Color(0xFFB45309)),
                                      Expanded(
                                        child: Text(
                                          '$actName ${note.isNotEmpty ? "— $note" : ""}',
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF92400E)),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              })
                            else ...[
                              const Text('• تذاكر التلفريك والمزارات السياحية الخاصة', style: TextStyle(fontSize: 11, color: Color(0xFF92400E))),
                              const Text('• تأجير دبابات السفاري ATV وركوب الخيل', style: TextStyle(fontSize: 11, color: Color(0xFF92400E))),
                              const Text('• وجبات الطعام والمشروبات الإضافية', style: TextStyle(fontSize: 11, color: Color(0xFF92400E))),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Publish Button
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.purpleDark,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          icon: _publishing
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Icon(Icons.publish_rounded, color: AppColors.gold),
                          label: Text(
                            _publishing ? 'جاري النشر...' : 'اعتماد ونشر الجولة فوراً في الكتالوج والبحث',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          onPressed: _publishing ? null : _publishTour,
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}
