"use client";
export default function SupervisorCore({ level = 0, listening = false }: { level?: number; listening?: boolean }) {
  const amplitude = Math.max(0, Math.min(1, level));
  return <g aria-label={listening ? "المشرف: قياس صوت الميكروفون" : "نواة المشرف — غير متصل بالمحادثة"}>
    <circle r="106" className="ns-core-halo" />
    <circle r="99" className="ns-ring ns-ion" strokeWidth="1" />
    <circle r="91" className="ns-ring ns-amber ns-orbit" strokeWidth="3" strokeDasharray="110 16 24 9" />
    <circle r="82" className="ns-ring ns-ion" strokeWidth="5" strokeDasharray="260 12 60 18" />
    <circle r="72" className="ns-ring ns-amber" strokeWidth="2" />
    <circle r="62" className="ns-ring ns-ion" strokeWidth="1" />
    <circle r="52" className="ns-core-face" />
    {Array.from({ length: 29 }, (_, i) => {
      const envelope = Math.sin(i / 28 * Math.PI);
      const height = 2 + amplitude * envelope * (8 + (i * 17 % 29));
      return <line key={i} x1={-42+i*3} x2={-42+i*3} y1={-height} y2={height} className="ns-amber ns-wave" strokeWidth="1.8" />;
    })}
    <text y="128" textAnchor="middle" className="ns-core-label">الوكيل المشرف</text>
    <text y="150" textAnchor="middle" className="ns-source-label">{listening ? "إشارة ميكروفون فعلية" : "المحادثة: لم تُربط بعد"}</text>
  </g>;
}
