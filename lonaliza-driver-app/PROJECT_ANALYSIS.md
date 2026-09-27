# LioTrip - تحليل المشروع الشامل

## 📌 نظرة عامة
**LioTrip** هو تطبيق Flutter متكامل لحجز الرحلات والفنادق والسيارات والحزم السياحية.

---

## 🏗️ هيكل المشروع

### البنية الأساسية:
```
lib/
├── main.dart                          # نقطة الدخول الرئيسية
├── core/                              # المشاركات والامتدادات
│   └── extensions/
│       └── context_l10n.dart         # امتدادات تعريب التطبيق
├── data/                              # طبقة البيانات
│   └── repositories/
│       └── go_router_navigation_repository.dart
├── domain/                            # طبقة النطاق (البيزنس لوجك)
│   └── repositories/
│       └── navigation_repository.dart
├── presentation/                      # طبقة العرض (UI)
│   ├── providers/                     # Riverpod Providers
│   │   ├── router_providers.dart      # إدارة الـ Routes
│   │   ├── app_locale_provider.dart   # إدارة اللغات
│   │   ├── place_search_providers.dart
│   │   └── dio_provider.dart
│   └── features/                      # الميزات الرئيسية
│       ├── splash/                    # شاشة البداية
│       ├── home/                      # الصفحة الرئيسية
│       ├── flights/                   # حجز الرحلات الجوية
│       ├── hotels/                    # حجز الفنادق
│       ├── cars/                      # تأجير السيارات
│       ├── packages/                  # الحزم السياحية
│       ├── checkout_payment/          # الدفع والفاتورة
│       ├── account/                   # ملف المستخدم
│       │   └── all_bookings/         # جميع الحجوزات
│       ├── auth/                      # المصادقة
│       └── messages/                  # الرسائل
└── l10n/                              # ملفات التعريب (Localization)
```

---

## 🎯 الميزات الرئيسية

### 1️⃣ **نظام الملاحة (Go Router)**
- استخدام `GoRouter` لإدارة المسارات بكفاءة
- معالجة الانتقالات بين الصفحات بتأثيرات سلسة
- دعم المعاملات (extra) لنقل البيانات

### 2️⃣ **حجز الرحلات الجوية** ✈️
```
/flights → /flights/search → /flights/details 
→ /flights/info → /flights/addons → /flights/payment
```

### 3️⃣ **حجز الفنادق** 🏨
```
/hotels → /hotels/search → /hotels/details 
→ /hotels/booking/guest → /hotels/booking/payment
```

### 4️⃣ **تأجير السيارات** 🚗
```
/cars → /cars/search → /cars/detail 
→ /cars/rental → /cars/book → /cars/booking/payment
```

### 5️⃣ **الحزم السياحية** 🎒
```
/packages → /packages/search → /packages/details 
→ /packages/confirm → /packages/booking
```

### 6️⃣ **ملف المستخدم** 👤
```
/account
├── /account/bookings      (جميع الحجوزات)
├── /account/upcoming      (الرحلات القادمة)
├── /account/recently-viewed (المشاهد الأخيرة)
├── /account/my-cards      (بطاقاتي)
├── /account/settings      (الإعدادات)
└── /account/manage        (إدارة الحساب)
```

---

## 📦 المكتبات والتقنيات المستخدمة

### UI & Navigation
- **Flutter** - الإطار الأساسي
- **Go Router** (v17.2.2) - نظام المسارات
- **Shadcn UI** (v0.54.0) - مكتبة المكونات

### State Management
- **Flutter Riverpod** (v3.3.1) - إدارة الحالة والـ Providers

### Styling & Design
- **Google Fonts** (v6.2.1) - الخطوط
- **Material Design 3** - نظام التصميم

### Data & Network
- **Dio** (v5.9.0) - مكتبة HTTP Requests
- **Shared Preferences** (v2.5.5) - التخزين المحلي

### Localization
- **Intl** (v0.20.2) - تعريب التطبيق
- **Flutter Localizations** - دعم اللغات

---

## 🔄 تدفق البيانات

```
main.dart
    ↓
MyApp (ConsumerWidget)
    ↓
Riverpod (ProviderScope)
    ↓
GoRouter (Navigation)
    ↓
Features (Presentation Layer)
    ↓
Providers (State Management)
    ↓
Repositories (Data Layer)
    ↓
External APIs (Dio)
```

---

## 💡 نمط العمارة

يتبع المشروع **Clean Architecture**:

1. **Presentation Layer** - الواجهة الرسومية والـ Widgets
2. **Domain Layer** - منطق التطبيق والعقود
3. **Data Layer** - الوصول للبيانات والـ APIs

---

## 🎨 ميزات التصميم

- **Dark & Light Theme** - ثيم مظلم وفاتح
- **Responsive Design** - تصميم متجاوب
- **Custom Transitions** - انتقالات مخصصة بين الصفحات
- **Material Design 3** - أحدث معايير التصميم

---

## 📍 المسارات الرئيسية

| المسار | الصفحة | الوصف |
|------|--------|-------|
| `/splash` | SplashPage | شاشة البداية |
| `/` | HomePage | الصفحة الرئيسية |
| `/flights` | FlightsPage | البحث عن الرحلات |
| `/hotels` | HotelsPage | البحث عن الفنادق |
| `/cars` | CarRentalsPage | تأجير السيارات |
| `/packages` | PackagePage | الحزم السياحية |
| `/account` | AccountPage | ملف المستخدم |
| `/auth` | AuthPage | تسجيل الدخول |

---

## ⚙️ الإعدادات الأساسية

- **SDK Version**: Dart 3.11.5+
- **Material Design 3**: مفعل
- **Localization**: مفعل (عبر Flutter Localizations)
- **Platform**: iOS, Android, Web, macOS, Windows

---

## 📝 ملاحظات التطوير

- يستخدم `Riverpod` للحالة المركزية
- جميع الصفحات تستخدم `ConsumerWidget` للوصول للـ Providers
- التوجيه مركزي عبر `router_providers.dart`
- التعريب معرّف في `l10n.yaml`

---

## 🚀 الخطوات التالية المقترحة

1. إضافة معالجة الأخطاء الشاملة
2. تحسين الأداء والتخزين المؤقت
3. إضافة اختبارات الوحدة والتكامل
4. تحسين تجربة المستخدم (UX)
5. تطبيق نظام الإشعارات

---

**آخر تحديث**: 2026-05-18
