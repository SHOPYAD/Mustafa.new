# دليل تشغيل ورفع نسخة عميل LONALIZA على سيرفر Contabo / aaPanel

مرحباً بك! هذه النسخة المستقلة الكاملة لمنظومة **LONALIZA Tourism Platform** جاهزة للرفع والتشغيل على سيرفر شركتك في دقائق معدودة.

---

## 🛠️ متطلبات السيرفر:
- نظام تشغيل: **Ubuntu 22.04 LTS** أو **Debian 12**
- لوحة تحكم: **aaPanel** (موصى بها لسهولة إدارة الـ SSL و Nginx) أو Nginx مباشر
- بيئة التشغيل: **Node.js 20+** و **PM2**

---

## 🚀 خطوات التثبيت السريعة (3 خطوات فقط):

### الخطوة 1: رفع المجلد إلى السيرفر
ارفع مجلد المشروع إلى المسار:
`/www/wwwroot/yourdomain.com`

### الخطوة 2: تشغيل سكربت الإعداد التلقائي
عبر الـ Terminal أو SSH، نفذ الأمر التالي:
```bash
cd /www/wwwroot/yourdomain.com
bash deploy/setup-server.sh
```
يقوم هذا السكربت تلقائياً بتثبيت التبعيات، بناء المشروع (`npm run build`)، وتشغيل الموقع وقاعدة البيانات عبر **PM2**.

### الخطوة 3: تطبيق إعدادات Nginx وشهادة SSL
1. من لوحة **aaPanel**: أضف موقعين:
   - الموقع الرئيسي: `yourdomain.com` و `www.yourdomain.com`
   - موقع قاعدة البيانات: `pocketbase.yourdomain.com`
2. أصدر شهادة **Let's Encrypt SSL** مجاناً لكل موقع بضغطة زر.
3. انسخ إعدادات الـ Reverse Proxy من المجلد:
   - `deploy/nginx/site.conf` → إعدادات النطاق الرئيسي
   - `deploy/nginx/pocketbase.conf` → إعدادات ساب دومين PocketBase

---

## 🔑 بيانات الدخول الافتراضية للوحة التحكم:
- رابط لوحة الأدمن: `https://yourdomain.com/admin`
- المستخدم الافتراضي: `admin`
- كلمة المرور: مسجلة داخل ملف `.env.local`

---

## 📌 إدارة الخدمات عبر PM2:
- عرض حالة الخدمات: `pm2 status`
- متابعة السجلات الحية: `pm2 logs`
- إعادة التشغيل: `bash deploy/restart.sh`
