import React from 'react';

export default function VipConciergeSection() {
  return (
    <section className="lonaliza-vip-concierge py-20 px-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 100%)' }}>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block bg-purple-900/55 text-purple-200 px-5 py-1.5 rounded-full text-sm font-semibold mb-4 border border-purple-500/30">
            خدمة النخبة والخصوصية
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white tracking-tight">
            برامج الكونسيرج السياحي الخاص للعائلات
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            نصمم خصيصاً لكل عائلة خليجية جدولاً فريداً يجمع بين الفخامة والخصوصية التامة في أجمل وجهات تركيا.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-xl font-bold mb-6 text-white shadow-lg shadow-purple-900/40">
              01
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">أسطول سيارات VIP مع سائق خاص</h3>
            <p className="text-slate-400 text-base leading-relaxed mb-6">
              مرسيدس فيتو الحديثة المجهزة بالكامل لراحة عائلتكم، مع سائقين أمناء ذوي خبرة واسعة يتحدثون العربية.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-md">
              احجز سيارتك الخاصة
            </a>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-xl font-bold mb-6 text-white shadow-lg shadow-purple-900/40">
              02
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">إقامات فلل وأجنحة ملكية</h3>
            <p className="text-slate-400 text-base leading-relaxed mb-6">
              اختر من بين أفخم الفنادق المطلة على البوسفور أو الفلل المستقلة ذات المسابح الخاصة لضمان الخصوصية المطلقة.
            </p>
            <a href="/hotels" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-md">
              استعرض الإقامات
            </a>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-xl font-bold mb-6 text-white shadow-lg shadow-purple-900/40">
              03
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">مخطط رحلات تفصيلي حسب الطلب</h3>
            <p className="text-slate-400 text-base leading-relaxed mb-6">
              مستشار سياحي شخصي يرافقكم على مدار الساعة من لحظة الاستقبال في المطار وحتى التوديع بكل حفاوة.
            </p>
            <a href="/ai-chat" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-md">
              تواصل مع المستشار
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}